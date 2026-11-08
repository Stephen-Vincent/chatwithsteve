import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { Webhook } from 'npm:standardwebhooks@1.0.0'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { SignupEmail } from '../_shared/email-templates/signup.tsx'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'
import { MagicLinkEmail } from '../_shared/email-templates/magic-link.tsx'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'
import { EmailChangeEmail } from '../_shared/email-templates/email-change.tsx'
import { ReauthenticationEmail } from '../_shared/email-templates/reauthentication.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'Confirm your email',
  invite: "You've been invited",
  magiclink: 'Your login link',
  recovery: 'Reset your password',
  email_change: 'Confirm your new email',
  reauthentication: 'Your verification code',
}

// Template mapping
const EMAIL_TEMPLATES: Record<string, React.ComponentType<any>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
}

// Configuration
const SITE_NAME = 'Chat with Steve'
const SITE_URL = 'https://chatwithsteve.co.uk'
const FROM_ADDRESS = `${SITE_NAME} <noreply@chatwithsteve.co.uk>`

function jsonError(status: number, message: string) {
  // Supabase Auth expects errors from a send-email hook in this shape
  return new Response(JSON.stringify({ error: { http_code: status, message } }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonError(405, 'Method not allowed')
  }

  const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!hookSecret || !supabaseUrl || !serviceKey) {
    console.error('Missing SEND_EMAIL_HOOK_SECRET, SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return jsonError(500, 'Server configuration error')
  }

  // Verify the request really came from Supabase Auth (Standard Webhooks signature)
  const rawBody = await req.text()
  let payload: any
  try {
    const wh = new Webhook(hookSecret.replace('v1,whsec_', ''))
    payload = wh.verify(rawBody, Object.fromEntries(req.headers))
  } catch (error) {
    console.error('Invalid webhook signature', error)
    return jsonError(401, 'Invalid signature')
  }

  const { user, email_data } = payload
  const emailType: string = email_data.email_action_type
  const EmailTemplate = EMAIL_TEMPLATES[emailType]
  if (!EmailTemplate) {
    console.error('Unknown email type', { emailType })
    return jsonError(400, `Unknown email type: ${emailType}`)
  }

  // For an email change the confirmation goes to the new address
  const recipient: string = emailType === 'email_change' && user.new_email ? user.new_email : user.email

  const redirectTo = email_data.redirect_to || email_data.site_url || SITE_URL
  const confirmationUrl =
    `${supabaseUrl}/auth/v1/verify?token=${email_data.token_hash}` +
    `&type=${emailType}&redirect_to=${encodeURIComponent(redirectTo)}`

  const templateProps = {
    siteName: SITE_NAME,
    siteUrl: SITE_URL,
    recipient,
    confirmationUrl,
    token: email_data.token,
    email: user.email,
    newEmail: user.new_email,
  }

  const html = await renderAsync(React.createElement(EmailTemplate, templateProps))
  const text = await renderAsync(React.createElement(EmailTemplate, templateProps), { plainText: true })

  // Enqueue for the dispatcher (process-email-queue), which sends via Resend.
  const supabase = createClient(supabaseUrl, serviceKey)
  const messageId = crypto.randomUUID()

  // Log pending BEFORE enqueue so there is a record even if enqueue fails
  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: emailType,
    recipient_email: recipient,
    status: 'pending',
  })

  const { error: enqueueError } = await supabase.rpc('enqueue_email', {
    queue_name: 'auth_emails',
    payload: {
      run_id: messageId,
      message_id: messageId,
      to: recipient,
      from: FROM_ADDRESS,
      subject: EMAIL_SUBJECTS[emailType] || 'Notification',
      html,
      text,
      purpose: 'transactional',
      label: emailType,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueError) {
    console.error('Failed to enqueue auth email', { error: enqueueError, emailType })
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: emailType,
      recipient_email: recipient,
      status: 'failed',
      error_message: 'Failed to enqueue email',
    })
    return jsonError(500, 'Failed to enqueue email')
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

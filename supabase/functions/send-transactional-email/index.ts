import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Internal use only: callers must present the service role key
    if (req.headers.get('Authorization') !== `Bearer ${supabaseServiceKey}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { to, subject, html, text, label } = await req.json()

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check suppression list
    const { data: suppressed } = await supabase
      .from('suppressed_emails')
      .select('id')
      .eq('email', to)
      .maybeSingle()

    if (suppressed) {
      return new Response(
        JSON.stringify({ skipped: true, reason: 'email_suppressed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const messageId = crypto.randomUUID()

    const payload = {
      message_id: messageId,
      run_id: messageId,
      to,
      from: `Chat with Steve <noreply@chatwithsteve.co.uk>`,
      sender_domain: 'chatwithsteve.co.uk',
      subject,
      html,
      text: text || '',
      purpose: 'transactional',
      label: label || 'transactional',
      queued_at: new Date().toISOString(),
    }

    const { error: enqueueError } = await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload,
    })

    if (enqueueError) {
      throw new Error('Failed to enqueue email: ' + enqueueError.message)
    }

    return new Response(
      JSON.stringify({ success: true, message_id: messageId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('send-transactional-email error:', msg)
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

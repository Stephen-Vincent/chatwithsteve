import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@18.5.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(time: string): string {
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const h12 = hour % 12 || 12
  return `${h12}:${m}${ampm}`
}

function buildGoogleCalendarUrl(date: string, time: string, customerName: string): string {
  const [h, m] = time.split(':').map(Number)
  const start = date.replace(/-/g, '') + 'T' + String(h).padStart(2, '0') + String(m || 0).padStart(2, '0') + '00'
  const end = date.replace(/-/g, '') + 'T' + String(h + 1).padStart(2, '0') + String(m || 0).padStart(2, '0') + '00'
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Chat with Steve - ${customerName}`,
    dates: `${start}/${end}`,
    details: `Video call booking with ${customerName}`,
    location: 'Video Call',
    ctz: 'Europe/London',
  })
  return `https://calendar.google.com/calendar/event?${params.toString()}`
}

function buildOutlookCalendarUrl(date: string, time: string, customerName: string): string {
  const startdt = `${date}T${time}:00`
  const [h, m] = time.split(':').map(Number)
  const enddt = `${date}T${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: `Chat with Steve - ${customerName}`,
    startdt,
    enddt,
    body: `Video call booking with ${customerName}`,
    location: 'Video Call',
  })
  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`
}

function buildIcsContent(date: string, time: string, customerName: string): string {
  const start = date.replace(/-/g, '') + 'T' + time.replace(/:/g, '') + '00'
  const [h, m] = time.split(':').map(Number)
  const end = date.replace(/-/g, '') + 'T' + String(h + 1).padStart(2, '0') + String(m).padStart(2, '0') + '00'
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chat with Steve//Booking//EN',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Chat with Steve - ${customerName}`,
    `DESCRIPTION:Video call booking with ${customerName}`,
    'LOCATION:Video Call',
    `UID:${crypto.randomUUID()}@chatwithsteve.co.uk`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function buildCustomerEmailHtml(
  customerName: string,
  sessions: { date: string; time: string }[],
  amountPaid: number,
  message: string
): string {
  const sessionRows = sessions
    .map(
      (s) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid hsl(214, 20%, 88%); color: hsl(222, 47%, 11%); font-size: 15px;">${formatDate(s.date)}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid hsl(214, 20%, 88%); color: hsl(222, 47%, 11%); font-size: 15px;">${formatTime(s.time)}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid hsl(214, 20%, 88%);">
          <a href="${buildGoogleCalendarUrl(s.date, s.time, customerName)}" style="color: hsl(217, 91%, 60%); text-decoration: none; font-size: 13px;">Google</a>
          &nbsp;|&nbsp;
          <a href="${buildOutlookCalendarUrl(s.date, s.time, customerName)}" style="color: hsl(217, 91%, 60%); text-decoration: none; font-size: 13px;">Outlook</a>
        </td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Inter', Arial, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://chatwithsteve.co.uk" style="display: inline-block;"><img src="https://chatwithsteve.co.uk/chatwithsteve-logo-bw.png" alt="ChatWithSteve" width="240" style="width: 240px; height: auto;" /></a>
    </div>
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; color: hsl(222, 47%, 11%); margin: 0 0 8px;">Booking Confirmed! 🎉</h1>
      <p style="color: hsl(215, 16%, 47%); font-size: 15px; margin: 0;">Thanks for booking a chat, ${customerName}.</p>
    </div>

    <div style="background-color: hsl(210, 40%, 96%); border-radius: 10px; padding: 24px; margin-bottom: 24px;">
      <h2 style="font-size: 16px; color: hsl(222, 47%, 11%); margin: 0 0 16px; font-weight: 600;">Your Session${sessions.length > 1 ? 's' : ''}</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 8px 16px; color: hsl(215, 16%, 47%); font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500;">Date</th>
            <th style="text-align: left; padding: 8px 16px; color: hsl(215, 16%, 47%); font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500;">Time</th>
            <th style="text-align: left; padding: 8px 16px; color: hsl(215, 16%, 47%); font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500;">Calendar</th>
          </tr>
        </thead>
        <tbody>${sessionRows}</tbody>
      </table>
    </div>

    <div style="background-color: hsl(210, 40%, 96%); border-radius: 10px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; color: hsl(215, 16%, 47%);">Amount paid: <strong style="color: hsl(222, 47%, 11%);">£${(amountPaid / 100).toFixed(2)}</strong></p>
      ${message ? `<p style="margin: 12px 0 0; font-size: 14px; color: hsl(215, 16%, 47%);">Your message: <em>"${message}"</em></p>` : ''}
    </div>

    <div style="text-align: center; margin-bottom: 32px;">
      <p style="color: hsl(215, 16%, 47%); font-size: 14px;">I'll be in touch with the video call link before your session. Looking forward to our chat!</p>
    </div>

    <div style="text-align: center; border-top: 1px solid hsl(214, 20%, 88%); padding-top: 24px;">
      <p style="color: hsl(215, 16%, 47%); font-size: 12px; margin: 0;">Chat with Steve · <a href="https://chatwithsteve.co.uk" style="color: hsl(38, 92%, 50%); text-decoration: none;">chatwithsteve.co.uk</a></p>
    </div>
  </div>
</body>
</html>`
}

function buildAdminEmailHtml(
  customerName: string,
  customerEmail: string,
  sessions: { date: string; time: string }[],
  amountPaid: number,
  message: string
): string {
  const sessionRows = sessions
    .map(
      (s) => `
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid hsl(214, 20%, 88%); font-size: 14px;">${formatDate(s.date)}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid hsl(214, 20%, 88%); font-size: 14px;">${formatTime(s.time)}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid hsl(214, 20%, 88%);">
          <a href="${buildGoogleCalendarUrl(s.date, s.time, customerName)}" style="color: hsl(217, 91%, 60%); text-decoration: none; font-size: 13px;">Add to Calendar</a>
        </td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Inter', Arial, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://chatwithsteve.co.uk" style="display: inline-block;"><img src="https://chatwithsteve.co.uk/chatwithsteve-logo-bw.png" alt="ChatWithSteve" width="240" style="width: 240px; height: auto;" /></a>
    </div>
    <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; color: hsl(222, 47%, 11%); margin: 0 0 24px;">New Booking 📅</h1>

    <div style="background-color: hsl(210, 40%, 96%); border-radius: 10px; padding: 20px; margin-bottom: 20px;">
      <p style="margin: 0 0 8px; font-size: 14px; color: hsl(215, 16%, 47%);">Customer: <strong style="color: hsl(222, 47%, 11%);">${customerName}</strong></p>
      <p style="margin: 0 0 8px; font-size: 14px; color: hsl(215, 16%, 47%);">Email: <a href="mailto:${customerEmail}" style="color: hsl(217, 91%, 60%); text-decoration: none;">${customerEmail}</a></p>
      <p style="margin: 0; font-size: 14px; color: hsl(215, 16%, 47%);">Paid: <strong style="color: hsl(222, 47%, 11%);">£${(amountPaid / 100).toFixed(2)}</strong></p>
      ${message ? `<p style="margin: 12px 0 0; font-size: 14px; color: hsl(215, 16%, 47%);">Message: <em>"${message}"</em></p>` : ''}
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 8px 14px; color: hsl(215, 16%, 47%); font-size: 12px; text-transform: uppercase;">Date</th>
          <th style="text-align: left; padding: 8px 14px; color: hsl(215, 16%, 47%); font-size: 12px; text-transform: uppercase;">Time</th>
          <th style="text-align: left; padding: 8px 14px; color: hsl(215, 16%, 47%); font-size: 12px; text-transform: uppercase;">Calendar</th>
        </tr>
      </thead>
      <tbody>${sessionRows}</tbody>
    </table>
  </div>
</body>
</html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' })

    const { session_id } = await req.json()
    if (!session_id) throw new Error('session_id is required')

    const session = await stripe.checkout.sessions.retrieve(session_id)
    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed')
    }

    const metadata = session.metadata || {}
    const customerName = metadata.customer_name || 'Unknown'
    const message = metadata.message || ''
    const sessionsData: { date: string; time: string }[] = metadata.sessions
      ? JSON.parse(metadata.sessions)
      : []
    const customerEmail =
      session.customer_email || session.customer_details?.email || ''
    const amountPaid = session.amount_total || 5000

    // Check if already processed
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('stripe_session_id', session.id)
      .limit(1)

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Already processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert bookings
    const bookingRows = sessionsData.map((s) => ({
      customer_name: customerName,
      customer_email: customerEmail,
      session_date: s.date,
      session_time: s.time,
      status: 'confirmed',
      stripe_session_id: session.id,
      amount_paid: Math.round(amountPaid / sessionsData.length),
      message,
    }))

    const { error: insertError } = await supabase
      .from('bookings')
      .insert(bookingRows)
    if (insertError)
      throw new Error('Failed to save bookings: ' + insertError.message)

    // Send confirmation email to customer
    if (customerEmail) {
      const customerHtml = buildCustomerEmailHtml(
        customerName,
        sessionsData,
        amountPaid,
        message
      )
      const custMsgId = crypto.randomUUID()
      const customerPayload = {
        message_id: custMsgId,
        run_id: custMsgId,
        to: customerEmail,
        from: 'Chat with Steve <noreply@chatwithsteve.co.uk>',
        sender_domain: 'chatwithsteve.co.uk',
        subject: `Booking Confirmed – ${formatDate(sessionsData[0]?.date || '')}`,
        html: customerHtml,
        text: `Hi ${customerName}, your booking is confirmed for ${sessionsData.map((s) => `${formatDate(s.date)} at ${formatTime(s.time)}`).join(', ')}. Amount paid: £${(amountPaid / 100).toFixed(2)}.`,
        purpose: 'transactional',
        label: 'booking_confirmation',
        queued_at: new Date().toISOString(),
      }

      await supabase.rpc('enqueue_email', {
        queue_name: 'transactional_emails',
        payload: customerPayload,
      })
    }

    // Send notification email to admin
    const adminHtml = buildAdminEmailHtml(
      customerName,
      customerEmail,
      sessionsData,
      amountPaid,
      message
    )
    const adminMsgId = crypto.randomUUID()
    const adminPayload = {
      message_id: adminMsgId,
      run_id: adminMsgId,
      to: 'info@chatwithsteve.co.uk',
      from: 'Chat with Steve <noreply@chatwithsteve.co.uk>',
      sender_domain: 'chatwithsteve.co.uk',
      subject: `New Booking: ${customerName} – ${formatDate(sessionsData[0]?.date || '')}`,
      html: adminHtml,
      text: `New booking from ${customerName} (${customerEmail}) for ${sessionsData.map((s) => `${formatDate(s.date)} at ${formatTime(s.time)}`).join(', ')}. Paid: £${(amountPaid / 100).toFixed(2)}.`,
      purpose: 'transactional',
      label: 'booking_admin_notification',
      queued_at: new Date().toISOString(),
    }

    await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: adminPayload,
    })

    return new Response(
      JSON.stringify({ success: true, bookings: bookingRows.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error)
    console.error('Error confirming booking:', errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

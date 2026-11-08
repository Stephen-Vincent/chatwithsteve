import { createClient } from 'npm:@supabase/supabase-js@2'

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
  return `${h12}:${m || '00'}${ampm}`
}

function buildGoogleCalendarUrl(date: string, time: string, customerName: string): string {
  const [h, m] = time.split(':').map(Number)
  const start = date.replace(/-/g, '') + 'T' + String(h).padStart(2, '0') + String(m || 0).padStart(2, '0') + '00'
  const end = date.replace(/-/g, '') + 'T' + String(h + 1).padStart(2, '0') + String(m || 0).padStart(2, '0') + '00'
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Chat with Steve - ${customerName}`,
    dates: `${start}/${end}`,
    details: `Rescheduled video call with ${customerName}`,
    location: 'Video Call',
    ctz: 'Europe/London',
  })
  return `https://calendar.google.com/calendar/event?${params.toString()}`
}

function buildCustomerRescheduleHtml(
  customerName: string,
  oldDate: string,
  oldTime: string,
  newDate: string,
  newTime: string
): string {
  const calUrl = buildGoogleCalendarUrl(newDate, newTime, customerName)
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Inter', Arial, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://chatwithsteve.co.uk" style="display: inline-block;"><img src="https://chatwithsteve.co.uk/chatwithsteve-logo-bw.png" alt="ChatWithSteve" width="240" style="width: 240px; height: auto;" /></a>
    </div>
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; color: hsl(222, 47%, 11%); margin: 0 0 8px;">Session Rescheduled 📅</h1>
      <p style="color: hsl(215, 16%, 47%); font-size: 15px; margin: 0;">Hi ${customerName}, your session has been moved to a new time.</p>
    </div>

    <div style="background-color: hsl(210, 40%, 96%); border-radius: 10px; padding: 24px; margin-bottom: 24px;">
      <p style="margin: 0 0 12px; font-size: 13px; color: hsl(215, 16%, 47%); text-decoration: line-through;">Previously: ${formatDate(oldDate)} at ${formatTime(oldTime)}</p>
      <h2 style="font-size: 16px; color: hsl(222, 47%, 11%); margin: 0 0 4px; font-weight: 600;">New Date & Time</h2>
      <p style="margin: 0; font-size: 16px; color: hsl(222, 47%, 11%); font-weight: 500;">${formatDate(newDate)} at ${formatTime(newTime)}</p>
    </div>

    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${calUrl}" style="display: inline-block; background-color: hsl(222, 47%, 11%); color: hsl(210, 40%, 98%); font-size: 14px; border-radius: 10px; padding: 12px 24px; text-decoration: none; font-weight: 600;">Add to Calendar</a>
    </div>

    <div style="text-align: center; margin-bottom: 32px;">
      <p style="color: hsl(215, 16%, 47%); font-size: 14px;">If you have any questions, feel free to reply to this email. Looking forward to our chat!</p>
    </div>

    <div style="text-align: center; border-top: 1px solid hsl(214, 20%, 88%); padding-top: 24px;">
      <p style="color: hsl(215, 16%, 47%); font-size: 12px; margin: 0;">Chat with Steve · <a href="https://chatwithsteve.co.uk" style="color: hsl(38, 92%, 50%); text-decoration: none;">chatwithsteve.co.uk</a></p>
    </div>
  </div>
</body>
</html>`
}

function buildAdminRescheduleHtml(
  customerName: string,
  customerEmail: string,
  oldDate: string,
  oldTime: string,
  newDate: string,
  newTime: string
): string {
  const calUrl = buildGoogleCalendarUrl(newDate, newTime, customerName)
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Inter', Arial, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://chatwithsteve.co.uk" style="display: inline-block;"><img src="https://chatwithsteve.co.uk/chatwithsteve-logo-bw.png" alt="ChatWithSteve" width="240" style="width: 240px; height: auto;" /></a>
    </div>
    <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; color: hsl(222, 47%, 11%); margin: 0 0 24px;">Booking Rescheduled 🔄</h1>

    <div style="background-color: hsl(210, 40%, 96%); border-radius: 10px; padding: 20px; margin-bottom: 20px;">
      <p style="margin: 0 0 8px; font-size: 14px; color: hsl(215, 16%, 47%);">Customer: <strong style="color: hsl(222, 47%, 11%);">${customerName}</strong></p>
      <p style="margin: 0 0 12px; font-size: 14px; color: hsl(215, 16%, 47%);">Email: <a href="mailto:${customerEmail}" style="color: hsl(217, 91%, 60%); text-decoration: none;">${customerEmail}</a></p>
      <p style="margin: 0 0 8px; font-size: 13px; color: hsl(215, 16%, 47%); text-decoration: line-through;">Was: ${formatDate(oldDate)} at ${formatTime(oldTime)}</p>
      <p style="margin: 0; font-size: 14px; color: hsl(222, 47%, 11%); font-weight: 600;">Now: ${formatDate(newDate)} at ${formatTime(newTime)}</p>
    </div>

    <div style="text-align: center; margin-bottom: 20px;">
      <a href="${calUrl}" style="display: inline-block; background-color: hsl(222, 47%, 11%); color: hsl(210, 40%, 98%); font-size: 14px; border-radius: 10px; padding: 12px 24px; text-decoration: none; font-weight: 600;">Add to Calendar</a>
    </div>
  </div>
</body>
</html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the caller is a signed-in admin
    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Unauthorized: admin only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { booking_id, new_date, new_time } = await req.json()
    if (!booking_id || !new_date || !new_time) {
      throw new Error('booking_id, new_date, and new_time are required')
    }

    // Fetch current booking
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single()

    if (fetchErr || !booking) throw new Error('Booking not found')

    const oldDate = booking.session_date
    const oldTime = booking.session_time

    // Update booking (keep status confirmed)
    const { error: updateErr } = await supabase
      .from('bookings')
      .update({ session_date: new_date, session_time: new_time })
      .eq('id', booking_id)

    if (updateErr) throw new Error('Failed to update booking: ' + updateErr.message)

    // Send email to customer
    if (booking.customer_email) {
      const custHtml = buildCustomerRescheduleHtml(
        booking.customer_name,
        oldDate, oldTime,
        new_date, new_time
      )
      const custMsgId = `reschedule-cust-${booking_id}-${Date.now()}`
      await supabase.rpc('enqueue_email', {
        queue_name: 'transactional_emails',
        payload: {
          message_id: custMsgId,
          run_id: custMsgId,
          to: booking.customer_email,
          from: 'Chat with Steve <noreply@chatwithsteve.co.uk>',
          sender_domain: 'chatwithsteve.co.uk',
          subject: `Session Rescheduled – ${formatDate(new_date)} at ${formatTime(new_time)}`,
          html: custHtml,
          text: `Hi ${booking.customer_name}, your session has been rescheduled from ${formatDate(oldDate)} at ${formatTime(oldTime)} to ${formatDate(new_date)} at ${formatTime(new_time)}.`,
          purpose: 'transactional',
          label: 'booking_reschedule',
          queued_at: new Date().toISOString(),
        },
      })
    }

    // Send email to admin
    const adminHtml = buildAdminRescheduleHtml(
      booking.customer_name,
      booking.customer_email,
      oldDate, oldTime,
      new_date, new_time
    )
    const adminMsgId = `reschedule-admin-${booking_id}-${Date.now()}`
    await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id: adminMsgId,
        run_id: adminMsgId,
        to: 'info@chatwithsteve.co.uk',
        from: 'Chat with Steve <noreply@chatwithsteve.co.uk>',
        sender_domain: 'chatwithsteve.co.uk',
        subject: `Rescheduled: ${booking.customer_name} – ${formatDate(new_date)}`,
        html: adminHtml,
        text: `Booking for ${booking.customer_name} (${booking.customer_email}) rescheduled from ${formatDate(oldDate)} to ${formatDate(new_date)} at ${formatTime(new_time)}.`,
        purpose: 'transactional',
        label: 'booking_reschedule_admin',
        queued_at: new Date().toISOString(),
      },
    })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('reschedule-booking error:', msg)
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

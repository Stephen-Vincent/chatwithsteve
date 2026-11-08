import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@18.5.0'

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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set')

    // Verify the caller is an admin
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const anonClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
    if (authError || !user) throw new Error('Not authenticated')

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

    // Check admin role
    const { data: isAdmin } = await serviceClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    })
    if (!isAdmin) throw new Error('Unauthorized: admin only')

    const { booking_id } = await req.json()
    if (!booking_id) throw new Error('booking_id is required')

    // Fetch the booking
    const { data: booking, error: fetchError } = await serviceClient
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single()
    if (fetchError || !booking) throw new Error('Booking not found')

    // Attempt Stripe refund if there's a stripe session
    let refundId: string | null = null
    let refundNote: string | null = null
    if (booking.stripe_session_id) {
      const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' })
      try {
        const session = await stripe.checkout.sessions.retrieve(booking.stripe_session_id)
        if (session.payment_intent) {
          const refund = await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
          })
          refundId = refund.id
        }
      } catch (stripeErr: any) {
        const msg = stripeErr?.message || String(stripeErr)
        // Allow deletion even if refund fails for known reasons
        if (msg.includes('already been refunded')) {
          refundNote = 'Already refunded'
        } else if (msg.includes('No such checkout.session')) {
          refundNote = 'Stripe session not found (test mode?)'
        } else {
          throw stripeErr
        }
      }
    }

    // Delete the booking (this frees the slot since get_booked_slots queries confirmed bookings)
    const { error: deleteError } = await serviceClient
      .from('bookings')
      .delete()
      .eq('id', booking_id)
    if (deleteError) throw new Error('Failed to delete booking: ' + deleteError.message)

    return new Response(
      JSON.stringify({ success: true, refund_id: refundId, note: refundNote }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('cancel-booking error:', msg)
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

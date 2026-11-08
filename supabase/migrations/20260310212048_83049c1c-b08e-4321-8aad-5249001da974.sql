DROP POLICY "Service can insert bookings" ON public.bookings;

-- No public insert policy needed - edge function uses service role key which bypasses RLS
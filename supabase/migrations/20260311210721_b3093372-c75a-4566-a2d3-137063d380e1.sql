CREATE OR REPLACE FUNCTION public.get_booked_slots()
RETURNS TABLE(session_date date, session_time text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT b.session_date, b.session_time
  FROM public.bookings b
  WHERE b.status = 'confirmed'
    AND b.session_date >= CURRENT_DATE
$$;
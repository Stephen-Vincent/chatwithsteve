CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  session_date DATE NOT NULL,
  session_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  stripe_session_id TEXT,
  amount_paid INTEGER NOT NULL DEFAULT 5000,
  message TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bookings" ON public.bookings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookings" ON public.bookings
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Service role inserts (from edge function) bypass RLS, so no insert policy needed for public
-- But allow insert for service role via edge function
CREATE POLICY "Service can insert bookings" ON public.bookings
  FOR INSERT
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
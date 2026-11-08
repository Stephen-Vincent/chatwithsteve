CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public newsletter signup)
CREATE POLICY "Anyone can subscribe" ON public.subscribers
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Only admins can view subscribers
CREATE POLICY "Admins can view subscribers" ON public.subscribers
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete subscribers
CREATE POLICY "Admins can delete subscribers" ON public.subscribers
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
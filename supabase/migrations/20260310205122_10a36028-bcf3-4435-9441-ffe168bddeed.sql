ALTER TABLE public.comments ADD COLUMN approved boolean NOT NULL DEFAULT false;

-- Allow public to only see approved comments
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
CREATE POLICY "Anyone can view approved comments"
  ON public.comments FOR SELECT
  TO public
  USING (approved = true);

-- Admins can see all comments
CREATE POLICY "Admins can view all comments"
  ON public.comments FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update comments (to approve them)
CREATE POLICY "Admins can update comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: users can read their own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Weekly availability (recurring schedule)
CREATE TABLE public.weekly_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (day_of_week, start_time)
);

ALTER TABLE public.weekly_availability ENABLE ROW LEVEL SECURITY;

-- Public can read active availability
CREATE POLICY "Anyone can view weekly availability"
  ON public.weekly_availability FOR SELECT
  USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert weekly availability"
  ON public.weekly_availability FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update weekly availability"
  ON public.weekly_availability FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete weekly availability"
  ON public.weekly_availability FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Date overrides (specific dates: block or add extra slots)
CREATE TABLE public.date_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  override_date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  time_slots JSONB, -- array of {start_time, end_time} or null to block whole day
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (override_date)
);

ALTER TABLE public.date_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view date overrides"
  ON public.date_overrides FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert date overrides"
  ON public.date_overrides FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update date overrides"
  ON public.date_overrides FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete date overrides"
  ON public.date_overrides FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp update function & triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_weekly_availability_updated_at
  BEFORE UPDATE ON public.weekly_availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_date_overrides_updated_at
  BEFORE UPDATE ON public.date_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

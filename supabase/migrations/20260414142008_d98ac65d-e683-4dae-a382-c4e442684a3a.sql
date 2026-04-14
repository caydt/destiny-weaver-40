
-- Create packages table first (referenced by others)
CREATE TABLE public.packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- Create consultations table
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('M','F')),
  calendar_type TEXT CHECK (calendar_type IN ('solar','lunar')),
  is_leap_month BOOLEAN DEFAULT false,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_time_unknown BOOLEAN DEFAULT false,
  question TEXT NOT NULL,
  package_id UUID REFERENCES public.packages(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','done'))
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_visible BOOLEAN DEFAULT true
);

-- Create site_settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_headline TEXT,
  hero_subtext TEXT,
  upsell_text TEXT
);

-- Create payment_links table
CREATE TABLE public.payment_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id),
  url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

-- SELECT policies (public)
CREATE POLICY "Anyone can view packages" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Anyone can view consultations" ON public.consultations FOR SELECT USING (true);
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can view site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can view payment_links" ON public.payment_links FOR SELECT USING (true);

-- INSERT policies
CREATE POLICY "Anyone can create consultations" ON public.consultations FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can insert packages" ON public.packages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can insert site_settings" ON public.site_settings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can insert payment_links" ON public.payment_links FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE policies
CREATE POLICY "Authenticated can update packages" ON public.packages FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update consultations" ON public.consultations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update reviews" ON public.reviews FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update site_settings" ON public.site_settings FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update payment_links" ON public.payment_links FOR UPDATE USING (auth.uid() IS NOT NULL);

-- DELETE policies
CREATE POLICY "Authenticated can delete packages" ON public.packages FOR DELETE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete consultations" ON public.consultations FOR DELETE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete reviews" ON public.reviews FOR DELETE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete site_settings" ON public.site_settings FOR DELETE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete payment_links" ON public.payment_links FOR DELETE USING (auth.uid() IS NOT NULL);

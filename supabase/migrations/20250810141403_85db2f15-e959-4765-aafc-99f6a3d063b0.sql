
-- Create storage buckets for each niche
INSERT INTO storage.buckets (id, name, public) VALUES
  ('home_living', 'home_living', true),
  ('beauty_personal_care', 'beauty_personal_care', true),
  ('health_fitness', 'health_fitness', true),
  ('pets', 'pets', true),
  ('fashion_accessories', 'fashion_accessories', true),
  ('electronics_gadgets', 'electronics_gadgets', true),
  ('kids_babies', 'kids_babies', true),
  ('seasonal_events', 'seasonal_events', true),
  ('hobbies_lifestyle', 'hobbies_lifestyle', true),
  ('trending_viral', 'trending_viral', true);

-- Create RLS policies for public read access to all buckets
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (true);

-- Allow service role to manage all objects
CREATE POLICY "Service role can manage all objects" ON storage.objects
  FOR ALL USING (auth.role() = 'service_role');

-- Create a table to track product metadata for faster queries (optional)
CREATE TABLE public.curated_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  niche TEXT NOT NULL,
  product_folder TEXT NOT NULL, -- p01, p02, etc.
  bucket_name TEXT NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  product_type TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(niche, product_folder)
);

-- Add RLS for curated products
ALTER TABLE public.curated_products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to curated products
CREATE POLICY "Public can view curated products" 
  ON public.curated_products 
  FOR SELECT 
  USING (true);

-- Allow service role to manage curated products
CREATE POLICY "Service role can manage curated products" 
  ON public.curated_products 
  FOR ALL 
  USING (auth.role() = 'service_role');

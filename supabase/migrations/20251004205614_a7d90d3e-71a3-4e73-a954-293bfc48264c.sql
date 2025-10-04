-- Add category column to product_data table (mandatory field for product uploads)
ALTER TABLE public.product_data 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add comment to explain the category field
COMMENT ON COLUMN public.product_data.category IS 'Shopify product category (mandatory for uploads). Must not be empty or null for products to be uploaded.';
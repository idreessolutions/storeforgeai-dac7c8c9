-- Populate default categories for existing products based on niche
UPDATE product_data 
SET category = CASE 
  WHEN niche = 'home_living' THEN 'gid://shopify/TaxonomyCategory/sg-3-17-5-17'
  WHEN niche = 'pets' THEN 'gid://shopify/TaxonomyCategory/aa-6'
  WHEN niche = 'beauty_personal_care' THEN 'gid://shopify/TaxonomyCategory/bb-1'
  WHEN niche = 'health_fitness' THEN 'gid://shopify/TaxonomyCategory/sg-4-17-2-17'
  WHEN niche = 'fashion_accessories' THEN 'gid://shopify/TaxonomyCategory/aa-2'
  WHEN niche = 'electronics_gadgets' THEN 'gid://shopify/TaxonomyCategory/aa-1-7'
  WHEN niche = 'kids_babies' THEN 'gid://shopify/TaxonomyCategory/bb-5'
  WHEN niche = 'seasonal_events' THEN 'gid://shopify/TaxonomyCategory/sg-3-17-5-17'
  WHEN niche = 'hobbies_lifestyle' THEN 'gid://shopify/TaxonomyCategory/sg-4-17-1'
  WHEN niche = 'trending_viral' THEN 'gid://shopify/TaxonomyCategory/sg-3-17-5-17'
  ELSE 'gid://shopify/TaxonomyCategory/sg-3-17-5-17'
END
WHERE category IS NULL OR category = '';
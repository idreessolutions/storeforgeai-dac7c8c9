
-- Create the product_data table to store all product information
CREATE TABLE IF NOT EXISTS product_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  niche TEXT NOT NULL,
  product_folder TEXT NOT NULL,
  title TEXT NOT NULL,
  description_md TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(10,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  tags TEXT[] DEFAULT '{}',
  options JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  main_images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient niche queries
CREATE INDEX IF NOT EXISTS idx_product_data_niche ON product_data(niche);

-- Enable RLS
ALTER TABLE product_data ENABLE ROW LEVEL SECURITY;

-- Create policy for reading active products
CREATE POLICY "read_active_products"
  ON product_data FOR SELECT
  USING (is_active = true);

-- Seed one example row for testing
INSERT INTO product_data (
  niche, product_folder, title, description_md, price, compare_at_price, currency, tags,
  options, variants, main_images
)
VALUES (
  'home_living',
  'Product 1',
  '✨ Premium Silicone Sink Splash Guard - Kitchen Essential! 🏠',
  '🌟 **Transform Your Kitchen Experience Today!**

✨ Say goodbye to messy countertops and hello to a cleaner, more organized kitchen with our Premium Silicone Sink Splash Guard! This innovative kitchen essential is designed to keep your workspace dry and pristine while you tackle your daily kitchen tasks.

🔥 **Why You''ll Love This Kitchen Game-Changer:**
• 💧 **Splash Protection**: Advanced silicone design prevents water from splashing onto your countertops
• 🧽 **Easy Installation**: Flexible design fits most standard sink configurations perfectly
• 🛡️ **Durable Material**: Premium food-grade silicone that resists stains and odors
• 🎨 **Modern Design**: Sleek profile that complements any kitchen aesthetic
• 🧼 **Easy to Clean**: Simply rinse or toss in the dishwasher for effortless maintenance
• 🔧 **No Tools Required**: Quick setup in seconds without any permanent installation

🏆 **Perfect For Every Kitchen:**
Whether you''re washing dishes, preparing meals, or cleaning vegetables, this splash guard creates a barrier that keeps your kitchen neat and tidy. The flexible silicone material adapts to your sink''s unique shape while providing maximum coverage where you need it most.

💎 **Premium Quality Features:**
✅ **Food-Grade Silicone**: Safe for use around food and beverages
✅ **Heat Resistant**: Withstands temperatures up to 200°F
✅ **Non-Slip Design**: Stays securely in place during use
✅ **Compact Storage**: Folds flat for easy storage when not needed
✅ **Universal Fit**: Compatible with most standard kitchen sinks

🎁 **What You Get:**
• 1x Premium Silicone Sink Splash Guard
• Quick setup guide
• 30-day satisfaction guarantee
• Customer support access

⚡ **Limited Time: Special Launch Price!**
Transform your kitchen cleanup routine today and join thousands of satisfied customers who''ve discovered the convenience of our Premium Silicone Sink Splash Guard!

🛒 **Order now and make kitchen cleanup a breeze!**

*Premium quality • Modern design • Satisfaction guaranteed*',
  24.99,
  34.99,
  'USD',
  '{home,kitchen,organizer,silicone,splash guard}',
  '[{"name":"Color","values":["Black","Gray","White"]}]'::jsonb,
  '[
     {"sku":"SPLASH-BLK","price":24.99,"compareAtPrice":34.99,"optionValues":["Black"],"image":"Variants Product Images/black.jpg"},
     {"sku":"SPLASH-GRY","price":24.99,"compareAtPrice":34.99,"optionValues":["Gray"],"image":"Variants Product Images/gray.jpg"},
     {"sku":"SPLASH-WHT","price":24.99,"compareAtPrice":34.99,"optionValues":["White"],"image":"Variants Product Images/white.jpg"}
   ]'::jsonb,
  '{"Products Images/hero1.jpg","Products Images/hero2.jpg","Products Images/hero3.jpg"}'
);

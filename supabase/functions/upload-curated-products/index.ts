import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

class ShopifyClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(shopUrl: string, accessToken: string) {
    this.baseUrl = shopUrl.replace(/\/$/, '');
    this.accessToken = accessToken;
  }

  async createProduct(productData: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/products.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create product: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  async createProductWithRetry(productData: any, retries = 3, baseDelayMs = 800): Promise<any> {
    let attempt = 0;
    let lastError: any = null;
    let payload = JSON.parse(JSON.stringify(productData)); // clone
    let removedStandardType = false;
    while (attempt < retries) {
      attempt++;
      try {
        return await this.createProduct(payload);
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || '');
        // If Shopify rejects standard_product_type (422), retry once without it
        if (!removedStandardType && /422/.test(msg) && msg.toLowerCase().includes('standard_product_type')) {
          try {
            if (payload?.product?.standard_product_type) {
              delete payload.product.standard_product_type;
              removedStandardType = true;
              continue; // immediate retry without increasing delay
            }
          } catch {}
        }
        const delay = baseDelayMs * attempt;
        const shouldRetry = /429|500|502|503|504/.test(msg) || msg.includes('Failed to fetch') || msg.includes('NetworkError');
        if (attempt >= retries || !shouldRetry) break;
        await new Promise(r => setTimeout(r, delay));
      }
    }
    throw lastError || new Error('Failed to create product after retries');
  }

  async getThemes(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/themes.json`, {
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get themes: ${response.status}`);
    }

    return await response.json();
  }

  async getThemeAsset(themeId: string, assetKey: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/themes/${themeId}/assets.json?asset[key]=${assetKey}`, {
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get theme asset: ${response.status}`);
    }

    return await response.json();
  }

  async updateThemeAsset(themeId: string, assetData: any): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/themes/${themeId}/assets.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ asset: assetData })
    });

    return response.ok;
  }
}

// Updated niche mapping to handle both formats
const NICHE_TO_BUCKET: { [key: string]: string } = {
  'Home & Living': 'home_living',
  'home-living': 'home_living',
  'home_living': 'home_living',
  'Beauty & Personal Care': 'beauty_personal_care',
  'beauty-personal-care': 'beauty_personal_care',
  'beauty_personal_care': 'beauty_personal_care',
  'Health & Fitness': 'health_fitness',
  'health-fitness': 'health_fitness',
  'health_fitness': 'health_fitness',
  'Pets': 'pets',
  'pets': 'pets',
  'Fashion & Accessories': 'fashion_accessories',
  'fashion-accessories': 'fashion_accessories',
  'fashion_accessories': 'fashion_accessories',
  'Electronics & Gadgets': 'electronics_gadgets',
  'electronics-gadgets': 'electronics_gadgets',
  'electronics_gadgets': 'electronics_gadgets',
  'Kids & Babies': 'kids_babies',
  'kids-babies': 'kids_babies',
  'kids_babies': 'kids_babies',
  'Seasonal & Events': 'seasonal_events',
  'seasonal-events': 'seasonal_events',
  'seasonal_events': 'seasonal_events',
  'Hobbies & Lifestyle': 'hobbies_lifestyle',
  'hobbies-lifestyle': 'hobbies_lifestyle',
  'hobbies_lifestyle': 'hobbies_lifestyle',
  'Trending Viral Products': 'trending_viral',
  'trending-viral-products': 'trending_viral',
  'trending_viral': 'trending_viral'
};

const NICHE_TO_CATEGORY_NAME: { [key: string]: string } = {
  'Home & Living': 'Home & Garden',
  'home-living': 'Home & Garden',
  'home_living': 'Home & Garden',
  'Beauty & Personal Care': 'Health & Beauty',
  'beauty-personal-care': 'Health & Beauty',
  'beauty_personal_care': 'Health & Beauty',
  'Health & Fitness': 'Sporting Goods',
  'health-fitness': 'Sporting Goods',
  'health_fitness': 'Sporting Goods',
  'Pets': 'Pet Supplies',
  'pets': 'Pet Supplies',
  'Fashion & Accessories': 'Apparel & Accessories',
  'fashion-accessories': 'Apparel & Accessories',
  'fashion_accessories': 'Apparel & Accessories',
  'Electronics & Gadgets': 'Consumer Electronics',
  'electronics-gadgets': 'Consumer Electronics',
  'electronics_gadgets': 'Consumer Electronics',
  'Kids & Babies': 'Baby & Kids Products',
  'kids-babies': 'Baby & Kids Products',
  'kids_babies': 'Baby & Kids Products',
  'Seasonal & Events': 'Seasonal Decor',
  'seasonal-events': 'Seasonal Decor',
  'seasonal_events': 'Seasonal Decor',
  'Hobbies & Lifestyle': 'Hobby & Leisure Products',
  'hobbies-lifestyle': 'Hobby & Leisure Products',
  'hobbies_lifestyle': 'Hobby & Leisure Products',
  'Trending Viral Products': 'General Merchandise',
  'trending-viral-products': 'General Merchandise',
  'trending_viral': 'General Merchandise',
};

const NICHE_TO_SHOPIFY_CATEGORY: { [key: string]: string } = {
  'Home & Living': 'gid://shopify/TaxonomyCategory/sg-2-17-2-1',
  'home-living': 'gid://shopify/TaxonomyCategory/sg-2-17-2-1',
  'home_living': 'gid://shopify/TaxonomyCategory/sg-2-17-2-1',
  'Beauty & Personal Care': 'gid://shopify/TaxonomyCategory/sg-4-17-2-1',
  'beauty-personal-care': 'gid://shopify/TaxonomyCategory/sg-4-17-2-1',
  'beauty_personal_care': 'gid://shopify/TaxonomyCategory/sg-4-17-2-1',
  'Health & Fitness': 'gid://shopify/TaxonomyCategory/sg-3-12-2-1',
  'health-fitness': 'gid://shopify/TaxonomyCategory/sg-3-12-2-1',
  'health_fitness': 'gid://shopify/TaxonomyCategory/sg-3-12-2-1',
  'Pets': 'gid://shopify/TaxonomyCategory/sg-6-18-2-1',
  'pets': 'gid://shopify/TaxonomyCategory/sg-6-18-2-1',
  'Fashion & Accessories': 'gid://shopify/TaxonomyCategory/sg-1-5-2-1',
  'fashion-accessories': 'gid://shopify/TaxonomyCategory/sg-1-5-2-1',
  'fashion_accessories': 'gid://shopify/TaxonomyCategory/sg-1-5-2-1',
  'Electronics & Gadgets': 'gid://shopify/TaxonomyCategory/sg-5-7-1-1',
  'electronics-gadgets': 'gid://shopify/TaxonomyCategory/sg-5-7-1-1',
  'electronics_gadgets': 'gid://shopify/TaxonomyCategory/sg-5-7-1-1',
  'Kids & Babies': 'gid://shopify/TaxonomyCategory/sg-8-26-2-1',
  'kids-babies': 'gid://shopify/TaxonomyCategory/sg-8-26-2-1',
  'kids_babies': 'gid://shopify/TaxonomyCategory/sg-8-26-2-1',
  'Seasonal & Events': 'gid://shopify/TaxonomyCategory/sg-2-17-2-1',
  'seasonal-events': 'gid://shopify/TaxonomyCategory/sg-2-17-2-1',
  'seasonal_events': 'gid://shopify/TaxonomyCategory/sg-2-17-2-1',
  'Hobbies & Lifestyle': 'gid://shopify/TaxonomyCategory/sg-7-1-1-1',
  'hobbies-lifestyle': 'gid://shopify/TaxonomyCategory/sg-7-1-1-1',
  'hobbies_lifestyle': 'gid://shopify/TaxonomyCategory/sg-7-1-1-1',
  'Trending Viral Products': 'gid://shopify/TaxonomyCategory/sg-7-1-1-1',
  'trending-viral-products': 'gid://shopify/TaxonomyCategory/sg-7-1-1-1',
  'trending_viral': 'gid://shopify/TaxonomyCategory/sg-7-1-1-1',
};

function getCategoryName(niche: string): string {
  return NICHE_TO_CATEGORY_NAME[niche] || niche;
}

function getShopifyCategory(niche: string): string | undefined {
  return NICHE_TO_SHOPIFY_CATEGORY[niche];
}

async function generateAITitleAndDescription(niche: string, productIndex: number, storeName: string): Promise<{title: string; description: string}> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY_V2');
  
  if (!openaiKey) {
    console.log('⚠️ OpenAI API key not found, using fallback content');
    return generateFallbackTitleAndDescription(niche, productIndex, storeName);
  }

  try {
    console.log(`🤖 Generating AI title and description for ${niche} product ${productIndex + 1}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert e-commerce copywriter specializing in high-converting product content. Create compelling, emotional, and SEO-optimized content that drives sales. Use relevant emojis strategically throughout your writing.`
          },
          {
            role: 'user',
            content: `Create a compelling product title and description for a ${niche} product for ${storeName || 'Premium Store'}. This is product ${productIndex + 1} so make it unique.

REQUIREMENTS:
1. Title: Create a catchy, benefit-focused title (max 70 characters) with relevant emojis
2. Description: Write a beautiful 500-800 word description with:
   - Emotional hook opening with emojis
   - 6-8 key benefits (not just features) 
   - Social proof elements
   - Strong call-to-action
   - Modern, high-quality tone
   - Strategic use of emojis throughout
   - Perfect for ${niche} enthusiasts

Return ONLY this JSON format:
{
  "title": "🏆 Amazing ${niche} Product Title with Emojis",
  "description": "Beautiful 500-800 word description with emojis and compelling copy..."
}`
          }
        ],
        max_tokens: 1200,
        temperature: 0.8
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (content) {
        try {
          // Clean up the response
          let cleanContent = content.trim();
          if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          
          const aiContent = JSON.parse(cleanContent);
          console.log(`✅ AI generated title: "${aiContent.title}"`);
          return {
            title: aiContent.title || `✨ Premium ${niche} Essential - Product ${productIndex + 1}`,
            description: aiContent.description || generateFallbackDescription(niche, productIndex, storeName)
          };
        } catch (parseError) {
          console.warn('⚠️ Failed to parse AI response, using fallback');
          return generateFallbackTitleAndDescription(niche, productIndex, storeName);
        }
      }
    }
  } catch (error) {
    console.error('❌ AI generation failed:', error);
  }

  return generateFallbackTitleAndDescription(niche, productIndex, storeName);
}

function generateFallbackTitleAndDescription(niche: string, productIndex: number, storeName: string): {title: string; description: string} {
  const powerWords = ['Premium', 'Ultimate', 'Professional', 'Advanced', 'Elite', 'Smart'];
  const urgencyWords = ['Bestseller', 'Top Rated', 'Must-Have', 'Trending', '#1 Choice'];
  const emojis = ['⭐', '🏆', '💎', '🔥', '✨', '🎯'];
  
  const powerWord = powerWords[productIndex % powerWords.length];
  const urgency = urgencyWords[productIndex % urgencyWords.length];
  const emoji = emojis[productIndex % emojis.length];
  
  const title = `${emoji} ${powerWord} ${niche} Essential - ${urgency}`;
  const description = generateFallbackDescription(niche, productIndex, storeName);
  
  return { title, description };
}

function generateFallbackDescription(niche: string, productIndex: number, storeName: string): string {
  return `✨ **Transform Your ${niche} Experience Today!**

🌟 **Join thousands of satisfied customers who've discovered this game-changing product!**

🔥 **Why You'll Love This Premium ${niche} Solution:**
• ✅ **Professional Quality**: Engineered with superior materials for lasting performance
• 🚀 **Instant Results**: Experience remarkable improvements from day one
• 💯 **Safety First**: Rigorously tested and certified for your peace of mind
• 🎁 **Complete Package**: Everything included - no hidden extras needed
• 🛡️ **Satisfaction Guaranteed**: 30-day money-back promise

🎯 **Perfect For ${niche} Enthusiasts:**
Whether you're a beginner or expert, this premium solution delivers professional results every time. Designed specifically for those who demand excellence and won't settle for ordinary.

🏆 **${storeName || 'Our'} Quality Promise:**
⭐ **4.8/5 Star Rating** from verified buyers
🚚 **Free Fast Shipping** on orders over $35
💝 **30-Day Money-Back Guarantee**
🔒 **Secure Checkout** & 24/7 customer support

💎 **Exclusive Features:**
🔹 Premium design that stands out from the competition
🔹 User-friendly operation - perfect for all skill levels
🔹 Durable construction built to last for years
🔹 Compact and convenient for any space or lifestyle

⚡ **Limited Time: Special Launch Price!**
🎁 **Order now and get FREE bonus accessories worth $25!**

🛒 **Transform your ${niche.toLowerCase()} experience today** - join the thousands who've already made the upgrade!

*Premium quality • Modern design • Satisfaction guaranteed*`;
}

function calculateSmartPrice(basePrice: number, niche: string, index: number): number {
  // Smart pricing between $15-$80
  const nicheMultipliers: { [key: string]: number } = {
    'Home & Living': 1.6,
    'home-living': 1.6,
    'home_living': 1.6,
    'Beauty & Personal Care': 1.8,
    'beauty-personal-care': 1.8,
    'beauty_personal_care': 1.8,
    'Health & Fitness': 1.7,
    'health-fitness': 1.7,
    'health_fitness': 1.7,
    'Pets': 1.9,
    'pets': 1.9,
    'Fashion & Accessories': 1.5,
    'fashion-accessories': 1.5,
    'fashion_accessories': 1.5,
    'Electronics & Gadgets': 2.0,
    'electronics-gadgets': 2.0,
    'electronics_gadgets': 2.0,
    'Kids & Babies': 1.8,
    'kids-babies': 1.8,
    'kids_babies': 1.8,
    'Seasonal & Events': 1.4,
    'seasonal-events': 1.4,
    'seasonal_events': 1.4,
    'Hobbies & Lifestyle': 1.6,
    'hobbies-lifestyle': 1.6,
    'hobbies_lifestyle': 1.6,
    'Trending Viral Products': 1.7,
    'trending-viral-products': 1.7,
    'trending_viral': 1.7
  };

  const multiplier = nicheMultipliers[niche] || 1.6;
  const variation = 1 + (index * 0.05); // Small variation per product
  
  let price = (basePrice || 25) * multiplier * variation;
  
  // Ensure within range
  price = Math.max(15, Math.min(80, price));
  
  // Psychological pricing
  if (price < 25) return Math.floor(price) + 0.99;
  else if (price < 50) return Math.floor(price) + 0.95;
  else return Math.floor(price) + 0.99;
}


// Get product data from product_data table - CRITICAL: This is the PRIMARY source for all text content
async function getProductDataFromTable(supabase: any, niche: string, productFolder: string) {
  try {
    console.log(`🔍 Querying product_data table for niche="${niche}", productFolder="${productFolder}"`);
    
    // Query product_data table for this specific product
    const { data, error } = await supabase
      .from('product_data')
      .select('*')
      .eq('niche', niche)
      .eq('product_folder', productFolder)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error(`❌ Database error fetching product data:`, error);
      return null;
    }

    if (!data) {
      console.log(`⚠️ No data found in product_data table for ${niche}/${productFolder}`);
      return null;
    }

    // CRITICAL: Validate mandatory category field
    if (!data.category || data.category.trim() === '') {
      console.warn(`❌ SKIPPING ${productFolder}: Missing mandatory category field`);
      return null;
    }

    console.log(`✅ Found product data in table for ${productFolder}: "${data.title}"`);
    
    // Apply "Being prepared" fallback for missing text fields (except category)
    const FALLBACK = "Being prepared";
    
    return {
      title: data.title && data.title.trim() !== '' ? data.title : FALLBACK,
      description: data.description_md && data.description_md.trim() !== '' ? data.description_md : FALLBACK,
      price: data.price || 0,
      compareAtPrice: data.compare_at_price || null,
      currency: data.currency || 'USD',
      tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : [FALLBACK],
      productType: data.product_type || null,
      category: data.category, // Already validated as non-empty
      options: Array.isArray(data.options) ? data.options.map((opt: any) => ({
        ...opt,
        name: opt.name && opt.name.trim() !== '' ? opt.name : FALLBACK,
        values: Array.isArray(opt.values) ? opt.values.map((v: string) => v && v.trim() !== '' ? v : FALLBACK) : [FALLBACK]
      })) : [],
      variants: Array.isArray(data.variants) ? data.variants : [],
      mainImages: Array.isArray(data.main_images) ? data.main_images : []
    };
  } catch (err) {
    console.error(`❌ Error fetching product data from table:`, err);
    return null;
  }
}

// Fetch exactly 10 unique, active products randomly from product_data table
async function fetchRandomProducts(supabase: any, niche: string, limit: number = 10) {
  try {
    console.log(`🎲 Fetching ${limit} random active products from product_data for niche: ${niche}`);
    
    // Get all active products for this niche that have a category
    const { data, error } = await supabase
      .from('product_data')
      .select('product_folder, category')
      .eq('niche', niche)
      .eq('is_active', true)
      .not('category', 'is', null)
      .not('category', 'eq', '');

    if (error) {
      console.error(`❌ Error fetching products from product_data:`, error);
      return [];
    }

    if (!data || data.length === 0) {
      console.warn(`⚠️ No active products with categories found in product_data for ${niche}`);
      return [];
    }

    console.log(`📊 Found ${data.length} eligible products in product_data table`);

    // Shuffle the array and take exactly 'limit' products
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(limit, data.length));

    console.log(`✅ Selected ${selected.length} unique products:`, selected.map(p => p.product_folder));
    
    return selected.map(p => p.product_folder);
  } catch (err) {
    console.error(`❌ Error in fetchRandomProducts:`, err);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Edge Function: Starting upload-curated-products');
    console.log('📥 Request method:', req.method);
    console.log('📝 Request headers:', Object.fromEntries(req.headers.entries()));

    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('📄 Raw request body:', bodyText);
      
      if (!bodyText.trim()) {
        throw new Error('Empty request body received');
      }
      
      requestBody = JSON.parse(bodyText);
      console.log('✅ Parsed request body:', requestBody);
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(JSON.stringify({
        success: false,
        error: `Invalid JSON in request body: ${parseError.message}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { niche, shopifyUrl, shopifyAccessToken, themeColor, storeName, limit = 10, aiContent } = requestBody;
    const useAI = Boolean(aiContent === true);

    console.log('🚀 Starting curated product upload with AI content generation:', {
      niche,
      limit,
      themeColor,
      storeName,
      aiContentGeneration: useAI
    });

    if (!shopifyUrl || !shopifyAccessToken) {
      throw new Error('Shopify credentials are required');
    }

    const bucketName = NICHE_TO_BUCKET[niche];
    if (!bucketName) {
      console.error(`❌ Invalid niche: ${niche}. Available niches:`, Object.keys(NICHE_TO_BUCKET));
      throw new Error(`Invalid niche: ${niche}. Please use one of: ${Object.keys(NICHE_TO_BUCKET).join(', ')}`);
    }

    console.log(`✅ Mapped niche "${niche}" to bucket "${bucketName}"`);

    const categoryName = getCategoryName(niche);
    const shopifyCategory = getShopifyCategory(niche);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize Shopify client
    const shopifyClient = new ShopifyClient(shopifyUrl, shopifyAccessToken);

    const targetCount = 10;

    // Fetch exactly 10 random products from product_data table (table-driven selection)
    const selectedProductFolders = await fetchRandomProducts(supabase, bucketName, targetCount);
    
    if (selectedProductFolders.length === 0) {
      throw new Error(`No eligible products found in product_data table for ${bucketName}. Please ensure products have category field populated and is_active=true.`);
    }

    console.log(`🎯 Will process exactly ${selectedProductFolders.length} products from product_data table`);

    const results = [];
    let successCount = 0;

    for (let i = 0; i < selectedProductFolders.length; i++) {
      const productFolder = selectedProductFolders[i];
      
      console.log(`📦 Processing product ${i + 1}/${selectedProductFolders.length}: ${productFolder}`);

      try {
        // Pull ONLY from product_data table in Supabase (no AI, no fallback)
        console.log(`📊 Fetching product data from product_data table for ${productFolder}...`);
        const productData = await getProductDataFromTable(supabase, bucketName, productFolder);
        
        // Skip if product data is invalid (missing category or not found)
        if (!productData) {
          console.warn(`⚠️ Skipping ${productFolder}: Invalid or missing product data`);
          continue;
        }

        console.log(`🛒 Creating product in Shopify: ${productData.title}`);

        // Get main product images from storage
        const { data: mainImages } = await supabase.storage
          .from(bucketName)
          .list(`${productFolder}/Products Images`);

        const imageUrls: Array<{ src: string; alt: string }> = [];
        
        if (mainImages && mainImages.length > 0) {
          for (const img of mainImages.slice(0, 8)) { // Increased to 8 images
            const { data: imageUrl } = supabase.storage
              .from(bucketName)
              .getPublicUrl(`${productFolder}/Products Images/${img.name}`);
            
            imageUrls.push({
              src: imageUrl.publicUrl,
              alt: `${productData.title} - Image ${imageUrls.length + 1}`
            });
          }
        }

        // Get variant images from storage
        const { data: variantImages } = await supabase.storage
          .from(bucketName)
          .list(`${productFolder}/Variants Product Images`);

        // Use variants from table data if available, otherwise create from variant images
        let variants = [];
        const colors = ['Black', 'White', 'Blue', 'Red', 'Gray', 'Green', 'Purple', 'Brown'];
        
        if (productData.variants && productData.variants.length > 0) {
          // Use variants from product_data table (jsonb field)
          variants = productData.variants.map((v: any, idx: number) => ({
            option1: v.optionValues?.[0] || colors[(i + idx) % colors.length],
            price: String(v.price || productData.price || 29.99),
            compare_at_price: String(v.compareAtPrice || productData.compareAtPrice || (v.price * 1.4)),
            sku: v.sku || `${bucketName.toUpperCase()}-${i + 1}-${idx + 1}`,
            inventory_quantity: v.inventory_quantity || 100,
            inventory_management: 'shopify',
            inventory_policy: 'deny',
            requires_shipping: true,
            taxable: true
          }));
        } else if (variantImages && variantImages.length > 0) {
          // Create variants based on available variant images
          for (let v = 0; v < Math.min(3, variantImages.length); v++) {
            const variantImageUrl = supabase.storage
              .from(bucketName)
              .getPublicUrl(`${productFolder}/Variants Product Images/${variantImages[v].name}`);

            const variantPrice = productData.price > 0 ? productData.price + (v * 2) : 29.99 + (v * 2);
            const variantComparePrice = productData.compareAtPrice || (variantPrice * 1.4);

            variants.push({
              option1: colors[(i + v) % colors.length],
              price: variantPrice.toFixed(2),
              compare_at_price: variantComparePrice.toFixed(2),
              sku: `${bucketName.toUpperCase()}-${i + 1}-${v + 1}`,
              inventory_quantity: 100,
              inventory_management: 'shopify',
              inventory_policy: 'deny',
              requires_shipping: true,
              taxable: true
            });

            // Add variant image to main images
            imageUrls.push({
              src: variantImageUrl.data.publicUrl,
              alt: `${productData.title} - ${colors[(i + v) % colors.length]}`
            });
          }
        } else {
          // Create default variants with varied colors
          const defaultPrice = productData.price > 0 ? productData.price : 29.99;
          const defaultComparePrice = productData.compareAtPrice || (defaultPrice * 1.4);
          
          for (let v = 0; v < 3; v++) {
            const variantPrice = defaultPrice + (v * 2);
            const variantComparePrice = defaultComparePrice + (v * 2);
            
            variants.push({
              option1: colors[(i + v) % colors.length],
              price: variantPrice.toFixed(2),
              compare_at_price: variantComparePrice.toFixed(2),
              sku: `${bucketName.toUpperCase()}-${i + 1}-${v + 1}`,
              inventory_quantity: 100,
              inventory_management: 'shopify',
              inventory_policy: 'deny',
              requires_shipping: true,
              taxable: true
            });
          }
        }

        // Prepare tags - use from table or fallback
        const allTags = [
          ...(productData.tags || []),
          categoryName,
          niche,
          'curated'
        ];
        const uniqueTags = [...new Set(allTags)].join(', ');

        // Prepare options - use from table data or default to Color
        const productOptions = productData.options && productData.options.length > 0
          ? productData.options
          : [{
              name: 'Color',
              position: 1,
              values: variants.map((v, idx) => colors[(i + idx) % colors.length]).slice(0, variants.length)
            }];

        // CRITICAL: Use category from product_data table (already validated as non-empty)
        // This is MANDATORY - we already skipped products without category
        const shopifyProduct = {
          product: {
            title: productData.title,
            body_html: productData.description,
            vendor: storeName || 'Premium Store',
            product_type: productData.productType || categoryName,
            category: productData.category, // From product_data table - MANDATORY
            tags: uniqueTags,
            options: productOptions,
            variants: variants,
            images: imageUrls.map((img, index) => ({
              src: img.src,
              alt: img.alt,
              position: index + 1
            }))
          }
        };

        console.log(`📦 Product payload - Category: ${shopifyProduct.product.category}, Type: ${shopifyProduct.product.product_type}`);

        // Upload to Shopify
        const productResponse = await shopifyClient.createProductWithRetry(shopifyProduct);
        const createdProduct = productResponse.product;

        successCount++;
        results.push({
          productFolder,
          success: true,
          productId: createdProduct.id,
          title: productData.title,
          category: productData.category,
          shopifyUrl: `${shopifyUrl}/admin/products/${createdProduct.id}`,
          imagesUploaded: imageUrls.length,
          variantsCreated: createdProduct.variants.length,
          dataSource: 'product_data table'
        });

        console.log(`✅ Successfully created: ${productData.title} (ID: ${createdProduct.id}, Category: ${productData.category})`);

      } catch (error) {
        console.error(`❌ Error processing ${productFolder}:`, error);
        results.push({
          productFolder,
          success: false,
          error: error.message
        });
      }
    }


    // Apply theme color to Refresh theme
    if (themeColor && successCount > 0) {
      try {
        console.log(`🎨 Applying theme color ${themeColor} to Refresh theme...`);
        
        const themesResponse = await shopifyClient.getThemes();
        const refreshTheme = themesResponse.themes.find((theme: any) => 
          theme.name === 'Refresh' || theme.role === 'main'
        );

        if (refreshTheme) {
          const settingsResponse = await shopifyClient.getThemeAsset(refreshTheme.id, 'config/settings_data.json');
          
          if (settingsResponse.asset) {
            const settings = JSON.parse(settingsResponse.asset.value);
            
            if (!settings.current) settings.current = {};
            
            // Update color settings for Refresh theme
            const colorKeys = [
              'colors_accent_1',
              'colors_accent_2', 
              'color_accent',
              'color_primary',
              'colors_button_background',
              'colors_button_label'
            ];

            colorKeys.forEach(key => {
              if (settings.current[key] !== undefined) {
                settings.current[key] = themeColor;
              }
            });

            await shopifyClient.updateThemeAsset(refreshTheme.id, {
              key: 'config/settings_data.json',
              value: JSON.stringify(settings)
            });

            console.log(`✅ Theme color applied to ${refreshTheme.name} theme`);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to apply theme color:`, error);
      }
    }

    console.log(`🎉 Upload complete: ${successCount}/${targetCount} products uploaded successfully`);

    return new Response(JSON.stringify({
      success: true,
      uploadedCount: successCount,
      totalProcessed: results.length,
      targetCount: targetCount,
      results,
      niche,
      bucketName,
      message: `Successfully uploaded ${successCount} curated ${niche} products from product_data table${themeColor ? ' and applied theme color' : ''}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Curated product upload with AI content failed:', error);
    // Always return 2xx so the app can handle partial results gracefully
    return new Response(JSON.stringify({
      success: false,
      uploadedCount: 0,
      error: error?.message || 'Upload failed',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

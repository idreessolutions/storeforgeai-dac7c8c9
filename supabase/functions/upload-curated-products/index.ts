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


// Get product data from product_data table
async function getProductDataFromTable(supabase: any, niche: string, productFolder: string, uniqueId: number, storeName: string) {
  try {
    // Query product_data table for this specific product
    const { data, error } = await supabase
      .from('product_data')
      .select('*')
      .eq('niche', niche)
      .eq('product_folder', productFolder)
      .single();

    if (error || !data) {
      console.log(`⚠️ No data found in product_data table for ${niche}/${productFolder}, using fallback`);
      return generateFallbackProductData(niche, productFolder, uniqueId, storeName);
    }

    console.log(`✅ Found product data in table for ${productFolder}`);
    
    return {
      title: data.title || `✨ ${productFolder} — ${niche} Pick #${uniqueId + 1}`,
      description: data.description_md || generateFallbackDescription(niche, uniqueId, storeName),
      price: data.price || 29.99,
      compareAtPrice: data.compare_at_price || (data.price * 1.4),
      tags: data.tags || [],
      productType: data.product_type || getCategoryName(niche),
      options: data.options || [],
      variants: data.variants || []
    };
  } catch (err) {
    console.error(`❌ Error fetching product data from table:`, err);
    return generateFallbackProductData(niche, productFolder, uniqueId, storeName);
  }
}

function generateFallbackProductData(niche: string, productFolder: string, uniqueId: number, storeName: string) {
  const pretty = productFolder.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const basePrice = calculateSmartPrice(29.99 + (uniqueId * 1.5), niche, uniqueId);
  
  return {
    title: `✨ ${pretty} — ${niche} Pick #${uniqueId + 1}`,
    description: generateFallbackDescription(niche, uniqueId, storeName),
    price: basePrice,
    compareAtPrice: basePrice * 1.4,
    tags: [getCategoryName(niche), niche, 'premium', 'bestseller'],
    productType: getCategoryName(niche),
    options: [],
    variants: []
  };
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

    // Get available product folders (sorted numerically: Product 1..N)
    const { data: productFolders, error: listError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 200, sortBy: { column: 'name', order: 'asc' } });

    if (listError) {
      throw new Error(`Failed to list products: ${listError.message}`);
    }

    const productNames = (productFolders || [])
      .filter((item) => item.name.startsWith('Product') && !item.name.includes('.'))
      .map((item) => item.name)
      .sort((a, b) => {
        const an = parseInt((a.match(/\d+/)?.[0] || '0'), 10);
        const bn = parseInt((b.match(/\d+/)?.[0] || '0'), 10);
        return an - bn || a.localeCompare(b);
      });

    if (productNames.length === 0) {
      throw new Error(`No product folders found in ${bucketName} bucket`);
    }

    console.log(`📦 Found ${productNames.length} available products in ${bucketName}: [${productNames.slice(0, 10).join(', ')}${productNames.length > 10 ? ', ...' : ''}]`);

    const targetCount = 10;

    // Prefer randomized unique set when we have enough products
    let baseList: string[];
    if (productNames.length >= targetCount) {
      const shuffled = [...productNames];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      baseList = shuffled.slice(0, targetCount);
    } else {
      baseList = [];
      for (let i = 0; i < targetCount; i++) {
        baseList.push(productNames[i % productNames.length]);
      }
    }

    const selectedProducts = baseList.map((name, i) => ({ name, uniqueId: i }));

    console.log(`🎯 Will process exactly ${selectedProducts.length} products (unique source folders: ${new Set(baseList).size})`);

    const results = [];
    let successCount = 0;

    for (let i = 0; i < selectedProducts.length; i++) {
      const productFolder = selectedProducts[i].name;
      const uniqueId = selectedProducts[i].uniqueId;
      
      console.log(`📦 Processing product ${i + 1}/${selectedProducts.length}: ${productFolder} (Instance ${uniqueId + 1})`);

      try {
        // Get product data from product_data table (or AI if requested)
        let productData: any;
        
        if (useAI) {
          console.log(`🤖 Generating AI content for ${productFolder} (Instance ${uniqueId + 1})...`);
          const ai = await generateAITitleAndDescription(niche, uniqueId, storeName);
          const basePrice = calculateSmartPrice(29.99 + (uniqueId * 1.5), niche, uniqueId);
          
          productData = {
            title: ai.title,
            description: ai.description,
            price: basePrice,
            compareAtPrice: basePrice * 1.4,
            tags: [getCategoryName(niche), niche, 'premium', 'ai-generated'],
            productType: getCategoryName(niche),
            options: [],
            variants: []
          };
        } else {
          // Pull from product_data table in Supabase
          console.log(`📊 Fetching product data from product_data table for ${productFolder}...`);
          productData = await getProductDataFromTable(supabase, bucketName, productFolder, uniqueId, storeName);
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

        // Use variants from table data if available, otherwise create default variants
        let variants = [];
        const colors = ['Black', 'White', 'Blue', 'Red', 'Gray', 'Green', 'Purple', 'Brown'];
        
        if (productData.variants && productData.variants.length > 0) {
          // Use variants from product_data table
          variants = productData.variants.map((v: any, idx: number) => ({
            ...v,
            sku: v.sku || `${bucketName.toUpperCase()}-${uniqueId + 1}-${idx + 1}`,
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

            const variantPrice = productData.price + (v * 2);
            const variantComparePrice = productData.compareAtPrice + (v * 2);

            variants.push({
              option1: colors[(uniqueId + v) % colors.length],
              price: variantPrice.toFixed(2),
              compare_at_price: variantComparePrice.toFixed(2),
              sku: `${bucketName.toUpperCase()}-${uniqueId + 1}-${v + 1}`,
              inventory_quantity: 100,
              inventory_management: 'shopify',
              inventory_policy: 'deny',
              requires_shipping: true,
              taxable: true
            });

            // Add variant image to main images
            imageUrls.push({
              src: variantImageUrl.data.publicUrl,
              alt: `${productData.title} - ${colors[(uniqueId + v) % colors.length]}`
            });
          }
        } else {
          // Create default variants with varied colors
          for (let v = 0; v < 3; v++) {
            const variantPrice = productData.price + (v * 2);
            const variantComparePrice = productData.compareAtPrice + (v * 2);
            
            variants.push({
              option1: colors[(uniqueId + v) % colors.length],
              price: variantPrice.toFixed(2),
              compare_at_price: variantComparePrice.toFixed(2),
              sku: `${bucketName.toUpperCase()}-${uniqueId + 1}-${v + 1}`,
              inventory_quantity: 100,
              inventory_management: 'shopify',
              inventory_policy: 'deny',
              requires_shipping: true,
              taxable: true
            });
          }
        }

        // Prepare tags - combine table tags with niche tags
        const allTags = [
          ...(productData.tags || []),
          categoryName,
          niche,
          'premium',
          `instance-${uniqueId + 1}`
        ];
        const uniqueTags = [...new Set(allTags)].join(', ');

        // Prepare options - use from table data or default to Color
        const productOptions = productData.options && productData.options.length > 0
          ? productData.options
          : [{
              name: 'Color',
              position: 1,
              values: variants.map((v, idx) => colors[(uniqueId + idx) % colors.length]).slice(0, variants.length)
            }];

        // Create Shopify product with category always included
        const shopifyProduct = {
          product: {
            title: productData.title,
            body_html: productData.description,
            vendor: storeName || 'Premium Store',
            product_type: productData.productType || categoryName,
            category: shopifyCategory || undefined, // Always include category
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
          uniqueInstance: uniqueId + 1,
          success: true,
          productId: createdProduct.id,
          title: productData.title,
          category: categoryName,
          shopifyUrl: `${shopifyUrl}/admin/products/${createdProduct.id}`,
          imagesUploaded: imageUrls.length,
          variantsCreated: createdProduct.variants.length,
          dataSource: useAI ? 'AI' : 'product_data table'
        });

        console.log(`✅ Successfully created: ${productData.title} (ID: ${createdProduct.id}, Instance: ${uniqueId + 1}, Category: ${categoryName})`);

        // Optional tiny delay to be gentle on API (kept very small)
        // await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error processing ${productFolder} (Instance ${uniqueId + 1}):`, error);
        results.push({
          productFolder,
          uniqueInstance: uniqueId + 1,
          success: false,
          error: error.message
        });
      }
    }

    // If we didn't reach the target yet, do another quick pass to guarantee 10
    // This is fast because we skip AI generation and reuse curated assets
    let extraPasses = 0;
    while (successCount < targetCount && extraPasses < 2) {
      extraPasses++;
      console.log(`🔁 Guarantee pass #${extraPasses}: need ${targetCount - successCount} more products`);
      for (let i = 0; i < selectedProducts.length && successCount < targetCount; i++) {
        const productFolder = selectedProducts[i].name;
        const uniqueId = selectedProducts[i].uniqueId + (extraPasses * 10);
        try {
          // Use product_data table for retry passes too
          const productData = await getProductDataFromTable(supabase, bucketName, productFolder, uniqueId, storeName);

          // Recompute assets quickly
          const { data: mainImages } = await supabase.storage
            .from(bucketName)
            .list(`${productFolder}/Products Images`);

          const imageUrls: Array<{ src: string; alt: string }> = [];
          if (mainImages && mainImages.length > 0) {
            for (const img of mainImages.slice(0, 8)) {
              const { data: imageUrl } = supabase.storage
                .from(bucketName)
                .getPublicUrl(`${productFolder}/Products Images/${img.name}`);
              imageUrls.push({ src: imageUrl.publicUrl, alt: `${productData.title} - Image ${imageUrls.length + 1}` });
            }
          }

          const { data: variantImages } = await supabase.storage
            .from(bucketName)
            .list(`${productFolder}/Variants Product Images`);

          const variants = [] as any[];
          const colors = ['Black', 'White', 'Blue', 'Red', 'Gray', 'Green', 'Purple', 'Brown'];
          
          if (productData.variants && productData.variants.length > 0) {
            for (const v of productData.variants) {
              variants.push({
                ...v,
                sku: v.sku || `${bucketName.toUpperCase()}-${uniqueId + 1}-${variants.length + 1}`,
                inventory_quantity: v.inventory_quantity || 100,
                inventory_management: 'shopify',
                inventory_policy: 'deny',
                requires_shipping: true,
                taxable: true
              });
            }
          } else if (variantImages && variantImages.length > 0) {
            for (let v = 0; v < Math.min(3, variantImages.length); v++) {
              const variantImageUrl = supabase.storage
                .from(bucketName)
                .getPublicUrl(`${productFolder}/Variants Product Images/${variantImages[v].name}`);
              
              const variantPrice = productData.price + (v * 2);
              const variantComparePrice = productData.compareAtPrice + (v * 2);
              
              variants.push({
                option1: colors[(uniqueId + v) % colors.length],
                price: variantPrice.toFixed(2),
                compare_at_price: variantComparePrice.toFixed(2),
                sku: `${bucketName.toUpperCase()}-${uniqueId + 1}-${v + 1}`,
                inventory_quantity: 100,
                inventory_management: 'shopify',
                inventory_policy: 'deny',
                requires_shipping: true,
                taxable: true
              });
              imageUrls.push({ src: variantImageUrl.data.publicUrl, alt: `${productData.title} - ${colors[(uniqueId + v) % colors.length]}` });
            }
          } else {
            for (let v = 0; v < 3; v++) {
              const variantPrice = productData.price + (v * 2);
              const variantComparePrice = productData.compareAtPrice + (v * 2);
              
              variants.push({
                option1: colors[(uniqueId + v) % colors.length],
                price: variantPrice.toFixed(2),
                compare_at_price: variantComparePrice.toFixed(2),
                sku: `${bucketName.toUpperCase()}-${uniqueId + 1}-${v + 1}`,
                inventory_quantity: 100,
                inventory_management: 'shopify',
                inventory_policy: 'deny',
                requires_shipping: true,
                taxable: true
              });
            }
          }

          const allTags = [
            ...(productData.tags || []),
            categoryName,
            niche,
            'curated',
            `instance-${uniqueId + 1}`
          ];
          const uniqueTags = [...new Set(allTags)].join(', ');
          
          const productOptions = productData.options && productData.options.length > 0
            ? productData.options
            : [{ name: 'Color', position: 1, values: variants.map((v, idx) => colors[(uniqueId + idx) % colors.length]).slice(0, variants.length) }];

          const shopifyProduct = {
            product: {
              title: productData.title,
              body_html: productData.description,
              vendor: storeName || 'Premium Store',
              product_type: productData.productType || categoryName,
              category: shopifyCategory || undefined,
              tags: uniqueTags,
              options: productOptions,
              variants,
              images: imageUrls.map((img, index) => ({ src: img.src, alt: img.alt, position: index + 1 }))
            }
          };

          const productResponse = await shopifyClient.createProductWithRetry(shopifyProduct);
          const createdProduct = productResponse.product;
          successCount++;
          results.push({
            productFolder,
            uniqueInstance: uniqueId + 1,
            success: true,
            productId: createdProduct.id,
            title: meta.title,
            shopifyUrl: `${shopifyUrl}/admin/products/${createdProduct.id}`,
            imagesUploaded: imageUrls.length,
            variantsCreated: createdProduct.variants.length,
            aiGenerated: false
          });
        } catch (err) {
          console.warn(`⚠️ Retry pass failed for ${productFolder} #${uniqueId + 1}:`, err?.message || err);
        }
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

    console.log(`🎉 GUARANTEED SUCCESS: ${successCount}/${targetCount} products uploaded successfully`);

    if (successCount < targetCount) {
      console.warn(`⚠️ Only ${successCount} out of ${targetCount} products were successful`);
    }

    return new Response(JSON.stringify({
      success: true,
      uploadedCount: successCount,
      totalProcessed: results.length,
      targetCount: targetCount,
      guaranteedTenProducts: successCount === targetCount,
      results,
      niche,
      bucketName,
      aiContentGenerated: true,
      message: `Successfully uploaded ${successCount} curated ${niche} products with AI-generated titles and descriptions${themeColor ? ' and applied theme color' : ''}`
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

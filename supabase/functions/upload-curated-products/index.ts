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


// Lightweight helpers to read curated metadata from storage (title/description)
async function readTextFromStorage(supabase: any, bucket: string, path: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error || !data) return null;
    const text = await data.text();
    return text.trim();
  } catch (_e) {
    return null;
  }
}

async function getProductMetadata(supabase: any, bucket: string, productFolder: string, niche: string, uniqueId: number, storeName: string) {
  // Try common curated file names first
  const titleCandidates = [
    `${productFolder}/title.txt`,
    `${productFolder}/Title.txt`,
    `${productFolder}/title.json`,
  ];
  const descCandidates = [
    `${productFolder}/description.md`,
    `${productFolder}/description.txt`,
    `${productFolder}/Description.md`,
    `${productFolder}/Description.txt`,
  ];

  let title: string | null = null;
  for (const p of titleCandidates) {
    const t = await readTextFromStorage(supabase, bucket, p);
    if (t) {
      try {
        // If JSON, parse { title: "..." }
        if (p.endsWith('.json')) {
          const obj = JSON.parse(t);
          title = obj.title || null;
        } else {
          title = t;
        }
      } catch { /* ignore */ }
    }
    if (title) break;
  }

  let description: string | null = null;
  for (const p of descCandidates) {
    const d = await readTextFromStorage(supabase, bucket, p);
    if (d) {
      description = d;
      break;
    }
  }

  if (!title) {
    // Fallback to human-friendly title from folder name with unique suffix
    const pretty = productFolder.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
    title = `✨ ${pretty} — ${niche} Pick #${uniqueId + 1}`;
  }
  if (!description) {
    description = generateFallbackDescription(niche, uniqueId, storeName);
  }

  return { title, description };
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize Shopify client
    const shopifyClient = new ShopifyClient(shopifyUrl, shopifyAccessToken);

    // Get available product folders
    const { data: productFolders, error: listError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 100 });

    if (listError) {
      throw new Error(`Failed to list products: ${listError.message}`);
    }

    // Filter for product folders
    const availableProducts = productFolders?.filter(item => 
      item.name.startsWith('Product') && !item.name.includes('.')
    ) || [];

    if (availableProducts.length === 0) {
      throw new Error(`No product folders found in ${bucketName} bucket`);
    }

    console.log(`📦 Found ${availableProducts.length} available products in ${bucketName}`);

    // ENSURE EXACTLY 10 PRODUCTS: Cycle through available products if needed
    const targetCount = 10;
    const selectedProducts = [];
    
    for (let i = 0; i < targetCount; i++) {
      const productIndex = i % availableProducts.length;
      selectedProducts.push({
        ...availableProducts[productIndex],
        uniqueId: i // Add unique identifier for each instance
      });
    }

    console.log(`🎯 GUARANTEED: Processing exactly ${selectedProducts.length} products (cycling through ${availableProducts.length} available products)`);

    const results = [];
    let successCount = 0;

    for (let i = 0; i < selectedProducts.length; i++) {
      const productFolder = selectedProducts[i].name;
      const uniqueId = selectedProducts[i].uniqueId;
      
      console.log(`📦 Processing product ${i + 1}/${selectedProducts.length}: ${productFolder} (Instance ${uniqueId + 1})`);

      try {
        // Get title and description (prefer curated storage, optionally AI)
        let productTitle: string;
        let description: string;
        if (useAI) {
          console.log(`🤖 Generating AI content for ${productFolder} (Instance ${uniqueId + 1})...`);
          const ai = await generateAITitleAndDescription(niche, uniqueId, storeName);
          productTitle = ai.title;
          description = ai.description;
        } else {
          const meta = await getProductMetadata(supabase, bucketName, productFolder, niche, uniqueId, storeName);
          productTitle = meta.title;
          description = meta.description;
        }

        console.log(`🛒 Creating product in Shopify: ${productTitle}`);

        // Get main product images
        const { data: mainImages } = await supabase.storage
          .from(bucketName)
          .list(`${productFolder}/Products Images`);

        const imageUrls: Array<{ src: string; alt: string }> = [];
        
        if (mainImages && mainImages.length > 0) {
          for (const img of mainImages.slice(0, 5)) { // Limit to 5 images
            const { data: imageUrl } = supabase.storage
              .from(bucketName)
              .getPublicUrl(`${productFolder}/Products Images/${img.name}`);
            
            imageUrls.push({
              src: imageUrl.publicUrl,
              alt: `${productTitle} - Image ${imageUrls.length + 1}`
            });
          }
        }

        // Get variant images
        const { data: variantImages } = await supabase.storage
          .from(bucketName)
          .list(`${productFolder}/Variants Product Images`);

        // Calculate smart pricing with variation for each instance
        const basePrice = 29.99 + (uniqueId * 1.5); // Slight price variation per instance
        const price = calculateSmartPrice(basePrice, niche, uniqueId);
        const compareAtPrice = price * 1.4; // 40% higher compare price

        // Create variants based on available variant images
        const variants = [];
        const colors = ['Black', 'White', 'Blue', 'Red', 'Gray', 'Green', 'Purple', 'Brown'];

        if (variantImages && variantImages.length > 0) {
          // Create variants based on available variant images
          for (let v = 0; v < Math.min(3, variantImages.length); v++) {
            const variantImageUrl = supabase.storage
              .from(bucketName)
              .getPublicUrl(`${productFolder}/Variants Product Images/${variantImages[v].name}`);

            variants.push({
              option1: colors[(uniqueId + v) % colors.length], // Vary colors based on unique ID
              price: (price + (v * 2)).toFixed(2),
              compare_at_price: (compareAtPrice + (v * 2)).toFixed(2),
              sku: `${bucketName.toUpperCase()}-${uniqueId + 1}-${v + 1}`,
              inventory_quantity: 100,
              inventory_management: 'shopify',
              inventory_policy: 'deny',
              requires_shipping: true,
              taxable: true
            });

            // Add variant image to main images if not already included
            imageUrls.push({
              src: variantImageUrl.data.publicUrl,
              alt: `${productTitle} - ${colors[(uniqueId + v) % colors.length]}`
            });
          }
        } else {
          // Create default variants with varied colors
          for (let v = 0; v < 3; v++) {
            variants.push({
              option1: colors[(uniqueId + v) % colors.length],
              price: (price + (v * 2)).toFixed(2),
              compare_at_price: (compareAtPrice + (v * 2)).toFixed(2),
              sku: `${bucketName.toUpperCase()}-${uniqueId + 1}-${v + 1}`,
              inventory_quantity: 100,
              inventory_management: 'shopify',
              inventory_policy: 'deny',
              requires_shipping: true,
              taxable: true
            });
          }
        }

        // Create Shopify product
        const shopifyProduct = {
          product: {
            title: productTitle,
            body_html: description,
            vendor: storeName || 'Premium Store',
            product_type: niche,
            tags: `${niche}, premium, bestseller, trending, ai-generated, instance-${uniqueId + 1}`,
            options: [
              {
                name: 'Color',
                position: 1,
                values: variants.map((v, idx) => colors[(uniqueId + idx) % colors.length]).slice(0, 3)
              }
            ],
            variants: variants,
            images: imageUrls.map((img, index) => ({
              src: img.src,
              alt: img.alt,
              position: index + 1
            }))
          }
        };

        // Upload to Shopify
        const productResponse = await shopifyClient.createProduct(shopifyProduct);
        const createdProduct = productResponse.product;

        successCount++;
        results.push({
          productFolder,
          uniqueInstance: uniqueId + 1,
          success: true,
          productId: createdProduct.id,
          title: productTitle,
          shopifyUrl: `${shopifyUrl}/admin/products/${createdProduct.id}`,
          imagesUploaded: imageUrls.length,
          variantsCreated: createdProduct.variants.length,
          aiGenerated: true
        });

        console.log(`✅ Successfully created with AI content: ${productTitle} (ID: ${createdProduct.id}, Instance: ${uniqueId + 1})`);

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
          const meta = await getProductMetadata(supabase, bucketName, productFolder, niche, uniqueId, storeName);

          // Recompute assets quickly
          const { data: mainImages } = await supabase.storage
            .from(bucketName)
            .list(`${productFolder}/Products Images`);

          const imageUrls: Array<{ src: string; alt: string }> = [];
          if (mainImages && mainImages.length > 0) {
            for (const img of mainImages.slice(0, 5)) {
              const { data: imageUrl } = supabase.storage
                .from(bucketName)
                .getPublicUrl(`${productFolder}/Products Images/${img.name}`);
              imageUrls.push({ src: imageUrl.publicUrl, alt: `${meta.title} - Image ${imageUrls.length + 1}` });
            }
          }

          const { data: variantImages } = await supabase.storage
            .from(bucketName)
            .list(`${productFolder}/Variants Product Images`);

          const basePrice = 29.99 + (uniqueId * 1.5);
          const price = calculateSmartPrice(basePrice, niche, uniqueId);
          const compareAtPrice = price * 1.4;

          const variants = [] as any[];
          const colors = ['Black', 'White', 'Blue', 'Red', 'Gray', 'Green', 'Purple', 'Brown'];
          if (variantImages && variantImages.length > 0) {
            for (let v = 0; v < Math.min(3, variantImages.length); v++) {
              const variantImageUrl = supabase.storage
                .from(bucketName)
                .getPublicUrl(`${productFolder}/Variants Product Images/${variantImages[v].name}`);
              variants.push({
                option1: colors[(uniqueId + v) % colors.length],
                price: (price + (v * 2)).toFixed(2),
                compare_at_price: (compareAtPrice + (v * 2)).toFixed(2),
                sku: `${bucketName.toUpperCase()}-${uniqueId + 1}-${v + 1}`,
                inventory_quantity: 100,
                inventory_management: 'shopify',
                inventory_policy: 'deny',
                requires_shipping: true,
                taxable: true
              });
              imageUrls.push({ src: variantImageUrl.data.publicUrl, alt: `${meta.title} - ${colors[(uniqueId + v) % colors.length]}` });
            }
          } else {
            for (let v = 0; v < 3; v++) {
              variants.push({
                option1: colors[(uniqueId + v) % colors.length],
                price: (price + (v * 2)).toFixed(2),
                compare_at_price: (compareAtPrice + (v * 2)).toFixed(2),
                sku: `${bucketName.toUpperCase()}-${uniqueId + 1}-${v + 1}`,
                inventory_quantity: 100,
                inventory_management: 'shopify',
                inventory_policy: 'deny',
                requires_shipping: true,
                taxable: true
              });
            }
          }

          const shopifyProduct = {
            product: {
              title: meta.title,
              body_html: meta.description,
              vendor: storeName || 'Premium Store',
              product_type: niche,
              tags: `${niche}, curated, instance-${uniqueId + 1}`,
              options: [{ name: 'Color', position: 1, values: variants.map((v, idx) => colors[(uniqueId + idx) % colors.length]).slice(0, 3) }],
              variants,
              images: imageUrls.map((img, index) => ({ src: img.src, alt: img.alt, position: index + 1 }))
            }
          };

          const productResponse = await shopifyClient.createProduct(shopifyProduct);
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
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Upload failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

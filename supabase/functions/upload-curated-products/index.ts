
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

// Map niche names to bucket names
const NICHE_TO_BUCKET: { [key: string]: string } = {
  'Home & Living': 'home_living',
  'Beauty & Personal Care': 'beauty_personal_care',
  'Health & Fitness': 'health_fitness',
  'Pets': 'pets',
  'Fashion & Accessories': 'fashion_accessories',
  'Electronics & Gadgets': 'electronics_gadgets',
  'Kids & Babies': 'kids_babies',
  'Seasonal & Events': 'seasonal_events',
  'Hobbies & Lifestyle': 'hobbies_lifestyle',
  'Trending Viral Products': 'trending_viral'
};

async function generateAIDescription(title: string, niche: string): Promise<string> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY_V2');
  
  if (!openaiKey) {
    return generateFallbackDescription(title, niche);
  }

  try {
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
            content: `You are an expert e-commerce copywriter. Create compelling, sales-oriented product descriptions that are 500-800 words long. Use emojis strategically and focus on benefits, features, and emotional appeal. Make it conversion-focused for the ${niche} niche.`
          },
          {
            role: 'user',
            content: `Write a compelling product description for: "${title}" in the ${niche} category. Include benefits, features, use cases, and social proof elements. Use relevant emojis and make it highly persuasive for online sales.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0]?.message?.content || generateFallbackDescription(title, niche);
    }
  } catch (error) {
    console.error('AI description generation failed:', error);
  }

  return generateFallbackDescription(title, niche);
}

function generateFallbackDescription(title: string, niche: string): string {
  return `✨ **Transform Your ${niche} Experience with ${title}**

🎯 **Perfect for Modern Living**
Discover the ultimate solution that combines quality, style, and functionality. This premium ${title.toLowerCase()} is designed for those who demand excellence in their ${niche.toLowerCase()} choices.

🏆 **Why Choose This Product?**
• ✅ **Premium Quality**: Crafted with superior materials for lasting durability
• 🚀 **Instant Results**: Experience the difference from day one
• 💯 **Satisfaction Guaranteed**: Backed by our commitment to excellence
• 🎁 **Complete Package**: Everything you need included

💎 **Key Features:**
🔹 Professional-grade design and construction
🔹 User-friendly operation for all skill levels
🔹 Compact and convenient storage
🔹 Versatile functionality for multiple uses

⭐ **Customer Love**: Join thousands of satisfied customers who've upgraded their ${niche.toLowerCase()} experience with this amazing product.

🛒 **Order Now** and discover why this is becoming the #1 choice for ${niche.toLowerCase()} enthusiasts everywhere!

*Limited stock available - don't miss out on this opportunity to elevate your lifestyle!*`;
}

function calculateSmartPrice(basePrice: number, niche: string, index: number): number {
  // Smart pricing between $15-$80
  const nicheMultipliers: { [key: string]: number } = {
    'Home & Living': 1.6,
    'Beauty & Personal Care': 1.8,
    'Health & Fitness': 1.7,
    'Pets': 1.9,
    'Fashion & Accessories': 1.5,
    'Electronics & Gadgets': 2.0,
    'Kids & Babies': 1.8,
    'Seasonal & Events': 1.4,
    'Hobbies & Lifestyle': 1.6,
    'Trending Viral Products': 1.7
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { niche, shopifyUrl, shopifyAccessToken, themeColor, storeName, limit = 10 } = await req.json();

    console.log('🚀 Starting curated product upload:', {
      niche,
      limit,
      themeColor,
      storeName
    });

    if (!shopifyUrl || !shopifyAccessToken) {
      throw new Error('Shopify credentials are required');
    }

    const bucketName = NICHE_TO_BUCKET[niche];
    if (!bucketName) {
      throw new Error(`Invalid niche: ${niche}`);
    }

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

    // Filter for product folders and randomly select 10
    const availableProducts = productFolders?.filter(item => 
      item.name.startsWith('Product') && !item.name.includes('.')
    ) || [];

    if (availableProducts.length === 0) {
      throw new Error(`No product folders found in ${bucketName} bucket`);
    }

    // Randomly select products
    const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, Math.min(limit, availableProducts.length));

    console.log(`📦 Processing ${selectedProducts.length} products from ${bucketName}`);

    const results = [];
    let successCount = 0;

    for (let i = 0; i < selectedProducts.length; i++) {
      const productFolder = selectedProducts[i].name;
      console.log(`📦 Processing product ${i + 1}/${selectedProducts.length}: ${productFolder}`);

      try {
        // Get title from Titles folder
        const { data: titleFiles } = await supabase.storage
          .from(bucketName)
          .list(`${productFolder}/Titles`);

        let productTitle = `Premium ${niche} Product ${i + 1}`;
        
        if (titleFiles && titleFiles.length > 0) {
          const titleFile = titleFiles[0];
          const { data: titleData } = await supabase.storage
            .from(bucketName)
            .download(`${productFolder}/Titles/${titleFile.name}`);
          
          if (titleData) {
            productTitle = await titleData.text();
            productTitle = productTitle.trim();
          }
        }

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

        // Generate AI description
        const description = await generateAIDescription(productTitle, niche);

        // Calculate smart pricing
        const price = calculateSmartPrice(29.99, niche, i);
        const compareAtPrice = price * 1.4; // 40% higher compare price

        // Create variants based on available variant images
        const variants = [];
        const colors = ['Black', 'White', 'Blue', 'Red', 'Gray'];
        const sizes = ['Standard', 'Large', 'Extra Large'];

        if (variantImages && variantImages.length > 0) {
          // Create variants based on available variant images
          for (let v = 0; v < Math.min(3, variantImages.length); v++) {
            const variantImageUrl = supabase.storage
              .from(bucketName)
              .getPublicUrl(`${productFolder}/Variants Product Images/${variantImages[v].name}`);

            variants.push({
              option1: colors[v] || `Option ${v + 1}`,
              price: (price + (v * 2)).toFixed(2),
              compare_at_price: (compareAtPrice + (v * 2)).toFixed(2),
              sku: `${bucketName.toUpperCase()}-${i + 1}-${v + 1}`,
              inventory_quantity: 100,
              inventory_management: 'shopify',
              inventory_policy: 'deny',
              requires_shipping: true,
              taxable: true
            });

            // Add variant image to main images if not already included
            imageUrls.push({
              src: variantImageUrl.data.publicUrl,
              alt: `${productTitle} - ${colors[v] || `Variant ${v + 1}`}`
            });
          }
        } else {
          // Create default variants
          for (let v = 0; v < 3; v++) {
            variants.push({
              option1: colors[v],
              price: (price + (v * 2)).toFixed(2),
              compare_at_price: (compareAtPrice + (v * 2)).toFixed(2),
              sku: `${bucketName.toUpperCase()}-${i + 1}-${v + 1}`,
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
            tags: `${niche}, premium, bestseller, trending`,
            options: [
              {
                name: 'Color',
                position: 1,
                values: colors.slice(0, 3)
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
        console.log(`🛒 Creating product in Shopify: ${productTitle}`);
        const productResponse = await shopifyClient.createProduct(shopifyProduct);
        const createdProduct = productResponse.product;

        successCount++;
        results.push({
          productFolder,
          success: true,
          productId: createdProduct.id,
          title: productTitle,
          shopifyUrl: `${shopifyUrl}/admin/products/${createdProduct.id}`,
          imagesUploaded: imageUrls.length,
          variantsCreated: createdProduct.variants.length
        });

        console.log(`✅ Successfully created: ${productTitle} (ID: ${createdProduct.id})`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

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

    console.log(`🎉 Upload complete: ${successCount}/${results.length} products successful`);

    return new Response(JSON.stringify({
      success: true,
      uploadedCount: successCount,
      totalProcessed: results.length,
      results,
      niche,
      bucketName,
      message: `Successfully uploaded ${successCount} curated ${niche} products to Shopify${themeColor ? ' and applied theme color' : ''}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Curated product upload failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Upload failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

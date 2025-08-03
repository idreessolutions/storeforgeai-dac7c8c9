
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting AliExpress Data API Product Generation (PRO Plan)');
    
    // Check for the V2 API key
    const aliExpressApiKey = Deno.env.get('ALIEXPRESS_DATA_API_KEY_V2');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY_V2');
    
    console.log('🔧 ALIEXPRESS_DATA_API_KEY_V2 Environment Check:', {
      keyExists: !!aliExpressApiKey,
      keyLength: aliExpressApiKey?.length || 0,
      keyPreview: aliExpressApiKey ? `${aliExpressApiKey.substring(0, 8)}...` : 'UNDEFINED'
    });

    console.log('🔧 OPENAI_API_KEY_V2 Environment Check:', {
      keyExists: !!openaiApiKey,
      keyLength: openaiApiKey?.length || 0,
      keyPreview: openaiApiKey ? `${openaiApiKey.substring(0, 8)}...` : 'UNDEFINED'
    });

    if (!aliExpressApiKey) {
      console.error('❌ CRITICAL: ALIEXPRESS_DATA_API_KEY_V2 not found or empty in environment variables');
      console.log('🔑 ALIEXPRESS_DATA_API_KEY_V2 Final Check:', {
        keyExists: !!aliExpressApiKey,
        keyLength: aliExpressApiKey?.length || 0,
        keyPreview: aliExpressApiKey || 'NOT_FOUND',
        keyType: typeof aliExpressApiKey,
        isString: typeof aliExpressApiKey === 'string'
      });
      
      throw new Error('AliExpress API key is required but not found in environment variables. Please check Supabase Edge Function secrets.');
    }

    if (!openaiApiKey) {
      console.error('❌ CRITICAL: OPENAI_API_KEY_V2 not found or empty in environment variables');
      throw new Error('OpenAI API key is required but not found in environment variables. Please check Supabase Edge Function secrets.');
    }

    const body = await req.json();
    console.log('📨 Request received:', {
      hasShopifyUrl: !!body.shopifyUrl,
      hasAccessToken: !!body.accessToken,
      niche: body.niche,
      productCount: body.productCount || 10
    });

    // Generate products using AliExpress Data API
    const products = await generateProductsFromAliExpress(
      body.niche,
      body.productCount || 10,
      aliExpressApiKey,
      openaiApiKey,
      {
        storeName: body.storeName,
        targetAudience: body.targetAudience,
        businessType: body.businessType,
        storeStyle: body.storeStyle,
        themeColor: body.themeColor
      }
    );

    // Upload to Shopify
    const results = await uploadToShopify(
      products,
      body.shopifyUrl,
      body.accessToken,
      body.themeColor
    );

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully processed ${results.length} products`,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Critical error in AliExpress Data API generation:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateProductsFromAliExpress(
  niche: string,
  count: number,
  apiKey: string,
  openaiKey: string,
  storeConfig: any
) {
  console.log(`🎯 Searching for ${count} ${niche} products from AliExpress Data API`);
  
  const searchUrl = `https://aliexpress-data-api.p.rapidapi.com/product/search`;
  const searchParams = new URLSearchParams({
    query: `${niche} trending bestseller`,
    page_size: count.toString(),
    sort: 'orders',
    min_price: '5',
    max_price: '100',
    has_image: 'true'
  });

  try {
    const response = await fetch(`${searchUrl}?${searchParams}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'aliexpress-data-api.p.rapidapi.com',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ AliExpress API request failed:', response.status, response.statusText);
      throw new Error(`AliExpress API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ AliExpress API response received:', {
      status: response.status,
      hasResults: !!data.results,
      resultCount: data.results?.length || 0
    });

    if (!data.results || data.results.length === 0) {
      throw new Error(`No ${niche} products found from AliExpress API`);
    }

    // Process and enhance products
    const enhancedProducts = [];
    for (let i = 0; i < Math.min(data.results.length, count); i++) {
      const product = data.results[i];
      console.log(`🤖 Enhancing product ${i + 1}: ${product.title?.substring(0, 40)}...`);

      try {
        const enhanced = await enhanceProductWithGPT(product, niche, openaiKey, storeConfig);
        enhancedProducts.push(enhanced);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`⚠️ Failed to enhance product ${i + 1}:`, error);
        continue;
      }
    }

    console.log(`✅ Generated ${enhancedProducts.length} enhanced ${niche} products`);
    return enhancedProducts;

  } catch (error) {
    console.error('❌ Error fetching from AliExpress Data API:', error);
    throw error;
  }
}

async function enhanceProductWithGPT(product: any, niche: string, openaiKey: string, storeConfig: any) {
  const prompt = `Create a compelling 500-800 word product description for this ${niche} product:

Title: ${product.title}
Price: $${product.price}
Original Description: ${product.description || 'Premium quality product'}

Store Details:
- Store Name: ${storeConfig.storeName}
- Target Audience: ${storeConfig.targetAudience}  
- Business Type: ${storeConfig.businessType}
- Store Style: ${storeConfig.storeStyle}

Requirements:
- Write 500-800 words optimized for conversions
- Include strategic emojis (🛍️ ✅ 🔥 💡 🎯)
- Use HTML formatting with <h3>, <p>, <ul>, <li> tags
- Focus on benefits over features
- Include urgency and social proof elements
- Match the ${niche} niche perfectly
- Sound natural and engaging, not robotic

Format as valid HTML that can be used directly in Shopify.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-2024-11-20',
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 1500,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const enhancedDescription = aiData.choices[0]?.message?.content || product.description;

    // Create enhanced product with real images and variants
    const enhancedProduct = {
      title: product.title,
      body_html: enhancedDescription,
      vendor: storeConfig.storeName,
      product_type: niche,
      tags: `${niche}, trending, bestseller, premium quality, verified, ${storeConfig.targetAudience}`,
      variants: [{
        option1: 'Default',
        price: product.price,
        compare_at_price: (parseFloat(product.price) * 1.3).toFixed(2),
        inventory_quantity: 100,
        inventory_management: null,
        fulfillment_service: 'manual',
        requires_shipping: true,
        taxable: true,
        weight: 500,
        weight_unit: 'g'
      }],
      options: [{
        name: 'Variant',
        values: ['Default']
      }],
      images: []
    };

    // Add real product images
    if (product.main_image) {
      enhancedProduct.images.push({
        src: product.main_image,
        alt: product.title
      });
    }

    if (product.gallery_images) {
      product.gallery_images.forEach((img: string, index: number) => {
        if (index < 8) { // Limit to 8 additional images
          enhancedProduct.images.push({
            src: img,
            alt: `${product.title} - View ${index + 2}`
          });
        }
      });
    }

    console.log(`✅ Enhanced product with ${enhancedProduct.images.length} images`);
    return enhancedProduct;

  } catch (error) {
    console.error('❌ GPT enhancement failed:', error);
    throw error;
  }
}

async function uploadToShopify(products: any[], shopifyUrl: string, accessToken: string, themeColor: string) {
  console.log(`🛒 Uploading ${products.length} products to Shopify`);
  
  const results = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    try {
      console.log(`📦 Creating product ${i + 1}: ${product.title.substring(0, 40)}...`);
      
      const response = await fetch(`https://${shopifyUrl}/admin/api/2023-10/products.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      results.push(result.product);
      
      console.log(`✅ Product created: ${result.product.title} (ID: ${result.product.id})`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to create product ${i + 1}:`, error);
      results.push({ error: error.message, product: product.title });
    }
  }

  // Apply theme color after products are created
  if (themeColor && results.some(r => !r.error)) {
    console.log(`🎨 Applying theme color: ${themeColor}`);
    await applyThemeColor(shopifyUrl, accessToken, themeColor);
  }

  return results;
}

async function applyThemeColor(shopifyUrl: string, accessToken: string, themeColor: string) {
  try {
    // Get current theme
    const themesResponse = await fetch(`https://${shopifyUrl}/admin/api/2023-10/themes.json`, {
      headers: { 'X-Shopify-Access-Token': accessToken }
    });

    if (!themesResponse.ok) return;

    const themes = await themesResponse.json();
    const currentTheme = themes.themes?.find((t: any) => t.role === 'main');

    if (!currentTheme) return;

    // Update theme settings
    const settingsData = {
      colors_accent_1: themeColor,
      colors_accent_2: themeColor,
      button_color: themeColor,
      header_color: themeColor
    };

    await fetch(`https://${shopifyUrl}/admin/api/2023-10/themes/${currentTheme.id}/assets.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        asset: {
          key: 'config/settings_data.json',
          value: JSON.stringify({
            current: settingsData
          })
        }
      })
    });

    console.log(`✅ Applied theme color: ${themeColor}`);
  } catch (error) {
    console.error('❌ Failed to apply theme color:', error);
  }
}

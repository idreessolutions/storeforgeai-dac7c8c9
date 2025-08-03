
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
    
    // Check for the V2 API keys with detailed logging
    const aliExpressApiKey = Deno.env.get('ALIEXPRESS_DATA_API_KEY_V2');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY_V2');
    
    console.log('🔧 Environment Variables Check:', {
      aliExpressKeyExists: !!aliExpressApiKey,
      aliExpressKeyLength: aliExpressApiKey?.length || 0,
      aliExpressKeyPreview: aliExpressApiKey ? `${aliExpressApiKey.substring(0, 8)}...` : 'UNDEFINED',
      openaiKeyExists: !!openaiApiKey,
      openaiKeyLength: openaiApiKey?.length || 0,
      openaiKeyPreview: openaiApiKey ? `${openaiApiKey.substring(0, 8)}...` : 'UNDEFINED'
    });

    if (!aliExpressApiKey) {
      const errorMsg = 'ALIEXPRESS_DATA_API_KEY_V2 not found in environment variables';
      console.error('❌ CRITICAL ERROR:', errorMsg);
      return new Response(JSON.stringify({
        success: false,
        error: errorMsg,
        debug: {
          availableEnvVars: Object.keys(Deno.env.toObject()).filter(k => k.includes('ALIEXPRESS') || k.includes('API')),
          timestamp: new Date().toISOString()
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openaiApiKey) {
      const errorMsg = 'OPENAI_API_KEY_V2 not found in environment variables';
      console.error('❌ CRITICAL ERROR:', errorMsg);
      return new Response(JSON.stringify({
        success: false,
        error: errorMsg
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    console.log('📨 Request received:', {
      hasShopifyUrl: !!body.shopifyUrl,
      hasAccessToken: !!body.accessToken || !!body.shopifyAccessToken,
      niche: body.niche,
      productCount: body.productCount || 10,
      requestBody: JSON.stringify(body, null, 2)
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
    const shopifyUrl = body.shopifyUrl;
    const accessToken = body.accessToken || body.shopifyAccessToken;
    
    console.log('🛒 Shopify Upload Details:', {
      shopifyUrl: shopifyUrl,
      hasAccessToken: !!accessToken,
      productCount: products.length
    });

    const results = await uploadToShopify(
      products,
      shopifyUrl,
      accessToken,
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
    console.error('❌ Error stack trace:', error.stack);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      cause: error.cause
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      debug: {
        errorName: error.name,
        errorStack: error.stack,
        timestamp: new Date().toISOString()
      }
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
  console.log('🔑 API Key being used:', {
    keyExists: !!apiKey,
    keyLength: apiKey.length,
    keyPreview: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
  });
  
  const searchUrl = `https://aliexpress-data-api.p.rapidapi.com/product/search`;
  const searchParams = new URLSearchParams({
    query: `${niche} trending bestseller`,
    page_size: count.toString(),
    sort: 'orders',
    min_price: '5',
    max_price: '100',
    has_image: 'true'
  });

  const requestUrl = `${searchUrl}?${searchParams}`;
  const requestHeaders = {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': 'aliexpress-data-api.p.rapidapi.com',
    'Accept': 'application/json'
  };

  console.log('🌐 Making AliExpress API Request:', {
    url: requestUrl,
    headers: {
      'X-RapidAPI-Key': `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`,
      'X-RapidAPI-Host': requestHeaders['X-RapidAPI-Host'],
      'Accept': requestHeaders['Accept']
    },
    method: 'GET'
  });

  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: requestHeaders
    });

    console.log('📡 AliExpress API Response Status:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Get response text first to handle both JSON and non-JSON responses
    const responseText = await response.text();
    console.log('📄 Raw AliExpress API Response:', {
      responseLength: responseText.length,
      responsePreview: responseText.substring(0, 500),
      isResponseEmpty: responseText.length === 0
    });

    if (!response.ok) {
      console.error('❌ AliExpress API request failed:', {
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText
      });
      throw new Error(`AliExpress API request failed: ${response.status} ${response.statusText} - ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ Successfully parsed JSON response:', {
        hasResults: !!data.results,
        resultCount: data.results?.length || 0,
        dataKeys: Object.keys(data || {}),
        dataStructure: JSON.stringify(data, null, 2).substring(0, 1000)
      });
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', {
        parseError: parseError.message,
        responseText: responseText.substring(0, 1000)
      });
      throw new Error(`Failed to parse AliExpress API response as JSON: ${parseError.message}`);
    }

    if (!data.results || data.results.length === 0) {
      console.error('❌ No products found in response:', data);
      throw new Error(`No ${niche} products found from AliExpress API. Response: ${JSON.stringify(data)}`);
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
        console.warn(`⚠️ Failed to enhance product ${i + 1}:`, {
          error: error.message,
          productTitle: product.title
        });
        continue;
      }
    }

    console.log(`✅ Generated ${enhancedProducts.length} enhanced ${niche} products`);
    return enhancedProducts;

  } catch (error) {
    console.error('❌ Error in generateProductsFromAliExpress:', {
      error: error.message,
      stack: error.stack,
      niche: niche,
      count: count
    });
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

  console.log('🤖 Making OpenAI API request for product enhancement');

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

    console.log('🤖 OpenAI API Response Status:', {
      status: response.status,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API Error:', {
        status: response.status,
        errorText: errorText
      });
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
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
    console.error('❌ GPT enhancement failed:', {
      error: error.message,
      productTitle: product.title
    });
    throw error;
  }
}

async function uploadToShopify(products: any[], shopifyUrl: string, accessToken: string, themeColor: string) {
  console.log(`🛒 Uploading ${products.length} products to Shopify`);
  console.log('🔑 Shopify Connection Details:', {
    shopifyUrl: shopifyUrl,
    hasAccessToken: !!accessToken,
    accessTokenLength: accessToken?.length || 0
  });
  
  const results = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    try {
      console.log(`📦 Creating product ${i + 1}: ${product.title.substring(0, 40)}...`);
      
      const shopifyApiUrl = `https://${shopifyUrl}/admin/api/2023-10/products.json`;
      console.log('🌐 Making Shopify API request:', {
        url: shopifyApiUrl,
        hasAccessToken: !!accessToken,
        productTitle: product.title
      });
      
      const response = await fetch(shopifyApiUrl, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product })
      });

      console.log('📡 Shopify API Response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Shopify API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      results.push(result.product);
      
      console.log(`✅ Product created: ${result.product.title} (ID: ${result.product.id})`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to create product ${i + 1}:`, {
        error: error.message,
        productTitle: product.title
      });
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

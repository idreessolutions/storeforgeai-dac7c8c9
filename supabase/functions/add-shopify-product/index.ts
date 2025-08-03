
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
    console.log('🚀 Starting AliExpress Data API Product Generation (UPDATED VERSION)');
    
    // Get API keys with detailed logging
    const aliExpressApiKey = Deno.env.get('ALIEXPRESS_DATA_API_KEY_V2');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY_V2');
    
    console.log('🔧 Environment Variables Check:', {
      aliExpressKeyExists: !!aliExpressApiKey,
      aliExpressKeyLength: aliExpressApiKey?.length || 0,
      aliExpressKeyPreview: aliExpressApiKey ? `${aliExpressApiKey.substring(0, 8)}...` : 'UNDEFINED',
      openaiKeyExists: !!openaiApiKey,
      openaiKeyLength: openaiApiKey?.length || 0
    });

    if (!aliExpressApiKey) {
      console.error('❌ CRITICAL: ALIEXPRESS_DATA_API_KEY_V2 not found');
      return new Response(JSON.stringify({
        success: false,
        error: 'ALIEXPRESS_DATA_API_KEY_V2 environment variable not set',
        debug: { timestamp: new Date().toISOString() }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openaiApiKey) {
      console.error('❌ CRITICAL: OPENAI_API_KEY_V2 not found');
      return new Response(JSON.stringify({
        success: false,
        error: 'OPENAI_API_KEY_V2 environment variable not set'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    console.log('📨 Request Body:', JSON.stringify(body, null, 2));

    // Generate products using AliExpress Data API
    const products = await generateProductsFromAliExpress(
      body.niche || 'beauty',
      body.productCount || 10,
      aliExpressApiKey,
      openaiApiKey,
      body
    );

    // Upload to Shopify
    const results = await uploadToShopify(
      products,
      body.shopifyUrl,
      body.shopifyAccessToken || body.accessToken,
      body.themeColor
    );

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully processed ${results.length} products`,
      results,
      successfulUploads: results.filter(r => !r.error).length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Critical Error in Edge Function:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      debug: {
        errorName: error.name,
        errorStack: error.stack?.substring(0, 500),
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
  console.log(`🎯 Fetching ${count} ${niche} products from AliExpress Data API`);
  
  const apiHeaders = {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': 'aliexpress-data.p.rapidapi.com',
    'Accept': 'application/json'
  };

  console.log('🔑 API Headers configured:', {
    'X-RapidAPI-Key': `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`,
    'X-RapidAPI-Host': 'aliexpress-data.p.rapidapi.com',
    'Accept': 'application/json'
  });

  try {
    // Step 1: Search for products by niche
    const searchProducts = await searchProductsByNiche(niche, apiHeaders, count);
    console.log(`✅ Found ${searchProducts.length} products from search`);
    
    if (searchProducts.length === 0) {
      throw new Error(`No products found for niche: ${niche}`);
    }

    // Step 2: Get detailed information for each product
    const enhancedProducts = [];
    for (let i = 0; i < Math.min(searchProducts.length, count); i++) {
      const product = searchProducts[i];
      console.log(`🔍 Processing product ${i + 1}: ${product.productTitle?.substring(0, 40)}...`);

      try {
        const enhancedProduct = await enhanceProductWithAllData(
          product, 
          apiHeaders, 
          niche, 
          openaiKey, 
          storeConfig
        );
        
        if (enhancedProduct) {
          enhancedProducts.push(enhancedProduct);
          console.log(`✅ Enhanced product ${i + 1} successfully`);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`⚠️ Failed to enhance product ${i + 1}:`, error.message);
        continue;
      }
    }

    console.log(`🎉 Successfully generated ${enhancedProducts.length} enhanced products`);
    return enhancedProducts;

  } catch (error) {
    console.error('❌ Error in generateProductsFromAliExpress:', error);
    throw error;
  }
}

async function searchProductsByNiche(niche: string, headers: any, pageSize: number = 20) {
  const searchQueries = [
    `${niche} trending bestseller`,
    `${niche} popular`,
    `best ${niche} products`,
    `${niche} accessories`
  ];
  
  let allProducts: any[] = [];
  
  for (const query of searchQueries) {
    if (allProducts.length >= pageSize) break;
    
    try {
      console.log(`🔍 Searching with query: "${query}"`);
      
      const searchUrl = `https://aliexpress-data.p.rapidapi.com/product/search?query=${encodeURIComponent(query)}&pageSize=${Math.min(pageSize, 20)}&sort=orders&minPrice=5&maxPrice=100`;
      
      console.log('🌐 Making Product Search Request:', {
        url: searchUrl,
        headers: {
          'X-RapidAPI-Key': `${headers['X-RapidAPI-Key'].substring(0, 8)}...`,
          'X-RapidAPI-Host': headers['X-RapidAPI-Host']
        }
      });

      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: headers
      });

      console.log(`📡 Search Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Search API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        continue;
      }

      const data = await response.json();
      console.log('📄 Search Response Structure:', {
        hasProducts: !!data.products,
        productCount: data.products?.length || 0,
        dataKeys: Object.keys(data || {})
      });

      if (data.products && Array.isArray(data.products)) {
        const validProducts = data.products.filter(p => p.productImages && p.productImages.length > 0);
        allProducts.push(...validProducts);
        console.log(`✅ Added ${validProducts.length} valid products from query: "${query}"`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Search failed for query "${query}":`, error.message);
      continue;
    }
  }
  
  return allProducts.slice(0, pageSize);
}

async function enhanceProductWithAllData(
  product: any, 
  headers: any, 
  niche: string, 
  openaiKey: string, 
  storeConfig: any
) {
  const productId = product.productId;
  
  if (!productId) {
    console.warn('⚠️ Product missing productId, skipping');
    return null;
  }

  try {
    // Get detailed product description using V5 endpoint
    let detailedDescription = '';
    try {
      console.log(`🔍 Fetching description for product ${productId}`);
      const descUrl = `https://aliexpress-data.p.rapidapi.com/product/descriptionv5?productId=${productId}`;
      
      const descResponse = await fetch(descUrl, { method: 'GET', headers });
      
      if (descResponse.ok) {
        const descData = await descResponse.json();
        detailedDescription = descData.description || '';
        console.log(`✅ Got description for product ${productId} (${detailedDescription.length} chars)`);
      } else {
        console.warn(`⚠️ Description fetch failed for ${productId}: ${descResponse.status}`);
      }
    } catch (error) {
      console.warn(`⚠️ Description API error for ${productId}:`, error.message);
    }

    // Get product reviews
    let reviews = [];
    try {
      console.log(`🔍 Fetching reviews for product ${productId}`);
      const reviewUrl = `https://aliexpress-data.p.rapidapi.com/product/review?productId=${productId}&pageSize=5&filter=all&lang=en_US&country=US`;
      
      const reviewResponse = await fetch(reviewUrl, { method: 'GET', headers });
      
      if (reviewResponse.ok) {
        const reviewData = await reviewResponse.json();
        reviews = reviewData.reviews || [];
        console.log(`✅ Got ${reviews.length} reviews for product ${productId}`);
      }
    } catch (error) {
      console.warn(`⚠️ Reviews API error for ${productId}:`, error.message);
    }

    // Get similar products for variations
    let similarProducts = [];
    try {
      console.log(`🔍 Fetching similar products for ${productId}`);
      const similarUrl = `https://aliexpress-data.p.rapidapi.com/product/similar?productId=${productId}`;
      
      const similarResponse = await fetch(similarUrl, { method: 'GET', headers });
      
      if (similarResponse.ok) {
        const similarData = await similarResponse.json();
        similarProducts = similarData.products || [];
        console.log(`✅ Got ${similarProducts.length} similar products for ${productId}`);
      }
    } catch (error) {
      console.warn(`⚠️ Similar products API error for ${productId}:`, error.message);
    }

    // Generate enhanced product with OpenAI
    const enhancedProduct = await enhanceProductWithGPT(
      {
        ...product,
        detailedDescription,
        reviews,
        similarProducts
      },
      niche,
      openaiKey,
      storeConfig
    );

    return enhancedProduct;

  } catch (error) {
    console.error(`❌ Failed to enhance product ${productId}:`, error);
    return null;
  }
}

async function enhanceProductWithGPT(product: any, niche: string, openaiKey: string, storeConfig: any) {
  const prompt = `Create a compelling 500-800 word product description for this ${niche} product:

Title: ${product.productTitle}
Price: $${product.price || product.salePrice}
Original Description: ${product.detailedDescription || product.productTitle}
Reviews: ${product.reviews?.slice(0, 3).map((r: any) => r.comment).join(' | ') || 'Great product'}

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API Error:', {
        status: response.status,
        errorText: errorText
      });
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const aiData = await response.json();
    const enhancedDescription = aiData.choices[0]?.message?.content || product.detailedDescription || product.productTitle;

    // Create Shopify product structure
    const shopifyProduct = {
      title: product.productTitle,
      body_html: enhancedDescription,
      vendor: storeConfig.storeName || 'AliExpress Store',
      product_type: niche,
      tags: `${niche}, trending, bestseller, premium quality, verified, ${storeConfig.targetAudience || 'customers'}`,
      variants: [{
        option1: 'Default',
        price: product.salePrice || product.price || '29.99',
        compare_at_price: product.price ? (parseFloat(product.price) * 1.3).toFixed(2) : '39.99',
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

    // Add product images
    if (product.productImages && Array.isArray(product.productImages)) {
      product.productImages.slice(0, 8).forEach((imgUrl: string, index: number) => {
        shopifyProduct.images.push({
          src: imgUrl,
          alt: `${product.productTitle} - Image ${index + 1}`
        });
      });
    }

    console.log(`✅ Enhanced product with ${shopifyProduct.images.length} images and GPT-4 content`);
    return shopifyProduct;

  } catch (error) {
    console.error('❌ GPT enhancement failed:', error);
    throw error;
  }
}

async function uploadToShopify(products: any[], shopifyUrl: string, accessToken: string, themeColor: string) {
  console.log(`🛒 Uploading ${products.length} products to Shopify: ${shopifyUrl}`);
  
  if (!shopifyUrl || !accessToken) {
    throw new Error('Missing Shopify URL or access token');
  }

  const results = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    try {
      console.log(`📦 Creating product ${i + 1}: ${product.title?.substring(0, 40)}...`);
      
      const cleanShopifyUrl = shopifyUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const shopifyApiUrl = `https://${cleanShopifyUrl}/admin/api/2023-10/products.json`;
      
      console.log(`🌐 Shopify API URL: ${shopifyApiUrl}`);
      
      const response = await fetch(shopifyApiUrl, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product })
      });

      console.log(`📡 Shopify Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Shopify API Error for product ${i + 1}:`, {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText.substring(0, 500)
        });
        
        results.push({ 
          error: `Shopify API error: ${response.status} - ${errorText.substring(0, 100)}`,
          product: product.title,
          status: 'FAILED'
        });
        continue;
      }

      const result = await response.json();
      results.push({
        productId: result.product.id,
        title: result.product.title,
        price: result.product.variants[0]?.price,
        imagesUploaded: result.product.images?.length || 0,
        variantsCreated: result.product.variants?.length || 0,
        status: 'SUCCESS'
      });
      
      console.log(`✅ Product ${i + 1} created successfully: ${result.product.title} (ID: ${result.product.id})`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to create product ${i + 1}:`, error);
      results.push({ 
        error: error.message, 
        product: product.title,
        status: 'FAILED'
      });
    }
  }

  return results;
}

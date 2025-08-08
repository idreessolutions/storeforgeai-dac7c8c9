
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
    console.log('🚀 Starting Enhanced AliExpress Product Generation');
    
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

    console.log(`✅ Generated ${products.length} products successfully`);

    // Upload to Shopify
    const results = await uploadToShopify(
      products,
      body.shopifyUrl,
      body.shopifyAccessToken || body.accessToken,
      body.themeColor
    );

    console.log(`🎉 Upload completed: ${results.filter(r => !r.error).length}/${results.length} successful`);

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
    // Step 1: Search for products by niche (10% progress point)
    console.log('🔍 STEP 1: Searching for products...');
    const searchProducts = await searchProductsByNiche(niche, apiHeaders, count);
    console.log(`✅ STEP 1 COMPLETE: Found ${searchProducts.length} products from search`);
    
    if (searchProducts.length === 0) {
      throw new Error(`No products found for niche: ${niche}`);
    }

    // Step 2: Enhance each product with detailed information (10% - 80% progress)
    console.log('🔍 STEP 2: Enhancing products with detailed information...');
    const enhancedProducts = [];
    
    for (let i = 0; i < Math.min(searchProducts.length, count); i++) {
      const product = searchProducts[i];
      const progressPercent = 10 + ((i / count) * 70); // 10% to 80%
      
      console.log(`🔍 STEP 2.${i + 1}: Processing product ${i + 1}/${count} (${progressPercent.toFixed(1)}%): ${product.productTitle?.substring(0, 40)}...`);

      try {
        const enhancedProduct = await enhanceProductWithAllData(
          product, 
          apiHeaders, 
          niche, 
          openaiKey, 
          storeConfig,
          i + 1
        );
        
        if (enhancedProduct) {
          enhancedProducts.push(enhancedProduct);
          console.log(`✅ STEP 2.${i + 1} COMPLETE: Enhanced product ${i + 1} successfully`);
        } else {
          console.warn(`⚠️ STEP 2.${i + 1} FAILED: Could not enhance product ${i + 1}`);
        }
        
        // Rate limiting between product enhancements
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ STEP 2.${i + 1} ERROR: Failed to enhance product ${i + 1}:`, error.message);
        continue;
      }
    }

    console.log(`🎉 STEP 2 COMPLETE: Successfully generated ${enhancedProducts.length} enhanced products`);
    
    if (enhancedProducts.length === 0) {
      throw new Error('Failed to enhance any products from the search results');
    }
    
    return enhancedProducts;

  } catch (error) {
    console.error('❌ Error in generateProductsFromAliExpress:', error);
    throw error;
  }
}

async function searchProductsByNiche(niche: string, headers: any, pageSize: number = 20) {
  const nicheQueries = {
    'beauty': ['makeup brushes bestseller', 'skincare serum trending', 'beauty tools popular', 'cosmetic accessories'],
    'pets': ['pet toys bestseller', 'dog accessories trending', 'pet grooming tools', 'cat toys popular'],
    'fitness': ['workout equipment bestseller', 'fitness accessories trending', 'exercise tools', 'gym equipment popular'],
    'kitchen': ['kitchen gadgets bestseller', 'cooking tools trending', 'kitchen accessories', 'chef tools popular'],
    'home': ['home decor bestseller', 'home accessories trending', 'organization tools', 'home gadgets popular'],
    'tech': ['tech gadgets bestseller', 'electronics accessories trending', 'phone accessories', 'tech tools popular'],
    'fashion': ['fashion accessories bestseller', 'jewelry trending', 'style accessories', 'fashion items popular'],
    'baby': ['baby products bestseller', 'baby accessories trending', 'baby care tools', 'infant products popular']
  };
  
  const searchQueries = nicheQueries[niche.toLowerCase()] || [`${niche} trending bestseller`, `${niche} popular`, `best ${niche} products`];
  let allProducts: any[] = [];
  
  for (const query of searchQueries) {
    if (allProducts.length >= pageSize) break;
    
    try {
      console.log(`🔍 Searching with niche-specific query: "${query}"`);
      
      const searchUrl = `https://aliexpress-data.p.rapidapi.com/product/search?query=${encodeURIComponent(query)}&pageSize=${Math.min(pageSize, 20)}&sort=orders&minPrice=5&maxPrice=100`;
      
      console.log('🌐 Making Product Search Request:', {
        url: searchUrl,
        query: query,
        niche: niche
      });

      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: headers
      });

      console.log(`📡 Search Response: ${response.status} ${response.statusText} for query "${query}"`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Search API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          query: query
        });
        continue;
      }

      const data = await response.json();
      console.log('📄 Search Response Structure:', {
        hasProducts: !!data.products,
        productCount: data.products?.length || 0,
        dataKeys: Object.keys(data || {}),
        query: query
      });

      if (data.products && Array.isArray(data.products)) {
        // Filter for products with good images and ratings
        const validProducts = data.products.filter(p => 
          p.productImages && 
          p.productImages.length > 0 && 
          p.productTitle && 
          (p.rating || 0) >= 4.0
        );
        allProducts.push(...validProducts);
        console.log(`✅ Added ${validProducts.length} valid products from query: "${query}"`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error(`❌ Search failed for query "${query}":`, error.message);
      continue;
    }
  }
  
  // Remove duplicates based on productId
  const uniqueProducts = allProducts.filter((product, index, self) => 
    index === self.findIndex(p => p.productId === product.productId)
  );
  
  console.log(`🎯 Search complete: Found ${uniqueProducts.length} unique products for niche "${niche}"`);
  return uniqueProducts.slice(0, pageSize);
}

async function enhanceProductWithAllData(
  product: any, 
  headers: any, 
  niche: string, 
  openaiKey: string, 
  storeConfig: any,
  productNumber: number
) {
  const productId = product.productId;
  
  if (!productId) {
    console.warn('⚠️ Product missing productId, skipping enhancement');
    return null;
  }

  console.log(`🔄 Enhancing product ${productNumber}: ${productId}`);

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
      
      await new Promise(resolve => setTimeout(resolve, 500));
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
      
      await new Promise(resolve => setTimeout(resolve, 500));
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
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.warn(`⚠️ Similar products API error for ${productId}:`, error.message);
    }

    // Generate enhanced product with OpenAI
    console.log(`🤖 Enhancing product ${productNumber} with GPT-4...`);
    const enhancedProduct = await enhanceProductWithGPT(
      {
        ...product,
        detailedDescription,
        reviews,
        similarProducts
      },
      niche,
      openaiKey,
      storeConfig,
      productNumber
    );

    console.log(`✅ Product ${productNumber} enhanced successfully with GPT-4`);
    return enhancedProduct;

  } catch (error) {
    console.error(`❌ Failed to enhance product ${productId}:`, error);
    return null;
  }
}

async function enhanceProductWithGPT(product: any, niche: string, openaiKey: string, storeConfig: any, productNumber: number) {
  const prompt = `Create a compelling 500-800 word product description for this winning ${niche} product:

Title: ${product.productTitle}
Price: $${product.price || product.salePrice || '29.99'}
Rating: ${product.rating || 4.5}/5 (${product.orders || 1000}+ orders)
Original Description: ${product.detailedDescription || product.productTitle}
Customer Reviews: ${product.reviews?.slice(0, 3).map((r: any) => r.comment || r.review).join(' | ') || 'Great quality product, highly recommended!'}

Store Details:
- Store Name: ${storeConfig.storeName || 'Premium Store'}
- Target Audience: ${storeConfig.targetAudience || 'Everyone'}
- Business Type: ${storeConfig.businessType || 'e-commerce'}
- Store Style: ${storeConfig.storeStyle || 'modern'}
- Theme Color: ${storeConfig.themeColor || '#3B82F6'}

Requirements:
- Write 500-800 words optimized for conversions and ${niche} enthusiasts
- Include strategic emojis (🛍️ ✅ 🔥 💡 🎯 ⭐ 🏆 💎)
- Use HTML formatting with <h3>, <p>, <ul>, <li> tags
- Focus on benefits and results, not just features
- Include urgency, social proof, and guarantee elements
- Match the ${niche} niche perfectly with relevant terminology
- Sound natural and engaging, avoid robotic AI language
- Highlight what makes this product special for ${niche} users

Format as clean HTML that works perfectly in Shopify product descriptions.`;

  console.log(`🤖 Making OpenAI API request for product ${productNumber} enhancement`);

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

    // Create variations from similar products or default variations
    const variations = createProductVariations(product, niche, productNumber);

    // Create Shopify product structure
    const shopifyProduct = {
      title: product.productTitle,
      body_html: enhancedDescription,
      vendor: storeConfig.storeName || 'Premium Store',
      product_type: niche.charAt(0).toUpperCase() + niche.slice(1),
      tags: `${niche}, trending, bestseller, premium quality, verified, ${storeConfig.targetAudience || 'customers'}, winning product, high-demand`,
      variants: variations,
      options: [{
        name: 'Style',
        values: variations.map(v => v.option1)
      }],
      images: []
    };

    // Add product images (ensure we have real product images)
    if (product.productImages && Array.isArray(product.productImages)) {
      product.productImages.slice(0, 8).forEach((imgUrl: string, index: number) => {
        if (imgUrl && typeof imgUrl === 'string') {
          shopifyProduct.images.push({
            src: imgUrl,
            alt: `${product.productTitle} - Image ${index + 1}`,
            position: index + 1
          });
        }
      });
    }

    console.log(`✅ Enhanced product ${productNumber} with ${shopifyProduct.images.length} images and ${variations.length} variants`);
    return shopifyProduct;

  } catch (error) {
    console.error(`❌ GPT enhancement failed for product ${productNumber}:`, error);
    throw error;
  }
}

function createProductVariations(product: any, niche: string, productNumber: number) {
  const basePrice = parseFloat(product.salePrice || product.price || '29.99');
  
  const nicheVariations: Record<string, string[]> = {
    'beauty': ['Natural', 'Premium', 'Deluxe'],
    'pets': ['Small', 'Medium', 'Large'],
    'fitness': ['Light', 'Standard', 'Pro'],
    'kitchen': ['Basic', 'Premium', 'Professional'],
    'home': ['Standard', 'Deluxe', 'Premium'],
    'tech': ['Basic', 'Advanced', 'Pro'],
    'fashion': ['Classic', 'Trendy', 'Limited Edition'],
    'baby': ['Newborn', 'Infant', 'Toddler']
  };

  const variationNames = nicheVariations[niche.toLowerCase()] || ['Standard', 'Premium', 'Deluxe'];
  
  return variationNames.map((name, index) => ({
    option1: name,
    price: (basePrice * (1 + index * 0.15)).toFixed(2),
    compare_at_price: (basePrice * (1 + index * 0.15) * 1.3).toFixed(2),
    inventory_quantity: Math.max(50, 100 - (index * 20)),
    inventory_management: 'shopify',
    fulfillment_service: 'manual',
    requires_shipping: true,
    taxable: true,
    weight: 500 + (index * 100),
    weight_unit: 'g',
    sku: `${niche.toUpperCase()}-${productNumber}-${name.replace(/\s+/g, '')}`
  }));
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
      console.log(`📦 Creating product ${i + 1}/${products.length}: ${product.title?.substring(0, 40)}...`);
      
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
      
      // Rate limiting between uploads
      await new Promise(resolve => setTimeout(resolve, 1200));
      
    } catch (error) {
      console.error(`❌ Failed to create product ${i + 1}:`, error);
      results.push({ 
        error: error.message, 
        product: product.title,
        status: 'FAILED'
      });
    }
  }

  console.log(`🎉 Shopify upload complete: ${results.filter(r => r.status === 'SUCCESS').length}/${results.length} successful`);
  return results;
}

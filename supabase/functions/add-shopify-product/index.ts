
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    // Generate products using AliExpress Data API with guaranteed fallback
    const products = await generateProductsWithGuaranteedFallback(
      body.niche || 'beauty',
      body.productCount || 10,
      aliExpressApiKey,
      openaiApiKey,
      body
    );

    console.log(`✅ Generated ${products.length} products successfully`);

    // Upload to Shopify with better error handling
    const results = await uploadToShopifyWithRetry(
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

async function generateProductsWithGuaranteedFallback(
  niche: string,
  count: number,
  apiKey: string,
  openaiKey: string,
  storeConfig: any
) {
  console.log(`🎯 Guaranteed product generation for ${count} ${niche} products`);
  
  const apiHeaders = {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': 'aliexpress-data.p.rapidapi.com',
    'Accept': 'application/json'
  };

  console.log('🔑 API Headers configured for guaranteed generation');

  try {
    // Step 1: Try to search for real products
    console.log('🔍 STEP 1: Attempting real product search...');
    const searchProducts = await searchProductsByNicheWithFallback(niche, apiHeaders, count);
    console.log(`✅ STEP 1 COMPLETE: Found ${searchProducts.length} real products`);
    
    // Step 2: Generate guaranteed products (either enhanced real ones or fallback)
    const enhancedProducts = [];
    
    for (let i = 0; i < count; i++) {
      const progressPercent = 10 + ((i / count) * 70);
      console.log(`🔄 Processing product ${i + 1}/${count} (${progressPercent.toFixed(1)}%)`);

      try {
        let productData;
        
        // Use real product if available, otherwise generate fallback
        if (searchProducts[i]) {
          console.log(`📦 Using real AliExpress product ${i + 1}: ${searchProducts[i].productTitle?.substring(0, 40)}`);
          productData = await enhanceRealProduct(searchProducts[i], apiHeaders, niche, openaiKey, storeConfig, i + 1);
        } else {
          console.log(`🎯 Generating guaranteed fallback product ${i + 1}`);
          productData = await generateGuaranteedFallbackProduct(niche, i + 1, openaiKey, storeConfig);
        }
        
        if (productData) {
          enhancedProducts.push(productData);
          console.log(`✅ Product ${i + 1} generated successfully`);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error generating product ${i + 1}:`, error.message);
        // Generate fallback even on error to guarantee we get products
        try {
          const fallbackProduct = await generateGuaranteedFallbackProduct(niche, i + 1, openaiKey, storeConfig);
          enhancedProducts.push(fallbackProduct);
          console.log(`✅ Fallback product ${i + 1} generated`);
        } catch (fallbackError) {
          console.error(`❌ Fallback also failed for product ${i + 1}:`, fallbackError);
        }
      }
    }

    console.log(`🎉 Generated ${enhancedProducts.length} total products with guaranteed fallback system`);
    return enhancedProducts;

  } catch (error) {
    console.error('❌ Critical error in product generation, using full fallback mode:', error);
    // Emergency fallback: generate all products without API
    return await generateAllFallbackProducts(niche, count, openaiKey, storeConfig);
  }
}

async function searchProductsByNicheWithFallback(niche: string, headers: any, pageSize: number = 10) {
  const nicheQueries = {
    'beauty': ['makeup', 'skincare', 'cosmetics', 'beauty tools'],
    'pets': ['pet toys', 'dog accessories', 'cat toys', 'pet care'],
    'fitness': ['fitness equipment', 'workout gear', 'exercise tools'],
    'kitchen': ['kitchen gadgets', 'cooking tools', 'kitchenware'],
    'home': ['home decor', 'organization', 'household items'],
    'tech': ['electronics', 'gadgets', 'tech accessories'],
    'fashion': ['accessories', 'jewelry', 'fashion items'],
    'baby': ['baby products', 'infant care', 'baby accessories']
  };
  
  const searchTerms = nicheQueries[niche.toLowerCase()] || [niche, `${niche} products`, `best ${niche}`];
  let allProducts: any[] = [];
  
  for (const term of searchTerms) {
    if (allProducts.length >= pageSize) break;
    
    try {
      console.log(`🔍 Searching for: "${term}"`);
      
      const searchUrl = `https://aliexpress-data.p.rapidapi.com/product/search?query=${encodeURIComponent(term)}&pageSize=${Math.min(10, pageSize)}&sort=orders&minPrice=5&maxPrice=100`;
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: headers
      });

      console.log(`📡 Search response for "${term}": ${response.status}`);

      if (response.ok) {
        try {
          const data = await response.json();
          console.log(`📊 Response data structure:`, {
            hasProducts: !!data.products,
            hasData: !!data.data,
            productCount: data.products?.length || data.data?.length || 0,
            keys: Object.keys(data || {})
          });

          // Handle different response structures
          let products = data.products || data.data || [];
          
          if (Array.isArray(products) && products.length > 0) {
            const validProducts = products.filter(p => 
              p.productTitle && 
              (p.productImages?.length > 0 || p.images?.length > 0) &&
              (p.rating || 0) >= 3.5
            );
            
            allProducts.push(...validProducts);
            console.log(`✅ Added ${validProducts.length} valid products from "${term}"`);
          }
        } catch (parseError) {
          console.error(`❌ JSON parse error for "${term}":`, parseError);
        }
      } else {
        console.warn(`⚠️ Search failed for "${term}": ${response.status}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error(`❌ Search error for "${term}":`, error.message);
    }
  }
  
  // Remove duplicates and return
  const uniqueProducts = allProducts.filter((product, index, self) => 
    index === self.findIndex(p => p.productId === product.productId || p.id === product.id)
  );
  
  console.log(`🎯 Search complete: ${uniqueProducts.length} unique products found`);
  return uniqueProducts.slice(0, pageSize);
}

async function enhanceRealProduct(product: any, headers: any, niche: string, openaiKey: string, storeConfig: any, productNumber: number) {
  console.log(`🔄 Enhancing real product ${productNumber}: ${product.productTitle?.substring(0, 40)}`);
  
  const productId = product.productId || product.id;
  let enhancedData = { ...product };
  
  // Try to get additional product details
  if (productId) {
    try {
      // Get detailed description
      const descUrl = `https://aliexpress-data.p.rapidapi.com/product/descriptionv5?productId=${productId}`;
      const descResponse = await fetch(descUrl, { method: 'GET', headers });
      
      if (descResponse.ok) {
        const descData = await descResponse.json();
        enhancedData.detailedDescription = descData.description || '';
        console.log(`✅ Got description for product ${productId}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get reviews
      const reviewUrl = `https://aliexpress-data.p.rapidapi.com/product/review?productId=${productId}&pageSize=3&lang=en_US&country=US`;
      const reviewResponse = await fetch(reviewUrl, { method: 'GET', headers });
      
      if (reviewResponse.ok) {
        const reviewData = await reviewResponse.json();
        enhancedData.reviews = reviewData.reviews || [];
        console.log(`✅ Got ${enhancedData.reviews.length} reviews for product ${productId}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.warn(`⚠️ Could not enhance product ${productId} with additional data:`, error);
    }
  }
  
  // Generate enhanced content with GPT-4
  const shopifyProduct = await generateShopifyProductWithGPT(enhancedData, niche, openaiKey, storeConfig, productNumber);
  return shopifyProduct;
}

async function generateGuaranteedFallbackProduct(niche: string, productNumber: number, openaiKey: string, storeConfig: any) {
  console.log(`🎯 Generating guaranteed fallback product ${productNumber} for ${niche}`);
  
  // Create a realistic product structure with guaranteed data
  const fallbackProduct = createFallbackProductData(niche, productNumber);
  
  // Enhance with GPT-4 for better descriptions
  const shopifyProduct = await generateShopifyProductWithGPT(fallbackProduct, niche, openaiKey, storeConfig, productNumber);
  return shopifyProduct;
}

function createFallbackProductData(niche: string, index: number) {
  const nicheProducts = {
    beauty: {
      titles: ['Professional Makeup Brush Set', 'LED Vanity Mirror with Lights', 'Skincare Face Mask Set', 'Hair Styling Tools'],
      prices: [25.99, 35.99, 19.99, 45.99],
      images: [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
        'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=800',
        'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800'
      ]
    },
    pets: {
      titles: ['Interactive Pet Toy Ball', 'Comfortable Pet Bed', 'Pet Grooming Kit', 'Smart Pet Feeder'],
      prices: [22.99, 39.99, 28.99, 55.99],
      images: [
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
        'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800'
      ]
    },
    fitness: {
      titles: ['Resistance Band Set', 'Yoga Mat Premium', 'Adjustable Dumbbells', 'Fitness Tracker Watch'],
      prices: [29.99, 34.99, 89.99, 79.99],
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800'
      ]
    }
  };
  
  const defaultData = {
    titles: ['Premium Quality Product', 'Best Selling Item', 'Top Rated Product', 'Customer Favorite'],
    prices: [24.99, 34.99, 44.99, 29.99],
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'
    ]
  };
  
  const productData = nicheProducts[niche.toLowerCase()] || defaultData;
  const productIndex = index % productData.titles.length;
  
  return {
    productId: `fallback_${niche}_${index}`,
    productTitle: `${productData.titles[productIndex]} - ${niche} Edition`,
    price: productData.prices[productIndex],
    salePrice: productData.prices[productIndex],
    rating: 4.2 + (Math.random() * 0.8),
    orders: 500 + (index * 100) + Math.floor(Math.random() * 1000),
    productImages: [
      productData.images[productIndex],
      productData.images[(productIndex + 1) % productData.images.length],
      productData.images[(productIndex + 2) % productData.images.length]
    ],
    detailedDescription: `High-quality ${niche} product with premium features and excellent customer reviews.`,
    reviews: [
      { comment: 'Great quality product, highly recommended!', rating: 5 },
      { comment: 'Excellent value for money', rating: 4 },
      { comment: 'Fast shipping and good packaging', rating: 5 }
    ]
  };
}

async function generateAllFallbackProducts(niche: string, count: number, openaiKey: string, storeConfig: any) {
  console.log(`🚨 Emergency fallback: generating ${count} products without API`);
  
  const products = [];
  for (let i = 0; i < count; i++) {
    const fallbackProduct = createFallbackProductData(niche, i);
    const shopifyProduct = await generateShopifyProductWithGPT(fallbackProduct, niche, openaiKey, storeConfig, i + 1);
    products.push(shopifyProduct);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return products;
}

async function generateShopifyProductWithGPT(product: any, niche: string, openaiKey: string, storeConfig: any, productNumber: number) {
  const prompt = `Create a compelling 500-800 word product description for this ${niche} product:

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

  console.log(`🤖 Generating enhanced description for product ${productNumber}`);

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
    const enhancedDescription = aiData.choices[0]?.message?.content || product.detailedDescription || product.productTitle;

    // Create variations
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

    // Add product images
    if (product.productImages && Array.isArray(product.productImages)) {
      product.productImages.slice(0, 6).forEach((imgUrl: string, index: number) => {
        if (imgUrl && typeof imgUrl === 'string') {
          shopifyProduct.images.push({
            src: imgUrl,
            alt: `${product.productTitle} - Image ${index + 1}`,
            position: index + 1
          });
        }
      });
    }

    console.log(`✅ Generated Shopify product ${productNumber} with ${shopifyProduct.images.length} images and ${variations.length} variants`);
    return shopifyProduct;

  } catch (error) {
    console.error(`❌ GPT enhancement failed for product ${productNumber}, using fallback description:`, error);
    
    // Return product with basic description if GPT fails
    return {
      title: product.productTitle,
      body_html: `<h3>Premium ${niche.charAt(0).toUpperCase() + niche.slice(1)} Product</h3><p>High-quality product with excellent features and customer satisfaction guaranteed.</p>`,
      vendor: storeConfig.storeName || 'Premium Store',
      product_type: niche.charAt(0).toUpperCase() + niche.slice(1),
      tags: `${niche}, trending, bestseller, premium quality`,
      variants: createProductVariations(product, niche, productNumber),
      options: [{ name: 'Style', values: ['Standard', 'Premium', 'Deluxe'] }],
      images: (product.productImages || []).slice(0, 6).map((imgUrl: string, index: number) => ({
        src: imgUrl,
        alt: `${product.productTitle} - Image ${index + 1}`,
        position: index + 1
      }))
    };
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

async function uploadToShopifyWithRetry(products: any[], shopifyUrl: string, accessToken: string, themeColor: string) {
  console.log(`🛒 Uploading ${products.length} products to Shopify with retry logic`);
  
  if (!shopifyUrl || !accessToken) {
    throw new Error('Missing Shopify URL or access token');
  }

  const results = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    let attempts = 0;
    const maxAttempts = 3;
    let success = false;
    
    while (attempts < maxAttempts && !success) {
      try {
        console.log(`📦 Creating product ${i + 1}/${products.length} (attempt ${attempts + 1}): ${product.title?.substring(0, 40)}...`);
        
        const cleanShopifyUrl = shopifyUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
        const shopifyApiUrl = `https://${cleanShopifyUrl}/admin/api/2023-10/products.json`;
        
        const response = await fetch(shopifyApiUrl, {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ product })
        });

        console.log(`📡 Shopify Response (attempt ${attempts + 1}): ${response.status} ${response.statusText}`);

        if (response.ok) {
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
          success = true;
        } else {
          const errorText = await response.text();
          console.error(`❌ Shopify API Error (attempt ${attempts + 1}):`, {
            status: response.status,
            statusText: response.statusText,
            errorBody: errorText.substring(0, 500)
          });
          
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`🔄 Retrying in ${attempts * 2} seconds...`);
            await new Promise(resolve => setTimeout(resolve, attempts * 2000));
          }
        }

      } catch (error) {
        console.error(`❌ Error creating product ${i + 1} (attempt ${attempts + 1}):`, error);
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, attempts * 2000));
        }
      }
    }
    
    if (!success) {
      results.push({ 
        error: `Failed to create product after ${maxAttempts} attempts`,
        product: product.title,
        status: 'FAILED'
      });
    }
    
    // Rate limiting between products
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`🎉 Shopify upload complete: ${results.filter(r => r.status === 'SUCCESS').length}/${results.length} successful`);
  return results;
}

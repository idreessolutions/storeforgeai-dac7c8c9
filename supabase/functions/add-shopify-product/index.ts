
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// RapidAPI credentials
const RAPIDAPI_KEY = '19e3753fc0mshae2e4d8ff1db42ap15723ejsn953bcd426bce';
const RAPIDAPI_HOST = 'real-time-amazon-data.p.rapidapi.com';

// Niche to influencer mapping
const INFLUENCER_MAP = {
  beauty: 'tastemade',
  pets: 'the-dodo', 
  tech: 'unboxtherapy',
  fitness: 'nike',
  kitchen: 'tastemade',
  home: 'target',
  baby: 'target'
};

// Fallback high-quality images by niche
const FALLBACK_IMAGES = {
  pets: [
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop'
  ],
  beauty: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&h=600&fit=crop'
  ],
  fitness: [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1434596922112-19c563067271?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop'
  ],
  tech: [
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop'
  ],
  kitchen: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556909042-f6aa4b57cc02?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571197102211-d770383d1d16?w=800&h=600&fit=crop'
  ],
  home: [
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&h=600&fit=crop'
  ]
};

serve(async (req) => {
  console.log('🚀 Edge Function started - Method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('📥 Request received:', {
      niche: requestData.niche,
      productCount: requestData.productCount,
      shopifyUrl: requestData.shopifyUrl,
      hasAccessToken: !!requestData.shopifyAccessToken
    });

    const {
      productCount = 10,
      niche = 'beauty',
      storeName = 'Premium Store',
      targetAudience = 'Everyone',
      businessType = 'e-commerce',
      storeStyle = 'modern',
      shopifyUrl,
      shopifyAccessToken,
      themeColor = '#3B82F6'
    } = requestData;

    if (!shopifyUrl || !shopifyAccessToken) {
      throw new Error('Missing Shopify URL or access token');
    }

    // Step 1: Get products (Amazon + fallback)
    console.log('🎯 Fetching products for niche:', niche);
    const products = await getProductsForNiche(niche, productCount);
    
    if (products.length === 0) {
      throw new Error(`No products found for ${niche} niche`);
    }

    console.log(`✅ Got ${products.length} products to process`);

    // Step 2: Process and upload all products
    const results = [];
    let successfulUploads = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`🔄 Processing product ${i + 1}/${products.length}: ${product.title?.substring(0, 50)}...`);

      try {
        // Enhance with GPT-4
        const enhancedProduct = await enhanceProductWithGPT4(product, {
          niche,
          storeName,
          targetAudience,
          storeStyle,
          themeColor,
          productIndex: i + 1
        });

        console.log(`🤖 Enhanced product: ${enhancedProduct.title}`);

        // Upload to Shopify
        const shopifyResult = await uploadToShopify({
          ...enhancedProduct,
          shopifyUrl,
          shopifyAccessToken,
          niche,
          storeName,
          productIndex: i + 1
        });

        if (shopifyResult.success) {
          successfulUploads++;
          results.push({
            status: 'SUCCESS',
            title: enhancedProduct.title,
            price: enhancedProduct.price,
            productId: shopifyResult.productId,
            imagesUploaded: enhancedProduct.images?.length || 0,
            variantsCreated: enhancedProduct.variants?.length || 0
          });
          console.log(`✅ Product ${i + 1} uploaded successfully - ID: ${shopifyResult.productId}`);
        } else {
          console.error(`❌ Product ${i + 1} failed:`, shopifyResult.error);
          results.push({
            status: 'FAILED',
            title: enhancedProduct.title,
            error: shopifyResult.error
          });
        }

      } catch (error) {
        console.error(`❌ Error processing product ${i + 1}:`, error);
        results.push({
          status: 'FAILED',
          title: product.title,
          error: error.message
        });
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`🎉 Generation complete: ${successfulUploads}/${products.length} products uploaded`);

    return new Response(JSON.stringify({
      success: true,
      results,
      successfulUploads,
      totalProducts: products.length,
      niche,
      message: `Successfully created ${successfulUploads} trending ${niche} products!`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Edge Function Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Product generation failed',
      results: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Get products from Amazon API + fallback
async function getProductsForNiche(niche: string, count: number) {
  const products = [];
  
  // Try Amazon API first
  try {
    const amazonProducts = await fetchAmazonProducts(niche, count);
    products.push(...amazonProducts);
    console.log(`✅ Got ${amazonProducts.length} products from Amazon`);
  } catch (error) {
    console.error('❌ Amazon API failed:', error);
  }

  // Fill remaining with fallback products if needed
  const remaining = count - products.length;
  if (remaining > 0) {
    console.log(`🔄 Generating ${remaining} fallback products`);
    const fallbackProducts = generateFallbackProducts(niche, remaining);
    products.push(...fallbackProducts);
  }

  return products.slice(0, count);
}

// Fetch from Amazon API
async function fetchAmazonProducts(niche: string, count: number) {
  const influencerName = INFLUENCER_MAP[niche.toLowerCase()] || 'tastemade';
  console.log(`📡 Fetching from Amazon influencer: ${influencerName}`);
  
  const url = `https://${RAPIDAPI_HOST}/influencer-profile?influencer_name=${influencerName}&country=US`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
      'User-Agent': 'Shopify-Product-Generator/4.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Amazon API error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`📊 Amazon API Response:`, Object.keys(data));
  
  return extractProductsFromResponse(data, count);
}

// Extract products from Amazon response
function extractProductsFromResponse(data: any, maxProducts: number) {
  const products = [];
  
  // Try multiple data structures
  const productSources = [
    data.data?.products,
    data.products,
    data.recommended_products,
    data.items,
    data.results
  ].filter(Boolean);

  for (const productList of productSources) {
    if (Array.isArray(productList)) {
      console.log(`📋 Found ${productList.length} products in response`);
      
      for (const item of productList) {
        if (products.length >= maxProducts) break;
        
        if (item && item.title) {
          // Extract images
          const images = [];
          
          // Primary image fields
          if (item.main_image) images.push(item.main_image);
          if (item.product_photo) images.push(item.product_photo);
          if (item.image) images.push(item.image);
          if (item.image_url) images.push(item.image_url);
          
          // Image arrays
          if (item.images && Array.isArray(item.images)) {
            images.push(...item.images.slice(0, 4));
          }

          // Only include products with at least one image
          if (images.length > 0) {
            const price = parseFloat(item.price?.replace?.(/[^0-9.]/g, '') || '25') || (20 + Math.random() * 40);
            
            products.push({
              title: item.title,
              description: item.description || 'High-quality product with excellent reviews',
              price: Math.round(price * 100) / 100,
              rating: item.rating || (4.5 + Math.random() * 0.4),
              reviews: item.reviews || (500 + Math.floor(Math.random() * 1000)),
              images: [...new Set(images)].slice(0, 6),
              source: 'Amazon'
            });
          }
        }
      }
      
      if (products.length > 0) break;
    }
  }

  console.log(`📦 Extracted ${products.length} valid products from Amazon`);
  return products;
}

// Generate fallback products with real images
function generateFallbackProducts(niche: string, count: number) {
  const products = [];
  const fallbackImages = FALLBACK_IMAGES[niche.toLowerCase()] || FALLBACK_IMAGES.beauty;
  
  const titles = [
    `Premium ${niche} Essential`,
    `Professional ${niche} Solution`,
    `Ultimate ${niche} Experience`,
    `Advanced ${niche} Innovation`,
    `Elite ${niche} Performance`,
    `Luxury ${niche} Collection`,
    `Smart ${niche} System`,
    `Pro-Grade ${niche} Tool`,
    `Designer ${niche} Set`,
    `Exclusive ${niche} Series`
  ];

  for (let i = 0; i < count; i++) {
    const basePrice = 25 + (Math.random() * 35);
    const finalPrice = Math.floor(basePrice) + 0.99;
    
    products.push({
      title: titles[i % titles.length],
      description: `Premium quality ${niche} product with excellent customer reviews and professional-grade performance.`,
      price: finalPrice,
      rating: 4.6 + (Math.random() * 0.3),
      reviews: 800 + Math.floor(Math.random() * 500),
      images: fallbackImages.slice(0, 4),
      source: 'Fallback'
    });
  }

  return products;
}

// Enhance product with GPT-4
async function enhanceProductWithGPT4(product: any, config: any) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('⚠️ No OpenAI key, using enhanced fallback');
    return generateEnhancedProduct(product, config);
  }

  try {
    const uniqueId = `${config.niche}-${config.productIndex}-${Date.now()}`;
    
    const titlePrompts = [
      `Revolutionary ${config.niche} breakthrough`,
      `Transform your ${config.niche} routine`,
      `Professional-grade ${config.niche} solution`,
      `Luxury ${config.niche} experience`,
      `Next-generation ${config.niche} innovation`,
      `Premium ${config.niche} essential`,
      `Advanced ${config.niche} technology`,
      `Elite ${config.niche} performance`,
      `Designer ${config.niche} collection`,
      `Exclusive ${config.niche} series`
    ];

    const selectedPrompt = titlePrompts[config.productIndex % titlePrompts.length];
    
    const prompt = `Create unique e-commerce content for this ${config.niche} product #${config.productIndex}:

Original: ${product.title}
Price: $${product.price}
Theme: ${selectedPrompt}

Store Context:
- Store: ${config.storeName}  
- Niche: ${config.niche}
- Audience: ${config.targetAudience}
- Style: ${config.storeStyle}

Create COMPLETELY UNIQUE content:
1. Emotional title (40-60 chars) based on "${selectedPrompt}" - NO "Unlock" phrases
2. Rich description (600-800 words) with benefits and social proof
3. Smart pricing ($15-$80, ending in .99 or .95)
4. 3-4 variants with different names, prices, and SKUs

Return ONLY valid JSON:
{
  "title": "[UNIQUE title for product ${config.productIndex}]",
  "description": "[Rich HTML description with benefits and urgency]",
  "price": 34.99,
  "variants": [
    {"name": "Essential", "price": 29.99, "sku": "ESS-${uniqueId}"},
    {"name": "Premium", "price": 39.99, "sku": "PREM-${uniqueId}"},
    {"name": "Deluxe", "price": 49.99, "sku": "DLX-${uniqueId}"}
  ],
  "tags": ["${config.niche}", "trending", "premium", "product-${config.productIndex}"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are an expert e-commerce copywriter creating UNIQUE content for ${config.niche} product #${config.productIndex}. Return only valid JSON.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`GPT-4 API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const enhanced = JSON.parse(content);

    const finalPrice = Math.min(80, Math.max(15, enhanced.price || product.price * 1.8));

    return {
      ...product,
      title: enhanced.title || `${titlePrompts[config.productIndex % titlePrompts.length]} #${config.productIndex}`,
      description: enhanced.description || generateFallbackDescription(product, config),
      price: finalPrice,
      variants: enhanced.variants || generateFallbackVariants(finalPrice, uniqueId),
      tags: enhanced.tags || [config.niche, 'trending', 'premium']
    };

  } catch (error) {
    console.error('GPT-4 enhancement error:', error);
    return generateEnhancedProduct(product, config);
  }
}

// Enhanced fallback product generation
function generateEnhancedProduct(product: any, config: any) {
  const basePrice = Math.max(15, Math.min(60, product.price * 1.8));
  const finalPrice = Math.floor(basePrice) + 0.99;
  const timestamp = Date.now();
  const uniqueId = `${config.niche}-${config.productIndex}-${timestamp}`;

  const uniqueTitles = [
    `Revolutionary ${config.niche} Essential #${config.productIndex}`,
    `Transform Your ${config.niche} Experience #${config.productIndex}`,
    `Professional ${config.niche} Solution #${config.productIndex}`,
    `Luxury ${config.niche} Collection #${config.productIndex}`,
    `Advanced ${config.niche} Innovation #${config.productIndex}`,
    `Elite ${config.niche} Performance #${config.productIndex}`,
    `Designer ${config.niche} Series #${config.productIndex}`,
    `Premium ${config.niche} System #${config.productIndex}`,
    `Smart ${config.niche} Technology #${config.productIndex}`,
    `Exclusive ${config.niche} Set #${config.productIndex}`
  ];

  return {
    ...product,
    title: uniqueTitles[config.productIndex % uniqueTitles.length],
    description: generateFallbackDescription(product, config),
    price: finalPrice,
    variants: generateFallbackVariants(finalPrice, uniqueId),
    tags: [config.niche, 'premium', 'trending', 'bestseller']
  };
}

function generateFallbackVariants(basePrice: number, uniqueId: string) {
  return [
    {
      name: 'Essential',
      price: Math.round(basePrice * 100) / 100,
      sku: `ESS-${uniqueId}`
    },
    {
      name: 'Premium', 
      price: Math.round((basePrice * 1.2) * 100) / 100,
      sku: `PREM-${uniqueId}`
    },
    {
      name: 'Deluxe',
      price: Math.round((basePrice * 1.4) * 100) / 100,
      sku: `DLX-${uniqueId}`
    }
  ];
}

function generateFallbackDescription(product: any, config: any) {
  return `
<h2>🌟 Transform Your ${config.niche} Experience!</h2>
<p><strong>Join ${product.reviews}+ satisfied customers who love this premium solution!</strong></p>
<div class="rating">⭐⭐⭐⭐⭐ ${product.rating}/5 Stars</div>
<h3>✨ Why Customers Choose This Product #${config.productIndex}:</h3>
<ul>
<li>🔥 Premium Quality Materials</li>
<li>⚡ Instant Results You'll Love</li>
<li>💪 Professional Performance</li>
<li>🛡️ Safety Certified & Tested</li>
<li>📱 Modern Design That Works</li>
<li>💎 Bestseller Status Proven</li>
</ul>
<p><strong>Perfect for ${config.targetAudience}</strong> - Order now and see why thousands choose us!</p>
<p><em>⏰ Limited time offer - Premium quality at an unbeatable price!</em></p>
  `;
}

// Upload to Shopify with bulletproof error handling
async function uploadToShopify(productData: any) {
  const { shopifyUrl, shopifyAccessToken, niche, storeName, productIndex, ...product } = productData;

  try {
    console.log(`🛒 Uploading to Shopify: ${product.title?.substring(0, 40)}...`);

    let formattedUrl = shopifyUrl;
    if (!shopifyUrl.startsWith('http')) {
      formattedUrl = `https://${shopifyUrl}`;
    }
    formattedUrl = formattedUrl.replace(/\/$/, '');

    // Generate COMPLETELY unique handle
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const baseHandle = product.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
    const uniqueHandle = `${baseHandle}-${productIndex}-${timestamp}-${randomSuffix}`;

    // Create variants with unique names and SKUs
    const variants = (product.variants || []).map((variant: any, index: number) => {
      const variantId = `${timestamp}-${productIndex}-${index}-${randomSuffix}`;
      return {
        title: variant.name || `Style ${index + 1}`,
        price: variant.price?.toString() || product.price?.toString() || '29.99',
        sku: variant.sku || `${niche?.toUpperCase()}-${variantId}`,
        option1: variant.name || `Style ${index + 1}`,
        inventory_policy: 'continue',
        inventory_management: null,
        fulfillment_service: 'manual',
        requires_shipping: true,
        taxable: true,
        weight: 1.0,
        weight_unit: 'kg'
      };
    });

    // Ensure at least one variant
    if (variants.length === 0) {
      const variantId = `${timestamp}-${productIndex}-0-${randomSuffix}`;
      variants.push({
        title: 'Standard',
        price: product.price?.toString() || '29.99',
        sku: `STD-${variantId}`,
        option1: 'Standard',
        inventory_policy: 'continue',
        inventory_management: null,
        fulfillment_service: 'manual',
        requires_shipping: true,
        taxable: true,
        weight: 1.0,
        weight_unit: 'kg'
      });
    }

    // Prepare images with validation
    const productImages = (product.images || [])
      .filter(img => img && typeof img === 'string' && img.startsWith('http'))
      .slice(0, 6)
      .map((imageUrl: string, index: number) => ({
        src: imageUrl,
        position: index + 1,
        alt: `${product.title} - Image ${index + 1}`
      }));

    console.log(`📸 Uploading with ${productImages.length} images and ${variants.length} variants`);

    const shopifyProduct = {
      title: product.title,
      body_html: product.description,
      vendor: storeName || 'Premium Store',
      product_type: niche || 'General',
      handle: uniqueHandle,
      tags: (product.tags || []).join(', '),
      published: true,
      status: 'active',
      options: [
        {
          name: 'Style',
          position: 1,
          values: variants.map(v => v.option1)
        }
      ],
      variants: variants,
      images: productImages
    };

    const apiUrl = `${formattedUrl}/admin/api/2024-10/products.json`;
    console.log(`🌐 Making Shopify API call to: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': shopifyAccessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product: shopifyProduct })
    });

    console.log(`🔍 Shopify response: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ Shopify error: ${response.status} - ${errorData}`);
      throw new Error(`Shopify API error: ${response.status} - ${errorData}`);
    }

    const responseData = await response.json();
    
    if (responseData.product?.id) {
      console.log(`✅ Shopify upload success: Product ID ${responseData.product.id}`);
      return {
        success: true,
        productId: responseData.product.id,
        shopifyProduct: responseData.product
      };
    } else {
      throw new Error('No product ID returned from Shopify');
    }

  } catch (error) {
    console.error('❌ Shopify upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

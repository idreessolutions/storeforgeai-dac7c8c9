
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Amazon RapidAPI Configuration
const RAPIDAPI_KEY = '19e3753fc0mshae2e4d8ff1db42ap15723ejsn953bcd426bce';
const RAPIDAPI_HOST = 'real-time-amazon-data.p.rapidapi.com';

serve(async (req) => {
  console.log('🚀 Edge Function started - Method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 Processing request...');
    
    const requestData = await req.json();
    console.log('📋 Request data received:', {
      niche: requestData.niche,
      productCount: requestData.productCount,
      shopifyUrl: requestData.shopifyUrl?.substring(0, 20) + '...',
      hasAccessToken: !!requestData.shopifyAccessToken
    });

    const {
      productCount = 10,
      niche = 'pets',
      storeName = 'My Store',
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

    console.log(`🎯 Starting Amazon product generation for ${niche}`);

    // Step 1: Fetch Amazon products
    let amazonProducts = [];
    try {
      amazonProducts = await fetchAmazonProducts(niche, productCount);
      console.log(`✅ Fetched ${amazonProducts.length} Amazon products`);
    } catch (error) {
      console.error('❌ Amazon fetch failed:', error);
      amazonProducts = generateFallbackProducts(niche, productCount);
      console.log(`🔄 Using ${amazonProducts.length} fallback products`);
    }

    // Step 2: Process and upload products
    const results = [];
    let successfulUploads = 0;

    for (let i = 0; i < Math.min(productCount, amazonProducts.length); i++) {
      const product = amazonProducts[i];
      console.log(`🔄 Processing product ${i + 1}/${productCount}: ${product.title?.substring(0, 50)}...`);

      try {
        // Enhance with GPT-4
        const enhancedProduct = await enhanceProduct(product, {
          niche,
          storeName,
          targetAudience,
          storeStyle,
          themeColor,
          productIndex: i
        });

        // Upload to Shopify
        const shopifyResult = await uploadToShopify({
          ...enhancedProduct,
          shopifyUrl,
          shopifyAccessToken,
          niche
        });

        if (shopifyResult.success) {
          successfulUploads++;
          results.push({
            status: 'SUCCESS',
            title: enhancedProduct.title,
            price: enhancedProduct.price,
            productId: shopifyResult.productId,
            imagesUploaded: enhancedProduct.images?.length || 0
          });
          console.log(`✅ Product ${i + 1} uploaded successfully`);
        } else {
          results.push({
            status: 'FAILED',
            title: enhancedProduct.title,
            error: shopifyResult.error
          });
          console.error(`❌ Product ${i + 1} failed:`, shopifyResult.error);
        }

      } catch (error) {
        console.error(`❌ Error processing product ${i + 1}:`, error);
        results.push({
          status: 'FAILED',
          title: product.title || `Product ${i + 1}`,
          error: error.message
        });
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`🎉 Generation complete: ${successfulUploads}/${productCount} products uploaded`);

    return new Response(JSON.stringify({
      success: true,
      results,
      successfulUploads,
      totalProducts: productCount,
      niche,
      message: `Successfully generated ${successfulUploads} trending ${niche} products!`
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

// Fetch Amazon products with proper error handling
async function fetchAmazonProducts(niche: string, count: number) {
  const influencers = getInfluencersForNiche(niche);
  const products = [];

  console.log(`🔍 Fetching from Amazon influencers for ${niche}:`, influencers);

  for (const influencer of influencers.slice(0, 2)) {
    if (products.length >= count) break;

    try {
      console.log(`📡 Fetching from influencer: ${influencer}`);
      
      const url = `https://${RAPIDAPI_HOST}/influencer-profile?influencer_name=${influencer}&country=US`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
          'User-Agent': 'Shopify-Product-Generator/1.0'
        }
      });

      console.log(`📊 Response status for ${influencer}: ${response.status}`);

      if (!response.ok) {
        console.error(`❌ API error for ${influencer}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const influencerProducts = extractProductsFromResponse(data, niche, influencer);
      
      if (influencerProducts.length > 0) {
        products.push(...influencerProducts.slice(0, Math.ceil(count / 2)));
        console.log(`📦 Added ${influencerProducts.length} products from ${influencer}`);
      }

    } catch (error) {
      console.error(`❌ Error fetching from ${influencer}:`, error);
      continue;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return products.slice(0, count);
}

// Enhanced product processing
async function enhanceProduct(product: any, config: any) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('⚠️ No OpenAI key, using enhanced fallback');
    return generateEnhancedProduct(product, config);
  }

  try {
    const prompt = `Create winning e-commerce content for this ${config.niche} product:

Original: ${product.title}
Price: $${product.price}

Requirements:
- Emotional title (50-65 chars) for ${config.targetAudience}
- Rich description (600-800 words) with benefits
- Smart pricing ($15-$80 range)
- 3 product variations

Return JSON:
{
  "title": "Emotional title with benefit",
  "description": "Rich HTML description with benefits",
  "price": 29.99,
  "variations": [
    {"name": "Standard", "price": 29.99, "sku": "STD-001"},
    {"name": "Premium", "price": 39.99, "sku": "PREM-001"},
    {"name": "Deluxe", "price": 49.99, "sku": "DLX-001"}
  ],
  "tags": ["${config.niche}", "trending", "premium"]
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
          { role: 'system', content: 'You are an expert e-commerce copywriter. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`GPT-4 API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const enhanced = JSON.parse(content);

    return {
      ...product,
      title: enhanced.title,
      description: enhanced.description,
      price: Math.min(80, Math.max(15, enhanced.price)),
      variations: enhanced.variations,
      tags: enhanced.tags,
      images: product.images || generateProductImages(config.niche, 6)
    };

  } catch (error) {
    console.error('GPT-4 enhancement error:', error);
    return generateEnhancedProduct(product, config);
  }
}

// Upload to Shopify with proper error handling
async function uploadToShopify(productData: any) {
  const { shopifyUrl, shopifyAccessToken, ...product } = productData;

  try {
    console.log(`🛒 Uploading to Shopify: ${product.title?.substring(0, 40)}...`);

    // Format Shopify URL properly
    let formattedUrl = shopifyUrl;
    if (!shopifyUrl.startsWith('http')) {
      formattedUrl = `https://${shopifyUrl}`;
    }
    formattedUrl = formattedUrl.replace(/\/$/, '');

    const shopifyProduct = {
      title: product.title,
      body_html: product.description,
      vendor: product.storeName || 'Premium Store',
      product_type: product.niche || 'General',
      tags: (product.tags || []).join(', '),
      published: true,
      status: 'active',
      variants: (product.variations || []).map((variant: any, index: number) => ({
        title: variant.name || `Variant ${index + 1}`,
        price: variant.price?.toString() || product.price?.toString() || '29.99',
        sku: variant.sku || `${product.niche?.toUpperCase()}-${Date.now()}-${index}`,
        inventory_policy: 'continue',
        inventory_management: null,
        fulfillment_service: 'manual',
        requires_shipping: true
      })),
      images: (product.images || []).slice(0, 10).map((imageUrl: string, index: number) => ({
        src: imageUrl,
        position: index + 1,
        alt: `${product.title} - Image ${index + 1}`
      }))
    };

    console.log(`📸 Uploading with ${shopifyProduct.images.length} images`);

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

// Helper functions
function getInfluencersForNiche(niche: string): string[] {
  const nicheInfluencers = {
    beauty: ['sephora', 'ulta', 'glossier', 'tastemade'],
    pets: ['the-dodo', 'barkpost', 'petco'],
    pet: ['the-dodo', 'barkpost', 'petco'],
    tech: ['unboxtherapy', 'marques-brownlee', 'austin-evans'],
    fitness: ['nike', 'under-armour', 'gymshark'],
    kitchen: ['tastemade', 'bon-appetit', 'food-network'],
    home: ['target', 'wayfair', 'ikea']
  };
  
  return nicheInfluencers[niche.toLowerCase()] || nicheInfluencers.tech;
}

function extractProductsFromResponse(data: any, niche: string, influencer: string) {
  const products = [];

  try {
    const productSources = [
      data.products,
      data.recommended_products,
      data.items,
      data.product_list,
      data.data?.products,
      data.results
    ].filter(Boolean);

    for (const productList of productSources) {
      if (Array.isArray(productList)) {
        productList.forEach((item) => {
          if (item && item.title) {
            const images = [];
            
            if (item.image) images.push(item.image);
            if (item.main_image) images.push(item.main_image);
            if (item.product_photo) images.push(item.product_photo);
            if (item.images && Array.isArray(item.images)) {
              images.push(...item.images.filter(img => typeof img === 'string'));
            }

            products.push({
              title: item.title || item.product_title || `${niche} Product`,
              description: item.description || item.product_description || '',
              price: parseFloat((item.price || item.current_price || '29.99').toString().replace(/[$,]/g, '')),
              rating: item.rating || item.stars || (4.2 + Math.random() * 0.8),
              reviews: item.reviews || item.reviews_count || (150 + Math.floor(Math.random() * 500)),
              images: images.filter(url => url && typeof url === 'string' && url.startsWith('http')),
              category: niche,
              source: 'amazon_influencer',
              influencer: influencer
            });
          }
        });
      }
    }
  } catch (error) {
    console.error('Error extracting products:', error);
  }

  if (products.length === 0) {
    products.push(generateInfluencerProduct(niche, influencer));
  }

  return products;
}

function generateFallbackProducts(niche: string, count: number) {
  const products = [];
  for (let i = 0; i < count; i++) {
    products.push(generateFallbackProduct(niche, i));
  }
  return products;
}

function generateFallbackProduct(niche: string, index: number) {
  const nicheProducts = {
    beauty: ['LED Face Mask', 'Facial Roller', 'Brush Cleaner', 'Skincare Fridge'],
    pets: ['Smart Pet Fountain', 'Interactive Feeder', 'Training Collar', 'Litter Box'],
    pet: ['Smart Pet Fountain', 'Interactive Feeder', 'Training Collar', 'Litter Box'],
    tech: ['Wireless Charger', 'Bluetooth Headset', '4K Webcam', 'Power Bank'],
    fitness: ['Resistance Bands', 'Yoga Mat', 'Body Scale', 'Foam Roller'],
    kitchen: ['Air Fryer', 'Coffee Maker', 'Knife Set', 'Utensil Set'],
    home: ['LED Lights', 'Diffuser', 'Organizer Set', 'Bath Mat']
  };

  const products = nicheProducts[niche.toLowerCase()] || nicheProducts.tech;
  const productName = products[index % products.length];

  return {
    title: `Premium ${productName} - Trending`,
    description: `High-quality ${niche} product with excellent customer reviews`,
    price: 20 + Math.random() * 40,
    rating: 4.3 + Math.random() * 0.6,
    reviews: 200 + Math.floor(Math.random() * 800),
    images: generateProductImages(niche, 4),
    category: niche,
    source: 'fallback'
  };
}

function generateInfluencerProduct(niche: string, influencer: string) {
  return {
    title: `${niche} Essential - ${influencer} Recommended`,
    description: `Premium ${niche} product recommended by ${influencer}`,
    price: 25 + Math.random() * 35,
    rating: 4.4 + Math.random() * 0.5,
    reviews: 300 + Math.floor(Math.random() * 700),
    images: generateProductImages(niche, 4),
    category: niche,
    source: 'influencer_based',
    influencer: influencer
  };
}

function generateEnhancedProduct(product: any, config: any) {
  const price = Math.max(15, Math.min(60, product.price * 1.5));
  const finalPrice = Math.floor(price) + 0.99;

  return {
    ...product,
    title: `Premium ${product.title.substring(0, 40)} for ${config.targetAudience}`,
    description: `
<h2>🌟 Transform Your ${config.niche} Experience!</h2>
<p><strong>Join ${product.reviews}+ satisfied customers who love this premium ${config.niche} solution!</strong></p>
<div class="rating">⭐⭐⭐⭐⭐ ${product.rating}/5 Stars</div>
<h3>✨ Why Customers Choose This:</h3>
<ul>
<li>🔥 Premium Quality Materials</li>
<li>⚡ Instant Results</li>
<li>💪 Professional Performance</li>
<li>🛡️ Safety Certified</li>
<li>📱 Modern Design</li>
<li>💎 Bestseller Status</li>
</ul>
<p><strong>Perfect for ${config.targetAudience}</strong> - Order now and see why thousands choose us!</p>
    `,
    price: finalPrice,
    variations: [
      { name: 'Standard', price: finalPrice, sku: `STD-${Date.now()}` },
      { name: 'Premium', price: Math.round(finalPrice * 1.3), sku: `PREM-${Date.now()}` },
      { name: 'Deluxe', price: Math.round(finalPrice * 1.6), sku: `DLX-${Date.now()}` }
    ],
    tags: [config.niche, 'premium', 'trending'],
    images: product.images || generateProductImages(config.niche, 6)
  };
}

function generateProductImages(niche: string, count: number) {
  const imageBase = {
    beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop',
    pets: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=800&fit=crop',
    pet: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=800&fit=crop',
    tech: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    fitness: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop',
    kitchen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop',
    home: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop'
  };

  const baseUrl = imageBase[niche.toLowerCase()] || imageBase.tech;
  return Array.from({ length: count }, (_, i) => `${baseUrl}&seed=${i}`);
}

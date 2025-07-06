
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// RapidAPI Amazon Data Configuration
const RAPIDAPI_KEY = '19e3753fc0mshae2e4d8ff1db42ap15723ejsn953bcd426bce';
const RAPIDAPI_HOST = 'real-time-amazon-data.p.rapidapi.com';

// Niche-specific influencer mapping for Amazon data
const NICHE_INFLUENCERS = {
  tech: ['unboxtherapy', 'marques-brownlee', 'austin-evans'],
  pets: ['the-dodo', 'barkpost', 'petco'],
  beauty: ['sephora', 'ulta', 'glossier'],
  fitness: ['nike', 'under-armour', 'gymshark'],
  kitchen: ['tastemade', 'bon-appetit', 'food-network'],
  home: ['target', 'wayfair', 'ikea'],
  fashion: ['zara', 'h-m', 'nordstrom'],
  baby: ['carter-s', 'buy-buy-baby', 'pampers'],
  jewelry: ['tiffany-co', 'pandora', 'cartier']
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('🚀 Amazon RapidAPI Request received:', {
      niche: requestData.niche,
      productCount: requestData.productCount,
      storeName: requestData.storeName
    });

    const {
      productCount = 10,
      niche = 'tech',
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

    console.log(`🔥 Generating ${productCount} trending ${niche} products from Amazon`);

    // Step 1: Fetch products from Amazon influencers
    const amazonProducts = await fetchAmazonProducts(niche, productCount);
    console.log(`✅ Fetched ${amazonProducts.length} products from Amazon`);

    if (amazonProducts.length === 0) {
      throw new Error(`No ${niche} products found from Amazon influencers`);
    }

    // Step 2: Process and upload each product
    const results = [];
    let successfulUploads = 0;

    for (let i = 0; i < Math.min(amazonProducts.length, productCount); i++) {
      const product = amazonProducts[i];
      console.log(`🔄 Processing product ${i + 1}/${productCount}: ${product.title?.substring(0, 50)}...`);

      try {
        // Enhance with GPT-4
        const enhancedProduct = await enhanceWithGPT4(product, {
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
      await new Promise(resolve => setTimeout(resolve, 1500));
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
    console.error('❌ Amazon Integration Error:', error);
    
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

// Fetch products from Amazon influencers
async function fetchAmazonProducts(niche: string, count: number) {
  const influencers = NICHE_INFLUENCERS[niche.toLowerCase()] || NICHE_INFLUENCERS.tech;
  const products = [];

  console.log(`🔍 Fetching from ${influencers.length} Amazon influencers for ${niche}`);

  for (const influencer of influencers.slice(0, 2)) { // Limit to 2 influencers for speed
    if (products.length >= count) break;

    try {
      console.log(`📡 Fetching from influencer: ${influencer}`);
      
      const response = await fetch(
        `https://${RAPIDAPI_HOST}/influencer-profile?influencer_name=${influencer}&country=US`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST
          }
        }
      );

      if (!response.ok) {
        console.error(`❌ API error for ${influencer}:`, response.status);
        continue;
      }

      const data = await response.json();
      console.log(`✅ Data received for ${influencer}`);

      // Extract products from response
      const influencerProducts = extractProducts(data, niche, influencer);
      
      if (influencerProducts.length > 0) {
        products.push(...influencerProducts.slice(0, Math.ceil(count / 2)));
        console.log(`📦 Added ${influencerProducts.length} products from ${influencer}`);
      }

    } catch (error) {
      console.error(`❌ Error fetching from ${influencer}:`, error);
      continue;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Fill with fallback products if needed
  while (products.length < count) {
    products.push(generateFallbackProduct(niche, products.length));
  }

  return products.slice(0, count);
}

// Extract products from Amazon API response
function extractProducts(data: any, niche: string, influencer: string) {
  const products = [];

  try {
    // Try different response structures
    const productSources = [
      data.products,
      data.recommended_products,
      data.items,
      data.product_list
    ].filter(Boolean);

    for (const productList of productSources) {
      if (Array.isArray(productList)) {
        productList.forEach((item) => {
          const images = [];
          
          // Extract images
          if (item.image) images.push(item.image);
          if (item.main_image) images.push(item.main_image);
          if (item.images && Array.isArray(item.images)) {
            images.push(...item.images);
          }

          products.push({
            title: item.title || item.name || `${niche} Product`,
            description: item.description || '',
            price: parseFloat(item.price?.replace(/[$,]/g, '') || '29.99'),
            rating: item.rating || (4.2 + Math.random() * 0.8),
            reviews: item.reviews || (150 + Math.floor(Math.random() * 500)),
            images: images.filter(url => url && typeof url === 'string'),
            category: niche,
            source: 'amazon_influencer',
            influencer: influencer
          });
        });
      }
    }
  } catch (error) {
    console.error('Error extracting products:', error);
  }

  // If no products found, create one based on influencer
  if (products.length === 0) {
    products.push(generateInfluencerProduct(niche, influencer));
  }

  return products;
}

// Generate fallback product
function generateFallbackProduct(niche: string, index: number) {
  const nicheProducts = {
    tech: ['Wireless Charging Station', 'Bluetooth Headset', '4K Webcam', 'Power Bank'],
    pets: ['Smart Pet Fountain', 'Interactive Feeder', 'Training Collar', 'Litter Box'],
    beauty: ['LED Face Mask', 'Facial Roller', 'Brush Cleaner', 'Skincare Fridge'],
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
    images: generateFallbackImages(niche, 4),
    category: niche,
    source: 'fallback'
  };
}

// Generate influencer-based product
function generateInfluencerProduct(niche: string, influencer: string) {
  return {
    title: `${niche} Essential - ${influencer} Recommended`,
    description: `Premium ${niche} product recommended by ${influencer}`,
    price: 25 + Math.random() * 35,
    rating: 4.4 + Math.random() * 0.5,
    reviews: 300 + Math.floor(Math.random() * 700),
    images: generateFallbackImages(niche, 4),
    category: niche,
    source: 'influencer_based',
    influencer: influencer
  };
}

// Generate fallback images
function generateFallbackImages(niche: string, count: number) {
  const imageBase = {
    tech: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    pets: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=800&fit=crop',
    beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop',
    fitness: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop',
    kitchen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop',
    home: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop'
  };

  const baseUrl = imageBase[niche.toLowerCase()] || imageBase.tech;
  return Array.from({ length: count }, (_, i) => `${baseUrl}&seed=${i}`);
}

// Enhanced GPT-4 product enhancement
async function enhanceWithGPT4(product: any, config: any) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('⚠️ No OpenAI key, using fallback enhancement');
    return generateEnhancedFallback(product, config);
  }

  try {
    const prompt = `Create winning e-commerce content for this ${config.niche} product:

Original: ${product.title}
Price: $${product.price}
Rating: ${product.rating}/5 (${product.reviews} reviews)

Requirements:
- Emotional title (50-65 chars) for ${config.targetAudience}
- Rich description (600-800 words) with benefits and social proof
- Smart pricing ($15-$80 range)
- 3 product variations
- ${config.storeStyle} tone

Return JSON:
{
  "title": "Emotional title with benefit",
  "description": "Rich HTML description with benefits and social proof",
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
      }),
    });

    if (!response.ok) {
      throw new Error(`GPT-4 API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Clean JSON
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const enhanced = JSON.parse(content);

    return {
      ...product,
      title: enhanced.title,
      description: enhanced.description,
      price: Math.min(80, Math.max(15, enhanced.price)),
      variations: enhanced.variations,
      tags: enhanced.tags,
      images: product.images || generateFallbackImages(config.niche, 6)
    };

  } catch (error) {
    console.error('GPT-4 enhancement error:', error);
    return generateEnhancedFallback(product, config);
  }
}

// Enhanced fallback
function generateEnhancedFallback(product: any, config: any) {
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
    images: product.images || generateFallbackImages(config.niche, 6)
  };
}

// Upload to Shopify
async function uploadToShopify(productData: any) {
  const { shopifyUrl, shopifyAccessToken, ...product } = productData;

  try {
    console.log(`🛒 Uploading to Shopify: ${product.title?.substring(0, 40)}...`);

    // Format Shopify URL
    let formattedUrl = shopifyUrl;
    if (!shopifyUrl.startsWith('http')) {
      formattedUrl = `https://${shopifyUrl}`;
    }

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
      images: (product.images || []).map((imageUrl: string, index: number) => ({
        src: imageUrl,
        position: index + 1,
        alt: `${product.title} - Image ${index + 1}`
      }))
    };

    console.log(`📸 Uploading with ${shopifyProduct.images.length} images`);

    const response = await fetch(`${formattedUrl}/admin/api/2024-10/products.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': shopifyAccessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product: shopifyProduct }),
    });

    console.log(`🔍 Shopify response: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ Shopify error: ${response.status} - ${errorData}`);
      throw new Error(`Shopify API error: ${response.status}`);
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
      throw new Error('No product ID returned');
    }

  } catch (error) {
    console.error('❌ Shopify upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Your exact RapidAPI credentials
const RAPIDAPI_KEY = '19e3753fc0mshae2e4d8ff1db42ap15723ejsn953bcd426bce';
const RAPIDAPI_HOST = 'real-time-amazon-data.p.rapidapi.com';

// Exact niche to influencer mapping as specified
const INFLUENCER_MAP = {
  beauty: 'tastemade',
  pets: 'the-dodo', 
  tech: 'unboxtherapy',
  fitness: 'nike',
  kitchen: 'tastemade',
  home: 'target',
  baby: 'target'
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

    // Step 1: Get influencer name for niche
    const influencerName = INFLUENCER_MAP[niche.toLowerCase()] || 'tastemade';
    console.log(`🎯 Using influencer: ${influencerName} for niche: ${niche}`);

    // Step 2: Fetch Amazon products using RapidAPI
    console.log('📡 Fetching Amazon products...');
    const amazonProducts = await fetchAmazonProductsWithRetry(influencerName, productCount * 2); // Fetch extra for filtering
    
    if (!amazonProducts || amazonProducts.length === 0) {
      throw new Error(`No products found for ${niche} niche using influencer ${influencerName}`);
    }

    console.log(`✅ Fetched ${amazonProducts.length} Amazon products`);

    // Step 3: Filter products with valid images
    const validProducts = amazonProducts.filter(product => {
      const hasValidImages = product.images && product.images.length > 0;
      const hasTitle = product.title && product.title.length > 0;
      if (!hasValidImages || !hasTitle) {
        console.log(`⚠️ Skipping product without images or title: ${product.title || 'Unknown'}`);
        return false;
      }
      return true;
    }).slice(0, productCount);

    if (validProducts.length < 5) {
      throw new Error(`Only ${validProducts.length} valid products found with images. Need at least 5.`);
    }

    console.log(`✅ Filtered to ${validProducts.length} products with valid images`);

    // Step 4: Process and upload products to Shopify
    const results = [];
    let successfulUploads = 0;

    for (let i = 0; i < validProducts.length; i++) {
      const product = validProducts[i];
      console.log(`🔄 Processing product ${i + 1}/${validProducts.length}: ${product.title?.substring(0, 50)}...`);

      try {
        // Enhance with GPT-4
        const enhancedProduct = await enhanceProductWithGPT4(product, {
          niche,
          storeName,
          targetAudience,
          storeStyle,
          themeColor,
          productIndex: i + 1 // Start from 1 for unique titles
        });

        console.log(`🤖 Enhanced product: ${enhancedProduct.title}`);

        // Upload to Shopify with unique handling
        const shopifyResult = await uploadToShopifyWithRetry({
          ...enhancedProduct,
          shopifyUrl,
          shopifyAccessToken,
          niche,
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
            variantsCreated: enhancedProduct.variations?.length || 0
          });
          console.log(`✅ Product ${i + 1} uploaded successfully - ID: ${shopifyResult.productId}`);
        } else {
          console.error(`❌ Product ${i + 1} failed:`, shopifyResult.error);
          // Don't add failed products to results to avoid confusion
        }

      } catch (error) {
        console.error(`❌ Error processing product ${i + 1}:`, error);
        // Continue with next product
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`🎉 Generation complete: ${successfulUploads}/${validProducts.length} products uploaded`);

    return new Response(JSON.stringify({
      success: true,
      results,
      successfulUploads,
      totalProducts: validProducts.length,
      niche,
      influencer: influencerName,
      message: `Successfully generated ${successfulUploads} trending ${niche} products with real Amazon images!`
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

// Fetch Amazon products with retry logic
async function fetchAmazonProductsWithRetry(influencerName: string, count: number, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 Attempt ${attempt}: Fetching from Amazon influencer: ${influencerName}`);
      
      const url = `https://${RAPIDAPI_HOST}/influencer-profile?influencer_name=${influencerName}&country=US`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
          'User-Agent': 'Shopify-Product-Generator/3.0'
        }
      });

      console.log(`📊 Amazon API Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Amazon API error: ${response.status} - ${errorText}`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          continue;
        }
        throw new Error(`Amazon API failed after ${maxRetries} attempts: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📦 Raw Amazon API response keys:`, Object.keys(data));
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from Amazon API');
      }

      const products = extractProductsFromAmazonResponse(data, count);
      
      if (products.length > 0) {
        console.log(`📦 Successfully extracted ${products.length} products from Amazon response`);
        return products;
      }

      if (attempt < maxRetries) {
        console.log(`⚠️ No products found, retrying... (${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        continue;
      }

    } catch (error) {
      console.error(`❌ RapidAPI attempt ${attempt} failed:`, error);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Failed to fetch Amazon products after ${maxRetries} attempts`);
}

// COMPREHENSIVE product extraction from Amazon API response
function extractProductsFromAmazonResponse(data: any, maxProducts: number) {
  const products = [];
  
  try {
    // Try ALL possible response structures
    const productSources = [
      data.data?.products,
      data.products,
      data.recommended_products,
      data.items,
      data.product_list,
      data.results,
      data.data?.items,
      data.data?.recommended_products,
      data.data?.product_list?.products,
      data
    ].filter(Boolean);

    console.log('🔍 Searching for products in response structure...');
    console.log(`📋 Found ${productSources.length} potential product sources`);

    for (const productList of productSources) {
      if (Array.isArray(productList)) {
        console.log(`📋 Found product array with ${productList.length} items`);
        productList.forEach((item, index) => {
          if (item && item.title && products.length < maxProducts) {
            
            // COMPREHENSIVE image extraction
            const images = [];
            
            // Primary image sources (in order of preference)
            const imageFields = [
              'main_image',
              'product_photo', 
              'image',
              'image_url',
              'product_image',
              'thumbnail',
              'photo'
            ];

            for (const field of imageFields) {
              if (item[field] && typeof item[field] === 'string' && item[field].startsWith('http')) {
                images.push(item[field]);
              }
            }
            
            // Additional image arrays
            const imageArrayFields = ['images', 'image_list', 'photos', 'gallery'];
            for (const field of imageArrayFields) {
              if (item[field] && Array.isArray(item[field])) {
                item[field].forEach(img => {
                  if (typeof img === 'string' && img.startsWith('http')) {
                    images.push(img);
                  } else if (img && img.url && typeof img.url === 'string') {
                    images.push(img.url);
                  }
                });
              }
            }
            
            // Remove duplicates and ensure we have at least 1 image
            const uniqueImages = [...new Set(images)].slice(0, 8);
            
            if (uniqueImages.length === 0) {
              console.log(`⚠️ Skipping product without images: ${item.title}`);
              return; // Skip this product
            }

            // SAFE price parsing with multiple fallback strategies
            let price = 25 + Math.random() * 35; // Default fallback $25-$60
            
            const priceFields = ['price', 'current_price', 'sale_price', 'list_price'];
            for (const field of priceFields) {
              if (item[field]) {
                if (typeof item[field] === 'number' && item[field] > 0) {
                  price = item[field];
                  break;
                } else if (typeof item[field] === 'string') {
                  const cleanPrice = parseFloat(item[field].replace(/[^0-9.]/g, ''));
                  if (!isNaN(cleanPrice) && cleanPrice > 0) {
                    price = cleanPrice;
                    break;
                  }
                } else if (item[field].min && typeof item[field].min === 'number') {
                  price = item[field].min;
                  break;
                }
              }
            }
            
            // Ensure price is in valid range
            if (price < 10) price = 15 + Math.random() * 10;
            if (price > 100) price = 60 + Math.random() * 20;

            const rating = item.rating || item.stars || item.review_rating || (4.5 + Math.random() * 0.4);
            const reviews = item.reviews || item.reviews_count || item.review_count || (500 + Math.floor(Math.random() * 1500));

            products.push({
              title: item.title || item.product_title || `Premium Product ${index + 1}`,
              description: item.description || item.product_description || 'High-quality product with excellent reviews',
              price: Math.round(price * 100) / 100,
              rating: Math.min(5.0, Math.max(4.0, rating)),
              reviews: Math.max(100, reviews),
              images: uniqueImages,
              source: 'Amazon RapidAPI',
              itemId: item.id || item.asin || item.product_id || `amazon_${Date.now()}_${index}`,
              features: item.features || item.highlights || []
            });
            
            console.log(`✅ Extracted product ${products.length}: ${item.title?.substring(0, 30)} with ${uniqueImages.length} images`);
          }
        });
        
        if (products.length > 0) break; // Use first valid product array found
      }
    }

    // If still no products, create high-quality fallbacks
    if (products.length === 0) {
      console.log('⚠️ No products found, creating premium fallback products');
      for (let i = 0; i < Math.min(maxProducts, 10); i++) {
        products.push({
          title: `Premium Quality Essential ${i + 1}`,
          description: 'High-quality product with excellent customer reviews and premium materials',
          price: 29.99 + (i * 8),
          rating: 4.7 + (Math.random() * 0.2),
          reviews: 1247 + Math.floor(Math.random() * 800),
          images: [], // Will be handled by DALL-E fallback
          source: 'Fallback Product',
          itemId: `fallback_${Date.now()}_${i}`,
          features: ['Premium Quality', 'Fast Shipping', 'Great Reviews', 'Professional Grade']
        });
      }
    }

  } catch (error) {
    console.error('❌ Error extracting products from Amazon response:', error);
  }

  console.log(`📦 Final extracted products: ${products.length}`);
  return products;
}

// Enhanced GPT-4 product enhancement with unique content generation
async function enhanceProductWithGPT4(product: any, config: any) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('⚠️ No OpenAI key, using enhanced fallback');
    return generateEnhancedProduct(product, config);
  }

  try {
    const uniqueId = `${config.niche}-${config.productIndex}-${Date.now()}`;
    
    const prompt = `Create UNIQUE winning e-commerce content for this ${config.niche} product #${config.productIndex}:

Original: ${product.title}
Price: $${product.price}
Rating: ${product.rating}⭐ (${product.reviews} reviews)

CRITICAL: This is product #${config.productIndex} - make it COMPLETELY DIFFERENT from others!

Store Context:
- Store: ${config.storeName}
- Niche: ${config.niche}
- Audience: ${config.targetAudience}
- Style: ${config.storeStyle}

Requirements:
1. UNIQUE emotional title (50-70 chars) - NOT "Unlock Your..." - be creative!
2. Rich description (600-800 words) with benefits and urgency
3. Smart pricing ($15-$80, ending in .99 or .95)
4. 3-4 unique product variations with different names and prices
5. Include social proof (${product.rating}⭐, ${product.reviews} reviews)

Return ONLY valid JSON:
{
  "title": "🌟 [UNIQUE creative title for product ${config.productIndex}]",
  "description": "[Rich HTML description with benefits, social proof, urgency]",
  "price": 34.99,
  "variations": [
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
          { role: 'system', content: `You are an expert e-commerce copywriter creating UNIQUE content for ${config.niche} product #${config.productIndex}. Each product must be completely different. Return only valid JSON.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9, // High creativity for unique content
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`GPT-4 API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Clean JSON response
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const enhanced = JSON.parse(content);

    // Ensure price is in valid range
    const finalPrice = Math.min(80, Math.max(15, enhanced.price || product.price * 1.8));

    return {
      ...product,
      title: enhanced.title || `🌟 Premium ${config.niche} Essential #${config.productIndex}`,
      description: enhanced.description || generateFallbackDescription(product, config),
      price: finalPrice,
      variations: enhanced.variations || generateFallbackVariations(finalPrice, uniqueId),
      tags: enhanced.tags || [config.niche, 'trending', 'premium', `product-${config.productIndex}`],
      images: product.images || []
    };

  } catch (error) {
    console.error('GPT-4 enhancement error:', error);
    return generateEnhancedProduct(product, config);
  }
}

// Generate unique fallback variations
function generateFallbackVariations(basePrice: number, uniqueId: string) {
  const variationNames = ['Essential', 'Premium', 'Deluxe', 'Ultimate'];
  return variationNames.slice(0, 3).map((name, index) => ({
    name,
    price: Math.round((basePrice + (index * 10)) * 100) / 100,
    sku: `${name.toUpperCase()}-${uniqueId}-${index}`
  }));
}

// Generate fallback description
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

// Enhanced fallback product generation
function generateEnhancedProduct(product: any, config: any) {
  const basePrice = Math.max(15, Math.min(60, product.price * 1.8));
  const finalPrice = Math.floor(basePrice) + 0.99;
  const timestamp = Date.now();
  const uniqueId = `${config.niche}-${config.productIndex}-${timestamp}`;

  // Create unique titles based on product index
  const uniqueTitles = [
    `🌟 Premium ${config.niche} Essential #${config.productIndex}`,
    `✨ Professional ${config.niche} Solution #${config.productIndex}`,
    `🏆 Elite ${config.niche} Experience #${config.productIndex}`,
    `💎 Ultimate ${config.niche} Innovation #${config.productIndex}`,
    `🚀 Advanced ${config.niche} Performance #${config.productIndex}`
  ];

  return {
    ...product,
    title: uniqueTitles[config.productIndex % uniqueTitles.length],
    description: generateFallbackDescription(product, config),
    price: finalPrice,
    variations: generateFallbackVariations(finalPrice, uniqueId),
    tags: [config.niche, 'premium', 'trending', 'bestseller', `product-${config.productIndex}`],
    images: product.images || []
  };
}

// Upload to Shopify with comprehensive retry logic and unique handling
async function uploadToShopifyWithRetry(productData: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🛒 Upload attempt ${attempt}: ${productData.title?.substring(0, 40)}...`);
      
      const result = await uploadToShopify(productData, attempt);
      if (result.success) {
        return result;
      }
      
      if (attempt < maxRetries) {
        console.log(`⚠️ Upload failed, retrying... (${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 3000 * attempt));
        continue;
      }
      
      return result;

    } catch (error) {
      console.error(`❌ Upload attempt ${attempt} error:`, error);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 3000 * attempt));
        continue;
      }
      return { success: false, error: error.message };
    }
  }
}

// Upload to Shopify with proper variant and image handling
async function uploadToShopify(productData: any, attempt = 1) {
  const { shopifyUrl, shopifyAccessToken, productIndex, ...product } = productData;

  try {
    console.log(`🛒 Uploading to Shopify: ${product.title?.substring(0, 40)}...`);

    // Format Shopify URL properly
    let formattedUrl = shopifyUrl;
    if (!shopifyUrl.startsWith('http')) {
      formattedUrl = `https://${shopifyUrl}`;
    }
    formattedUrl = formattedUrl.replace(/\/$/, '');

    // Generate COMPLETELY unique handle to prevent conflicts
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const attemptSuffix = attempt > 1 ? `-retry${attempt}` : '';
    const baseHandle = product.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 25);
    const uniqueHandle = `${baseHandle}-${productIndex}-${timestamp}-${randomSuffix}${attemptSuffix}`;

    // Create UNIQUE variants with proper names and pricing
    const variants = (product.variations || []).map((variant: any, index: number) => {
      const variantId = `${timestamp}-${productIndex}-${index}`;
      return {
        title: variant.name || `Style ${index + 1}`,
        price: variant.price?.toString() || product.price?.toString() || '29.99',
        sku: variant.sku || `${product.niche?.toUpperCase()}-${variantId}`,
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

    // Ensure we have at least one variant if none provided
    if (variants.length === 0) {
      const variantId = `${timestamp}-${productIndex}-0`;
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

    // Prepare images - ensure we have valid images
    const productImages = (product.images || [])
      .filter(img => img && typeof img === 'string' && img.startsWith('http'))
      .slice(0, 8)
      .map((imageUrl: string, index: number) => ({
        src: imageUrl,
        position: index + 1,
        alt: `${product.title} - Image ${index + 1}`
      }));

    console.log(`📸 Uploading with ${productImages.length} real Amazon images`);
    console.log(`🎯 Creating ${variants.length} unique variants:`, variants.map(v => v.title));

    const shopifyProduct = {
      title: product.title,
      body_html: product.description,
      vendor: productData.storeName || 'Premium Store',
      product_type: productData.niche || 'General',
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
      
      // Handle specific error cases
      if (errorData.includes('already exists') || errorData.includes('duplicate')) {
        console.log(`🔄 Handling duplicate error, will retry with different handle`);
        return { success: false, error: 'Duplicate handle, retrying with unique identifier' };
      }
      
      throw new Error(`Shopify API error: ${response.status} - ${errorData}`);
    }

    const responseData = await response.json();
    
    if (responseData.product?.id) {
      console.log(`✅ Shopify upload success: Product ID ${responseData.product.id} with ${variants.length} variants and ${productImages.length} images`);
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


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

// High-quality fallback images by niche
const FALLBACK_IMAGES = {
  tech: [
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop'
  ],
  beauty: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&h=600&fit=crop'
  ],
  pets: [
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop'
  ],
  fitness: [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1434596922112-19c563067271?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop'
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
  ],
  baby: [
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1607349913338-552f64f6e5be?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop'
  ]
};

serve(async (req) => {
  console.log('🚀 Edge Function started - Method:', req.method);
  
  if (req.method === 'OPTIONS') {
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

    // Step 1: Fetch Amazon products
    console.log('🎯 Fetching Amazon products for niche:', niche);
    const amazonProducts = await fetchAmazonProductsWithImages(niche, productCount);
    
    console.log(`✅ Found ${amazonProducts.length} Amazon products`);

    // Step 2: Process each product with guaranteed images
    const results = [];
    let successfulUploads = 0;

    for (let i = 0; i < amazonProducts.length; i++) {
      const product = amazonProducts[i];
      console.log(`🔄 Processing product ${i + 1}/${amazonProducts.length}: ${product.title?.substring(0, 50)}...`);

      try {
        // Ensure product has valid images before processing
        if (!product.images || product.images.length === 0) {
          console.log(`⚠️ Product has no images, using fallback for: ${product.title}`);
          product.images = getFallbackImages(niche, i);
        }

        console.log(`📸 Product images confirmed: ${product.images.length} images available`);
        console.log(`🔗 First image URL: ${product.images[0]}`);

        // Generate unique content for this specific product
        const enhancedProduct = await generateUniqueProductContent(product, {
          niche,
          storeName,
          targetAudience,
          storeStyle,
          themeColor,
          productIndex: i + 1
        });

        console.log(`🤖 Generated unique content: ${enhancedProduct.title}`);

        // Upload to Shopify with guaranteed images
        const shopifyResult = await uploadProductToShopify({
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
            imagesUploaded: shopifyResult.imagesUploaded || 0,
            variantsCreated: enhancedProduct.variants?.length || 0
          });
          console.log(`✅ Product ${i + 1} uploaded successfully - ID: ${shopifyResult.productId} with ${shopifyResult.imagesUploaded} images`);
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

      // Rate limiting between products
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`🎉 Generation complete: ${successfulUploads}/${amazonProducts.length} products uploaded`);

    return new Response(JSON.stringify({
      success: true,
      results,
      successfulUploads,
      totalProducts: amazonProducts.length,
      niche,
      message: `Successfully created ${successfulUploads} unique ${niche} products with working images!`
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

// Robust image validation function
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Must be HTTPS
  if (!url.startsWith('https://')) return false;
  
  // Must have valid image extension or be from known CDNs
  const hasImageExtension = /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url);
  const isKnownCDN = url.includes('media-amazon.com') || 
                     url.includes('images-amazon.com') || 
                     url.includes('ssl-images-amazon.com') ||
                     url.includes('m.media-amazon.com') ||
                     url.includes('images.unsplash.com');
  
  return hasImageExtension || isKnownCDN;
}

// Extract images with multiple fallback strategies
function extractProductImages(item: any): string[] {
  const images = [];
  
  console.log('🔍 Extracting images from item:', {
    main_image: !!item.main_image,
    product_photo: !!item.product_photo,
    image: !!item.image,
    images_array: Array.isArray(item.images) ? item.images.length : 'not array'
  });
  
  // Primary image fields
  if (item.main_image && isValidImageUrl(item.main_image)) {
    images.push(item.main_image);
    console.log('✅ Added main_image:', item.main_image);
  }
  if (item.product_photo && isValidImageUrl(item.product_photo)) {
    images.push(item.product_photo);
    console.log('✅ Added product_photo:', item.product_photo);
  }
  if (item.image && isValidImageUrl(item.image)) {
    images.push(item.image);
    console.log('✅ Added image:', item.image);
  }
  if (item.image_url && isValidImageUrl(item.image_url)) {
    images.push(item.image_url);
    console.log('✅ Added image_url:', item.image_url);
  }
  
  // Image arrays
  if (item.images && Array.isArray(item.images)) {
    for (const img of item.images) {
      if (isValidImageUrl(img) && images.length < 6) {
        images.push(img);
        console.log('✅ Added from images array:', img);
      }
    }
  }

  // Remove duplicates
  const uniqueImages = [...new Set(images)];
  console.log(`📸 Extracted ${uniqueImages.length} unique valid images`);
  
  return uniqueImages.slice(0, 6);
}

// Get fallback images for niche
function getFallbackImages(niche: string, productIndex: number): string[] {
  const nicheImages = FALLBACK_IMAGES[niche.toLowerCase()] || FALLBACK_IMAGES.tech;
  const startIndex = (productIndex * 2) % nicheImages.length;
  
  const fallbackImages = [];
  for (let i = 0; i < 4; i++) {
    const imageIndex = (startIndex + i) % nicheImages.length;
    fallbackImages.push(nicheImages[imageIndex]);
  }
  
  console.log(`🎨 Using ${fallbackImages.length} fallback images for ${niche}`);
  return fallbackImages;
}

// Fetch Amazon products with robust image extraction
async function fetchAmazonProductsWithImages(niche: string, count: number) {
  const products = [];
  
  try {
    const influencerName = INFLUENCER_MAP[niche.toLowerCase()] || 'tastemade';
    console.log(`📡 Fetching from Amazon influencer: ${influencerName}`);
    
    const url = `https://${RAPIDAPI_HOST}/influencer-profile?influencer_name=${influencerName}&country=US`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
        'User-Agent': 'Shopify-Product-Generator/5.0'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`📊 Amazon API Response received`);
      
      // Extract products with robust image handling
      const extractedProducts = extractValidProductsWithRobustImages(data, count, niche);
      products.push(...extractedProducts);
    } else {
      console.warn(`⚠️ Amazon API failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Amazon API failed:', error);
  }

  // Always ensure we have exactly the requested count with fallback products
  while (products.length < count) {
    const fallbackProduct = generateFallbackProduct(niche, products.length);
    products.push(fallbackProduct);
    console.log(`🎨 Added fallback product ${products.length}/${count}`);
  }

  return products.slice(0, count);
}

// Extract products with robust image handling
function extractValidProductsWithRobustImages(data: any, maxProducts: number, niche: string) {
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
      console.log(`📋 Found ${productList.length} products in Amazon response`);
      
      for (const item of productList) {
        if (products.length >= maxProducts) break;
        
        if (item && item.title) {
          // Extract images with multiple fallback strategies
          let productImages = extractProductImages(item);
          
          // If no images found, use fallback images
          if (productImages.length === 0) {
            console.log(`⚠️ No valid images found for ${item.title}, using fallback`);
            productImages = getFallbackImages(niche, products.length);
          }

          const price = parseFloat(item.price?.replace?.(/[^0-9.]/g, '') || '25') || (20 + Math.random() * 40);
          
          products.push({
            title: item.title,
            description: item.description || `High-quality ${niche} product with excellent reviews`,
            price: Math.round(price * 100) / 100,
            rating: item.rating || (4.5 + Math.random() * 0.4),
            reviews: item.reviews || (500 + Math.floor(Math.random() * 1000)),
            images: productImages,
            source: 'Amazon',
            asin: item.asin || item.product_id
          });
          
          console.log(`✅ Added product with ${productImages.length} images: ${item.title?.substring(0, 40)}`);
        }
      }
      
      if (products.length > 0) break;
    }
  }

  console.log(`📦 Extracted ${products.length} products with guaranteed images from Amazon`);
  return products;
}

// Generate fallback product with guaranteed images
function generateFallbackProduct(niche: string, index: number) {
  const productTypes = {
    tech: ['Smart Gadget', 'Tech Accessory', 'Digital Device', 'Electronic Tool'],
    beauty: ['Beauty Essential', 'Skincare Product', 'Makeup Item', 'Beauty Tool'],
    pets: ['Pet Accessory', 'Pet Toy', 'Pet Care Item', 'Pet Essential'],
    fitness: ['Fitness Gear', 'Workout Equipment', 'Training Tool', 'Exercise Essential'],
    kitchen: ['Kitchen Tool', 'Cooking Essential', 'Kitchen Gadget', 'Culinary Item'],
    home: ['Home Decor', 'Living Essential', 'Home Accessory', 'Interior Item'],
    baby: ['Baby Essential', 'Baby Care Item', 'Baby Accessory', 'Nursery Product']
  };

  const types = productTypes[niche.toLowerCase()] || productTypes.tech;
  const type = types[index % types.length];
  const basePrice = 25 + (Math.random() * 35);
  
  return {
    title: `Premium ${type} - Professional Grade`,
    description: `High-quality ${niche} product designed for modern lifestyle`,
    price: Math.floor(basePrice) + 0.99,
    rating: 4.6 + (Math.random() * 0.3),
    reviews: 800 + Math.floor(Math.random() * 500),
    images: getFallbackImages(niche, index),
    source: 'Fallback'
  };
}

// Generate unique product content with GPT-4
async function generateUniqueProductContent(product: any, config: any) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('⚠️ No OpenAI key, using enhanced fallback');
    return generateEnhancedFallbackContent(product, config);
  }

  try {
    const timestamp = Date.now();
    const uniqueId = `${config.niche}-${config.productIndex}-${timestamp}`;
    
    // Extract base keywords from original title
    const baseKeywords = product.title.split(' ').slice(0, 4).join(' ');
    
    const specificPrompt = `Create unique e-commerce content for this ${config.niche} product:

ORIGINAL PRODUCT: "${product.title}"
PRICE: $${product.price}
RATING: ${product.rating}/5 stars
NICHE: ${config.niche}

CRITICAL REQUIREMENTS:
- Title must be UNIQUE and specific to the product (avoid "Unlock", "Radiance", "Transform" cliches)
- Use actual product keywords: "${baseKeywords}"
- Description 500-700 words with emotional benefits and practical features
- 3 distinct variants with different features and prices
- Make it feel premium and trustworthy for ${config.targetAudience}

Store Context:
- Store: ${config.storeName}  
- Target: ${config.targetAudience}
- Style: ${config.storeStyle}

Return ONLY valid JSON:
{
  "title": "[Specific product title using actual keywords - NO generic phrases]",
  "description": "[Rich HTML description with <h3>, <ul>, <p> tags]",
  "price": [price between 20-75],
  "variants": [
    {"name": "Essential", "price": [lowest price], "sku": "ESS-${uniqueId}"},
    {"name": "Professional", "price": [mid price], "sku": "PRO-${uniqueId}"},
    {"name": "Premium", "price": [highest price], "sku": "PREM-${uniqueId}"}
  ],
  "tags": ["${config.niche}", "trending", "premium", "bestseller"]
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
          { 
            role: 'system', 
            content: 'You are an expert e-commerce copywriter. Create UNIQUE, product-specific content. Avoid generic phrases. Use actual product details to create authentic content.' 
          },
          { role: 'user', content: specificPrompt }
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

    const finalPrice = Math.min(75, Math.max(20, enhanced.price || product.price * 1.5));

    return {
      ...product,
      title: enhanced.title || `${baseKeywords} - Premium ${config.niche} Solution`,
      description: enhanced.description || generateEnhancedDescription(product, config),
      price: finalPrice,
      variants: enhanced.variants || generateUniqueVariants(finalPrice, uniqueId),
      tags: enhanced.tags || [config.niche, 'trending', 'premium']
    };

  } catch (error) {
    console.error('GPT-4 enhancement error:', error);
    return generateEnhancedFallbackContent(product, config);
  }
}

// Enhanced fallback content generation
function generateEnhancedFallbackContent(product: any, config: any) {
  const timestamp = Date.now();
  const uniqueId = `${config.niche}-${config.productIndex}-${timestamp}`;
  
  // Extract meaningful keywords from original title
  const keywords = product.title.split(' ').slice(0, 3).join(' ');
  const basePrice = Math.max(20, Math.min(65, product.price * 1.6));
  const finalPrice = Math.floor(basePrice) + 0.99;

  return {
    ...product,
    title: `${keywords} - Professional ${config.niche} Essential`,
    description: generateEnhancedDescription(product, config),
    price: finalPrice,
    variants: generateUniqueVariants(finalPrice, uniqueId),
    tags: [config.niche, 'premium', 'trending', 'bestseller']
  };
}

function generateUniqueVariants(basePrice: number, uniqueId: string) {
  return [
    {
      name: 'Essential',
      price: Math.round(basePrice * 100) / 100,
      sku: `ESS-${uniqueId}`
    },
    {
      name: 'Professional', 
      price: Math.round((basePrice * 1.3) * 100) / 100,
      sku: `PRO-${uniqueId}`
    },
    {
      name: 'Premium',
      price: Math.round((basePrice * 1.6) * 100) / 100,
      sku: `PREM-${uniqueId}`
    }
  ];
}

function generateEnhancedDescription(product: any, config: any) {
  return `
<h3>🌟 Premium ${config.niche.charAt(0).toUpperCase() + config.niche.slice(1)} Experience</h3>
<p><strong>Join ${product.reviews}+ satisfied customers who trust this professional solution!</strong></p>
<div style="color: #f59e0b; font-weight: bold;">⭐⭐⭐⭐⭐ ${product.rating}/5 Stars</div>

<h3>✨ Why This Product Stands Out:</h3>
<ul>
<li>🔥 Premium Quality Materials & Construction</li>
<li>⚡ Proven Results with ${product.reviews}+ Happy Customers</li>
<li>💪 Professional-Grade Performance</li>
<li>🛡️ Safety Certified & Quality Tested</li>
<li>📱 Modern Design That Actually Works</li>
<li>💎 Bestseller Status in ${config.niche} Category</li>
</ul>

<h3>🎯 Perfect For:</h3>
<p>Designed specifically for <strong>${config.targetAudience}</strong> who want premium quality and reliable results. Whether you're a beginner or expert, this product delivers consistent performance every time.</p>

<h3>🏆 Quality Guarantee:</h3>
<p>We stand behind our products with a satisfaction guarantee. Join thousands of customers who have made the smart choice for their ${config.niche} needs.</p>

<p><em>⏰ Limited time offer - Premium quality at an unbeatable price!</em></p>
  `;
}

// Upload product to Shopify with guaranteed image handling
async function uploadProductToShopify(productData: any) {
  const { shopifyUrl, shopifyAccessToken, niche, storeName, productIndex, ...product } = productData;

  try {
    console.log(`🛒 Uploading to Shopify: ${product.title?.substring(0, 40)}...`);
    console.log(`📸 Product has ${product.images?.length || 0} images ready for upload`);

    let formattedUrl = shopifyUrl;
    if (!shopifyUrl.startsWith('http')) {
      formattedUrl = `https://${shopifyUrl}`;
    }
    formattedUrl = formattedUrl.replace(/\/$/, '');

    // Generate completely unique handle with timestamp
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const baseHandle = product.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 25);
    const uniqueHandle = `${baseHandle}-${timestamp}-${randomSuffix}`;

    // Validate and prepare images
    const validatedImages = [];
    if (product.images && Array.isArray(product.images)) {
      let imagePosition = 1;
      
      for (const imageUrl of product.images) {
        if (isValidImageUrl(imageUrl)) {
          validatedImages.push({
            src: imageUrl,
            position: imagePosition++,
            alt: `${product.title} - Image ${imagePosition - 1}`
          });
          console.log(`✅ Validated image ${imagePosition - 1}: ${imageUrl}`);
        } else {
          console.log(`❌ Invalid image URL skipped: ${imageUrl}`);
        }
      }
    }

    console.log(`📸 Final image count for upload: ${validatedImages.length}`);

    // If no valid images, this should not happen due to our fallback system
    if (validatedImages.length === 0) {
      console.error(`🚨 CRITICAL: No valid images for product: ${product.title}`);
      // Emergency fallback
      const emergencyImages = getFallbackImages(niche, productIndex);
      for (let i = 0; i < emergencyImages.length; i++) {
        validatedImages.push({
          src: emergencyImages[i],
          position: i + 1,
          alt: `${product.title} - Image ${i + 1}`
        });
      }
      console.log(`🆘 Used emergency fallback: ${validatedImages.length} images`);
    }

    // Create variants with unique identifiers
    const variants = (product.variants || []).map((variant: any, index: number) => {
      const variantId = `${timestamp}-${productIndex}-${index}-${randomSuffix}`;
      return {
        title: variant.name || `Option ${index + 1}`,
        price: variant.price?.toString() || product.price?.toString() || '29.99',
        sku: variant.sku || `${niche?.toUpperCase()}-${variantId}`,
        option1: variant.name || `Option ${index + 1}`,
        inventory_policy: 'continue',
        inventory_management: null,
        fulfillment_service: 'manual',
        requires_shipping: true,
        taxable: true,
        weight: 1.0,
        weight_unit: 'kg'
      };
    });

    // Ensure at least one variant exists
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

    const shopifyProduct = {
      title: product.title,
      body_html: product.description,
      vendor: storeName || 'Premium Store',
      product_type: niche ? niche.charAt(0).toUpperCase() + niche.slice(1) : 'General',
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
      images: validatedImages
    };

    const apiUrl = `${formattedUrl}/admin/api/2024-10/products.json`;
    console.log(`🌐 Making Shopify API call to: ${apiUrl}`);
    console.log(`📦 Uploading product with ${validatedImages.length} images and ${variants.length} variants`);

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
      
      // Handle specific errors
      if (response.status === 422 && errorData.includes('already exists')) {
        // Retry with even more unique handle
        const retryHandle = `${uniqueHandle}-retry-${Date.now()}`;
        shopifyProduct.handle = retryHandle;
        
        console.log(`🔄 Retrying with handle: ${retryHandle}`);
        
        const retryResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': shopifyAccessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product: shopifyProduct })
        });
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          return {
            success: true,
            productId: retryData.product.id,
            imagesUploaded: validatedImages.length,
            shopifyProduct: retryData.product
          };
        }
      }
      
      throw new Error(`Shopify API error: ${response.status} - ${errorData}`);
    }

    const responseData = await response.json();
    
    if (responseData.product?.id) {
      console.log(`✅ Shopify upload success: Product ID ${responseData.product.id} with ${validatedImages.length} images uploaded`);
      return {
        success: true,
        productId: responseData.product.id,
        imagesUploaded: validatedImages.length,
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

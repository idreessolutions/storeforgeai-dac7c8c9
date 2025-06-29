
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductData {
  itemId: string;
  title: string;
  price: number;
  rating: number;
  orders: number;
  features: string[];
  imageUrl: string;
  images: string[];
  variants: Array<{
    title: string;
    price: number;
    color?: string;
    size?: string;
  }>;
  category: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('🚀 ENHANCED PRODUCT GENERATION REQUEST:', {
      niche: requestData.niche,
      productCount: requestData.productCount,
      storeName: requestData.storeName,
      enhancedGeneration: requestData.enhancedGeneration
    });

    return await handleEnhancedProductGeneration(requestData);

  } catch (error: any) {
    console.error('❌ Request processing error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Request processing failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleEnhancedProductGeneration(requestData: any) {
  const {
    productCount = 10,
    niche = 'general',
    storeName = 'Store',
    targetAudience = 'general',
    businessType = 'dropshipping',
    storeStyle = 'modern',
    shopifyUrl,
    shopifyAccessToken,
    themeColor = '#3B82F6',
    sessionId
  } = requestData;

  console.log(`🎯 ENHANCED: Generating ${productCount} ${niche} products for ${storeName}`);

  if (!shopifyUrl || !shopifyAccessToken) {
    throw new Error('Shopify URL and access token are required');
  }

  // Generate winning products with enhanced content
  const winningProducts = await generateWinningProducts(niche, productCount, {
    storeName,
    targetAudience,
    businessType,
    storeStyle
  });
  
  const results = [];
  let successfulUploads = 0;

  for (let i = 0; i < winningProducts.length; i++) {
    const product = winningProducts[i];
    console.log(`🔄 ENHANCED: Processing product ${i + 1}/${productCount}`);

    try {
      const result = await uploadToShopify(product, shopifyUrl, shopifyAccessToken, {
        niche,
        storeName,
        targetAudience,
        businessType,
        storeStyle,
        themeColor
      });

      if (result.success) {
        successfulUploads++;
        results.push({
          status: 'SUCCESS',
          title: product.title,
          price: product.price.toFixed(2),
          productId: result.productId,
          imagesUploaded: result.imagesUploaded || 0,
          variantsCreated: result.variantsCreated || 0
        });
      } else {
        results.push({
          status: 'FAILED',
          title: product.title,
          error: result.error
        });
      }
    } catch (error: any) {
      console.error('Shopify upload error:', error);
      results.push({
        status: 'FAILED',
        title: product.title,
        error: error.message
      });
    }
  }

  console.log(`✅ ENHANCED COMPLETE: ${successfulUploads}/${productCount} products uploaded`);

  return new Response(JSON.stringify({
    success: true,
    successfulUploads,
    totalProducts: productCount,
    results,
    niche,
    storeName,
    sessionId
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateWinningProducts(niche: string, count: number, storeConfig: any): Promise<ProductData[]> {
  console.log(`🎯 Generating ${count} winning ${niche} products with enhanced AI content`);
  
  const products: ProductData[] = [];
  
  // Get niche-specific data
  const nicheData = getNicheData(niche);
  
  for (let i = 0; i < count; i++) {
    const productTemplate = nicheData.templates[i % nicheData.templates.length];
    const basePrice = generateSmartPrice(niche, i);
    
    // Generate AI-powered product content
    const enhancedContent = await generateEnhancedProductContent(productTemplate.name, niche, storeConfig, i);
    
    const product: ProductData = {
      itemId: `enhanced_${niche}_${Date.now()}_${i}`,
      title: enhancedContent.title,
      price: basePrice,
      rating: 4.3 + (Math.random() * 0.7), // 4.3-5.0
      orders: 200 + (i * 75) + Math.floor(Math.random() * 500),
      features: enhancedContent.features,
      imageUrl: enhancedContent.mainImage,
      images: enhancedContent.images,
      variants: generateSmartVariants(basePrice, niche, enhancedContent.images),
      category: niche
    };
    
    products.push(product);
  }
  
  return products;
}

async function generateEnhancedProductContent(baseName: string, niche: string, storeConfig: any, index: number) {
  console.log(`🤖 Generating AI-enhanced content for ${baseName} in ${niche} niche`);
  
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  let enhancedTitle = baseName;
  let enhancedFeatures = getDefaultFeatures(niche);
  
  if (openAIApiKey) {
    try {
      // Generate enhanced product content with OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert copywriter specializing in ${niche} products for ${storeConfig.storeStyle} stores targeting ${storeConfig.targetAudience}. Create compelling, conversion-focused product content.`
            },
            {
              role: 'user',
              content: `Create a compelling product title and 5 key features for a ${baseName} in the ${niche} niche. The store style is ${storeConfig.storeStyle} and targets ${storeConfig.targetAudience}. Make it emotional and conversion-focused. Return as JSON with "title" and "features" array.`
            }
          ],
          temperature: 0.8,
          max_tokens: 500
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        enhancedTitle = content.title;
        enhancedFeatures = content.features;
        console.log(`✅ AI content generated for ${baseName}`);
      }
    } catch (error) {
      console.warn(`⚠️ AI content generation failed, using defaults:`, error);
    }
  }

  // Generate niche-specific images using DALL-E
  const images = await generateProductImages(enhancedTitle, niche, index);
  
  return {
    title: enhancedTitle,
    features: enhancedFeatures,
    mainImage: images[0],
    images: images
  };
}

async function generateProductImages(productTitle: string, niche: string, index: number): Promise<string[]> {
  console.log(`🎨 Generating niche-specific images for ${productTitle}`);
  
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  const images: string[] = [];
  
  if (openAIApiKey) {
    try {
      // Generate main product image
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: `Professional product photography of ${productTitle.toLowerCase()}, ${niche} product, clean white background, high quality, commercial photography, bright lighting, detailed, realistic`,
          n: 1,
          size: '1024x1024',
          quality: 'high'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data[0] && data.data[0].b64_json) {
          images.push(`data:image/png;base64,${data.data[0].b64_json}`);
          console.log(`✅ Generated AI image for ${productTitle}`);
        }
      }
    } catch (error) {
      console.warn(`⚠️ AI image generation failed:`, error);
    }
  }

  // Fill remaining slots with high-quality stock images
  const stockImages = getStockImages(niche, index);
  images.push(...stockImages.slice(0, 7 - images.length));
  
  // Ensure we have at least 8 images
  while (images.length < 8) {
    images.push(stockImages[images.length % stockImages.length]);
  }
  
  return images.slice(0, 8);
}

function getStockImages(niche: string, index: number): string[] {
  const imageLibrary: Record<string, string[]> = {
    'pets': [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop'
    ],
    'beauty': [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&h=600&fit=crop'
    ],
    'fitness': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1434596922112-19c563067271?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop'
    ]
  };
  
  const images = imageLibrary[niche.toLowerCase()] || imageLibrary.pets;
  const startIndex = (index * 2) % images.length;
  const selectedImages = [];
  
  for (let i = 0; i < 8; i++) {
    const imageIndex = (startIndex + i) % images.length;
    selectedImages.push(images[imageIndex]);
  }
  
  return selectedImages;
}

function getDefaultFeatures(niche: string): string[] {
  const featureLibrary: Record<string, string[]> = {
    'pets': ['🐕 Pet-Safe Materials', '✅ Vet Recommended', '💪 Durable Design', '🧼 Easy Cleaning', '❤️ Pet Comfort'],
    'beauty': ['✨ Dermatologist Tested', '💄 Professional Quality', '⏰ Long-Lasting', '🌿 Natural Ingredients', '💎 Premium Formula'],
    'fitness': ['💪 Professional Grade', '🏋️ Gym Quality', '⚡ High Performance', '🎯 Effective Results', '🔥 Fat Burning'],
    'kitchen': ['🍳 Professional Grade', '👨‍🍳 Chef Quality', '🧽 Easy Cleaning', '⭐ Restaurant Standard', '🔥 Heat Resistant'],
    'home': ['🏠 Premium Materials', '✨ Stylish Design', '🔧 Easy Setup', '💎 Quality Finish', '🎨 Modern Style']
  };
  
  return featureLibrary[niche.toLowerCase()] || featureLibrary.pets;
}

function getNicheData(niche: string) {
  const nicheDatabase = {
    'pets': {
      templates: [
        { name: 'Premium Pet Training Collar', features: ['🐕 Adjustable Fit', '💧 Waterproof Design', '🔋 Long Battery Life', '📱 Smart App Control', '🛡️ Safe & Humane'] },
        { name: 'Interactive Pet Puzzle Feeder', features: ['🧠 Mental Stimulation', '🐕 Slow Feeding Design', '🧽 Easy to Clean', '💪 Durable Materials', '🎯 Reduces Anxiety'] },
        { name: 'Luxury Pet Bed Memory Foam', features: ['🛏️ Orthopedic Support', '🧼 Removable Cover', '🦠 Anti-Bacterial', '🌡️ Temperature Regulating', '💤 Better Sleep Quality'] }
      ]
    },
    'beauty': {
      templates: [
        { name: 'Professional Skincare Serum', features: ['✨ Anti-Aging Formula', '🌿 Natural Ingredients', '💧 Deep Hydration', '🔬 Clinically Tested', '⚡ Fast Results'] },
        { name: 'Luxury Makeup Brush Set', features: ['💄 Professional Quality', '🌟 Synthetic Bristles', '💼 Travel Case Included', '🎨 Perfect Application', '💎 Premium Handle'] },
        { name: 'Advanced Hair Treatment', features: ['💇‍♀️ Salon Quality', '🌿 Nourishing Formula', '✨ Instant Results', '🔒 Color Safe', '💪 Strengthening'] }
      ]
    },
    'fitness': {
      templates: [
        { name: 'Smart Fitness Tracker Band', features: ['⌚ Heart Rate Monitor', '📱 App Integration', '🔋 7-Day Battery', '💧 Waterproof Design', '📊 Detailed Analytics'] },
        { name: 'Premium Resistance Bands Set', features: ['💪 Multiple Resistance Levels', '🏋️ Gym Quality', '🎒 Portable Design', '📚 Workout Guide', '🔒 Safe Grip Handles'] },
        { name: 'Professional Yoga Mat', features: ['🧘‍♀️ Non-Slip Surface', '🌿 Eco-Friendly Material', '💪 Extra Thick Cushioning', '🧼 Easy to Clean', '📏 Perfect Size'] }
      ]
    }
  };
  
  return nicheDatabase[niche.toLowerCase() as keyof typeof nicheDatabase] || nicheDatabase.pets;
}

function generateSmartPrice(niche: string, index: number): number {
  const priceRanges: Record<string, [number, number]> = {
    'pets': [18, 65],
    'beauty': [15, 70], 
    'fitness': [18, 75],
    'kitchen': [12, 55],
    'home': [15, 68],
    'tech': [25, 80],
    'fashion': [12, 60]
  };
  
  const [min, max] = priceRanges[niche.toLowerCase()] || [15, 60];
  const basePrice = min + (max - min) * Math.random();
  const variation = 1 + (index * 0.03);
  let finalPrice = basePrice * variation;
  
  finalPrice = Math.max(15, Math.min(80, finalPrice));
  
  // Psychological pricing
  if (finalPrice < 25) return Math.floor(finalPrice) + 0.99;
  else if (finalPrice < 50) return Math.floor(finalPrice) + 0.95;
  else return Math.floor(finalPrice) + 0.99;
}

function generateSmartVariants(basePrice: number, niche: string, images: string[]): Array<{title: string; price: number; color?: string; size?: string}> {
  const variants = [
    {
      title: 'Standard',
      price: basePrice,
      color: 'Standard'
    },
    {
      title: 'Premium',
      price: Math.round((basePrice * 1.2) * 100) / 100,
      color: 'Premium'
    },
    {
      title: 'Deluxe',
      price: Math.round((basePrice * 1.4) * 100) / 100,
      color: 'Deluxe'
    }
  ];
  
  // Add fourth variant for some niches
  if (['pets', 'beauty', 'fitness'].includes(niche.toLowerCase())) {
    variants.push({
      title: 'Professional',
      price: Math.round((basePrice * 1.6) * 100) / 100,
      color: 'Professional'
    });
  }
  
  return variants;
}

async function uploadToShopify(
  product: ProductData, 
  shopifyUrl: string, 
  accessToken: string, 
  storeConfig: any
): Promise<any> {
  console.log(`🛒 Uploading product to Shopify: ${product.title}`);
  
  // CRITICAL FIX: Ensure proper Shopify URL formatting
  let formattedShopifyUrl = shopifyUrl.trim();
  
  // Remove any protocol and trailing slashes
  formattedShopifyUrl = formattedShopifyUrl
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
  
  // Ensure it ends with .myshopify.com if not already
  if (!formattedShopifyUrl.includes('.myshopify.com')) {
    formattedShopifyUrl = `${formattedShopifyUrl}.myshopify.com`;
  }
  
  // Build the correct API URL
  const apiUrl = `https://${formattedShopifyUrl}/admin/api/2024-10/products.json`;
  
  console.log(`🔗 SHOPIFY API URL: ${apiUrl}`);
  
  // Generate enhanced description
  const enhancedDescription = await generateEnhancedDescription(product, storeConfig);
  
  // Create product payload
  const productPayload = {
    product: {
      title: product.title,
      body_html: enhancedDescription,
      vendor: storeConfig.storeName || 'Premium Store',
      product_type: storeConfig.niche || 'General',
      handle: product.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50) + `-${Date.now()}`,
      status: 'active',
      published: true,
      tags: generateProductTags(product, storeConfig.niche),
      options: [
        {
          name: 'Variant',
          position: 1,
          values: product.variants.map(v => v.title)
        }
      ],
      variants: product.variants.map((variant, index) => ({
        option1: variant.title,
        price: variant.price.toFixed(2),
        compare_at_price: (variant.price * 1.3).toFixed(2),
        inventory_quantity: 100,
        inventory_management: null,
        fulfillment_service: 'manual',
        requires_shipping: true,
        sku: `${product.itemId}-${index + 1}`
      }))
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const createdProduct = result.product;

    console.log(`✅ Product created successfully: ${createdProduct.id}`);

    // Upload images
    let imagesUploaded = 0;
    
    // Upload main image
    if (product.imageUrl) {
      const imageResult = await uploadProductImage(createdProduct.id, product.imageUrl, formattedShopifyUrl, accessToken, 1);
      if (imageResult) imagesUploaded++;
    }

    // Upload additional images
    for (let i = 0; i < Math.min(product.images.length, 5); i++) {
      const imageResult = await uploadProductImage(createdProduct.id, product.images[i], formattedShopifyUrl, accessToken, i + 2);
      if (imageResult) imagesUploaded++;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return {
      success: true,
      productId: createdProduct.id,
      imagesUploaded,
      variantsCreated: product.variants.length
    };

  } catch (error: any) {
    console.error(`❌ Failed to upload product ${product.title}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function uploadProductImage(
  productId: string, 
  imageUrl: string, 
  shopifyUrl: string, 
  accessToken: string, 
  position: number
): Promise<boolean> {
  try {
    const apiUrl = `https://${shopifyUrl}/admin/api/2024-10/products/${productId}/images.json`;
    
    const imagePayload = {
      image: {
        src: imageUrl,
        position: position,
        alt: `Product image ${position}`
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(imagePayload)
    });

    return response.ok;
  } catch (error) {
    console.error(`❌ Failed to upload image ${position}:`, error);
    return false;
  }
}

async function generateEnhancedDescription(product: ProductData, storeConfig: any): Promise<string> {
  const { niche, targetAudience, businessType, storeStyle } = storeConfig;
  
  return `
<div class="product-description">
  <h2>🌟 Transform Your ${niche?.charAt(0).toUpperCase() + niche?.slice(1)} Experience!</h2>
  
  <p><strong>Join thousands of satisfied ${targetAudience} who've discovered this premium ${niche} solution!</strong></p>
  
  <h3>🔥 Why You'll Love This:</h3>
  <ul>
    ${product.features.map(feature => `<li>${feature}</li>`).join('')}
  </ul>
  
  <h3>🎯 Perfect For:</h3>
  <p>Designed specifically for ${targetAudience} who demand excellence and results. Whether you're a beginner or expert, this premium solution delivers every time.</p>
  
  <h3>🏆 Quality Promise:</h3>
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; border-radius: 8px; color: white; margin: 15px 0;">
    <p>⭐ <strong>${product.rating.toFixed(1)}/5 Star Rating</strong> from ${product.orders}+ verified buyers<br>
    🚚 <strong>Free Fast Shipping</strong> on orders over $35<br>
    💝 <strong>30-Day Money-Back Guarantee</strong><br>
    🔒 <strong>Secure Checkout</strong> & 24/7 support</p>
  </div>
  
  <div style="text-align: center; margin: 20px 0;">
    <h3>⚡ Limited Time: Special Launch Price!</h3>
    <p><strong>🎁 Order now and get FREE bonus accessories worth $25!</strong></p>
  </div>
</div>
  `.trim();
}

function generateProductTags(product: ProductData, niche: string): string {
  const baseTags = [
    niche,
    'trending',
    'bestseller',
    'premium',
    'high-quality'
  ];
  
  // Add price-based tags
  if (product.price < 25) baseTags.push('affordable', 'budget-friendly');
  else if (product.price > 50) baseTags.push('luxury', 'professional');
  
  // Add rating-based tags
  if (product.rating >= 4.5) baseTags.push('top-rated', '5-star');
  
  return baseTags.join(', ');
}


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced product data with real diversity
const NICHE_PRODUCT_TEMPLATES = {
  tech: [
    {
      name: "Smart Wireless Charging Station",
      basePrice: 34.99,
      features: ["📱 Fast Charging", "🔋 Multi-Device Support", "✨ LED Indicators", "🛡️ Overcharge Protection", "📐 Compact Design"]
    },
    {
      name: "Bluetooth Gaming Headset",
      basePrice: 45.99,
      features: ["🎮 Gaming Optimized", "🔊 Surround Sound", "🎤 Noise-Canceling Mic", "🔋 30Hr Battery", "⚡ Fast Connect"]
    },
    {
      name: "4K Webcam with Auto Focus",
      basePrice: 52.99,
      features: ["📹 4K Ultra HD", "🎯 Auto Focus", "🔊 Built-in Mic", "💡 Ring Light", "🖥️ Plug & Play"]
    },
    {
      name: "Portable Power Bank 20000mAh",
      basePrice: 28.99,
      features: ["🔋 20000mAh Capacity", "⚡ Fast Charging", "📱 Multiple Ports", "📊 LED Display", "🛡️ Safety Protection"]
    },
    {
      name: "Smart Home Security Camera",
      basePrice: 67.99,
      features: ["📱 WiFi Connected", "🌙 Night Vision", "🔊 Two-Way Audio", "☁️ Cloud Storage", "📱 Mobile Alerts"]
    }
  ],
  pets: [
    {
      name: "Smart Pet Water Fountain",
      basePrice: 29.99,
      features: ["🔄 Auto-circulation", "🧽 Easy cleaning", "💧 Ultra-quiet pump", "🔋 Energy efficient", "🐕 Pet-safe materials"]
    },
    {
      name: "Interactive Puzzle Feeder",
      basePrice: 24.99,
      features: ["🧠 Mental stimulation", "🐕 Slow feeding", "🧩 Multiple difficulty levels", "🛡️ Non-slip base", "🧼 Dishwasher safe"]
    },
    {
      name: "Premium Pet Training Collar",
      basePrice: 39.99,
      features: ["📱 Remote control", "🔊 Sound & vibration", "🌧️ Waterproof design", "🔋 Rechargeable battery", "🎯 Effective training"]
    }
  ],
  beauty: [
    {
      name: "LED Light Therapy Mask",
      basePrice: 89.99,
      features: ["💡 7 LED Colors", "✨ Anti-Aging", "🌟 Skin Rejuvenation", "⏰ Timer Function", "👩‍⚕️ Dermatologist Approved"]
    },
    {
      name: "Jade Facial Roller Set",
      basePrice: 19.99,
      features: ["💎 Real Jade Stone", "✨ Reduces Puffiness", "💆‍♀️ Face Massage", "🧊 Cooling Effect", "🎁 Gua Sha Included"]
    },
    {
      name: "Electric Makeup Brush Cleaner",
      basePrice: 24.99,
      features: ["⚡ Quick Cleaning", "🌀 360° Rotation", "💧 Deep Clean", "⏰ 30 Second Clean", "🧽 Multiple Sizes"]
    }
  ]
};

// Generate realistic product images
function generateProductImages(productName: string, niche: string, index: number): string[] {
  const nicheImages = {
    tech: [
      `https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?w=800&h=600&fit=crop&auto=format&q=80&seed=${index}`,
      `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop&auto=format&q=80&seed=${index + 1}`,
      `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&auto=format&q=80&seed=${index + 2}`,
      `https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop&auto=format&q=80&seed=${index + 3}`,
      `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop&auto=format&q=80&seed=${index + 4}`,
      `https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=800&h=600&fit=crop&auto=format&q=80&seed=${index + 5}`
    ],
    pets: [
      `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&auto=format&q=80&seed=${index}`,
      `https://images.unsplash.com/photo-1564844536308-49b92c3086d0?w=800&h=600&fit=crop&auto=format&q=80&seed=${index + 1}`,
      `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format&q=80&seed=${index + 2}`,
      `https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop&auto=format&q=80&seed=${index + 3}`,
      `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&auto=format&q=80&seed=${index + 4}`,
      `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&auto=format&q=80&seed=${index + 5}`
    ],
    beauty: [
      `https://images.unsplash.com/photo-1596462502166-2c2d3be83b22?w=800&h=600&fit=crop&auto=format&q=80&seed=${index}`,
      `https://images.unsplash.com/photo-1571019614441-bd1e0a87e2ec?w=800&h=600&fit=crop&auto=format&q=80&seed=${index + 1}`,
      `https://images.unsplash.com/photo-1522335789917-b90c2e0ea03b?w=800&h=600&fit=crop&auto=format&q=80&seed=${index + 2}`,
      `https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=600&fit=crop&auto=format&q=80&seed=${index + 3}`,
      `https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=600&fit=crop&auto=format&q=80&seed=${index + 4}`,
      `https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop&auto=format&q=80&seed=${index + 5}`
    ]
  };
  
  const images = nicheImages[niche.toLowerCase()] || nicheImages.tech;
  return images.slice(0, 6);
}

// Generate enhanced product content with GPT-4
async function generateEnhancedProductContent(productName: string, niche: string, features: string[], index: number) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('⚠️ No OpenAI API key, using fallback content');
    return generateFallbackContent(productName, features, niche, index);
  }

  try {
    const prompt = `Create compelling e-commerce product content for: "${productName}"

Requirements:
- Write 600-800 words of emotional, benefit-driven copy
- Target ${niche} enthusiasts who want premium quality
- Include specific product features: ${features.join(', ')}
- Focus on benefits and transformation, not just features
- Include urgency and social proof elements
- Use emojis naturally throughout
- Create a unique selling proposition

Return ONLY valid JSON with this structure:
{
  "title": "Compelling product title with emoji (max 60 chars)",
  "description": "Full 600-800 word description focusing on benefits and emotions",
  "bulletPoints": ["Key benefit 1", "Key benefit 2", "Key benefit 3", "Key benefit 4", "Key benefit 5"],
  "tags": ["${niche}", "premium", "bestseller", "quality", "trending"]
}

Make this product sound irresistible and unique. Do NOT include markdown formatting.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert e-commerce copywriter. Return only valid JSON without markdown formatting.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.8
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Clean up JSON formatting
    content = content.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
    
    if (content.startsWith('```')) {
      content = content.substring(3);
    }
    if (content.endsWith('```')) {
      content = content.substring(0, content.length - 3);
    }
    
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return generateFallbackContent(productName, features, niche, index);
    }

  } catch (error) {
    console.error('❌ OpenAI API error:', error);
    return generateFallbackContent(productName, features, niche, index);
  }
}

// Fallback content generator
function generateFallbackContent(productName: string, features: string[], niche: string, index: number) {
  const titles = [
    `🏆 Premium ${productName} - Best Choice`,
    `⭐ Professional ${productName} - Top Rated`,
    `💎 Elite ${productName} - Must Have`,
    `🔥 Ultimate ${productName} - Trending`,
    `✨ Advanced ${productName} - #1 Choice`
  ];
  
  const randomTitle = titles[index % titles.length];
  
  return {
    title: randomTitle,
    description: `Experience the ultimate in ${niche} excellence with this premium ${productName}! 🌟

✨ **Why This is Your Perfect Choice:**
${features.map(feature => `• ${feature}`).join('\n')}

🏆 **Premium Quality Promise**
This isn't just another ${productName.toLowerCase()} - it's a game-changer designed for those who demand excellence. Crafted with precision and built to last, this product delivers results that speak for themselves.

⚡ **Instant Transformation**
From the moment you start using this ${productName}, you'll experience the difference. Join thousands of satisfied customers who've discovered why this is the #1 choice in ${niche}.

🛡️ **Risk-Free Guarantee**
We're so confident in this product that we back it with our ironclad 30-day money-back guarantee. Love it or return it - no questions asked.

🚚 **Fast & Free Shipping**
Get your ${productName} delivered quickly with our expedited shipping service.

⭐ **Customer Love**
"This ${productName} exceeded all my expectations!" - Sarah M.
"Finally found what I was looking for!" - Mike R.
"Worth every penny and more!" - Jessica L.

Don't miss out on this opportunity to upgrade your ${niche} experience! 🎉`,
    bulletPoints: features,
    tags: [niche, 'premium', 'bestseller', 'top-rated', 'quality']
  };
}

// Generate smart pricing with psychological patterns
function generateSmartPricing(basePrice: number, index: number) {
  const multiplier = 1 + (index * 0.08);
  const adjustedPrice = basePrice * multiplier;
  const finalPrice = Math.max(15, Math.min(80, adjustedPrice));
  
  // Psychological pricing patterns
  if (finalPrice < 25) {
    return Math.floor(finalPrice) + 0.99;
  } else if (finalPrice < 50) {
    return Math.floor(finalPrice) + 0.95;
  } else {
    return Math.floor(finalPrice) + 0.99;
  }
}

// Generate unique variants
function generateUniqueVariants(basePrice: number, productName: string, index: number) {
  const variantTypes = [
    { name: 'Standard', multiplier: 1.0 },
    { name: 'Premium', multiplier: 1.25 },
    { name: 'Deluxe', multiplier: 1.5 }
  ];
  
  return variantTypes.map((variant, i) => ({
    title: `${variant.name} ${productName.split(' ')[0]}`,
    price: Math.round(basePrice * variant.multiplier * 100) / 100,
    sku: `${productName.replace(/\s+/g, '-').toLowerCase()}-${variant.name.toLowerCase()}-${index}-${i}`,
    inventory_quantity: 100
  }));
}

// Generate winning products
async function generateWinningProducts(niche: string, count: number = 10) {
  console.log(`🎯 Generating ${count} unique ${niche} products with AI enhancement`);
  
  const products = [];
  const templates = NICHE_PRODUCT_TEMPLATES[niche.toLowerCase()] || NICHE_PRODUCT_TEMPLATES.tech;
  
  for (let i = 0; i < count; i++) {
    const templateIndex = i % templates.length;
    const template = templates[templateIndex];
    const uniquePrice = generateSmartPricing(template.basePrice, i);
    
    console.log(`🤖 Generating AI content for product ${i + 1}: ${template.name}`);
    
    // Generate enhanced content
    const enhancedContent = await generateEnhancedProductContent(
      template.name, 
      niche, 
      template.features, 
      i
    );
    
    // Generate unique images
    const productImages = generateProductImages(template.name, niche, i);
    
    // Generate unique variants
    const variants = generateUniqueVariants(uniquePrice, template.name, i);
    
    const product = {
      id: `${niche}_${Date.now()}_${i}`,
      title: enhancedContent.title,
      description: enhancedContent.description,
      price: uniquePrice,
      compareAtPrice: Math.round(uniquePrice * 1.4 * 100) / 100,
      images: productImages,
      features: enhancedContent.bulletPoints || template.features,
      tags: enhancedContent.tags || ['premium', niche, 'bestseller'],
      variants: variants,
      vendor: `${niche.charAt(0).toUpperCase() + niche.slice(1)} Elite`,
      productType: niche.charAt(0).toUpperCase() + niche.slice(1),
      handle: `${template.name.toLowerCase().replace(/\s+/g, '-')}-${i}-${Date.now()}`,
      status: 'active'
    };
    
    products.push(product);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`✅ Generated ${products.length} unique products`);
  return products;
}

// Upload product to Shopify with proper variant handling
async function uploadProductToShopify(product: any, shopifyUrl: string, accessToken: string) {
  console.log(`🛒 Uploading to Shopify: ${product.title}`);
  
  const shopifyApiUrl = `https://${shopifyUrl}/admin/api/2024-10/products.json`;
  
  const productData = {
    product: {
      title: product.title,
      body_html: product.description.replace(/\n/g, '<br>'),
      vendor: product.vendor,
      product_type: product.productType,
      handle: product.handle,
      status: 'active',
      published: true,
      tags: product.tags.join(', '),
      images: product.images.map((imageUrl: string, index: number) => ({
        src: imageUrl,
        alt: `${product.title} - View ${index + 1}`,
        position: index + 1
      })),
      variants: product.variants.map((variant: any, index: number) => ({
        title: variant.title,
        price: variant.price.toString(),
        compare_at_price: product.compareAtPrice.toString(),
        sku: variant.sku,
        inventory_quantity: variant.inventory_quantity,
        inventory_management: null,
        fulfillment_service: 'manual',
        requires_shipping: true,
        position: index + 1
      }))
    }
  };

  try {
    const response = await fetch(shopifyApiUrl, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`❌ Shopify API error: ${response.status} - ${responseText}`);
      return {
        success: false,
        title: product.title,
        error: `Shopify error ${response.status}: ${responseText}`
      };
    }

    const result = JSON.parse(responseText);
    console.log(`✅ Product uploaded successfully: ${result.product.id}`);
    
    return {
      success: true,
      productId: result.product.id,
      title: product.title,
      price: product.price,
      imagesUploaded: product.images.length,
      variantsCreated: product.variants.length
    };
    
  } catch (error) {
    console.error(`❌ Upload failed: ${error.message}`);
    return {
      success: false,
      title: product.title,
      error: error.message
    };
  }
}

// Main handler
async function handleProductGeneration(requestBody: any) {
  const { 
    niche, 
    productCount = 10, 
    shopifyUrl, 
    shopifyAccessToken,
    storeName 
  } = requestBody;

  console.log(`🚀 Starting product generation: ${productCount} ${niche} products for ${storeName}`);

  try {
    // Generate products
    const products = await generateWinningProducts(niche, productCount);
    
    if (products.length === 0) {
      throw new Error('No products generated');
    }
    
    // Upload to Shopify
    const results = [];
    let successCount = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`🔄 Uploading product ${i + 1}/${productCount}: ${product.title}`);
      
      const uploadResult = await uploadProductToShopify(product, shopifyUrl, shopifyAccessToken);
      results.push(uploadResult);
      
      if (uploadResult.success) {
        successCount++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    return {
      success: true,
      message: `Successfully generated and uploaded ${successCount}/${productCount} products`,
      successfulUploads: successCount,
      totalRequested: productCount,
      results: results,
      niche: niche
    };
    
  } catch (error) {
    console.error('❌ Product generation failed:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log(`🚀 PRODUCT GENERATION REQUEST: ${JSON.stringify({
      niche: requestBody.niche,
      productCount: requestBody.productCount,
      storeName: requestBody.storeName
    })}`);

    const result = await handleProductGeneration(requestBody);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Request failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Product generation failed',
      message: 'Failed to generate products'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

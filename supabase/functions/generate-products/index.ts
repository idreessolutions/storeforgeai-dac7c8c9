
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { realProduct, niche, targetAudience, businessType, storeStyle, themeColor, customInfo, productIndex } = await req.json();
    
    console.log(`🤖 AI optimizing REAL product: ${realProduct.title}`);
    console.log('Real product data:', {
      itemId: realProduct.itemId,
      rating: realProduct.rating,
      orders: realProduct.orders,
      price: realProduct.price
    });

    // Check required environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.error('❌ OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    console.log(`🚀 Processing real ${niche} product with AI optimization...`);
    
    // Generate AI-optimized content for the real product
    const optimizedProduct = await optimizeRealProduct(
      realProduct, 
      niche, 
      targetAudience, 
      businessType, 
      storeStyle, 
      themeColor, 
      customInfo,
      openaiApiKey
    );
    
    if (!optimizedProduct) {
      throw new Error(`Failed to optimize real ${niche} product`);
    }

    console.log(`✅ Successfully AI-optimized real ${niche} product: ${optimizedProduct.title}`);

    return new Response(JSON.stringify({
      success: true,
      optimizedProduct: optimizedProduct
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in AI product optimization:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function optimizeRealProduct(
  realProduct: any,
  niche: string, 
  targetAudience: string, 
  businessType: string, 
  storeStyle: string, 
  themeColor: string, 
  customInfo: string,
  openaiApiKey: string
) {
  console.log(`🧠 Starting AI content optimization for: ${realProduct.title}`);

  try {
    // Generate AI-optimized title and description
    const optimizedContent = await generateAIContent(realProduct, niche, targetAudience, storeStyle, themeColor, openaiApiKey);
    
    // Generate DALL·E 3 images
    const images = await generateDalleImages(optimizedContent, niche, openaiApiKey);
    
    // Create variants based on real product data
    const variants = generateProductVariants(realProduct, optimizedContent.recommendedPrice);
    
    const finalProduct = {
      ...optimizedContent,
      images: images,
      variants: variants,
      category: niche,
      source: 'aliexpress_ai_optimized',
      aliExpressData: {
        itemId: realProduct.itemId,
        rating: realProduct.rating,
        orders: realProduct.orders,
        originalPrice: realProduct.price
      }
    };
    
    console.log(`✅ AI optimization complete for: ${finalProduct.title}`);
    return finalProduct;
    
  } catch (error) {
    console.error('❌ AI optimization failed:', error);
    throw error;
  }
}

async function generateAIContent(realProduct: any, niche: string, targetAudience: string, storeStyle: string, themeColor: string, openaiApiKey: string) {
  const nicheEmojis = {
    'fitness': '💪',
    'beauty': '💄',
    'tech': '📱',
    'pets': '🐾',
    'kitchen': '🍳',
    'home': '🏠',
    'fashion': '👗',
    'baby': '👶',
    'car': '🚗',
    'gifts': '🎁'
  };

  const emoji = nicheEmojis[niche.toLowerCase()] || '⭐';
  
  const prompt = `You are an expert e-commerce copywriter specializing in ${niche} products.

REAL PRODUCT DATA:
- Title: ${realProduct.title}
- Rating: ${realProduct.rating}/5 stars
- Orders: ${realProduct.orders}+ sold
- Original Price: $${realProduct.price}
- Features: ${realProduct.features?.join(', ') || 'Premium quality'}

TARGET: ${targetAudience}
STYLE: ${storeStyle}
THEME COLOR: ${themeColor}
NICHE: ${niche}

Create compelling content that converts browsers into buyers. Use the ${emoji} emoji and vibrant language.

Return ONLY this JSON format:
{
  "title": "Benefit-focused title with ${emoji} emoji (max 60 chars)",
  "description": "500-800 word compelling description with emojis, benefits, social proof, and strong CTA using theme color ${themeColor}",
  "features": ["feature 1", "feature 2", "feature 3", "feature 4"],
  "benefits": ["benefit 1", "benefit 2", "benefit 3"],
  "recommendedPrice": ${Math.max(15, Math.min(80, realProduct.price * 1.8))}
}`;

  try {
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
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log(`✅ AI content generated for: ${parsed.title}`);
      return parsed;
    } else {
      throw new Error('Invalid JSON response from OpenAI');
    }
    
  } catch (error) {
    console.error('❌ Error generating AI content:', error);
    // Return enhanced fallback
    return createEnhancedFallbackContent(realProduct, niche, targetAudience, emoji);
  }
}

async function generateDalleImages(product: any, niche: string, openaiApiKey: string) {
  const images = [];
  
  const imagePrompts = [
    `Professional e-commerce photo of ${product.title} on clean white background, high quality, product photography`,
    `${product.title} lifestyle shot in modern ${niche} setting, natural lighting, premium quality`,
    `Close-up detail shot of ${product.title} showing premium materials and craftsmanship`,
    `${product.title} in use, showing benefits and functionality, professional photography`
  ];

  console.log(`🎨 Generating ${imagePrompts.length} DALL·E 3 images for: ${product.title}`);

  for (let i = 0; i < imagePrompts.length; i++) {
    try {
      const response = await Promise.race([
        fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: imagePrompts[i],
            n: 1,
            size: '1024x1024',
            quality: 'standard'
          }),
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Image generation timeout')), 25000))
      ]);

      if (response.ok) {
        const imageData = await response.json();
        if (imageData.data && imageData.data[0]) {
          images.push({
            url: imageData.data[0].url,
            alt: `${product.title} - Image ${i + 1}`
          });
          console.log(`✅ Generated DALL·E image ${i + 1}/${imagePrompts.length} for ${product.title}`);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to generate image ${i + 1}:`, error);
    }
    
    // Delay between image generations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Ensure at least one image
  if (images.length === 0) {
    images.push({
      url: 'https://via.placeholder.com/400x400/f0f0f0/999?text=Product+Image',
      alt: product.title
    });
  }

  console.log(`📸 Generated ${images.length} images for: ${product.title}`);
  return images;
}

function generateProductVariants(realProduct: any, basePrice: number) {
  const variants = [];
  
  // Use real variants if available
  if (realProduct.variants && realProduct.variants.length > 0) {
    for (let i = 0; i < Math.min(4, realProduct.variants.length); i++) {
      const variant = realProduct.variants[i];
      variants.push({
        title: variant.color || variant.size || `Option ${i + 1}`,
        price: variant.price || basePrice + (Math.random() * 10 - 5),
        inventory_quantity: 100,
        option1: variant.color || variant.size || `Option ${i + 1}`,
        option2: variant.size || null
      });
    }
  } else {
    // Generate standard variants
    const colors = ['Black', 'White', 'Blue', 'Red'];
    for (let i = 0; i < 3; i++) {
      variants.push({
        title: colors[i],
        price: basePrice + (Math.random() * 10 - 5),
        inventory_quantity: 100,
        option1: colors[i]
      });
    }
  }
  
  return variants;
}

function createEnhancedFallbackContent(realProduct: any, niche: string, targetAudience: string, emoji: string) {
  return {
    title: `${emoji} Premium ${realProduct.title.substring(0, 40)}`,
    description: `Transform your ${niche} experience with this premium ${realProduct.title}! ${emoji}\n\n` +
                `✨ Perfect for ${targetAudience}\n` +
                `🏆 Proven winner with ${realProduct.orders}+ orders\n` +
                `⭐ ${realProduct.rating}/5 star rating\n` +
                `🎯 Key features that make this special:\n` +
                `${realProduct.features?.slice(0, 4).map(f => `• ${f}`).join('\n') || '• Premium quality materials\n• Durable construction\n• Easy to use\n• Great value'}\n\n` +
                `Join thousands of satisfied customers who've already discovered the benefits! ` +
                `This bestselling product is trusted worldwide for its quality and performance.\n\n` +
                `🚀 Order now and experience the difference!`,
    features: realProduct.features || [`Premium ${niche} quality`, 'Durable construction', 'Easy to use', 'Great value'],
    benefits: [`Improves your ${niche} experience`, 'Saves time and effort', 'Long-lasting quality'],
    recommendedPrice: Math.max(15, Math.min(80, realProduct.price * 1.8))
  };
}

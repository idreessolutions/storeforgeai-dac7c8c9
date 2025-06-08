
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
    const { realProduct, niche, targetAudience, businessType, storeStyle, themeColor, customInfo, productIndex } = await req.json();
    
    console.log(`🤖 AI optimizing REAL ${niche} product: ${realProduct.title}`);
    console.log('Real product data:', {
      itemId: realProduct.itemId,
      rating: realProduct.rating,
      orders: realProduct.orders,
      price: realProduct.price,
      features: realProduct.features?.slice(0, 3)
    });

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.error('❌ OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    console.log(`🚀 Processing real ${niche} product with full AI optimization...`);
    
    // Generate complete AI-optimized product
    const optimizedProduct = await generateCompleteProduct(
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
      throw new Error(`Failed to optimize real ${niche} product with AI`);
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

async function generateCompleteProduct(
  realProduct: any,
  niche: string, 
  targetAudience: string, 
  businessType: string, 
  storeStyle: string, 
  themeColor: string, 
  customInfo: string,
  openaiApiKey: string
) {
  console.log(`🧠 Starting complete AI optimization for: ${realProduct.title}`);

  try {
    // Step 1: Generate AI-optimized content with GPT-4o-mini
    const optimizedContent = await generateGPTContent(realProduct, niche, targetAudience, storeStyle, themeColor, openaiApiKey);
    
    // Step 2: Generate DALL·E 3 images
    const dalleImages = await generateDalleImages(optimizedContent, realProduct, niche, openaiApiKey);
    
    // Step 3: Create proper variants with image assignments
    const variants = generateSmartVariants(realProduct, optimizedContent.recommendedPrice);
    
    // Step 4: Ensure proper pricing
    const finalPrice = Math.max(15, Math.min(80, optimizedContent.recommendedPrice));
    
    const finalProduct = {
      ...optimizedContent,
      price: finalPrice,
      recommendedPrice: finalPrice,
      images: dalleImages,
      variants: variants,
      category: niche,
      source: 'aliexpress_ai_optimized',
      aliExpressData: {
        itemId: realProduct.itemId,
        rating: realProduct.rating,
        orders: realProduct.orders,
        originalPrice: realProduct.price,
        originalFeatures: realProduct.features
      }
    };
    
    console.log(`✅ Complete AI optimization finished for: ${finalProduct.title}`);
    console.log(`📊 Final product stats: $${finalPrice}, ${dalleImages.length} images, ${variants.length} variants`);
    
    return finalProduct;
    
  } catch (error) {
    console.error('❌ Complete AI optimization failed:', error);
    throw error;
  }
}

async function generateGPTContent(realProduct: any, niche: string, targetAudience: string, storeStyle: string, themeColor: string, openaiApiKey: string) {
  const nicheEmojis = {
    'pets': '🐾',
    'fitness': '💪',
    'beauty': '💄',
    'tech': '📱',
    'kitchen': '🍳',
    'home': '🏠',
    'fashion': '👗',
    'baby': '👶'
  };

  const emoji = nicheEmojis[niche.toLowerCase()] || '⭐';
  
  const prompt = `You are an expert e-commerce copywriter specializing in ${niche} products. Create compelling, conversion-focused content.

REAL WINNING PRODUCT:
- Title: ${realProduct.title}
- Rating: ${realProduct.rating}/5 stars (${realProduct.orders}+ orders)
- Price: $${realProduct.price}
- Features: ${realProduct.features?.join(', ') || 'Premium quality'}
- Category: ${niche}

TARGET CUSTOMER: ${targetAudience}
STORE STYLE: ${storeStyle}
THEME COLOR: ${themeColor}
NICHE: ${niche}

Create content that converts browsers into buyers using emotional triggers, social proof, and compelling benefits.

REQUIREMENTS:
- Use ${emoji} emoji prominently
- Include theme color ${themeColor} in HTML spans: <span style="color:${themeColor}">text</span>
- Write 400-600 word description with emotional appeal
- Use bullet points, emojis, and formatting
- Price range: $15-$80
- Focus on benefits, not just features

Return ONLY this JSON:
{
  "title": "Compelling ${emoji} title under 60 chars",
  "description": "Rich HTML description with color styling, emojis, social proof, benefits",
  "features": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
  "benefits": ["benefit 1", "benefit 2", "benefit 3", "benefit 4"],
  "recommendedPrice": ${Math.max(15, Math.min(80, realProduct.price * 1.5))}
}`;

  try {
    console.log(`🤖 Generating GPT-4o-mini content for: ${realProduct.title}`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert e-commerce copywriter. Return only valid JSON with no markdown formatting.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log(`✅ GPT content generated successfully: ${parsed.title}`);
      return parsed;
    } else {
      throw new Error('Invalid JSON response from GPT');
    }
    
  } catch (error) {
    console.error('❌ Error generating GPT content:', error);
    throw new Error(`GPT content generation failed: ${error.message}`);
  }
}

async function generateDalleImages(product: any, realProduct: any, niche: string, openaiApiKey: string) {
  const images = [];
  
  // Create 4 specific DALL·E 3 prompts for this exact product
  const imagePrompts = [
    `Professional e-commerce photo of ${product.title}, clean white background, high quality product photography, realistic lighting, commercial style`,
    
    `${product.title} lifestyle shot in modern ${niche} setting, natural lighting, premium quality, realistic photography`,
    
    `Close-up detail shot of ${product.title}, showing premium materials and craftsmanship, white background, macro photography`,
    
    `${product.title} in use scenario, lifestyle photography, modern ${niche} environment, professional lighting`
  ];

  console.log(`🎨 Generating 4 DALL·E 3 images for: ${product.title}`);

  for (let i = 0; i < 4; i++) {
    try {
      console.log(`🖼️ Generating DALL·E 3 image ${i + 1}/4: ${product.title}`);
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
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
          quality: 'standard',
          style: 'natural'
        }),
      });

      if (response.ok) {
        const imageData = await response.json();
        if (imageData.data && imageData.data[0]) {
          images.push({
            url: imageData.data[0].url,
            alt: `${product.title} - Image ${i + 1}`
          });
          console.log(`✅ Generated DALL·E 3 image ${i + 1}/4 for ${product.title}`);
        }
      } else {
        console.error(`❌ DALL·E 3 generation failed for image ${i + 1}`);
      }
      
      // Rate limiting between generations
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Failed to generate DALL·E 3 image ${i + 1}:`, error);
    }
  }

  console.log(`📸 Generated ${images.length}/4 DALL·E 3 images for: ${product.title}`);
  return images;
}

function generateSmartVariants(realProduct: any, basePrice: number) {
  const variants = [];
  
  // Use real variants if available
  if (realProduct.variants && realProduct.variants.length > 0) {
    for (let i = 0; i < Math.min(4, realProduct.variants.length); i++) {
      const variant = realProduct.variants[i];
      variants.push({
        title: variant.title || `Option ${i + 1}`,
        price: Math.max(15, Math.min(80, variant.price || basePrice + (Math.random() * 10 - 5))),
        inventory_quantity: 100,
        option1: variant.title || variant.color || variant.size || `Option ${i + 1}`,
        sku: `VAR-${i + 1}-${Date.now()}`
      });
    }
  } else {
    // Generate smart variants based on product type
    const options = ['Standard', 'Premium', 'Deluxe'];
    for (let i = 0; i < 3; i++) {
      variants.push({
        title: options[i],
        price: Math.max(15, Math.min(80, basePrice + (i * 5))),
        inventory_quantity: 100,
        option1: options[i],
        sku: `VAR-${i + 1}-${Date.now()}`
      });
    }
  }
  
  return variants;
}

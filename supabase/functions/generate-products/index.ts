
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
    const { niche, targetAudience, businessType, storeStyle, themeColor, customInfo } = await req.json();
    
    console.log(`🚀 Generating 10 trending ${niche} products with AI optimization...`);
    console.log('Request context:', {
      niche,
      targetAudience,
      businessType,
      storeStyle,
      themeColor
    });

    // Check required environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`📦 Processing 10 trending ${niche} products...`);
    
    // Generate products using the correct niche mapping
    const products = await generateOptimizedProducts(niche, targetAudience, businessType, storeStyle, themeColor, customInfo, openaiApiKey);
    
    if (!products || products.length === 0) {
      throw new Error(`Failed to generate ${niche} products`);
    }

    console.log(`✅ Successfully generated ${products.length} AI-optimized ${niche} products`);

    return new Response(JSON.stringify({
      success: true,
      products: products
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in generate-products function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateOptimizedProducts(
  niche: string, 
  targetAudience: string, 
  businessType: string, 
  storeStyle: string, 
  themeColor: string, 
  customInfo: string,
  openaiApiKey: string
) {
  const products = [];
  const nicheProducts = getNicheBaseProducts(niche);
  
  for (let i = 0; i < Math.min(10, nicheProducts.length); i++) {
    console.log(`🔄 Processing trending ${niche} product ${i + 1}/10 (ID: ${nicheProducts[i].id})`);
    
    try {
      const baseProduct = nicheProducts[i];
      
      // Generate AI-optimized content
      const optimizedProduct = await generateAIContent(baseProduct, niche, targetAudience, storeStyle, themeColor, openaiApiKey);
      
      // Generate product images
      const images = await generateProductImages(optimizedProduct, niche, openaiApiKey);
      
      const finalProduct = {
        ...optimizedProduct,
        images: images,
        variants: generateVariants(baseProduct, optimizedProduct.recommendedPrice),
        source: 'trending'
      };
      
      products.push(finalProduct);
      console.log(`✅ AI-optimized ${niche} product ${i + 1} generated: ${finalProduct.title}`);
      
    } catch (error) {
      console.error(`Failed to process product ${i + 1}:`, error);
      continue;
    }
  }
  
  return products;
}

async function generateAIContent(baseProduct: any, niche: string, targetAudience: string, storeStyle: string, themeColor: string, openaiApiKey: string) {
  const prompt = createProductPrompt(baseProduct, niche, targetAudience, storeStyle, themeColor);
  
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
        temperature: 0.7,
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
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid JSON response from OpenAI');
    }
    
  } catch (error) {
    console.error('Error generating AI content:', error);
    // Return fallback content
    return {
      title: `Premium ${niche} ${baseProduct.name}`,
      description: `Experience the ultimate in ${niche} with this premium product. Perfect for ${targetAudience}, featuring high-quality materials and innovative design.`,
      features: ['Premium Quality', 'Durable Construction', 'Easy to Use', 'Great Value'],
      benefits: ['Saves Time', 'Improves Results', 'Long Lasting'],
      recommendedPrice: Math.floor(Math.random() * (80 - 15) + 15)
    };
  }
}

async function generateProductImages(product: any, niche: string, openaiApiKey: string) {
  const images = [];
  const imagePrompts = [
    `Professional e-commerce photo of ${product.title} on clean white background, high quality`,
    `${product.title} lifestyle shot in modern ${niche} setting, natural lighting`,
    `Close-up detail view of ${product.title} showing key features, macro photography`
  ];

  for (let i = 0; i < 3; i++) {
    try {
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
          quality: 'standard'
        }),
      });

      if (response.ok) {
        const imageData = await response.json();
        if (imageData.data && imageData.data[0]) {
          images.push({
            url: imageData.data[0].url,
            alt: product.title
          });
          console.log(`✅ Generated DALL·E image ${i + 1}/3 for ${product.title}`);
        }
      }
    } catch (error) {
      console.error(`Failed to generate image ${i + 1}:`, error);
    }
  }

  // Ensure at least one image
  if (images.length === 0) {
    images.push({
      url: 'https://via.placeholder.com/400x400/f0f0f0/999?text=Product+Image',
      alt: product.title
    });
  }

  return images;
}

function createProductPrompt(baseProduct: any, niche: string, targetAudience: string, storeStyle: string, themeColor: string) {
  return `Create compelling e-commerce content for a ${niche} product targeting ${targetAudience}.

Product: ${baseProduct.name}
Base Price: $${baseProduct.price}
Style: ${storeStyle}
Theme Color: ${themeColor}

Return ONLY this JSON format:
{
  "title": "60 character max benefit-focused title",
  "description": "500-800 word compelling description with emojis and <span style='color:${themeColor}'>highlighted text</span>",
  "features": ["feature 1", "feature 2", "feature 3", "feature 4"],
  "benefits": ["benefit 1", "benefit 2", "benefit 3"],
  "recommendedPrice": ${Math.floor(Math.random() * (80 - 15) + 15)}
}`;
}

function generateVariants(baseProduct: any, basePrice: number) {
  const variants = [];
  const colors = ['Black', 'White', 'Red', 'Blue'];
  const sizes = ['Small', 'Medium', 'Large'];
  
  for (let i = 0; i < 3; i++) {
    variants.push({
      title: `${colors[i]} / ${sizes[i]}`,
      price: basePrice + (Math.random() * 10 - 5),
      inventory_quantity: Math.floor(Math.random() * 100) + 50,
      option1: colors[i],
      option2: sizes[i]
    });
  }
  
  return variants;
}

function getNicheBaseProducts(niche: string) {
  const productDatabase = {
    'tech': [
      { id: '1', name: 'Fast Wireless Charging Pad', price: 34.99 },
      { id: '2', name: 'Noise-Cancelling Bluetooth Earbuds', price: 129.99 },
      { id: '3', name: 'RGB LED Strip Lights', price: 39.99 },
      { id: '4', name: 'Portable Power Bank', price: 59.99 },
      { id: '5', name: 'Fitness Tracking Smartwatch', price: 249.99 },
      { id: '6', name: 'Portable Bluetooth Speaker', price: 79.99 },
      { id: '7', name: 'USB-C Hub with 4K HDMI', price: 49.99 },
      { id: '8', name: 'LED Ring Light', price: 34.99 },
      { id: '9', name: 'Security Camera with Night Vision', price: 99.99 },
      { id: '10', name: 'Magnetic Wireless Car Mount', price: 29.99 }
    ],
    'kitchen': [
      { id: '1', name: 'Smart Kitchen Scale', price: 39.99 },
      { id: '2', name: 'Silicone Cooking Set', price: 29.99 },
      { id: '3', name: 'Electric Pressure Cooker', price: 89.99 },
      { id: '4', name: 'Air Fryer Oven', price: 149.99 },
      { id: '5', name: 'Coffee Maker', price: 199.99 },
      { id: '6', name: 'Herb Garden Kit', price: 79.99 },
      { id: '7', name: 'Non-Stick Cookware', price: 299.99 },
      { id: '8', name: 'Glass Storage Set', price: 49.99 },
      { id: '9', name: 'Spice Grinder', price: 34.99 },
      { id: '10', name: 'Silicone Baking Mats', price: 24.99 }
    ],
    'pets': [
      { id: '1', name: 'Smart Pet Feeder', price: 89.99 },
      { id: '2', name: 'Interactive Dog Toy', price: 34.99 },
      { id: '3', name: 'Cat Water Fountain', price: 49.99 },
      { id: '4', name: 'GPS Pet Tracker', price: 79.99 },
      { id: '5', name: 'Pet Grooming Brush', price: 24.99 },
      { id: '6', name: 'Orthopedic Pet Bed', price: 69.99 },
      { id: '7', name: 'Treat Dispensing Ball', price: 19.99 },
      { id: '8', name: 'Pet Safety Harness', price: 39.99 },
      { id: '9', name: 'Smart Training Collar', price: 99.99 },
      { id: '10', name: 'Automatic Pet Door', price: 159.99 }
    ]
  };

  // Use correct niche mapping and fallback to tech if not found
  return productDatabase[niche.toLowerCase()] || productDatabase['tech'];
}

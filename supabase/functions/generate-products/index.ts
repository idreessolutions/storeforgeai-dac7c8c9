import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { niche, targetAudience, businessType, storeStyle, themeColor, customInfo } = await req.json();
    console.log('✅ Generating 10 niche-specific winning products with DALL·E prompts for:', {
      niche,
      targetAudience,
      businessType,
      storeStyle,
      themeColor
    });

    // Generate 10 unique products with AI for the specific niche and preferences
    const products = await generateNicheSpecificProducts(niche, targetAudience, businessType, storeStyle, themeColor, customInfo);

    return new Response(JSON.stringify({ 
      success: true, 
      products: products,
      message: `Generated 10 winning ${niche} products with DALL·E 3 prompts for ${targetAudience}`
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

// Generate niche-specific products using GPT-4 with all user preferences
async function generateNicheSpecificProducts(niche: string, targetAudience: string, businessType: string, storeStyle: string, themeColor: string, customInfo?: string) {
  console.log(`🤖 Using GPT-4 to generate 10 winning ${niche} products for ${targetAudience}...`);
  
  if (!openAIApiKey) {
    console.log('⚠️ OpenAI API key not found, using fallback generation');
    return generateFallbackProducts(niche);
  }

  try {
    // Create detailed context for GPT-4
    const contextInfo = {
      niche,
      targetAudience: targetAudience || 'general consumers',
      businessType: businessType || 'e-commerce',
      storeStyle: storeStyle || 'modern',
      themeColor: themeColor || '#1E40AF',
      customInfo: customInfo || ''
    };

    console.log('🎯 Using detailed context for product generation:', contextInfo);

    // Use GPT-4 to generate niche-specific products with DALL·E prompts
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert e-commerce product curator and DALL·E prompt engineer. Generate exactly 10 unique, trending, winning products for a specific niche with detailed DALL·E 3 image prompts. Each product must be highly relevant to the niche and target audience.`
          },
          {
            role: 'user',
            content: `Generate 10 winning, trending products for this specific context:

NICHE: ${niche}
TARGET AUDIENCE: ${targetAudience}
BUSINESS TYPE: ${businessType}
STORE STYLE: ${storeStyle}
THEME COLOR: ${themeColor}
${customInfo ? `CUSTOM INFO: ${customInfo}` : ''}

For each product, create:
1. A specific, compelling product title relevant to ${niche}
2. Price between $15-80 (appropriate for ${targetAudience})
3. Detailed description highlighting benefits for ${targetAudience}
4. 4-5 key features specific to ${niche}
5. 3-4 main benefits for ${targetAudience}
6. DETAILED DALL·E 3 image prompt that shows the exact product in a ${storeStyle} style for ${targetAudience}

Each DALL·E prompt should be specific, realistic, and show the actual product being used by or relevant to ${targetAudience}. Make prompts detailed but under 400 characters.

Return ONLY a JSON array with exactly 10 products:
[
  {
    "title": "Specific product name for ${niche}",
    "price": 45.99,
    "description": "Compelling description for ${targetAudience}",
    "features": ["feature1", "feature2", "feature3", "feature4"],
    "benefits": ["benefit1", "benefit2", "benefit3"],
    "dalle_prompt": "Professional product photo of [specific product] being used by ${targetAudience}, ${storeStyle} setting, high quality, realistic lighting"
  }
]

Make all products highly specific to ${niche} and perfect for ${targetAudience}.`
          }
        ],
        temperature: 0.8,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      console.log('🎯 GPT-4 response preview:', aiResponse.substring(0, 200) + '...');
      
      try {
        // Extract JSON from AI response
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const aiProducts = JSON.parse(jsonMatch[0]);
          console.log(`✅ GPT-4 generated ${aiProducts.length} niche-specific products`);
          
          // Process AI-generated products and add images using their DALL·E prompts
          const products = [];
          for (let i = 0; i < Math.min(10, aiProducts.length); i++) {
            const aiProduct = aiProducts[i];
            
            console.log(`🎨 Generating images for: ${aiProduct.title}`);
            console.log(`📝 Using DALL·E prompt: ${aiProduct.dalle_prompt}`);
            
            // Generate images using the AI-provided DALL·E prompt
            const images = await generateImagesWithCustomPrompt(aiProduct.dalle_prompt, aiProduct.title, niche, contextInfo);
            
            const product = {
              title: aiProduct.title,
              description: aiProduct.description,
              detailed_description: aiProduct.description,
              price: parseFloat(String(aiProduct.price)),
              images: images,
              gif_urls: [],
              video_url: '',
              features: aiProduct.features || [],
              benefits: aiProduct.benefits || [],
              target_audience: targetAudience,
              shipping_info: 'Fast worldwide shipping, arrives in 7-14 days',
              return_policy: '30-day money-back guarantee',
              variants: generateSmartVariants(aiProduct.price, niche, i),
              handle: generateHandle(aiProduct.title),
              product_type: `${niche} Products`,
              vendor: 'Premium Store',
              tags: `winning-product, trending, bestseller, ${niche.toLowerCase()}, hot-product, ${targetAudience.toLowerCase().replace(/\s+/g, '-')}`,
              category: niche,
              dalle_prompt_used: aiProduct.dalle_prompt, // Store for logging
              context_info: contextInfo // Store user preferences
            };
            
            products.push(product);
            console.log(`✅ Generated niche-specific product ${i + 1}: ${aiProduct.title} with ${images.length} images`);
          }
          
          return products;
        } else {
          console.log('⚠️ Could not extract JSON from GPT-4 response');
          throw new Error('Invalid JSON format from GPT-4');
        }
      } catch (parseError) {
        console.log('⚠️ Failed to parse GPT-4 response:', parseError.message);
        throw parseError;
      }
    } else {
      const errorText = await response.text();
      console.log('⚠️ GPT-4 API error:', response.status, errorText);
      throw new Error(`GPT-4 API error: ${response.status}`);
    }
  } catch (error) {
    console.log('⚠️ GPT-4 generation failed:', error.message);
    throw error;
  }
}

// Generate images using custom DALL·E prompts from GPT-4
async function generateImagesWithCustomPrompt(dallePrompt: string, productTitle: string, niche: string, contextInfo: any): Promise<string[]> {
  const images: string[] = [];
  
  if (!openAIApiKey) {
    console.log('⚠️ No OpenAI key, using niche-specific fallback images');
    return getNicheSpecificFallbackImages(productTitle, niche, contextInfo, 6);
  }

  try {
    console.log(`🎨 Generating 6 unique images for: ${productTitle}`);
    console.log(`📝 Base DALL·E prompt: ${dallePrompt}`);
    
    // Create variations of the base prompt for different angles/styles
    const promptVariations = [
      dallePrompt, // Original prompt
      `${dallePrompt}, close-up detail shot, macro photography`,
      `${dallePrompt}, lifestyle photography, in-use scenario`,
      `${dallePrompt}, product packaging, unboxing presentation`,
      `${dallePrompt}, multiple angles view, product showcase`,
      `${dallePrompt}, ${contextInfo.storeStyle} environment, professional lighting`
    ];

    // Generate up to 6 images with variations
    for (let i = 0; i < Math.min(6, promptVariations.length); i++) {
      try {
        console.log(`🖼️ Generating image ${i + 1}/6: ${promptVariations[i].substring(0, 80)}...`);
        
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: promptVariations[i],
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            style: 'natural'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data?.[0]?.url) {
            images.push(data.data[0].url);
            console.log(`✅ Generated custom image ${i + 1} for ${productTitle}`);
          }
        } else {
          const errorText = await response.text();
          console.log(`⚠️ DALL·E image ${i + 1} failed: ${response.status} - ${errorText.substring(0, 100)}`);
        }
        
        // Rate limit delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.log(`⚠️ Error generating image ${i + 1}:`, error.message);
      }
    }
  } catch (error) {
    console.log(`⚠️ DALL·E 3 generation failed:`, error.message);
  }

  // Add niche-specific fallback images if needed
  if (images.length < 4) {
    console.log(`🔄 Adding niche-specific fallback images (current: ${images.length})`);
    const fallbackImages = getNicheSpecificFallbackImages(productTitle, niche, contextInfo, 6 - images.length);
    images.push(...fallbackImages);
  }

  console.log(`📸 Total images for ${productTitle}: ${images.length} (${images.filter(img => img.includes('oaidalleapiprodscus')).length} from DALL·E 3)`);
  return images.slice(0, 6);
}

// Get niche-specific fallback images based on user preferences
function getNicheSpecificFallbackImages(productTitle: string, niche: string, contextInfo: any, count: number): string[] {
  const title = productTitle.toLowerCase();
  const nicheKey = niche.toLowerCase();
  
  console.log(`🔄 Getting niche-specific fallback images for ${niche} targeting ${contextInfo.targetAudience}`);
  
  // Niche-specific image collections
  const nicheImageMap: { [key: string]: string[] } = {
    'pet': [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1024&h=1024&fit=crop'
    ],
    'fitness': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=1024&h=1024&fit=crop'
    ],
    'kitchen': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1585515656811-b3806e19e75b?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1024&h=1024&fit=crop'
    ],
    'tech': [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1592659762303-90081d34b277?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1560472355-536de3962603?w=1024&h=1024&fit=crop'
    ],
    'beauty': [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1024&h=1024&fit=crop'
    ],
    'home': [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1024&h=1024&fit=crop'
    ]
  };

  // Find best matching niche images
  let selectedImages: string[] = [];
  
  // Check for exact niche match first
  if (nicheImageMap[nicheKey]) {
    selectedImages = [...nicheImageMap[nicheKey]];
  } else {
    // Check for partial matches in niche name
    for (const [key, images] of Object.entries(nicheImageMap)) {
      if (nicheKey.includes(key) || key.includes(nicheKey)) {
        selectedImages = [...images];
        break;
      }
    }
  }

  // Default to tech images if no match
  if (selectedImages.length === 0) {
    selectedImages = [...nicheImageMap['tech']];
  }

  // Duplicate and return required count
  while (selectedImages.length < count) {
    selectedImages.push(...selectedImages);
  }

  return selectedImages.slice(0, count);
}

// Fallback product generation for any niche
function generateFallbackProducts(niche: string) {
  console.log(`🔄 Generating fallback products for ${niche} niche`);
  
  const products = [];
  const baseProducts = [
    'Smart Premium', 'Professional Advanced', 'Ultra Modern', 'Elite Pro',
    'Innovative Smart', 'Premium Quality', 'Advanced Tech', 'Superior Design',
    'Revolutionary New', 'Next-Gen Smart'
  ];

  const productTypes = [
    'System', 'Device', 'Tool', 'Kit', 'Set', 'Solution', 'Equipment', 'Accessory', 'Product', 'Technology'
  ];

  for (let i = 0; i < 10; i++) {
    const baseProduct = baseProducts[i];
    const productType = productTypes[i];
    const title = `${baseProduct} ${niche} ${productType}`;
    const price = parseFloat((Math.random() * (75 - 20) + 20).toFixed(2));

    const product = {
      title: title,
      description: `Revolutionary ${title} designed for ${niche} enthusiasts. Features advanced technology and premium materials for superior performance and results.`,
      detailed_description: `Transform your ${niche} experience with this innovative ${title}. Built with cutting-edge technology and premium materials for exceptional performance.`,
      price: price,
      images: getNicheSpecificFallbackImages(title, niche, { targetAudience: 'general', storeStyle: 'modern' }, 6),
      gif_urls: [],
      video_url: '',
      features: [`Advanced ${niche} technology`, 'Premium materials', 'Easy to use', 'Durable construction', 'Professional results'],
      benefits: ['Saves time', 'Improves results', 'Easy maintenance', 'Long-lasting'],
      target_audience: `${niche} enthusiasts and professionals`,
      shipping_info: 'Fast worldwide shipping, arrives in 7-14 days',
      return_policy: '30-day money-back guarantee',
      variants: generateSmartVariants(price, niche, i),
      handle: generateHandle(title),
      product_type: `${niche} Products`,
      vendor: 'Premium Store',
      tags: `winning-product, trending, bestseller, ${niche.toLowerCase()}, hot-product`,
      category: niche,
      dalle_prompt_used: `Professional product photo of ${title}, modern style, high quality`,
      context_info: { niche, targetAudience: 'general', storeStyle: 'modern' }
    };
    
    products.push(product);
  }
  
  return products;
}

// Generate smart variants based on niche and product
function generateSmartVariants(basePrice: number, niche: string, index: number): any[] {
  const variantTypes = [
    [
      { title: 'Standard', price: basePrice },
      { title: 'Premium', price: Math.min(80, basePrice + 15) },
      { title: 'Pro', price: Math.min(80, basePrice + 25) }
    ],
    [
      { title: 'Small', price: basePrice },
      { title: 'Medium', price: Math.min(80, basePrice + 10) },
      { title: 'Large', price: Math.min(80, basePrice + 18) }
    ],
    [
      { title: 'Basic', price: basePrice },
      { title: 'Advanced', price: Math.min(80, basePrice + 12) }
    ]
  ];

  const selectedVariants = variantTypes[index % variantTypes.length];
  
  return selectedVariants.map((variant, variantIndex) => ({
    ...variant,
    price: Math.max(15, Math.min(80, variant.price)),
    sku: `${niche.substring(0,3).toUpperCase()}-${String(index + 1).padStart(2, '0')}-${String(variantIndex + 1).padStart(2, '0')}`
  }));
}

function generateHandle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

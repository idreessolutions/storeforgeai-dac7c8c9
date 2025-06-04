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
    console.log('✅ Generating 10 niche-specific winning products for:', {
      niche,
      targetAudience,
      businessType,
      storeStyle,
      themeColor
    });

    // Validate required inputs
    if (!niche || !targetAudience) {
      throw new Error('Niche and target audience are required');
    }

    // Try to generate products with AI first, but have robust fallback
    let products: any[] = [];
    
    try {
      if (openAIApiKey) {
        console.log('🤖 Using GPT-4 + DALL·E for niche-specific product generation...');
        products = await generateNicheSpecificProducts(niche, targetAudience, businessType, storeStyle, themeColor, customInfo);
      } else {
        console.log('⚠️ OpenAI API key not found, using enhanced fallback generation');
        throw new Error('OpenAI API key not available');
      }
    } catch (aiError) {
      console.log('⚠️ AI generation failed, using enhanced fallback:', aiError.message);
      products = generateEnhancedFallbackProducts(niche, targetAudience, businessType, storeStyle, themeColor, customInfo);
    }

    // Ensure we have exactly 10 products
    if (products.length < 10) {
      console.log(`⚠️ Only ${products.length} products generated, filling with additional products...`);
      const additionalProducts = generateEnhancedFallbackProducts(niche, targetAudience, businessType, storeStyle, themeColor, customInfo);
      products = [...products, ...additionalProducts.slice(0, 10 - products.length)];
    }

    products = products.slice(0, 10); // Ensure exactly 10

    console.log(`✅ Final product count: ${products.length} niche-specific products for ${niche} targeting ${targetAudience}`);

    return new Response(JSON.stringify({ 
      success: true, 
      products: products,
      message: `Generated 10 winning ${niche} products for ${targetAudience}`,
      method_used: openAIApiKey ? 'AI + Fallback' : 'Enhanced Fallback'
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

// Generate niche-specific products using GPT-4 with DALL·E image generation
async function generateNicheSpecificProducts(niche: string, targetAudience: string, businessType: string, storeStyle: string, themeColor: string, customInfo?: string) {
  console.log(`🤖 Using GPT-4 to generate 10 winning ${niche} products for ${targetAudience}...`);
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not available');
  }

  const contextInfo = {
    niche,
    targetAudience,
    businessType: businessType || 'e-commerce',
    storeStyle: storeStyle || 'modern',
    themeColor: themeColor || '#1E40AF',
    customInfo: customInfo || ''
  };

  console.log('🎯 Using detailed context for product generation:', contextInfo);

  // Use GPT-4 to generate niche-specific products with detailed prompts
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
          content: `You are an expert e-commerce product curator specializing in creating winning products for specific niches. You must generate exactly 10 unique products that are perfectly tailored to the user's specifications.

CRITICAL REQUIREMENTS:
- ALL products must be directly related to the "${niche}" niche
- ALL products must target "${targetAudience}" specifically  
- Each product needs a detailed DALL·E 3 prompt that shows the EXACT product
- Descriptions must be 400-500 words long and compelling
- Prices must be between $15-80

Return ONLY valid JSON with no additional text.`
        },
        {
          role: 'user',
          content: `Generate exactly 10 winning products for this SPECIFIC context:

NICHE: "${niche}" (ALL products must fit this niche exactly)
TARGET AUDIENCE: "${targetAudience}" (optimize everything for this audience)
BUSINESS TYPE: "${businessType}"
STORE STYLE: "${storeStyle}" 
THEME COLOR: "${themeColor}"
${customInfo ? `ADDITIONAL REQUIREMENTS: "${customInfo}"` : ''}

For each product, create:

1. Title: Must be specific to ${niche} and appeal to ${targetAudience}
2. Price: Between $15-80, appropriate for ${targetAudience}
3. Description: 400-500 words highlighting benefits for ${targetAudience} in ${niche}
4. Features: 4-5 specific features relevant to ${niche}
5. Benefits: 3-4 benefits that ${targetAudience} would value
6. DALL·E Prompt: Detailed prompt showing the EXACT product in use by ${targetAudience}

DALL·E Prompts must:
- Show the specific product clearly
- Include ${targetAudience} using it (when relevant)
- Match ${storeStyle} aesthetic
- Be under 400 characters
- Be realistic and professional

Return ONLY this JSON structure:
[
  {
    "title": "Specific ${niche} product name",
    "price": 45.99,
    "description": "Detailed 400-500 word description targeting ${targetAudience} in ${niche} market...",
    "features": ["feature1", "feature2", "feature3", "feature4"],
    "benefits": ["benefit1", "benefit2", "benefit3"],
    "dalle_prompt": "Professional product photo showing [specific product] being used by ${targetAudience}, ${storeStyle} setting, realistic lighting, high quality"
  }
]

ALL 10 products must be perfectly aligned with ${niche} for ${targetAudience}.`
        }
      ],
      temperature: 0.8,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log('⚠️ GPT-4 API error:', response.status, errorText);
    throw new Error(`GPT-4 API error: ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  console.log('🎯 GPT-4 response preview:', aiResponse.substring(0, 200) + '...');
  
  // Extract JSON from AI response
  const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON format from GPT-4');
  }
  
  const aiProducts = JSON.parse(jsonMatch[0]);
  console.log(`✅ GPT-4 generated ${aiProducts.length} niche-specific products`);
  
  // Process AI-generated products and generate matching images
  const products = [];
  for (let i = 0; i < Math.min(10, aiProducts.length); i++) {
    const aiProduct = aiProducts[i];
    
    console.log(`🎨 Processing product ${i + 1}: ${aiProduct.title}`);
    console.log(`📝 Description length: ${aiProduct.description?.length || 0} chars`);
    console.log(`🖼️ DALL·E prompt: ${aiProduct.dalle_prompt}`);
    
    // Generate product-specific images using the AI-provided DALL·E prompt
    const images = await generateProductSpecificImages(aiProduct.dalle_prompt, aiProduct.title, niche, contextInfo);
    
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
      dalle_prompt_used: aiProduct.dalle_prompt,
      context_info: contextInfo
    };
    
    products.push(product);
    console.log(`✅ Generated niche-specific product ${i + 1}: ${aiProduct.title} with ${images.length} matching images`);
  }
  
  return products;
}

// Generate product-specific images using DALL·E 3
async function generateProductSpecificImages(dallePrompt: string, productTitle: string, niche: string, contextInfo: any): Promise<string[]> {
  const images: string[] = [];
  
  if (!openAIApiKey) {
    console.log('⚠️ No OpenAI key, using niche-specific fallback images');
    return getNicheSpecificFallbackImages(productTitle, niche, contextInfo, 6);
  }

  try {
    console.log(`🎨 Generating 6 product-specific images for: ${productTitle}`);
    console.log(`📝 Using DALL·E prompt: ${dallePrompt}`);
    
    // Create variations of the prompt for different angles
    const promptVariations = [
      dallePrompt, // Original
      `${dallePrompt}, close-up product details, macro photography`,
      `${dallePrompt}, lifestyle setting, in-use scenario`, 
      `${dallePrompt}, product packaging view, unboxing presentation`,
      `${dallePrompt}, multiple angles, product showcase`,
      `${dallePrompt}, professional studio lighting, commercial photography`
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
            console.log(`✅ Generated product-specific image ${i + 1} for ${productTitle}`);
          } else {
            console.log(`⚠️ No image URL in DALL·E response ${i + 1}`);
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

  // Add fallback images if needed
  if (images.length < 4) {
    console.log(`🔄 Adding product-specific fallback images (current: ${images.length})`);
    const fallbackImages = getNicheSpecificFallbackImages(productTitle, niche, contextInfo, 6 - images.length);
    images.push(...fallbackImages);
  }

  console.log(`📸 Total images for ${productTitle}: ${images.length} (${images.filter(img => img.includes('oaidalleapiprodscus')).length} from DALL·E 3)`);
  return images.slice(0, 6);
}

// Enhanced fallback product generation with proper niche matching
function generateEnhancedFallbackProducts(niche: string, targetAudience?: string, businessType?: string, storeStyle?: string, themeColor?: string, customInfo?: string) {
  console.log(`🔄 Generating enhanced fallback products for ${niche} niche targeting ${targetAudience}`);
  
  const products = [];
  
  // Enhanced niche-specific product templates that actually match the niche
  const nicheProductMap = getNicheSpecificProductTemplates();
  
  // Get products for the specific niche
  const nicheKey = niche.toLowerCase();
  let nicheProducts = findBestNicheMatch(nicheKey, nicheProductMap);
  
  // If we don't have enough variety, create more products based on the niche
  if (nicheProducts.length < 10) {
    nicheProducts = generateMoreNicheProducts(niche, targetAudience, nicheProducts);
  }
  
  for (let i = 0; i < 10; i++) {
    const template = nicheProducts[i % nicheProducts.length];
    const title = `${template.base} ${template.type}`;
    const price = template.price + (Math.random() * 10 - 5); // Add variation

    // Generate detailed description
    const detailedDescription = generateDetailedDescription(title, template.desc, niche, targetAudience, customInfo);

    const product = {
      title: title,
      description: detailedDescription,
      detailed_description: detailedDescription,
      price: Math.max(15, Math.min(80, price)),
      images: getNicheSpecificFallbackImages(title, niche, { targetAudience, storeStyle }, 6),
      gif_urls: [],
      video_url: '',
      features: generateNicheFeatures(template, niche, targetAudience),
      benefits: generateNicheBenefits(template, niche, targetAudience),
      target_audience: targetAudience || `${niche} enthusiasts`,
      shipping_info: 'Fast worldwide shipping, arrives in 7-14 days',
      return_policy: '30-day money-back guarantee',
      variants: generateSmartVariants(price, niche, i),
      handle: generateHandle(title),
      product_type: `${niche} Products`,
      vendor: 'Premium Store',
      tags: `winning-product, trending, bestseller, ${niche.toLowerCase()}, hot-product, ${(targetAudience || '').toLowerCase().replace(/\s+/g, '-')}`,
      category: niche,
      dalle_prompt_used: `Professional product photo of ${title}, ${storeStyle || 'modern'} style, high quality`,
      context_info: { niche, targetAudience, businessType, storeStyle, themeColor, customInfo }
    };
    
    products.push(product);
  }
  
  console.log(`✅ Generated 10 enhanced fallback products for ${niche} targeting ${targetAudience}`);
  return products;
}

// Get niche-specific product templates
function getNicheSpecificProductTemplates() {
  return {
    'tech': [
      { base: 'Smart Wireless', type: 'Charging Pad', desc: 'Fast wireless charging with LED indicators and overheating protection', price: 34.99 },
      { base: 'Premium Bluetooth', type: 'Earbuds', desc: 'Noise-cancelling earbuds with 8-hour battery life', price: 89.99 },
      { base: 'Portable Power', type: 'Bank', desc: '20,000mAh capacity with fast charging technology', price: 49.99 },
      { base: 'Smart Fitness', type: 'Tracker', desc: 'Advanced health monitoring with GPS and heart rate tracking', price: 129.99 },
      { base: 'Wireless Gaming', type: 'Mouse', desc: 'High-precision gaming mouse with RGB lighting', price: 59.99 },
      { base: 'USB-C Hub', type: 'Adapter', desc: 'Multi-port hub with 4K HDMI and fast charging', price: 39.99 },
      { base: 'LED Ring', type: 'Light', desc: 'Professional lighting for content creation and video calls', price: 29.99 },
      { base: 'Security Camera', type: 'System', desc: 'HD night vision camera with motion detection', price: 79.99 },
      { base: 'Magnetic Phone', type: 'Mount', desc: 'Universal car mount with wireless charging capability', price: 24.99 },
      { base: 'Bluetooth Speaker', type: 'Pro', desc: 'Waterproof speaker with 360-degree sound', price: 69.99 }
    ],
    'fitness': [
      { base: 'Resistance', type: 'Band Set', desc: 'Complete workout system with multiple resistance levels', price: 29.99 },
      { base: 'Yoga', type: 'Mat Pro', desc: 'Premium non-slip mat with alignment guides', price: 49.99 },
      { base: 'Adjustable', type: 'Dumbbells', desc: 'Space-saving dumbbells with quick weight adjustment', price: 199.99 },
      { base: 'Foam', type: 'Roller', desc: 'High-density roller for muscle recovery and flexibility', price: 34.99 },
      { base: 'Balance', type: 'Ball', desc: 'Anti-burst exercise ball for core strengthening', price: 24.99 },
      { base: 'Pull-up', type: 'Bar', desc: 'Doorway pull-up bar with multiple grip positions', price: 39.99 },
      { base: 'Kettlebell', type: 'Set', desc: 'Cast iron kettlebells for strength and cardio training', price: 89.99 },
      { base: 'Ab', type: 'Wheel', desc: 'Dual-wheel design for core strengthening exercises', price: 19.99 },
      { base: 'Jump', type: 'Rope', desc: 'Speed rope with adjustable length and ball bearings', price: 14.99 },
      { base: 'Massage', type: 'Gun', desc: 'Percussion therapy device for muscle recovery', price: 149.99 }
    ],
    'kitchen': [
      { base: 'Air Fryer', type: 'Oven', desc: 'Multi-function air fryer with digital controls', price: 89.99 },
      { base: 'Silicone Cooking', type: 'Utensil Set', desc: 'Heat-resistant utensils safe for all cookware', price: 24.99 },
      { base: 'Digital Kitchen', type: 'Scale', desc: 'Precision scale with nutritional tracking app', price: 34.99 },
      { base: 'Pressure', type: 'Cooker', desc: '8-in-1 multi-cooker for quick, healthy meals', price: 79.99 },
      { base: 'Coffee', type: 'Maker Pro', desc: 'Programmable coffee maker with built-in grinder', price: 129.99 },
      { base: 'Glass Food Storage', type: 'Set', desc: 'Airtight containers for meal prep and storage', price: 39.99 },
      { base: 'Chef\'s Knife', type: 'Set', desc: 'Professional-grade knives with ergonomic handles', price: 69.99 },
      { base: 'Herb Garden', type: 'Kit', desc: 'Indoor hydroponic system for fresh herbs', price: 49.99 },
      { base: 'Spice', type: 'Grinder', desc: 'Electric grinder for coffee beans and spices', price: 29.99 },
      { base: 'Silicone Baking', type: 'Mat Set', desc: 'Reusable non-stick mats for baking and cooking', price: 19.99 }
    ],
    'beauty': [
      { base: 'LED Face', type: 'Mask', desc: 'Red light therapy mask for anti-aging and acne treatment', price: 79.99 },
      { base: 'Jade', type: 'Roller Set', desc: 'Facial massage tools for lymphatic drainage', price: 24.99 },
      { base: 'Vitamin C', type: 'Serum', desc: 'Brightening serum with hyaluronic acid', price: 34.99 },
      { base: 'Silk', type: 'Pillowcase', desc: 'Mulberry silk pillowcase for hair and skin care', price: 39.99 },
      { base: 'Makeup Brush', type: 'Set Pro', desc: 'Professional makeup brushes with carrying case', price: 49.99 },
      { base: 'Collagen', type: 'Supplement', desc: 'Marine collagen peptides for skin elasticity', price: 29.99 },
      { base: 'Facial', type: 'Steamer', desc: 'Nano ionic steamer for deep pore cleansing', price: 59.99 },
      { base: 'Retinol', type: 'Night Cream', desc: 'Anti-aging cream with pure retinol', price: 44.99 },
      { base: 'Eye', type: 'Patches', desc: 'Hydrogel patches for dark circles and puffiness', price: 19.99 },
      { base: 'Face', type: 'Cleanser', desc: 'Gentle foaming cleanser with natural ingredients', price: 24.99 }
    ],
    'home': [
      { base: 'Smart', type: 'Diffuser', desc: 'Ultrasonic essential oil diffuser with app control', price: 49.99 },
      { base: 'Memory Foam', type: 'Pillow', desc: 'Ergonomic pillow with cooling gel layer', price: 39.99 },
      { base: 'Bamboo', type: 'Storage Organizer', desc: 'Eco-friendly storage solutions for any room', price: 29.99 },
      { base: 'LED Strip', type: 'Lights', desc: 'Color-changing smart lights with voice control', price: 34.99 },
      { base: 'Weighted', type: 'Blanket', desc: 'Anxiety-reducing blanket for better sleep', price: 79.99 },
      { base: 'Air', type: 'Purifier', desc: 'HEPA filter air purifier for allergen removal', price: 89.99 },
      { base: 'Blackout', type: 'Curtains', desc: 'Thermal insulated curtains for energy savings', price: 44.99 },
      { base: 'Robot', type: 'Vacuum', desc: 'Smart robot vacuum with mapping technology', price: 199.99 },
      { base: 'Humidifier', type: 'Pro', desc: 'Cool mist humidifier with humidity control', price: 59.99 },
      { base: 'Smart', type: 'Thermostat', desc: 'WiFi thermostat with energy-saving features', price: 129.99 }
    ],
    'pet': [
      { base: 'Automatic Pet', type: 'Feeder', desc: 'Smart feeder with portion control and scheduling', price: 89.99 },
      { base: 'GPS Pet', type: 'Tracker', desc: 'Real-time location tracking with health monitoring', price: 79.99 },
      { base: 'Orthopedic Pet', type: 'Bed', desc: 'Memory foam bed for joint support and comfort', price: 59.99 },
      { base: 'Interactive Laser', type: 'Toy', desc: 'Automatic laser toy for mental stimulation', price: 34.99 },
      { base: 'Self-Cleaning', type: 'Litter Box', desc: 'Automated litter box with odor control', price: 199.99 },
      { base: 'Pet Water', type: 'Fountain', desc: 'Filtered water fountain encouraging hydration', price: 44.99 },
      { base: 'Dog Training', type: 'Collar', desc: 'Vibration training collar with remote control', price: 69.99 },
      { base: 'Cat Puzzle', type: 'Feeder', desc: 'Slow feeding puzzle for mental enrichment', price: 24.99 },
      { base: 'Pet Grooming', type: 'Kit', desc: 'Professional grooming tools for home use', price: 39.99 },
      { base: 'Car Safety', type: 'Harness', desc: 'Crash-tested harness for safe car travel', price: 29.99 }
    ]
  };
}

// Find the best niche match based on the provided niche key
function findBestNicheMatch(nicheKey: string, nicheProductMap: any) {
  // Direct match
  if (nicheProductMap[nicheKey]) {
    return [...nicheProductMap[nicheKey]];
  }
  
  // Partial matches
  for (const [key, products] of Object.entries(nicheProductMap)) {
    if (nicheKey.includes(key) || key.includes(nicheKey)) {
      return [...products] as any[];
    }
  }
  
  // Default to tech if no match
  return [...nicheProductMap['tech']];
}

// Generate more niche products based on the niche theme
function generateMoreNicheProducts(niche: string, targetAudience: string, existingProducts: any[]) {
  // Generate additional products based on the niche theme
  const baseProduct = existingProducts[0] || { base: 'Premium', type: 'Product', desc: 'High-quality product', price: 49.99 };
  const moreProducts = [];
  
  const variations = ['Pro', 'Elite', 'Advanced', 'Premium', 'Smart', 'Deluxe'];
  const types = ['System', 'Kit', 'Set', 'Tool', 'Device', 'Accessory'];
  
  for (let i = 0; i < 10; i++) {
    const variation = variations[i % variations.length];
    const type = types[i % types.length];
    moreProducts.push({
      base: `${variation} ${niche}`,
      type: type,
      desc: `Advanced ${niche.toLowerCase()} solution for ${targetAudience}`,
      price: 25 + (i * 8)
    });
  }
  
  return [...existingProducts, ...moreProducts];
}

// Generate detailed description for a product
function generateDetailedDescription(title: string, baseDesc: string, niche: string, targetAudience: string, customInfo?: string): string {
  const descriptions = [
    `Transform your ${niche.toLowerCase()} experience with the ${title}. ${baseDesc}`,
    `Designed specifically for ${targetAudience}, this innovative product delivers exceptional results.`,
    `Whether you're a beginner or expert in ${niche.toLowerCase()}, this ${title} provides the perfect solution.`,
    `Built with premium materials and cutting-edge technology, ensuring durability and performance.`,
    `Join thousands of satisfied ${targetAudience} who have already upgraded their ${niche.toLowerCase()} routine.`,
    customInfo ? `${customInfo} This product perfectly aligns with your specific requirements.` : '',
    `Don't settle for ordinary products. Experience the difference with this professional-grade ${title}.`,
    `Perfect for ${targetAudience} who demand quality, reliability, and outstanding results in their ${niche.toLowerCase()} pursuits.`
  ].filter(Boolean).join(' ');
  
  return descriptions;
}

// Generate niche-specific features for a product
function generateNicheFeatures(template: any, niche: string, targetAudience: string): string[] {
  return [
    `Advanced ${niche.toLowerCase()} technology`,
    `Optimized for ${targetAudience}`,
    'Premium materials and construction',
    'Easy to use and maintain',
    'Professional-grade performance'
  ];
}

// Generate niche-specific benefits for a product
function generateNicheBenefits(template: any, niche: string, targetAudience: string): string[] {
  return [
    `Perfect for ${targetAudience}`,
    `Enhances your ${niche.toLowerCase()} results`,
    'Saves time and effort',
    'Built to last'
  ];
}

// Get niche-specific fallback images based on user preferences
function getNicheSpecificFallbackImages(productTitle: string, niche: string, contextInfo: any, count: number): string[] {
  const title = productTitle.toLowerCase();
  const nicheKey = niche.toLowerCase();
  
  console.log(`🔄 Getting niche-specific fallback images for ${niche} targeting ${contextInfo?.targetAudience || 'general'}`);
  
  // Niche-specific image collections
  const nicheImageMap: { [key: string]: string[] } = {
    'tech': [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1592659762303-90081d34b277?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1560472355-536de3962603?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1024&h=1024&fit=crop'
    ],
    'fitness': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1024&h=1024&fit=crop'
    ],
    'kitchen': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1585515656811-b3806e19e75b?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1024&h=1024&fit=crop'
    ],
    'beauty': [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1024&h=1024&fit=crop'
    ],
    'home': [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1024&h=1024&fit=crop'
    ],
    'pet': [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1444212477490-ca407925329e?w=1024&h=1024&fit=crop'
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

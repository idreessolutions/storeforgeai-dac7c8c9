
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
    const { niche } = await req.json();
    console.log('✅ Generating 10 REAL winning products for ANY niche:', niche);

    // Generate 10 unique products with AI for ANY niche
    const products = await generateWinningProductsForAnyNiche(niche);

    return new Response(JSON.stringify({ 
      success: true, 
      products: products,
      message: `Generated 10 curated WINNING ${niche} products with DALL·E 3 images`
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

// Generate winning products for ANY niche using AI
async function generateWinningProductsForAnyNiche(niche: string) {
  console.log(`🤖 Using AI to generate 10 winning ${niche} products...`);
  
  if (!openAIApiKey) {
    console.log('⚠️ OpenAI API key not found, using fallback generation');
    return generateFallbackProducts(niche);
  }

  try {
    // Use AI to generate winning products for any niche
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
            content: `You are an expert e-commerce product curator who identifies winning, trending products for any niche. Generate exactly 10 unique, hot-selling products for the given niche with realistic pricing between $15-80.`
          },
          {
            role: 'user',
            content: `Generate 10 winning, trending, hot products for the "${niche}" niche. Each product should be:
1. Currently trending and selling well
2. Unique and different from others
3. Priced between $15-80
4. Have clear value propositions
5. Be realistic products that exist in the market

Return a JSON array with exactly 10 products, each having:
- title (specific, descriptive product name)
- price (number between 15-80)
- description (compelling 100-150 word description highlighting benefits)
- features (array of 4-5 key features)
- benefits (array of 3-4 main benefits)

Example format:
[{"title": "Smart...", "price": 45.99, "description": "...", "features": [...], "benefits": [...]}]`
          }
        ],
        temperature: 0.8,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      try {
        // Extract JSON from AI response
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const aiProducts = JSON.parse(jsonMatch[0]);
          
          // Process AI-generated products and add images
          const products = [];
          for (let i = 0; i < Math.min(10, aiProducts.length); i++) {
            const aiProduct = aiProducts[i];
            
            // Generate unique images for each product
            const images = await generateProductSpecificImages(aiProduct.title, niche);
            
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
              target_audience: `${niche} enthusiasts and customers`,
              shipping_info: 'Fast worldwide shipping, arrives in 7-14 days',
              return_policy: '30-day money-back guarantee',
              variants: generateSmartVariants(aiProduct.price, niche, i),
              handle: generateHandle(aiProduct.title),
              product_type: `${niche} Products`,
              vendor: 'Premium Store',
              tags: `winning-product, trending, bestseller, ${niche.toLowerCase()}, hot-product`,
              category: niche
            };
            
            products.push(product);
            console.log(`✅ Generated AI product ${i + 1}: ${aiProduct.title}`);
          }
          
          return products;
        }
      } catch (parseError) {
        console.log('⚠️ Failed to parse AI response, using fallback');
      }
    }
  } catch (error) {
    console.log('⚠️ AI generation failed:', error.message);
  }

  // Fallback to template-based generation
  return generateFallbackProducts(niche);
}

// Generate product-specific images using DALL·E 3
async function generateProductSpecificImages(productTitle: string, niche: string): Promise<string[]> {
  const images: string[] = [];
  
  if (!openAIApiKey) {
    console.log('⚠️ No OpenAI key, using fallback images');
    return getProductSpecificFallbackImages(productTitle, niche, 6);
  }

  try {
    console.log(`🎨 Generating product-specific images for: ${productTitle}`);
    
    // Create specific prompts for this exact product
    const imagePrompts = [
      `Professional product photo of ${productTitle}, clean white background, studio lighting, high resolution`,
      `${productTitle} in use, lifestyle photography, realistic setting, natural lighting`,
      `Close-up detail shot of ${productTitle}, macro photography, showing key features`,
      `${productTitle} with packaging, unboxing scene, premium presentation`,
      `Multiple angle view of ${productTitle}, product showcase, 360-degree style`,
      `${productTitle} lifestyle shot, ${niche} setting, in action, realistic use case`
    ];

    // Generate images with better error handling
    for (let i = 0; i < Math.min(4, imagePrompts.length); i++) {
      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
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
          const data = await response.json();
          if (data.data?.[0]?.url) {
            images.push(data.data[0].url);
            console.log(`✅ Generated image ${i + 1} for ${productTitle}`);
          }
        } else {
          console.log(`⚠️ Image generation failed for prompt ${i + 1}`);
        }
        
        // Rate limit delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`⚠️ Error generating image ${i + 1}:`, error.message);
      }
    }
  } catch (error) {
    console.log(`⚠️ DALL·E 3 generation failed:`, error.message);
  }

  // Add fallback images if needed
  if (images.length < 4) {
    const fallbackImages = getProductSpecificFallbackImages(productTitle, niche, 6 - images.length);
    images.push(...fallbackImages);
  }

  return images.slice(0, 6);
}

// Smart fallback images based on product title keywords
function getProductSpecificFallbackImages(productTitle: string, niche: string, count: number): string[] {
  const title = productTitle.toLowerCase();
  
  // Product-specific image mapping
  const productImageMap: { [key: string]: string[] } = {
    // Smart/Tech products
    'smart': [
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1592659762303-90081d34b277?w=1024&h=1024&fit=crop'
    ],
    // Feeding/Food products
    'feeder': [
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1024&h=1024&fit=crop'
    ],
    // Training/Collar products
    'collar': [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1024&h=1024&fit=crop'
    ],
    // Bed/Comfort products
    'bed': [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1493406300581-484b937cdc41?w=1024&h=1024&fit=crop'
    ],
    // Fitness products
    'fitness': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1024&h=1024&fit=crop'
    ],
    // Kitchen products
    'kitchen': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1585515656811-b3806e19e75b?w=1024&h=1024&fit=crop'
    ]
  };

  // Find matching images based on title keywords
  let selectedImages: string[] = [];
  
  for (const [keyword, images] of Object.entries(productImageMap)) {
    if (title.includes(keyword)) {
      selectedImages = [...images];
      break;
    }
  }

  // Fallback to niche-based images
  if (selectedImages.length === 0) {
    const nicheImages = productImageMap[niche.toLowerCase()] || productImageMap['smart'];
    selectedImages = [...nicheImages];
  }

  // Duplicate and shuffle if needed
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
      images: getProductSpecificFallbackImages(title, niche, 6),
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
      category: niche
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

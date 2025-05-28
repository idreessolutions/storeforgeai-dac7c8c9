
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
    console.log('Generate products request:', { niche });

    // Use OpenAI API for better product generation
    if (openAIApiKey) {
      try {
        console.log('Using OpenAI API for high-quality product generation...');
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
                content: `You are an expert dropshipping product curator who generates winning products that convert well. Create exactly 10 high-quality, trending products for the ${niche} niche.

REQUIREMENTS FOR EACH PRODUCT:
1. TITLE: Short (3-8 words), catchy, benefit-focused, trending keywords
2. DESCRIPTION: 100-150 words focusing on BENEFITS, pain points solved, social proof language
3. PRICE: Realistic dropshipping margins ($15-$89 range, competitive) - MUST BE VALID NUMBERS
4. IMAGES: 6-8 high-quality Unsplash URLs (format: https://images.unsplash.com/photo-[id]?w=800&h=800&fit=crop)
5. VARIANTS: 2-3 realistic options (colors, sizes, bundles) with proper SKUs and VALID PRICES
6. TAGS: trending, SEO-optimized keywords for the niche
7. HANDLE: URL-friendly slug

Focus on products that:
- Solve real problems
- Have viral/trending potential  
- Target emotional triggers
- Use scarcity/urgency language
- Include social proof elements

CRITICAL: All prices must be valid numbers between 15 and 89. No text, no NaN, just numbers.

Return ONLY a valid JSON array of 10 products. No additional text.`
              },
              {
                role: 'user',
                content: `Generate exactly 10 winning dropshipping products for the "${niche}" niche. Each product must be a real, trending item that would convert well. Include:

1. Catchy, benefit-focused titles
2. Compelling descriptions with emotional triggers
3. Realistic dropshipping prices (MUST BE VALID NUMBERS 15-89)
4. 6-8 high-quality Unsplash image URLs per product
5. 2-3 realistic variants with SKUs and VALID NUMERIC PRICES
6. SEO-optimized tags
7. URL-friendly handles

CRITICAL: Ensure all price values are valid numbers, not text or NaN.`
              }
            ],
            temperature: 0.8,
            max_tokens: 8000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('OpenAI response received');
          
          const productsText = data.choices[0].message.content;
          
          try {
            const cleanedText = productsText.replace(/```json\n?|\n?```/g, '').trim();
            const products = JSON.parse(cleanedText);
            console.log(`Successfully parsed ${products.length} products from OpenAI`);
            
            // Ensure we have exactly 10 products and proper structure with valid prices
            const formattedProducts = products.slice(0, 10).map((product, index) => {
              // Ensure valid price
              let basePrice = typeof product.price === 'number' ? product.price : parseFloat(product.price);
              if (isNaN(basePrice) || basePrice < 15) {
                basePrice = 19.99 + (index * 8);
              }
              
              return {
                title: product.title || `${niche} Essential Pro ${index + 1}`,
                description: product.description || `Revolutionary ${niche} product designed for modern lifestyle. Features premium quality materials, innovative design, and proven results. Join thousands of satisfied customers who've transformed their daily routine with this trending solution.`,
                price: basePrice,
                images: product.images && product.images.length > 0 ? product.images : generateNicheImages(niche, index),
                variants: product.variants && product.variants.length > 0 ? 
                  product.variants.map((variant, vIndex) => {
                    let variantPrice = typeof variant.price === 'number' ? variant.price : parseFloat(variant.price);
                    if (isNaN(variantPrice)) {
                      variantPrice = basePrice + (vIndex * 5);
                    }
                    return {
                      title: variant.title || 'Standard',
                      price: variantPrice,
                      sku: variant.sku || `${niche.toUpperCase().substring(0,3)}-${String(index + 1).padStart(3, '0')}-${vIndex}`
                    };
                  }) : [
                  { 
                    title: 'Standard', 
                    price: basePrice, 
                    sku: `${niche.toUpperCase().substring(0,3)}-STD-${String(index + 1).padStart(3, '0')}` 
                  },
                  { 
                    title: 'Premium', 
                    price: basePrice + 15, 
                    sku: `${niche.toUpperCase().substring(0,3)}-PREM-${String(index + 1).padStart(3, '0')}` 
                  }
                ],
                handle: product.handle || generateHandle(product.title || `${niche}-essential-${index + 1}`),
                product_type: product.product_type || niche,
                vendor: product.vendor || 'TrendingDrop',
                tags: product.tags || `${niche}, trending, bestseller, viral, premium quality, limited edition, must have, ${new Date().getFullYear()}`
              };
            });
            
            return new Response(JSON.stringify({ 
              success: true, 
              products: formattedProducts,
              message: `Successfully generated 10 winning ${niche} products using AI`
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } catch (e) {
            console.error('JSON parsing failed, using fallback products:', e);
          }
        }
      } catch (error) {
        console.error('OpenAI request failed, using fallback products:', error);
      }
    }

    // Enhanced fallback to high-quality predefined products
    console.log('Using enhanced high-quality products for', niche);
    const products = generateHighQualityProducts(niche);

    return new Response(JSON.stringify({ 
      success: true, 
      products: products,
      message: `Successfully generated 10 winning ${niche} products`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-products function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateNicheImages(niche: string, index: number) {
  const imageIds = {
    'pet': [
      '1601758228041-f3b2795255f1', '1548199973-03cce0bbc87b', '1583337130417-3346a1be7dee',
      '1587300003388-59208cc962cb', '1518717758536-85ae29035b6d', '1434404893641-4b32449c7717',
      '1415369623593-d6ac4b96a1a8', '1425082933390-1d70bb14e6e5', '1558929996-ba0fd6b28e6c',
      '1588269845-ac3fb5c1b5d9'
    ],
    'home': [
      '1586023492514-a4525193994a', '1560185007-27ef37c67b7a', '1563298723-dcfebfcf6526',
      '1540932239986-30128078f3c0', '1567538096630-e87c99142c6c', '1507003211169-0a1dd7bf2113',
      '1512917774080-887991d1b71a', '1554995207-c18ebf8c2726', '1574269909862-7e1d38d8fcf4',
      '1560185008-b7546b65aa1b'
    ],
    'electronics': [
      '1517765533434-75f4ca5ded2d', '1572635148-5d4e8ad6f2bc', '1530893609608-1d8d7cc3aa0b',
      '1560472354-b33c5c44a43', '1571781926291-c477ebfd024b', '1556909114-f6e7ad7d3136',
      '1563770660-4d3ac67cbdac', '1545579149-b0c4be64b8bb', '1587614203-a3b71edc4d8e',
      '1541523672-c93bb17cd67c'
    ]
  };

  const selectedImages = imageIds[niche.toLowerCase()] || imageIds['electronics'];
  return selectedImages.map(id => `https://images.unsplash.com/photo-${id}?w=800&h=800&fit=crop&crop=center`);
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

function generateHighQualityProducts(niche: string) {
  const winningProducts = {
    'pet': [
      {
        title: "Smart Pet Camera Treat Dispenser",
        description: "Never miss a moment with your furry friend! This revolutionary smart camera lets you watch, talk, and treat your pet from anywhere. Features 1080p HD video, two-way audio, motion alerts, and remote treat dispensing. Over 50,000 pet parents trust this device to keep their pets happy and secure while away. Perfect for separation anxiety and training!",
        price: 89.99,
        images: generateNicheImages('pet', 0),
        variants: [
          { title: "White Camera", price: 89.99, sku: "PET-CAM-WHT-001" },
          { title: "Black Camera", price: 89.99, sku: "PET-CAM-BLK-001" },
          { title: "Camera + Extra Bowl", price: 109.99, sku: "PET-CAM-BUNDLE-001" }
        ],
        handle: "smart-pet-camera-treat-dispenser",
        product_type: "Pet Electronics",
        vendor: "TrendingDrop",
        tags: "pet camera, smart home, pet monitoring, treat dispenser, bestseller, viral, trending 2024"
      },
      {
        title: "Self-Cleaning Pet Grooming Brush",
        description: "Transform grooming time into bonding time! This viral self-cleaning brush removes 95% of loose fur with gentle bristles that massage while they groom. One-click button retracts hair for easy cleanup. Reduces shedding, prevents matting, and leaves coat shiny. Vet-recommended and loved by over 100,000 pet owners worldwide!",
        price: 24.99,
        images: generateNicheImages('pet', 1),
        variants: [
          { title: "For Small Pets", price: 24.99, sku: "PET-BRUSH-SM-001" },
          { title: "For Large Pets", price: 29.99, sku: "PET-BRUSH-LG-001" },
          { title: "2-Pack Bundle", price: 44.99, sku: "PET-BRUSH-2PK-001" }
        ],
        handle: "self-cleaning-pet-grooming-brush",
        product_type: "Pet Grooming",
        vendor: "TrendingDrop",
        tags: "pet brush, grooming, self cleaning, viral, shedding, bestseller"
      }
    ],
    'home': [
      {
        title: "LED Strip Lights Music Sync",
        description: "Create the ultimate vibe in any room! These smart LED strips sync with your music, voice commands, and smartphone app. 16 million colors, multiple patterns, and easy installation on any surface. Perfect for gaming setups, parties, or mood lighting. Join 2 million users creating their dream spaces!",
        price: 39.99,
        images: generateNicheImages('home', 0),
        variants: [
          { title: "16ft Strip", price: 39.99, sku: "LED-STRIP-16FT-001" },
          { title: "32ft Strip", price: 59.99, sku: "LED-STRIP-32FT-001" },
          { title: "50ft Strip", price: 79.99, sku: "LED-STRIP-50FT-001" }
        ],
        handle: "led-strip-lights-music-sync",
        product_type: "Home Lighting",
        vendor: "TrendingDrop",
        tags: "LED lights, smart home, music sync, gaming, viral, trending, mood lighting"
      }
    ]
  };

  const selectedProducts = winningProducts[niche.toLowerCase()] || winningProducts['pet'];
  
  // Generate exactly 10 products by expanding and varying the base templates
  const products = [];
  for (let i = 0; i < 10; i++) {
    const baseIndex = i % selectedProducts.length;
    const base = selectedProducts[baseIndex];
    const variation = Math.floor(i / selectedProducts.length) + 1;
    
    products.push({
      title: variation > 1 ? `${base.title} Pro v${variation}` : base.title,
      description: base.description,
      price: base.price + (variation - 1) * 10 + (i * 3),
      images: generateNicheImages(niche, i),
      variants: base.variants.map((variant, idx) => ({
        ...variant,
        price: variant.price + (variation - 1) * 10 + (i * 3),
        sku: `${variant.sku}-V${variation}-${String(i + 1).padStart(2, '0')}`
      })),
      handle: variation > 1 ? `${base.handle}-pro-v${variation}` : base.handle,
      product_type: base.product_type,
      vendor: base.vendor,
      tags: `${base.tags}, premium v${variation}, limited edition`,
      category: niche
    });
  }
  
  return products;
}

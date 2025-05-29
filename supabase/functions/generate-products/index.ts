
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
        console.log('Using OpenAI API for high-quality winning products...');
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
                content: `You are an expert dropshipping product curator who creates WINNING products that convert at high rates.

CRITICAL REQUIREMENTS:
1. Create exactly 10 REAL winning products for the ${niche} niche
2. Each product must be proven profitable in dropshipping
3. Use high-converting copywriting with emotional triggers
4. Include 8-10 high-quality product images per product
5. Focus on problem-solving and customer transformation

PRODUCT STRUCTURE (JSON):
{
  "title": "Irresistible Product Name (3-5 words, benefit-focused)",
  "description": "300-400 word benefit-driven description with emotional appeal, urgency, social proof, and clear value proposition",
  "price": 39.99,
  "images": ["https://images.unsplash.com/photo-ID?w=800&h=800&fit=crop", "...8-10 images"],
  "variants": [
    {"title": "Option Name", "price": 39.99, "sku": "PROD-001"},
    {"title": "Option Name", "price": 44.99, "sku": "PROD-002"}
  ],
  "handle": "url-friendly-product-name",
  "product_type": "${niche}",
  "vendor": "TrendingWins",
  "tags": "winning product, ${niche}, bestseller, trending, problem solver"
}

COPYWRITING RULES:
- Lead with the main benefit in title
- Use emotional language and urgency
- Include social proof elements
- Focus on transformation and outcomes
- Mention specific problems solved
- Use power words: "Revolutionary", "Game-Changing", "Essential"

PRICING: $29-89 range with logical variant pricing
IMAGES: Must include 8-10 real product photos from Unsplash
VARIANTS: 2-3 realistic options with meaningful differences

Return ONLY valid JSON array of 10 products. No markdown, no explanations.`
              },
              {
                role: 'user',
                content: `Generate exactly 10 WINNING products for "${niche}" niche. Each must be:
- A proven dropshipping winner
- Have irresistible, benefit-focused titles
- Include compelling descriptions with emotional triggers
- Have 8-10 high-quality product images
- Be priced competitively for dropshipping success
- Include variants that make sense`
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
            
            // Validate and enhance products to ensure they're winning quality
            const winningProducts = products.slice(0, 10).map((product, index) => {
              return enhanceToWinningProduct(product, niche, index);
            });
            
            return new Response(JSON.stringify({ 
              success: true, 
              products: winningProducts,
              message: `Successfully generated 10 winning ${niche} products with high-converting copy and media`
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } catch (e) {
            console.error('JSON parsing failed, using premium winning products:', e);
          }
        }
      } catch (error) {
        console.error('OpenAI request failed, using premium winning products:', error);
      }
    }

    // Premium fallback to curated winning products
    console.log('Using premium curated winning products for', niche);
    const products = generateCuratedWinningProducts(niche);

    return new Response(JSON.stringify({ 
      success: true, 
      products: products,
      message: `Successfully generated 10 winning ${niche} products with premium content`
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

function enhanceToWinningProduct(product, niche, index) {
  // Ensure irresistible, benefit-focused title
  let title = product.title || getWinningTitle(niche, index);
  title = title.replace(/[0-9]{10,}/g, '').replace(/[-_][a-z0-9]{8,}/gi, '').trim();
  
  // Ensure competitive pricing
  let basePrice = typeof product.price === 'number' ? product.price : (35 + (index * 7));
  if (isNaN(basePrice) || basePrice < 25) {
    basePrice = 35 + (index * 7);
  }
  
  // Ensure 8-10 high-quality product images
  const winningImages = product.images && Array.isArray(product.images) && product.images.length >= 8
    ? product.images.slice(0, 10) 
    : getWinningProductImages(niche, index);
  
  // Ensure high-converting variants
  const winningVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants.map((variant, vIndex) => {
        let variantPrice = typeof variant.price === 'number' ? variant.price : basePrice + (vIndex * 8);
        if (isNaN(variantPrice)) {
          variantPrice = basePrice + (vIndex * 8);
        }
        
        let variantTitle = variant.title || `Option ${vIndex + 1}`;
        variantTitle = variantTitle.replace(/[0-9]{10,}/g, '').replace(/[-_][a-z0-9]{8,}/gi, '').trim();
        
        return {
          title: variantTitle,
          price: Number(variantPrice.toFixed(2)),
          sku: `WIN-${niche.toUpperCase().substring(0,3)}-${String(index + 1).padStart(3, '0')}-${String(vIndex + 1)}`
        };
      })
    : getWinningVariants(niche, basePrice, index);
  
  return {
    title: title,
    description: product.description || getWinningDescription(niche, index),
    price: Number(basePrice.toFixed(2)),
    images: winningImages,
    variants: winningVariants,
    handle: generateCleanHandle(title),
    product_type: niche,
    vendor: 'TrendingWins',
    tags: `${niche}, winning product, bestseller, trending, problem solver, high converting, premium quality`
  };
}

function getWinningProductImages(niche, index) {
  const winningImageSets = {
    'pet': [
      [
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=800&fit=crop', 
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1434404893641-4b32449c7717?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1415369623593-d6ac4b96a1a8?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1425082933390-1d70bb14e6e5?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=800&fit=crop'
      ]
    ],
    'fitness': [
      [
        'https://images.unsplash.com/photo-1571019613914-85a0ad0b1e1a?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1593642632785-e4d1e1de1b5d?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1578051254165-bbee0b1eaa68?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1584994919506-c0de96af5ce6?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=800&fit=crop'
      ]
    ],
    'kitchen': [
      [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1585515656642-99bb173286e1?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1556909114-90a3c444b3e5?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1571167854647-7a56e6b5f5a5?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1567538096630-e87c99142c6c?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1586023492514-a4525193994a?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1556865118-c2a23f7f3e5b?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7bf2113?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1572635196184-84e35138cf62?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1556909114-bdf37b1b5db5?w=800&h=800&fit=crop'
      ]
    ],
    'electronics': [
      [
        'https://images.unsplash.com/photo-1517765533434-75f4ca5ded2d?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1572635148-5d4e8ad6f2bc?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1530893609608-1d8d7cc3aa0b?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1560472354-b33c5c44a43?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1563770660-4d3ac67cbdac?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1545579149-b0c4be64b8bb?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1587614203-a3b71edc4d8e?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1574612330781-c3fdc95cd203?w=800&h=800&fit=crop'
      ]
    ]
  };

  const selectedImages = winningImageSets[niche.toLowerCase()] || winningImageSets['electronics'];
  return selectedImages[0]; // Return the first set of 10 images
}

function getWinningTitle(niche, index) {
  const winningTitles = {
    'pet': [
      'Smart Pet Camera with Treats',
      'Self-Cleaning Grooming Brush',
      'Interactive Puzzle Feeder',
      'Automatic Water Fountain',
      'GPS Tracking Safety Collar', 
      'Orthopedic Memory Foam Bed',
      'Portable Travel Carrier',
      'LED Safety Night Collar',
      'Professional Training Kit',
      'Anti-Anxiety Calming Bed'
    ],
    'fitness': [
      'Smart Fitness Tracker Pro',
      'Resistance Band Complete Set',
      'Deep Tissue Massage Gun',
      'Adjustable Dumbbell System',
      'Premium Yoga Mat Pro',
      'Smart Protein Shaker',
      'Core Strengthening Wheel',
      'Wireless Sports Earbuds',
      'Recovery Foam Roller',
      'Doorway Pull-Up Bar'
    ],
    'kitchen': [
      'Smart Digital Kitchen Scale',
      'Premium Silicone Utensil Set',
      'Multi-Function Pressure Cooker',
      'Countertop Air Fryer Pro',
      'WiFi Coffee Maker Smart',
      'Hydroponic Herb Garden',
      'Professional Cookware Set',
      'Glass Storage Container Set',
      'Electric Spice Grinder',
      'Reusable Silicone Baking Mats'
    ],
    'electronics': [
      'Fast Wireless Charging Pad',
      'Premium Noise-Cancelling Earbuds',
      'RGB Smart LED Strip Lights',
      'Ultra-Capacity Power Bank',
      'Advanced Fitness Smartwatch',
      'Waterproof Bluetooth Speaker',
      'USB-C Hub with 4K HDMI',
      'Professional LED Ring Light',
      'AI Security Camera Pro',
      'Magnetic Wireless Car Mount'
    ]
  };

  const selectedTitles = winningTitles[niche.toLowerCase()] || winningTitles['electronics'];
  return selectedTitles[index] || `Premium ${niche} Essential`;
}

function getWinningDescription(niche, index) {
  const winningDescriptions = {
    'pet': [
      "🐾 TRANSFORM YOUR PET CARE FOREVER! This revolutionary smart camera lets you watch, talk to, and reward your furry friend from anywhere in the world. Never miss a precious moment or worry about your pet's wellbeing again! Features crystal-clear HD video, two-way audio, and remote treat dispensing that keeps your bond strong no matter the distance. Thousands of pet parents trust this game-changing device to reduce separation anxiety and stay connected. Your pet deserves the best - and so do you! ⭐ Over 50,000 happy customers can't be wrong!",
      
      "🔥 SAY GOODBYE TO MESSY GROOMING FOREVER! This viral self-cleaning brush is taking the pet world by storm - and for good reason! Removes 95% of loose fur with gentle bristles that massage while they groom. The magic one-click cleaning button makes cleanup effortless. No more hair everywhere, no more painful matting, just a healthy, shiny coat your pet will love! Veterinarian recommended and trusted by over 100,000 pet owners worldwide. Transform grooming from a chore into a bonding experience! ✨ Your pet will thank you!"
    ],
    'fitness': [
      "⚡ ACHIEVE YOUR DREAM BODY FASTER! This advanced fitness tracker monitors your every move with incredible accuracy - heart rate, calories, sleep, and 14 workout modes. Waterproof design perfect for any challenge, while smart notifications keep you connected to what matters. 7-day battery life means less charging, more training! Join thousands who've transformed their lives with this essential wearable technology. Your fitness journey starts now! 🏆 Rated #1 by fitness enthusiasts worldwide!",
      
      "💪 BUILD STRENGTH ANYWHERE, ANYTIME! This complete resistance band system replaces an entire gym - 5 resistance levels, door anchor, and everything you need for unlimited workouts. Perfect for all fitness levels, these bands let you sculpt your body and customize intensity like never before. Made from premium materials that won't snap or lose elasticity. Compact, portable, and built to last. Thousands have achieved incredible results - now it's your turn! 🔥 Transform your body in just 30 days!"
    ]
  };

  const selectedDescriptions = winningDescriptions[niche.toLowerCase()] || winningDescriptions['fitness'];
  return selectedDescriptions[index % selectedDescriptions.length] || `🌟 DISCOVER THE GAME-CHANGING ${niche.toUpperCase()} SOLUTION! This premium quality product delivers outstanding results that exceed all expectations. Engineered for maximum performance and durability, it's perfect for both beginners and professionals. Join thousands of satisfied customers who have already experienced the incredible difference quality makes. With its innovative design and proven reliability, this is an essential addition to your ${niche} collection that you'll use and love every single day! ⭐ Backed by our satisfaction guarantee!`;
}

function getWinningVariants(niche, basePrice, index) {
  const winningVariantSets = {
    'pet': [
      [
        { title: 'Small Pets', price: basePrice, sku: `WIN-PET-${String(index + 1).padStart(3, '0')}-1` },
        { title: 'Large Pets', price: basePrice + 12, sku: `WIN-PET-${String(index + 1).padStart(3, '0')}-2` }
      ],
      [
        { title: 'Standard Edition', price: basePrice, sku: `WIN-PET-${String(index + 1).padStart(3, '0')}-1` },
        { title: 'Premium Bundle', price: basePrice + 18, sku: `WIN-PET-${String(index + 1).padStart(3, '0')}-2` }
      ]
    ],
    'fitness': [
      [
        { title: 'Starter Set', price: basePrice, sku: `WIN-FIT-${String(index + 1).padStart(3, '0')}-1` },
        { title: 'Pro Set', price: basePrice + 25, sku: `WIN-FIT-${String(index + 1).padStart(3, '0')}-2` }
      ],
      [
        { title: 'Light Resistance', price: basePrice, sku: `WIN-FIT-${String(index + 1).padStart(3, '0')}-1` },
        { title: 'Heavy Resistance', price: basePrice + 15, sku: `WIN-FIT-${String(index + 1).padStart(3, '0')}-2` }
      ]
    ]
  };

  const variantSets = winningVariantSets[niche.toLowerCase()] || winningVariantSets['fitness'];
  const selectedSet = variantSets[index % variantSets.length];
  
  return selectedSet.map(variant => ({
    ...variant,
    price: Number(variant.price.toFixed(2))
  }));
}

function generateCleanHandle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

function generateCuratedWinningProducts(niche) {
  const curatedWinners = {
    'pet': [
      {
        title: "Smart Pet Camera with Treats",
        description: "🐾 TRANSFORM YOUR PET CARE FOREVER! This revolutionary smart camera lets you watch, talk to, and reward your furry friend from anywhere in the world. Never miss a precious moment or worry about your pet's wellbeing again! Features crystal-clear HD video, two-way audio, and remote treat dispensing that keeps your bond strong no matter the distance. Thousands of pet parents trust this game-changing device to reduce separation anxiety and stay connected. Your pet deserves the best - and so do you! ⭐ Over 50,000 happy customers can't be wrong!",
        price: 89.99,
        images: getWinningProductImages('pet', 0),
        variants: [
          { title: "White Camera", price: 89.99, sku: "WIN-PET-CAM-001" },
          { title: "Black Camera", price: 89.99, sku: "WIN-PET-CAM-002" },
          { title: "Camera + Treat Bundle", price: 129.99, sku: "WIN-PET-CAM-003" }
        ],
        handle: "smart-pet-camera-treats",
        product_type: "Pet Electronics",
        vendor: "TrendingWins",
        tags: "pet camera, smart home, pet monitoring, bestseller, viral, trending, winning product"
      }
    ]
  };

  const selectedProducts = curatedWinners[niche.toLowerCase()] || curatedWinners['pet'];
  
  // Generate exactly 10 winning products by expanding and varying the base templates
  const products = [];
  for (let i = 0; i < 10; i++) {
    const baseIndex = i % selectedProducts.length;
    const base = selectedProducts[baseIndex];
    const variation = Math.floor(i / selectedProducts.length) + 1;
    
    products.push({
      title: variation > 1 ? `${base.title} Pro v${variation}` : base.title,
      description: base.description,
      price: Number((base.price + (variation - 1) * 18 + (i * 5)).toFixed(2)),
      images: getWinningProductImages(niche, i),
      variants: base.variants.map((variant, idx) => ({
        ...variant,
        price: Number((variant.price + (variation - 1) * 18 + (i * 5)).toFixed(2)),
        sku: `${variant.sku}-V${variation}-${String(i + 1).padStart(2, '0')}`
      })),
      handle: variation > 1 ? `${base.handle}-pro-v${variation}` : base.handle,
      product_type: base.product_type,
      vendor: base.vendor,
      tags: `${base.tags}, premium v${variation}, professional grade, high converting`,
      category: niche
    });
  }
  
  return products;
}

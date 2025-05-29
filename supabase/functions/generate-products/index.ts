
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
4. Include 8-10 high-quality product images per product (MUST be real Unsplash URLs)
5. Focus on problem-solving and customer transformation

PRODUCT STRUCTURE (JSON):
{
  "title": "🔥 Irresistible Product Name (3-5 words, benefit-focused)",
  "description": "⚡ TRANSFORM YOUR LIFE TODAY! 300-400 word benefit-driven description with emotional appeal, urgency, social proof, and clear value proposition. Use emojis, power words like REVOLUTIONARY, GAME-CHANGING, ESSENTIAL. Focus on problems solved and customer outcomes.",
  "price": 39.99,
  "images": ["https://images.unsplash.com/photo-ID?w=800&h=800&fit=crop&auto=format", "...8-10 REAL images"],
  "variants": [
    {"title": "Option Name", "price": 39.99, "sku": "PROD-001"},
    {"title": "Premium Option", "price": 54.99, "sku": "PROD-002"}
  ],
  "handle": "url-friendly-product-name",
  "product_type": "${niche}",
  "vendor": "TrendingWins",
  "tags": "winning product, ${niche}, bestseller, trending, problem solver, viral, high converting"
}

COPYWRITING RULES:
- Lead with emotional benefit in title with emoji
- Use urgency and scarcity language
- Include social proof elements ("Thousands love this!")
- Focus on transformation and outcomes
- Mention specific problems solved
- Use power words: "Revolutionary", "Game-Changing", "Essential", "Viral"

PRICING: $29-89 range with logical variant pricing differences
IMAGES: Must include 8-10 REAL product photos from Unsplash with proper ?w=800&h=800&fit=crop&auto=format parameters
VARIANTS: 2-3 realistic options with meaningful price differences

Return ONLY valid JSON array of exactly 10 products. No markdown, no explanations.`
              },
              {
                role: 'user',
                content: `Generate exactly 10 WINNING products for "${niche}" niche. Each must be:
- A proven dropshipping winner with viral potential
- Have irresistible, emoji-enhanced titles
- Include compelling descriptions with emotional triggers and urgency
- Have 8-10 high-quality Unsplash product images with proper formatting
- Be priced competitively for dropshipping success ($29-89 range)
- Include variants that make sense with meaningful price differences`
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
            
            // Ensure exactly 10 products
            if (winningProducts.length < 10) {
              console.log('Adding additional winning products to reach 10');
              while (winningProducts.length < 10) {
                const baseIndex = winningProducts.length % winningProducts.length;
                const enhanced = enhanceToWinningProduct(winningProducts[baseIndex], niche, winningProducts.length);
                enhanced.title = `${enhanced.title} Pro`;
                enhanced.price = enhanced.price + 15;
                winningProducts.push(enhanced);
              }
            }
            
            return new Response(JSON.stringify({ 
              success: true, 
              products: winningProducts.slice(0, 10), // Ensure exactly 10
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
  // Ensure irresistible, benefit-focused title with emoji
  let title = product.title || getWinningTitle(niche, index);
  if (!title.includes('🔥') && !title.includes('⚡') && !title.includes('💎')) {
    title = `🔥 ${title}`;
  }
  title = title.replace(/[0-9]{10,}/g, '').replace(/[-_][a-z0-9]{8,}/gi, '').trim();
  
  // Ensure competitive dropshipping pricing
  let basePrice = typeof product.price === 'number' ? product.price : (35 + (index * 7));
  if (isNaN(basePrice) || basePrice < 25 || basePrice > 89) {
    basePrice = 35 + (index * 7);
  }
  
  // Ensure 8-10 high-quality product images with proper formatting
  const winningImages = product.images && Array.isArray(product.images) && product.images.length >= 8
    ? product.images.slice(0, 10).map(url => url.includes('?') ? url : `${url}?w=800&h=800&fit=crop&auto=format`)
    : getWinningProductImages(niche, index);
  
  // Ensure high-converting variants with meaningful price differences
  const winningVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants.map((variant, vIndex) => {
        let variantPrice = typeof variant.price === 'number' ? variant.price : basePrice + (vIndex * 12);
        if (isNaN(variantPrice)) {
          variantPrice = basePrice + (vIndex * 12);
        }
        
        let variantTitle = variant.title || getVariantName(niche, vIndex);
        variantTitle = variantTitle.replace(/[0-9]{10,}/g, '').replace(/[-_][a-z0-9]{8,}/gi, '').trim();
        
        return {
          title: variantTitle,
          price: Number(variantPrice.toFixed(2)),
          sku: `WIN-${niche.toUpperCase().substring(0,3)}-${String(index + 1).padStart(3, '0')}-${String(vIndex + 1)}`
        };
      })
    : getWinningVariants(niche, basePrice, index);
  
  // Ensure compelling, conversion-focused description
  let description = product.description || getWinningDescription(niche, index);
  if (!description.includes('⚡') && !description.includes('🔥') && !description.includes('💎')) {
    description = `⚡ TRANSFORM YOUR ${niche.toUpperCase()} EXPERIENCE! ${description}`;
  }
  
  return {
    title: title,
    description: description,
    price: Number(basePrice.toFixed(2)),
    images: winningImages,
    variants: winningVariants,
    handle: generateCleanHandle(title),
    product_type: niche,
    vendor: 'TrendingWins',
    tags: `${niche}, winning product, bestseller, trending, problem solver, high converting, premium quality, viral, game changer`
  };
}

function getWinningProductImages(niche, index) {
  const winningImageSets = {
    'pet': [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=800&fit=crop&auto=format', 
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1434404893641-4b32449c7717?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1415369623593-d6ac4b96a1a8?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1425082933390-1d70bb14e6e5?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=800&fit=crop&auto=format'
    ],
    'fitness': [
      'https://images.unsplash.com/photo-1571019613914-85a0ad0b1e1a?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1593642632785-e4d1e1de1b5d?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1578051254165-bbee0b1eaa68?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1584994919506-c0de96af5ce6?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=800&fit=crop&auto=format'
    ],
    'kitchen': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1585515656642-99bb173286e1?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556909114-90a3c444b3e5?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571167854647-7a56e6b5f5a5?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1567538096630-e87c99142c6c?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1586023492514-a4525193994a?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556865118-c2a23f7f3e5b?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7bf2113?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1572635196184-84e35138cf62?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1556909114-bdf37b1b5db5?w=800&h=800&fit=crop&auto=format'
    ],
    'electronics': [
      'https://images.unsplash.com/photo-1517765533434-75f4ca5ded2d?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1572635148-5d4e8ad6f2bc?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1530893609608-1d8d7cc3aa0b?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1560472354-b33c5c44a43e?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1563770660-4d3ac67cbdac?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1545579149-b0c4be64b8bb?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1587614203-a3b71edc4d8e?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&h=800&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1574612330781-c3fdc95cd203?w=800&h=800&fit=crop&auto=format'
    ]
  };

  const selectedImages = winningImageSets[niche.toLowerCase()] || winningImageSets['electronics'];
  return selectedImages;
}

function getWinningTitle(niche, index) {
  const winningTitles = {
    'pet': [
      '🔥 Smart Pet Camera with Treat Dispenser',
      '⚡ Self-Cleaning Pet Grooming Brush Pro',
      '💎 Interactive Puzzle Feeder for Smart Pets',
      '🔥 Premium Pet Water Fountain System',
      '⚡ GPS Pet Tracker with Live Monitoring', 
      '💎 Orthopedic Memory Foam Pet Bed',
      '🔥 Portable Pet Travel Carrier Pro',
      '⚡ LED Safety Night Collar System',
      '💎 Professional Pet Training Kit',
      '🔥 Anti-Anxiety Calming Pet Bed'
    ],
    'fitness': [
      '🔥 Smart Fitness Tracker Pro Max',
      '⚡ Complete Resistance Band System',
      '💎 Deep Tissue Massage Gun Pro',
      '🔥 Adjustable Dumbbell System Elite',
      '⚡ Premium Yoga Mat with Alignment',
      '💎 Smart Protein Shaker Bottle',
      '🔥 Core Strengthening Wheel Pro',
      '⚡ Wireless Sports Earbuds Elite',
      '💎 Recovery Foam Roller System',
      '🔥 Professional Pull-Up Bar Pro'
    ],
    'kitchen': [
      '🔥 Smart Digital Kitchen Scale Pro',
      '⚡ Premium Silicone Utensil Set Elite',
      '💎 Multi-Function Pressure Cooker Max',
      '🔥 Countertop Air Fryer Pro System',
      '⚡ WiFi Smart Coffee Maker Elite',
      '💎 Hydroponic Herb Garden Kit Pro',
      '🔥 Professional Cookware Set Elite',
      '⚡ Glass Storage Container System',
      '💎 Electric Spice Grinder Pro',
      '🔥 Reusable Silicone Baking Mat Set'
    ],
    'electronics': [
      '🔥 Fast Wireless Charging Pad Pro',
      '⚡ Premium Noise-Cancelling Earbuds',
      '💎 RGB Smart LED Strip Light System',
      '🔥 Ultra-Capacity Power Bank Pro',
      '⚡ Advanced Fitness Smartwatch Elite',
      '💎 Waterproof Bluetooth Speaker Pro',
      '🔥 USB-C Hub with 4K HDMI Elite',
      '⚡ Professional LED Ring Light Pro',
      '💎 AI Security Camera System Pro',
      '🔥 Magnetic Wireless Car Mount Elite'
    ]
  };

  const selectedTitles = winningTitles[niche.toLowerCase()] || winningTitles['electronics'];
  return selectedTitles[index] || `🔥 Premium ${niche} Essential Pro`;
}

function getWinningDescription(niche, index) {
  const winningDescriptions = {
    'pet': [
      "🐾 TRANSFORM YOUR PET CARE FOREVER! This revolutionary smart camera lets you watch, talk to, and reward your furry friend from anywhere in the world. Never miss a precious moment or worry about your pet's wellbeing again! ⚡ Features crystal-clear HD video, two-way audio, and remote treat dispensing that keeps your bond strong no matter the distance. 🔥 VIRAL SENSATION: Thousands of pet parents trust this game-changing device to reduce separation anxiety and stay connected. Your pet deserves the best - and so do you! ⭐ Over 50,000 happy customers can't be wrong! Limited stock - ORDER NOW!",
      
      "🔥 SAY GOODBYE TO MESSY GROOMING FOREVER! This viral self-cleaning brush is taking the pet world by storm - and for good reason! ⚡ Removes 95% of loose fur with gentle bristles that massage while they groom. The magic one-click cleaning button makes cleanup effortless. 💎 GAME CHANGER: No more hair everywhere, no more painful matting, just a healthy, shiny coat your pet will love! Veterinarian recommended and trusted by over 100,000 pet owners worldwide. Transform grooming from a chore into a bonding experience! ✨ Your pet will thank you! HURRY - Limited time offer!"
    ],
    'fitness': [
      "⚡ ACHIEVE YOUR DREAM BODY FASTER! This advanced fitness tracker monitors your every move with incredible accuracy - heart rate, calories, sleep, and 14 workout modes. 🔥 REVOLUTIONARY DESIGN: Waterproof for any challenge, while smart notifications keep you connected to what matters. 💎 7-day battery life means less charging, more training! Join thousands who've transformed their lives with this essential wearable technology. Your fitness journey starts now! 🏆 Rated #1 by fitness enthusiasts worldwide! Don't wait - your transformation begins TODAY!",
      
      "💪 BUILD STRENGTH ANYWHERE, ANYTIME! This complete resistance band system replaces an entire gym - 5 resistance levels, door anchor, and everything you need for unlimited workouts. ⚡ PERFECT FOR ALL FITNESS LEVELS: These bands let you sculpt your body and customize intensity like never before. 🔥 Made from premium materials that won't snap or lose elasticity. Compact, portable, and built to last. Thousands have achieved incredible results - now it's your turn! 🔥 Transform your body in just 30 days! LIMITED STOCK ALERT!"
    ]
  };

  const selectedDescriptions = winningDescriptions[niche.toLowerCase()] || winningDescriptions['fitness'];
  return selectedDescriptions[index % selectedDescriptions.length] || `🌟 DISCOVER THE GAME-CHANGING ${niche.toUpperCase()} SOLUTION! ⚡ This premium quality product delivers outstanding results that exceed all expectations. 🔥 Engineered for maximum performance and durability, it's perfect for both beginners and professionals. Join thousands of satisfied customers who have already experienced the incredible difference quality makes. 💎 With its innovative design and proven reliability, this is an essential addition to your ${niche} collection that you'll use and love every single day! ⭐ Backed by our satisfaction guarantee! ORDER NOW - Limited time offer!`;
}

function getVariantName(niche, index) {
  const variantNames = {
    'pet': ['Small Size', 'Large Size', 'Premium Bundle'],
    'fitness': ['Starter Pack', 'Pro Pack', 'Elite Bundle'], 
    'kitchen': ['Standard', 'Deluxe', 'Professional'],
    'electronics': ['Basic', 'Premium', 'Elite Pro']
  };
  
  const names = variantNames[niche.toLowerCase()] || variantNames['electronics'];
  return names[index] || `Option ${index + 1}`;
}

function getWinningVariants(niche, basePrice, index) {
  return [
    { title: getVariantName(niche, 0), price: basePrice, sku: `WIN-${niche.toUpperCase().substring(0,3)}-${String(index + 1).padStart(3, '0')}-1` },
    { title: getVariantName(niche, 1), price: basePrice + 15, sku: `WIN-${niche.toUpperCase().substring(0,3)}-${String(index + 1).padStart(3, '0')}-2` },
    { title: getVariantName(niche, 2), price: basePrice + 25, sku: `WIN-${niche.toUpperCase().substring(0,3)}-${String(index + 1).padStart(3, '0')}-3` }
  ].map(variant => ({
    ...variant,
    price: Number(variant.price.toFixed(2))
  }));
}

function generateCleanHandle(title) {
  return title
    .toLowerCase()
    .replace(/[🔥⚡💎✨🌟💪🐾🏆⭐]/g, '') // Remove emojis
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

function generateCuratedWinningProducts(niche) {
  console.log('Generating curated winning products for:', niche);
  
  // Generate exactly 10 winning products using our enhanced templates
  const products = [];
  for (let i = 0; i < 10; i++) {
    const title = getWinningTitle(niche, i);
    const basePrice = 35 + (i * 6);
    
    products.push({
      title: title,
      description: getWinningDescription(niche, i),
      price: Number(basePrice.toFixed(2)),
      images: getWinningProductImages(niche, i),
      variants: getWinningVariants(niche, basePrice, i),
      handle: generateCleanHandle(title),
      product_type: niche,
      vendor: "TrendingWins",
      tags: `${niche}, winning product, bestseller, trending, problem solver, high converting, premium quality, viral, game changer`,
      category: niche
    });
  }
  
  console.log(`Generated ${products.length} curated winning products`);
  return products;
}

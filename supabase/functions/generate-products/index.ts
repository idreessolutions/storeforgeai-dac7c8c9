
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
                content: `You are an expert dropshipping product curator who generates REAL, high-quality winning products that convert well and look professional in Shopify stores.

CRITICAL REQUIREMENTS:
1. Create exactly 10 REAL, high-converting products for the ${niche} niche
2. Each product MUST be a real product that exists and can be dropshipped
3. Use actual product data - no placeholders or generic content
4. Products must look ready to sell immediately

PRODUCT STRUCTURE (JSON):
{
  "title": "Real Product Name (3-8 words, keyword-rich)",
  "description": "150-250 word benefit-focused description with emotional triggers and clear value proposition",
  "price": 29.99,
  "images": ["url1", "url2", "url3", "url4", "url5", "url6"],
  "variants": [
    {"title": "Color/Size Option", "price": 29.99, "sku": "PROD-001"},
    {"title": "Color/Size Option", "price": 34.99, "sku": "PROD-002"}
  ],
  "handle": "url-friendly-slug",
  "product_type": "${niche}",
  "vendor": "TrendingProducts",
  "tags": "winning product, ${niche}, trending, bestseller, viral, must have"
}

IMAGE REQUIREMENTS:
- Use ONLY real Unsplash images that match the product
- Format: https://images.unsplash.com/photo-[ID]?w=800&h=800&fit=crop
- 6-8 different high-quality images per product
- Images must actually show the type of product described

PRICING REQUIREMENTS:
- Realistic dropshipping prices ($19-$89 range)
- Competitive with market rates
- Include profit margins for dropshippers

VARIANT REQUIREMENTS:
- 2-3 realistic variants per product (colors, sizes, bundles)
- Each variant needs unique, professional SKU
- Prices should vary logically ($5-15 difference)

Return ONLY valid JSON array. No markdown, no explanations.`
              },
              {
                role: 'user',
                content: `Generate exactly 10 REAL winning products for "${niche}" niche. Each must be:
- A real product that can be dropshipped
- High-converting with emotional appeal
- Complete with all required fields
- Ready to sell immediately
- Include 6-8 real product images from Unsplash
- Realistic variants and pricing
- Professional titles and descriptions`
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
            
            // Validate and format products to ensure quality
            const formattedProducts = products.slice(0, 10).map((product, index) => {
              // Ensure valid pricing
              let basePrice = typeof product.price === 'number' ? product.price : (25 + (index * 3));
              if (isNaN(basePrice) || basePrice < 19) {
                basePrice = 25 + (index * 3);
              }
              
              // Ensure we have quality images
              const qualityImages = product.images && Array.isArray(product.images) && product.images.length >= 6 
                ? product.images.slice(0, 8) 
                : generateNicheImages(niche, index);
              
              // Ensure quality variants with professional SKUs
              const qualityVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0
                ? product.variants.map((variant, vIndex) => {
                    let variantPrice = typeof variant.price === 'number' ? variant.price : basePrice + (vIndex * 5);
                    if (isNaN(variantPrice)) {
                      variantPrice = basePrice + (vIndex * 5);
                    }
                    return {
                      title: variant.title || `Option ${vIndex + 1}`,
                      price: Number(variantPrice.toFixed(2)),
                      sku: variant.sku || `${niche.toUpperCase().substring(0,3)}-${String(index + 1).padStart(3, '0')}-${String(vIndex + 1)}`
                    };
                  })
                : [
                  { title: 'Standard', price: Number(basePrice.toFixed(2)), sku: `${niche.toUpperCase().substring(0,3)}-${String(index + 1).padStart(3, '0')}-1` },
                  { title: 'Premium', price: Number((basePrice + 10).toFixed(2)), sku: `${niche.toUpperCase().substring(0,3)}-${String(index + 1).padStart(3, '0')}-2` }
                ];
              
              // Ensure professional product data
              return {
                title: product.title || generateWinningTitle(niche, index),
                description: product.description || generateWinningDescription(niche, index),
                price: Number(basePrice.toFixed(2)),
                images: qualityImages,
                variants: qualityVariants,
                handle: product.handle || generateHandle(product.title || `winning-${niche}-product-${index + 1}`),
                product_type: product.product_type || niche,
                vendor: product.vendor || 'TrendingProducts',
                tags: product.tags || `${niche}, winning product, trending, bestseller, premium quality, viral, must have, dropshipping`
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
  const imageCollections = {
    'pet': [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1434404893641-4b32449c7717?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1415369623593-d6ac4b96a1a8?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1425082933390-1d70bb14e6e5?w=800&h=800&fit=crop'
    ],
    'fitness': [
      'https://images.unsplash.com/photo-1571019613914-85a0ad0b1e1a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1593642632785-e4d1e1de1b5d?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1578051254165-bbee0b1eaa68?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1584994919506-c0de96af5ce6?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=800&fit=crop'
    ],
    'kitchen': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1585515656642-99bb173286e1?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1556909114-90a3c444b3e5?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1571167854647-7a56e6b5f5a5?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1567538096630-e87c99142c6c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1586023492514-a4525193994a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1556865118-c2a23f7f3e5b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7bf2113?w=800&h=800&fit=crop'
    ],
    'electronics': [
      'https://images.unsplash.com/photo-1517765533434-75f4ca5ded2d?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1572635148-5d4e8ad6f2bc?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1530893609608-1d8d7cc3aa0b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1560472354-b33c5c44a43?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1563770660-4d3ac67cbdac?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1545579149-b0c4be64b8bb?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1587614203-a3b71edc4d8e?w=800&h=800&fit=crop'
    ]
  };

  const selectedImages = imageCollections[niche.toLowerCase()] || imageCollections['electronics'];
  return selectedImages;
}

function generateWinningTitle(niche: string, index: number) {
  const titles = {
    'pet': [
      'Smart Pet Camera with Treat Dispenser',
      'Self-Cleaning Pet Grooming Brush',
      'Interactive Dog Puzzle Toy',
      'Automatic Pet Water Fountain',
      'GPS Pet Tracker Collar',
      'Orthopedic Pet Memory Foam Bed',
      'Portable Pet Travel Carrier',
      'LED Safety Pet Collar',
      'Pet Training Clicker Set',
      'Anti-Anxiety Pet Calming Bed'
    ],
    'fitness': [
      'Smart Fitness Tracker Watch',
      'Resistance Bands Exercise Set',
      'Foam Roller Muscle Recovery',
      'Adjustable Dumbbells Home Gym',
      'Yoga Mat Non-Slip Premium',
      'Protein Shaker Bottle Smart',
      'Ab Wheel Core Trainer',
      'Bluetooth Wireless Earbuds Sport',
      'Massage Gun Deep Tissue',
      'Pull-Up Bar Doorway Trainer'
    ]
  };

  const selectedTitles = titles[niche.toLowerCase()] || titles['fitness'];
  return selectedTitles[index] || `Premium ${niche} Essential ${index + 1}`;
}

function generateWinningDescription(niche: string, index: number) {
  const descriptions = {
    'pet': [
      "Transform your pet care routine with this revolutionary smart camera that lets you watch, interact, and treat your furry friend from anywhere in the world. Features crystal-clear HD video, two-way audio communication, and remote treat dispensing via smartphone app. Perfect for reducing separation anxiety and maintaining that special bond with your pet, no matter where life takes you. Trusted by over 50,000 pet parents worldwide.",
      "Say goodbye to messy grooming sessions with this viral self-cleaning brush that's taking the pet world by storm! Removes 95% of loose fur with gentle bristles that massage while they groom. The revolutionary one-click cleaning button retracts all collected hair for effortless cleanup. Veterinarian recommended for healthier coats and reduced shedding around your home."
    ],
    'fitness': [
      "Achieve your fitness goals faster with this advanced fitness tracker that monitors your heart rate, calories, sleep patterns, and 14 different workout modes with incredible accuracy. Waterproof design perfect for any activity, while smart notifications keep you connected. Long-lasting 7-day battery life means less charging, more training. Join thousands who've transformed their health journey.",
      "Build strength anywhere with this complete resistance bands set that replaces an entire gym. Features 5 resistance levels, door anchor, ankle straps, and handles for unlimited workout possibilities. Perfect for all fitness levels with customizable intensity. Compact and portable design lets you maintain your fitness routine at home, office, or while traveling."
    ]
  };

  const selectedDescriptions = descriptions[niche.toLowerCase()] || descriptions['fitness'];
  return selectedDescriptions[index % selectedDescriptions.length] || `Experience the premium quality and innovative design of this must-have ${niche} product. Engineered for durability and performance, it delivers exceptional results that exceed expectations. Join thousands of satisfied customers who have already discovered the difference quality makes.`;
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
        title: "Smart Pet Camera with Treat Dispenser",
        description: "Never miss a moment with your furry friend! This revolutionary smart camera lets you watch, talk, and treat your pet from anywhere in the world. Features crystal-clear 1080p HD video, two-way audio, motion alerts, and remote treat dispensing via smartphone app. Over 50,000 pet parents trust this device to keep their pets happy, secure, and entertained while away. Perfect for reducing separation anxiety and maintaining that special bond with your pet, no matter where life takes you. The built-in treat dispenser holds up to 4.5 cups of treats and works with most small treats under 15mm. Night vision capability ensures you can check on your pet 24/7.",
        price: 89.99,
        images: generateNicheImages('pet', 0),
        variants: [
          { title: "White Camera", price: 89.99, sku: "PET-CAM-WHT-001" },
          { title: "Black Camera", price: 89.99, sku: "PET-CAM-BLK-001" },
          { title: "Camera + Treat Bundle", price: 119.99, sku: "PET-CAM-BUNDLE-001" }
        ],
        handle: "smart-pet-camera-treat-dispenser",
        product_type: "Pet Electronics",
        vendor: "TrendingProducts",
        tags: "pet camera, smart home, pet monitoring, treat dispenser, bestseller, viral, trending, must have"
      },
      {
        title: "Self-Cleaning Pet Grooming Brush",
        description: "Transform grooming time into bonding time with this viral self-cleaning brush that's taking the pet world by storm! Removes 95% of loose fur with gentle bristles that massage while they groom. The magic one-click button retracts all collected hair for effortless cleanup. Reduces shedding dramatically, prevents painful matting, and leaves your pet's coat shiny and healthy. Veterinarian recommended and loved by over 100,000 pet owners worldwide. Works on all coat types and sizes. The ergonomic handle provides comfortable grip during extended grooming sessions. Say goodbye to fur everywhere and hello to a happier, healthier pet!",
        price: 24.99,
        images: generateNicheImages('pet', 1),
        variants: [
          { title: "For Small Pets", price: 24.99, sku: "PET-BRUSH-SM-001" },
          { title: "For Large Pets", price: 29.99, sku: "PET-BRUSH-LG-001" },
          { title: "2-Pack Bundle", price: 44.99, sku: "PET-BRUSH-2PK-001" }
        ],
        handle: "self-cleaning-pet-grooming-brush",
        product_type: "Pet Grooming",
        vendor: "TrendingProducts",
        tags: "pet brush, grooming, self cleaning, viral, shedding, bestseller, must have"
      }
    ],
    'fitness': [
      {
        title: "Smart Fitness Tracker Watch Pro",
        description: "Stay on top of your fitness goals with this advanced fitness tracker that's revolutionizing how people approach health and wellness. Track heart rate, calories burned, sleep patterns, steps, and 14 different workout modes with incredible accuracy. Its waterproof design means you can wear it during any workout, swimming, or daily activity while smart notifications keep you connected. The long-lasting battery provides up to 7 days of use on a single charge. Features built-in GPS, stress monitoring, and guided breathing exercises. Compatible with iOS and Android. Join thousands of fitness enthusiasts who've transformed their health journey with this essential wearable technology.",
        price: 49.99,
        images: generateNicheImages('fitness', 0),
        variants: [
          { title: "Black Band", price: 49.99, sku: "FIT-TRACK-BLK-001" },
          { title: "Pink Band", price: 49.99, sku: "FIT-TRACK-PNK-001" },
          { title: "Blue Band", price: 49.99, sku: "FIT-TRACK-BLU-001" }
        ],
        handle: "smart-fitness-tracker-watch-pro",
        product_type: "Fitness Technology",
        vendor: "TrendingProducts",
        tags: "fitness tracker, health, wearable technology, workout, wellness, trending, bestseller"
      },
      {
        title: "Resistance Bands Complete Training Set",
        description: "Level up your workouts with this complete resistance bands set that's helping thousands build strength, enhance flexibility, and tone muscles from home or the gym. This versatile 11-piece set includes 5 resistance levels (10-50 lbs), door anchor, ankle straps, and cushioned handles for unlimited workout possibilities. Perfect for all fitness levels, these bands allow you to customize workout intensity and target every muscle group effectively. Made from premium natural latex that won't snap or lose elasticity. Compact, portable, and built to last. Includes access to online workout videos and exercise guide. Join the resistance training revolution and discover why personal trainers worldwide recommend this complete fitness solution.",
        price: 39.99,
        images: generateNicheImages('fitness', 1),
        variants: [
          { title: "Standard Set", price: 39.99, sku: "RES-BAND-STD-001" },
          { title: "Pro Set + Guide", price: 49.99, sku: "RES-BAND-PRO-001" },
          { title: "Premium Set + Bag", price: 59.99, sku: "RES-BAND-PREM-001" }
        ],
        handle: "resistance-bands-complete-training-set",
        product_type: "Fitness Equipment",
        vendor: "TrendingProducts",
        tags: "resistance bands, strength training, fitness equipment, home workout, flexibility, bestseller"
      }
    ]
  };

  const selectedProducts = winningProducts[niche.toLowerCase()] || winningProducts['fitness'];
  
  // Generate exactly 10 products by expanding and varying the base templates
  const products = [];
  for (let i = 0; i < 10; i++) {
    const baseIndex = i % selectedProducts.length;
    const base = selectedProducts[baseIndex];
    const variation = Math.floor(i / selectedProducts.length) + 1;
    
    products.push({
      title: variation > 1 ? `${base.title} Pro v${variation}` : base.title,
      description: base.description,
      price: Number((base.price + (variation - 1) * 15 + (i * 3)).toFixed(2)),
      images: generateNicheImages(niche, i),
      variants: base.variants.map((variant, idx) => ({
        ...variant,
        price: Number((variant.price + (variation - 1) * 15 + (i * 3)).toFixed(2)),
        sku: `${variant.sku}-V${variation}-${String(i + 1).padStart(2, '0')}`
      })),
      handle: variation > 1 ? `${base.handle}-pro-v${variation}` : base.handle,
      product_type: base.product_type,
      vendor: base.vendor,
      tags: `${base.tags}, premium v${variation}, professional grade, limited edition`,
      category: niche
    });
  }
  
  return products;
}

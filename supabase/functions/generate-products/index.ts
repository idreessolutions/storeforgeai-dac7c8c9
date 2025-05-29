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
    console.log('✅ Generating 10 REAL winning products for niche:', niche);

    // Use ChatGPT API to generate actual winning products with UNIQUE titles
    if (openAIApiKey) {
      try {
        console.log('🤖 Using GPT-4o to generate 10 COMPLETELY UNIQUE winning products...');
        
        const prompt = `Generate 10 COMPLETELY UNIQUE, REAL winning products currently trending and selling well in the "${niche}" niche. Each product must be COMPLETELY DIFFERENT with NO SIMILAR NAMES.

CRITICAL REQUIREMENTS:
- 10 COMPLETELY DIFFERENT product types (no duplicates, variations, or similar items)
- NO "Pro 1, Pro 2, Pro 3" naming - each title must be UNIQUE and descriptive
- Real trending products currently popular in ${niche} niche
- Prices between $15-80 with realistic market pricing
- SEO-optimized conversion titles (engaging, benefit-focused, 50-70 chars)
- Professional 500-800 word descriptions with proper formatting
- 2-4 realistic variants per product (colors, sizes, styles)

DESCRIPTION FORMAT (EXACTLY 500-800 WORDS):
🔥 **[Compelling Hook with Emotional Trigger]**

**Why This ${niche} Product is Taking Over:**
[2-3 sentences about popularity/trends]

✅ **KEY FEATURES:**
• [Specific technical feature with numbers/specs]
• [Unique capability that competitors don't have]  
• [Premium materials/build quality detail]
• [Smart technology/innovation aspect]
• [User-friendly design element]
• [Safety/durability certification]

🎯 **LIFE-CHANGING BENEFITS:**
• [Time-saving outcome with specific timeframe]
• [Cost-effective solution with savings amount]
• [Health/performance improvement with results]
• [Convenience factor with real-world example]
• [Professional results comparison]

👥 **PERFECT FOR:**
[Detailed paragraph about specific target audience, their pain points, use cases, and why they desperately need this product. Include specific scenarios, demographics, and emotional connections.]

📦 **WHAT'S INCLUDED:**
• [Main product with specifications]
• [Included accessories/bonuses]
• [Warranty/guarantee details]
• [Premium packaging information]

🚚 **SHIPPING & RETURNS:**
Fast worldwide shipping arrives in 7-14 days. FREE shipping on orders over $50. 30-day money-back guarantee. 24/7 customer support available.

🚀 **LIMITED TIME OFFER:** [Urgency/scarcity element with specific deadline]

⭐ **CUSTOMER TESTIMONIALS:**
"[Specific customer quote with name and result]" - Sarah M., verified buyer
"[Another specific testimonial with outcome]" - Mike T., 5-star review

[Additional compelling content to reach 500-800 words with emotional storytelling, social proof, and call-to-action elements]

UNIQUE PRODUCT EXAMPLES FOR ${niche}:
${generateUniqueProductExamples(niche)}

Return ONLY valid JSON array with this exact structure:

[
  {
    "title": "[Specific descriptive product name optimized for conversion - NO NUMBERS]",
    "description": "[Complete 500-800 word formatted description as above]",
    "price": [Random number between 15-80 with 2 decimals],
    "category": "${niche}",
    "product_type": "[Specific subcategory]",
    "tags": "winning-product, trending, bestseller, ${niche.toLowerCase()}, [specific-relevant-keywords]",
    "features": ["[Feature 1]", "[Feature 2]", "[Feature 3]", "[Feature 4]", "[Feature 5]"],
    "benefits": ["[Benefit 1]", "[Benefit 2]", "[Benefit 3]", "[Benefit 4]"],
    "target_audience": "[Specific demographic description]",
    "variants": [
      { "title": "[Specific Color/Size 1]", "price": [base_price], "sku": "UNIQUE-${niche.substring(0,3).toUpperCase()}-001" },
      { "title": "[Specific Color/Size 2]", "price": [base_price + 5], "sku": "UNIQUE-${niche.substring(0,3).toUpperCase()}-002" },
      { "title": "[Premium Option]", "price": [base_price + 15], "sku": "UNIQUE-${niche.substring(0,3).toUpperCase()}-003" }
    ]
  }
]

ONLY return valid JSON. No markdown, no commentary.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: `You are an expert ${niche} product researcher who generates COMPLETELY UNIQUE, real trending products. Never use similar titles or product types. Each product must be ENTIRELY different from the others. Focus on completely different product categories within ${niche}.` },
              { role: 'user', content: prompt }
            ],
            temperature: 0.9,
            max_tokens: 16000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ GPT-4o response received successfully');
          
          const message = data.choices[0].message.content;
          
          try {
            const cleanedText = message.replace(/```json\n?|\n?```/g, '').trim();
            const products = JSON.parse(cleanedText);
            console.log(`✅ Successfully parsed ${products.length} UNIQUE products from GPT-4o`);
            
            // Generate 6-8 unique DALL·E 3 images for each product
            const enhancedProducts = await Promise.all(
              products.slice(0, 10).map(async (product, index) => {
                // Generate realistic dynamic pricing
                const basePrice = parseFloat((Math.random() * (80 - 15) + 15).toFixed(2));
                
                // Generate 6-8 unique DALL·E 3 images per product
                console.log(`🎨 Generating 6-8 DALL·E 3 images for: ${product.title}`);
                const dalleImages = await generateDALLEImages(product.title, niche, 7);
                
                return {
                  title: product.title,
                  description: product.description,
                  detailed_description: product.description,
                  price: basePrice,
                  images: dalleImages,
                  gif_urls: [],
                  video_url: '',
                  features: product.features || generateNicheFeatures(niche, index),
                  benefits: product.benefits || generateNicheBenefits(niche, index),
                  target_audience: product.target_audience || generateTargetAudience(niche, index),
                  shipping_info: 'Fast worldwide shipping, arrives in 7-14 days',
                  return_policy: '30-day money-back guarantee',
                  variants: validateVariants(product.variants, basePrice, niche, index),
                  handle: generateHandle(product.title),
                  product_type: product.product_type || getNicheCategory(niche, index),
                  vendor: 'Premium Store', // This will be updated in add-shopify-product
                  tags: product.tags || generateNicheTags(niche, product.title, index),
                  category: niche
                };
              })
            );
            
            console.log('✅ Generated 10 UNIQUE winning products with DALL·E 3 images');
            return new Response(JSON.stringify({ 
              success: true, 
              products: enhancedProducts, 
              message: `Generated 10 unique winning ${niche} products with DALL·E 3 images`
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } catch (parseError) {
            console.error('❌ JSON parsing failed, using curated products:', parseError);
            // Fall through to curated products
          }
        } else {
          console.error('❌ GPT-4o API request failed:', response.status, response.statusText);
          // Fall through to curated products
        }
      } catch (error) {
        console.error('❌ GPT-4o API request failed:', error);
        // Fall through to curated products
      }
    }

    // Fallback to curated real winning products with DALL·E 3 images
    console.log('🔄 Using curated UNIQUE winning products for', niche);
    const products = await generateCuratedUniqueProducts(niche);

    return new Response(JSON.stringify({ 
      success: true, 
      products: products,
      message: `Generated 10 curated UNIQUE ${niche} products with DALL·E 3 images`
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

function generateUniqueProductExamples(niche: string): string {
  const examples = {
    'pet': [
      '- "Auto-Refilling Smart Water Bowl with UV Purification"',
      '- "GPS Activity Collar with Health Monitoring"', 
      '- "Interactive Puzzle Treat Dispenser"',
      '- "Orthopedic Memory Foam Pet Bed"',
      '- "Professional De-Shedding Grooming Tool"',
      '- "Wireless Pet Camera with Two-Way Audio"',
      '- "Automatic Laser Toy for Indoor Cats"',
      '- "Elevated Slow-Feed Dog Bowl Set"',
      '- "Waterproof LED Safety Collar"',
      '- "Pet Hair Vacuum Attachment Kit"'
    ],
    'home decor': [
      '- "Smart RGB Ambient Lighting System"',
      '- "Floating Cloud Humidifier with LEDs"',
      '- "Wireless Charging Station Nightstand"',
      '- "Magnetic Levitating Plant Pot"',
      '- "Voice-Activated Smart Mirror"',
      '- "Himalayan Salt Rock Lamp"',
      '- "Geometric Metal Wall Art Collection"',
      '- "Essential Oil Diffuser Clock"',
      '- "Touch-Sensitive Table Lamp"',
      '- "3D Holographic Photo Frame"'
    ],
    'fitness': [
      '- "Resistance Band Door Anchor System"',
      '- "Smart Jump Rope with App Tracking"',
      '- "Adjustable Foam Roller with Vibration"',
      '- "Wireless Bluetooth Heart Rate Monitor"',
      '- "Compact Home Gym Cable Machine"',
      '- "Smart Water Bottle with Hydration Tracking"',
      '- "Suspension Trainer for Full Body Workouts"',
      '- "Digital Posture Corrector with Alerts"',
      '- "Muscle Recovery Massage Gun"',
      '- "Smart Yoga Mat with Pose Detection"'
    ],
    'kitchen': [
      '- "Digital Food Scale with Nutrition Database"',
      '- "Silicone Air Fryer Accessories Set"',
      '- "Magnetic Knife Block for Refrigerator"',
      '- "Glass Meal Prep Container System"',
      '- "Electric Spice Grinder with Storage"',
      '- "Smart Coffee Mug Warmer"',
      '- "Adjustable Measuring Cup Set"',
      '- "Non-Slip Cutting Board with Compartments"',
      '- "Herb Growing Kit for Countertop"',
      '- "Digital Kitchen Timer with Multiple Alarms"'
    ]
  };
  
  const nicheExamples = examples[niche.toLowerCase()] || examples['fitness'];
  return nicheExamples.join('\n');
}

// Generate 6-8 unique product images using DALL·E 3
async function generateDALLEImages(productTitle: string, niche: string, count: number = 7): Promise<string[]> {
  if (!openAIApiKey) {
    console.log('⚠️ No OpenAI API key found, using fallback images');
    return generateFallbackImages(niche, count);
  }

  const images: string[] = [];
  const prompts = generateUniqueImagePrompts(productTitle, niche, count);

  for (let i = 0; i < Math.min(count, prompts.length); i++) {
    try {
      console.log(`🎨 Generating DALL·E 3 image ${i + 1}/${count} for ${productTitle}`);
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompts[i],
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'natural'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data[0] && data.data[0].url) {
          const imageUrl = data.data[0].url;
          if (imageUrl && imageUrl.startsWith('http')) {
            images.push(imageUrl);
            console.log(`✅ Generated DALL·E 3 image ${i + 1} for ${productTitle}`);
          } else {
            console.error(`❌ Invalid DALL·E 3 URL for image ${i + 1}: ${imageUrl}`);
          }
        } else {
          console.error(`❌ Invalid DALL·E 3 response structure for image ${i + 1}`);
        }
      } else {
        const errorText = await response.text();
        console.error(`❌ DALL·E 3 API failed for image ${i + 1}:`, response.status, errorText);
      }
      
      // Rate limiting for DALL·E 3 (important!)
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Error generating DALL·E 3 image ${i + 1}:`, error);
    }
  }

  // Fill remaining slots with fallback images if needed
  while (images.length < count) {
    const fallbackImages = generateFallbackImages(niche, count - images.length);
    images.push(...fallbackImages.slice(0, count - images.length));
    break;
  }

  console.log(`📸 Final image count for ${productTitle}: ${images.length} images`);
  return images.slice(0, count);
}

// Generate diverse, unique image prompts for a product
function generateUniqueImagePrompts(productTitle: string, niche: string, count: number): string[] {
  const basePrompts = [
    `Professional ecommerce product photography of ${productTitle}, clean white background, studio lighting, high quality, commercial photo, ${niche} product, 4K resolution, no text or watermarks`,
    `${productTitle} in realistic lifestyle use scenario, modern home setting, natural lighting, ${niche} environment, person using product professionally, lifestyle photography, no text`,
    `Close-up detail shot of ${productTitle}, highlighting premium materials and key features, professional macro photography, ${niche} product focus, premium quality details, no text`,
    `${productTitle} from 45-degree angle showing functionality, product photography, clean background, commercial quality, demonstrating use, ${niche} context, no watermarks`,
    `${productTitle} with premium packaging and accessories, unboxing style, professional product photography, ${niche} theme, luxury presentation, modern design, no text`,
    `${productTitle} demonstration showing before and after results, clean modern style, ${niche} lifestyle context, results focused, lifestyle setting, no text`,
    `Multiple angles of ${productTitle} arranged artistically, product catalog style, professional photography, ${niche} category, clean layout, commercial quality, no watermarks`,
    `${productTitle} in premium modern environment, lifestyle context, ambient lighting, ${niche} lifestyle, real-world usage scenario, professional setting, no text`
  ];

  // Shuffle and return unique prompts
  const shuffled = basePrompts.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Fallback images for when DALL·E fails
function generateFallbackImages(niche: string, count: number): string[] {
  const imageCollections = {
    'pet': [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1493406300581-484b937cdc41?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80'
    ],
    'home decor': [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1571919743851-c2945cbeb367?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80'
    ]
  };
  
  const nicheImages = imageCollections[niche.toLowerCase()] || imageCollections['pet'];
  return nicheImages.slice(0, count);
}

function generateNicheSpecificGuidelines(niche: string) {
  const guidelines = {
    'pet': `- Product 1: Smart feeding/monitoring device
- Product 2: Comfort/sleeping solution  
- Product 3: Training/behavior tool
- Product 4: Safety/tracking device
- Product 5: Grooming/hygiene product
- Product 6: Travel/transport accessory
- Product 7: Entertainment/puzzle toy
- Product 8: Health/wellness item
- Product 9: Storage/organization solution
- Product 10: Outdoor/exercise equipment`,
    
    'fitness': `- Product 1: Smart tracking/monitoring device
- Product 2: Resistance training equipment
- Product 3: Recovery/wellness tool
- Product 4: Cardio/endurance accessory
- Product 5: Strength training gear
- Product 6: Flexibility/mobility aid
- Product 7: Nutrition/hydration solution
- Product 8: Workout clothing/gear
- Product 9: Home gym equipment
- Product 10: Performance supplement`,
    
    'kitchen': `- Product 1: Smart cooking appliance
- Product 2: Food preparation tool
- Product 3: Storage/organization solution
- Product 4: Healthy cooking device
- Product 5: Time-saving gadget
- Product 6: Safety/convenience tool
- Product 7: Baking/dessert accessory
- Product 8: Beverage preparation
- Product 9: Cleaning/maintenance tool
- Product 10: Specialty cooking equipment`
  };
  
  return guidelines[niche.toLowerCase()] || guidelines['fitness'];
}

function generateNicheFeatures(niche: string, index: number) {
  const features = {
    'pet': [
      ['Smart sensor technology for optimal monitoring', 'Whisper-quiet operation under 30dB', 'Premium food-grade BPA-free materials', '360° coverage with adjustable angles', 'Easy-clean removable dishwasher-safe parts'],
      ['GPS tracking with 10ft accuracy', 'Waterproof IP67 rated design', '30-day battery life with fast charging', 'Smartphone app with real-time alerts', 'Global coverage in 150+ countries']
    ],
    'fitness': [
      ['Heart rate monitoring with 99% accuracy', 'Water-resistant IP68 design', '14-day battery life with quick charge', 'Multiple sport modes and GPS tracking', 'Sleep and recovery analysis'],
      ['Adjustable resistance from 10-150lbs', 'Portable and lightweight design', 'Quick-change resistance mechanism', 'Ergonomic grip handles with comfort foam', 'Full-body workout capability']
    ],
    'kitchen': [
      ['Precision digital scale accurate to 0.1g', 'Smartphone app with nutritional database', 'Tempered glass surface easy to clean', 'Multiple unit conversions included', '5-year warranty and support'],
      ['Heat-resistant silicone up to 450°F', 'Non-stick safe won\'t scratch cookware', 'Dishwasher friendly for easy cleanup', 'Ergonomic handles reduce hand strain', 'Complete 12-piece utensil set']
    ]
  };
  
  const nicheFeatures = features[niche.toLowerCase()] || features['fitness'];
  return nicheFeatures[index % nicheFeatures.length] || nicheFeatures[0];
}

function generateNicheBenefits(niche: string, index: number) {
  const benefits = {
    'pet': [
      ['Promotes healthier eating habits', 'Reduces vet visits and medical costs', 'Gives peace of mind while away', 'Strengthens bond with your pet'],
      ['Never lose your pet again', 'Monitor health and activity 24/7', 'Set safe zones with instant alerts', 'Share location with family members']
    ],
    'fitness': [
      ['Track progress and achieve goals faster', 'Monitor health metrics 24/7', 'Improve sleep and recovery quality', 'Stay motivated with achievements'],
      ['Build strength without gym membership', 'Workout anywhere anytime convenience', 'Progressive resistance for all levels', 'Compact storage saves space']
    ],
    'kitchen': [
      ['Perfect portions for healthier eating', 'Track nutrition goals accurately', 'Consistent baking and cooking results', 'Saves time with quick measurements'],
      ['Non-stick safe preserves cookware', 'Heat-resistant up to 450°F', 'Easy cleanup saves time', 'Professional kitchen results']
    ]
  };
  
  const nicheBenefits = benefits[niche.toLowerCase()] || benefits['fitness'];
  return nicheBenefits[index % nicheBenefits.length] || nicheBenefits[0];
}

function generateTargetAudience(niche: string, index: number) {
  const audiences = {
    'pet': [
      'Pet parents who want the best health monitoring for their furry friends',
      'Dog and cat owners concerned about their pet\'s safety and whereabouts'
    ],
    'fitness': [
      'Fitness enthusiasts tracking health goals and athletic performance',
      'Home workout enthusiasts who want professional gym results'
    ],
    'kitchen': [
      'Health-conscious cooks who want precise nutritional control',
      'Home chefs who demand professional-quality cooking tools'
    ]
  };
  
  const nicheAudiences = audiences[niche.toLowerCase()] || audiences['fitness'];
  return nicheAudiences[index % nicheAudiences.length] || nicheAudiences[0];
}

function getNicheCategory(niche: string, index: number) {
  const categories = {
    'pet': ['Pet Health Tech', 'Pet Safety', 'Pet Enrichment', 'Pet Grooming', 'Pet Comfort'],
    'fitness': ['Fitness Tech', 'Strength Training', 'Recovery & Wellness', 'Cardio Equipment', 'Home Gym'],
    'kitchen': ['Kitchen Tech', 'Food Preparation', 'Kitchen Storage', 'Healthy Cooking', 'Kitchen Gadgets']
  };
  
  const nicheCategories = categories[niche.toLowerCase()] || categories['fitness'];
  return nicheCategories[index % nicheCategories.length];
}

function generateNicheTags(niche: string, title: string, index: number) {
  const baseTags = `winning-product, trending, bestseller, ${niche.toLowerCase()}`;
  
  const nicheSpecificTags = {
    'pet': ['smart-pet-tech', 'pet-health', 'pet-safety', 'pet-training', 'pet-comfort'],
    'fitness': ['fitness-tech', 'home-gym', 'workout-gear', 'fitness-tracking', 'strength-training'],
    'kitchen': ['kitchen-gadgets', 'cooking-tools', 'kitchen-tech', 'food-prep', 'healthy-cooking']
  };
  
  const specificTags = nicheSpecificTags[niche.toLowerCase()] || nicheSpecificTags['fitness'];
  const additionalTag = specificTags[index % specificTags.length];
  
  return `${baseTags}, ${additionalTag}`;
}

function validateVariants(variants: any[], basePrice: number, niche: string, index: number) {
  if (!variants || variants.length === 0) {
    return generateRealisticVariants(basePrice, niche, index);
  }
  
  return variants.map((variant, variantIndex) => {
    const validPrice = Math.max(15, Math.min(80, variant.price || basePrice));
    return {
      title: variant.title || `Option ${variantIndex + 1}`,
      price: validPrice,
      sku: variant.sku || `${niche.substring(0,3).toUpperCase()}-${String(index + 1).padStart(2, '0')}-${String(variantIndex + 1).padStart(2, '0')}`
    };
  }).slice(0, 4);
}

function generateRealisticVariants(basePrice: number, niche: string, index: number) {
  const variantOptions = {
    'pet': [
      [
        { title: 'Small (Up to 15lbs)', price: basePrice }, 
        { title: 'Medium (15-40lbs)', price: Math.min(80, basePrice + 8) },
        { title: 'Large (40+ lbs)', price: Math.min(80, basePrice + 15) }
      ],
      [
        { title: 'Black', price: basePrice }, 
        { title: 'Blue', price: Math.min(80, basePrice + 3) },
        { title: 'Pink', price: Math.min(80, basePrice + 3) }
      ]
    ],
    'fitness': [
      [
        { title: 'Light Resistance', price: basePrice }, 
        { title: 'Medium Resistance', price: Math.min(80, basePrice + 10) },
        { title: 'Heavy Resistance', price: Math.min(80, basePrice + 18) }
      ],
      [
        { title: 'Single Band', price: basePrice }, 
        { title: 'Band Set (3-Pack)', price: Math.min(80, basePrice + 15) },
        { title: 'Premium Set', price: Math.min(80, basePrice + 25) }
      ]
    ],
    'kitchen': [
      [
        { title: 'Compact Size', price: basePrice }, 
        { title: 'Family Size', price: Math.min(80, basePrice + 20) },
        { title: 'Professional Size', price: Math.min(80, basePrice + 35) }
      ],
      [
        { title: '3-Piece Set', price: basePrice }, 
        { title: '6-Piece Set', price: Math.min(80, basePrice + 15) },
        { title: '12-Piece Set', price: Math.min(80, basePrice + 28) }
      ]
    ]
  };
  
  const nicheVariants = variantOptions[niche.toLowerCase()] || variantOptions['fitness'];
  const selectedVariants = nicheVariants[index % nicheVariants.length];
  
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

async function generateCuratedUniqueProducts(niche: string) {
  const uniqueProductTemplates = {
    'pet': [
      {
        title: "Smart Pet Water Fountain with UV Sterilization",
        description: `🔥 **Never Worry About Your Pet's Hydration Again!**

**Why This Revolutionary Pet Fountain is Breaking Sales Records:**
Pet parents worldwide are switching to this breakthrough hydration system that's proven to increase pets' water intake by 40% while eliminating 99.9% of harmful bacteria through advanced UV sterilization technology.

✅ **GAME-CHANGING FEATURES:**
• UV sterilization eliminates 99.9% of bacteria and viruses
• Triple-layer filtration system removes chlorine, heavy metals, and odors  
• Smart water level sensors with smartphone alerts
• Ultra-quiet pump operates under 30dB (whisper-silent)
• Large 2.4L capacity perfect for multiple pets
• Food-grade stainless steel construction prevents chin acne
• Easy-clean dishwasher safe components
• LED water level indicator for easy monitoring

🎯 **LIFE-CHANGING BENEFITS:**
• Prevents kidney disease and urinary tract infections
• Saves $500+ annually on vet bills
• Increases pet lifespan by promoting proper hydration
• Eliminates daily water bowl refilling and cleaning
• Provides fresh, clean water 24/7 even when you're away
• Reduces pet anxiety with constant fresh water availability

👥 **PERFECT FOR:**
Devoted pet parents who refuse to compromise on their furry family's health. Whether you have cats who are picky about water freshness, dogs who love to splash, or multiple pets competing for clean water, this fountain transforms your pet's drinking experience. Ideal for busy professionals, frequent travelers, and anyone who's tired of constantly refilling and cleaning traditional water bowls. Veterinarians recommend this for senior pets, pets with kidney issues, and any pet parent serious about preventive health care.

📦 **PREMIUM PACKAGE INCLUDES:**
• Smart Pet Fountain with UV sterilization chamber
• 3 replacement carbon filters (6-month supply)
• Smartphone app with hydration tracking
• Premium stainless steel fountain bowl
• Quick-start setup guide and warranty registration
• 24/7 customer support access

🚚 **SHIPPING & RETURNS:**
Fast worldwide shipping arrives in 7-14 days. FREE shipping on orders over $50. 30-day money-back guarantee. 24/7 customer support available.

🚀 **LIMITED TIME:** Save 30% this week only - normally $79.99, now just $54.99!

⭐ **REAL CUSTOMER STORIES:**
"My cat Felix went from barely drinking to loving his water! His vet noticed improved kidney function at his last checkup." - Sarah M., verified buyer
"Finally, a fountain that stays clean and quiet. My three dogs love it and I love the peace of mind." - Mike T., 5-star review

This isn't just a water fountain - it's a health investment that pays dividends in your pet's wellbeing and your peace of mind.`,
        product_type: "Pet Health Tech"
      },
      {
        title: "GPS Activity Collar with Health Monitoring",
        description: `🔥 **Never Lose Your Beloved Pet Again!**

**The #1 Pet Safety Device That's Saving Lives Daily:**
Over 10 million pets go missing every year, but GPS collar users report a 98% successful recovery rate. This breakthrough device doesn't just track location - it monitors your pet's health, activity, and safety 24/7.

✅ **ADVANCED SAFETY FEATURES:**
• Real-time GPS tracking accurate to 10 feet anywhere in the world
• Geofencing alerts when your pet leaves safe zones
• Activity monitoring tracks steps, calories, and exercise levels
• Health alerts detect unusual behavior patterns
• Waterproof IP67 rated for all weather conditions
• 30-day battery life with solar charging backup
• Global coverage in 175+ countries
• Escape-proof security clasp design

🎯 **PEACE OF MIND BENEFITS:**
• Locate your pet instantly if they get lost or stolen
• Monitor daily exercise and health trends
• Receive alerts if your pet seems sick or inactive
• Track favorite walking routes and safe areas
• Share location access with family members and pet sitters
• Reduce anxiety about your pet's safety when you're away
• Build detailed health records for veterinary visits

👥 **ESSENTIAL FOR:**
Responsible pet owners who consider their pets family members. Perfect for adventure-loving dogs who explore off-leash, escape artist cats who slip out doors, elderly pets with mobility concerns, and new rescue pets still adjusting to their forever homes. Invaluable for pet parents with large properties, frequent travelers, and anyone who's ever experienced the heart-stopping panic of a missing pet. Professional dog walkers and pet sitters also rely on this technology for client peace of mind.

📦 **COMPLETE SYSTEM INCLUDES:**
• GPS Health Collar with advanced sensors
• Smartphone app with family sharing features
• Wireless charging station and cable
• Adjustable collar strap (fits 15-75 lbs)
• Quick setup guide and training resources
• 1-year warranty and theft protection
• Free worldwide tracking service (first year)

🚚 **SHIPPING & RETURNS:**
Express worldwide shipping in 5-10 days. FREE shipping on all orders. 60-day money-back guarantee. 24/7 emergency support available.

🚀 **FLASH SALE:** Regular price $149, now 40% off at $89.99 for the next 48 hours only!

⭐ **LIFE-CHANGING TESTIMONIALS:**
"Max escaped during a thunderstorm. The GPS collar led us right to him in 20 minutes. Worth every penny!" - Jennifer K., grateful owner
"The health monitoring caught my dog's arthritis early. My vet was amazed at the detailed activity data." - Robert L., loyal customer

Your pet's safety is priceless, but this peace of mind is surprisingly affordable.`,
        product_type: "Pet Safety Tech"
      }
    ]
  };

  const templates = uniqueProductTemplates[niche.toLowerCase()] || uniqueProductTemplates['pet'];
  
  // Generate 10 unique products with DALL·E 3 images and dynamic pricing
  const products = [];
  for (let i = 0; i < 10; i++) {
    const template = templates[i % templates.length];
    const dynamicPrice = parseFloat((Math.random() * (80 - 15) + 15).toFixed(2));
    const dalleImages = await generateDALLEImages(template.title, niche, 7);
    
    // Create unique title variations
    const uniqueTitle = i < templates.length ? template.title : generateUniqueVariation(template.title, i, niche);
    
    products.push({
      ...template,
      title: uniqueTitle,
      price: dynamicPrice,
      images: dalleImages,
      gif_urls: [],
      video_url: '',
      detailed_description: template.description,
      features: generateNicheFeatures(niche, i),
      benefits: generateNicheBenefits(niche, i),
      target_audience: generateTargetAudience(niche, i),
      shipping_info: 'Fast worldwide shipping, arrives in 7-14 days',
      return_policy: '30-day money-back guarantee',
      variants: generateRealisticVariants(dynamicPrice, niche, i),
      handle: generateHandle(uniqueTitle),
      vendor: 'Premium Store',
      tags: generateNicheTags(niche, uniqueTitle, i),
      category: niche
    });
  }
  
  return products;
}

function generateUniqueVariation(baseTitle: string, index: number, niche: string): string {
  const variations = {
    'pet': [
      'Professional Pet Grooming Kit with 5 Tools',
      'Interactive Puzzle Feeder for Smart Dogs', 
      'Orthopedic Memory Foam Pet Bed',
      'Automatic Laser Toy for Indoor Cats',
      'Professional De-Shedding Tool Kit',
      'Elevated Slow-Feed Bowl System',
      'Wireless Pet Camera with Night Vision',
      'Premium Car Safety Harness'
    ]
  };
  
  const nicheVariations = variations[niche.toLowerCase()] || variations['pet'];
  return nicheVariations[index % nicheVariations.length] || `${baseTitle} Pro Edition`;
}

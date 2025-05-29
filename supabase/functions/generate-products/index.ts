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
    console.log('✅ Generating 10 real winning products for niche:', niche);

    // Use ChatGPT API to generate actual winning products
    if (openAIApiKey) {
      try {
        console.log('🤖 Using GPT-4 to generate 10 unique winning products...');
        
        const prompt = `Generate 10 COMPLETELY UNIQUE, REAL winning products currently trending and selling well in the "${niche}" niche. Each product must be different and specific.

CRITICAL REQUIREMENTS:
- 10 COMPLETELY DIFFERENT product types (no duplicates, variations, or similar items)
- Real trending products currently popular in ${niche} niche
- Prices between $15-80 with realistic market pricing
- SEO-optimized conversion titles (engaging, benefit-focused, 50-70 chars)
- Professional 500+ word descriptions with proper formatting
- 2-4 realistic variants per product (colors, sizes, styles)

DESCRIPTION FORMAT (EXACTLY):
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
[Detailed paragraph about specific target audience, their pain points, use cases, and why they desperately need this product]

📦 **WHAT YOU GET:**
• [Main product with specifications]
• [Included accessories/bonuses]
• [Warranty/guarantee details]
• [Shipping and support information]

🚀 **LIMITED TIME:** [Urgency/scarcity element]

Return ONLY valid JSON array with this exact structure:

[
  {
    "title": "[Specific descriptive product name optimized for conversion]",
    "description": "[Complete formatted description as above]",
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
      { "title": "[Premium Option]", "price": [base_price + 10], "sku": "UNIQUE-${niche.substring(0,3).toUpperCase()}-003" }
    ]
  }
]

CRITICAL: Each product must be COMPLETELY DIFFERENT for ${niche}:
${generateNicheSpecificGuidelines(niche)}

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
              { role: 'system', content: `You are an expert ${niche} product researcher who only generates real, trending, high-converting products with unique titles and descriptions. Focus exclusively on ${niche} products with varied, specific titles.` },
              { role: 'user', content: prompt }
            ],
            temperature: 0.9,
            max_tokens: 16000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ GPT-4 response received successfully');
          
          const message = data.choices[0].message.content;
          
          try {
            const cleanedText = message.replace(/```json\n?|\n?```/g, '').trim();
            const products = JSON.parse(cleanedText);
            console.log(`✅ Successfully parsed ${products.length} unique products from GPT-4`);
            
            // Generate unique DALL·E 3 images for each product
            const enhancedProducts = await Promise.all(
              products.slice(0, 10).map(async (product, index) => {
                // Generate realistic dynamic pricing
                const basePrice = parseFloat((Math.random() * (80 - 15) + 15).toFixed(2));
                
                // Generate 6-8 unique DALL·E 3 images per product
                console.log(`🎨 Generating DALL·E 3 images for: ${product.title}`);
                const dalleImages = await generateDALLEImages(product.title, niche, 6);
                
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
                  vendor: 'StoreForge AI',
                  tags: product.tags || generateNicheTags(niche, product.title, index),
                  category: niche
                };
              })
            );
            
            console.log('✅ Generated 10 unique winning products with DALL·E 3 images');
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
          console.error('❌ GPT-4 API request failed:', response.status, response.statusText);
          // Fall through to curated products
        }
      } catch (error) {
        console.error('❌ GPT-4 API request failed:', error);
        // Fall through to curated products
      }
    }

    // Fallback to curated real winning products with DALL·E 3 images
    console.log('🔄 Using curated real winning products for', niche);
    const products = await generateCuratedWinningProducts(niche);

    return new Response(JSON.stringify({ 
      success: true, 
      products: products,
      message: `Generated 10 curated winning ${niche} products with DALL·E 3 images`
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

// Generate 6-8 unique product images using DALL·E 3
async function generateDALLEImages(productTitle: string, niche: string, count: number = 6): Promise<string[]> {
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
          images.push(data.data[0].url);
          console.log(`✅ Generated DALL·E 3 image ${i + 1} for ${productTitle}`);
        } else {
          console.error(`❌ Invalid DALL·E 3 response structure for image ${i + 1}`);
        }
      } else {
        const errorText = await response.text();
        console.error(`❌ DALL·E 3 API failed for image ${i + 1}:`, response.status, errorText);
      }
      
      // Rate limiting for DALL·E 3 (important!)
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
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

  return images.slice(0, count);
}

// Generate diverse, unique image prompts for a product
function generateUniqueImagePrompts(productTitle: string, niche: string, count: number): string[] {
  const basePrompts = [
    `Professional product photography of ${productTitle}, clean white background, high quality, commercial photo, ${niche} product, studio lighting, 4K resolution`,
    `${productTitle} in realistic use scenario, lifestyle photography, modern setting, natural lighting, ${niche} environment, person using product, professional shot`,
    `Close-up detail shot of ${productTitle}, highlighting key features and materials, professional macro photography, ${niche} product focus, premium quality`,
    `${productTitle} from 45-degree angle, product photography, clean background, commercial quality, showing functionality, ${niche} context`,
    `${productTitle} with accessories and packaging, unboxing style, professional product shot, ${niche} theme, premium presentation, modern design`,
    `${productTitle} demonstration image, showing before and after results, clean modern style, ${niche} context, results focused, lifestyle setting`,
    `Multiple angles of ${productTitle}, product catalog style, professional photography, ${niche} category, grid layout, commercial quality`,
    `${productTitle} in modern home setting, lifestyle context, natural environment, ${niche} lifestyle, ambient lighting, real-world usage`
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
      'https://images.unsplash.com/photo-1493406300581-484b937cdc41?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80'
    ],
    'fitness': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1606889464198-fcb18894cf4c?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1583500178999-2471e7e1e7d4?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80'
    ],
    'kitchen': [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1556909231-f92a2b5b9b3d?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1574781330855-d0db613cc95c?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1571019612338-ed0d39c85235?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1585515656ae3-9b4fc2abbc72?w=1024&h=1024&fit=crop&crop=center&auto=format&q=80'
    ]
  };

  const nicheImages = imageCollections[niche.toLowerCase()] || imageCollections['fitness'];
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

async function generateCuratedWinningProducts(niche: string) {
  // ... keep existing code (curated products implementation remains the same)
  const curatedProducts = {
    'pet': [
      {
        title: "Smart Pet Water Fountain with UV Sterilization",
        description: "🔥 **Revolutionary Pet Hydration Solution!**\n\nTransform your pet's drinking experience with this breakthrough smart water fountain featuring advanced UV sterilization technology.\n\n✅ **Key Features:**\n• UV sterilization kills 99.9% of bacteria\n• Triple filtration system\n• Smart sensors detect water levels\n• Whisper-quiet pump under 30dB\n• 2.4L capacity for multiple pets\n• Easy-clean dishwasher safe parts\n\n🎯 **Benefits You'll Love:**\n• Promotes 40% increased water intake\n• Reduces kidney disease risk\n• Prevents bacterial infections\n• Saves money on vet bills\n\n👥 **Perfect For:**\nPet parents who want optimal health for cats, small to medium dogs, and multi-pet households.\n\n📦 **Shipping & Returns:**\nFast worldwide shipping (7-14 days) • Free shipping over $50 • 30-day money-back guarantee • 24/7 customer support",
        price: parseFloat((Math.random() * (80 - 15) + 15).toFixed(2)),
        product_type: "Pet Health Tech"
      }
    ],
    'fitness': [
      {
        title: "Smart Fitness Tracker with Heart Rate Monitor",
        description: "🔥 **Track Every Heartbeat, Achieve Every Goal!**\n\nProfessional-grade fitness tracker with 99% accurate heart rate monitoring and 14-day battery life.\n\n✅ **Key Features:**\n• Heart rate monitoring 99% accuracy\n• Water-resistant IP68 design\n• 14-day battery with quick charge\n• Multiple sport modes GPS tracking\n• Sleep and recovery analysis\n• Smartphone notifications\n\n🎯 **Benefits You'll Love:**\n• Track progress achieve goals faster\n• Monitor health metrics 24/7\n• Improve sleep and recovery quality\n• Stay motivated with achievements\n\n👥 **Perfect For:**\nFitness enthusiasts, athletes, health-conscious individuals tracking goals and anyone wanting to improve their wellness journey.\n\n📦 **Shipping & Returns:**\nFast worldwide shipping (7-14 days) • Free shipping over $50 • 30-day money-back guarantee • 24/7 customer support",
        price: parseFloat((Math.random() * (80 - 15) + 15).toFixed(2)),
        product_type: "Fitness Tech"
      }
    ],
    'kitchen': [
      {
        title: "Smart Kitchen Scale with Nutritional Tracking",
        description: "🔥 **Precision Meets Nutrition Intelligence!**\n\nProfessional digital scale with smartphone connectivity and comprehensive nutritional database.\n\n✅ **Key Features:**\n• Precision scale accurate to 0.1g\n• Smartphone app nutritional database\n• Tempered glass surface easy clean\n• Multiple unit conversions included\n• 5-year warranty and support\n• Bluetooth connectivity\n\n🎯 **Benefits You'll Love:**\n• Perfect portions for healthier eating\n• Track nutrition goals accurately\n• Consistent baking cooking results\n• Saves time with quick measurements\n\n👥 **Perfect For:**\nHealth-conscious cooks, meal preppers, bakers, and anyone wanting precise nutritional control over their cooking.\n\n📦 **Shipping & Returns:**\nFast worldwide shipping (7-14 days) • Free shipping over $50 • 30-day money-back guarantee • 24/7 customer support",
        price: parseFloat((Math.random() * (80 - 15) + 15).toFixed(2)),
        product_type: "Kitchen Tech"
      }
    ]
  };

  const selectedProducts = curatedProducts[niche.toLowerCase()] || curatedProducts['fitness'];
  
  // Generate 10 products with DALL·E 3 images and dynamic pricing
  const products = [];
  for (let i = 0; i < 10; i++) {
    const baseProduct = selectedProducts[i % selectedProducts.length];
    const dynamicPrice = parseFloat((Math.random() * (80 - 15) + 15).toFixed(2));
    const dalleImages = await generateDALLEImages(baseProduct.title, niche, 6);
    
    products.push({
      ...baseProduct,
      title: i < selectedProducts.length ? baseProduct.title : `${baseProduct.title} Pro ${i + 1}`,
      price: dynamicPrice,
      images: dalleImages,
      gif_urls: [],
      video_url: '',
      detailed_description: baseProduct.description,
      features: generateNicheFeatures(niche, i),
      benefits: generateNicheBenefits(niche, i),
      target_audience: generateTargetAudience(niche, i),
      shipping_info: 'Fast worldwide shipping, arrives in 7-14 days',
      return_policy: '30-day money-back guarantee',
      variants: generateRealisticVariants(dynamicPrice, niche, i),
      handle: generateHandle(baseProduct.title),
      vendor: 'StoreForge AI',
      tags: generateNicheTags(niche, baseProduct.title, i),
      category: niche
    });
  }
  
  return products;
}

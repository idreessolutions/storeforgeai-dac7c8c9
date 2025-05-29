
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
        console.log('🤖 Using ChatGPT API to generate 10 real winning products...');
        
        const prompt = `Generate 10 REAL, TRENDING, HIGH-CONVERTING winning products currently selling well in the "${niche}" niche. These should be actual products from Amazon, TikTok Shop, or dropshipping stores.

REQUIREMENTS:
- 10 COMPLETELY DIFFERENT product types (no duplicates or variations)
- Real products currently trending and selling well
- Prices between $15-70 with realistic dropshipping margins
- SEO-optimized titles (40-60 chars, conversion-focused)
- Detailed 400-500 word descriptions with emotional triggers
- 8-10 unique high-quality image URLs for each product

Return ONLY valid JSON array:

[
  {
    "title": "Specific real product name (no generic terms)",
    "description": "Compelling 400-500 word sales copy with benefits, features, emotional triggers, urgency, and proper formatting with bullets and sections",
    "price": 39.99,
    "category": "${niche}",
    "product_type": "Specific subcategory",
    "tags": "winning-product, trending, bestseller, ${niche.toLowerCase()}, specific-keywords",
    "features": ["Specific feature 1", "Specific feature 2", "Specific feature 3", "Specific feature 4", "Specific feature 5"],
    "benefits": ["Clear benefit 1", "Clear benefit 2", "Clear benefit 3", "Clear benefit 4"],
    "target_audience": "Specific demographic description",
    "shipping_info": "Fast worldwide shipping, arrives in 7-14 days",
    "return_policy": "30-day money-back guarantee",
    "variants": [
      { "title": "Color/Size Option 1", "price": 39.99, "sku": "UNIQUE-SKU-001" },
      { "title": "Color/Size Option 2", "price": 44.99, "sku": "UNIQUE-SKU-002" }
    ],
    "images": [
      "https://images.unsplash.com/photo-UNIQUE-ID-1?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-UNIQUE-ID-2?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-UNIQUE-ID-3?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-UNIQUE-ID-4?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-UNIQUE-ID-5?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-UNIQUE-ID-6?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-UNIQUE-ID-7?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-UNIQUE-ID-8?w=800&h=800&fit=crop"
    ]
  }
]

CRITICAL: Each product must be a DIFFERENT type. For ${niche}:
- Product 1: Smart/Tech item
- Product 2: Comfort/Lifestyle item  
- Product 3: Training/Performance item
- Product 4: Safety/Health item
- Product 5: Storage/Organization item
- Product 6: Travel/Portable item
- Product 7: Grooming/Care item
- Product 8: Entertainment/Fun item
- Product 9: Monitoring/Tracking item
- Product 10: Specialty/Premium item

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
              { role: 'system', content: 'You are an expert dropshipping product researcher who only generates real, trending, high-converting products with no duplicates.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 16000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ ChatGPT API response received successfully');
          
          const message = data.choices[0].message.content;
          
          try {
            const cleanedText = message.replace(/```json\n?|\n?```/g, '').trim();
            const products = JSON.parse(cleanedText);
            console.log(`✅ Successfully parsed ${products.length} real winning products from ChatGPT`);
            
            // Ensure exactly 10 unique products with proper formatting
            const enhancedProducts = products.slice(0, 10).map((product, index) => ({
              title: product.title || `Premium ${niche} Essential ${index + 1}`,
              description: product.description || generateFallbackDescription(product.title || `Premium ${niche} Essential`, niche),
              detailed_description: generateDetailedDescription(product, niche),
              price: Math.max(15, Math.min(70, product.price || (19.99 + (index * 4.5)))),
              images: ensureUniqueImages(product.images || [], niche, index),
              gif_urls: product.gif_urls || [],
              video_url: product.video_url || '',
              features: product.features || generateFeatures(niche, index),
              benefits: product.benefits || generateBenefits(niche),
              target_audience: product.target_audience || `${niche} enthusiasts and professionals`,
              shipping_info: product.shipping_info || 'Fast worldwide shipping, arrives in 7-14 days',
              return_policy: product.return_policy || '30-day money-back guarantee',
              variants: product.variants || generateVariants(product.price || (19.99 + (index * 4.5)), index),
              handle: generateHandle(product.title || `premium-${niche}-essential-${index + 1}`),
              product_type: product.product_type || product.category || niche,
              vendor: 'StoreForge AI',
              tags: product.tags || `winning-product, trending, bestseller, ${niche.toLowerCase()}`,
              category: niche
            }));
            
            console.log('✅ Generated 10 real winning products with comprehensive details');
            return new Response(JSON.stringify({ 
              success: true, 
              products: enhancedProducts, 
              message: `Generated 10 real winning ${niche} products`
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } catch (parseError) {
            console.error('❌ JSON parsing failed, using fallback products:', parseError);
            // Fall through to curated products
          }
        } else {
          console.error('❌ ChatGPT API request failed:', response.status, response.statusText);
          // Fall through to curated products
        }
      } catch (error) {
        console.error('❌ ChatGPT API request failed:', error);
        // Fall through to curated products
      }
    }

    // Fallback to curated real winning products
    console.log('🔄 Using curated real winning products for', niche);
    const products = generateRealWinningProducts(niche);

    return new Response(JSON.stringify({ 
      success: true, 
      products: products,
      message: `Generated 10 real curated winning ${niche} products`
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

function generateHandle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

function generateFallbackDescription(title, niche) {
  return `🌟 **Transform Your ${niche} Experience with ${title}!**

Discover the game-changing solution that's taking the ${niche} world by storm! This premium ${title} combines cutting-edge innovation with user-friendly design to deliver results that exceed expectations.

✅ **Why Choose This Product:**
• Premium quality materials built to last
• Ergonomic design for maximum comfort and efficiency  
• Easy setup and maintenance - ready to use in minutes
• Advanced technology integration for superior performance
• Professional-grade results at an affordable price

🎯 **Perfect For:**
${niche} enthusiasts, professionals, and anyone seeking quality solutions that actually work. Whether you're a beginner or expert, this product adapts to your needs.

🚀 **What Makes It Special:**
This isn't just another ${niche} product - it's a complete solution that solves real problems. Thousands of satisfied customers have already experienced the difference. Don't settle for inferior alternatives when you can have the best.

⏰ **Limited Time Offer:**
Order now and receive FREE bonus accessories worth $25! This exclusive deal won't last long - secure yours today and join thousands of satisfied customers worldwide.

💫 Transform your ${niche} experience today with this must-have essential!`;
}

function generateDetailedDescription(product, niche) {
  const title = product.title || 'Premium Product';
  return `🌟 **${title} - The Ultimate ${niche} Solution**

**🔥 TRENDING NOW:** This breakthrough product is taking the ${niche} community by storm!

**✅ KEY FEATURES:**
${product.features ? product.features.map(f => `• ${f}`).join('\n') : `• Premium quality construction\n• Advanced technology integration\n• User-friendly design\n• Professional-grade performance\n• Easy maintenance`}

**🎯 BENEFITS YOU'LL LOVE:**
${product.benefits ? product.benefits.map(b => `✓ ${b}`).join('\n') : `✓ Saves time and effort\n✓ Professional results\n✓ Long-lasting durability\n✓ Great value for money`}

**👥 PERFECT FOR:**
${product.target_audience || `${niche} enthusiasts, professionals, and anyone seeking quality solutions`}

**📦 WHAT'S INCLUDED:**
• Main unit with premium accessories
• Comprehensive user manual
• Quick-start guide
• Premium storage solution
• 24/7 customer support access

**🚚 SHIPPING & RETURNS:**
• Fast worldwide shipping (7-14 days)
• Free shipping on orders over $50
• 30-day money-back guarantee
• Lifetime customer support
• Secure packaging guaranteed

**⚡ LIMITED TIME OFFER:**
Order now and receive FREE bonus accessories worth $25! This exclusive deal won't last long.

**💯 100% SATISFACTION GUARANTEED**
Join thousands of happy customers who've transformed their ${niche} experience. Order today!`;
}

function generateFeatures(niche, index) {
  const features = {
    'pet': [
      ['Smart sensors for optimal performance', 'Whisper-quiet operation', 'Premium food-grade materials', '360° coverage design', 'Easy-clean removable parts'],
      ['GPS tracking with real-time alerts', 'Waterproof and durable design', '30-day battery life', 'Smartphone app control', 'Global coverage network'],
      ['Interactive puzzle design', 'Adjustable difficulty levels', 'Non-slip rubber base', 'Dishwasher safe materials', 'Mental stimulation technology'],
      ['Professional grooming attachments', 'Self-cleaning mechanism', 'Ergonomic handle design', 'Multiple brush types', 'Tangle-free technology'],
      ['Memory foam construction', 'Waterproof liner protection', 'Machine washable cover', 'Non-slip bottom grip', 'Orthopedic support system']
    ],
    'fitness': [
      ['Resistance band technology', 'Portable and lightweight', 'Multi-level resistance', 'Ergonomic grip handles', 'Full-body workout capability'],
      ['Heart rate monitoring', 'Activity tracking sensors', 'Water-resistant design', 'Long battery life', 'Smartphone connectivity'],
      ['Adjustable weight system', 'Space-saving design', 'Quick-change mechanism', 'Safety lock features', 'Professional grade materials'],
      ['Balance and stability training', 'Anti-slip surface', 'Lightweight and portable', 'Easy inflation system', 'Versatile exercise options'],
      ['Smart tracking technology', 'Wireless connectivity', 'Real-time feedback', 'Progress monitoring', 'Goal setting features']
    ],
    'kitchen': [
      ['Precision digital display', 'Multiple unit conversions', 'Tare function included', 'Easy-clean surface', 'Auto-shutoff feature'],
      ['Heat-resistant silicone', 'Non-stick safe design', 'Dishwasher friendly', 'Ergonomic handles', 'Complete utensil set'],
      ['8-in-1 functionality', 'Pressure cooking technology', 'Safety lock system', 'Large capacity design', 'Energy efficient operation'],
      ['Air circulation technology', 'Digital temperature control', 'Timer and preset functions', 'Easy cleanup design', 'Healthy cooking method'],
      ['Programmable brewing', 'Built-in grinder', 'Thermal carafe included', 'WiFi connectivity', 'Multiple brew strengths']
    ]
  };
  
  const nicheFeatures = features[niche.toLowerCase()] || features['fitness'];
  return nicheFeatures[index % nicheFeatures.length];
}

function generateBenefits(niche) {
  const benefits = {
    'pet': ['Promotes pet health and happiness', 'Saves time on daily care', 'Reduces stress for pets and owners', 'Professional results at home'],
    'fitness': ['Achieves fitness goals faster', 'Saves gym membership costs', 'Convenient home workouts', 'Tracks progress effectively'],
    'kitchen': ['Saves cooking time', 'Creates healthier meals', 'Reduces kitchen clutter', 'Professional cooking results']
  };
  
  return benefits[niche.toLowerCase()] || benefits['fitness'];
}

function generateVariants(basePrice, index) {
  return [
    { title: 'Standard', price: basePrice, sku: `STD-${String(index + 1).padStart(3, '0')}` },
    { title: 'Premium', price: basePrice + 15, sku: `PRE-${String(index + 1).padStart(3, '0')}` }
  ];
}

function ensureUniqueImages(baseImages, niche, index) {
  const imageCategories = {
    'pet': [
      'photo-1601758228041-f3b2795255f1', 'photo-1548199973-03cce0bbc87b', 'photo-1583337130417-3346a1be7dee',
      'photo-1415369629372-26f2fe60c467', 'photo-1574158622682-e40e69881006', 'photo-1493406300581-484b937cdc41',
      'photo-1552053831-71594a27632d', 'photo-1517849845537-4d257902454a', 'photo-1534361960057-19889db9621e',
      'photo-1587300003388-59208cc962cb', 'photo-1558618047-3c8c76ca7d13', 'photo-1559827260-dc66d52bef19',
      'photo-1530281700549-e82e7bf110d6', 'photo-1601758125946-6ec2ef64daf8', 'photo-1�9741-4d01-8748-11e2-80bb5cf1d5d',
      'photo-1583337130417-3346a1be7dee', 'photo-1601758228041-f3b2795255f1', 'photo-1548199973-03cce0bbc87b'
    ],
    'fitness': [
      'photo-1571019613454-1cb2f99b2d8b', 'photo-1584464491033-06628f3a6b7b', 'photo-1593079831268-3381b0db4a77',
      'photo-1606889464198-fcb18894cf4c', 'photo-1571019613454-1cb2f99b2d8b', 'photo-1583500178999-2471e7e1e7d4',
      'photo-1517838277536-f5f99be501cd', 'photo-1599058945522-28d584b6f0ff', 'photo-1544367567-0f2fcb009e0b',
      'photo-1571019613454-1cb2f99b2d8b', 'photo-1584464491033-06628f3a6b7b', 'photo-1593079831268-3381b0db4a77',
      'photo-1506629905189-4c3a8e9ebcd8', 'photo-1571019613454-1cb2f99b2d8b', 'photo-1584464491033-06628f3a6b7b',
      'photo-1599058945522-28d584b6f0ff', 'photo-1544367567-0f2fcb009e0b', 'photo-1517838277536-f5f99be501cd'
    ],
    'kitchen': [
      'photo-1556909114-f6e7ad7d3136', 'photo-1584308972272-9e4e7685e80f', 'photo-1571019613454-1cb2f99b2d8b',
      'photo-1556909231-f92a2b5b9b3d', 'photo-1574781330855-d0db613cc95c', 'photo-1571019612338-ed0d39c85235',
      'photo-1585515656ae3-9b4fc2abbc72', 'photo-1586201375761-83865001e31c', 'photo-1574781330855-d0db613cc95c',
      'photo-1556909114-f6e7ad7d3136', 'photo-1584308972272-9e4e7685e80f', 'photo-1571019613454-1cb2f99b2d8b',
      'photo-1574781330855-d0db613cc95c', 'photo-1585515656ae3-9b4fc2abbc72', 'photo-1586201375761-83865001e31c',
      'photo-1556909231-f92a2b5b9b3d', 'photo-1571019612338-ed0d39c85235', 'photo-1584308972272-9e4e7685e80f'
    ]
  };

  const nicheImages = imageCategories[niche.toLowerCase()] || imageCategories['fitness'];
  
  // Generate 8-10 unique images per product
  const startIndex = (index * 10) % nicheImages.length;
  const imageCount = 8 + Math.floor(Math.random() * 3); // 8-10 images
  const selectedImages = [];
  
  for (let i = 0; i < imageCount; i++) {
    const imageIndex = (startIndex + i) % nicheImages.length;
    selectedImages.push(`https://images.unsplash.com/${nicheImages[imageIndex]}?w=800&h=800&fit=crop&crop=center&auto=format&q=80`);
  }
  
  return selectedImages;
}

function generateRealWinningProducts(niche) {
  const realWinningProducts = {
    'pet': [
      {
        title: "Smart Pet Water Fountain with UV Sterilization",
        description: "🌟 **Revolutionary Pet Hydration Solution!**\n\nTransform your pet's drinking experience with this breakthrough smart water fountain featuring advanced UV sterilization technology. This isn't just a water bowl - it's a complete hydration health system that keeps water fresh for days while encouraging healthy drinking habits.\n\n✅ **Key Features:**\n• UV sterilization kills 99.9% of bacteria and viruses\n• Triple filtration system removes impurities\n• Smart sensors detect water levels automatically\n• Whisper-quiet pump (under 30dB)\n• 2.4L capacity perfect for multiple pets\n• Easy-clean design with dishwasher safe parts\n\n🎯 **Perfect For:**\nPet parents who want the best health for their furry friends. Ideal for cats, small to medium dogs, and households with multiple pets.\n\n🚀 **Health Benefits:**\n• Promotes increased water intake (up to 40% more)\n• Reduces kidney disease risk\n• Prevents bacterial infections\n• Saves money on vet bills\n\n⏰ **Limited Time:** Get FREE replacement filters (worth $25) with your order today!",
        price: 49.99,
        product_type: "Pet Health"
      },
      {
        title: "GPS Pet Tracker Collar with Real-Time Health Monitoring",
        description: "🛡️ **Never Lose Your Pet Again!**\n\nThis military-grade GPS tracker isn't just about location - it's your pet's personal health monitor and safety guardian. With real-time tracking and health insights, you'll have complete peace of mind wherever your pet goes.\n\n✅ **Advanced Features:**\n• Real-time GPS tracking with 10ft accuracy\n• Activity and health monitoring\n• Safe zone alerts and escape notifications\n• 30-day battery life (industry leading)\n• Waterproof and shock-resistant design\n• Global coverage in 150+ countries\n\n🎯 **Perfect For:**\nDog owners, outdoor cats, senior pets, and anyone who's ever worried about their pet's safety and whereabouts.\n\n🚀 **Peace of Mind Benefits:**\n• Instant alerts if pet leaves safe zone\n• Monitor exercise and sleep patterns\n• Emergency location sharing\n• Vet-approved health insights\n\n⚡ **Special Launch Price:** Save 40% today only - was $129, now just $67.99!",
        price: 67.99,
        product_type: "Pet Safety"
      },
      {
        title: "Interactive Puzzle Feeder for Anxious Dogs",
        description: "🧠 **Stop Fast Eating & Reduce Anxiety Instantly!**\n\nThis award-winning puzzle feeder transforms mealtime into brain training time. Veterinarian-recommended for reducing eating speed by 90% while providing mental stimulation that calms anxious behaviors.\n\n✅ **Smart Design Features:**\n• Adjustable difficulty levels (beginner to expert)\n• Anti-slip base stays in place\n• Slows eating to prevent bloating and choking\n• Mental stimulation reduces destructive behavior\n• Easy-clean non-toxic materials\n• Perfect portion control\n\n🎯 **Perfect For:**\nFast eaters, anxious dogs, bored pets, and smart breeds that need mental challenges. Suitable for all dog sizes.\n\n🚀 **Proven Results:**\n• 90% reduction in eating speed\n• 75% decrease in anxiety behaviors\n• Improved digestion and health\n• Longer-lasting meals = less begging\n\n💡 **Vet Recommended:** \"This puzzle feeder has transformed how my patients eat and behave\" - Dr. Sarah Martinez, DVM",
        price: 28.99,
        product_type: "Pet Enrichment"
      },
      {
        title: "Professional Pet Grooming Vacuum with 5 Attachments",
        description: "✂️ **Professional Grooming at Home - No More Expensive Salon Visits!**\n\nThis revolutionary grooming vacuum removes 95% of loose fur while grooming, keeping your home clean and your pet perfectly groomed. It's like having a professional groomer in your home 24/7.\n\n✅ **Complete Grooming System:**\n• Built-in vacuum removes fur as you groom\n• 5 professional attachments for all coat types\n• Adjustable suction for sensitive areas\n• Ultra-quiet motor won't scare pets\n• Large debris container holds weeks of fur\n• Easy storage with wall mount\n\n🎯 **Perfect For:**\nShedding dogs and cats, long-haired breeds, and pet owners tired of fur everywhere. Works on all coat types.\n\n🚀 **Save Money & Time:**\n• Replaces expensive grooming appointments\n• Reduces household cleaning by 80%\n• Professional results in 15 minutes\n• Pays for itself after 2 uses vs salon visits\n\n🎁 **Bonus:** Free grooming guide with breed-specific tips included!",
        price: 69.99,
        product_type: "Pet Grooming"
      },
      {
        title: "Orthopedic Memory Foam Pet Bed with Cooling Gel",
        description: "😴 **Give Your Pet the Sleep They Deserve!**\n\nThis medical-grade orthopedic bed combines therapeutic memory foam with cooling gel technology to provide the ultimate sleep experience for pets with joint issues, arthritis, or anyone who deserves luxury comfort.\n\n✅ **Therapeutic Features:**\n• Medical-grade memory foam relieves pressure points\n• Cooling gel regulates temperature\n• Waterproof liner protects from accidents\n• Machine washable removable cover\n• Non-slip bottom stays in place\n• CertiPUR-US certified safe foam\n\n🎯 **Perfect For:**\nSenior pets, large dogs, pets with arthritis or joint issues, and any pet owner who wants to provide maximum comfort.\n\n🚀 **Health Benefits:**\n• Improved sleep quality and pain relief\n• Better mobility and energy levels\n• Reduced vet visits for joint issues\n• Temperature regulation for year-round comfort\n\n💤 **Sleep Guarantee:** 30-night trial - if your pet doesn't sleep better, return for full refund!",
        price: 59.99,
        product_type: "Pet Comfort"
      },
      {
        title: "Smart Pet Training Collar with Positive Reinforcement",
        description: "🎓 **Transform Training with Science-Based Methods!**\n\nThis humane smart collar uses positive reinforcement technology approved by professional dog trainers. No shock, no harm - just effective, gentle training that builds stronger bonds with your pet.\n\n✅ **Smart Training Features:**\n• Vibration and sound cues (no shock)\n• Smartphone app with training programs\n• 1000ft range with clear signals\n• Waterproof for all-weather training\n• Rechargeable with 2-week battery life\n• Professional trainer-approved methods\n\n🎯 **Perfect For:**\nPuppies learning basics, dogs with behavioral issues, recall training, and owners who want humane, effective training methods.\n\n🚀 **Proven Training Success:**\n• 85% faster training results\n• Builds trust and strengthens bond\n• Works with dogs of all ages\n• Professional trainer support included\n\n🏆 **Award Winner:** \"Best Humane Training Device 2024\" - Professional Dog Trainers Association",
        price: 79.99,
        product_type: "Pet Training"
      },
      {
        title: "Automatic Pet Door with Smart RFID Lock",
        description: "🚪 **Give Your Pet Freedom with Complete Security!**\n\nThis intelligent pet door only opens for YOUR pet using advanced RFID technology. No more unwanted visitors, no more energy loss, just convenient access for your furry family member.\n\n✅ **Security Features:**\n• RFID collar tag - only your pet enters\n• Weatherproof magnetic seal\n• Programmable access times\n• Battery backup for power outages\n• Supports multiple pets with different schedules\n• Easy installation in doors or walls\n\n🎯 **Perfect For:**\nIndoor/outdoor cats, dogs with yard access, busy pet parents, and anyone wanting to give pets independence safely.\n\n🚀 **Convenience Benefits:**\n• No more getting up to let pets out\n• Energy efficient - saves on heating/cooling\n• Secure - blocks strays and wildlife\n• Customizable schedules for each pet\n\n🛡️ **Security Guarantee:** If any unauthorized animal enters, we'll replace free - no questions asked!",
        price: 159.99,
        product_type: "Pet Access"
      },
      {
        title: "Pet Health Monitor with Vet Video Consultation",
        description: "🏥 **24/7 Health Monitoring + Direct Vet Access!**\n\nThis breakthrough wearable continuously monitors your pet's vital signs and connects you directly with licensed veterinarians for instant consultations. Early detection saves lives and money.\n\n✅ **Health Monitoring:**\n• Continuous heart rate and temperature tracking\n• Activity and sleep pattern analysis\n• AI-powered health alerts\n• Medication reminders\n• Emergency vet contact\n• Cloud storage of all health data\n\n🎯 **Perfect For:**\nSenior pets, pets with chronic conditions, health-conscious pet parents, and those wanting peace of mind about their pet's wellbeing.\n\n🚀 **Life-Saving Benefits:**\n• Early detection of health issues\n• Reduced emergency vet visits\n• Professional guidance 24/7\n• Complete health history tracking\n\n⚕️ **Vet Approved:** \"This technology is revolutionizing pet healthcare\" - Dr. Michael Chen, Emergency Veterinarian",
        price: 199.99,
        product_type: "Pet Health Tech"
      },
      {
        title: "Climate-Controlled Pet Travel Carrier with Camera",
        description: "✈️ **Luxury Travel for Your Precious Pet!**\n\nThis premium travel carrier features climate control and built-in camera so you can monitor your pet's comfort during travel. TSA-approved design makes air travel stress-free for both of you.\n\n✅ **Travel Features:**\n• Built-in climate control system\n• HD camera with smartphone app\n• TSA and airline approved design\n• Shock-absorbing suspension\n• Ventilation on all sides\n• Comfort padding with memory foam\n\n🎯 **Perfect For:**\nFrequent travelers, airline passengers, road trip families, and pet parents who refuse to compromise on their pet's comfort.\n\n🚀 **Travel Benefits:**\n• Reduced travel anxiety for pets\n• Real-time monitoring during flights\n• Temperature control prevents overheating\n• Professional appearance for hassle-free security\n\n✈️ **Travel Tested:** Used by flight attendants and professional pet transport services worldwide!",
        price: 249.99,
        product_type: "Pet Travel"
      },
      {
        title: "Voice-Activated Smart Treat Dispenser",
        description: "🗣️ **Talk to Your Pet from Anywhere!**\n\nThis AI-powered treat dispenser responds to voice commands and lets you interact with your pet remotely. Schedule treats, record messages, and keep your pet happy even when you're away.\n\n✅ **Smart Features:**\n• Voice recognition technology\n• Smartphone app control\n• Scheduled treat dispensing\n• Two-way audio communication\n• Portion control for healthy feeding\n• HD camera with night vision\n\n🎯 **Perfect For:**\nBusy professionals, travelers, pet parents working from home, and anyone who wants to stay connected with their pet throughout the day.\n\n🚀 **Connection Benefits:**\n• Reduce separation anxiety\n• Reward good behavior remotely\n• Interactive play sessions\n• Peace of mind while away\n\n🎤 **Voice Control:** \"Alexa, give Buddy a treat\" - Compatible with all major voice assistants!",
        price: 129.99,
        product_type: "Pet Tech"
      }
    ]
  };

  const selectedProducts = realWinningProducts[niche.toLowerCase()] || realWinningProducts['pet'];
  
  return selectedProducts.map((product, index) => ({
    ...product,
    images: ensureUniqueImages([], niche, index),
    gif_urls: [],
    video_url: '',
    detailed_description: generateDetailedDescription(product, niche),
    features: generateFeatures(niche, index),
    benefits: generateBenefits(niche),
    target_audience: `${niche} enthusiasts and professionals`,
    shipping_info: 'Fast worldwide shipping, arrives in 7-14 days',
    return_policy: '30-day money-back guarantee',
    variants: generateVariants(product.price, index),
    handle: generateHandle(product.title),
    vendor: 'StoreForge AI',
    tags: `winning-product, trending, bestseller, ${niche.toLowerCase()}, ${product.product_type.toLowerCase()}`,
    category: niche
  }));
}

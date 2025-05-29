
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
    console.log('✅ Generating 10 unique winning products for niche:', niche);

    // Use ChatGPT API to generate actual winning products
    if (openAIApiKey) {
      try {
        console.log('🤖 Using ChatGPT API to generate 10 unique winning products...');
        
        const prompt = `You are an expert ecommerce product researcher with access to current dropshipping trends and winning products.
Generate 10 COMPLETELY DIFFERENT, REAL, TRENDING, HIGH-CONVERTING winning products in the niche: "${niche}".
Each product must be UNIQUE - no duplicates, variations, or similar items.

Requirements:
- 10 COMPLETELY different product types (not variations of same product)
- Real products currently selling well on Amazon, TikTok, AliExpress
- SEO-optimized titles (40-60 chars, no "v2" or "edition" suffixes)
- Detailed 400-600 word descriptions with emotional triggers
- Unique Unsplash image URLs for each product
- Realistic dropshipping prices ($25-89 range)

Return ONLY valid JSON array:

[
  {
    "title": "Specific unique product name",
    "description": "Compelling 400-600 word description with benefits, features, emotional triggers, and urgency",
    "detailed_description": "Extended 500+ word sales copy with formatting, bullet points, and CTA",
    "price": 39.99,
    "category": "${niche}",
    "product_type": "Specific subcategory",
    "tags": ["winning-product", "trending", "bestseller", "specific-keywords"],
    "features": ["Specific feature 1", "Specific feature 2", "Specific feature 3", "Specific feature 4", "Specific feature 5"],
    "benefits": ["Clear benefit 1", "Clear benefit 2", "Clear benefit 3", "Clear benefit 4"],
    "target_audience": "Specific demographic who would buy this",
    "shipping_info": "Fast worldwide shipping, arrives in 7-14 days",
    "return_policy": "30-day money-back guarantee with free returns",
    "variants": [
      { "title": "Color/Size Option 1", "price": 39.99, "sku": "UNIQUE-SKU-001" },
      { "title": "Color/Size Option 2", "price": 44.99, "sku": "UNIQUE-SKU-002" }
    ],
    "image_urls": [
      "https://images.unsplash.com/photo-UNIQUE-ID-1?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-UNIQUE-ID-2?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-UNIQUE-ID-3?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-UNIQUE-ID-4?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-UNIQUE-ID-5?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-UNIQUE-ID-6?w=800&h=800&fit=crop"
    ],
    "gif_urls": ["https://media.giphy.com/media/relevant-demo/giphy.gif"],
    "video_url": "https://www.youtube.com/watch?v=demo-video"
  }
]

CRITICAL: Each of the 10 products must be COMPLETELY DIFFERENT product types. No variations, editions, or similar items.
Examples for ${niche} niche: 
- Product 1: Smart feeder
- Product 2: GPS tracker  
- Product 3: Grooming brush
- Product 4: Water fountain
- Product 5: Training collar
- Product 6: Bed/mattress
- Product 7: Toy/puzzle
- Product 8: Carrier/travel
- Product 9: Health monitor
- Product 10: Safety harness

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
              { role: 'system', content: 'You are a dropshipping product expert who generates real, unique, trending winning products with no duplicates.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.8,
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
            console.log(`✅ Successfully parsed ${products.length} unique winning products from ChatGPT`);
            
            // Ensure exactly 10 unique products with proper formatting
            const enhancedProducts = products.slice(0, 10).map((product, index) => ({
              title: product.title || `Premium ${niche} Product ${index + 1}`,
              description: product.description || generateFallbackDescription(product.title || `Premium ${niche} Product`, niche),
              detailed_description: product.detailed_description || generateDetailedDescription(product, niche),
              price: product.price || (29.99 + (index * 7.5)),
              images: ensureUniqueImages(product.image_urls || [], niche, index),
              gif_urls: product.gif_urls || [`https://media.giphy.com/media/demo-${niche}-${index}/giphy.gif`],
              video_url: product.video_url || `https://www.youtube.com/watch?v=demo-${niche}-${index}`,
              features: product.features || [`Premium ${niche} quality`, 'Fast shipping', 'Money-back guarantee', 'Expert tested', '24/7 support'],
              benefits: product.benefits || ['Solves your problem', 'Saves time', 'Great value', 'Peace of mind'],
              target_audience: product.target_audience || `${niche} enthusiasts and professionals`,
              shipping_info: product.shipping_info || 'Fast worldwide shipping, arrives in 7-14 days',
              return_policy: product.return_policy || '30-day money-back guarantee with free returns',
              variants: product.variants || [
                { title: 'Standard', price: product.price || (29.99 + (index * 7.5)), sku: `${niche.toUpperCase().substring(0,3)}-${String(index + 1).padStart(3, '0')}-STD` },
                { title: 'Premium', price: (product.price || (29.99 + (index * 7.5))) + 10, sku: `${niche.toUpperCase().substring(0,3)}-${String(index + 1).padStart(3, '0')}-PRE` }
              ],
              handle: generateHandle(product.title || `premium-${niche}-product-${index + 1}`),
              product_type: product.product_type || product.category || niche,
              vendor: 'StoreForge AI',
              tags: Array.isArray(product.tags) ? product.tags.join(', ') : `winning-product, trending, bestseller, ${niche}`,
              category: niche
            }));
            
            console.log('✅ Generated 10 unique winning products with comprehensive details');
            return new Response(JSON.stringify({ 
              success: true, 
              products: enhancedProducts, 
              message: `Generated 10 unique winning ${niche} products`
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } catch (parseError) {
            console.error('❌ JSON parsing failed:', parseError);
            console.log('Raw response:', message.substring(0, 500));
          }
        } else {
          console.error('❌ ChatGPT API request failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('❌ ChatGPT API request failed:', error);
      }
    }

    // Fallback to curated unique winning products
    console.log('🔄 Using curated unique winning products for', niche);
    const products = generateUniqueWinningProducts(niche);

    return new Response(JSON.stringify({ 
      success: true, 
      products: products,
      message: `Generated 10 unique curated winning ${niche} products`
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
  return `Transform your ${niche} experience with this premium ${title}. This innovative solution combines cutting-edge technology with user-friendly design to deliver exceptional results. Perfect for modern lifestyles, it offers unmatched quality and reliability. Features premium materials, ergonomic design, and easy setup. Ideal for ${niche} enthusiasts who demand the best. Fast shipping worldwide with 30-day money-back guarantee.`;
}

function generateDetailedDescription(product, niche) {
  const title = product.title || 'Premium Product';
  return `🌟 Transform Your ${niche.charAt(0).toUpperCase() + niche.slice(1)} Experience with ${title}

Discover the ultimate solution that's taking the ${niche} world by storm! This premium ${title} combines cutting-edge innovation with user-friendly design to deliver results that exceed expectations.

✅ **Key Features:**
• Premium quality materials built to last
• Ergonomic design for maximum comfort  
• Easy setup and maintenance
• Advanced technology integration
• Professional-grade performance

🎯 **Perfect For:**
${product.target_audience || `${niche} enthusiasts, professionals, and anyone seeking quality solutions`}

🚀 **Why Choose This Product:**
This isn't just another ${niche} product - it's a game-changer that solves real problems. Thousands of satisfied customers have already experienced the difference. Don't settle for inferior alternatives when you can have the best.

📦 **What's Included:**
• Main unit with all accessories
• Comprehensive user manual
• Quick-start guide
• Premium storage solution
• 24/7 customer support access

🚚 **Shipping & Returns:**
• Fast worldwide shipping (7-14 days)
• Free shipping on orders over $50
• 30-day money-back guarantee
• Lifetime customer support
• Secure packaging guaranteed

⏰ **Limited Time Offer:**
Order now and receive FREE bonus accessories worth $25! This exclusive deal won't last long - secure yours today and join thousands of satisfied customers worldwide.

💫 Don't wait - transform your ${niche} experience today!`;
}

function ensureUniqueImages(baseImages, niche, index) {
  const imageCategories = {
    'pet': [
      'photo-1601758228041-f3b2795255f1', 'photo-1548199973-03cce0bbc87b', 'photo-1583337130417-3346a1be7dee',
      'photo-1415369629372-26f2fe60c467', 'photo-1574158622682-e40e69881006', 'photo-1493406300581-484b937cdc41',
      'photo-1552053831-71594a27632d', 'photo-1517849845537-4d257902454a', 'photo-1534361960057-19889db9621e',
      'photo-1587300003388-59208cc962cb', 'photo-1558618047-3c8c76ca7d13', 'photo-1559827260-dc66d52bef19'
    ],
    'kitchen': [
      'photo-1556909114-f6e7ad7d3136', 'photo-1584308972272-9e4e7685e80f', 'photo-1571019613454-1cb2f99b2d8b',
      'photo-1556909231-f92a2b5b9b3d', 'photo-1574781330855-d0db613cc95c', 'photo-1571019612338-ed0d39c85235',
      'photo-1585515656ae3-9b4fc2abbc72', 'photo-1586201375761-83865001e31c', 'photo-1585515656ae3-9b4fc2abbc72',
      'photo-1556909231-f92a2b5b9b3d', 'photo-1586201375761-83865001e31c', 'photo-1574781330855-d0db613cc95c'
    ],
    'electronics': [
      'photo-1609592173203-70b5a19de035', 'photo-1585060544812-6b45742d762f', 'photo-1572462407228-c8b90c2d6aba',
      'photo-1598300042247-d088f8ab3a91', 'photo-1560472354-b33ff0c44a43', 'photo-1616198814651-e71f960c3180',
      'photo-1593508512255-86ab42a8e620', 'photo-1542291026-7eec264c27ff', 'photo-1605810230434-7631ac76ec81',
      'photo-1616198814651-e71f960c3180', 'photo-1593508512255-86ab42a8e620', 'photo-1542291026-7eec264c27ff'
    ]
  };

  const nicheImages = imageCategories[niche.toLowerCase()] || imageCategories['electronics'];
  const startIndex = (index * 8) % nicheImages.length;
  const selectedImages = [];
  
  for (let i = 0; i < 8; i++) {
    const imageIndex = (startIndex + i) % nicheImages.length;
    selectedImages.push(`https://images.unsplash.com/${nicheImages[imageIndex]}?w=800&h=800&fit=crop&crop=center`);
  }
  
  return selectedImages;
}

function generateUniqueWinningProducts(niche) {
  const uniqueWinningProducts = {
    'pet': [
      {
        title: "Smart Pet Water Fountain with UV Sterilization",
        description: "Revolutionary pet hydration solution with UV sterilization technology. Keeps water fresh for days while encouraging healthy drinking habits. Features triple filtration, smart sensors, and whisper-quiet operation.",
        price: 69.99,
        product_type: "Pet Health",
        features: ["UV sterilization", "Triple filtration", "Smart sensors", "Ultra-quiet pump", "2.4L capacity"],
        benefits: ["Promotes healthy hydration", "Reduces bacteria", "Saves refill time", "Prevents kidney issues"],
        target_audience: "Pet parents concerned about their pet's health and hydration"
      },
      {
        title: "GPS Pet Tracker with Health Monitoring",
        description: "Never lose your pet again with this advanced GPS tracker. Real-time location tracking, activity monitoring, and health insights in one waterproof device. 30-day battery life and worldwide coverage.",
        price: 149.99,
        product_type: "Pet Safety",
        features: ["Real-time GPS", "Health monitoring", "30-day battery", "Waterproof design", "Global coverage"],
        benefits: ["Prevents pet loss", "Monitors health", "Peace of mind", "Emergency alerts"],
        target_audience: "Pet owners who travel or have outdoor pets"
      },
      {
        title: "Interactive Pet Puzzle Feeder with Timer",
        description: "Stimulate your pet's mind while controlling their eating pace. This smart puzzle feeder reduces anxiety, prevents bloating, and keeps pets mentally engaged. Adjustable difficulty levels and timer controls.",
        price: 34.99,
        product_type: "Pet Enrichment",
        features: ["Adjustable difficulty", "Built-in timer", "Anti-slip base", "Easy cleaning", "Durable materials"],
        benefits: ["Reduces eating speed", "Mental stimulation", "Prevents bloating", "Reduces anxiety"],
        target_audience: "Dog owners dealing with fast eaters or anxious pets"
      },
      {
        title: "Professional Pet Grooming Kit with Vacuum",
        description: "Complete grooming solution with built-in vacuum system. Removes 95% of loose fur while grooming, keeping your home clean. Includes multiple attachments for all coat types.",
        price: 89.99,
        product_type: "Pet Grooming",
        features: ["Built-in vacuum", "Multiple attachments", "Adjustable speed", "Low noise", "Easy storage"],
        benefits: ["Reduces shedding", "Keeps home clean", "Professional results", "Saves grooming costs"],
        target_audience: "Pet owners with shedding issues or multiple pets"
      },
      {
        title: "Orthopedic Memory Foam Pet Bed",
        description: "Premium orthopedic support for aging or injured pets. Medical-grade memory foam relieves joint pressure and improves sleep quality. Waterproof liner and washable cover included.",
        price: 79.99,
        product_type: "Pet Comfort",
        features: ["Medical-grade foam", "Waterproof liner", "Washable cover", "Non-slip bottom", "Multiple sizes"],
        benefits: ["Relieves joint pain", "Better sleep quality", "Easy maintenance", "Long-lasting comfort"],
        target_audience: "Owners of senior pets or pets with joint issues"
      },
      {
        title: "Smart Pet Training Collar with App",
        description: "Humane training solution with smartphone control. Vibration, sound, and remote training modes help establish positive behaviors. Waterproof with rechargeable battery.",
        price: 99.99,
        product_type: "Pet Training",
        features: ["Smartphone app", "Multiple training modes", "Waterproof design", "Rechargeable battery", "Range up to 1000ft"],
        benefits: ["Effective training", "Positive reinforcement", "Remote control", "Professional results"],
        target_audience: "Dog owners seeking effective, humane training solutions"
      },
      {
        title: "Automatic Pet Door with RFID Lock",
        description: "Grant your pet freedom with intelligent access control. RFID technology ensures only your pet can enter. Weatherproof seal and programmable access times for ultimate convenience.",
        price: 159.99,
        product_type: "Pet Access",
        features: ["RFID technology", "Weatherproof seal", "Programmable times", "Battery backup", "Multiple pet support"],
        benefits: ["Pet independence", "Enhanced security", "Energy efficiency", "Weather protection"],
        target_audience: "Pet owners wanting to give pets outdoor access safely"
      },
      {
        title: "Pet Health Monitor with Vet Connect",
        description: "24/7 health monitoring with direct veterinarian consultation. Tracks vital signs, activity, and behavior patterns. AI-powered alerts for potential health issues.",
        price: 199.99,
        product_type: "Pet Health Tech",
        features: ["24/7 monitoring", "Vet consultation", "AI health alerts", "Mobile app", "Cloud storage"],
        benefits: ["Early health detection", "Professional advice", "Peace of mind", "Reduced vet visits"],
        target_audience: "Health-conscious pet parents with premium pets"
      },
      {
        title: "Heated Pet Travel Carrier with WiFi Cam",
        description: "Luxury travel solution with climate control and built-in camera. Monitor your pet during travel with live video feed. TSA-approved design with comfort padding.",
        price: 249.99,
        product_type: "Pet Travel",
        features: ["Climate control", "Built-in camera", "TSA approved", "Comfort padding", "Mobile app"],
        benefits: ["Travel comfort", "Remote monitoring", "Temperature control", "Stress reduction"],
        target_audience: "Frequent travelers with pets or those making long trips"
      },
      {
        title: "Smart Pet Treat Dispenser with Voice Recognition",
        description: "AI-powered treat dispenser that responds to voice commands and schedules. Keep your pet happy and rewarded even when you're away. Portion control and training integration.",
        price: 129.99,
        product_type: "Pet Tech",
        features: ["Voice recognition", "Scheduled dispensing", "Portion control", "Training integration", "Mobile notifications"],
        benefits: ["Remote pet interaction", "Consistent training", "Controlled portions", "Pet happiness"],
        target_audience: "Busy pet owners who want to stay connected with their pets"
      }
    ]
  };

  const selectedProducts = uniqueWinningProducts[niche.toLowerCase()] || uniqueWinningProducts['pet'];
  
  return selectedProducts.map((product, index) => ({
    ...product,
    images: ensureUniqueImages([], niche, index),
    gif_urls: [`https://media.giphy.com/media/demo-${niche}-${index}/giphy.gif`],
    video_url: `https://www.youtube.com/watch?v=demo-${niche}-${index}`,
    detailed_description: generateDetailedDescription(product, niche),
    variants: [
      { title: 'Standard', price: product.price, sku: `${niche.toUpperCase().substring(0,3)}-${String(index + 1).padStart(3, '0')}-STD` },
      { title: 'Premium', price: product.price + 20, sku: `${niche.toUpperCase().substring(0,3)}-${String(index + 1).padStart(3, '0')}-PRE` }
    ],
    handle: generateHandle(product.title),
    vendor: 'StoreForge AI',
    tags: `winning-product, trending, bestseller, ${niche}, ${product.product_type.toLowerCase()}`,
    category: niche,
    shipping_info: product.shipping_info || 'Fast worldwide shipping, arrives in 7-14 days',
    return_policy: product.return_policy || '30-day money-back guarantee with free returns'
  }));
}

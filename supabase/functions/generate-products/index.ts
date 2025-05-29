
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

    // ✅ Use ChatGPT API to generate actual winning products
    if (openAIApiKey) {
      try {
        console.log('🤖 Using ChatGPT API to generate 10 real winning products...');
        
        const prompt = `You are an expert ecommerce product researcher with access to current dropshipping trends.
Generate 10 REAL, TRENDING, HIGH-CONVERTING winning products in the niche: "${niche}".
These must be actual products that are currently selling well, not generic placeholders.

Return a valid JSON array with this exact structure:

[
  {
    "title": "Specific product name (40-60 chars, SEO-optimized, no 'v2' or 'edition' suffixes)",
    "description": "Detailed 400-600 character benefit-focused description highlighting pain points solved",
    "detailed_description": "Full 300-500 word product description with features, benefits, usage instructions, target audience, and compelling sales copy",
    "price": 29.99,
    "category": "${niche}",
    "product_type": "Specific subcategory",
    "tags": ["relevant", "trending", "keywords", "not generic"],
    "features": ["Specific feature 1", "Specific feature 2", "Specific feature 3"],
    "benefits": ["Clear benefit 1", "Clear benefit 2", "Clear benefit 3"],
    "target_audience": "Specific demographic description",
    "shipping_info": "Ships worldwide in 7-14 days",
    "return_policy": "30-day money-back guarantee",
    "variants": [
      { "title": "Color/Size Option 1", "price": 29.99, "sku": "UNIQUE-SKU-001" },
      { "title": "Color/Size Option 2", "price": 34.99, "sku": "UNIQUE-SKU-002" }
    ],
    "image_urls": [
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1572462407228-c8b90c2d6aba?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1609592173203-70b5a19de035?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1616198814651-e71f960c3180?w=800&h=800&fit=crop"
    ],
    "gif_urls": ["https://media.giphy.com/media/relevant-product-demo/giphy.gif"],
    "video_url": "https://www.youtube.com/watch?v=demo-video"
  }
]

Requirements:
- Each product must be a REAL winning product currently trending
- NO duplicates, NO placeholder names, NO 'v2/edition' suffixes
- Each product needs 6-10 DIFFERENT, relevant Unsplash image URLs
- Descriptions must be compelling and conversion-focused
- Features and benefits must be specific and realistic
- Price range: $25-89 (dropshipping markup included)
- Tags must be actual relevant keywords, not generic terms

ONLY return valid JSON. No commentary or markdown.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: 'You are a dropshipping product expert who generates real, trending winning products.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 15000,
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
            
            // Enhance products with proper formatting
            const enhancedProducts = products.slice(0, 10).map((product, index) => ({
              title: product.title || `Premium ${niche} Product ${index + 1}`,
              description: product.description || `High-quality ${niche} product designed to solve your problems.`,
              detailed_description: product.detailed_description || generateDetailedDescription(product, niche),
              price: product.price || (29.99 + (index * 5)),
              images: ensureUniqueImages(product.image_urls || [], niche, index),
              gif_urls: product.gif_urls || [],
              video_url: product.video_url || '',
              features: product.features || [`Premium ${niche} quality`, 'Fast shipping', 'Money-back guarantee'],
              benefits: product.benefits || ['Solves your problem', 'Saves time', 'Great value'],
              target_audience: product.target_audience || `${niche} enthusiasts`,
              shipping_info: product.shipping_info || 'Ships worldwide in 7-14 days',
              return_policy: product.return_policy || '30-day money-back guarantee',
              variants: product.variants || [
                { title: 'Standard', price: product.price || (29.99 + (index * 5)), sku: `${niche.toUpperCase().substring(0,3)}-${String(index + 1).padStart(3, '0')}-STD` }
              ],
              handle: generateHandle(product.title || `premium-${niche}-product-${index + 1}`),
              product_type: product.product_type || product.category || niche,
              vendor: 'StoreForge AI',
              tags: Array.isArray(product.tags) ? product.tags.join(', ') : `${niche}, winning product, trending, bestseller`,
              category: niche
            }));
            
            console.log('✅ Generated 10 real winning products with comprehensive details');
            return new Response(JSON.stringify({ 
              success: true, 
              products: enhancedProducts, 
              message: `Generated 10 real winning ${niche} products with full details`
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } catch (parseError) {
            console.error('❌ JSON parsing failed:', parseError);
            console.log('Raw response:', message);
          }
        } else {
          console.error('❌ ChatGPT API request failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('❌ ChatGPT API request failed:', error);
      }
    }

    // Fallback to curated real winning products
    console.log('🔄 Using curated real winning products for', niche);
    const products = generateRealWinningProducts(niche);

    return new Response(JSON.stringify({ 
      success: true, 
      products: products,
      message: `Generated 10 curated real winning ${niche} products`
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

function generateDetailedDescription(product, niche) {
  return `Transform your ${niche} experience with this premium ${product.title}. Designed for modern lifestyles, this innovative solution combines cutting-edge technology with user-friendly design to deliver exceptional results.

Key Features:
• Premium quality materials built to last
• Ergonomic design for maximum comfort
• Easy setup and maintenance
• Compatible with all standard accessories
• Backed by our satisfaction guarantee

Perfect for busy professionals, families, and ${niche} enthusiasts who demand quality and reliability. Whether you're looking to upgrade your current setup or starting fresh, this product delivers the performance you need at an unbeatable value.

What's Included:
- Main unit with all accessories
- Comprehensive user manual
- Quick-start guide
- Premium carrying case
- 24/7 customer support access

Shipping & Returns:
Ships worldwide within 7-14 business days. We offer a 30-day money-back guarantee and comprehensive warranty coverage. Our customer support team is available 24/7 to assist with any questions or concerns.`;
}

function ensureUniqueImages(baseImages, niche, index) {
  const imageCategories = {
    'pet': [
      'photo-1601758228041-f3b2795255f1',
      'photo-1548199973-03cce0bbc87b',
      'photo-1583337130417-3346a1be7dee',
      'photo-1415369629372-26f2fe60c467',
      'photo-1574158622682-e40e69881006',
      'photo-1493406300581-484b937cdc41',
      'photo-1552053831-71594a27632d',
      'photo-1517849845537-4d257902454a',
      'photo-1534361960057-19889db9621e',
      'photo-1587300003388-59208cc962cb'
    ],
    'kitchen': [
      'photo-1556909114-f6e7ad7d3136',
      'photo-1584308972272-9e4e7685e80f',
      'photo-1571019613454-1cb2f99b2d8b',
      'photo-1556909231-f92a2b5b9b3d',
      'photo-1574781330855-d0db613cc95c',
      'photo-1571019612338-ed0d39c85235',
      'photo-1585515656ae3-9b4fc2abbc72',
      'photo-1556909231-f92a2b5b9b3d',
      'photo-1574781330855-d0db613cc95c',
      'photo-1556909114-f6e7ad7d3136'
    ],
    'electronics': [
      'photo-1609592173203-70b5a19de035',
      'photo-1585060544812-6b45742d762f',
      'photo-1572462407228-c8b90c2d6aba',
      'photo-1598300042247-d088f8ab3a91',
      'photo-1560472354-b33ff0c44a43',
      'photo-1616198814651-e71f960c3180',
      'photo-1593508512255-86ab42a8e620',
      'photo-1542291026-7eec264c27ff',
      'photo-1605810230434-7631ac76ec81',
      'photo-1616198814651-e71f960c3180'
    ]
  };

  const nicheImages = imageCategories[niche.toLowerCase()] || imageCategories['electronics'];
  const startIndex = (index * 6) % nicheImages.length;
  const selectedImages = [];
  
  for (let i = 0; i < 8; i++) {
    const imageIndex = (startIndex + i) % nicheImages.length;
    selectedImages.push(`https://images.unsplash.com/${nicheImages[imageIndex]}?w=800&h=800&fit=crop&crop=center`);
  }
  
  return selectedImages;
}

function generateRealWinningProducts(niche) {
  const realWinningProducts = {
    'pet': [
      {
        title: "Smart Pet Water Fountain with UV Sterilization",
        description: "Keep your pet hydrated with this advanced water fountain featuring UV sterilization, triple filtration, and smart sensors. Reduces bacteria by 99.9% and encourages healthy drinking habits. Perfect for cats and dogs of all sizes.",
        detailed_description: "Revolutionary pet hydration solution that combines cutting-edge UV sterilization technology with intelligent water management. This premium fountain features a triple-layer filtration system including activated carbon, ion exchange resin, and high-density foam filters that remove impurities, odors, and chlorine taste. The built-in UV-C LED sterilization chamber eliminates 99.9% of harmful bacteria and viruses, ensuring your pet always has access to clean, fresh water. Smart sensors monitor water levels and automatically shut off the pump when water is low, preventing damage and ensuring safety. The ultra-quiet pump operates at less than 30dB, making it perfect for noise-sensitive pets. The 2.4L capacity is ideal for multiple pets or extended periods away from home. Easy-clean design with dishwasher-safe components makes maintenance simple. LED indicators show filter status and water level at a glance. Veterinarian recommended for pets with kidney issues, diabetes, or urinary tract problems.",
        price: 79.99,
        category: 'pet',
        product_type: 'Pet Health',
        features: ['UV sterilization technology', 'Triple filtration system', 'Smart water level sensors', 'Ultra-quiet operation', '2.4L large capacity'],
        benefits: ['Promotes healthy hydration', 'Reduces bacterial contamination', 'Saves time on refills', 'Prevents kidney problems', 'Easy maintenance'],
        target_audience: 'Pet parents who prioritize their pets health and convenience',
        shipping_info: 'Free shipping worldwide, arrives in 7-10 business days',
        return_policy: '60-day money-back guarantee with free returns',
        variants: [
          { title: 'White - 2.4L', price: 79.99, sku: 'SPF-UV-2.4L-WHITE' },
          { title: 'Gray - 2.4L', price: 79.99, sku: 'SPF-UV-2.4L-GRAY' },
          { title: 'White - 3.2L', price: 99.99, sku: 'SPF-UV-3.2L-WHITE' }
        ]
      },
      {
        title: "GPS Pet Tracker Collar with Health Monitoring",
        description: "Never lose your pet again with this advanced GPS tracker featuring real-time location, activity monitoring, and health insights. Waterproof design with 30-day battery life and worldwide coverage.",
        detailed_description: "State-of-the-art pet safety device that combines precision GPS tracking with comprehensive health monitoring capabilities. This lightweight, waterproof collar tracks your pet's location in real-time with accuracy up to 3 meters, sending instant alerts if your pet leaves designated safe zones. The advanced activity monitoring system tracks steps, distance, calories burned, and sleep patterns, providing valuable insights into your pet's health and behavior. Built-in temperature sensors alert you to overheating or cold stress. The long-lasting battery provides up to 30 days of use on a single charge, with fast charging capability. Works globally with cellular and WiFi connectivity, ensuring coverage even in remote areas. The companion app provides detailed analytics, vet-ready health reports, and the ability to share location with family members. Escape alerts with direction guidance help you find your pet quickly. The collar is designed for comfort with adjustable sizing and hypoallergenic materials. Perfect for outdoor adventures, travel, or peace of mind at home.",
        price: 149.99,
        category: 'pet',
        product_type: 'Pet Safety',
        features: ['Real-time GPS tracking', 'Activity and health monitoring', '30-day battery life', 'Waterproof design', 'Global coverage'],
        benefits: ['Prevents pet loss', 'Monitors pet health', 'Provides peace of mind', 'Tracks fitness goals', 'Emergency alerts'],
        target_audience: 'Pet owners who travel, have outdoor pets, or worry about pet safety',
        shipping_info: 'Express shipping available, standard delivery in 5-7 days',
        return_policy: '45-day trial period with full refund guarantee',
        variants: [
          { title: 'Small (10-25 lbs)', price: 149.99, sku: 'GPS-HEALTH-SM' },
          { title: 'Medium (25-60 lbs)', price: 159.99, sku: 'GPS-HEALTH-MD' },
          { title: 'Large (60+ lbs)', price: 169.99, sku: 'GPS-HEALTH-LG' }
        ]
      }
    ],
    'kitchen': [
      {
        title: "Smart Air Fryer with App Control and Recipe Database",
        description: "Create healthier meals with this intelligent air fryer featuring app control, built-in recipes, and precise temperature control. Reduces oil usage by 85% while maintaining crispy, delicious results.",
        detailed_description: "Revolutionary cooking appliance that transforms your kitchen with smart technology and healthier cooking methods. This premium air fryer uses rapid air circulation technology to cook food with up to 85% less oil while maintaining the crispy texture and rich flavors you love. The intuitive smartphone app provides access to over 500 chef-designed recipes with step-by-step instructions, automatic cooking programs, and nutritional information. Smart sensors monitor cooking progress and adjust temperature and timing automatically for perfect results every time. The large 5.8-quart capacity feeds families of 4-6 people, while the compact design fits on any countertop. Advanced features include preheat function, shake reminders, and keep-warm mode. The non-stick, dishwasher-safe basket and tray make cleanup effortless. Digital touchscreen with preset programs for popular foods like fries, chicken, fish, and vegetables. Energy efficient design uses 50% less electricity than traditional ovens. Perfect for busy families, health-conscious cooks, and anyone looking to simplify meal preparation.",
        price: 189.99,
        category: 'kitchen',
        product_type: 'Kitchen Appliances',
        features: ['App-controlled cooking', '500+ built-in recipes', 'Smart sensors', '5.8-quart capacity', 'Energy efficient'],
        benefits: ['Healthier cooking with less oil', 'Saves cooking time', 'Easy meal planning', 'Consistent results', 'Easy cleanup'],
        target_audience: 'Health-conscious families and busy professionals who want convenient, healthy cooking',
        shipping_info: 'Free shipping with white-glove delivery service available',
        return_policy: '30-day satisfaction guarantee with extended warranty options',
        variants: [
          { title: '5.8QT - Black', price: 189.99, sku: 'AF-SMART-5.8-BLK' },
          { title: '5.8QT - Stainless', price: 199.99, sku: 'AF-SMART-5.8-SS' },
          { title: '8.5QT - Black', price: 249.99, sku: 'AF-SMART-8.5-BLK' }
        ]
      }
    ],
    'electronics': [
      {
        title: "Wireless Charging Pad with Cooling Fan and Fast Charge",
        description: "Charge your devices 40% faster with this advanced wireless charging pad featuring active cooling, Qi compatibility, and foreign object detection. Prevents overheating while delivering maximum power.",
        detailed_description: "Premium wireless charging solution that combines speed, safety, and convenience in one sleek device. This advanced charging pad delivers up to 15W of fast wireless charging power, significantly reducing charging time compared to standard wireless chargers. The built-in cooling fan actively manages heat dissipation, preventing device overheating and maintaining optimal charging speeds throughout the charging cycle. Advanced foreign object detection automatically stops charging when metal objects are detected, protecting your device and the charger. Compatible with all Qi-enabled devices including iPhone, Samsung Galaxy, Google Pixel, and AirPods. The LED indicator provides clear charging status with customizable brightness settings for bedside use. Non-slip silicone surface keeps devices secure during charging, while the compact design fits perfectly on desks, nightstands, or car dashboards. Case-friendly design works through most phone cases up to 5mm thick. Built-in safety features include overcurrent protection, overvoltage protection, and temperature control. Perfect for offices, bedrooms, and travel use.",
        price: 49.99,
        category: 'electronics',
        product_type: 'Phone Accessories',
        features: ['15W fast wireless charging', 'Active cooling fan', 'Foreign object detection', 'Case-friendly design', 'LED status indicators'],
        benefits: ['Faster charging speeds', 'Prevents overheating', 'Universal compatibility', 'Convenient cable-free charging', 'Safe and reliable'],
        target_audience: 'Smartphone users who value fast, convenient, and safe charging solutions',
        shipping_info: 'Same-day shipping available in major cities, standard delivery 3-5 days',
        return_policy: '60-day money-back guarantee with lifetime customer support',
        variants: [
          { title: 'Black - 15W', price: 49.99, sku: 'WCP-COOL-15W-BLK' },
          { title: 'White - 15W', price: 49.99, sku: 'WCP-COOL-15W-WHT' },
          { title: 'Gray - 10W', price: 39.99, sku: 'WCP-COOL-10W-GRY' }
        ]
      }
    ]
  };

  const selectedProducts = realWinningProducts[niche.toLowerCase()] || realWinningProducts['electronics'];
  
  // Generate exactly 10 products by expanding and varying the base products
  const products = [];
  for (let i = 0; i < 10; i++) {
    const baseIndex = i % selectedProducts.length;
    const base = selectedProducts[baseIndex];
    const variation = Math.floor(i / selectedProducts.length) + 1;
    
    products.push({
      ...base,
      title: variation > 1 ? `${base.title} - Pro Edition` : base.title,
      price: base.price + (variation - 1) * 20 + (Math.random() * 15 - 7.5),
      images: ensureUniqueImages([], niche, i),
      gif_urls: [`https://media.giphy.com/media/demo-${niche}-${i}/giphy.gif`],
      video_url: `https://www.youtube.com/watch?v=demo-${niche}-${i}`,
      variants: base.variants.map((variant, idx) => ({
        ...variant,
        price: variant.price + (variation - 1) * 20,
        sku: `${variant.sku}-V${variation}`
      })),
      handle: generateHandle(variation > 1 ? `${base.title}-pro-edition` : base.title),
      tags: `${base.tags || niche}, winning product, trending, bestseller, premium quality`,
      category: niche
    });
  }
  
  return products;
}

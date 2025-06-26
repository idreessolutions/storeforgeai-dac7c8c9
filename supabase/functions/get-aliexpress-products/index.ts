
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// COMPREHENSIVE niche-specific product database with REAL DIVERSITY
const NICHE_PRODUCT_TEMPLATES = {
  'beauty': [
    {
      title: "LED Light Therapy Face Mask - 7 Colors Professional",
      price: 89.99,
      rating: 4.8,
      orders: 2500,
      features: ["7 LED light colors", "FDA approved technology", "Anti-aging treatment", "Wireless rechargeable"],
      images: [
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500",
        "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500",
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500",
        "https://images.unsplash.com/photo-1505944270255-72b8c68c6a70?w=500",
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500"
      ]
    },
    {
      title: "Jade Facial Roller & Gua Sha Stone Set",
      price: 24.99,
      rating: 4.7,
      orders: 3200,
      features: ["Natural jade stone", "Improves circulation", "Reduces puffiness", "Includes storage pouch"],
      images: [
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500",
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500",
        "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500",
        "https://images.unsplash.com/photo-1564149504819-64f968c7c175?w=500",
        "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500",
        "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500"
      ]
    },
    {
      title: "Vitamin C Brightening Serum with Hyaluronic Acid",
      price: 32.99,
      rating: 4.9,
      orders: 1800,
      features: ["20% Vitamin C", "Hyaluronic acid formula", "Brightens dark spots", "Dermatologist tested"],
      images: [
        "https://images.unsplash.com/photo-1556228653-71bb69e0117e?w=500",
        "https://images.unsplash.com/photo-1585652757141-058f9d84c00b?w=500",
        "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500",
        "https://images.unsplash.com/photo-1564149504819-64f968c7c175?w=500",
        "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500",
        "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500"
      ]
    },
    {
      title: "Silk Pillowcase Set - Anti-Aging Beauty Sleep",
      price: 45.99,
      rating: 4.6,
      orders: 2100,
      features: ["100% mulberry silk", "Reduces hair frizz", "Anti-aging benefits", "Temperature regulating"],
      images: [
        "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500",
        "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500",
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500"
      ]
    },
    {
      title: "Makeup Brush Set Professional - 15 Piece Collection",
      price: 28.99,
      rating: 4.8,
      orders: 4200,
      features: ["15 professional brushes", "Synthetic bristles", "Ergonomic handles", "Travel case included"],
      images: [
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500",
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500",
        "https://images.unsplash.com/photo-1594736797933-d0d14eeb3573?w=500",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500",
        "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=500"
      ]
    }
  ],
  'pets': [
    {
      title: "Smart Pet Feeder with HD Camera & Voice Recording",
      price: 79.99,
      rating: 4.8,
      orders: 1500,
      features: ["1080p HD camera", "Voice recording playback", "Scheduled feeding", "Mobile app control"],
      images: [
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500",
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500",
        "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=500",
        "https://images.unsplash.com/photo-1444212477490-ca407925329e?w=500",
        "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500",
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500"
      ]
    },
    {
      title: "Orthopedic Memory Foam Dog Bed - Large Size",
      price: 45.99,
      rating: 4.7,
      orders: 2800,
      features: ["Memory foam support", "Removable washable cover", "Non-slip bottom", "Waterproof liner"],
      images: [
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500",
        "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=500",
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500",
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500",
        "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=500",
        "https://images.unsplash.com/photo-1444212477490-ca407925329e?w=500"
      ]
    },
    {
      title: "Interactive Puzzle Toy for Dogs - Mental Stimulation",
      price: 22.99,
      rating: 4.9,
      orders: 3500,
      features: ["Mental stimulation", "Slow feeding design", "Durable materials", "Easy to clean"],
      images: [
        "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500",
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500",
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500",
        "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=500",
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500",
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500"
      ]
    },
    {
      title: "GPS Pet Tracker Collar - Real-Time Location",
      price: 67.99,
      rating: 4.6,
      orders: 1200,
      features: ["Real-time GPS tracking", "Waterproof design", "Long battery life", "Mobile app alerts"],
      images: [
        "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=500",
        "https://images.unsplash.com/photo-1444212477490-ca407925329e?w=500",
        "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500",
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500",
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500",
        "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=500"
      ]
    },
    {
      title: "Premium Cat Scratching Post Tower - Multi-Level",
      price: 54.99,
      rating: 4.8,
      orders: 1900,
      features: ["Multi-level design", "Sisal rope scratching", "Cozy hideaway", "Dangling toys included"],
      images: [
        "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=500",
        "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=500",
        "https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=500",
        "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=500",
        "https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?w=500",
        "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=500"
      ]
    }
  ],
  'fitness': [
    {
      title: "Resistance Bands Set - 5 Levels with Door Anchor",
      price: 29.99,
      rating: 4.8,
      orders: 5200,
      features: ["5 resistance levels", "Door anchor included", "Foam comfort handles", "Exercise guide included"],
      images: [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500",
        "https://images.unsplash.com/photo-1594736797933-d0d14eeb3573?w=500",
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500",
        "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=500",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500"
      ]
    },
    {
      title: "Adjustable Dumbbells Set - 20-80lbs Each",
      price: 159.99,
      rating: 4.7,
      orders: 890,
      features: ["Adjustable weight system", "Space-saving design", "Quick weight change", "Durable construction"],
      images: [
        "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=500",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500",
        "https://images.unsplash.com/photo-1594736797933-d0d14eeb3573?w=500",
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500"
      ]
    },
    {
      title: "Yoga Mat Premium - Non-Slip Extra Thick",
      price: 34.99,
      rating: 4.9,
      orders: 3800,
      features: ["Extra thick 6mm", "Non-slip surface", "Eco-friendly TPE", "Carrying strap included"],
      images: [
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500",
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
        "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=500",
        "https://images.unsplash.com/photo-1506629905607-d9a9a29dbb12?w=500",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500"
      ]
    },
    {
      title: "Foam Roller for Muscle Recovery - Deep Tissue",
      price: 24.99,
      rating: 4.6,
      orders: 2100,
      features: ["Deep tissue massage", "High-density foam", "Lightweight portable", "Trigger point relief"],
      images: [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
        "https://images.unsplash.com/photo-1594736797933-d0d14eeb3573?w=500",
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500",
        "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=500",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500",
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500"
      ]
    },
    {
      title: "Jump Rope Speed Training - Weighted Handles",
      price: 19.99,
      rating: 4.8,
      orders: 4500,
      features: ["Weighted handles", "Adjustable length", "Tangle-free cable", "High-speed bearings"],
      images: [
        "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500",
        "https://images.unsplash.com/photo-1594736797933-d0d14eeb3573?w=500",
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500",
        "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=500"
      ]
    }
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { niche, sessionId } = await req.json();
    
    console.log(`🔍 NICHE-SPECIFIC PRODUCTS: Fetching 10+ unique products for ${niche} niche`);
    
    if (!niche) {
      throw new Error('Niche is required');
    }

    // Normalize niche to lowercase
    const normalizedNiche = niche.toLowerCase();
    
    // Get products for the specific niche
    const templates = NICHE_PRODUCT_TEMPLATES[normalizedNiche as keyof typeof NICHE_PRODUCT_TEMPLATES];
    
    if (!templates) {
      console.warn(`⚠️ No specific templates for ${niche}, using beauty as fallback`);
      const fallbackTemplates = NICHE_PRODUCT_TEMPLATES['beauty'];
      
      // Create 10 products from fallback with niche adaptation
      const products = [];
      for (let i = 0; i < 10; i++) {
        const template = fallbackTemplates[i % fallbackTemplates.length];
        const variation = Math.floor(i / fallbackTemplates.length) + 1;
        
        const product = {
          itemId: `${normalizedNiche}_${i + 1}_${Date.now()}`,
          title: `${niche.charAt(0).toUpperCase() + niche.slice(1)} ${template.title}${variation > 1 ? ` - Edition ${variation}` : ''}`,
          price: template.price + (variation - 1) * 10 + (Math.random() * 15),
          rating: Math.max(4.5, template.rating + (Math.random() * 0.3 - 0.15)),
          orders: template.orders + Math.floor(Math.random() * 1000),
          features: template.features.map(f => `${niche.charAt(0).toUpperCase() + niche.slice(1)} ${f}`),
          images: template.images,
          variants: [
            {
              skuId: `${normalizedNiche}_var_${i + 1}_1`,
              price: template.price + (variation - 1) * 10,
              inventory: 50 + Math.floor(Math.random() * 50)
            }
          ],
          imageUrl: template.images[0],
          category: normalizedNiche,
          niche: normalizedNiche
        };
        
        products.push(product);
      }

      console.log(`✅ Generated 10 adapted products for ${niche} niche using fallback templates`);

      return new Response(JSON.stringify({
        success: true,
        products,
        total: products.length,
        niche: normalizedNiche,
        sessionId,
        source: 'adapted_templates'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Create 10+ unique products by expanding the template set
    const products = [];
    
    for (let i = 0; i < 15; i++) { // Generate 15 to ensure diversity
      const template = templates[i % templates.length];
      const variation = Math.floor(i / templates.length) + 1;
      
      // Create meaningful variations of each template
      const product = {
        itemId: `${normalizedNiche}_${i + 1}_${Date.now()}`,
        title: variation === 1 ? template.title : `${template.title} - Edition ${variation}`,
        price: Math.round(template.price + (variation - 1) * 8 + (Math.random() * 20 - 10)),
        rating: Math.max(4.4, Math.min(5.0, template.rating + (Math.random() * 0.4 - 0.2))),
        orders: template.orders + Math.floor(Math.random() * 1500) + (variation * 200),
        features: template.features,
        images: template.images,
        variants: [
          {
            skuId: `${normalizedNiche}_var_${i + 1}_1`,
            price: Math.round(template.price + (variation - 1) * 8),
            inventory: 30 + Math.floor(Math.random() * 70)
          },
          {
            skuId: `${normalizedNiche}_var_${i + 1}_2`,
            price: Math.round(template.price + (variation - 1) * 8 + 15),
            inventory: 20 + Math.floor(Math.random() * 40)
          }
        ],
        imageUrl: template.images[0],
        category: normalizedNiche,
        niche: normalizedNiche
      };
      
      products.push(product);
    }

    console.log(`✅ Generated ${products.length} diverse products for ${niche} niche with real variations`);

    return new Response(JSON.stringify({
      success: true,
      products,
      total: products.length,
      niche: normalizedNiche,
      sessionId,
      source: 'niche_specific_templates',
      diversity_metrics: {
        unique_titles: new Set(products.map(p => p.title.split(' - ')[0])).size,
        price_range: `$${Math.min(...products.map(p => p.price)).toFixed(2)} - $${Math.max(...products.map(p => p.price)).toFixed(2)}`,
        rating_range: `${Math.min(...products.map(p => p.rating)).toFixed(1)} - ${Math.max(...products.map(p => p.rating)).toFixed(1)}`
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Niche-specific product generation failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to get niche-specific products',
      products: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

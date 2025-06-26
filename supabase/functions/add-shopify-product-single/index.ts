
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced niche-specific product data with real variations
const NICHE_PRODUCT_DATA = {
  'beauty': [
    {
      baseTitle: "LED Light Therapy Face Mask",
      basePrice: 89.99,
      category: "Skincare Tools",
      features: ["7 LED colors", "Anti-aging technology", "FDA approved", "Wireless design"],
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
      baseTitle: "Jade Facial Roller & Gua Sha Set",
      basePrice: 24.99,
      category: "Facial Tools",
      features: ["Natural jade stone", "Reduces puffiness", "Improves circulation", "Includes storage pouch"],
      images: [
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500",
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500",
        "https://images.unsplash.com/photo-1594736797933-d0d14eeb3573?w=500",
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500"
      ]
    },
    {
      baseTitle: "Vitamin C Serum with Hyaluronic Acid",
      basePrice: 32.99,
      category: "Serums",
      features: ["20% Vitamin C", "Anti-aging formula", "Brightens skin", "Dermatologist tested"],
      images: [
        "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500",
        "https://images.unsplash.com/photo-1556228653-71bb69e0117e?w=500",
        "https://images.unsplash.com/photo-1585652757141-058f9d84c00b?w=500",
        "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500",
        "https://images.unsplash.com/photo-1564149504819-64f968c7c175?w=500",
        "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500"
      ]
    }
  ],
  'pets': [
    {
      baseTitle: "Smart Pet Feeder with Camera",
      basePrice: 79.99,
      category: "Pet Tech",
      features: ["1080p HD camera", "Voice recording", "Scheduled feeding", "Mobile app control"],
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
      baseTitle: "Orthopedic Memory Foam Pet Bed",
      basePrice: 45.99,
      category: "Pet Comfort",
      features: ["Memory foam support", "Removable cover", "Non-slip bottom", "Waterproof liner"],
      images: [
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500",
        "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=500",
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500",
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500",
        "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=500",
        "https://images.unsplash.com/photo-1444212477490-ca407925329e?w=500"
      ]
    }
  ],
  'fitness': [
    {
      baseTitle: "Resistance Bands Set with Door Anchor",
      basePrice: 29.99,
      category: "Home Gym",
      features: ["5 resistance levels", "Door anchor included", "Foam handles", "Exercise guide"],
      images: [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500",
        "https://images.unsplash.com/photo-1594736797933-d0d14eeb3573?w=500",
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500",
        "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=500",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500"
      ]
    }
  ]
};

// GPT-powered content generation
async function generateUniqueProductContent(baseProduct: any, niche: string, productIndex: number, openAIKey: string) {
  console.log(`🤖 GENERATING UNIQUE CONTENT for product ${productIndex + 1} in ${niche} niche`);
  
  const contentPrompt = `You are an expert e-commerce copywriter. Create a unique, compelling product listing for a ${niche} product.

Base Product: ${baseProduct.baseTitle}
Product Index: ${productIndex + 1}/10
Target Audience: ${niche} enthusiasts
Store Style: Modern e-commerce

Create COMPLETELY UNIQUE content (no repetition from other products):

1. CREATIVE TITLE (max 60 chars): Add emojis, power words, and unique hooks. Make it feel premium and different from basic product names.

2. COMPELLING DESCRIPTION: Write 3-4 paragraphs in HTML format with:
   - Emotional hook opening
   - Key benefits with emojis  
   - Social proof elements
   - Call to action

3. FEATURES: List 4-6 specific features with emojis

4. TAGS: 6-8 SEO tags for ${niche} niche

5. PRICING: Suggest price between $${Math.max(15, baseProduct.basePrice * 0.7)} - $${Math.min(80, baseProduct.basePrice * 1.3)}

Make this product sound premium, unique, and irresistible. Use varied writing styles (story-driven, benefit-focused, review-style) to ensure each product feels different.

Return JSON format:
{
  "title": "unique title with emojis",
  "description": "HTML formatted description",
  "features": ["feature 1", "feature 2", ...],
  "tags": ["tag1", "tag2", ...],
  "price": suggested_price_number
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert e-commerce copywriter who creates unique, compelling product descriptions.' },
          { role: 'user', content: contentPrompt }
        ],
        temperature: 0.8, // Higher creativity
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    
    console.log(`✅ UNIQUE CONTENT GENERATED: "${content.title}"`);
    return content;
    
  } catch (error) {
    console.error('❌ GPT content generation failed:', error);
    // Fallback to manual unique content
    return generateFallbackContent(baseProduct, niche, productIndex);
  }
}

function generateFallbackContent(baseProduct: any, niche: string, productIndex: number) {
  const variations = [
    { prefix: "✨ Premium", style: "luxury" },
    { prefix: "🚀 Revolutionary", style: "innovation" },
    { prefix: "🏆 Award-Winning", style: "achievement" },
    { prefix: "💎 Professional", style: "quality" },
    { prefix: "⚡ Advanced", style: "technology" },
    { prefix: "🌟 Ultimate", style: "supreme" },
    { prefix: "🔥 Best-Selling", style: "popular" },
    { prefix: "💯 Top-Rated", style: "trusted" }
  ];

  const variation = variations[productIndex % variations.length];
  const price = Math.round(baseProduct.basePrice + (productIndex * 5) + (Math.random() * 20));

  return {
    title: `${variation.prefix} ${baseProduct.baseTitle}`,
    description: `<h3>Transform Your ${niche.charAt(0).toUpperCase() + niche.slice(1)} Experience</h3><p>Discover why thousands choose this ${variation.style} solution. Perfect for ${niche} enthusiasts who demand quality and results.</p><p><strong>Key Benefits:</strong><br>• Premium quality construction<br>• Proven results<br>• Easy to use<br>• Money-back guarantee</p>`,
    features: baseProduct.features,
    tags: [niche, 'premium', 'quality', 'bestseller', variation.style, 'trending'],
    price: Math.min(80, Math.max(15, price))
  };
}

// Shopify API Client
class ShopifyClient {
  constructor(private shopUrl: string, private accessToken: string) {}

  async createProduct(productData: any) {
    console.log('🛒 Creating product in Shopify:', productData.product.title);
    
    const response = await fetch(`${this.shopUrl}/admin/api/2024-10/products.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create product: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  async uploadImage(productId: string, imageUrl: string, position: number) {
    console.log(`📸 Uploading image ${position} for product ${productId}`);
    
    const response = await fetch(`${this.shopUrl}/admin/api/2024-10/products/${productId}/images.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: {
          src: imageUrl,
          position: position,
          alt: `Product image ${position}`
        }
      })
    });

    if (!response.ok) {
      console.warn(`⚠️ Image upload failed for position ${position}`);
      return null;
    }

    const result = await response.json();
    console.log(`✅ IMAGE SUCCESS: Image ${position} uploaded with ID: ${result.image.id}`);
    return result;
  }

  async createVariant(productId: string, variantData: any) {
    console.log(`🎯 Creating variant for product ${productId}`);
    
    const response = await fetch(`${this.shopUrl}/admin/api/2024-10/products/${productId}/variants.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ variant: variantData })
    });

    if (!response.ok) {
      console.warn(`⚠️ Variant creation failed`);
      return null;
    }

    return await response.json();
  }

  async updateVariant(variantId: string, variantData: any) {
    console.log(`🔄 Updating variant ${variantId}`);
    
    const response = await fetch(`${this.shopUrl}/admin/api/2024-10/variants/${variantId}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ variant: variantData })
    });

    if (!response.ok) {
      console.warn(`⚠️ Variant update failed`);
      return null;
    }

    return await response.json();
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      shopifyUrl,
      accessToken,
      themeColor,
      product,
      storeName,
      targetAudience,
      storeStyle,
      businessType,
      productIndex,
      niche
    } = await req.json();

    console.log(`🚨 SINGLE PRODUCT UPLOAD: Processing product: {
  title: "${product.title}",
  storeName: "${storeName}",
  niche: "${niche}",
  productIndex: ${productIndex},
  businessType: "${businessType}",
  storeStyle: "${storeStyle}"
}`);

    // Extract domain from URL
    const extractDomain = (url: string) => {
      if (!url) return '';
      
      console.log('🔍 EXTRACTING FROM:', url);
      
      if (url.includes('admin.shopify.com/store/')) {
        const match = url.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
        if (match) {
          const storeId = match[1];
          const domain = `${storeId}.myshopify.com`;
          console.log('✅ EXTRACTED ADMIN URL:', storeId, '->', domain);
          return domain;
        }
      }
      
      let domain = url.replace(/^https?:\/\//, '');
      
      if (domain.includes('.myshopify.com')) {
        const cleanDomain = domain.split('/')[0];
        console.log('✅ ALREADY MYSHOPIFY:', cleanDomain);
        return cleanDomain;
      }
      
      const finalDomain = `${domain}.myshopify.com`;
      console.log('✅ CONSTRUCTED DOMAIN:', finalDomain);
      return finalDomain;
    };

    const domain = extractDomain(shopifyUrl);
    const finalShopifyUrl = `https://${domain}`;
    
    // Get OpenAI API key
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get niche-specific product data
    const nicheProducts = NICHE_PRODUCT_DATA[niche.toLowerCase() as keyof typeof NICHE_PRODUCT_DATA] || NICHE_PRODUCT_DATA['beauty'];
    const baseProduct = nicheProducts[productIndex % nicheProducts.length];
    
    // Generate unique content with GPT
    const uniqueContent = await generateUniqueProductContent(baseProduct, niche, productIndex, openAIKey);
    
    console.log(`🚨 PRODUCT DETAILS: {
  title: "${uniqueContent.title}",
  price: "${uniqueContent.price}",
  niche: "${niche}",
  handle: "${uniqueContent.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 50)}-${Date.now()}",
  businessType: "${businessType}",
  storeStyle: "${storeStyle}"
}`);

    // Create Shopify client
    const shopify = new ShopifyClient(finalShopifyUrl, accessToken);

    // Create product payload
    const productPayload = {
      product: {
        title: uniqueContent.title,
        body_html: uniqueContent.description,
        vendor: storeName,
        product_type: baseProduct.category,
        handle: uniqueContent.title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50) + `-${Date.now()}`,
        status: 'active',
        published: true,
        tags: uniqueContent.tags.join(', '),
        options: [
          {
            name: 'Variant',
            position: 1,
            values: ['Standard']
          }
        ],
        variants: [
          {
            option1: 'Standard',
            price: uniqueContent.price.toFixed(2),
            compare_at_price: (uniqueContent.price * 1.3).toFixed(2),
            inventory_quantity: 100,
            inventory_management: null,
            fulfillment_service: 'manual',
            requires_shipping: true
          }
        ]
      }
    };

    console.log('🚨 CREATING PRODUCT: With enhanced payload');
    
    // Create the product
    const productResponse = await shopify.createProduct(productPayload);
    const createdProduct = productResponse.product;
    
    console.log('✅ PRODUCT CREATED:', createdProduct.id);

    // Upload images
    console.log('🚨 STARTING IMAGE UPLOAD: Using enhanced images for', niche);
    let uploadedImages = 0;
    
    for (let i = 0; i < Math.min(6, baseProduct.images.length); i++) {
      try {
        console.log(`🔄 UPLOADING IMAGE ${i + 1}/${baseProduct.images.length}: ${baseProduct.images[i]}`);
        const imageResult = await shopify.uploadImage(createdProduct.id, baseProduct.images[i], i + 1);
        if (imageResult) {
          uploadedImages++;
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
      } catch (imageError) {
        console.error(`❌ Image ${i + 1} upload failed:`, imageError);
      }
    }

    console.log(`🎉 IMAGE UPLOAD SUCCESS: ${uploadedImages} images uploaded`);

    // Update default variant price
    if (createdProduct.variants && createdProduct.variants.length > 0) {
      const defaultVariant = createdProduct.variants[0];
      await shopify.updateVariant(defaultVariant.id, {
        price: uniqueContent.price.toFixed(2),
        compare_at_price: (uniqueContent.price * 1.2).toFixed(2)
      });
      console.log(`✅ DEFAULT VARIANT UPDATED: Price set to $${uniqueContent.price.toFixed(2)}`);
    }

    // Create additional smart variations
    console.log(`🚨 CREATING VARIATIONS: Smart variations for ${niche}`);
    const variations = [
      { title: 'Premium Edition', multiplier: 1.3 },
      { title: 'Deluxe Package', multiplier: 1.5 }
    ];

    let createdVariants = 0;
    for (const variation of variations) {
      try {
        const variantPrice = Math.min(80, uniqueContent.price * variation.multiplier);
        const variantResult = await shopify.createVariant(createdProduct.id, {
          option1: variation.title,
          price: variantPrice.toFixed(2),
          compare_at_price: (variantPrice * 1.15).toFixed(2),
          inventory_quantity: 50,
          inventory_management: null,
          fulfillment_service: 'manual',
          requires_shipping: true
        });
        
        if (variantResult) {
          createdVariants++;
          console.log(`✅ VARIATION SUCCESS: "${variation.title}" at $${variantPrice.toFixed(2)}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (variantError) {
        console.error(`❌ Variant creation failed for ${variation.title}:`, variantError);
      }
    }

    const results = {
      productId: createdProduct.id,
      title: uniqueContent.title,
      price: uniqueContent.price.toFixed(2),
      imagesUploaded: uploadedImages,
      variantsCreated: createdVariants + 1, // +1 for default variant
      niche: niche,
      status: 'SUCCESS'
    };

    console.log('🎉 SINGLE PRODUCT COMPLETE - RESULTS:', results);

    return new Response(JSON.stringify({
      success: true,
      product: {
        id: createdProduct.id,
        title: uniqueContent.title,
        price: uniqueContent.price,
        images: uploadedImages,
        variants: createdVariants + 1
      },
      shopifyUrl: `${finalShopifyUrl}/admin/products/${createdProduct.id}`,
      message: `Product "${uniqueContent.title}" created successfully with ${uploadedImages} images and ${createdVariants + 1} variants`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Single product creation failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Product creation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

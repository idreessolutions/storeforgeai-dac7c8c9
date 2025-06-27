
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Shopify API Client
class ShopifyApiClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(shopUrl: string, accessToken: string) {
    this.baseUrl = shopUrl.replace(/\/$/, '');
    this.accessToken = accessToken;
  }

  async createProduct(productData: any): Promise<any> {
    console.log('🛒 Creating product in Shopify:', productData.product.title);
    
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/products.json`, {
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

  async uploadImage(productId: string, imageData: any): Promise<any> {
    console.log(`📸 Uploading image ${imageData.position} for product ${productId}`);
    
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/products/${productId}/images.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: imageData })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Image upload failed: ${response.status} - ${errorText}`);
      return null;
    }

    return await response.json();
  }

  async updateVariant(variantId: string, variantData: any): Promise<any> {
    console.log(`🔄 Updating variant ${variantId}`);
    
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/variants/${variantId}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ variant: variantData })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Variant update failed: ${response.status} - ${errorText}`);
      return null;
    }

    return await response.json();
  }

  async createVariant(productId: string, variantData: any): Promise<any> {
    console.log(`🎯 Creating variant for product ${productId}`);
    
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/products/${productId}/variants.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ variant: variantData })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Variant creation failed: ${response.status} - ${errorText}`);
      return null;
    }

    return await response.json();
  }
}

// GPT prompt templates for maximum variation
const GPT_PROMPT_TEMPLATES = {
  storytelling: (product: any, niche: string, targetAudience: string, index: number) => `
    Create a compelling product story for this ${niche} item targeting ${targetAudience}. Product ${index + 1}/10.
    
    Original: ${product.title}
    Price: $${product.price}
    Features: ${product.features?.join(', ') || 'Premium quality'}
    
    Write a story-driven title with emojis and description that tells how this product transforms lives.
    Make it emotional and personal. Use unique hook words like "Ultimate", "Revolutionary", "Life-Changing".
    
    Return JSON: {"title": "emoji + hook + benefit", "description": "HTML story format", "tags": ["unique", "tags", "here"]}
  `,
  
  benefits: (product: any, niche: string, targetAudience: string, index: number) => `
    Create benefit-focused content for this ${niche} product targeting ${targetAudience}. Product ${index + 1}/10.
    
    Original: ${product.title}
    Price: $${product.price}
    Features: ${product.features?.join(', ') || 'High quality'}
    
    Focus on clear benefits and problem-solving. Use action words and urgency.
    Make the title benefit-driven with power words like "Transform", "Boost", "Maximize".
    
    Return JSON: {"title": "emoji + action word + benefit", "description": "HTML benefits list", "tags": ["benefit", "focused", "tags"]}
  `,
  
  luxury: (product: any, niche: string, targetAudience: string, index: number) => `
    Create premium luxury content for this ${niche} item targeting ${targetAudience}. Product ${index + 1}/10.
    
    Original: ${product.title}
    Price: $${product.price}
    Features: ${product.features?.join(', ') || 'Premium features'}
    
    Make it sound luxurious and exclusive. Use words like "Premium", "Elite", "Exclusive", "Professional".
    Create desire and exclusivity.
    
    Return JSON: {"title": "emoji + luxury word + exclusive benefit", "description": "HTML luxury format", "tags": ["premium", "luxury", "exclusive"]}
  `,
  
  practical: (product: any, niche: string, targetAudience: string, index: number) => `
    Create practical, no-nonsense content for this ${niche} product targeting ${targetAudience}. Product ${index + 1}/10.
    
    Original: ${product.title}
    Price: $${product.price}
    Features: ${product.features?.join(', ') || 'Practical features'}
    
    Focus on functionality and value. Use straightforward language with practical hooks.
    Use words like "Essential", "Smart", "Efficient", "Must-Have".
    
    Return JSON: {"title": "emoji + practical word + function", "description": "HTML practical format", "tags": ["essential", "practical", "smart"]}
  `
};

// Generate unique content using GPT with rotation
async function generateUniqueProductContent(product: any, niche: string, targetAudience: string, businessType: string, storeStyle: string, productIndex: number): Promise<any> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log(`🤖 GENERATING UNIQUE CONTENT for product ${productIndex + 1} in ${niche} niche`);

  // Rotate through different prompt templates for maximum variation
  const templates = Object.values(GPT_PROMPT_TEMPLATES);
  const templateIndex = productIndex % templates.length;
  const selectedTemplate = templates[templateIndex];
  
  const prompt = selectedTemplate(product, niche, targetAudience, productIndex);

  try {
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
            content: `You are an expert e-commerce copywriter creating unique, compelling product content. Each product must be completely different from others. Focus on ${niche} products for ${targetAudience}. Always return valid JSON.` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8 + (productIndex * 0.1), // Increase creativity for each product
        max_tokens: 800
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Clean up GPT response
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    
    const parsedContent = JSON.parse(content);
    console.log(`✅ UNIQUE CONTENT GENERATED: "${parsedContent.title}"`);
    
    return parsedContent;
  } catch (error) {
    console.error('❌ GPT content generation failed:', error);
    
    // Fallback with unique variations
    const fallbackTitles = [
      `🌟 ${product.title} - Premium Edition`,
      `✨ Ultimate ${product.title}`,
      `🔥 ${product.title} - Pro Version`,
      `⭐ Elite ${product.title}`,
      `💎 ${product.title} - Deluxe`,
      `🚀 Advanced ${product.title}`,
      `🎯 Smart ${product.title}`,
      `🏆 Professional ${product.title}`,
      `💫 ${product.title} Plus`,
      `🔥 ${product.title} - Special Edition`
    ];
    
    return {
      title: fallbackTitles[productIndex % fallbackTitles.length],
      description: `<p>Experience the difference with this premium ${niche} product designed for ${targetAudience}.</p><ul><li>High-quality construction</li><li>Perfect for ${targetAudience}</li><li>Fast shipping</li><li>30-day return policy</li></ul>`,
      tags: [`${niche}`, 'premium', 'quality', targetAudience, 'bestseller']
    };
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

    console.log('🚨 SINGLE PRODUCT UPLOAD: Processing product:', {
      title: product.title,
      storeName,
      niche,
      productIndex,
      businessType,
      storeStyle
    });

    if (!shopifyUrl || !accessToken || !product) {
      throw new Error('Missing required parameters');
    }

    // Extract domain properly
    const extractShopifyDomain = (url: string): string => {
      if (url.includes('admin.shopify.com/store/')) {
        const match = url.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
        if (match) return `${match[1]}.myshopify.com`;
      }
      
      let domain = url.replace(/^https?:\/\//, '');
      if (domain.includes('.myshopify.com')) {
        return domain.split('/')[0];
      }
      
      return `${domain}.myshopify.com`;
    };

    const shopifyDomain = extractShopifyDomain(shopifyUrl);
    const fullShopifyUrl = `https://${shopifyDomain}`;
    
    console.log('🔍 EXTRACTING FROM:', shopifyUrl);
    console.log('✅ ALREADY MYSHOPIFY:', shopifyDomain);

    const shopifyClient = new ShopifyApiClient(fullShopifyUrl, accessToken);

    // Generate unique content with GPT
    const enhancedContent = await generateUniqueProductContent(
      product, 
      niche, 
      targetAudience, 
      businessType, 
      storeStyle, 
      productIndex
    );

    // Calculate unique pricing based on index and original price
    const basePrice = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 25;
    const priceVariation = (productIndex * 5) + (Math.random() * 20 - 10); // Add variation
    const finalPrice = Math.max(15, Math.min(80, basePrice + priceVariation));

    console.log('🚨 PRODUCT DETAILS:', {
      title: enhancedContent.title,
      price: finalPrice.toFixed(0),
      niche,
      handle: enhancedContent.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50) + `-${Date.now()}`,
      businessType,
      storeStyle
    });

    // Create comprehensive product payload
    const productPayload = {
      product: {
        title: enhancedContent.title,
        body_html: enhancedContent.description,
        vendor: storeName || `${niche.charAt(0).toUpperCase() + niche.slice(1)} Store`,
        product_type: niche.charAt(0).toUpperCase() + niche.slice(1),
        handle: enhancedContent.title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50) + `-${Date.now()}`,
        status: 'active',
        published: true,
        tags: enhancedContent.tags.join(', '),
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
            price: finalPrice.toFixed(2),
            compare_at_price: (finalPrice * 1.3).toFixed(2),
            inventory_quantity: 100,
            inventory_management: null,
            fulfillment_service: 'manual',
            requires_shipping: true,
            weight: 0.5,
            weight_unit: 'kg'
          }
        ]
      }
    };

    console.log('🚨 CREATING PRODUCT: With enhanced payload');
    const productResponse = await shopifyClient.createProduct(productPayload);
    const createdProduct = productResponse.product;

    console.log('✅ PRODUCT CREATED:', createdProduct.id);

    // Upload unique images for this product
    console.log('🚨 STARTING IMAGE UPLOAD: Using enhanced images for', niche);
    
    const productImages = product.images || [];
    let uploadedImages = 0;
    
    // Upload up to 6 images with proper spacing
    for (let i = 0; i < Math.min(productImages.length, 6); i++) {
      try {
        console.log(`🔄 UPLOADING IMAGE ${i + 1}/${Math.min(productImages.length, 6)}: ${productImages[i]}`);
        
        const imagePayload = {
          src: productImages[i],
          alt: `${enhancedContent.title} - Image ${i + 1}`,
          position: i + 1
        };

        const imageResponse = await shopifyClient.uploadImage(createdProduct.id, imagePayload);
        if (imageResponse) {
          uploadedImages++;
          console.log(`✅ IMAGE SUCCESS: Image ${i + 1} uploaded with ID: ${imageResponse.image.id}`);
        }

        // Rate limiting between images
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (imageError) {
        console.error(`⚠️ Image upload failed for position ${i + 1}`);
      }
    }

    console.log(`🎉 IMAGE UPLOAD SUCCESS: ${uploadedImages} images uploaded`);

    // Update default variant with correct pricing
    if (createdProduct.variants && createdProduct.variants.length > 0) {
      const defaultVariant = createdProduct.variants[0];
      await shopifyClient.updateVariant(defaultVariant.id, {
        price: finalPrice.toFixed(2),
        compare_at_price: (finalPrice * 1.25).toFixed(2)
      });
      console.log('✅ DEFAULT VARIANT UPDATED: Price set to $' + finalPrice.toFixed(2));
    }

    // Create additional smart variations based on niche
    console.log('🚨 CREATING VARIATIONS: Smart variations for', niche);
    let createdVariants = 0;
    
    const smartVariations = [
      { name: 'Premium Edition', priceMultiplier: 1.3 },
      { name: 'Deluxe Package', priceMultiplier: 1.5 }
    ];

    for (const variation of smartVariations) {
      try {
        const variantPrice = (finalPrice * variation.priceMultiplier).toFixed(2);
        const variantPayload = {
          option1: variation.name,
          price: variantPrice,
          compare_at_price: (parseFloat(variantPrice) * 1.2).toFixed(2),
          inventory_quantity: 50,
          inventory_management: null,
          fulfillment_service: 'manual',
          requires_shipping: true
        };

        const variantResponse = await shopifyClient.createVariant(createdProduct.id, variantPayload);
        if (variantResponse) {
          createdVariants++;
          console.log(`✅ VARIATION SUCCESS: "${variation.name}" at $${variantPrice}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (variantError) {
        console.error(`❌ Failed to create variant: ${variation.name}`);
      }
    }

    console.log('🎉 SINGLE PRODUCT COMPLETE - RESULTS:', {
      productId: createdProduct.id,
      title: createdProduct.title,
      price: finalPrice.toFixed(2),
      imagesUploaded: uploadedImages,
      variantsCreated: createdVariants,
      niche: niche,
      status: 'SUCCESS'
    });

    return new Response(JSON.stringify({
      success: true,
      product: {
        id: createdProduct.id,
        title: createdProduct.title,
        price: finalPrice.toFixed(2),
        handle: createdProduct.handle,
        images: uploadedImages,
        variants: createdVariants + 1, // +1 for default
        niche: niche
      },
      message: `Product created successfully with ${uploadedImages} images and ${createdVariants + 1} variants`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Single product creation failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Single product creation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

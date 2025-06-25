
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Shopify API Client for the sync function
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
    console.log(`📸 Uploading image for product ${productId}`);
    
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      aliexpressProduct, 
      enhancedContent, 
      shopifyUrl, 
      shopifyAccessToken, 
      storeConfig 
    } = await req.json();

    console.log('🚀 Syncing product to Shopify:', {
      title: enhancedContent.title.substring(0, 50),
      variants: aliexpressProduct.variants.length,
      images: Object.keys(aliexpressProduct.images.skuImages).length
    });

    if (!shopifyUrl || !shopifyAccessToken) {
      throw new Error('Shopify credentials are required');
    }

    const shopifyClient = new ShopifyApiClient(shopifyUrl, shopifyAccessToken);
    const timestamp = Date.now();

    // Create product payload
    const productPayload = {
      product: {
        title: enhancedContent.title,
        body_html: enhancedContent.description,
        vendor: storeConfig.storeName || 'AliExpress Import',
        product_type: storeConfig.niche || 'General',
        handle: enhancedContent.title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50) + `-${timestamp}`,
        status: 'draft', // Create as draft first
        published: false,
        tags: enhancedContent.tags.join(', '),
        options: [
          {
            name: 'Variant',
            position: 1,
            values: ['Default']
          }
        ],
        variants: [
          {
            option1: 'Default',
            price: aliexpressProduct.price.min.toFixed(2),
            compare_at_price: (aliexpressProduct.price.min * 1.3).toFixed(2),
            inventory_quantity: 100,
            inventory_management: null,
            fulfillment_service: 'manual',
            requires_shipping: true
          }
        ]
      }
    };

    console.log('🛒 Creating Shopify product...');
    const productResponse = await shopifyClient.createProduct(productPayload);
    const createdProduct = productResponse.product;

    console.log('✅ Product created:', createdProduct.id);

    // Upload main image
    let uploadedImages = 0;
    if (aliexpressProduct.images.main) {
      try {
        const imagePayload = {
          src: aliexpressProduct.images.main,
          alt: enhancedContent.title,
          position: 1
        };

        const imageResponse = await shopifyClient.uploadImage(createdProduct.id, imagePayload);
        if (imageResponse) {
          uploadedImages++;
          console.log('✅ Main image uploaded');
        }
      } catch (imageError) {
        console.error('❌ Failed to upload main image:', imageError);
      }
    }

    // Upload SKU images
    let imagePosition = 2;
    for (const [skuId, images] of Object.entries(aliexpressProduct.images.skuImages)) {
      for (const imageUrl of images) {
        try {
          const imagePayload = {
            src: imageUrl,
            alt: `${enhancedContent.title} - ${skuId}`,
            position: imagePosition++
          };

          const imageResponse = await shopifyClient.uploadImage(createdProduct.id, imagePayload);
          if (imageResponse) {
            uploadedImages++;
            console.log(`✅ SKU image uploaded for ${skuId}`);
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (imageError) {
          console.error(`❌ Failed to upload SKU image for ${skuId}:`, imageError);
        }
      }
    }

    // Create additional variants from AliExpress data
    let createdVariants = 0;
    for (let i = 0; i < Math.min(aliexpressProduct.variants.length, 3); i++) {
      const variant = aliexpressProduct.variants[i];
      
      try {
        const variantPayload = {
          option1: `Variant ${i + 1}`,
          price: variant.price.toFixed(2),
          compare_at_price: (variant.price * 1.2).toFixed(2),
          inventory_quantity: Math.min(variant.inventory, 100),
          inventory_management: null,
          fulfillment_service: 'manual',
          requires_shipping: true,
          sku: `ALI-${aliexpressProduct.productId}-${variant.skuId}`
        };

        const variantResponse = await shopifyClient.createVariant(createdProduct.id, variantPayload);
        if (variantResponse) {
          createdVariants++;
          console.log(`✅ Variant created: ${variant.skuId}`);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (variantError) {
        console.error(`❌ Failed to create variant ${variant.skuId}:`, variantError);
      }
    }

    console.log('🎉 Product sync completed:', {
      productId: createdProduct.id,
      imagesUploaded: uploadedImages,
      variantsCreated: createdVariants
    });

    return new Response(JSON.stringify({
      success: true,
      productId: createdProduct.id,
      shopifyUrl: `${shopifyUrl}/admin/products/${createdProduct.id}`,
      imagesUploaded: uploadedImages,
      variantsCreated: createdVariants,
      message: `Product successfully synced to Shopify with ${uploadedImages} images and ${createdVariants} variants`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Product sync failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Product sync failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

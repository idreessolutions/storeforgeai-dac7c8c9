
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ShopifyAPIClient } from "../add-shopify-product/utils/shopify-api.ts";
import { EnhancedAliExpressImageService } from "../add-shopify-product/utils/enhanced-image-service.ts";
import { EnhancedProductGenerator } from "../add-shopify-product/utils/enhanced-product-generator.ts";
import { VariantManager } from "../add-shopify-product/utils/variant-manager.ts";
import { extractStoreNameFromUrl, generateUniqueHandle, applyThemeColorToDescription } from "../add-shopify-product/utils/helpers.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      title: product?.title?.substring(0, 50),
      storeName: storeName,
      niche: niche,
      productIndex: productIndex,
      businessType: businessType,
      storeStyle: storeStyle
    });
    
    if (!shopifyUrl || !accessToken || !product) {
      throw new Error('Missing required parameters: shopifyUrl, accessToken, or product');
    }

    // Initialize API clients
    const extractedStoreName = extractStoreNameFromUrl(shopifyUrl);
    const fullShopifyUrl = `https://${extractedStoreName}.myshopify.com`;
    const shopifyClient = new ShopifyAPIClient(fullShopifyUrl, accessToken);
    const variantManager = new VariantManager(shopifyClient);

    // Generate enhanced description
    const enhancedDescription = EnhancedProductGenerator.generateNicheSpecificDescription(
      product.title,
      niche,
      businessType || 'e-commerce',
      storeStyle || 'modern',
      targetAudience || 'Everyone'
    );
    
    const styledDescription = applyThemeColorToDescription(enhancedDescription, themeColor);
    const timestamp = Date.now();
    const uniqueHandle = generateUniqueHandle(product.title, timestamp);
    const productPrice = product.price?.toFixed(2) || '29.99';
    
    console.log('🚨 PRODUCT DETAILS:', {
      title: product.title?.substring(0, 40),
      price: productPrice,
      niche: niche,
      handle: uniqueHandle,
      businessType: businessType,
      storeStyle: storeStyle
    });

    // Create main product payload
    const productPayload = {
      product: {
        title: product.title,
        body_html: styledDescription,
        vendor: storeName || extractedStoreName || 'Premium Store',
        product_type: product.category || niche || 'General',
        handle: uniqueHandle,
        status: 'active',
        published: true,
        tags: `${niche}, ${targetAudience}, ${storeStyle}, ${businessType}, ${storeName}, enhanced-product-${productIndex + 1}`,
        metafields: [
          {
            namespace: 'custom',
            key: 'business_model',
            value: businessType || 'e-commerce',
            type: 'single_line_text_field'
          },
          {
            namespace: 'custom',
            key: 'store_style',
            value: storeStyle || 'modern',
            type: 'single_line_text_field'
          },
          {
            namespace: 'custom',
            key: 'niche',
            value: niche || 'general',
            type: 'single_line_text_field'
          }
        ]
      }
    };

    console.log('🚨 CREATING PRODUCT: With enhanced payload');

    // Create product in Shopify
    const productData = await shopifyClient.createProduct(productPayload);
    const createdProduct = productData.product;

    console.log('✅ PRODUCT CREATED:', createdProduct.id);

    // Upload images
    let uploadedImageCount = 0;
    let imageIds: string[] = [];
    
    console.log(`🚨 STARTING IMAGE UPLOAD: Using enhanced images for ${niche}`);
    
    try {
      const realImages = EnhancedAliExpressImageService.getRealProductImages(niche, productIndex, createdProduct.title);
      
      for (let i = 0; i < Math.min(realImages.length, 6); i++) {
        const imageUrl = realImages[i];
        console.log(`🔄 UPLOADING IMAGE ${i + 1}/6: ${imageUrl}`);

        try {
          const imagePayload = {
            image: {
              src: imageUrl,
              alt: `${createdProduct.title} - Product Image ${i + 1}`,
              position: i + 1,
              filename: `product-${createdProduct.id}-image-${i + 1}.jpg`
            }
          };

          const response = await shopifyClient.uploadImage(createdProduct.id, imagePayload.image);

          if (response && response.image && response.image.id) {
            imageIds.push(response.image.id.toString());
            uploadedImageCount++;
            console.log(`✅ IMAGE SUCCESS: Image ${i + 1} uploaded with ID: ${response.image.id}`);
          }
        } catch (imageError) {
          console.error(`❌ IMAGE ERROR: Image ${i + 1} failed:`, imageError);
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      console.log(`🎉 IMAGE UPLOAD SUCCESS: ${uploadedImageCount} images uploaded`);
      
    } catch (imageError) {
      console.error('🚨 IMAGE UPLOAD ERROR:', imageError);
    }

    // Update default variant with correct pricing
    let variantUpdateSuccess = false;
    let createdVariants: any[] = [];
    
    if (createdProduct.variants && createdProduct.variants.length > 0) {
      const defaultVariant = createdProduct.variants[0];
      variantUpdateSuccess = await variantManager.updateDefaultVariant(defaultVariant, productPrice);
      createdVariants.push(defaultVariant);
      console.log(`✅ DEFAULT VARIANT UPDATED: Price set to $${productPrice}`);
    }

    // Create product variations
    let createdVariantCount = 0;
    console.log(`🚨 CREATING VARIATIONS: Smart variations for ${niche}`);
    
    const smartVariations = EnhancedProductGenerator.generateSmartVariations(parseFloat(productPrice), niche);
    
    for (let i = 0; i < Math.min(smartVariations.length, 2); i++) {
      const variation = smartVariations[i];
      
      try {
        const newVariant = await variantManager.createProductVariant(
          createdProduct.id,
          variation.title,
          variation.price.toFixed(2),
          variation.color || variation.size || variation.style || 'Standard'
        );
        
        if (newVariant) {
          createdVariants.push(newVariant);
          createdVariantCount++;
          console.log(`✅ VARIATION SUCCESS: "${variation.title}" at $${variation.price.toFixed(2)}`);
        }
      } catch (variantError) {
        console.error(`❌ Variation creation failed for "${variation.title}":`, variantError);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    const isSuccessful = createdProduct.id && uploadedImageCount >= 3;
    
    console.log('🎉 SINGLE PRODUCT COMPLETE - RESULTS:', {
      productId: createdProduct.id,
      title: createdProduct.title?.substring(0, 50),
      price: productPrice,
      imagesUploaded: uploadedImageCount,
      variantsCreated: createdVariantCount,
      niche: niche,
      status: isSuccessful ? 'SUCCESS' : 'PARTIAL_SUCCESS'
    });

    return new Response(JSON.stringify({
      success: isSuccessful,
      product: createdProduct,
      message: isSuccessful ? 
        `SUCCESS: "${createdProduct.title}" created with ${uploadedImageCount} images and ${createdVariantCount} variants!` :
        `PARTIAL SUCCESS: Product created with ${uploadedImageCount} images`,
      price_set: productPrice,
      images_uploaded: uploadedImageCount,
      variants_created: createdVariantCount,
      niche_applied: niche,
      shopify_integration: 'COMPLETE'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('🚨 SINGLE PRODUCT ERROR:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Single product creation failed',
      debug_info: {
        error_type: error.name,
        error_message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

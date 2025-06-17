
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ShopifyAPIClient } from "./utils/shopify-api.ts";
import { ImageProcessor } from "./utils/image-processor.ts";
import { VariantManager } from "./utils/variant-manager.ts";
import { extractStoreNameFromUrl, generateUniqueHandle, applyThemeColorToDescription } from "./utils/helpers.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shopifyUrl, accessToken, themeColor, product } = await req.json();
    
    console.log('✅ Uploading REAL AliExpress product with theme color integration:', {
      title: product.title,
      themeColor: themeColor,
      realImages: product.images?.length || 0,
      source: product.source || 'AliExpress'
    });
    
    // Validate required parameters
    if (!shopifyUrl || !accessToken || !product) {
      throw new Error('Missing required parameters: shopifyUrl, accessToken, or product');
    }

    // Initialize API client and processors
    const shopifyClient = new ShopifyAPIClient(`https://${extractStoreNameFromUrl(shopifyUrl)}.myshopify.com`, accessToken);
    const imageProcessor = new ImageProcessor(shopifyClient);
    const variantManager = new VariantManager(shopifyClient);

    // Apply theme color to product description
    const styledDescription = applyThemeColorToDescription(product.description || product.detailed_description, themeColor);

    // Generate unique handle and pricing
    const timestamp = Date.now();
    const uniqueHandle = generateUniqueHandle(product.title, timestamp);
    const productPrice = typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(String(product.price || 29.99)).toFixed(2);
    
    console.log('Setting product price with theme integration:', productPrice);

    // Extract store name for proper vendor naming
    const storeName = extractStoreNameFromUrl(shopifyUrl);

    // Create the main product payload
    const productPayload = {
      product: {
        title: product.title,
        body_html: styledDescription,
        vendor: storeName ? `${storeName.charAt(0).toUpperCase() + storeName.slice(1)} Store` : 'Premium Store',
        product_type: product.product_type || product.category || 'General',
        handle: uniqueHandle,
        status: 'active',
        published: true,
        tags: product.tags || '',
      }
    };

    console.log('Enhanced product payload with theme color:', {
      title: productPayload.product.title,
      handle: productPayload.product.handle,
      product_type: productPayload.product.product_type,
      vendor: productPayload.product.vendor,
      theme_color: themeColor,
      real_images: product.images?.length || 0,
      price: productPrice,
      category: product.category || 'General'
    });

    // Create product in Shopify
    const productData = await shopifyClient.createProduct(productPayload);
    const createdProduct = productData.product;

    console.log('✅ Product created successfully with theme integration:', createdProduct.id);

    // Process product enhancements with REAL AliExpress images
    return await handleRealProductEnhancements(createdProduct, product, shopifyClient, imageProcessor, variantManager, themeColor, productPrice);

  } catch (error) {
    console.error('❌ Error adding REAL AliExpress product to Shopify:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to add REAL AliExpress product to Shopify'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleRealProductEnhancements(
  createdProduct: any,
  product: any,
  shopifyClient: ShopifyAPIClient,
  imageProcessor: ImageProcessor,
  variantManager: VariantManager,
  themeColor: string,
  productPrice: string
) {
  // STEP 1: Upload REAL AliExpress images (NO DALL-E)
  let uploadedImageCount = 0;
  let imageIds: string[] = [];
  
  console.log(`🚀 PRIORITY: Uploading REAL AliExpress images for "${product.title}"`);
  console.log(`📊 Real images available: ${product.images?.length || 0}`);
  
  const uploadResult = await imageProcessor.uploadRealAliExpressImages(
    createdProduct.id,
    product.title,
    product.images || [product.imageUrl].filter(Boolean), // Use real AliExpress images
    themeColor
  );
  
  uploadedImageCount = uploadResult.uploadedCount;
  imageIds = uploadResult.imageIds;
  
  console.log(`📸 Real AliExpress image upload result for "${product.title}": ${uploadedImageCount} images uploaded`);

  // STEP 2: Update the default variant with proper pricing
  let variantUpdateSuccess = false;
  let createdVariants: any[] = [];
  
  if (createdProduct.variants && createdProduct.variants.length > 0) {
    const defaultVariant = createdProduct.variants[0];
    variantUpdateSuccess = await variantManager.updateDefaultVariant(defaultVariant, productPrice);
    createdVariants.push(defaultVariant);
  }

  // STEP 3: Create additional product variants if specified
  let createdVariantCount = 0;
  if (product.variants && product.variants.length > 1) {
    const additionalVariants = await variantManager.processProductVariants(
      createdProduct.id,
      product.variants,
      productPrice
    );
    createdVariantCount = additionalVariants;
  }

  // STEP 4: Assign real images to variants
  let imageAssignmentCount = 0;
  if (imageIds.length > 0 && createdVariants.length > 0) {
    console.log(`🎯 Assigning ${imageIds.length} real AliExpress images to ${createdVariants.length} variants for "${product.title}"...`);
    imageAssignmentCount = await imageProcessor.assignImagesToVariants(imageIds, createdVariants);
  }

  console.log('✅ REAL AliExpress product upload completed successfully:', {
    id: createdProduct.id,
    title: createdProduct.title,
    handle: createdProduct.handle,
    price: productPrice,
    real_images_uploaded: uploadedImageCount,
    variants_created: createdVariantCount,
    variant_pricing_updated: variantUpdateSuccess,
    images_assigned_to_variants: imageAssignmentCount,
    theme_color_applied: themeColor,
    source: 'AliExpress Drop Shipping API'
  });

  return new Response(JSON.stringify({
    success: true,
    product: createdProduct,
    message: `Successfully added REAL AliExpress product with theme integration: ${createdProduct.title}`,
    price_set: productPrice,
    real_images_uploaded: uploadedImageCount,
    variants_created: createdVariantCount,
    images_assigned_to_variants: imageAssignmentCount,
    image_upload_status: uploadedImageCount > 0 ? 'SUCCESS - Real AliExpress Images' : 'FAILED',
    theme_color_applied: themeColor,
    dalle_images_used: false,
    real_images_used: true
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

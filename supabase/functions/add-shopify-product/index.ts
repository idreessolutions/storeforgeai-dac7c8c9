
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
    
    console.log('✅ Uploading SPECIFIC winning product with matching images to Shopify:', product.title);
    console.log('🎨 Applying theme color:', themeColor);
    console.log('🎯 Product features for image generation:', product.features?.slice(0, 3) || ['Premium quality', 'Durable design', 'Easy to use']);
    console.log('📝 Product description preview:', product.description?.substring(0, 100) + '...');
    
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
    
    console.log('Setting product price:', productPrice);

    // Extract store name for proper vendor naming
    const storeName = extractStoreNameFromUrl(shopifyUrl);

    // Create the main product payload
    const productPayload = {
      product: {
        title: product.title,
        body_html: styledDescription,
        vendor: storeName ? `${storeName.charAt(0).toUpperCase() + storeName.slice(1)} Store` : 'Premium Store',
        product_type: product.product_type || 'General',
        handle: uniqueHandle,
        status: 'active',
        published: true,
        tags: product.tags || '',
      }
    };

    console.log('Enhanced product payload with specific details:', {
      title: productPayload.product.title,
      handle: productPayload.product.handle,
      product_type: productPayload.product.product_type,
      vendor: productPayload.product.vendor,
      theme_color: themeColor,
      features: product.features?.slice(0, 3) || [],
      price: productPrice,
      category: product.category || 'General'
    });

    // Create product in Shopify
    const productData = await shopifyClient.createProduct(productPayload);
    const createdProduct = productData.product;

    console.log('✅ Product created successfully with specific details:', createdProduct.id);

    // Process product enhancements with product-specific DALL·E 3 image generation
    return await handleSpecificProductEnhancements(createdProduct, product, shopifyClient, imageProcessor, variantManager, themeColor, productPrice);

  } catch (error) {
    console.error('❌ Error adding SPECIFIC winning product to Shopify:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to add SPECIFIC winning product to Shopify'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleSpecificProductEnhancements(
  createdProduct: any,
  product: any,
  shopifyClient: ShopifyAPIClient,
  imageProcessor: ImageProcessor,
  variantManager: VariantManager,
  themeColor: string,
  productPrice: string
) {
  // STEP 1: PRIORITY - Generate and upload product-specific DALL·E 3 images that MATCH the product
  let uploadedImageCount = 0;
  let imageIds: string[] = [];
  
  console.log(`🚀 PRIORITY: Generating product-specific DALL·E 3 images that match "${product.title}"`);
  console.log(`📊 Using specific features: ${product.features?.slice(0, 3)?.join(', ') || 'premium quality, durable design, easy to use'}`);
  console.log(`🏷️ Product category: ${product.category || 'General'}`);
  
  const uploadResult = await imageProcessor.uploadProductImages(
    createdProduct.id,
    product.title, // Exact product title for specific image generation
    product.features || ['Premium quality', 'Durable design', 'Easy to use'],
    product.category || 'General', // Specific category
    themeColor
  );
  
  uploadedImageCount = uploadResult.uploadedCount;
  imageIds = uploadResult.imageIds;
  
  console.log(`📸 Specific product image upload result for "${product.title}": ${uploadedImageCount} images uploaded`);

  // STEP 2: Update the default variant with proper pricing
  let variantUpdateSuccess = false;
  let createdVariants: any[] = []; // Initialize as empty array to prevent spread errors
  
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

  // STEP 4: Assign product-specific images to variants (at least 1 image per variant)
  let imageAssignmentCount = 0;
  if (imageIds.length > 0 && createdVariants.length > 0) {
    console.log(`🎯 Assigning ${imageIds.length} product-specific images to ${createdVariants.length} variants for "${product.title}"...`);
    imageAssignmentCount = await imageProcessor.assignImagesToVariants(imageIds, createdVariants);
  }

  console.log('✅ SPECIFIC Product with matching images upload completed successfully:', {
    id: createdProduct.id,
    title: createdProduct.title,
    handle: createdProduct.handle,
    price: productPrice,
    images_uploaded: uploadedImageCount,
    variants_created: createdVariantCount,
    variant_pricing_updated: variantUpdateSuccess,
    images_assigned_to_variants: imageAssignmentCount,
    specific_features_used: product.features?.slice(0, 3) || [],
    category: product.category || 'General'
  });

  return new Response(JSON.stringify({
    success: true,
    product: createdProduct,
    message: `Successfully added SPECIFIC winning product with matching images: ${createdProduct.title}`,
    price_set: productPrice,
    images_uploaded: uploadedImageCount,
    variants_created: createdVariantCount,
    images_assigned_to_variants: imageAssignmentCount,
    image_upload_status: uploadedImageCount > 0 ? 'SUCCESS - Product-Specific Images' : 'FAILED',
    features_used_for_images: product.features?.slice(0, 3) || ['Premium quality', 'Durable design', 'Easy to use']
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

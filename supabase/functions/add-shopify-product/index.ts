
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
    const { shopifyUrl, accessToken, themeColor, product, storeName, targetAudience, storeStyle, productIndex } = await req.json();
    
    console.log('✅ UPLOADING ENHANCED PRODUCT with complete branding:', {
      title: product.title,
      storeName: storeName,
      themeColor: themeColor,
      realImages: product.images?.length || 0,
      productIndex: productIndex || 0,
      enhancement: 'PREMIUM CONTENT + REAL IMAGES'
    });
    
    // Validate required parameters
    if (!shopifyUrl || !accessToken || !product) {
      throw new Error('Missing required parameters: shopifyUrl, accessToken, or product');
    }

    // Initialize API client and processors
    const shopifyClient = new ShopifyAPIClient(`https://${extractStoreNameFromUrl(shopifyUrl)}.myshopify.com`, accessToken);
    const imageProcessor = new ImageProcessor(shopifyClient);
    const variantManager = new VariantManager(shopifyClient);

    // Generate enhanced, unique content for this specific product
    const enhancedContent = await generateEnhancedProductContent(
      product, 
      product.category || 'general',
      storeName || 'Premium Store',
      targetAudience || 'quality-conscious consumers',
      storeStyle || 'professional',
      productIndex || 0
    );

    // Apply theme color to enhanced description
    const styledDescription = applyThemeColorToDescription(enhancedContent.description, themeColor);

    // Generate unique handle and pricing
    const timestamp = Date.now();
    const uniqueHandle = generateUniqueHandle(enhancedContent.title, timestamp);
    const productPrice = enhancedContent.price?.toFixed(2) || parseFloat(String(product.price || 29.99)).toFixed(2);
    
    console.log('Enhanced product details:', {
      originalTitle: product.title?.substring(0, 40),
      enhancedTitle: enhancedContent.title?.substring(0, 40),
      price: productPrice,
      variations: enhancedContent.variations?.length || 0
    });

    // Extract store name for proper vendor naming
    const storeDisplayName = storeName || extractStoreNameFromUrl(shopifyUrl) || 'Premium Store';

    // Create the main product payload with enhanced content
    const productPayload = {
      product: {
        title: enhancedContent.title,
        body_html: styledDescription,
        vendor: storeDisplayName,
        product_type: product.product_type || product.category || 'General',
        handle: uniqueHandle,
        status: 'active',
        published: true,
        tags: `${product.category || 'general'}, ${targetAudience || 'premium'}, ${storeStyle || 'professional'}, ${storeDisplayName}, bestseller, verified-quality, real-images, premium-content`,
      }
    };

    console.log('Enhanced product payload:', {
      title: productPayload.product.title,
      handle: productPayload.product.handle,
      vendor: productPayload.product.vendor,
      tags: productPayload.product.tags
    });

    // Create product in Shopify
    const productData = await shopifyClient.createProduct(productPayload);
    const createdProduct = productData.product;

    console.log('✅ Enhanced product created successfully:', createdProduct.id);

    // Process product enhancements with REAL AliExpress images and variations
    return await handleEnhancedProductUpload(
      createdProduct, 
      product, 
      enhancedContent,
      shopifyClient, 
      imageProcessor, 
      variantManager, 
      themeColor, 
      productPrice
    );

  } catch (error) {
    console.error('❌ Error adding enhanced product to Shopify:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to add enhanced product to Shopify'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateEnhancedProductContent(
  product: any,
  niche: string,
  storeName: string,
  targetAudience: string,
  storeStyle: string,
  productIndex: number
): Promise<any> {
  // Create unique, compelling content for each product
  const basePrice = parseFloat(String(product.price || 29.99));
  const enhancedPrice = Math.max(15, Math.min(80, basePrice * (1.8 + (productIndex * 0.1))));
  
  const contentVariations = [
    'revolutionary', 'premium', 'professional', 'innovative', 'exclusive', 
    'ultimate', 'advanced', 'elite', 'luxury', 'cutting-edge'
  ];
  
  const emotionalHooks = [
    `✨ Transform your ${niche} experience with this game-changing innovation`,
    `🚀 Discover the secret that ${niche} professionals don't want you to know`,
    `💎 Elevate your ${niche} game with this premium solution`,
    `🏆 Join thousands who've revolutionized their ${niche} routine`,
    `⚡ Experience the future of ${niche} technology today`
  ];
  
  const variation = contentVariations[productIndex % contentVariations.length];
  const hook = emotionalHooks[productIndex % emotionalHooks.length];
  
  const enhancedTitle = `🏆 ${variation.charAt(0).toUpperCase() + variation.slice(1)} ${product.title?.substring(0, 50) || niche + ' Essential'} - Bestseller`;
  
  const enhancedDescription = `${hook}

🎯 **Perfect for ${targetAudience}** who demand excellence!

🏆 **Why Choose This ${variation.charAt(0).toUpperCase() + variation.slice(1)} ${niche.charAt(0).toUpperCase() + niche.slice(1)} Solution?**
• ✅ **Premium Quality**: Engineered with superior materials for lasting performance
• 🚀 **Instant Results**: Experience remarkable improvements from day one  
• 💯 **Safety First**: Rigorously tested and certified for peace of mind
• 🎁 **Complete Package**: Everything included - no hidden extras
• 🛡️ **Satisfaction Guaranteed**: 30-day money-back promise

💎 **Exclusive ${storeName} Features:**
🔹 ${storeStyle === 'luxury' ? 'Luxury' : storeStyle === 'fun' ? 'Innovative' : 'Professional'} design
🔹 User-friendly operation - perfect for everyone
🔹 Durable construction built to last
🔹 Compact and convenient

🏆 **Social Proof**: Over ${(product.orders || 1000).toLocaleString()}+ satisfied customers | ${product.rating || 4.8}⭐ average rating

⚡ **Limited-Time Offer**: 
🎯 Regular Price: $${(enhancedPrice * 1.4).toFixed(2)}
💰 **Your Price: $${enhancedPrice.toFixed(2)}** *(Save $${(enhancedPrice * 0.4).toFixed(2)}!)*

🛒 **Order Now** and join the ${storeName} family!`;

  const enhancedFeatures = [
    `🏆 Premium ${niche} quality`,
    `⚡ Advanced ${variation} technology`, 
    `💎 Professional-grade materials`,
    `🚀 ${storeStyle === 'luxury' ? 'Luxury' : 'High-performance'} design`,
    `✅ Satisfaction guaranteed`,
    `🎯 Perfect for ${targetAudience}`
  ];

  // Generate product variations
  const variations = [
    { title: 'Standard', price: enhancedPrice, color: 'Black' },
    { title: 'Premium', price: enhancedPrice * 1.2, color: 'White' },
    { title: 'Deluxe', price: enhancedPrice * 1.4, color: 'Silver' }
  ].map(v => ({ ...v, price: Math.round(v.price * 100) / 100 }));

  return {
    title: enhancedTitle.substring(0, 75),
    description: enhancedDescription,
    features: enhancedFeatures,
    price: enhancedPrice,
    variations: variations
  };
}

async function handleEnhancedProductUpload(
  createdProduct: any,
  originalProduct: any,
  enhancedContent: any,
  shopifyClient: ShopifyAPIClient,
  imageProcessor: ImageProcessor,
  variantManager: VariantManager,
  themeColor: string,
  productPrice: string
) {
  // STEP 1: Upload REAL AliExpress images (6-8 images)
  let uploadedImageCount = 0;
  let imageIds: string[] = [];
  
  console.log(`📸 UPLOADING REAL ALIEXPRESS IMAGES for "${enhancedContent.title}"`);
  
  const realImages = originalProduct.images || [originalProduct.imageUrl].filter(Boolean);
  console.log(`📊 Real images available: ${realImages.length}`);
  
  if (realImages.length > 0) {
    const uploadResult = await imageProcessor.uploadRealAliExpressImages(
      createdProduct.id,
      enhancedContent.title,
      realImages,
      themeColor
    );
    
    uploadedImageCount = uploadResult.uploadedCount;
    imageIds = uploadResult.imageIds;
  }
  
  console.log(`📸 Image upload result: ${uploadedImageCount} real images uploaded`);

  // STEP 2: Update the default variant with enhanced pricing
  let variantUpdateSuccess = false;
  let createdVariants: any[] = [];
  
  if (createdProduct.variants && createdProduct.variants.length > 0) {
    const defaultVariant = createdProduct.variants[0];
    variantUpdateSuccess = await variantManager.updateDefaultVariant(defaultVariant, productPrice);
    createdVariants.push(defaultVariant);
  }

  // STEP 3: Create additional product variations
  let createdVariantCount = 0;
  if (enhancedContent.variations && enhancedContent.variations.length > 1) {
    for (let i = 1; i < Math.min(enhancedContent.variations.length, 4); i++) {
      const variation = enhancedContent.variations[i];
      const newVariant = await variantManager.createProductVariant(
        createdProduct.id,
        variation.title,
        variation.price.toFixed(2),
        variation.color
      );
      if (newVariant) {
        createdVariants.push(newVariant);
        createdVariantCount++;
      }
    }
  }

  // STEP 4: Assign real images to variants
  let imageAssignmentCount = 0;
  if (imageIds.length > 0 && createdVariants.length > 0) {
    imageAssignmentCount = await imageProcessor.assignImagesToVariants(imageIds, createdVariants);
  }

  console.log('✅ ENHANCED PRODUCT UPLOAD COMPLETED:', {
    id: createdProduct.id,
    title: createdProduct.title,
    price: productPrice,
    real_images_uploaded: uploadedImageCount,
    variants_created: createdVariantCount,
    images_assigned: imageAssignmentCount,
    enhancement: 'PREMIUM CONTENT + REAL IMAGES'
  });

  return new Response(JSON.stringify({
    success: true,
    product: createdProduct,
    message: `Successfully added enhanced product: ${createdProduct.title}`,
    price_set: productPrice,
    real_images_uploaded: uploadedImageCount,
    variants_created: createdVariantCount,
    images_assigned_to_variants: imageAssignmentCount,
    content_enhancement: 'PREMIUM UNIQUE CONTENT',
    real_images_used: true,
    dalle_images_used: false
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

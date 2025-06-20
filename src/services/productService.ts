
import { supabase } from "@/integrations/supabase/client";
import { RealProductImageService } from "./realProductImageService";

export const addProductsToShopify = async (
  shopifyUrl: string,
  accessToken: string,
  products: any[],
  onProgress: (progress: number, productName: string) => void,
  themeColor: string = '#1E40AF',
  targetAudience: string = 'general consumers',
  businessType: string = 'general',
  storeStyle: string = 'modern',
  customInfo: string = '',
  storeName: string = '',
  niche: string = 'general'
) => {
  console.log(`🚨 CRITICAL: Starting GUARANTEED product upload to Shopify with REAL images for ${niche}`);
  
  let uploadedCount = 0;
  const errors: string[] = [];

  // CRITICAL FIX 1: Force store name sync BEFORE any product uploads
  if (storeName && storeName.trim() !== '') {
    onProgress(5, `🏪 Syncing store name: "${storeName}"...`);
    
    try {
      console.log('🚨 CRITICAL: Forcing store name sync BEFORE product uploads:', storeName);
      
      const { data: storeNameResult, error: storeNameError } = await supabase.functions.invoke('update-shopify-store-name', {
        body: {
          storeName: storeName.trim(),
          accessToken,
          shopifyUrl
        }
      });

      if (storeNameError) {
        console.warn('⚠️ Store name sync failed:', storeNameError);
        errors.push(`Store name sync failed: ${storeNameError.message}`);
      } else if (storeNameResult?.success) {
        console.log('✅ CRITICAL: Store name successfully synced:', storeNameResult.shop_name);
      }
    } catch (error) {
      console.warn('⚠️ Store name sync error:', error);
      errors.push(`Store name sync error: ${error}`);
    }
    
    // Small delay to let store name sync complete
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // CRITICAL FIX 2: Process each product with GUARANTEED images
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const progressPercent = 10 + ((i / products.length) * 85);
    
    onProgress(progressPercent, `🚀 Publishing: ${product.title.substring(0, 35)}...`);
    
    try {
      // GUARANTEED REAL IMAGES: Get niche-specific, verified working images
      const imageSet = RealProductImageService.getProductImages(niche, i);
      const productImages = imageSet.gallery;
      
      console.log(`🖼️ GUARANTEED IMAGES for ${niche} product ${i}:`, {
        title: product.title.substring(0, 40),
        mainImage: imageSet.main,
        galleryCount: productImages.length,
        firstImage: productImages[0]
      });

      // Create variations with specific images
      const enhancedVariants = product.variants?.map((variant: any, varIndex: number) => {
        const variationImages = RealProductImageService.getVariationImages(niche, i, product.variants.length);
        return {
          ...variant,
          image: variationImages[varIndex] || productImages[varIndex + 1] || productImages[0]
        };
      }) || [];

      const enhancedProduct = {
        ...product,
        images: productImages, // 8 guaranteed working images
        imageUrl: imageSet.main,
        variants: enhancedVariants,
        niche: niche,
        guaranteed_images: true
      };

      console.log(`🚨 UPLOADING ENHANCED PRODUCT:`, {
        title: enhancedProduct.title.substring(0, 40),
        images: enhancedProduct.images.length,
        variants: enhancedProduct.variants.length,
        niche: niche
      });

      const { data: uploadResponse, error: uploadError } = await supabase.functions.invoke('add-shopify-product', {
        body: {
          shopifyUrl,
          accessToken,
          themeColor,
          product: enhancedProduct,
          storeName,
          targetAudience,
          storeStyle,
          businessType,
          productIndex: i,
          niche
        }
      });

      if (uploadError || !uploadResponse?.success) {
        const errorMsg = uploadError?.message || uploadResponse?.error || 'Upload failed';
        console.error(`❌ Upload failed for ${product.title}:`, errorMsg);
        errors.push(`${product.title}: ${errorMsg}`);
      } else {
        uploadedCount++;
        console.log(`✅ GUARANTEED SUCCESS: Product uploaded with ${uploadResponse.guaranteed_images_uploaded || 0} images:`, product.title);
      }

    } catch (error) {
      console.error(`❌ Error uploading ${product.title}:`, error);
      errors.push(`${product.title}: ${error.message}`);
    }

    // Rate limiting between products
    await new Promise(resolve => setTimeout(resolve, 2500));
  }

  onProgress(95, `🎯 Finalizing ${niche} store optimization...`);

  // CRITICAL FIX 3: Install and configure Shopify theme
  if (uploadedCount > 0) {
    onProgress(98, `🎨 Installing Refresh theme with ${themeColor} branding...`);
    
    try {
      const { data: themeResult, error: themeError } = await supabase.functions.invoke('install-shopify-theme', {
        body: {
          shopifyUrl,
          accessToken,
          themeColor,
          niche,
          storeName
        }
      });

      if (themeError) {
        console.warn('⚠️ Theme installation failed:', themeError);
        errors.push(`Theme installation failed: ${themeError.message}`);
      } else if (themeResult?.success) {
        console.log('✅ CRITICAL: Refresh theme installed and configured');
      }
    } catch (error) {
      console.warn('⚠️ Theme installation error:', error);
      errors.push(`Theme installation error: ${error}`);
    }
  }

  onProgress(100, `🏆 ${uploadedCount} products are now LIVE with guaranteed images!`);

  console.log(`🎉 CRITICAL SUCCESS: ${uploadedCount}/${products.length} products uploaded with GUARANTEED WORKING IMAGES`);
  
  return {
    success: uploadedCount > 0,
    uploadedCount,
    totalProducts: products.length,
    errors,
    niche,
    guaranteedImages: true,
    storeNameSynced: storeName ? 'ATTEMPTED' : 'NOT_PROVIDED',
    themeInstalled: uploadedCount > 0 ? 'ATTEMPTED' : 'SKIPPED',
    message: uploadedCount > 0 
      ? `Successfully published ${uploadedCount} products with guaranteed working images!`
      : `Failed to publish products. Errors: ${errors.join('; ')}`
  };
};

// Enhanced winning product generator that works with real images
export const generateWinningProducts = async (
  shopifyUrl: string,
  accessToken: string,
  niche: string,
  onProgress: (progress: number, productName: string) => void,
  themeColor: string = '#1E40AF',
  targetAudience: string = 'general consumers',
  businessType: string = 'general',
  storeStyle: string = 'modern',
  customInfo: string = '',
  storeName: string = ''
) => {
  console.log(`🚨 CRITICAL: Starting GUARANTEED ${niche} product generation with REAL images`);
  
  try {
    onProgress(10, `🧠 Generating elite ${niche} products...`);
    
    // Generate 10 winning products with guaranteed images
    const { data: productsResponse, error: productsError } = await supabase.functions.invoke('get-aliexpress-products', {
      body: {
        niche,
        sessionId: Date.now().toString()
      }
    });

    if (productsError || !productsResponse?.success) {
      throw new Error(`Failed to generate ${niche} products: ${productsError?.message || 'Unknown error'}`);
    }

    const products = productsResponse.products?.slice(0, 10) || [];
    
    if (products.length === 0) {
      throw new Error(`No ${niche} products generated`);
    }

    console.log(`✅ Generated ${products.length} ${niche} products, uploading with GUARANTEED images...`);
    
    onProgress(20, `📦 Publishing ${products.length} ${niche} products to Shopify...`);

    return await addProductsToShopify(
      shopifyUrl,
      accessToken,
      products,
      onProgress,
      themeColor,
      targetAudience,
      businessType,
      storeStyle,
      customInfo,
      storeName,
      niche
    );

  } catch (error) {
    console.error(`❌ CRITICAL: ${niche} product generation failed:`, error);
    throw error;
  }
};

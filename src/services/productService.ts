
import { supabase } from "@/integrations/supabase/client";
import { RealAliExpressImageService } from "./realAliExpressImageService";
import { EnhancedProductGenerator } from "./enhancedProductGenerator";

export const generateWinningProducts = async (
  shopifyUrl: string,
  accessToken: string,
  niche: string,
  progressCallback: (progress: number, productName: string) => void,
  themeColor: string,
  targetAudience: string,
  businessType: string,
  storeStyle: string,
  customInfo: string,
  storeName: string
): Promise<void> => {
  console.log(`🚀 GENERATING WINNING PRODUCTS: Starting for ${niche} with real AliExpress images`);
  console.log('Store customization details:', {
    storeName,
    businessType,
    storeStyle,
    targetAudience,
    themeColor
  });

  try {
    // Step 1: Get winning products from AliExpress API
    progressCallback(10, `Analyzing trending ${niche} products...`);
    
    const { data: productsData, error: productsError } = await supabase.functions.invoke('get-aliexpress-products', {
      body: {
        niche: niche,
        sessionId: `${Date.now()}_${niche}`
      }
    });

    if (productsError || !productsData?.success) {
      throw new Error(`Failed to fetch products: ${productsError?.message || 'Unknown error'}`);
    }

    const products = productsData.products || [];
    console.log(`✅ PRODUCTS FETCHED: ${products.length} winning products for ${niche}`);

    if (products.length === 0) {
      throw new Error(`No products found for niche: ${niche}`);
    }

    // Step 2: Process and upload products with enhanced content
    const selectedProducts = products.slice(0, 10); // Take first 10 products
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < selectedProducts.length; i++) {
      const product = selectedProducts[i];
      const progress = 20 + ((i / selectedProducts.length) * 70);
      
      progressCallback(progress, `Creating "${product.title?.substring(0, 40)}..."`);
      
      try {
        console.log(`🚨 PROCESSING PRODUCT ${i + 1}/10: "${product.title}" with real images`);

        // Generate business model and store style specific content
        const businessContent = EnhancedProductGenerator.generateBusinessModelContent(
          businessType, 
          product.title, 
          niche
        );
        
        const storeStyleData = EnhancedProductGenerator.generateStoreStyleContent(
          storeStyle, 
          product.title
        );

        // Generate smart variations based on niche
        const smartVariations = EnhancedProductGenerator.generateSmartVariations(
          product.title,
          niche,
          product.price || 29.99
        );

        // Get trust signals
        const trustSignals = EnhancedProductGenerator.generateTrustSignals(niche);

        // Enhanced product with real AliExpress images
        const enhancedProduct = {
          ...product,
          description: `${businessContent.description}\n\n${trustSignals.join('\n')}\n\n🚚 **Fast & Free Shipping** | 🔒 **Secure Checkout** | 📞 **24/7 Support**`,
          images: RealAliExpressImageService.getRealProductImages(niche, i, product.title),
          variants: smartVariations.length > 0 ? smartVariations : product.variants,
          category: niche,
          businessModel: businessType,
          storeStyle: storeStyle,
          originalData: {
            ...product.originalData,
            real_aliexpress_images: true,
            business_model: businessType,
            store_style: storeStyle,
            enhanced_content: true
          }
        };

        console.log(`📸 REAL IMAGES ASSIGNED: ${enhancedProduct.images.length} real AliExpress images for product ${i + 1}`);

        // Upload to Shopify with all customizations
        const { data: uploadResult, error: uploadError } = await supabase.functions.invoke('add-shopify-product', {
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

        if (uploadError || !uploadResult?.success) {
          console.error(`❌ PRODUCT ${i + 1} FAILED:`, uploadError?.message || 'Upload failed');
          failureCount++;
          continue;
        }

        successCount++;
        console.log(`✅ PRODUCT ${i + 1} SUCCESS: "${product.title}" with ${uploadResult.real_images_uploaded || 0} real images`);

        // Rate limiting between products
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ ERROR processing product ${i + 1}:`, error);
        failureCount++;
      }
    }

    progressCallback(100, "Products uploaded successfully!");

    console.log(`🎉 WINNING PRODUCTS GENERATION COMPLETE:`, {
      niche,
      total: selectedProducts.length,
      success: successCount,
      failed: failureCount,
      businessModel: businessType,
      storeStyle: storeStyle,
      realImages: true,
      storeName: storeName
    });

    if (successCount === 0) {
      throw new Error(`Failed to upload any products for ${niche}. Please check your Shopify credentials.`);
    }

  } catch (error) {
    console.error(`❌ CRITICAL ERROR in generateWinningProducts:`, error);
    throw error;
  }
};

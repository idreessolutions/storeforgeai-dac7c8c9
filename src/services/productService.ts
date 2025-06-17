import { supabase } from "@/integrations/supabase/client";
import { AliExpressService } from "./aliexpressService";

export const addProductsToShopify = async (
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
  console.log(`🚀 Starting REAL AliExpress integration with SMART PRICING for ${niche} products:`, {
    niche,
    targetAudience,
    businessType,
    storeStyle,
    storeName,
    themeColor,
    qualityStandards: 'AliExpress API: Real images, 1000+ orders, 4.6+ ratings, Smart pricing $15-$80'
  });
  
  try {
    // Get session ID for AliExpress token lookup
    const sessionId = crypto.randomUUID();
    
    // Step 1: Fetch REAL winning products from AliExpress Drop Shipping API
    onProgress(15, `Connecting to AliExpress API for premium ${niche} products with real images...`);
    
    const aliExpressService = new AliExpressService();
    const realProducts = await aliExpressService.fetchWinningProducts(niche, 10, sessionId);
    
    if (!realProducts || realProducts.length === 0) {
      throw new Error(`No winning ${niche} products found from AliExpress API meeting quality standards (1000+ orders, 4.6+ ratings, real images).`);
    }

    console.log(`✅ Found ${realProducts.length} REAL winning ${niche} products with verified images from AliExpress API`);
    onProgress(25, `Found ${realProducts.length} winning ${niche} products with real images! Enhancing with GPT-4...`);

    // Validate that products have images
    const productsWithImages = realProducts.filter(product => 
      product.imageUrl || (product.images && product.images.length > 0)
    );
    
    if (productsWithImages.length === 0) {
      throw new Error(`No ${niche} products found with valid images from AliExpress API`);
    }

    console.log(`🖼️ ${productsWithImages.length} products have valid images for upload`);

    // Step 2: Process each product with GPT-4 AI enhancement (keeping real images)
    const processedProducts = [];
    
    for (let i = 0; i < productsWithImages.length; i++) {
      const product = productsWithImages[i];
      const progressPercent = 25 + ((i / productsWithImages.length) * 50);
      
      onProgress(progressPercent, `GPT-4 enhancing ${niche} product: ${product.title.substring(0, 50)}... (Real images preserved)`);
      console.log(`🤖 GPT-4 processing ${niche} product ${i + 1}/${productsWithImages.length}: ${product.title} (Real images: ${product.images?.length || 1})`);

      try {
        // Generate AI-enhanced content with GPT-4 while preserving real images
        const { data: aiResponse, error: aiError } = await supabase.functions.invoke('generate-products', {
          body: {
            realProduct: product,
            niche: niche,
            targetAudience,
            businessType,
            storeStyle,
            themeColor,
            customInfo,
            storeName,
            productIndex: i,
            sessionId: sessionId,
            useRealImages: true, // Enforce real image usage
            qualityRequirements: {
              rating: '4.6+',
              orders: '1000+',
              source: 'AliExpress Drop Shipping API',
              images: 'Real AliExpress images only',
              descriptionLength: '400-600 words with emojis',
              smartPricing: '$15-$80 range enforced'
            }
          }
        });

        if (aiError) {
          console.error(`❌ GPT-4 processing failed for ${niche} product ${i + 1}:`, aiError);
          throw new Error(`GPT-4 processing failed for ${niche} product: ${aiError.message}`);
        }

        if (!aiResponse?.success || !aiResponse?.optimizedProduct) {
          console.error(`❌ Invalid GPT-4 response for ${niche} product ${i + 1}:`, aiResponse);
          throw new Error(`Invalid GPT-4 response for ${niche} product`);
        }

        const optimizedProduct = aiResponse.optimizedProduct;
        
        // Ensure real images are preserved and validate
        if (product.imageUrl && !optimizedProduct.imageUrl) {
          optimizedProduct.imageUrl = product.imageUrl;
        }
        if (product.images && product.images.length > 0) {
          optimizedProduct.images = product.images;
        }
        
        // Validate that the product has images
        if (!optimizedProduct.imageUrl && (!optimizedProduct.images || optimizedProduct.images.length === 0)) {
          console.error(`🚨 Product ${optimizedProduct.title} has no images - this is critical!`);
          // Skip products without images
          continue;
        }
        
        // Validate smart pricing is within range
        if (optimizedProduct.price > 80) {
          console.log(`⚠️ Price ${optimizedProduct.price} exceeds $80, adjusting to $79.99`);
          optimizedProduct.price = 79.99;
        } else if (optimizedProduct.price < 15) {
          console.log(`⚠️ Price ${optimizedProduct.price} below $15, adjusting to $15.99`);
          optimizedProduct.price = 15.99;
        }
        
        processedProducts.push(optimizedProduct);
        console.log(`✅ ${niche} product ${i + 1} enhanced with GPT-4: ${optimizedProduct.title} (Real images: ${optimizedProduct.images?.length || 1}, Price: $${optimizedProduct.price})`);

        // Rate limiting between AI calls
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ Error processing ${niche} product ${i + 1}:`, error);
        // Continue with other products instead of failing completely
        continue;
      }
    }

    if (processedProducts.length === 0) {
      throw new Error(`Failed to process any ${niche} products with GPT-4 enhancement and valid images`);
    }

    onProgress(75, `Uploading ${processedProducts.length} AI-enhanced ${niche} products with real images and theme color to Shopify...`);

    // Step 3: Upload all products to Shopify with real images and theme color
    let uploadedCount = 0;
    const uploadErrors = [];

    for (let i = 0; i < processedProducts.length; i++) {
      const product = processedProducts[i];
      const progressPercent = 75 + ((i / processedProducts.length) * 20);
      
      onProgress(progressPercent, `Uploading ${niche} product with theme color: ${product.title.substring(0, 40)}...`);
      console.log(`📦 Uploading ${niche} product ${i + 1}/${processedProducts.length}: ${product.title} (Theme: ${themeColor}, Price: $${product.price})`);

      try {
        const { data: uploadResponse, error: uploadError } = await supabase.functions.invoke('add-shopify-product', {
          body: {
            shopifyUrl,
            accessToken,
            themeColor,
            product: {
              ...product,
              niche: niche,
              category: product.category || niche,
              tags: `${niche}, ${targetAudience}, ${storeStyle}, ${storeName}, winning-product, best-seller, AliExpress-verified, real-images, theme-color-applied, smart-priced`,
              theme_color: themeColor,
              real_images_used: true,
              dalle_images_used: false,
              smart_pricing_applied: true
            }
          }
        });

        if (uploadError) {
          console.error(`❌ Upload failed for ${niche} product ${product.title}:`, uploadError);
          uploadErrors.push(`${product.title}: ${uploadError.message}`);
          continue;
        }

        if (uploadResponse && uploadResponse.success) {
          uploadedCount++;
          console.log(`✅ Successfully uploaded ${niche} winning product with theme color and smart pricing: ${product.title}`);
          console.log(`🎨 Theme color ${themeColor} applied successfully`);
          console.log(`📸 Real images used: ${uploadResponse.real_images_used ? 'YES' : 'NO'}`);
          console.log(`💰 Smart pricing applied: $${product.price} (within $15-$80 range)`);
        } else {
          console.error(`❌ Upload failed for ${niche} product ${product.title}:`, uploadResponse?.error);
          uploadErrors.push(`${product.title}: ${uploadResponse?.error || 'Unknown error'}`);
        }

        // Rate limiting between uploads
        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (productError) {
        console.error(`❌ Error uploading ${niche} product ${product.title}:`, productError);
        uploadErrors.push(`${product.title}: ${productError.message}`);
        continue;
      }
    }

    onProgress(95, `Finalizing ${niche} store with theme color integration...`);

    if (uploadedCount === 0) {
      throw new Error(`Failed to upload any ${niche} winning products. Errors: ${uploadErrors.join('; ')}`);
    }

    onProgress(100, `${niche} store with real AliExpress products and smart pricing complete!`);
    
    console.log(`🎉 Successfully uploaded ${uploadedCount}/${processedProducts.length} AliExpress winning ${niche} products to Shopify`);
    console.log(`🎨 Theme color ${themeColor} applied to all products`);
    console.log(`📸 Real AliExpress images used exclusively (no DALL-E)`);
    console.log(`💰 Smart pricing applied: All products priced between $15-$80`);
    
    if (uploadErrors.length > 0) {
      console.warn(`⚠️ Some ${niche} product uploads failed:`, uploadErrors);
    }
    
    return {
      success: true,
      uploadedCount,
      totalProducts: processedProducts.length,
      errors: uploadErrors,
      niche: niche,
      source: 'AliExpress Drop Shipping API',
      qualityStandards: '1000+ orders, 4.6+ ratings, Real images only',
      theme_color_applied: themeColor,
      real_images_used: true,
      dalle_images_used: false,
      smart_pricing_applied: true,
      price_range: '$15-$80',
      message: `Successfully added ${uploadedCount} winning ${niche} products from AliExpress API with real images, smart pricing ($15-$80), and ${themeColor} theme color to your store!`
    };

  } catch (error) {
    console.error(`❌ AliExpress ${niche} product generation with smart pricing failed:`, error);
    throw error;
  }
};

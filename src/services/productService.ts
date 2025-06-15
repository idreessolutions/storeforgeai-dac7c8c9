
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
  console.log(`🚀 Starting REAL ${niche} product generation with NICHE-SPECIFIC requirements:`, {
    niche,
    targetAudience,
    businessType,
    storeStyle,
    storeName,
    qualityStandards: '4.8+ rating, 1000+ orders'
  });
  
  try {
    // Step 1: Get RapidAPI key and validate
    onProgress(5, `Connecting to AliExpress API for premium ${niche} products...`);
    
    const rapidApiKey = await getRapidApiKey();
    if (!rapidApiKey) {
      throw new Error('RapidAPI key not configured for AliExpress integration');
    }

    // Step 2: Fetch REAL winning products from AliExpress for the SPECIFIC NICHE
    onProgress(15, `Searching for 10 premium ${niche} products with 4.8+ ratings and 1000+ orders...`);
    
    const aliExpressService = new AliExpressService(rapidApiKey);
    const realProducts = await aliExpressService.fetchWinningProducts(niche, 10);
    
    if (!realProducts || realProducts.length === 0) {
      throw new Error(`No premium ${niche} products found matching our quality standards (4.8+ rating, 1000+ orders). Please try again.`);
    }

    console.log(`✅ Found ${realProducts.length} REAL premium ${niche} products matching quality standards`);
    onProgress(25, `Found ${realProducts.length} premium ${niche} products! Processing with AI enhancement...`);

    // Step 3: Process each product with NICHE-SPECIFIC AI enhancement
    const processedProducts = [];
    
    for (let i = 0; i < realProducts.length; i++) {
      const product = realProducts[i];
      const progressPercent = 25 + ((i / realProducts.length) * 50);
      
      onProgress(progressPercent, `AI enhancing ${niche} product: ${product.title.substring(0, 50)}...`);
      console.log(`🤖 Processing ${niche} product ${i + 1}/${realProducts.length}: ${product.title}`);

      try {
        // Generate AI-enhanced content with NICHE-SPECIFIC focus
        const { data: aiResponse, error: aiError } = await supabase.functions.invoke('generate-products', {
          body: {
            realProduct: product,
            niche: niche, // ENSURE NICHE IS RESPECTED
            targetAudience,
            businessType,
            storeStyle,
            themeColor,
            customInfo,
            storeName,
            productIndex: i,
            qualityRequirements: {
              rating: '4.8+',
              orders: '1000+',
              images: '6-8 per product',
              descriptionLength: '500-800 words'
            }
          }
        });

        if (aiError) {
          console.error(`❌ AI processing failed for ${niche} product ${i + 1}:`, aiError);
          throw new Error(`AI processing failed for ${niche} product: ${aiError.message}`);
        }

        if (!aiResponse?.success || !aiResponse?.optimizedProduct) {
          console.error(`❌ Invalid AI response for ${niche} product ${i + 1}:`, aiResponse);
          throw new Error(`Invalid AI response for ${niche} product`);
        }

        // Verify the product matches the niche
        const optimizedProduct = aiResponse.optimizedProduct;
        if (!optimizedProduct.category?.toLowerCase().includes(niche.toLowerCase()) && 
            !optimizedProduct.title?.toLowerCase().includes(niche.toLowerCase())) {
          console.warn(`⚠️ Product may not match ${niche} niche, but proceeding...`);
        }

        processedProducts.push(optimizedProduct);
        console.log(`✅ ${niche} product ${i + 1} enhanced successfully: ${optimizedProduct.title}`);

        // Rate limiting between AI calls
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ Error processing ${niche} product ${i + 1}:`, error);
        throw new Error(`Failed to process ${niche} product: ${product.title}`);
      }
    }

    if (processedProducts.length === 0) {
      throw new Error(`Failed to process any ${niche} products with AI enhancement`);
    }

    onProgress(75, `Uploading ${processedProducts.length} premium ${niche} products to Shopify...`);

    // Step 4: Upload all NICHE-SPECIFIC products to Shopify
    let uploadedCount = 0;
    const uploadErrors = [];

    for (let i = 0; i < processedProducts.length; i++) {
      const product = processedProducts[i];
      const progressPercent = 75 + ((i / processedProducts.length) * 20);
      
      onProgress(progressPercent, `Uploading ${niche} product: ${product.title.substring(0, 40)}...`);
      console.log(`📦 Uploading ${niche} product ${i + 1}/${processedProducts.length}: ${product.title}`);

      try {
        const { data: uploadResponse, error: uploadError } = await supabase.functions.invoke('add-shopify-product', {
          body: {
            shopifyUrl,
            accessToken,
            themeColor,
            product: {
              ...product,
              niche: niche, // ENSURE NICHE IS PRESERVED
              category: product.category || niche,
              tags: `${niche}, ${targetAudience}, ${storeStyle}, ${storeName}, premium, quality verified, bestseller`
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
          console.log(`✅ Successfully uploaded ${niche} product: ${product.title}`);
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

    onProgress(95, `Finalizing ${niche} store setup...`);

    if (uploadedCount === 0) {
      throw new Error(`Failed to upload any ${niche} products. Errors: ${uploadErrors.join('; ')}`);
    }

    onProgress(100, `${niche} store setup complete!`);
    
    console.log(`🎉 Successfully uploaded ${uploadedCount}/${processedProducts.length} premium ${niche} products to Shopify`);
    
    if (uploadErrors.length > 0) {
      console.warn(`⚠️ Some ${niche} product uploads failed:`, uploadErrors);
    }
    
    return {
      success: true,
      uploadedCount,
      totalProducts: processedProducts.length,
      errors: uploadErrors,
      niche: niche,
      message: `Successfully added ${uploadedCount} premium ${niche} products with 4.8+ ratings and 1000+ orders to your store!`
    };

  } catch (error) {
    console.error(`❌ Premium ${niche} product generation workflow failed:`, error);
    throw error;
  }
};

async function getRapidApiKey(): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('get-rapidapi-key');
    if (!error && data?.rapidApiKey) {
      return data.rapidApiKey;
    }
  } catch (error) {
    console.warn('Could not retrieve RapidAPI key:', error);
  }
  
  return null;
}

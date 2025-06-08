
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
  customInfo: string = ''
) => {
  console.log(`🚀 Starting REAL ${niche} product generation workflow with full AI integration`);
  
  try {
    // Step 1: Get RapidAPI key and validate
    onProgress(5, `Connecting to AliExpress API for ${niche} products...`);
    
    const rapidApiKey = await getRapidApiKey();
    if (!rapidApiKey) {
      throw new Error('RapidAPI key not configured for AliExpress integration');
    }

    // Step 2: Fetch REAL winning products from AliExpress
    onProgress(15, `Searching for 10 winning ${niche} products on AliExpress...`);
    
    const aliExpressService = new AliExpressService(rapidApiKey);
    const realProducts = await aliExpressService.fetchWinningProducts(niche, 10);
    
    if (!realProducts || realProducts.length === 0) {
      throw new Error(`No winning ${niche} products found on AliExpress. Please try again.`);
    }

    console.log(`✅ Found ${realProducts.length} REAL winning ${niche} products from AliExpress`);
    onProgress(25, `Found ${realProducts.length} winning ${niche} products! Processing with AI...`);

    // Step 3: Process each product with full AI enhancement
    const processedProducts = [];
    
    for (let i = 0; i < realProducts.length; i++) {
      const product = realProducts[i];
      const progressPercent = 25 + ((i / realProducts.length) * 50);
      
      onProgress(progressPercent, `AI processing: ${product.title.substring(0, 50)}...`);
      console.log(`🤖 Processing product ${i + 1}/${realProducts.length}: ${product.title}`);

      try {
        // Generate AI-enhanced content
        const { data: aiResponse, error: aiError } = await supabase.functions.invoke('generate-products', {
          body: {
            realProduct: product,
            niche,
            targetAudience,
            businessType,
            storeStyle,
            themeColor,
            customInfo,
            productIndex: i
          }
        });

        if (aiError) {
          console.error(`❌ AI processing failed for product ${i + 1}:`, aiError);
          throw new Error(`AI processing failed: ${aiError.message}`);
        }

        if (!aiResponse?.success || !aiResponse?.optimizedProduct) {
          console.error(`❌ Invalid AI response for product ${i + 1}:`, aiResponse);
          throw new Error('Invalid AI response received');
        }

        processedProducts.push(aiResponse.optimizedProduct);
        console.log(`✅ AI processing complete for product ${i + 1}: ${aiResponse.optimizedProduct.title}`);

        // Rate limiting between AI calls
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ Error processing product ${i + 1}:`, error);
        throw new Error(`Failed to process ${niche} product: ${product.title}`);
      }
    }

    if (processedProducts.length === 0) {
      throw new Error(`Failed to process any ${niche} products with AI`);
    }

    onProgress(75, `Uploading ${processedProducts.length} AI-enhanced ${niche} products to Shopify...`);

    // Step 4: Upload all products to Shopify
    let uploadedCount = 0;
    const uploadErrors = [];

    for (let i = 0; i < processedProducts.length; i++) {
      const product = processedProducts[i];
      const progressPercent = 75 + ((i / processedProducts.length) * 20);
      
      onProgress(progressPercent, `Uploading: ${product.title.substring(0, 40)}...`);
      console.log(`📦 Uploading product ${i + 1}/${processedProducts.length}: ${product.title}`);

      try {
        const { data: uploadResponse, error: uploadError } = await supabase.functions.invoke('add-shopify-product', {
          body: {
            shopifyUrl,
            accessToken,
            themeColor,
            product
          }
        });

        if (uploadError) {
          console.error(`❌ Upload failed for product ${product.title}:`, uploadError);
          uploadErrors.push(`${product.title}: ${uploadError.message}`);
          continue;
        }

        if (uploadResponse && uploadResponse.success) {
          uploadedCount++;
          console.log(`✅ Successfully uploaded: ${product.title}`);
        } else {
          console.error(`❌ Upload failed for ${product.title}:`, uploadResponse?.error);
          uploadErrors.push(`${product.title}: ${uploadResponse?.error || 'Unknown error'}`);
        }

        // Rate limiting between uploads
        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (productError) {
        console.error(`❌ Error uploading product ${product.title}:`, productError);
        uploadErrors.push(`${product.title}: ${productError.message}`);
        continue;
      }
    }

    onProgress(95, 'Finalizing store setup...');

    if (uploadedCount === 0) {
      throw new Error(`Failed to upload any ${niche} products. Errors: ${uploadErrors.join('; ')}`);
    }

    onProgress(100, 'Store setup complete!');
    
    console.log(`🎉 Successfully uploaded ${uploadedCount}/${processedProducts.length} real ${niche} products to Shopify`);
    
    if (uploadErrors.length > 0) {
      console.warn(`⚠️ Some uploads failed:`, uploadErrors);
    }
    
    return {
      success: true,
      uploadedCount,
      totalProducts: processedProducts.length,
      errors: uploadErrors,
      message: `Successfully added ${uploadedCount} real winning ${niche} products with AI enhancement to your store!`
    };

  } catch (error) {
    console.error(`❌ Real ${niche} product generation workflow failed:`, error);
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

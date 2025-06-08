
import { supabase } from "@/integrations/supabase/client";

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
  console.log(`🚀 Starting AI-powered product generation for ${niche} niche`);
  
  try {
    // Step 1: Generate products using AI and real data
    onProgress(10, 'AI is analyzing trending market data...');
    
    console.log('📡 Calling generate-products edge function with:', {
      niche,
      targetAudience,
      businessType,
      storeStyle,
      themeColor,
      customInfo
    });

    // Add timeout and retry logic for the edge function call
    let generateResponse: any, generateError: any;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const response = await Promise.race([
          supabase.functions.invoke('generate-products', {
            body: {
              niche,
              targetAudience,
              businessType,
              storeStyle,
              themeColor,
              customInfo
            }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 180000) // 3 minutes timeout
          )
        ]) as { data: any; error: any };

        generateResponse = response.data;
        generateError = response.error;
        break;
      } catch (error) {
        retryCount++;
        console.warn(`Attempt ${retryCount} failed:`, error);
        
        if (retryCount < maxRetries) {
          onProgress(10 + (retryCount * 5), `Retrying connection... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        } else {
          throw error;
        }
      }
    }

    if (generateError) {
      console.error('❌ Product generation failed:', generateError);
      throw new Error(`AI product generation failed: ${generateError.message}`);
    }

    if (!generateResponse || !generateResponse.success) {
      console.error('❌ Invalid generate response:', generateResponse);
      throw new Error(`AI failed to generate products: ${generateResponse?.error || 'Unknown error'}`);
    }

    const products = generateResponse.products;
    if (!products || products.length === 0) {
      throw new Error(`No trending ${niche} products found. Please try again.`);
    }

    console.log(`✅ Generated ${products.length} AI-optimized ${niche} products`);
    onProgress(30, 'AI has selected winning products...');

    // Step 2: Upload each product to Shopify
    const totalProducts = products.length;
    let uploadedCount = 0;

    for (let i = 0; i < totalProducts; i++) {
      const product = products[i];
      const progressPercent = 30 + ((i / totalProducts) * 65);
      
      onProgress(progressPercent, `Creating: ${product.title}`);
      console.log(`📦 Uploading product ${i + 1}/${totalProducts}: ${product.title}`);

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
          console.error(`❌ Failed to upload product ${product.title}:`, uploadError);
          continue;
        }

        if (uploadResponse && uploadResponse.success) {
          uploadedCount++;
          console.log(`✅ Successfully uploaded: ${product.title}`);
        } else {
          console.error(`❌ Upload failed for ${product.title}:`, uploadResponse?.error);
        }

        // Small delay between uploads to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (productError) {
        console.error(`❌ Error uploading product ${product.title}:`, productError);
        continue;
      }
    }

    onProgress(95, 'Finalizing store setup...');

    if (uploadedCount === 0) {
      throw new Error(`Failed to upload any ${niche} products. Please check your Shopify credentials and try again.`);
    }

    onProgress(100, 'Store setup complete!');
    
    console.log(`🎉 Successfully uploaded ${uploadedCount}/${totalProducts} ${niche} products to Shopify`);
    
    return {
      success: true,
      uploadedCount,
      totalProducts,
      message: `Successfully added ${uploadedCount} trending ${niche} products to your store!`
    };

  } catch (error) {
    console.error(`❌ Product generation workflow failed for ${niche}:`, error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('NetworkError')) {
        throw new Error('Connection timeout. Please check your internet connection and try again.');
      } else if (error.message.includes('Failed to send a request to the Edge Function')) {
        throw new Error('Unable to connect to AI services. Please try again in a moment.');
      } else {
        throw error;
      }
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

import { supabase } from "@/integrations/supabase/client";

export const generateCuratedProducts = async (
  shopifyUrl: string,
  accessToken: string,
  niche: string,
  progressCallback: (progress: number, productName: string) => void,
  themeColor: string,
  storeName: string
): Promise<void> => {
  console.log(`🚀 CURATED PRODUCTS: Starting upload for ${niche} with theme color ${themeColor}`);

  try {
    // Step 1: Validate inputs
    progressCallback(10, `Preparing curated ${niche} products...`);
    
    if (!shopifyUrl || !accessToken) {
      throw new Error('Shopify credentials are required');
    }

    // Step 2: Call the updated curated products Edge Function with better error handling
    progressCallback(20, `Loading premium ${niche} products from storage...`);
    
    console.log('📡 Calling Edge Function with request:', {
      niche,
      shopifyUrl: shopifyUrl.substring(0, 30) + '...',
      themeColor,
      storeName,
      limit: 10
    });

    let uploadResult: any = null; 
    let uploadError: any = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      const { data, error } = await supabase.functions.invoke('upload-curated-products', {
        body: {
          niche,
          shopifyUrl,
          shopifyAccessToken: accessToken,
          themeColor,
          storeName,
          limit: 10,
          aiContent: false // fast, curated content path to avoid timeouts
        }
      });
      uploadResult = data;
      uploadError = error;

      if (!uploadError) break;

      const msg = uploadError?.message || '';
      if (msg.includes('Failed to send a request') || msg.includes('NetworkError') || msg.includes('timeout')) {
        console.warn(`⚠️ Edge function timeout/network issue (attempt ${attempt}/3). Retrying...`);
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
      break; // other errors - don't keep retrying
    }

    console.log('📨 Edge Function response:', { uploadResult, uploadError });

    // Handle various error scenarios
    if (uploadError) {
      console.error('❌ Edge Function error:', uploadError);
      throw new Error(`Edge Function error: ${uploadError.message || 'Unknown edge function error'}`);
    }

    if (!uploadResult) {
      throw new Error('No response received from Edge Function');
    }

    if (!uploadResult.success) {
      console.error('❌ Upload not successful:', uploadResult);
      throw new Error(`Upload failed: ${uploadResult.error || uploadResult.message || 'Unknown upload error'}`);
    }

    // Step 3: Process results with progress updates
    const results = uploadResult.results || [];
    const successCount = uploadResult.uploadedCount || 0;
    const targetCount = uploadResult.targetCount || 10;
    
    console.log(`📊 Processing ${results.length} results, ${successCount} successful uploads`);

    // CRITICAL: Validate that products were actually uploaded
    if (successCount === 0) {
      console.error('❌ No products were uploaded - Edge Function may have failed silently');
      throw new Error(
        `No products were uploaded to your store. This might be due to:\n` +
        `• Invalid Shopify credentials\n` +
        `• Missing products in the ${niche} bucket\n` +
        `• Network connectivity issues\n\n` +
        `Please check your Shopify URL and access token, then try again.`
      );
    }

    // Ensure we show progress for exactly 10 products
    const progressStep = 60 / Math.max(targetCount, 1);
    
    for (let i = 0; i < Math.max(results.length, targetCount); i++) {
      const progress = 30 + (i * progressStep);
      
      if (i < results.length) {
        const result = results[i];
        if (result.success) {
          progressCallback(progress, `✅ Product ${i + 1}/10: ${result.title?.substring(0, 35)}...`);
        } else {
          progressCallback(progress, `⚠️ Product ${i + 1}/10: Processing...`);
        }
      } else {
        progressCallback(progress, `🔄 Product ${i + 1}/10: Finalizing...`);
      }
      
      // Small delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    progressCallback(95, `Applying ${themeColor} theme color...`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Final success message with count verification
    const finalMessage = uploadResult.guaranteedTenProducts 
      ? `🎉 Successfully uploaded exactly 10 curated ${niche} products!`
      : `🎉 ${successCount} curated ${niche} products uploaded successfully!`;
    
    progressCallback(100, finalMessage);

    console.log(`🎉 CURATED SUCCESS: ${successCount}/${targetCount} products uploaded for ${niche}`, {
      successCount,
      targetCount,
      totalProcessed: results.length,
      niche,
      themeColor,
      storeName,
      guaranteedTenProducts: uploadResult.guaranteedTenProducts
    });

    // Verify we got the expected number of products
    if (successCount < 10) {
      console.warn(`⚠️ WARNING: Only ${successCount} out of 10 expected products were uploaded`);
    }

  } catch (error) {
    console.error(`❌ CURATED ERROR: Failed to upload ${niche} products:`, error);
    
    // Provide more user-friendly error messages
    let userFriendlyMessage = error.message;
    
    if (error.message?.includes('Edge Function returned a non-2xx status code')) {
      userFriendlyMessage = 'Connection error with product generation service. Please try again.';
    } else if (error.message?.includes('Failed to fetch')) {
      userFriendlyMessage = 'Network connection error. Please check your internet and try again.';
    } else if (error.message?.includes('timeout')) {
      userFriendlyMessage = 'Request timed out. Please try again.';
    }
    
    throw new Error(userFriendlyMessage);
  }
};

// Get available curated products count for a niche
export const getCuratedProductsCount = async (niche: string): Promise<number> => {
  try {
    // Map niche to bucket name (convert spaces to underscores and lowercase)
    const bucketName = niche.toLowerCase().replace(/\s+/g, '_').replace(/&/g, '');
    
    // List product folders to get actual count
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 100 });

    if (error) {
      console.warn(`Warning: Could not get curated products count for ${niche}:`, error);
      return 20; // Default fallback assuming 20 products
    }

    // Count folders that start with "Product"
    const productCount = data?.filter(item => 
      item.name.startsWith('Product') && !item.name.includes('.')
    ).length || 20;

    return Math.min(productCount, 20); // Cap at 20
  } catch (error) {
    console.warn(`Warning: Error getting curated products count:`, error);
    return 20; // Default fallback
  }
};

// Validate that curated products exist for a niche
export const validateCuratedProductsExist = async (niche: string): Promise<boolean> => {
  try {
    // Map niche to bucket name
    const bucketName = niche.toLowerCase().replace(/\s+/g, '_').replace(/&/g, '');

    // Check if at least one product folder exists
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('Product 1');

    return !error && data && data.length > 0;
  } catch (error) {
    console.warn(`Warning: Could not validate curated products for ${niche}:`, error);
    return true; // Assume they exist to prevent blocking
  }
};

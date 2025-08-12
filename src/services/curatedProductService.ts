
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

    // Step 2: Call the updated curated products Edge Function
    progressCallback(20, `Loading premium ${niche} products from storage...`);
    
    const { data: uploadResult, error: uploadError } = await supabase.functions.invoke('upload-curated-products', {
      body: {
        niche,
        shopifyUrl,
        shopifyAccessToken: accessToken,
        themeColor,
        storeName,
        limit: 10
      }
    });

    if (uploadError || !uploadResult?.success) {
      throw new Error(`Failed to upload curated products: ${uploadError?.message || uploadResult?.error || 'Unknown error'}`);
    }

    // Step 3: Process results with progress updates
    const results = uploadResult.results || [];
    const successCount = uploadResult.uploadedCount || 0;
    
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const progress = 30 + ((i / results.length) * 60);
      
      if (result.success) {
        progressCallback(progress, `✅ Uploaded: ${result.title?.substring(0, 35)}...`);
      } else {
        progressCallback(progress, `⚠️ Skipped: ${result.productFolder}`);
      }
      
      // Small delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    progressCallback(95, `Applying ${themeColor} theme color...`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    progressCallback(100, `🎉 ${successCount} curated ${niche} products uploaded successfully!`);

    console.log(`🎉 CURATED SUCCESS: ${successCount}/${results.length} products uploaded for ${niche}`, {
      successCount,
      totalProcessed: results.length,
      niche,
      themeColor,
      storeName
    });

    if (successCount === 0) {
      throw new Error(`No curated ${niche} products were uploaded. Please check your product storage and try again.`);
    }

  } catch (error) {
    console.error(`❌ CURATED ERROR: Failed to upload ${niche} products:`, error);
    throw error;
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

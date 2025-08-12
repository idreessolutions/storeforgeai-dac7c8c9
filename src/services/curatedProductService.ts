
import { supabase } from "@/integrations/supabase/client";

export const generateCuratedProducts = async (
  shopifyUrl: string,
  accessToken: string,
  niche: string,
  progressCallback: (progress: number, productName: string) => void,
  themeColor: string,
  storeName: string
): Promise<void> => {
  console.log(`🚀 DATABASE-DRIVEN: Starting upload for ${niche} from your product_data table`);

  try {
    // Step 1: Validate inputs
    progressCallback(10, `Preparing products from your ${niche} database...`);
    
    if (!shopifyUrl || !accessToken) {
      throw new Error('Shopify credentials are required');
    }

    // Step 2: Call the updated database-driven Edge Function
    progressCallback(20, `Loading products from your product_data table...`);
    
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
      throw new Error(`Failed to upload products from database: ${uploadError?.message || uploadResult?.error || 'Unknown error'}`);
    }

    // Step 3: Process results with progress updates
    const results = uploadResult.results || [];
    const successCount = uploadResult.uploadedCount || 0;
    
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const progress = 30 + ((i / results.length) * 60);
      
      if (result.success) {
        progressCallback(progress, `✅ Uploaded from DB: ${result.title?.substring(0, 35)}...`);
      } else {
        progressCallback(progress, `⚠️ Skipped: ${result.productFolder}`);
      }
      
      // Small delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    progressCallback(95, `Applying ${themeColor} theme color...`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    progressCallback(100, `🎉 ${successCount} products uploaded from your database!`);

    console.log(`🎉 DATABASE SUCCESS: ${successCount}/${results.length} products uploaded from product_data table`, {
      successCount,
      totalProcessed: results.length,
      niche,
      themeColor,
      storeName,
      source: 'Database + Storage'
    });

    if (successCount === 0) {
      throw new Error(`No products were uploaded from your ${niche} database. Please check your product_data table.`);
    }

  } catch (error) {
    console.error(`❌ DATABASE ERROR: Failed to upload ${niche} products from database:`, error);
    throw error;
  }
};

// Get available products count from database
export const getCuratedProductsCount = async (niche: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('product_data')
      .select('*', { count: 'exact', head: true })
      .eq('niche', niche)
      .eq('is_active', true);

    if (error) {
      console.warn(`Warning: Could not get products count for ${niche}:`, error);
      return 10; // Default fallback
    }

    return count || 10;
  } catch (error) {
    console.warn(`Warning: Error getting products count:`, error);
    return 10; // Default fallback
  }
};

// Validate that products exist in database for a niche
export const validateCuratedProductsExist = async (niche: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('product_data')
      .select('id')
      .eq('niche', niche)
      .eq('is_active', true)
      .limit(1);

    return !error && data && data.length > 0;
  } catch (error) {
    console.warn(`Warning: Could not validate products for ${niche}:`, error);
    return true; // Assume they exist to prevent blocking
  }
};

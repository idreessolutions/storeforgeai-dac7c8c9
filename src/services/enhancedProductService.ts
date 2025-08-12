
import { generateCuratedProducts, getCuratedProductsCount, validateCuratedProductsExist } from "./curatedProductService";

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
  console.log(`🚀 SUPABASE CURATED: Starting premium ${niche} product generation from Supabase buckets`);
  
  try {
    // Step 1: Validate curated products exist in Supabase
    onProgress(5, `🔍 Checking Supabase bucket for ${niche} products...`);
    
    const productsExist = await validateCuratedProductsExist(niche);
    if (!productsExist) {
      throw new Error(`No curated products found in Supabase bucket for ${niche}. Please check your bucket structure.`);
    }

    const productCount = await getCuratedProductsCount(niche);
    console.log(`📊 Found ${productCount} products in Supabase bucket for ${niche}`);

    // Step 2: Use ONLY the curated product service from Supabase
    onProgress(10, `📦 Loading ${productCount} products from Supabase ${niche} bucket...`);
    
    await generateCuratedProducts(
      shopifyUrl,
      accessToken,
      niche,
      (progress, productName) => {
        // Map progress from curated service (10-100) to our range (10-95)
        const mappedProgress = 10 + ((progress - 10) * 0.85);
        onProgress(mappedProgress, productName);
      },
      themeColor,
      storeName
    );

    onProgress(95, `🎨 Finalizing ${niche} store with ${themeColor} theme...`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    onProgress(100, `🏆 ${productCount} products from Supabase buckets are now LIVE!`);
    
    console.log(`🎉 SUPABASE SUCCESS: ${niche} products uploaded from Supabase buckets`, {
      niche,
      themeColor,
      storeName,
      productCount,
      system: 'Supabase Storage Buckets',
      source: 'Your Curated Product Folders'
    });
    
    return {
      success: true,
      uploadedCount: productCount,
      totalProducts: productCount,
      errors: [],
      niche,
      themeColor,
      source: 'Supabase Storage Buckets',
      system: 'curated',
      message: `Successfully uploaded ${productCount} products from Supabase ${niche} bucket with ${themeColor} theme!`
    };

  } catch (error) {
    console.error(`❌ SUPABASE ERROR: Failed to generate ${niche} products from buckets:`, error);
    throw error;
  }
};

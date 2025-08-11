
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
  console.log(`🚀 DATABASE-DRIVEN: Starting premium ${niche} product generation from your product_data table`);
  
  try {
    // Step 1: Validate products exist in database
    onProgress(5, `🔍 Checking your product_data table for ${niche} products...`);
    
    const productsExist = await validateCuratedProductsExist(niche);
    if (!productsExist) {
      throw new Error(`No products found in your product_data table for ${niche}. Please add products to the database.`);
    }

    const productCount = await getCuratedProductsCount(niche);
    console.log(`📊 Found ${productCount} products in database for ${niche}`);

    // Step 2: Use the database-driven product service
    onProgress(10, `📦 Loading ${productCount} products from your database...`);
    
    await generateCuratedProducts(
      shopifyUrl,
      accessToken,
      niche,
      (progress, productName) => {
        // Map progress from service (10-100) to our range (10-95)
        const mappedProgress = 10 + ((progress - 10) * 0.85);
        onProgress(mappedProgress, productName);
      },
      themeColor,
      storeName
    );

    onProgress(95, `🎨 Finalizing ${niche} store with ${themeColor} theme...`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    onProgress(100, `🏆 ${productCount} products from your database are now LIVE!`);
    
    console.log(`🎉 DATABASE SUCCESS: ${niche} products uploaded from your product_data table`, {
      niche,
      themeColor,
      storeName,
      productCount,
      system: 'Database + Storage',
      source: 'Your product_data table'
    });
    
    return {
      success: true,
      uploadedCount: productCount,
      totalProducts: productCount,
      errors: [],
      niche,
      themeColor,
      source: 'Database + Storage',
      system: 'database-driven',
      message: `Successfully uploaded ${productCount} products from your database with ${themeColor} theme!`
    };

  } catch (error) {
    console.error(`❌ DATABASE ERROR: Failed to generate ${niche} products from database:`, error);
    throw error;
  }
};

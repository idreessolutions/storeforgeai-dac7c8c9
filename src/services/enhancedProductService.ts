
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
  console.log(`🚀 ENHANCED CURATED: Starting premium ${niche} product generation with curated system`);
  
  try {
    // Step 1: Validate curated products exist
    onProgress(5, `🔍 Validating curated ${niche} products...`);
    
    const productsExist = await validateCuratedProductsExist(niche);
    if (!productsExist) {
      throw new Error(`No curated products found for ${niche}. Please contact support to add products for this niche.`);
    }

    const productCount = await getCuratedProductsCount(niche);
    console.log(`📊 Found ${productCount} curated products for ${niche}`);

    // Step 2: Use curated product service
    onProgress(10, `📦 Loading ${productCount} premium curated ${niche} products...`);
    
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

    onProgress(100, `🏆 ${productCount} curated ${niche} products are now LIVE!`);
    
    console.log(`🎉 ENHANCED CURATED SUCCESS: ${niche} products uploaded with curated system`, {
      niche,
      themeColor,
      storeName,
      productCount,
      system: 'curated',
      qualityStandards: 'Hand-curated premium products'
    });
    
    return {
      success: true,
      uploadedCount: productCount,
      totalProducts: productCount,
      errors: [],
      niche,
      themeColor,
      qualityStandards: 'Hand-curated premium products with real images',
      system: 'curated',
      message: `Successfully uploaded ${productCount} premium curated ${niche} products with ${themeColor} theme!`
    };

  } catch (error) {
    console.error(`❌ ENHANCED CURATED: Premium ${niche} product generation failed:`, error);
    throw error;
  }
};

// Mark old functions as deprecated
function selectAdvancedDiverseProducts(products: any[], maxCount: number, niche: string): any[] {
  console.warn('DEPRECATED: selectAdvancedDiverseProducts - Now using curated products');
  return products.slice(0, maxCount);
}

function extractProductCategory(title: string, niche: string): string {
  console.warn('DEPRECATED: extractProductCategory - Now using curated products');
  return 'general';
}

async function getAliExpressApiKeyWithRetry(maxRetries: number): Promise<string | null> {
  console.warn('DEPRECATED: getAliExpressApiKeyWithRetry - Now using curated products');
  return null;
}

async function getRapidApiKey(): Promise<string | null> {
  console.warn('DEPRECATED: getRapidApiKey - Now using curated products');
  return null;
}

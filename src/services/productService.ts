import { generateCuratedProducts } from "./curatedProductService";

export const generateWinningProducts = async (
  shopifyUrl: string,
  accessToken: string,
  niche: string,
  progressCallback: (progress: number, productName: string) => void,
  themeColor: string,
  targetAudience: string,
  businessType: string,
  storeStyle: string,
  customInfo: string,
  storeName: string
): Promise<void> => {
  console.log(`🚀 CURATED SYSTEM: Starting product generation for ${niche}`);
  console.log('Store configuration:', {
    storeName,
    themeColor,
    niche
  });

  try {
    // Use the new curated product service
    await generateCuratedProducts(
      shopifyUrl,
      accessToken,
      niche,
      progressCallback,
      themeColor,
      storeName
    );

    console.log(`🎉 CURATED COMPLETE: Successfully generated ${niche} products with curated system`);

  } catch (error) {
    console.error(`❌ CURATED ERROR: Failed to generate ${niche} products:`, error);
    throw error;
  }
};

// Keep these helper functions for backward compatibility but mark as deprecated
async function generateEnhancedProductContent(product: any, config: any) {
  console.warn('DEPRECATED: generateEnhancedProductContent - Now using curated products');
  return product;
}

async function generateChatGPTTitle(originalTitle: string, niche: string, storeName: string, targetAudience: string): Promise<string> {
  console.warn('DEPRECATED: generateChatGPTTitle - Now using curated products');
  return originalTitle;
}

async function generateChatGPTDescription(product: any, config: any): Promise<string> {
  console.warn('DEPRECATED: generateChatGPTDescription - Now using curated products');
  return product.description || '';
}

function generateFallbackDescription(product: any, config: any): string {
  console.warn('DEPRECATED: generateFallbackDescription - Now using curated products');
  return product.description || '';
}

function generateSmartVariations(originalVariants: any[], basePrice: number, niche: string) {
  console.warn('DEPRECATED: generateSmartVariations - Now using curated products');
  return originalVariants;
}

function getVariantTypes(niche: string) {
  console.warn('DEPRECATED: getVariantTypes - Now using curated products');
  return [{ title: 'Standard' }];
}

function generateSmartTags(niche: string, targetAudience: string, storeStyle: string, storeName: string): string {
  console.warn('DEPRECATED: generateSmartTags - Now using curated products');
  return [niche, targetAudience, storeStyle, storeName].join(', ');
}

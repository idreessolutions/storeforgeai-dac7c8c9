
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
  console.log(`🚀 SUPABASE CURATED: Starting product generation for ${niche} from Supabase buckets`);
  console.log('Store configuration:', {
    storeName,
    themeColor,
    niche,
    bucketSystem: 'Supabase Storage'
  });

  try {
    // ONLY use the curated product service that pulls from Supabase buckets
    await generateCuratedProducts(
      shopifyUrl,
      accessToken,
      niche,
      progressCallback,
      themeColor,
      storeName
    );

    console.log(`🎉 SUPABASE SUCCESS: Successfully generated ${niche} products from Supabase buckets`);

  } catch (error) {
    console.error(`❌ SUPABASE ERROR: Failed to generate ${niche} products from buckets:`, error);
    throw error;
  }
};

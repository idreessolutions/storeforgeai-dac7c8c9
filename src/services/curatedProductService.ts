
import { supabase } from "@/integrations/supabase/client";

// Map frontend niche names to database niche names
const nicheMapping: Record<string, string> = {
  'home-living': 'home_living',
  'beauty-personal-care': 'beauty_personal_care',
  'health-fitness': 'health_fitness',
  'pets': 'pets',
  'fashion-accessories': 'fashion_accessories',
  'electronics-gadgets': 'electronics_gadgets',
  'kids-babies': 'kids_babies',
  'seasonal-events': 'seasonal_events',
  'hobbies-lifestyle': 'hobbies_lifestyle',
  'trending-viral': 'trending_viral'
};

export const generateCuratedProducts = async (
  shopifyUrl: string,
  accessToken: string,
  niche: string,
  onProgress: (progress: number, productName: string) => void,
  themeColor: string = '#3B82F6',
  storeName: string = 'My Store'
) => {
  console.log(`🚀 DATABASE-DRIVEN: Starting upload for ${niche} from your product_data table`);
  
  // Map the frontend niche to database niche format
  const dbNiche = nicheMapping[niche] || niche;
  console.log(`🔄 Mapped niche: ${niche} -> ${dbNiche}`);
  
  onProgress(10, `Preparing products from your ${niche} database...`);
  
  try {
    onProgress(20, `Loading products from your product_data table...`);
    
    const { data, error } = await supabase.functions.invoke('upload-curated-products', {
      body: {
        niche: dbNiche, // Use the mapped database niche
        shopifyUrl: shopifyUrl,
        shopifyAccessToken: accessToken,
        themeColor: themeColor,
        storeName: storeName,
        limit: 10
      }
    });

    if (error) {
      console.error('❌ DATABASE ERROR: Failed to upload products from database:', error);
      throw new Error(`Failed to upload products from database: ${error.message}`);
    }

    if (!data?.success) {
      console.error('❌ DATABASE ERROR: Upload failed:', data);
      throw new Error(`Failed to upload products from database: ${data?.error || 'Unknown error'}`);
    }

    console.log('✅ DATABASE SUCCESS: Products uploaded from your curated database');
    onProgress(100, `Successfully uploaded ${data.uploadedCount} products!`);
    
    return data;
    
  } catch (error: any) {
    console.error('❌ DATABASE ERROR: Failed to upload products from database:', error);
    throw new Error(`Failed to upload products from database: ${error.message || 'Unknown error occurred'}`);
  }
};

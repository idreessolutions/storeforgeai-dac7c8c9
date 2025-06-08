
import { supabase } from "@/integrations/supabase/client";
import { AliExpressService } from "./aliexpressService";

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
  console.log(`🚀 Starting REAL product generation for ${niche} niche with AliExpress integration`);
  
  try {
    // Step 1: Get REAL winning products from AliExpress
    onProgress(10, `Searching for 10 winning ${niche} products on AliExpress...`);
    
    const rapidApiKey = await getRapidApiKey();
    if (!rapidApiKey) {
      throw new Error('RapidAPI key not configured for AliExpress integration');
    }

    const aliExpressService = new AliExpressService(rapidApiKey);
    const aliExpressProducts = await aliExpressService.fetchTrendingProducts(niche, 10);
    
    if (!aliExpressProducts || aliExpressProducts.length === 0) {
      throw new Error(`No winning ${niche} products found on AliExpress. Please try again.`);
    }

    console.log(`✅ Found ${aliExpressProducts.length} real winning ${niche} products from AliExpress`);
    onProgress(25, `Found ${aliExpressProducts.length} winning ${niche} products! Optimizing with AI...`);

    // Step 2: Generate AI-optimized content for each real product
    const products = [];
    
    for (let i = 0; i < aliExpressProducts.length; i++) {
      const aliProduct = aliExpressProducts[i];
      const progressPercent = 25 + ((i / aliExpressProducts.length) * 45);
      
      onProgress(progressPercent, `AI optimizing: ${aliProduct.title.substring(0, 50)}...`);
      console.log(`🤖 AI optimizing product ${i + 1}/${aliExpressProducts.length}: ${aliProduct.title}`);

      try {
        // Generate AI-optimized content using real product data
        const { data: aiResponse, error: aiError } = await supabase.functions.invoke('generate-products', {
          body: {
            realProduct: aliProduct,
            niche,
            targetAudience,
            businessType,
            storeStyle,
            themeColor,
            customInfo,
            productIndex: i
          }
        });

        if (aiError || !aiResponse?.success) {
          console.warn(`⚠️ AI optimization failed for product ${i + 1}, using enhanced fallback`);
          const enhancedProduct = createEnhancedProduct(aliProduct, niche, targetAudience, themeColor);
          products.push(enhancedProduct);
        } else {
          console.log(`✅ AI optimization successful for product ${i + 1}`);
          products.push(aiResponse.optimizedProduct);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ Error optimizing product ${i + 1}:`, error);
        const enhancedProduct = createEnhancedProduct(aliProduct, niche, targetAudience, themeColor);
        products.push(enhancedProduct);
      }
    }

    if (products.length === 0) {
      throw new Error(`Failed to process any ${niche} products. Please try again.`);
    }

    onProgress(70, `Uploading ${products.length} optimized ${niche} products to Shopify...`);

    // Step 3: Upload each product to Shopify with real data
    const totalProducts = products.length;
    let uploadedCount = 0;

    for (let i = 0; i < totalProducts; i++) {
      const product = products[i];
      const progressPercent = 70 + ((i / totalProducts) * 25);
      
      onProgress(progressPercent, `Uploading: ${product.title.substring(0, 40)}...`);
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

        // Delay between uploads
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
    
    console.log(`🎉 Successfully uploaded ${uploadedCount}/${totalProducts} real ${niche} products from AliExpress to Shopify`);
    
    return {
      success: true,
      uploadedCount,
      totalProducts,
      message: `Successfully added ${uploadedCount} real winning ${niche} products from AliExpress to your store!`
    };

  } catch (error) {
    console.error(`❌ Real product generation workflow failed for ${niche}:`, error);
    throw error;
  }
};

async function getRapidApiKey(): Promise<string | null> {
  try {
    // Try to get from Supabase secrets first
    const { data, error } = await supabase.functions.invoke('get-rapidapi-key');
    if (!error && data?.rapidApiKey) {
      return data.rapidApiKey;
    }
  } catch (error) {
    console.warn('Could not retrieve RapidAPI key from secrets:', error);
  }
  
  // Fallback to environment or return null
  return null;
}

function createEnhancedProduct(aliProduct: any, niche: string, targetAudience: string, themeColor: string) {
  const nicheEmojis = {
    'fitness': '💪',
    'beauty': '💄',
    'tech': '📱',
    'pets': '🐾',
    'kitchen': '🍳',
    'home': '🏠',
    'fashion': '👗',
    'baby': '👶',
    'car': '🚗',
    'gifts': '🎁'
  };

  const emoji = nicheEmojis[niche.toLowerCase()] || '⭐';
  
  return {
    title: `${emoji} ${aliProduct.title}`,
    description: `Transform your ${niche} experience with this premium ${aliProduct.title}! ${emoji}\n\n` +
                `✨ Perfect for ${targetAudience}\n` +
                `🏆 Proven winner with ${aliProduct.orders}+ orders\n` +
                `⭐ ${aliProduct.rating}/5 star rating\n` +
                `🎯 Key features: ${aliProduct.features.slice(0, 3).join(', ')}\n\n` +
                `This bestselling product has been trusted by thousands of customers worldwide. ` +
                `Join the community of satisfied customers who've already discovered the benefits!`,
    features: aliProduct.features || [`Premium ${niche} quality`, 'Durable construction', 'Easy to use', 'Great value'],
    benefits: [`Improves your ${niche} experience`, 'Saves time and effort', 'Long-lasting quality'],
    recommendedPrice: Math.max(15, Math.min(80, aliProduct.price * 1.5)),
    images: aliProduct.imageUrl ? [{ url: aliProduct.imageUrl, alt: aliProduct.title }] : [],
    variants: aliProduct.variants || [
      {
        title: 'Standard',
        price: Math.max(15, Math.min(80, aliProduct.price * 1.5)),
        inventory_quantity: 100,
        option1: 'Standard'
      }
    ],
    category: niche,
    source: 'aliexpress_real',
    aliExpressData: {
      itemId: aliProduct.itemId,
      rating: aliProduct.rating,
      orders: aliProduct.orders
    }
  };
}


import { supabase } from "@/integrations/supabase/client";
import { AliExpressService } from "./aliexpressService";
import { NicheValidationService } from "./nicheValidationService";
import { SmartPricingService } from "./smartPricingService";

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
  console.log(`🚀 CRITICAL: Starting WINNING ${niche} product generation with STRICT niche validation`);
  
  try {
    // Step 1: Validate niche and get trending insights
    onProgress(5, `Analyzing trending ${niche} products...`);
    const trendingInsights = NicheValidationService.getTrendingInsights(niche);
    console.log(`📈 Trending ${niche} insights:`, trendingInsights);

    // Step 2: Get RapidAPI key
    onProgress(10, `Connecting to winning product database...`);
    const rapidApiKey = await getRapidApiKey();
    if (!rapidApiKey) {
      throw new Error('Product database connection failed - API key not configured');
    }

    // Step 3: Fetch REAL winning products with strict niche filtering
    onProgress(20, `Searching for TOP 10 winning ${niche} products...`);
    const aliExpressService = new AliExpressService(rapidApiKey);
    
    // Fetch more products initially to filter down to best 10
    const candidateProducts = await aliExpressService.fetchWinningProducts(niche, 25);
    
    if (!candidateProducts || candidateProducts.length === 0) {
      throw new Error(`No winning ${niche} products found. Please try a different niche.`);
    }

    // Step 4: Apply STRICT quality and niche validation
    onProgress(30, `Validating ${niche} product quality and relevance...`);
    const validatedProducts = candidateProducts
      .filter(product => NicheValidationService.isWinningProduct(product))
      .filter(product => NicheValidationService.validateProductNiche(product, niche))
      .slice(0, 10); // Take top 10 after validation

    if (validatedProducts.length < 5) {
      console.warn(`⚠️ Only ${validatedProducts.length} products passed strict validation for ${niche}`);
    }

    console.log(`✅ Found ${validatedProducts.length} VALIDATED winning ${niche} products`);
    onProgress(40, `Found ${validatedProducts.length} winning ${niche} products! Enhancing with AI...`);

    // Step 5: Process each product with AI enhancement
    const enhancedProducts = [];
    
    for (let i = 0; i < validatedProducts.length; i++) {
      const product = validatedProducts[i];
      const progressPercent = 40 + ((i / validatedProducts.length) * 40);
      
      onProgress(progressPercent, `AI enhancing ${niche} product: ${product.title.substring(0, 40)}...`);
      
      try {
        // Calculate optimal pricing
        const optimalPrice = SmartPricingService.calculateOptimalPrice({
          originalPrice: product.price,
          niche,
          targetAudience,
          features: product.features || [],
          rating: product.rating,
          orders: product.orders
        });

        console.log(`💰 Smart pricing for ${product.title.substring(0, 30)}: $${product.price} → $${optimalPrice}`);

        // AI enhancement with strict niche focus
        const { data: aiResponse, error: aiError } = await supabase.functions.invoke('generate-products', {
          body: {
            realProduct: {
              ...product,
              price: optimalPrice
            },
            niche,
            targetAudience,
            businessType,
            storeStyle,
            themeColor,
            customInfo,
            storeName,
            productIndex: i,
            trendingInsights,
            qualityRequirements: {
              rating: '4.5+',
              orders: '1000+',
              images: '6-8 per product',
              descriptionLength: '300-500 words',
              nicheCompliance: 'STRICT'
            }
          }
        });

        if (aiError || !aiResponse?.success) {
          console.error(`❌ AI enhancement failed for ${niche} product:`, aiError);
          throw new Error(`AI enhancement failed: ${aiError?.message || 'Unknown error'}`);
        }

        const enhancedProduct = aiResponse.optimizedProduct;
        
        // Final niche validation on enhanced product
        if (!NicheValidationService.validateProductNiche(enhancedProduct, niche)) {
          console.warn(`⚠️ Enhanced product failed final niche validation, skipping: ${enhancedProduct.title}`);
          continue;
        }

        enhancedProducts.push(enhancedProduct);
        console.log(`✅ Enhanced ${niche} product ${i + 1}: ${enhancedProduct.title}`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 800));

      } catch (error) {
        console.error(`❌ Error enhancing ${niche} product ${i + 1}:`, error);
        continue; // Skip failed products, continue with others
      }
    }

    if (enhancedProducts.length === 0) {
      throw new Error(`Failed to enhance any ${niche} products. Please try again.`);
    }

    onProgress(80, `Uploading ${enhancedProducts.length} winning ${niche} products to Shopify...`);

    // Step 6: Upload to Shopify with enhanced error handling
    let uploadedCount = 0;
    const uploadErrors = [];

    for (let i = 0; i < enhancedProducts.length; i++) {
      const product = enhancedProducts[i];
      const progressPercent = 80 + ((i / enhancedProducts.length) * 15);
      
      onProgress(progressPercent, `Publishing ${niche} product: ${product.title.substring(0, 30)}...`);
      
      try {
        const { data: uploadResponse, error: uploadError } = await supabase.functions.invoke('add-shopify-product', {
          body: {
            shopifyUrl,
            accessToken,
            themeColor,
            product: {
              ...product,
              niche,
              category: niche,
              tags: `${niche}, winning product, trending, ${targetAudience}, ${storeStyle}, verified quality, bestseller`,
              vendor: storeName || `${niche.charAt(0).toUpperCase() + niche.slice(1)} Store`
            }
          }
        });

        if (uploadError || !uploadResponse?.success) {
          const errorMsg = uploadError?.message || uploadResponse?.error || 'Upload failed';
          console.error(`❌ Upload failed for ${product.title}:`, errorMsg);
          uploadErrors.push(`${product.title}: ${errorMsg}`);
          continue;
        }

        uploadedCount++;
        console.log(`✅ Successfully uploaded winning ${niche} product: ${product.title}`);

        // Rate limiting between uploads
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Error uploading ${product.title}:`, error);
        uploadErrors.push(`${product.title}: ${error.message}`);
      }
    }

    onProgress(95, `Finalizing ${niche} store...`);

    if (uploadedCount === 0) {
      throw new Error(`Failed to upload any ${niche} products. Errors: ${uploadErrors.join('; ')}`);
    }

    onProgress(100, `${uploadedCount} winning ${niche} products live in your store!`);
    
    console.log(`🎉 SUCCESS: ${uploadedCount}/${enhancedProducts.length} winning ${niche} products uploaded to Shopify`);
    
    return {
      success: true,
      uploadedCount,
      totalProducts: enhancedProducts.length,
      errors: uploadErrors,
      niche,
      message: `Successfully added ${uploadedCount} WINNING ${niche} products with verified quality (4.5+ rating, 1000+ orders) to your store!`
    };

  } catch (error) {
    console.error(`❌ CRITICAL: Winning ${niche} product generation failed:`, error);
    throw error;
  }
};

async function getRapidApiKey(): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('get-rapidapi-key');
    if (!error && data?.rapidApiKey) {
      return data.rapidApiKey;
    }
  } catch (error) {
    console.warn('Could not retrieve RapidAPI key:', error);
  }
  return null;
}

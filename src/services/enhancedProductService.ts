
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
  console.log(`🚀 ENHANCED: Starting WINNING ${niche} product generation with ADVANCED validation`);
  
  try {
    // Step 1: Market analysis and trend validation
    onProgress(5, `Analyzing ${niche} market trends and opportunities...`);
    const trendingInsights = NicheValidationService.getTrendingInsights(niche);
    const marketConfidence = NicheValidationService.getMarketConfidenceScore(niche);
    
    console.log(`📊 Market Analysis for ${niche}:`, {
      confidence: `${(marketConfidence * 100).toFixed(1)}%`,
      insights: trendingInsights.length,
      trend_strength: marketConfidence > 0.85 ? 'STRONG' : marketConfidence > 0.75 ? 'MODERATE' : 'EMERGING'
    });

    // Step 2: Enhanced API connection with retry logic
    onProgress(10, `Establishing secure connection to winning product database...`);
    const rapidApiKey = await getRapidApiKeyWithRetry(3);
    if (!rapidApiKey) {
      throw new Error('Unable to connect to product database - API configuration required');
    }

    // Step 3: Intelligent product sourcing with quality pre-filtering
    onProgress(20, `Sourcing TOP-TIER ${niche} products (4.7+ stars, 1500+ orders)...`);
    const aliExpressService = new AliExpressService(rapidApiKey);
    
    // Fetch more candidates for better filtering
    const candidateProducts = await aliExpressService.fetchWinningProducts(niche, 35);
    
    if (!candidateProducts || candidateProducts.length === 0) {
      throw new Error(`No premium ${niche} products found matching our enhanced quality standards. Please try a different niche.`);
    }

    // Step 4: Advanced multi-stage validation pipeline
    onProgress(30, `Applying advanced quality validation and ${niche} relevance scoring...`);
    
    // Stage 1: Quality pre-filter
    const qualityFiltered = candidateProducts.filter(product => 
      NicheValidationService.isWinningProduct(product)
    );
    
    // Stage 2: Niche relevance scoring
    const nicheValidated = qualityFiltered.filter(product => 
      NicheValidationService.validateProductNiche(product, niche)
    );
    
    // Stage 3: Diversity selection (avoid similar products)
    const diverseProducts = selectDiverseProducts(nicheValidated, 12);
    
    if (diverseProducts.length < 8) {
      console.warn(`⚠️ Only ${diverseProducts.length} products passed enhanced validation for ${niche}`);
      if (diverseProducts.length < 5) {
        throw new Error(`Insufficient quality ${niche} products found. Please try again or select a different niche.`);
      }
    }

    console.log(`✅ VALIDATION COMPLETE: ${diverseProducts.length} premium ${niche} products selected`);
    onProgress(40, `${diverseProducts.length} premium ${niche} products validated! Enhancing with AI...`);

    // Step 5: Advanced AI enhancement with niche specialization
    const enhancedProducts = [];
    
    for (let i = 0; i < Math.min(diverseProducts.length, 10); i++) {
      const product = diverseProducts[i];
      const progressPercent = 40 + ((i / 10) * 40);
      
      onProgress(progressPercent, `AI enhancing: ${product.title.substring(0, 45)}...`);
      
      try {
        // Enhanced pricing strategy
        const optimalPrice = SmartPricingService.calculateOptimalPrice({
          originalPrice: product.price,
          niche,
          targetAudience,
          features: product.features || [],
          rating: product.rating,
          orders: product.orders
        });

        console.log(`💰 Smart pricing for ${product.title.substring(0, 30)}: $${product.price} → $${optimalPrice} (${niche} optimization)`);

        // AI enhancement with market insights
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
            marketConfidence,
            qualityRequirements: {
              rating: '4.7+',
              orders: '1500+',
              images: '6-8 per product',
              descriptionLength: '400-600 words',
              nicheCompliance: 'ENHANCED'
            }
          }
        });

        if (aiError || !aiResponse?.success) {
          console.error(`❌ AI enhancement failed for ${niche} product:`, aiError);
          throw new Error(`AI enhancement failed: ${aiError?.message || 'Unknown error'}`);
        }

        const enhancedProduct = aiResponse.optimizedProduct;
        
        // Final validation on enhanced product
        if (!NicheValidationService.validateProductNiche(enhancedProduct, niche)) {
          console.warn(`⚠️ Enhanced product failed final validation, skipping: ${enhancedProduct.title}`);
          continue;
        }

        enhancedProducts.push(enhancedProduct);
        console.log(`✅ Enhanced ${niche} product ${i + 1}: ${enhancedProduct.title}`);

        // Rate limiting with progress feedback
        await new Promise(resolve => setTimeout(resolve, 600));

      } catch (error) {
        console.error(`❌ Error enhancing ${niche} product ${i + 1}:`, error);
        continue;
      }
    }

    if (enhancedProducts.length === 0) {
      throw new Error(`Failed to enhance any ${niche} products. Please try again.`);
    }

    onProgress(80, `Publishing ${enhancedProducts.length} premium ${niche} products to Shopify...`);

    // Step 6: Enhanced Shopify upload with advanced error handling
    let uploadedCount = 0;
    const uploadErrors = [];

    for (let i = 0; i < enhancedProducts.length; i++) {
      const product = enhancedProducts[i];
      const progressPercent = 80 + ((i / enhancedProducts.length) * 15);
      
      onProgress(progressPercent, `Publishing: ${product.title.substring(0, 35)}...`);
      
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
              tags: `${niche}, winning product, trending, ${targetAudience}, ${storeStyle}, verified quality, bestseller, premium`,
              vendor: storeName || `${niche.charAt(0).toUpperCase() + niche.slice(1)} Premium Store`,
              metafields: {
                market_confidence: marketConfidence,
                quality_score: 'premium',
                trend_status: 'verified'
              }
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
        console.log(`✅ Successfully published premium ${niche} product: ${product.title}`);

        // Enhanced rate limiting
        await new Promise(resolve => setTimeout(resolve, 1800));

      } catch (error) {
        console.error(`❌ Error uploading ${product.title}:`, error);
        uploadErrors.push(`${product.title}: ${error.message}`);
      }
    }

    onProgress(95, `Finalizing premium ${niche} store setup...`);

    if (uploadedCount === 0) {
      throw new Error(`Failed to publish any ${niche} products. Errors: ${uploadErrors.join('; ')}`);
    }

    onProgress(100, `${uploadedCount} premium ${niche} products are now LIVE!`);
    
    console.log(`🎉 ENHANCED SUCCESS: ${uploadedCount}/${enhancedProducts.length} premium ${niche} products published to Shopify`);
    
    return {
      success: true,
      uploadedCount,
      totalProducts: enhancedProducts.length,
      errors: uploadErrors,
      niche,
      marketConfidence: (marketConfidence * 100).toFixed(1) + '%',
      qualityStandards: '4.7+ rating, 1500+ orders',
      message: `Successfully published ${uploadedCount} PREMIUM ${niche} products with verified market demand and quality!`
    };

  } catch (error) {
    console.error(`❌ ENHANCED: Premium ${niche} product generation failed:`, error);
    throw error;
  }
};

// Helper function for diverse product selection
function selectDiverseProducts(products: any[], maxCount: number): any[] {
  if (products.length <= maxCount) return products;
  
  const selected = [];
  const used = new Set<string>();
  
  // Sort by quality score (rating * orders)
  const sorted = products.sort((a, b) => (b.rating * b.orders) - (a.rating * a.orders));
  
  for (const product of sorted) {
    if (selected.length >= maxCount) break;
    
    // Check for title similarity to avoid duplicates
    const titleWords = product.title.toLowerCase().split(' ').filter((w: string) => w.length > 3);
    const isSimilar = Array.from(used).some((usedTitle: string) => {
      const usedWords = usedTitle.split(' ');
      const commonWords = titleWords.filter((word: string) => usedWords.includes(word));
      return commonWords.length > 2; // Similarity threshold
    });
    
    if (!isSimilar) {
      selected.push(product);
      used.add(product.title.toLowerCase());
    }
  }
  
  return selected;
}

// Enhanced API key retrieval with retry logic
async function getRapidApiKeyWithRetry(maxRetries: number): Promise<string | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke('get-rapidapi-key');
      if (!error && data?.rapidApiKey) {
        return data.rapidApiKey;
      }
      
      if (attempt < maxRetries) {
        console.warn(`API key retrieval attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    } catch (error) {
      console.warn(`API key retrieval attempt ${attempt} error:`, error);
    }
  }
  
  return null;
}

async function getRapidApiKey(): Promise<string | null> {
  return getRapidApiKeyWithRetry(1);
}

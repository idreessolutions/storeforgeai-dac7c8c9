import { supabase } from "@/integrations/supabase/client";
import { AliExpressService } from "./aliexpressService";
import { NicheValidationService } from "./nicheValidationService";
import { SmartPricingService } from "./smartPricingService";
import { MarketIntelligenceService } from "./marketIntelligenceService";
import { AdvancedQualityScoring } from "./advancedQualityScoring";

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
  console.log(`🚀 PREMIUM ENHANCED: Starting ELITE ${niche} product generation with ADVANCED market intelligence`);
  
  try {
    // Step 1: Advanced market intelligence and trend analysis
    onProgress(5, `🧠 Analyzing ${niche} market with AI-powered trend detection...`);
    const marketAnalysis = MarketIntelligenceService.getAdvancedMarketAnalysis(niche);
    const opportunityScore = MarketIntelligenceService.calculateMarketOpportunityScore(niche);
    const competitionLevel = MarketIntelligenceService.getCompetitionLevel(niche);
    
    console.log(`📊 ADVANCED Market Intelligence for ${niche}:`, {
      opportunity_score: `${opportunityScore}/100`,
      competition_level: competitionLevel,
      trending_types: marketAnalysis.insights.length,
      price_optimization: `$${marketAnalysis.priceRange.min}-$${marketAnalysis.priceRange.max}`,
      market_confidence: `${(opportunityScore / 100 * 0.95).toFixed(2)}`
    });

    // Step 2: Enhanced API connection with advanced retry logic
    onProgress(10, `🔗 Establishing premium connection to winning product intelligence database...`);
    const rapidApiKey = await getRapidApiKeyWithRetry(5); // Increased retries
    if (!rapidApiKey) {
      throw new Error('Unable to connect to premium product database - API configuration required');
    }

    // Step 3: Elite product sourcing with multi-stage quality filtering
    onProgress(20, `🎯 Sourcing ELITE ${niche} products (4.7+ stars, 2000+ orders, market-validated)...`);
    // Fix: Call AliExpressService constructor without arguments
    const aliExpressService = new AliExpressService();
    
    // Fetch larger candidate pool for superior selection
    const candidateProducts = await aliExpressService.fetchWinningProducts(niche, 50);
    
    if (!candidateProducts || candidateProducts.length === 0) {
      throw new Error(`No elite ${niche} products found matching our premium market standards. Please try a different niche.`);
    }

    // Step 4: Advanced multi-stage validation and quality scoring
    onProgress(30, `🏆 Applying ELITE quality scoring and ${niche} market intelligence...`);
    
    // Stage 1: Basic quality pre-filter
    const qualityFiltered = candidateProducts.filter(product => 
      NicheValidationService.isWinningProduct(product)
    );
    
    // Stage 2: Advanced niche relevance with market context
    const nicheValidated = qualityFiltered.filter(product => 
      NicheValidationService.validateProductNiche(product, niche)
    );
    
    // Stage 3: Elite quality scoring and ranking
    const qualityRanked = AdvancedQualityScoring.rankProductsByQuality(nicheValidated, niche);
    
    // Stage 4: Market opportunity alignment
    const marketOptimized = qualityRanked.filter(product => {
      const priceRange = MarketIntelligenceService.getOptimalPriceRange(niche);
      return product.price >= priceRange.min * 0.8 && product.price <= priceRange.max * 1.2;
    });
    
    // Stage 5: Diversity selection to avoid similar products
    const diverseProducts = selectAdvancedDiverseProducts(marketOptimized, 15, niche);
    
    if (diverseProducts.length < 8) {
      console.warn(`⚠️ Only ${diverseProducts.length} products passed ELITE validation for ${niche}`);
      if (diverseProducts.length < 5) {
        throw new Error(`Insufficient elite ${niche} products found. Market standards are exceptionally high.`);
      }
    }

    console.log(`✅ ELITE VALIDATION COMPLETE: ${diverseProducts.length} premium ${niche} products selected with ${opportunityScore}/100 market score`);
    onProgress(40, `${diverseProducts.length} ELITE ${niche} products validated! Enhancing with advanced AI...`);

    // Step 5: Premium AI enhancement with market intelligence integration
    const enhancedProducts = [];
    
    for (let i = 0; i < Math.min(diverseProducts.length, 12); i++) {
      const product = diverseProducts[i];
      const progressPercent = 40 + ((i / 12) * 40);
      
      onProgress(progressPercent, `🤖 AI enhancing: ${product.title.substring(0, 45)}...`);
      
      try {
        // Advanced pricing strategy with market intelligence
        const optimalPrice = SmartPricingService.calculateOptimalPrice({
          originalPrice: product.price,
          niche,
          targetAudience,
          features: product.features || [],
          rating: product.rating,
          orders: product.orders
        });

        // Quality metrics for enhanced AI prompting
        const qualityMetrics = AdvancedQualityScoring.calculateComprehensiveQualityScore(product, niche);

        console.log(`💰 ELITE pricing for ${product.title.substring(0, 30)}: $${product.price} → $${optimalPrice} (${niche} market-optimized, quality: ${qualityMetrics.overallScore.toFixed(1)}/100)`);

        // Premium AI enhancement with comprehensive market context
        const { data: aiResponse, error: aiError } = await supabase.functions.invoke('generate-products', {
          body: {
            realProduct: {
              ...product,
              price: optimalPrice,
              qualityScore: qualityMetrics.overallScore
            },
            niche,
            targetAudience,
            businessType,
            storeStyle,
            themeColor,
            customInfo,
            storeName,
            productIndex: i,
            marketAnalysis,
            qualityMetrics,
            competitionLevel,
            trendingTypes: MarketIntelligenceService.getTrendingProductTypes(niche),
            advancedRequirements: {
              rating: '4.7+',
              orders: '2000+',
              images: '8-10 per product',
              descriptionLength: '500-700 words',
              qualityCompliance: 'ELITE',
              marketAlignment: 'PREMIUM',
              competitionAnalysis: competitionLevel
            }
          }
        });

        if (aiError || !aiResponse?.success) {
          console.error(`❌ Premium AI enhancement failed for ${niche} product:`, aiError);
          throw new Error(`Premium AI enhancement failed: ${aiError?.message || 'Unknown error'}`);
        }

        const enhancedProduct = aiResponse.optimizedProduct;
        
        // Final elite validation on enhanced product
        if (!NicheValidationService.validateProductNiche(enhancedProduct, niche)) {
          console.warn(`⚠️ Enhanced product failed final validation, skipping: ${enhancedProduct.title}`);
          continue;
        }

        enhancedProducts.push({
          ...enhancedProduct,
          qualityScore: qualityMetrics.overallScore,
          marketOpportunity: opportunityScore
        });
        
        console.log(`✅ ELITE enhanced ${niche} product ${i + 1}: ${enhancedProduct.title} (Quality: ${qualityMetrics.overallScore.toFixed(1)}/100)`);

        // Advanced rate limiting with progress feedback
        await new Promise(resolve => setTimeout(resolve, 800));

      } catch (error) {
        console.error(`❌ Error enhancing elite ${niche} product ${i + 1}:`, error);
        continue;
      }
    }

    if (enhancedProducts.length === 0) {
      throw new Error(`Failed to enhance any elite ${niche} products. Please try again.`);
    }

    onProgress(80, `📦 Publishing ${enhancedProducts.length} ELITE ${niche} products to Shopify...`);

    // Step 6: Premium Shopify upload with advanced error handling and retry logic
    let uploadedCount = 0;
    const uploadErrors = [];
    const uploadRetries = new Map<string, number>();

    for (let i = 0; i < enhancedProducts.length; i++) {
      const product = enhancedProducts[i];
      const progressPercent = 80 + ((i / enhancedProducts.length) * 15);
      
      onProgress(progressPercent, `🚀 Publishing: ${product.title.substring(0, 35)}...`);
      
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
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
                tags: `${niche}, elite product, premium quality, market-validated, trending, ${targetAudience}, ${storeStyle}, verified quality, bestseller, premium, high-demand, top-rated`,
                vendor: storeName || `${niche.charAt(0).toUpperCase() + niche.slice(1)} Elite Store`,
                metafields: {
                  market_confidence: (opportunityScore / 100).toFixed(2),
                  quality_score: product.qualityScore?.toFixed(1) || 'premium',
                  trend_status: 'elite-validated',
                  competition_level: competitionLevel,
                  market_opportunity: opportunityScore
                }
              }
            }
          });

          if (uploadError || !uploadResponse?.success) {
            const errorMsg = uploadError?.message || uploadResponse?.error || 'Upload failed';
            console.error(`❌ Upload attempt ${attempts + 1} failed for ${product.title}:`, errorMsg);
            
            attempts++;
            if (attempts < maxAttempts) {
              console.log(`🔄 Retrying upload for ${product.title} (attempt ${attempts + 1}/${maxAttempts})`);
              await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // Exponential backoff
              continue;
            } else {
              uploadErrors.push(`${product.title}: ${errorMsg} (after ${maxAttempts} attempts)`);
              break;
            }
          } else {
            uploadedCount++;
            console.log(`✅ Successfully published ELITE ${niche} product: ${product.title} (Quality: ${product.qualityScore?.toFixed(1) || 'Premium'}/100)`);
            break; // Success, exit retry loop
          }

        } catch (error) {
          console.error(`❌ Error uploading ${product.title} (attempt ${attempts + 1}):`, error);
          attempts++;
          if (attempts >= maxAttempts) {
            uploadErrors.push(`${product.title}: ${error.message} (after ${maxAttempts} attempts)`);
          } else {
            await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
          }
        }
      }

      // Enhanced rate limiting between products
      await new Promise(resolve => setTimeout(resolve, 2200));
    }

    onProgress(95, `🎯 Finalizing ELITE ${niche} store optimization...`);

    if (uploadedCount === 0) {
      throw new Error(`Failed to publish any elite ${niche} products. Errors: ${uploadErrors.join('; ')}`);
    }

    onProgress(100, `🏆 ${uploadedCount} ELITE ${niche} products are now LIVE!`);
    
    console.log(`🎉 ELITE SUCCESS: ${uploadedCount}/${enhancedProducts.length} elite ${niche} products published to Shopify with ${opportunityScore}/100 market opportunity score`);
    
    return {
      success: true,
      uploadedCount,
      totalProducts: enhancedProducts.length,
      errors: uploadErrors,
      niche,
      marketOpportunityScore: `${opportunityScore}/100`,
      competitionLevel,
      qualityStandards: '4.7+ rating, 2000+ orders, elite market validation',
      avgQualityScore: enhancedProducts.reduce((acc, p) => acc + (p.qualityScore || 85), 0) / enhancedProducts.length,
      message: `Successfully published ${uploadedCount} ELITE ${niche} products with verified market demand and superior quality! Market opportunity: ${opportunityScore}/100`
    };

  } catch (error) {
    console.error(`❌ ELITE: Premium ${niche} product generation failed:`, error);
    throw error;
  }
};

// Advanced helper function for sophisticated product diversity selection
function selectAdvancedDiverseProducts(products: any[], maxCount: number, niche: string): any[] {
  if (products.length <= maxCount) return products;
  
  const selected = [];
  const used = new Set<string>();
  const categoryUsage = new Map<string, number>();
  
  // Sort by comprehensive quality score
  const sorted = products.sort((a, b) => {
    const scoreA = (a.qualityScore || 0) + (a.rating * a.orders / 1000);
    const scoreB = (b.qualityScore || 0) + (b.rating * b.orders / 1000);
    return scoreB - scoreA;
  });
  
  for (const product of sorted) {
    if (selected.length >= maxCount) break;
    
    // Advanced similarity detection
    const titleWords = product.title.toLowerCase().split(' ').filter((w: string) => w.length > 3);
    const productCategory = extractProductCategory(product.title, niche);
    
    // Check for title similarity
    const isSimilar = Array.from(used).some((usedTitle: string) => {
      const usedWords = usedTitle.split(' ');
      const commonWords = titleWords.filter((word: string) => usedWords.includes(word));
      return commonWords.length > 2; // Similarity threshold
    });
    
    // Check for category diversity (max 3 per category)
    const categoryCount = categoryUsage.get(productCategory) || 0;
    const categoryLimit = Math.max(2, Math.floor(maxCount / 5)); // Dynamic category limit
    
    if (!isSimilar && categoryCount < categoryLimit) {
      selected.push(product);
      used.add(product.title.toLowerCase());
      categoryUsage.set(productCategory, categoryCount + 1);
    }
  }
  
  return selected;
}

// Helper function to extract product category for diversity
function extractProductCategory(title: string, niche: string): string {
  const titleLower = title.toLowerCase();
  
  const categoryKeywords: { [key: string]: string[] } = {
    'fitness': ['resistance', 'cardio', 'strength', 'yoga', 'recovery', 'tracking'],
    'pets': ['toy', 'food', 'care', 'safety', 'training', 'comfort'],
    'beauty': ['skincare', 'makeup', 'hair', 'tools', 'treatment', 'cleansing'],
    'tech': ['charging', 'audio', 'storage', 'protection', 'connectivity', 'display'],
    'kitchen': ['cooking', 'storage', 'cutting', 'measuring', 'cleaning', 'appliance'],
    'baby': ['feeding', 'safety', 'comfort', 'development', 'hygiene', 'transport']
  };
  
  const keywords = categoryKeywords[niche.toLowerCase()] || ['general'];
  
  for (const keyword of keywords) {
    if (titleLower.includes(keyword)) {
      return keyword;
    }
  }
  
  return 'general';
}

// Enhanced API key retrieval with advanced retry logic
async function getRapidApiKeyWithRetry(maxRetries: number): Promise<string | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke('get-rapidapi-key');
      if (!error && data?.rapidApiKey) {
        return data.rapidApiKey;
      }
      
      if (attempt < maxRetries) {
        console.warn(`API key retrieval attempt ${attempt} failed, retrying with exponential backoff...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt * attempt)); // Exponential backoff
      }
    } catch (error) {
      console.warn(`API key retrieval attempt ${attempt} error:`, error);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt * attempt));
      }
    }
  }
  
  return null;
}

async function getRapidApiKey(): Promise<string | null> {
  return getRapidApiKeyWithRetry(1);
}

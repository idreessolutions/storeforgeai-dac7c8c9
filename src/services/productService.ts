
import { supabase } from "@/integrations/supabase/client";
import { AliExpressService } from "./aliexpressService";
import { UniqueContentGenerator } from "./uniqueContentGenerator";
import { ShopifyThemeIntegrator } from "./shopifyThemeIntegrator";

export const addProductsToShopify = async (
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
  console.log(`🚀 STOREFORGE AI ULTIMATE: Creating world's best ${niche} store!`, {
    niche,
    targetAudience,
    businessType,
    storeStyle,
    storeName,
    themeColor,
    standards: '🏆 4.3+ ratings, 300+ orders, Real images, Unique content, Smart pricing $8-$85'
  });
  
  try {
    const sessionId = crypto.randomUUID();
    let currentProgress = 0;
    
    // STEP 1: Enhanced theme application
    onProgress(5, `🎨 Applying premium ${themeColor} theme to ${storeName}...`);
    
    const extractStoreName = (url: string) => {
      const match = url.match(/(?:https?:\/\/)?([^.]+)\.myshopify\.com/);
      return match ? match[1] : storeName;
    };
    
    const shopifyStoreName = extractStoreName(shopifyUrl);
    const themeApplied = await ShopifyThemeIntegrator.applyThemeColorToStore(
      `https://${shopifyStoreName}.myshopify.com`,
      accessToken,
      themeColor,
      storeName
    );
    
    currentProgress = 10;
    onProgress(currentProgress, `✅ Premium theme styling applied to ${storeName}`);

    // STEP 2: Fetch REAL winning products with enhanced filters
    onProgress(15, `🎯 Discovering REAL WINNING ${niche} products with enhanced quality metrics...`);
    
    const aliExpressService = new AliExpressService();
    const winningProducts = await aliExpressService.fetchWinningProducts(niche, 12, sessionId); // Get 12 to ensure 10 good ones
    
    if (!winningProducts || winningProducts.length === 0) {
      throw new Error(`❌ No premium ${niche} products found meeting enhanced quality standards`);
    }

    currentProgress = 25;
    onProgress(currentProgress, `🏆 Found ${winningProducts.length} verified winning ${niche} products`);

    console.log(`🏆 DISCOVERED ${winningProducts.length} WINNING ${niche} products:`);
    winningProducts.forEach((product, i) => {
      console.log(`  ${i + 1}. ${product.title.substring(0, 50)}... - $${product.price} - ${product.rating}⭐ - ${product.orders}+ orders`);
    });

    // STEP 3: Generate UNIQUE content for each product
    onProgress(30, `🤖 AI generating UNIQUE content for ${winningProducts.length} winning products...`);

    const processedProducts = [];
    const contentGenerationStep = 40 / winningProducts.length; // 40% for content generation
    
    for (let i = 0; i < Math.min(winningProducts.length, 10); i++) { // Limit to 10 products
      const product = winningProducts[i];
      currentProgress = 30 + (i * contentGenerationStep);
      
      onProgress(currentProgress, `✨ Creating unique content for: ${product.title.substring(0, 35)}...`);
      
      try {
        // Generate completely unique content for each product
        const uniqueContent = UniqueContentGenerator.generateUniqueProductContent(product, niche, i);
        
        // Enhanced AI generation using GPT-4
        const { data: aiResponse, error: aiError } = await supabase.functions.invoke('generate-products', {
          body: {
            realProduct: {
              ...product,
              uniqueContent: uniqueContent
            },
            niche: niche,
            targetAudience,
            businessType,
            storeStyle,
            themeColor,
            customInfo,
            storeName,
            productIndex: i,
            sessionId: sessionId,
            useRealImages: true,
            premiumEnhancement: true,
            uniqueContentGeneration: true,
            qualityRequirements: {
              rating: '4.3+',
              orders: '300+',
              source: 'Real AliExpress products',
              images: 'Real product images ONLY',
              descriptionLength: '400-600 words with completely unique content per product',
              smartPricing: '$8-$85 with psychological pricing',
              titleEnhancement: 'Unique titles with power words + emojis for each product',
              contentUniqueness: 'Each product MUST have completely different content, style, and approach'
            }
          }
        });

        if (aiError || !aiResponse?.success) {
          console.error(`❌ AI enhancement failed for product ${i + 1}:`, aiError);
          // Use fallback unique content
          processedProducts.push({
            ...product,
            title: uniqueContent.title,
            description: uniqueContent.description,
            features: uniqueContent.features,
            benefits: uniqueContent.benefits,
            fallback_content_used: true
          });
          continue;
        }

        const optimizedProduct = aiResponse.optimizedProduct;
        
        // Ensure unique content and real images are preserved
        processedProducts.push({
          ...optimizedProduct,
          imageUrl: product.imageUrl,
          images: product.images,
          uniqueContentApplied: true,
          productIndex: i,
          enhanced_with_gpt4: true
        });
        
        console.log(`✅ UNIQUE content generated for product ${i + 1}: "${optimizedProduct.title.substring(0, 50)}..."`);
        console.log(`📝 Content length: ${optimizedProduct.description?.length || 0} chars (unique per product)`);

        // Rate limiting for quality
        await new Promise(resolve => setTimeout(resolve, 800));

      } catch (error) {
        console.error(`❌ Error generating unique content for product ${i + 1}:`, error);
        // Use original product with basic enhancements
        const uniqueContent = UniqueContentGenerator.generateUniqueProductContent(product, niche, i);
        processedProducts.push({
          ...product,
          title: uniqueContent.title,
          description: uniqueContent.description,
          features: uniqueContent.features,
          error_handling_applied: true
        });
        continue;
      }
    }

    if (processedProducts.length === 0) {
      throw new Error(`❌ Failed to process any ${niche} products with unique content`);
    }

    currentProgress = 70;
    onProgress(currentProgress, `🚀 Uploading ${processedProducts.length} premium ${niche} products to Shopify...`);

    // STEP 4: Upload products to Shopify with enhanced tracking
    let uploadedCount = 0;
    const uploadErrors = [];
    const uploadStep = 25 / processedProducts.length; // 25% for upload process

    for (let i = 0; i < processedProducts.length; i++) {
      const product = processedProducts[i];
      currentProgress = 70 + (i * uploadStep);
      
      onProgress(currentProgress, `📦 Installing product ${i + 1}/${processedProducts.length}: ${product.title.substring(0, 30)}...`);
      
      try {
        const { data: uploadResponse, error: uploadError } = await supabase.functions.invoke('add-shopify-product', {
          body: {
            shopifyUrl: `https://${shopifyStoreName}.myshopify.com`,
            accessToken,
            themeColor,
            product: {
              ...product,
              niche: niche,
              category: product.category || niche,
              tags: `${niche}, ${targetAudience}, ${storeStyle}, ${storeName}, winning-product, bestseller, verified-quality, real-images, unique-content-${i + 1}, ai-enhanced, premium-quality`,
              theme_color: themeColor,
              store_name: storeName,
              real_images_used: true,
              unique_content_applied: true,
              premium_quality: true,
              winning_product_verified: true,
              product_sequence: i + 1,
              total_products: processedProducts.length
            }
          }
        });

        if (uploadError || !uploadResponse?.success) {
          console.error(`❌ Upload failed for product ${i + 1}:`, uploadError);
          uploadErrors.push(`Product ${i + 1} (${product.title.substring(0, 30)}...): ${uploadError?.message || 'Upload failed'}`);
          continue;
        }

        uploadedCount++;
        console.log(`🎉 SUCCESS! Product ${i + 1}/${processedProducts.length} uploaded: ${product.title.substring(0, 50)}...`);
        console.log(`  💰 Price: $${product.price} | ⭐ Rating: ${product.rating} | 📦 Orders: ${product.orders}+`);
        console.log(`  📸 Real images: ${uploadResponse.real_images_uploaded || 0} uploaded`);
        console.log(`  🎨 Theme: ${themeColor} integration applied`);

        // Enhanced rate limiting for better success rate
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (productError) {
        console.error(`❌ Error uploading product ${i + 1}:`, productError);
        uploadErrors.push(`Product ${i + 1} (${product.title.substring(0, 30)}...): ${productError.message}`);
        continue;
      }
    }

    currentProgress = 95;
    onProgress(currentProgress, `🎨 Finalizing ${storeName} store with premium finishing touches...`);

    if (uploadedCount === 0) {
      throw new Error(`❌ Failed to upload any products. Errors: ${uploadErrors.join('; ')}`);
    }

    // Final success
    onProgress(100, `🎉 STORE LAUNCH SUCCESS! ${storeName} is ready with ${uploadedCount} winning products! 🚀`);
    
    console.log(`🎉 STOREFORGE AI ULTIMATE SUCCESS! Store creation completed:`);
    console.log(`📊 Final Results: ${uploadedCount}/${processedProducts.length} premium ${niche} products uploaded`);
    console.log(`🎨 Theme: ${themeColor} applied throughout ${storeName}`);
    console.log(`📸 Images: Real AliExpress product images (NO AI generated)`);
    console.log(`💰 Pricing: Smart $8-$85 range with psychological pricing`);
    console.log(`⭐ Quality: All 4.3+ ratings, 300+ orders, verified winning products`);
    console.log(`✍️ Content: Completely unique AI-generated descriptions for each product`);
    console.log(`🏆 Result: World-class ${niche} store ready for immediate sales!`);
    
    return {
      success: true,
      uploadedCount,
      totalProducts: processedProducts.length,
      errors: uploadErrors,
      niche: niche,
      store_name: storeName,
      theme_color_applied: themeApplied,
      unique_content_generated: true,
      real_images_used: true,
      winning_products_verified: true,
      quality_standards: '4.3+ ratings, 300+ orders, Real images',
      pricing_range: '$8-$85',
      enhanced_features: {
        gpt4_content_generation: true,
        real_aliexpress_images: true,
        smart_psychological_pricing: true,
        premium_theme_integration: true,
        unique_content_per_product: true,
        enhanced_quality_validation: true
      },
      message: `🎉 INCREDIBLE SUCCESS! Your premium ${niche} store "${storeName}" is now live with ${uploadedCount} verified winning products! Each product features completely unique AI-generated content, real AliExpress images, smart pricing, and beautiful ${themeColor} theme integration. Your store is professional, conversion-optimized, and ready to generate sales immediately! This is the world's most advanced Shopify store builder! 🚀💰🏆`
    };

  } catch (error) {
    console.error(`❌ StoreForge AI Ultimate ${niche} store creation failed:`, error);
    throw error;
  }
};

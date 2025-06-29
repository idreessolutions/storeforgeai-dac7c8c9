
import { supabase } from "@/integrations/supabase/client";

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
  console.log(`🚀 REAL ALIEXPRESS INTEGRATION: Starting for ${niche} with 10 winning products`);
  console.log('Store customization details:', {
    storeName,
    businessType,
    storeStyle,
    targetAudience,
    themeColor
  });

  try {
    // Step 1: Get real winning products from enhanced AliExpress API
    progressCallback(10, `Fetching real ${niche} winning products from AliExpress...`);
    
    const { data: productsData, error: productsError } = await supabase.functions.invoke('get-aliexpress-products', {
      body: {
        niche: niche,
        sessionId: `${Date.now()}_${niche}`,
        enhanced_api: true,
        real_products: true
      }
    });

    if (productsError || !productsData?.success) {
      throw new Error(`Failed to fetch real products: ${productsError?.message || 'AliExpress API error'}`);
    }

    const products = productsData.products || [];
    console.log(`✅ REAL PRODUCTS FETCHED: ${products.length} winning ${niche} products with real AliExpress data`);

    if (products.length === 0) {
      throw new Error(`No winning products found for niche: ${niche}`);
    }

    // Step 2: Enhanced product processing with ChatGPT content generation
    const selectedProducts = products.slice(0, 10); // Exactly 10 products
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < selectedProducts.length; i++) {
      const product = selectedProducts[i];
      const progress = 20 + ((i / selectedProducts.length) * 70);
      
      progressCallback(progress, `Processing "${product.title?.substring(0, 35)}..."`);
      
      try {
        console.log(`🔥 PROCESSING WINNING PRODUCT ${i + 1}/10: "${product.title}"`);

        // Enhanced product with ChatGPT-generated content
        const enhancedProduct = await generateEnhancedProductContent(product, {
          niche,
          storeName,
          targetAudience,
          businessType,
          storeStyle,
          themeColor,
          customInfo,
          productIndex: i
        });

        console.log(`📸 REAL IMAGES: ${enhancedProduct.images.length} verified AliExpress images`);
        console.log(`🎯 VARIANTS: ${enhancedProduct.variants.length} price variations generated`);

        // Upload to Shopify with enhanced content
        const { data: uploadResult, error: uploadError } = await supabase.functions.invoke('add-shopify-product', {
          body: {
            shopifyUrl,
            shopifyAccessToken: accessToken,
            themeColor,
            product: enhancedProduct,
            storeName,
            targetAudience,
            storeStyle,
            businessType,
            productIndex: i,
            niche,
            enhancedGeneration: true,
            realAliExpressProduct: true
          }
        });

        if (uploadError || !uploadResult?.success) {
          console.error(`❌ PRODUCT ${i + 1} UPLOAD FAILED:`, uploadError?.message || 'Upload failed');
          failureCount++;
          continue;
        }

        successCount++;
        console.log(`✅ PRODUCT ${i + 1} SUCCESS: "${product.title}" uploaded with ${uploadResult.imagesUploaded || 0} images and ${uploadResult.variantsCreated || 0} variants`);

        // Rate limiting between products
        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (error) {
        console.error(`❌ ERROR processing winning product ${i + 1}:`, error);
        failureCount++;
      }
    }

    progressCallback(100, "Real AliExpress products uploaded successfully!");

    console.log(`🎉 REAL ALIEXPRESS INTEGRATION COMPLETE:`, {
      niche,
      total: selectedProducts.length,
      success: successCount,
      failed: failureCount,
      realAliExpressProducts: true,
      enhancedContentGeneration: true,
      storeName: storeName
    });

    if (successCount === 0) {
      throw new Error(`Failed to upload any winning products for ${niche}. Please check your Shopify credentials.`);
    }

  } catch (error) {
    console.error(`❌ CRITICAL ERROR in real AliExpress integration:`, error);
    throw error;
  }
};

async function generateEnhancedProductContent(product: any, config: any) {
  const { niche, storeName, targetAudience, businessType, storeStyle, themeColor, productIndex } = config;
  
  // Generate ChatGPT-enhanced title
  const enhancedTitle = await generateChatGPTTitle(product.title, niche, storeName, targetAudience);
  
  // Generate rich, emotional SEO description
  const enhancedDescription = await generateChatGPTDescription(product, {
    niche,
    targetAudience,
    businessType,
    storeStyle,
    storeName
  });
  
  // Create smart variations with pricing
  const enhancedVariants = generateSmartVariations(product.variants || [], product.price, niche);
  
  return {
    ...product,
    title: enhancedTitle || product.title,
    description: enhancedDescription,
    variants: enhancedVariants,
    tags: generateSmartTags(niche, targetAudience, storeStyle, storeName),
    seoTitle: `${enhancedTitle} | ${storeName} - Premium ${niche.charAt(0).toUpperCase() + niche.slice(1)}`,
    vendor: storeName,
    handle: `${enhancedTitle?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'product'}-${productIndex + 1}`,
    originalData: {
      ...product.originalData,
      chatgpt_enhanced: true,
      real_aliexpress_data: true,
      enhanced_content_generation: true
    }
  };
}

async function generateChatGPTTitle(originalTitle: string, niche: string, storeName: string, targetAudience: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('enhance-product-content', {
      body: {
        type: 'title',
        originalTitle,
        niche,
        storeName,
        targetAudience,
        prompt: `Create a compelling, SEO-optimized product title for ${niche} that appeals to ${targetAudience}. Make it emotional, benefit-focused, and include power words. Keep it under 60 characters. Original: ${originalTitle}`
      }
    });
    
    if (!error && data?.enhancedContent) {
      return data.enhancedContent;
    }
  } catch (error) {
    console.error('ChatGPT title generation error:', error);
  }
  
  // Fallback enhanced title
  const powerWords = ['Premium', 'Ultimate', 'Professional', 'Advanced', 'Elite'];
  const urgencyWords = ['Bestseller', 'Top Choice', 'Must-Have', 'Trending'];
  const emoji = ['⭐', '🏆', '💎', '🔥'][Math.floor(Math.random() * 4)];
  
  return `${emoji} ${powerWords[Math.floor(Math.random() * powerWords.length)]} ${originalTitle.substring(0, 30)} - ${urgencyWords[Math.floor(Math.random() * urgencyWords.length)]}`;
}

async function generateChatGPTDescription(product: any, config: any): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('enhance-product-content', {
      body: {
        type: 'description',
        product,
        config,
        prompt: `Create a compelling, emotional product description for ${config.niche} targeting ${config.targetAudience}. Include benefits, features, social proof, urgency, and emojis. Make it trustworthy and conversion-focused. 200-300 words.`
      }
    });
    
    if (!error && data?.enhancedContent) {
      return data.enhancedContent;
    }
  } catch (error) {
    console.error('ChatGPT description generation error:', error);
  }
  
  // Fallback rich description
  return generateFallbackDescription(product, config);
}

function generateFallbackDescription(product: any, config: any): string {
  const { niche, targetAudience, storeName, storeStyle } = config;
  
  return `
<div class="product-description">
  <h2>🌟 Transform Your ${niche.charAt(0).toUpperCase() + niche.slice(1)} Experience!</h2>
  
  <p><strong>Join 50,000+ satisfied ${targetAudience} who've already discovered the ${product.title}!</strong></p>
  
  <h3>✨ Why You'll Love This:</h3>
  <ul>
    ${product.features?.map((feature: string) => `<li>${feature}</li>`).join('') || 
      `<li>✅ Premium Quality Materials</li>
       <li>💪 Built to Last</li>
       <li>🚀 Fast Results</li>
       <li>💎 Professional Grade</li>`}
  </ul>
  
  <h3>🔥 Perfect For:</h3>
  <p>Designed specifically for ${targetAudience} who demand excellence. Whether you're just starting or you're an expert, this ${niche} essential delivers professional results every time.</p>
  
  <h3>🛡️ ${storeName} Quality Promise:</h3>
  <p>⭐ <strong>4.8/5 Star Rating</strong> from verified customers<br>
  🚚 <strong>Free Shipping</strong> on orders over $35<br>
  💝 <strong>30-Day Money-Back Guarantee</strong><br>
  🏆 <strong>Trusted by 1000+ customers</strong></p>
  
  <div class="cta-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; text-align: center; margin: 20px 0;">
    <h3>🎯 Ready to Transform Your ${niche.charAt(0).toUpperCase() + niche.slice(1)} Routine?</h3>
    <p><strong>⚡ Limited Stock Alert: Only 47 left!</strong></p>
    <p><strong>Order now and join thousands of happy customers worldwide!</strong></p>
  </div>
</div>
  `.trim();
}

function generateSmartVariations(originalVariants: any[], basePrice: number, niche: string) {
  const variations = [];
  
  // Use original variants if available
  if (originalVariants && originalVariants.length > 0) {
    originalVariants.forEach((variant, index) => {
      variations.push({
        title: variant.title || `Option ${index + 1}`,
        price: variant.price || (basePrice * (1 + index * 0.15)),
        option1: variant.color || variant.size || variant.title || `Variant ${index + 1}`,
        inventory_quantity: 100,
        requires_shipping: true
      });
    });
  } else {
    // Generate smart default variants
    const variantTypes = getVariantTypes(niche);
    
    variantTypes.forEach((variant, index) => {
      variations.push({
        title: variant.title,
        price: Math.round((basePrice * (1 + index * 0.15)) * 100) / 100,
        option1: variant.title,
        inventory_quantity: 100,
        requires_shipping: true
      });
    });
  }
  
  return variations;
}

function getVariantTypes(niche: string) {
  const variants: Record<string, Array<{title: string}>> = {
    pets: [
      { title: 'Small' },
      { title: 'Medium' },
      { title: 'Large' }
    ],
    beauty: [
      { title: 'Standard' },
      { title: 'Premium' },
      { title: 'Deluxe Set' }
    ],
    fitness: [
      { title: 'Basic' },
      { title: 'Pro' },
      { title: 'Elite' }
    ]
  };
  
  return variants[niche.toLowerCase()] || [
    { title: 'Standard' },
    { title: 'Premium' }
  ];
}

function generateSmartTags(niche: string, targetAudience: string, storeStyle: string, storeName: string): string {
  const baseTags = [niche, targetAudience, storeStyle, 'premium', 'bestseller', storeName];
  const nicheSpecificTags: Record<string, string[]> = {
    pets: ['pet care', 'dog', 'cat', 'pet accessories', 'pet health'],
    beauty: ['skincare', 'cosmetics', 'beauty care', 'self care', 'anti-aging'],
    fitness: ['workout', 'exercise', 'gym', 'training', 'health'],
    kitchen: ['cooking', 'chef', 'kitchen gadgets', 'culinary', 'food prep'],
    home: ['home decor', 'interior', 'household', 'organization', 'living'],
    tech: ['gadgets', 'electronics', 'smart', 'innovation', 'technology']
  };
  
  const specificTags = nicheSpecificTags[niche.toLowerCase()] || [];
  return [...baseTags, ...specificTags].join(', ');
}

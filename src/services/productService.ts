
import { supabase } from "@/integrations/supabase/client";

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
  console.log(`🚀 Starting AI-powered product generation for ${niche} niche`);
  
  try {
    // Step 1: Try AI generation with shorter timeout, then fallback
    onProgress(10, 'AI is analyzing trending market data...');
    
    console.log('📡 Calling generate-products edge function with:', {
      niche,
      targetAudience,
      businessType,
      storeStyle,
      themeColor,
      customInfo
    });

    let products;
    
    try {
      // Try AI generation with 60 second timeout
      const response = await Promise.race([
        supabase.functions.invoke('generate-products', {
          body: {
            niche,
            targetAudience,
            businessType,
            storeStyle,
            themeColor,
            customInfo
          }
        }) as Promise<{ data: any; error: any }>,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI_TIMEOUT')), 60000) // 1 minute timeout
        )
      ]) as { data: any; error: any };

      if (response.error) {
        throw new Error(response.error.message || 'AI service error');
      }

      if (response.data && response.data.success) {
        products = response.data.products;
        console.log(`✅ AI generated ${products.length} products`);
      } else {
        throw new Error('Invalid AI response');
      }
    } catch (aiError) {
      console.warn('⚠️ AI generation failed, using fallback products:', aiError);
      onProgress(20, 'Using curated product database...');
      
      // Fallback to local product generation
      products = generateFallbackProducts(niche, targetAudience);
      console.log(`✅ Generated ${products.length} fallback products for ${niche}`);
    }

    if (!products || products.length === 0) {
      throw new Error(`No ${niche} products found. Please try again.`);
    }

    onProgress(30, 'Products ready! Starting upload...');

    // Step 2: Upload each product to Shopify
    const totalProducts = products.length;
    let uploadedCount = 0;

    for (let i = 0; i < totalProducts; i++) {
      const product = products[i];
      const progressPercent = 30 + ((i / totalProducts) * 65);
      
      onProgress(progressPercent, `Creating: ${product.title}`);
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

        // Small delay between uploads to avoid rate limiting
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
    
    console.log(`🎉 Successfully uploaded ${uploadedCount}/${totalProducts} ${niche} products to Shopify`);
    
    return {
      success: true,
      uploadedCount,
      totalProducts,
      message: `Successfully added ${uploadedCount} trending ${niche} products to your store!`
    };

  } catch (error) {
    console.error(`❌ Product generation workflow failed for ${niche}:`, error);
    throw error;
  }
};

function generateFallbackProducts(niche: string, targetAudience: string) {
  const productDatabase = {
    'beauty': [
      { 
        title: 'Hydrating Face Serum with Vitamin C', 
        description: `Transform your skin with this powerful hydrating serum! ✨ Perfect for ${targetAudience}, this premium serum contains vitamin C, hyaluronic acid, and natural botanicals. Reduces fine lines, brightens complexion, and provides all-day moisture. Dermatologist tested and cruelty-free.`,
        features: ['Vitamin C & Hyaluronic Acid', 'Anti-Aging Formula', 'Brightens Complexion', 'All Skin Types'],
        benefits: ['Reduces Fine Lines', 'Deep Hydration', 'Glowing Skin'],
        recommendedPrice: 45.99,
        images: [{ url: 'https://via.placeholder.com/400x400/f0f0f0/999?text=Face+Serum', alt: 'Hydrating Face Serum' }],
        category: 'Beauty'
      },
      { 
        title: 'LED Beauty Face Mask - Professional Grade', 
        description: `Experience spa-quality skincare at home! 🌟 This advanced LED face mask uses red and blue light therapy to rejuvenate skin, reduce acne, and boost collagen production. Perfect for ${targetAudience} who want professional results without the salon price.`,
        features: ['Red & Blue Light Therapy', 'Collagen Boost', 'Acne Treatment', 'Professional Grade'],
        benefits: ['Younger Looking Skin', 'Clearer Complexion', 'Reduced Wrinkles'],
        recommendedPrice: 89.99,
        images: [{ url: 'https://via.placeholder.com/400x400/f0f0f0/999?text=LED+Mask', alt: 'LED Beauty Face Mask' }],
        category: 'Beauty'
      },
      { 
        title: 'Jade Facial Roller & Gua Sha Set', 
        description: `Ancient beauty secrets for modern skin! 🌿 This premium jade roller and gua sha set promotes lymphatic drainage, reduces puffiness, and enhances product absorption. Perfect for ${targetAudience} seeking natural anti-aging solutions.`,
        features: ['100% Natural Jade', 'Lymphatic Drainage', 'Reduces Puffiness', 'Includes Gua Sha'],
        benefits: ['Tighter Skin', 'Reduced Puffiness', 'Better Circulation'],
        recommendedPrice: 29.99,
        images: [{ url: 'https://via.placeholder.com/400x400/f0f0f0/999?text=Jade+Roller', alt: 'Jade Facial Roller' }],
        category: 'Beauty'
      },
      { 
        title: 'Professional Hair Styling Tool Set', 
        description: `Salon-quality styling at home! 💁‍♀️ This complete hair styling set includes a ceramic hair straightener, curling wand, and heat protectant spray. Perfect for ${targetAudience} who want professional results every day.`,
        features: ['Ceramic Technology', 'Multiple Heat Settings', 'Heat Protectant Included', 'Professional Grade'],
        benefits: ['Salon Results', 'Hair Protection', 'Versatile Styling'],
        recommendedPrice: 79.99,
        images: [{ url: 'https://via.placeholder.com/400x400/f0f0f0/999?text=Hair+Tools', alt: 'Hair Styling Tools' }],
        category: 'Beauty'
      },
      { 
        title: 'Complete Skincare Travel Kit', 
        description: `Your skincare routine, anywhere you go! ✈️ This travel-friendly kit includes cleanser, toner, serum, and moisturizer in TSA-approved sizes. Perfect for ${targetAudience} who never compromise on skincare, even while traveling.`,
        features: ['TSA Approved Sizes', 'Complete Routine', 'Premium Ingredients', 'Travel Case Included'],
        benefits: ['Convenient Travel', 'Consistent Results', 'Healthy Skin Anywhere'],
        recommendedPrice: 39.99,
        images: [{ url: 'https://via.placeholder.com/400x400/f0f0f0/999?text=Travel+Kit', alt: 'Skincare Travel Kit' }],
        category: 'Beauty'
      }
    ],
    'fitness': [
      { 
        title: 'Resistance Band Set - 11 Pieces', 
        description: `Complete home gym in one set! 💪 This professional resistance band set includes 5 bands, handles, door anchor, ankle straps, and workout guide. Perfect for ${targetAudience} who want effective workouts anywhere.`,
        features: ['11-Piece Set', 'Multiple Resistance Levels', 'Door Anchor Included', 'Workout Guide'],
        benefits: ['Full Body Workout', 'Portable Exercise', 'Build Strength'],
        recommendedPrice: 34.99,
        images: [{ url: 'https://via.placeholder.com/400x400/f0f0f0/999?text=Resistance+Bands', alt: 'Resistance Band Set' }],
        category: 'Fitness'
      }
    ],
    'tech': [
      { 
        title: 'Fast Wireless Charging Pad with Cooling', 
        description: `Charge faster, stay cooler! ⚡ This advanced wireless charger features built-in cooling fan and fast-charge technology. Perfect for ${targetAudience} who demand the latest tech innovations.`,
        features: ['Fast Charging', 'Built-in Cooling', 'Universal Compatibility', 'LED Indicators'],
        benefits: ['Faster Charging', 'Device Protection', 'Convenient Use'],
        recommendedPrice: 34.99,
        images: [{ url: 'https://via.placeholder.com/400x400/f0f0f0/999?text=Wireless+Charger', alt: 'Wireless Charging Pad' }],
        category: 'Tech'
      }
    ]
  };

  const nicheProducts = productDatabase[niche.toLowerCase()] || productDatabase['beauty'];
  
  // Add variants to each product
  return nicheProducts.map(product => ({
    ...product,
    variants: [
      {
        title: 'Standard',
        price: product.recommendedPrice,
        inventory_quantity: 100,
        option1: 'Standard'
      }
    ],
    source: 'curated'
  }));
}

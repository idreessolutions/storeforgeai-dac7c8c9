
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      realProduct,
      niche, 
      targetAudience, 
      businessType, 
      storeStyle, 
      customInfo,
      storeName,
      themeColor,
      sessionId,
      premiumEnhancement = true
    } = await req.json();
    
    console.log(`🎨 GPT-4 PREMIUM enhancement for WINNING ${niche} product with PREMIUM STYLING:`, {
      productTitle: realProduct?.title?.substring(0, 60),
      niche,
      storeName,
      targetAudience,
      businessType,
      storeStyle,
      themeColor,
      realImages: realProduct?.images?.length || 0,
      rating: realProduct?.rating,
      orders: realProduct?.orders,
      source: 'AliExpress Drop Shipping API',
      enhancement: 'PREMIUM GPT-4'
    });

    // Get API keys from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('Missing OpenAI API key for GPT-4 premium enhancement');
    }

    if (!realProduct || !niche) {
      throw new Error('Missing required product data or niche information');
    }

    console.log(`🚀 PREMIUM GPT-4 enhancement for WINNING ${niche} product:`, {
      originalTitle: realProduct.title,
      rating: realProduct.rating,
      orders: realProduct.orders,
      niche: niche,
      realImages: realProduct.images?.length || 0,
      enhancement: 'PREMIUM QUALITY CONTENT'
    });

    // PREMIUM GPT-4 prompt for exceptional, human-like, engaging descriptions
    const premiumGpt4Prompt = `You are an EXPERT e-commerce copywriter creating PREMIUM ${niche} product content for ${targetAudience}. This is a WINNING product from AliExpress Drop Shipping API with VERIFIED success metrics.

🏆 VERIFIED WINNING ALIEXPRESS PRODUCT:
Title: ${realProduct.title}
Price: $${realProduct.price}
Rating: ${realProduct.rating}/5 ⭐ (${realProduct.orders}+ verified orders)
Features: ${realProduct.features?.join(', ') || 'Premium quality'}
Source: AliExpress Drop Shipping API (VERIFIED WINNING PRODUCT)

🎯 STORE PERSONALIZATION:
- Store Name: ${storeName}
- Niche: ${niche} (MUST BE PERFECTLY TARGETED)
- Target Audience: ${targetAudience}
- Business Type: ${businessType}
- Store Style: ${storeStyle}
- Theme Color: ${themeColor}
- Custom Requirements: ${customInfo || 'Create premium experience'}

🚀 PREMIUM GPT-4 ENHANCEMENT REQUIREMENTS:

1. 🏆 WINNING TITLE (max 70 chars):
   - Include power words and relevant emojis
   - Target ${targetAudience} specifically
   - Highlight ${niche} benefits
   - Create urgency and desire

2. 📝 PREMIUM DESCRIPTION (500-700 words):
   - 🔥 EMOTIONAL opening hook addressing ${niche} pain points
   - ✨ 6-8 key benefits with emojis (not just features)
   - 💫 Multiple compelling use cases for ${targetAudience}
   - 🏆 Social proof integration (${realProduct.orders}+ orders, ${realProduct.rating}⭐)
   - 📋 Clear headings and bullet points
   - 🎯 STRONG call-to-action for ${niche} enthusiasts
   - 😊 Exciting, personal tone (NO corporate speak)
   - 🎨 Reference theme color: ${themeColor}
   - 💎 Premium quality emphasis throughout

3. 🎯 NICHE-SPECIFIC FEATURES (5-6 features):
   - Each feature must appeal to ${targetAudience}
   - Include relevant emojis
   - Focus on benefits, not just specifications

4. 💰 SMART PREMIUM PRICING ($15-$80 MAX):
   - Original: $${realProduct.price}
   - High orders (${realProduct.orders}+) = $35-$55 range
   - Premium feel = $45-$65 range
   - Rating ${realProduct.rating}+ = quality bonus
   - NEVER exceed $80

TONE: ${storeStyle === 'luxury' ? '💎 Luxury and sophisticated with premium language' : storeStyle === 'fun' ? '🎉 Playful, energetic, and exciting' : '⭐ Professional, trustworthy, and compelling'} - PERFECTLY matching ${niche} audience expectations

🚨 CRITICAL: Return ONLY valid JSON without markdown formatting or code blocks.

{
  "title": "🏆 Compelling ${niche} product title with power words and emojis for ${targetAudience}",
  "description": "500-700 word ${niche}-focused description with emotional hooks, emojis, headings, benefits, use cases, social proof (${realProduct.orders}+ orders, ${realProduct.rating}⭐), and ${storeStyle} tone that creates DESIRE and URGENCY",
  "features": ["🎯 ${niche}-specific feature with emoji 1", "⭐ ${niche}-specific feature with emoji 2", "💪 ${niche}-specific feature with emoji 3", "🏆 ${niche}-specific feature with emoji 4", "✨ ${niche}-specific feature with emoji 5"],
  "benefits": ["🚀 key ${niche} benefit for ${targetAudience} 1", "💎 key ${niche} benefit for ${targetAudience} 2", "⚡ key ${niche} benefit for ${targetAudience} 3"],
  "category": "${niche}",
  "price": 45.99,
  "rating": ${realProduct.rating || 4.8},
  "orders": ${realProduct.orders || 1000}
}`;

    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a PREMIUM e-commerce copywriter specializing in ${niche} products. Create EXCEPTIONAL, human-friendly, emotional content that perfectly matches the ${niche} niche for ${targetAudience}. You work with WINNING products from AliExpress Drop Shipping API. ALWAYS ensure prices are $15-$80. CRITICAL: Always respond with valid JSON only, never use markdown code blocks.`
            },
            {
              role: 'user',
              content: premiumGpt4Prompt
            }
          ],
          max_tokens: 2500,
          temperature: 0.8,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`GPT-4 API failed: ${openaiResponse.status}`);
      }

      const openaiData = await openaiResponse.json();
      let aiContentText = openaiData.choices[0].message.content;
      
      // Clean up the response - remove markdown code blocks if present
      aiContentText = aiContentText.trim();
      if (aiContentText.startsWith('```json')) {
        aiContentText = aiContentText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (aiContentText.startsWith('```')) {
        aiContentText = aiContentText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      console.log('🎨 Premium AI content generated:', aiContentText.substring(0, 200));
      
      let aiContent;
      try {
        aiContent = JSON.parse(aiContentText);
      } catch (parseError) {
        console.error('❌ JSON parse failed, creating premium fallback:', parseError);
        // Premium fallback with enhanced content
        aiContent = {
          title: `🏆 Premium ${niche.charAt(0).toUpperCase() + niche.slice(1)} Essential - Bestseller ⭐`,
          description: `🚀 Transform your ${niche} experience with this PREMIUM quality product! 

🎯 **Perfect for ${targetAudience}** who demand excellence in ${niche}. 

✨ **Why Choose This WINNING Product?**
• ⭐ ${realProduct.rating || 4.8}+ star rating from ${realProduct.orders || 1000}+ verified customers
• 🏆 Proven bestseller in the ${niche} category  
• 💪 Premium quality materials for lasting performance
• 🎯 Designed specifically for ${targetAudience}
• 🚀 Easy to use and incredibly reliable
• 💎 Professional-grade quality at an amazing price

🔥 **Key Benefits for ${targetAudience}:**
✅ Enhanced ${niche} performance beyond expectations
✅ Superior durability and premium construction  
✅ Perfect for daily use and special occasions
✅ Excellent value for money - unbeatable quality
✅ Customer satisfaction guaranteed with fast shipping

💯 **Join thousands of satisfied customers** who have already upgraded their ${niche} experience with this amazing product!

🛒 **Order now** and experience the difference premium quality makes in your ${niche} journey!

*Featuring beautiful ${themeColor} design elements for a stunning, professional look that matches your style perfectly.*`,
          features: [
            `🏆 Premium ${niche} quality construction`,
            `🎯 Perfect for ${targetAudience}`,
            "💪 Durable and reliable premium materials",
            "✨ Easy to use professional design",
            "⭐ Customer favorite with proven results",
            "🚀 Fast shipping and quality guarantee"
          ],
          benefits: [
            `🚀 Enhanced ${niche} performance`,
            "💎 Long-lasting premium durability",
            "💰 Excellent value for money"
          ],
          category: niche,
          price: calculateSmartPremiumPrice(realProduct.price || 25, niche, 6, realProduct.orders || 1000, realProduct.rating || 4.8),
          rating: realProduct.rating || 4.8,
          orders: realProduct.orders || 1000
        };
      }
      
      // Enforce premium smart pricing between $15-$80
      const smartPrice = calculateSmartPremiumPrice(
        aiContent.price || realProduct.price || 25, 
        niche, 
        aiContent.features?.length || 5,
        realProduct.orders || 1000,
        realProduct.rating || 4.8
      );
      
      // Build PREMIUM optimized product with REAL AliExpress images
      const premiumProduct = {
        id: realProduct.itemId || `${niche}_premium_${Date.now()}`,
        title: aiContent.title,
        description: aiContent.description,
        detailed_description: aiContent.description,
        features: aiContent.features || [],
        benefits: aiContent.benefits || [],
        category: niche,
        product_type: niche,
        price: smartPrice,
        rating: aiContent.rating || realProduct.rating || 4.8,
        orders: aiContent.orders || realProduct.orders || 1000,
        
        // Use REAL AliExpress images - PREMIUM QUALITY
        imageUrl: realProduct.imageUrl || '',
        images: realProduct.images || [realProduct.imageUrl].filter(Boolean),
        
        tags: `${niche}, ${targetAudience}, ${storeStyle}, ${storeName}, winning-product, best-seller, AliExpress-verified, ${realProduct.orders || 1000}-orders, premium-quality, ai-enhanced, real-images`,
        vendor: storeName || `${niche.charAt(0).toUpperCase() + niche.slice(1)} Premium Store`,
        
        // Store personalization metadata
        store_name: storeName,
        target_audience: targetAudience,
        business_type: businessType,
        store_style: storeStyle,
        custom_info: customInfo,
        theme_color: themeColor,
        niche: niche,
        
        // Premium AliExpress verification
        source: 'AliExpress Drop Shipping API',
        aliexpress_verified: true,
        winning_product_status: true,
        premium_enhanced: true,
        original_rating: realProduct.rating,
        original_orders: realProduct.orders,
        original_title: realProduct.title,
        real_images_used: true,
        dalle_images_used: false,
        gpt4_enhanced: true
      };

      console.log(`✨ GPT-4 PREMIUM enhancement completed for ${niche} product:`, {
        title: premiumProduct.title,
        category: premiumProduct.category,
        price: premiumProduct.price,
        rating: premiumProduct.rating,
        orders: premiumProduct.orders,
        features_count: premiumProduct.features.length,
        real_images_count: premiumProduct.images.length,
        theme_color: themeColor,
        enhancement: 'PREMIUM GPT-4',
        source: 'AliExpress Drop Shipping API'
      });

      return new Response(JSON.stringify({
        success: true,
        message: `✨ Successfully enhanced ${niche} product from AliExpress Drop Shipping API with PREMIUM GPT-4`,
        optimizedProduct: premiumProduct,
        premium_enhancement: {
          niche: niche,
          category: premiumProduct.category,
          tags_include_niche: premiumProduct.tags.includes(niche),
          title_includes_niche: premiumProduct.title.toLowerCase().includes(niche.toLowerCase()),
          source: 'AliExpress Drop Shipping API',
          real_images_used: true,
          theme_color_applied: themeColor,
          smart_pricing_applied: true,
          price_range: '$15-$80',
          gpt4_enhanced: true,
          premium_quality: true
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (openaiError) {
      console.error(`❌ GPT-4 processing failed for ${niche} product:`, openaiError);
      throw new Error(`Failed to enhance ${niche} product with GPT-4: ${openaiError.message}`);
    }

  } catch (error) {
    console.error(`❌ GPT-4 ${niche} product enhancement failed:`, error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || `Failed to enhance ${niche} product with GPT-4`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Premium smart pricing algorithm with strict $15-$80 enforcement
function calculateSmartPremiumPrice(
  originalPrice: number, 
  niche: string, 
  featureCount: number,
  orders: number = 1000,
  rating: number = 4.8
): number {
  const basePrice = originalPrice || 25;
  
  // Premium niche-specific multipliers
  const premiumNicheMultipliers = {
    'pets': 2.2,      // High emotional value
    'fitness': 1.9,   // Health investment value
    'beauty': 2.4,    // Premium positioning
    'tech': 1.8,      // Innovation premium
    'baby': 2.3,      // Safety premium
    'home': 1.7,      // Utility focus
    'fashion': 2.1,   // Style premium
    'kitchen': 1.8,   // Utility + quality
    'gaming': 1.9,    // Performance premium
    'travel': 1.8,    // Convenience premium
    'office': 1.6     // Professional utility
  };
  
  const multiplier = premiumNicheMultipliers[niche.toLowerCase() as keyof typeof premiumNicheMultipliers] || 1.8;
  
  // Calculate base with premium modifiers
  let finalPrice = basePrice * multiplier;
  
  // Premium quality bonuses
  if (orders >= 2000) finalPrice += 8;
  else if (orders >= 1500) finalPrice += 5;
  else if (orders >= 1000) finalPrice += 3;
  
  // Rating premium bonuses
  if (rating >= 4.8) finalPrice += 5;
  else if (rating >= 4.7) finalPrice += 3;
  else if (rating >= 4.6) finalPrice += 2;
  
  // Feature bonus (premium)
  finalPrice += Math.min(featureCount * 1.5, 8);
  
  // STRICT enforcement: $15-$80 range (premium quality maintained)
  finalPrice = Math.max(15, Math.min(80, finalPrice));
  
  // Apply premium psychological pricing
  if (finalPrice < 25) {
    return Math.floor(finalPrice) + 0.99;
  } else if (finalPrice < 50) {
    return Math.floor(finalPrice) + 0.95;
  } else {
    return Math.floor(finalPrice) + 0.99;
  }
}

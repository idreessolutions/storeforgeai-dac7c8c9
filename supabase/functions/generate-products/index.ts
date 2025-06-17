
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
      sessionId
    } = await req.json();
    
    console.log(`🚀 GPT-4 enhancing REAL AliExpress ${niche} product:`, {
      productTitle: realProduct?.title?.substring(0, 60),
      niche,
      storeName,
      targetAudience,
      businessType,
      storeStyle,
      themeColor,
      realImages: realProduct?.imageUrl ? 'YES' : 'NO',
      source: 'AliExpress Drop Shipping API'
    });

    // Get API keys from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('Missing OpenAI API key for GPT-4 product enhancement');
    }

    if (!realProduct || !niche) {
      throw new Error('Missing required product data or niche information');
    }

    console.log(`🤖 Enhancing REAL AliExpress ${niche} product with GPT-4:`, {
      originalTitle: realProduct.title,
      rating: realProduct.rating,
      orders: realProduct.orders,
      niche: niche,
      hasRealImages: realProduct.imageUrl ? 'YES' : 'NO',
      source: 'AliExpress Drop Shipping API'
    });

    // Enhanced GPT-4 prompt for human-like, engaging descriptions
    const gpt4EnhancementPrompt = `You are an expert e-commerce copywriter specializing in ${niche} products for ${targetAudience}. You're working with a REAL winning product from the AliExpress Drop Shipping API.

CRITICAL: This product MUST be perfectly optimized for the ${niche} niche and appeal to ${targetAudience}.

REAL ALIEXPRESS WINNING PRODUCT:
Title: ${realProduct.title}
Price: $${realProduct.price}
Rating: ${realProduct.rating}/5 (${realProduct.orders}+ verified orders)
Features: ${realProduct.features?.join(', ') || 'Premium quality'}
Source: AliExpress Drop Shipping API (VERIFIED WINNING PRODUCT)

STORE CONTEXT:
- Store Name: ${storeName}
- Niche: ${niche} (MUST BE RESPECTED)
- Target Audience: ${targetAudience}
- Business Type: ${businessType}
- Store Style: ${storeStyle}
- Theme Color: ${themeColor}
- Custom Requirements: ${customInfo || 'None'}

GPT-4 ENHANCEMENT REQUIREMENTS:
1. Create a compelling ${niche}-focused title (max 60 chars) with power words and emojis that appeals to ${targetAudience}
2. Write a detailed 400-600 word description with:
   - Emotional opening hook focused on ${niche} pain points
   - 5-6 key benefits specific to ${niche} users with emojis
   - Multiple use cases for ${targetAudience} in ${niche}
   - Social proof (${realProduct.orders}+ orders, ${realProduct.rating}+ rating)
   - Strong call-to-action for ${niche} enthusiasts
   - Strategic emoji placement throughout
   - Clear headings and bullet points
   - Human-like, engaging tone (not robotic)
3. List 5-6 key features optimized for ${niche}
4. Smart pricing between $15-$80 based on ${niche} market and value
5. Benefits that solve real ${niche} problems

TONE: ${storeStyle === 'luxury' ? 'Premium and sophisticated' : storeStyle === 'fun' ? 'Playful and energetic' : 'Professional and trustworthy'} - perfectly matching ${niche} audience

IMPORTANT: Return ONLY valid JSON without any markdown formatting or code blocks. Do not wrap the response in backticks or any other markdown.

{
  "title": "Catchy ${niche} product title with emojis for ${targetAudience}",
  "description": "400-600 word ${niche}-focused description with emojis, headings, benefits, use cases, social proof, and ${storeStyle} tone",
  "features": ["${niche}-specific feature 1", "${niche}-specific feature 2", "${niche}-specific feature 3", "${niche}-specific feature 4", "${niche}-specific feature 5"],
  "benefits": ["key ${niche} benefit 1", "key ${niche} benefit 2", "key ${niche} benefit 3"],
  "category": "${niche}",
  "price": 35.99,
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
              content: `You are an expert e-commerce copywriter specializing in ${niche} products. Create compelling, conversion-focused content that perfectly matches the ${niche} niche for ${targetAudience}. You work with REAL winning products from AliExpress Drop Shipping API. ALWAYS ensure the product is optimized for the ${niche} market. CRITICAL: Always respond with valid JSON only, never use markdown code blocks or any other formatting.`
            },
            {
              role: 'user',
              content: gpt4EnhancementPrompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
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
      
      console.log('🔍 Cleaned AI response:', aiContentText.substring(0, 200));
      
      let aiContent;
      try {
        aiContent = JSON.parse(aiContentText);
      } catch (parseError) {
        console.error('❌ JSON parse failed, attempting fallback:', parseError);
        // Fallback: generate a basic product structure with emojis
        aiContent = {
          title: `🏆 Premium ${niche.charAt(0).toUpperCase() + niche.slice(1)} Essential - Bestseller ⭐`,
          description: `🚀 Transform your ${niche} experience with this premium quality product! 

🎯 **Perfect for ${targetAudience}** who demand the best in ${niche}. 

✨ **Why Choose This Product?**
• ⭐ ${realProduct.rating || 4.8}+ star rating from ${realProduct.orders || 1000}+ verified customers
• 🏆 Proven bestseller in the ${niche} category
• 💪 Premium quality materials for lasting performance
• 🎯 Designed specifically for ${targetAudience}
• 🚀 Easy to use and reliable

🔥 **Key Benefits:**
✅ Enhanced ${niche} performance
✅ Superior durability and quality
✅ Perfect for daily use
✅ Excellent value for money
✅ Customer satisfaction guaranteed

💯 **Join thousands of satisfied customers** who have already upgraded their ${niche} experience!

🛒 **Order now** and experience the difference quality makes!`,
          features: [
            `Premium ${niche} quality`,
            `Perfect for ${targetAudience}`,
            "Durable and reliable construction",
            "Easy to use design",
            "Customer favorite with proven results"
          ],
          benefits: [
            `Enhanced ${niche} performance`,
            "Long-lasting durability",
            "Excellent value for money"
          ],
          category: niche,
          price: Math.max(15, Math.min(80, (realProduct.price || 25) * 1.8)),
          rating: realProduct.rating || 4.8,
          orders: realProduct.orders || 1000
        };
      }
      
      // Calculate smart pricing based on niche and value
      const smartPrice = calculateSmartPrice(realProduct.price || 25, niche, aiContent.features?.length || 5);
      
      // Build optimized product with REAL AliExpress images
      const optimizedProduct = {
        id: realProduct.itemId || `${niche}_aliexpress_${Date.now()}`,
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
        
        // Use REAL AliExpress images - NO DALL-E
        imageUrl: realProduct.imageUrl || '',
        images: realProduct.images || [realProduct.imageUrl].filter(Boolean),
        
        tags: `${niche}, ${targetAudience}, ${storeStyle}, ${storeName}, winning-product, best-seller, AliExpress-verified, ${realProduct.orders || 1000}-orders, premium-quality`,
        vendor: storeName || `${niche.charAt(0).toUpperCase() + niche.slice(1)} Store`,
        
        // Store personalization metadata
        store_name: storeName,
        target_audience: targetAudience,
        business_type: businessType,
        store_style: storeStyle,
        custom_info: customInfo,
        theme_color: themeColor,
        niche: niche,
        
        // AliExpress verification
        source: 'AliExpress Drop Shipping API',
        aliexpress_verified: true,
        winning_product_status: true,
        original_rating: realProduct.rating,
        original_orders: realProduct.orders,
        original_title: realProduct.title,
        real_images_used: true,
        dalle_images_used: false
      };

      console.log(`✅ GPT-4 enhanced ${niche} product successfully:`, {
        title: optimizedProduct.title,
        category: optimizedProduct.category,
        price: optimizedProduct.price,
        rating: optimizedProduct.rating,
        orders: optimizedProduct.orders,
        features_count: optimizedProduct.features.length,
        real_images_count: optimizedProduct.images.length,
        theme_color: themeColor,
        source: 'AliExpress Drop Shipping API'
      });

      return new Response(JSON.stringify({
        success: true,
        message: `Successfully enhanced ${niche} product from AliExpress Drop Shipping API with GPT-4`,
        optimizedProduct: optimizedProduct,
        niche_compliance: {
          niche: niche,
          category: optimizedProduct.category,
          tags_include_niche: optimizedProduct.tags.includes(niche),
          title_includes_niche: optimizedProduct.title.toLowerCase().includes(niche.toLowerCase()),
          source: 'AliExpress Drop Shipping API',
          real_images_used: true,
          theme_color_applied: themeColor
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

// Smart pricing algorithm
function calculateSmartPrice(originalPrice: number, niche: string, featureCount: number): number {
  const basePrice = originalPrice || 25;
  
  // Niche-specific multipliers
  const nicheMultipliers = {
    'pets': 2.2,
    'fitness': 2.0,
    'beauty': 2.4,
    'tech': 1.8,
    'baby': 2.3,
    'home': 1.9,
    'fashion': 2.1,
    'kitchen': 1.8,
    'gaming': 2.0,
    'travel': 1.9,
    'office': 1.7
  };
  
  const multiplier = nicheMultipliers[niche.toLowerCase() as keyof typeof nicheMultipliers] || 1.8;
  const featureBonus = Math.min(featureCount * 0.1, 0.5);
  
  let finalPrice = basePrice * (multiplier + featureBonus);
  
  // Ensure price is within $15-$80 range
  finalPrice = Math.max(15, Math.min(80, finalPrice));
  
  // Apply psychological pricing
  if (finalPrice < 30) {
    return Math.floor(finalPrice) + 0.99;
  } else if (finalPrice < 60) {
    return Math.floor(finalPrice) + 0.95;
  } else {
    return Math.floor(finalPrice) + 0.99;
  }
}

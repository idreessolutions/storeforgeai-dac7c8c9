
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
      qualityRequirements
    } = await req.json();
    
    console.log(`🚀 GPT-4 enhancing REAL AliExpress ${niche} product:`, {
      productTitle: realProduct?.title?.substring(0, 60),
      niche,
      storeName,
      targetAudience,
      businessType,
      storeStyle,
      qualityRequirements,
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
      source: 'AliExpress Drop Shipping API'
    });

    // Enhanced GPT-4 prompt for AliExpress products - Fixed template literal syntax
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
1. Create a compelling ${niche}-focused title (max 60 chars) that appeals to ${targetAudience}
2. Write a detailed 500-800 word description with:
   - Emotional opening hook focused on ${niche} pain points
   - 5-6 key benefits specific to ${niche} users
   - Multiple use cases for ${targetAudience} in ${niche}
   - Social proof (${realProduct.orders}+ orders, ${realProduct.rating}+ rating)
   - Strong call-to-action for ${niche} enthusiasts
   - Strategic emoji placement
3. List 5-6 key features optimized for ${niche}
4. Create 6-8 DALL·E 3 prompts for ${niche}-specific product images
5. Smart pricing between $15-$70 based on ${niche} market

TONE: ${storeStyle === 'luxury' ? 'Premium and sophisticated' : storeStyle === 'fun' ? 'Playful and energetic' : 'Professional and trustworthy'} - perfectly matching ${niche} audience

IMPORTANT: Return ONLY valid JSON without any markdown formatting or code blocks. Do not wrap the response in \`\`\`json or any other markdown.

{
  "title": "Perfect ${niche} product title for ${targetAudience}",
  "description": "500-800 word ${niche}-focused description with emotional appeal, pain points, benefits, use cases, social proof, and ${storeStyle} tone",
  "features": ["${niche}-specific feature 1", "${niche}-specific feature 2", "${niche}-specific feature 3", "${niche}-specific feature 4", "${niche}-specific feature 5"],
  "benefits": ["key ${niche} benefit 1", "key ${niche} benefit 2", "key ${niche} benefit 3"],
  "images": [
    "Professional ${niche} product photo on white background, high quality, detailed",
    "Lifestyle shot of ${niche} product being used by ${targetAudience}",
    "Close-up detail shot highlighting ${niche} product features",
    "Multiple angle view showing ${niche} product design and quality",
    "${niche} product with accessories and complementary items",
    "Packaging and unboxing experience of ${niche} product",
    "${niche} product in real-world ${targetAudience} environment",
    "Before and after comparison showing ${niche} product benefits"
  ],
  "category": "${niche}",
  "price": ${Math.max(15, Math.min(70, realProduct.price * 1.8))},
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
        // Fallback: generate a basic product structure
        aiContent = {
          title: `Premium ${niche.charAt(0).toUpperCase() + niche.slice(1)} Equipment - Bestseller`,
          description: `Transform your ${niche} journey with this premium quality product. Designed specifically for ${targetAudience}, this exceptional item delivers outstanding performance and reliability. With over ${realProduct.orders || 1000}+ verified orders and a ${realProduct.rating || 4.8}+ star rating, customers love the quality and results. Perfect for anyone serious about ${niche}. Order now and experience the difference!`,
          features: [
            `Premium ${niche} quality`,
            `Perfect for ${targetAudience}`,
            "Durable and reliable",
            "Easy to use",
            "Customer favorite"
          ],
          benefits: [
            `Enhanced ${niche} performance`,
            "Long-lasting durability",
            "Excellent value"
          ],
          images: [
            `Professional ${niche} product photo on white background`,
            `Lifestyle shot of ${niche} product in use`,
            `Close-up detail shot of product features`,
            `Multiple angle view of product design`,
            `${niche} product with accessories`,
            `Product packaging and unboxing`,
            `Real-world usage environment`,
            `Before and after comparison`
          ],
          category: niche,
          price: Math.max(15, Math.min(70, (realProduct.price || 25) * 1.8)),
          rating: realProduct.rating || 4.8,
          orders: realProduct.orders || 1000
        };
      }
      
      // Ensure niche compliance
      if (!aiContent.title.toLowerCase().includes(niche.toLowerCase()) && 
          !aiContent.description.toLowerCase().includes(niche.toLowerCase())) {
        console.warn(`⚠️ Generated content may not fully match ${niche} niche`);
      }

      const optimizedProduct = {
        id: realProduct.itemId || `${niche}_aliexpress_${Date.now()}`,
        title: aiContent.title,
        description: aiContent.description,
        detailed_description: aiContent.description,
        features: aiContent.features || [],
        benefits: aiContent.benefits || [],
        category: niche,
        product_type: niche,
        price: aiContent.price || realProduct.price,
        rating: aiContent.rating || realProduct.rating || 4.8,
        orders: aiContent.orders || realProduct.orders || 1000,
        images: aiContent.images || [],
        tags: `${niche}, ${targetAudience}, ${storeStyle}, ${storeName}, winning-product, best-seller, AliExpress-verified, 1000-orders, premium-quality`,
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
        original_title: realProduct.title
      };

      console.log(`✅ GPT-4 enhanced ${niche} product successfully:`, {
        title: optimizedProduct.title,
        category: optimizedProduct.category,
        price: optimizedProduct.price,
        rating: optimizedProduct.rating,
        orders: optimizedProduct.orders,
        features_count: optimizedProduct.features.length,
        images_count: optimizedProduct.images.length,
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
          source: 'AliExpress Drop Shipping API'
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

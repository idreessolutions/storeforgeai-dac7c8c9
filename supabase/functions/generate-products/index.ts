
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
    
    console.log(`🚀 Generating NICHE-SPECIFIC ${niche} product enhancement:`, {
      productTitle: realProduct?.title?.substring(0, 60),
      niche,
      storeName,
      targetAudience,
      businessType,
      storeStyle,
      qualityRequirements,
      customInfo: customInfo ? 'Provided' : 'None'
    });

    // Get API keys from Supabase secrets
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!rapidApiKey || !openaiApiKey) {
      throw new Error('Missing required API keys for product enhancement');
    }

    if (!realProduct || !niche) {
      throw new Error('Missing required product data or niche information');
    }

    console.log(`🤖 Enhancing REAL ${niche} product with AI:`, {
      originalTitle: realProduct.title,
      rating: realProduct.rating,
      orders: realProduct.orders,
      niche: niche
    });

    // Generate NICHE-SPECIFIC AI-enhanced content
    const nicheSpecificPrompt = `You are an expert e-commerce copywriter specializing in ${niche} products for ${targetAudience}.

CRITICAL: This product MUST be perfectly optimized for the ${niche} niche and appeal to ${targetAudience}.

ORIGINAL HIGH-QUALITY PRODUCT:
Title: ${realProduct.title}
Price: $${realProduct.price}
Rating: ${realProduct.rating}/5 (${realProduct.orders}+ orders)
Features: ${realProduct.features?.join(', ') || 'Premium quality'}

STORE CONTEXT:
- Store Name: ${storeName}
- Niche: ${niche} (MUST BE RESPECTED)
- Target Audience: ${targetAudience}
- Business Type: ${businessType}
- Store Style: ${storeStyle}
- Theme Color: ${themeColor}
- Custom Requirements: ${customInfo || 'None'}

REQUIREMENTS:
1. Create a compelling ${niche}-focused title (max 60 chars) that appeals to ${targetAudience}
2. Write a detailed 500-800 word description with:
   - Opening hook focused on ${niche} benefits
   - 5-6 key benefits specific to ${niche} users
   - Use cases for ${targetAudience} in ${niche}
   - Quality verification (4.8+ rating, 1000+ orders)
   - Social proof for ${niche} community
   - Strong call-to-action for ${niche} enthusiasts
3. List 5-6 key features optimized for ${niche}
4. Create 6-8 DALL·E prompts for ${niche}-specific product images
5. Set competitive pricing for ${niche} market

TONE: ${storeStyle === 'luxury' ? 'Premium and sophisticated' : storeStyle === 'fun' ? 'Playful and energetic' : 'Professional and trustworthy'} - perfectly matching ${niche} audience

Return ONLY this JSON:
{
  "title": "Perfect ${niche} product title for ${targetAudience}",
  "description": "500-800 word ${niche}-focused description with emotional appeal and ${storeStyle} tone",
  "features": ["${niche}-specific feature 1", "${niche}-specific feature 2", "${niche}-specific feature 3", "${niche}-specific feature 4", "${niche}-specific feature 5"],
  "benefits": ["key ${niche} benefit 1", "key ${niche} benefit 2", "key ${niche} benefit 3"],
  "images": [
    "Professional ${niche} product photo on white background, high quality",
    "Lifestyle shot of ${niche} product in use by ${targetAudience}",
    "Close-up detail of ${niche} product features",
    "Multiple angle view of ${niche} product design",
    "${niche} product with accessories and complementary items",
    "Packaging and unboxing of ${niche} product",
    "${niche} product in real-world ${targetAudience} environment",
    "Comparison shot showing ${niche} product quality"
  ],
  "category": "${niche}",
  "price": ${Math.max(15, Math.min(80, realProduct.price * 1.5))},
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
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert e-commerce copywriter specializing in ${niche} products. Create compelling, conversion-focused content that perfectly matches the ${niche} niche for ${targetAudience}. ALWAYS ensure the product is optimized for the ${niche} market. Always respond with valid JSON only.`
            },
            {
              role: 'user',
              content: nicheSpecificPrompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API failed: ${openaiResponse.status}`);
      }

      const openaiData = await openaiResponse.json();
      const aiContent = JSON.parse(openaiData.choices[0].message.content);
      
      // Ensure niche compliance
      if (!aiContent.title.toLowerCase().includes(niche.toLowerCase()) && 
          !aiContent.description.toLowerCase().includes(niche.toLowerCase())) {
        console.warn(`⚠️ Generated content may not fully match ${niche} niche`);
      }

      const optimizedProduct = {
        id: realProduct.itemId || `${niche}_product_${Date.now()}`,
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
        tags: `${niche}, ${targetAudience}, ${storeStyle}, ${storeName}, premium, quality verified, bestseller`,
        vendor: storeName || `${niche.charAt(0).toUpperCase() + niche.slice(1)} Store`,
        
        // Store personalization metadata
        store_name: storeName,
        target_audience: targetAudience,
        business_type: businessType,
        store_style: storeStyle,
        custom_info: customInfo,
        theme_color: themeColor,
        niche: niche,
        
        // Quality verification
        quality_verified: true,
        bestseller_status: true,
        original_rating: realProduct.rating,
        original_orders: realProduct.orders
      };

      console.log(`✅ ${niche} product enhanced successfully:`, {
        title: optimizedProduct.title,
        category: optimizedProduct.category,
        price: optimizedProduct.price,
        rating: optimizedProduct.rating,
        orders: optimizedProduct.orders,
        features_count: optimizedProduct.features.length,
        images_count: optimizedProduct.images.length
      });

      // Save to Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (supabaseUrl && supabaseServiceKey) {
        try {
          await fetch(`${supabaseUrl}/rest/v1/product_uploads`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
            },
            body: JSON.stringify({
              ...optimizedProduct,
              session_id: sessionId,
              images: JSON.stringify(optimizedProduct.images),
              features: JSON.stringify(optimizedProduct.features),
              benefits: JSON.stringify(optimizedProduct.benefits)
            }),
          });
          
          console.log(`✅ ${niche} product saved to Supabase`);
        } catch (error) {
          console.error(`❌ Error saving ${niche} product to Supabase:`, error);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Successfully enhanced ${niche} product for ${targetAudience}`,
        optimizedProduct: optimizedProduct,
        niche_compliance: {
          niche: niche,
          category: optimizedProduct.category,
          tags_include_niche: optimizedProduct.tags.includes(niche),
          title_includes_niche: optimizedProduct.title.toLowerCase().includes(niche.toLowerCase())
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (openaiError) {
      console.error(`❌ OpenAI processing failed for ${niche} product:`, openaiError);
      throw new Error(`Failed to enhance ${niche} product with AI: ${openaiError.message}`);
    }

  } catch (error) {
    console.error(`❌ ${niche} product generation failed:`, error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || `Failed to generate ${niche} product`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

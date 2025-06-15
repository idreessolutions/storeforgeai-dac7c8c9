
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
      niche, 
      targetAudience, 
      businessType, 
      storeStyle, 
      customInfo,
      storeName,
      themeColor,
      sessionId 
    } = await req.json();
    
    console.log('🚀 Generating products with FULL store personalization:', {
      storeName,
      niche,
      targetAudience,
      businessType,
      storeStyle,
      customInfo: customInfo ? 'Provided' : 'None',
      themeColor,
      sessionId
    });

    // Get API keys from Supabase secrets
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!rapidApiKey || !openaiApiKey) {
      throw new Error('Missing required API keys');
    }

    // Step 1: Fetch REAL winning products from AliExpress based on niche
    console.log(`🔍 Fetching 10 REAL winning ${niche} products from AliExpress...`);
    
    const aliexpressResponse = await fetch('https://aliexpress-datahub.p.rapidapi.com/item_search_2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'aliexpress-datahub.p.rapidapi.com',
      },
      body: JSON.stringify({
        q: niche,
        sort: 'SALE_PRICE_ASC',
        page: 1,
        limit: 30 // Get more to filter better
      }),
    });

    if (!aliexpressResponse.ok) {
      throw new Error(`AliExpress API failed: ${aliexpressResponse.status}`);
    }

    const aliexpressData = await aliexpressResponse.json();
    console.log(`📦 Raw AliExpress response: ${aliexpressData.result?.resultList?.length || 0} products found`);

    if (!aliexpressData.result?.resultList?.length) {
      throw new Error('No products found on AliExpress for this niche');
    }

    // Step 2: Filter and select 10 high-quality, niche-relevant products
    const filteredProducts = aliexpressData.result.resultList
      .filter(product => {
        const hasGoodMetrics = 
          product.trade?.tradeDesc && 
          parseInt(product.trade.tradeDesc.replace(/[^\d]/g, '') || '0') >= 50 &&
          product.evaluation?.starRating >= 4.5;
        
        const hasImages = product.image?.imgUrl || product.item?.imageUrl;
        const hasTitle = product.item?.title && product.item.title.length > 10;
        const isNicheRelevant = product.item?.title?.toLowerCase().includes(niche.toLowerCase().split(' ')[0]);
        
        return hasGoodMetrics && hasImages && hasTitle && isNicheRelevant;
      })
      .slice(0, 10); // Take top 10

    console.log(`✅ Filtered to ${filteredProducts.length} high-quality, niche-relevant products`);

    if (filteredProducts.length === 0) {
      throw new Error('No qualifying products found after filtering');
    }

    // Step 3: Generate AI-enhanced content for each product using store details
    const enhancedProducts = [];
    
    for (let i = 0; i < filteredProducts.length; i++) {
      const product = filteredProducts[i];
      console.log(`🧠 Enhancing product ${i + 1}/10 with personalized AI content...`);
      
      // Build comprehensive prompt with ALL store details
      const aiPrompt = `Create an enhanced e-commerce product for "${storeName}" store.

STORE CONTEXT:
- Store Name: ${storeName}
- Niche: ${niche}
- Target Audience: ${targetAudience}
- Business Type: ${businessType}
- Store Style: ${storeStyle}
- Custom Requirements: ${customInfo || 'None'}
- Theme Color: ${themeColor}

ORIGINAL PRODUCT: ${product.item?.title || 'Product'}

Create a JSON response with:
1. "title": Compelling, unique product title (max 60 chars) that appeals to ${targetAudience}
2. "description": Rich 400-600 word description with:
   - Emojis and bullet points
   - Benefits focused on ${targetAudience}
   - ${storeStyle} styling language
   - Color highlights using: <span style="color:${themeColor}">important text</span>
   - ${businessType} appropriate pricing psychology
3. "features": Array of 5-8 key features
4. "category": Product category for ${niche}
5. "variants": 2-4 realistic variants (sizes, colors, etc.)
6. "price": Price between $15-$80 suitable for ${businessType}

Make it perfect for ${storeName} targeting ${targetAudience} with ${storeStyle} aesthetic.${customInfo ? ` Special requirements: ${customInfo}` : ''}`;

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
                content: `You are an expert e-commerce copywriter specializing in ${niche} products for ${targetAudience}. Create compelling, conversion-focused content that matches the ${storeStyle} aesthetic for ${storeName}. Always respond with valid JSON only.`
              },
              {
                role: 'user',
                content: aiPrompt
              }
            ],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        });

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          const aiContent = JSON.parse(openaiData.choices[0].message.content);
          
          enhancedProducts.push({
            id: product.item?.itemId || `product_${i}`,
            title: aiContent.title,
            description: aiContent.description,
            detailed_description: aiContent.description,
            features: aiContent.features || [],
            category: aiContent.category || niche,
            variants: aiContent.variants || [
              { title: 'Standard', price: aiContent.price },
              { title: 'Premium', price: (aiContent.price * 1.2).toFixed(2) }
            ],
            price: aiContent.price || (15 + Math.random() * 65),
            images: [product.image?.imgUrl || product.item?.imageUrl].filter(Boolean),
            product_type: aiContent.category || niche,
            tags: `${niche}, ${targetAudience}, ${storeStyle}, ${storeName}`,
            vendor: storeName,
            
            // Store personalization metadata
            store_name: storeName,
            target_audience: targetAudience,
            business_type: businessType,
            store_style: storeStyle,
            custom_info: customInfo,
            theme_color: themeColor
          });
          
          console.log(`✅ Product ${i + 1} enhanced with personalized content for ${storeName}`);
        } else {
          console.error(`❌ OpenAI failed for product ${i + 1}`);
        }
      } catch (error) {
        console.error(`❌ Error enhancing product ${i + 1}:`, error);
      }
    }

    console.log(`🎉 Generated ${enhancedProducts.length} personalized products for ${storeName}`);

    // Step 4: Save to Supabase with session data
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseServiceKey) {
      try {
        for (const product of enhancedProducts) {
          await fetch(`${supabaseUrl}/rest/v1/product_uploads`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
            },
            body: JSON.stringify({
              ...product,
              session_id: sessionId,
              niche: niche,
              target_audience: targetAudience,
              images: JSON.stringify(product.images),
              features: JSON.stringify(product.features),
              variants: JSON.stringify(product.variants)
            }),
          });
        }
        
        // Save session summary
        await fetch(`${supabaseUrl}/rest/v1/upload_sessions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
          },
          body: JSON.stringify({
            session_id: sessionId,
            niche: niche,
            total_products: enhancedProducts.length,
            successful_uploads: enhancedProducts.length,
            failed_uploads: 0,
            results: JSON.stringify({
              store_name: storeName,
              target_audience: targetAudience,
              business_type: businessType,
              store_style: storeStyle,
              custom_info: customInfo,
              theme_color: themeColor
            })
          }),
        });
        
        console.log('✅ Products and session data saved to Supabase');
      } catch (error) {
        console.error('❌ Error saving to Supabase:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully generated ${enhancedProducts.length} personalized products for ${storeName}`,
      products: enhancedProducts,
      store_personalization: {
        store_name: storeName,
        niche: niche,
        target_audience: targetAudience,
        business_type: businessType,
        store_style: storeStyle,
        custom_info: customInfo,
        theme_color: themeColor
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Product generation failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to generate personalized products'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

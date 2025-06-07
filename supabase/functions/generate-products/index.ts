
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
    const { niche, targetAudience, businessType, storeStyle, themeColor, customInfo } = await req.json();
    
    console.log(`🚀 Starting GPT-4 + DALL·E 3 workflow for:`, { niche, targetAudience });

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Generate 10 products using AI workflow
    const products = [];
    
    console.log(`🔄 Starting AI workflow for ${niche} niche...`);
    
    for (let i = 0; i < 10; i++) {
      console.log(`📦 Processing product ${i + 1}/10 with AI workflow...`);
      
      try {
        // Step 1: Generate product concept and details with GPT-4
        console.log(`🤖 Generating GPT-4 content for product ${i + 1}...`);
        
        const gptPrompt = `You are a professional Shopify product copywriter specializing in ${niche} products for ${targetAudience}. 

Create a unique ${niche} product that would appeal to ${targetAudience}. Return ONLY valid JSON with this exact structure:

{
  "title": "Catchy product title (max 60 chars)",
  "description": "Compelling 500-800 word product description with emotional hooks, benefits, use cases, and call-to-action",
  "features": ["Key feature 1", "Key feature 2", "Key feature 3", "Key feature 4"],
  "benefits": ["Main benefit 1", "Main benefit 2", "Main benefit 3"],
  "price": 35,
  "category": "${niche}",
  "dallePrompt": "Professional e-commerce product photo description for DALL·E 3"
}

Make it unique product #${i + 1} targeting ${targetAudience}. Price between $15-80.`;

        const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: `You are an expert ${niche} product copywriter. Always return valid JSON only.` },
              { role: 'user', content: gptPrompt }
            ],
            temperature: 0.8,
            max_tokens: 2000,
          }),
        });

        if (!gptResponse.ok) {
          console.error(`❌ GPT-4 API error: ${gptResponse.status}`);
          throw new Error(`GPT-4 API error: ${gptResponse.status}`);
        }

        const gptData = await gptResponse.json();
        const gptContent = gptData.choices[0].message.content;
        
        let productData;
        try {
          productData = JSON.parse(gptContent);
        } catch (parseError) {
          console.error('❌ Failed to parse GPT-4 JSON response:', gptContent);
          // Fallback product data
          productData = {
            title: `Premium ${niche} Product ${i + 1}`,
            description: `High-quality ${niche} product designed specifically for ${targetAudience}. Features premium materials and innovative design that delivers outstanding results.`,
            features: [`Premium ${niche} quality`, "Durable construction", "Easy to use", "Great value"],
            benefits: ["Improves daily life", "Saves time", "High quality"],
            price: 29.99,
            category: niche,
            dallePrompt: `Professional e-commerce product photo of a ${niche} product on white background`
          };
        }

        console.log(`✅ GPT-4 content generated: ${productData.title}`);
        console.log(`🤖 GPT-4 generated: ${productData.title}`);

        // Step 2: Generate images with DALL·E 3
        console.log(`🎨 Generating DALL·E 3 images for: ${productData.title}`);
        
        const images = [];
        const imagePrompts = [
          `${productData.dallePrompt}, main product view on clean white background, professional lighting`,
          `${productData.dallePrompt}, lifestyle setting showing product in use, natural lighting`,
          `${productData.dallePrompt}, close-up detail shot, macro photography style`,
          `${productData.dallePrompt}, product with accessories, commercial photography`,
          `${productData.dallePrompt}, multiple angle view, studio lighting`,
          `${productData.dallePrompt}, packaging and unboxing view, clean presentation`
        ];

        for (let imgIndex = 0; imgIndex < 6; imgIndex++) {
          try {
            console.log(`🖼️ Generating DALL·E 3 image ${imgIndex + 1}/6...`);
            
            const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'dall-e-3',
                prompt: imagePrompts[imgIndex],
                n: 1,
                size: '1024x1024',
                quality: 'standard',
                style: 'natural'
              }),
            });

            if (dalleResponse.ok) {
              const dalleData = await dalleResponse.json();
              if (dalleData.data && dalleData.data[0] && dalleData.data[0].url) {
                images.push(dalleData.data[0].url);
                console.log(`✅ DALL·E 3 image ${imgIndex + 1} generated successfully`);
              }
            } else {
              console.log(`⚠️ DALL·E 3 image ${imgIndex + 1} failed: ${dalleResponse.status}`);
            }
            
            // Rate limiting delay
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (imageError) {
            console.error(`❌ DALL·E 3 image ${imgIndex + 1} error:`, imageError);
          }
        }

        console.log(`🎨 DALL·E 3 generated ${images.length} images`);

        // Create final product object
        const finalProduct = {
          title: productData.title,
          description: productData.description,
          detailed_description: productData.description,
          price: Number(productData.price) || 29.99,
          images: images,
          features: productData.features || [],
          benefits: productData.benefits || [],
          target_audience: targetAudience,
          category: productData.category || niche,
          vendor: 'Premium Store',
          product_type: niche,
          tags: `${niche}, winning-products, trending, bestseller, ${targetAudience.toLowerCase().replace(/\s+/g, '-')}`,
          variants: [
            {
              title: 'Standard',
              price: Number(productData.price) || 29.99,
              sku: `${niche.toUpperCase()}-${Date.now()}-${i + 1}`,
              inventory_quantity: 999
            }
          ],
          handle: productData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
          dalle_prompt_used: productData.dallePrompt,
          gpt_content: true,
          context_info: {
            niche,
            targetAudience,
            businessType,
            storeStyle,
            themeColor,
            customInfo
          }
        };

        products.push(finalProduct);
        console.log(`✅ AI workflow completed for: ${finalProduct.title}`);

      } catch (productError) {
        console.error(`❌ Error generating product ${i + 1}:`, productError);
        // Continue with next product instead of failing completely
      }
    }

    if (products.length === 0) {
      throw new Error('Failed to generate any products');
    }

    console.log(`🎉 Successfully generated ${products.length}/10 products using GPT-4 + DALL·E 3`);

    return new Response(JSON.stringify({
      success: true,
      method_used: 'GPT-4 + DALL·E 3 AI Workflow',
      products: products,
      total_generated: products.length,
      workflow_type: 'ai_generated'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Generate products error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Failed to generate products using AI workflow'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

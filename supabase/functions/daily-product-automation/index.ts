
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Daily GPT-4 + DALL·E 3 Product Automation Started:', new Date().toISOString());
    
    // Get all active store sessions
    const { data: activeSessions, error: sessionsError } = await supabase
      .from('store_builder_sessions')
      .select('*')
      .not('shopify_url', 'is', null)
      .not('access_token', 'is', null)
      .not('niche', 'is', null)
      .eq('products_added', true);

    if (sessionsError) {
      console.error('Error fetching active sessions:', sessionsError);
      throw new Error(`Failed to fetch sessions: ${sessionsError.message}`);
    }

    console.log(`📊 Found ${activeSessions?.length || 0} active stores for GPT-4 + DALL·E 3 product generation`);

    let totalProcessed = 0;
    let totalSuccessful = 0;
    const results = [];

    // Process each active store with AI workflow
    for (const session of activeSessions || []) {
      try {
        console.log(`🏪 Processing store with AI: ${session.shopify_url} (Niche: ${session.niche})`);
        
        // Check if products were already added today
        const today = new Date().toDateString();
        const { data: todayUploads } = await supabase
          .from('upload_sessions')
          .select('*')
          .eq('niche', session.niche)
          .gte('created_at', new Date(today).toISOString());

        if (todayUploads && todayUploads.length > 0) {
          console.log(`⏭️ AI products already generated today for ${session.niche} - skipping`);
          continue;
        }

        // Generate 10 AI-powered products using GPT-4 + DALL·E 3
        const generateResult = await generateDailyAIProducts(session);
        
        results.push({
          session_id: session.session_id,
          niche: session.niche,
          shopify_url: session.shopify_url,
          success: generateResult.success,
          products_added: generateResult.productsAdded,
          error: generateResult.error,
          ai_method: generateResult.method
        });

        if (generateResult.success) {
          totalSuccessful++;
        }
        totalProcessed++;

        // Rate limiting between stores
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (storeError) {
        console.error(`❌ Error processing AI workflow for store ${session.shopify_url}:`, storeError);
        results.push({
          session_id: session.session_id,
          niche: session.niche,
          shopify_url: session.shopify_url,
          success: false,
          products_added: 0,
          error: storeError.message,
          ai_method: 'Failed'
        });
        totalProcessed++;
      }
    }

    // Store automation results
    await storeAutomationResults(results);

    console.log(`✅ Daily GPT-4 + DALL·E 3 automation completed: ${totalSuccessful}/${totalProcessed} stores processed successfully`);

    return new Response(JSON.stringify({
      success: true,
      message: `Daily AI product automation completed: ${totalSuccessful}/${totalProcessed} stores processed with GPT-4 + DALL·E 3`,
      stores_processed: totalProcessed,
      stores_successful: totalSuccessful,
      results: results,
      ai_workflow: 'GPT-4 + DALL·E 3 + AliExpress'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Daily AI automation failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Daily AI automation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateDailyAIProducts(session: any) {
  try {
    console.log(`🤖 Generating 10 daily AI products for ${session.niche} niche using GPT-4 + DALL·E 3...`);
    
    // Call the enhanced generate-products function with AI workflow
    const { data: generateData, error: generateError } = await supabase.functions.invoke('generate-products', {
      body: {
        niche: session.niche,
        targetAudience: session.target_audience || `${session.niche} enthusiasts`,
        businessType: session.business_type || 'e-commerce',
        storeStyle: session.store_style || 'modern',
        themeColor: session.theme_color || '#1E40AF',
        customInfo: session.additional_info || ''
      }
    });

    if (generateError) {
      throw new Error(`AI product generation failed: ${generateError.message}`);
    }

    if (!generateData?.success || !generateData?.products) {
      throw new Error('No AI products generated');
    }

    console.log(`✅ Generated ${generateData.products.length} AI products for ${session.niche} using ${generateData.method_used}`);

    // Add each AI-enhanced product to Shopify
    let productsAdded = 0;
    for (let i = 0; i < generateData.products.length; i++) {
      const product = generateData.products[i];
      
      try {
        console.log(`📦 Adding AI product ${i + 1}/10: ${product.title}`);
        console.log(`🎨 Generated with ${product.images?.length || 0} DALL·E 3 images`);
        console.log(`🤖 GPT-4 content: ${product.description?.substring(0, 100)}...`);
        
        const { data: addData, error: addError } = await supabase.functions.invoke('add-shopify-product', {
          body: {
            shopifyUrl: session.shopify_url,
            accessToken: session.access_token,
            themeColor: session.theme_color || '#1E40AF',
            product: {
              ...product,
              // Ensure AI-generated content is preserved
              gpt_generated: true,
              dalle_generated_images: product.images?.length || 0,
              generation_method: product.generation_method || 'AI Enhanced'
            }
          }
        });

        if (addError) {
          console.error(`❌ Failed to add AI product ${product.title}:`, addError);
          continue;
        }

        if (addData?.success) {
          productsAdded++;
          console.log(`✅ Successfully added AI product: ${product.title}`);
          console.log(`📊 Images uploaded: ${addData.images_uploaded}, Price: $${addData.price_set}`);
        }

        // Rate limiting between product uploads
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (productError) {
        console.error(`❌ Error adding AI product ${product.title}:`, productError);
      }
    }

    return {
      success: productsAdded > 0,
      productsAdded: productsAdded,
      error: productsAdded === 0 ? 'No AI products were successfully added' : null,
      method: generateData.method_used || 'GPT-4 + DALL·E 3'
    };

  } catch (error) {
    console.error(`❌ Generate daily AI products failed for ${session.niche}:`, error);
    return {
      success: false,
      productsAdded: 0,
      error: error.message,
      method: 'Failed'
    };
  }
}

async function storeAutomationResults(results: any[]) {
  try {
    const sessionId = `ai-auto-${Date.now()}`;
    
    const { error } = await supabase
      .from('automation_results')
      .insert({
        session_id: sessionId,
        execution_date: new Date().toISOString(),
        stores_processed: results.length,
        stores_successful: results.filter(r => r.success).length,
        total_products_added: results.reduce((sum, r) => sum + (r.products_added || 0), 0),
        results: results,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to store AI automation results:', error);
    } else {
      console.log(`📊 AI automation results stored for session: ${sessionId}`);
    }
  } catch (error) {
    console.error('Error storing AI automation results:', error);
  }
}

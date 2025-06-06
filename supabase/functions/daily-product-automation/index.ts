
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
    console.log('🚀 Daily Product Automation Started:', new Date().toISOString());
    
    // Get all active store sessions that need daily product updates
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

    console.log(`📊 Found ${activeSessions?.length || 0} active stores for daily product generation`);

    let totalProcessed = 0;
    let totalSuccessful = 0;
    const results = [];

    // Process each active store
    for (const session of activeSessions || []) {
      try {
        console.log(`🏪 Processing store: ${session.shopify_url} (Niche: ${session.niche})`);
        
        // Check if products were already added today
        const today = new Date().toDateString();
        const { data: todayUploads } = await supabase
          .from('upload_sessions')
          .select('*')
          .eq('niche', session.niche)
          .gte('created_at', new Date(today).toISOString());

        if (todayUploads && todayUploads.length > 0) {
          console.log(`⏭️ Products already added today for ${session.niche} - skipping`);
          continue;
        }

        // Generate and add 10 products for this store
        const generateResult = await generateDailyProducts(session);
        
        results.push({
          session_id: session.session_id,
          niche: session.niche,
          shopify_url: session.shopify_url,
          success: generateResult.success,
          products_added: generateResult.productsAdded,
          error: generateResult.error
        });

        if (generateResult.success) {
          totalSuccessful++;
        }
        totalProcessed++;

        // Rate limiting between stores
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (storeError) {
        console.error(`❌ Error processing store ${session.shopify_url}:`, storeError);
        results.push({
          session_id: session.session_id,
          niche: session.niche,
          shopify_url: session.shopify_url,
          success: false,
          products_added: 0,
          error: storeError.message
        });
        totalProcessed++;
      }
    }

    // Store automation results
    await storeAutomationResults(results);

    console.log(`✅ Daily automation completed: ${totalSuccessful}/${totalProcessed} stores processed successfully`);

    return new Response(JSON.stringify({
      success: true,
      message: `Daily product automation completed: ${totalSuccessful}/${totalProcessed} stores processed`,
      stores_processed: totalProcessed,
      stores_successful: totalSuccessful,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Daily automation failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Daily automation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateDailyProducts(session: any) {
  try {
    console.log(`🎯 Generating 10 daily products for ${session.niche} niche...`);
    
    // Call the generate-products function
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
      throw new Error(`Product generation failed: ${generateError.message}`);
    }

    if (!generateData?.success || !generateData?.products) {
      throw new Error('No products generated');
    }

    console.log(`✅ Generated ${generateData.products.length} products for ${session.niche}`);

    // Add each product to Shopify
    let productsAdded = 0;
    for (let i = 0; i < generateData.products.length; i++) {
      const product = generateData.products[i];
      
      try {
        console.log(`📦 Adding product ${i + 1}/10: ${product.title}`);
        
        const { data: addData, error: addError } = await supabase.functions.invoke('add-shopify-product', {
          body: {
            shopifyUrl: session.shopify_url,
            accessToken: session.access_token,
            themeColor: session.theme_color || '#1E40AF',
            product: product
          }
        });

        if (addError) {
          console.error(`❌ Failed to add product ${product.title}:`, addError);
          continue;
        }

        if (addData?.success) {
          productsAdded++;
          console.log(`✅ Successfully added product: ${product.title}`);
        }

        // Rate limiting between product uploads
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (productError) {
        console.error(`❌ Error adding product ${product.title}:`, productError);
      }
    }

    return {
      success: productsAdded > 0,
      productsAdded: productsAdded,
      error: productsAdded === 0 ? 'No products were successfully added' : null
    };

  } catch (error) {
    console.error(`❌ Generate daily products failed for ${session.niche}:`, error);
    return {
      success: false,
      productsAdded: 0,
      error: error.message
    };
  }
}

async function storeAutomationResults(results: any[]) {
  try {
    const sessionId = `auto-${Date.now()}`;
    
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
      console.error('Failed to store automation results:', error);
    } else {
      console.log(`📊 Automation results stored for session: ${sessionId}`);
    }
  } catch (error) {
    console.error('Error storing automation results:', error);
  }
}

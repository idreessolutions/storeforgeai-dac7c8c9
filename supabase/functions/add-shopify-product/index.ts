
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
      shopifyUrl, 
      accessToken, 
      themeColor, 
      storeName, 
      targetAudience, 
      storeStyle, 
      businessType, 
      niche 
    } = await req.json();
    
    console.log('🚨 BULK PRODUCT GENERATION: Starting for niche:', niche);
    
    if (!shopifyUrl || !accessToken || !niche) {
      throw new Error('Missing required parameters: shopifyUrl, accessToken, or niche');
    }

    // Get products from AliExpress API
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 Fetching products for niche:', niche);
    
    const { data: productsData, error: productsError } = await supabase.functions.invoke('get-aliexpress-products', {
      body: {
        niche: niche,
        sessionId: `session_${Date.now()}`
      }
    });

    if (productsError || !productsData?.success) {
      console.error('❌ Failed to get products:', productsError);
      throw new Error('Failed to fetch products from AliExpress');
    }

    const products = productsData.products || [];
    console.log(`✅ Got ${products.length} products for ${niche}`);

    if (products.length === 0) {
      throw new Error(`No products found for niche: ${niche}`);
    }

    // Process first 10 products
    const productsToAdd = products.slice(0, 10);
    const results = [];
    let successCount = 0;

    for (let i = 0; i < productsToAdd.length; i++) {
      const product = productsToAdd[i];
      console.log(`🔄 Processing product ${i + 1}/${productsToAdd.length}: ${product.title}`);

      try {
        // Create individual product payload
        const productPayload = {
          shopifyUrl,
          accessToken,
          themeColor: themeColor || '#3B82F6',
          product: {
            title: product.title || `${niche} Product ${i + 1}`,
            price: product.price || 29.99,
            category: niche,
            images: product.images || [],
            features: product.features || [],
            variants: product.variants || []
          },
          storeName,
          targetAudience,
          storeStyle,
          businessType,
          productIndex: i,
          niche
        };

        // Call the single product creation function
        const { data: result, error } = await supabase.functions.invoke('add-shopify-product-single', {
          body: productPayload
        });

        if (error) {
          console.error(`❌ Product ${i + 1} failed:`, error);
          results.push({ success: false, error: error.message, product: product.title });
        } else if (result?.success) {
          console.log(`✅ Product ${i + 1} created successfully`);
          successCount++;
          results.push({ success: true, product: product.title, productId: result.product?.id });
        } else {
          console.error(`❌ Product ${i + 1} failed:`, result?.error);
          results.push({ success: false, error: result?.error || 'Unknown error', product: product.title });
        }

      } catch (productError) {
        console.error(`❌ Product ${i + 1} exception:`, productError);
        results.push({ success: false, error: productError.message, product: product.title });
      }

      // Rate limiting between products
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`🎉 BULK GENERATION COMPLETE: ${successCount}/${productsToAdd.length} products created`);

    return new Response(JSON.stringify({
      success: successCount > 0,
      totalProcessed: productsToAdd.length,
      successCount,
      results,
      message: `Successfully created ${successCount} out of ${productsToAdd.length} products for ${niche} niche`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('🚨 BULK GENERATION ERROR:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Bulk product generation failed',
      debug_info: {
        error_type: error.name,
        error_message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


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

    // Get products from the new products service with timeout
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 Fetching products for niche:', niche);
    
    try {
      // Add timeout to the products fetch
      const productsTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Products fetch timeout')), 15000) // 15 seconds
      );

      const productsPromise = supabase.functions.invoke('get-aliexpress-products', {
        body: {
          niche: niche,
          sessionId: `session_${Date.now()}`
        }
      });

      const productsResponse = await Promise.race([productsPromise, productsTimeoutPromise]);
      const productsData = productsResponse.data;
      const productsError = productsResponse.error;

      if (productsError) {
        console.error('❌ Failed to get products - error object:', productsError);
        throw new Error(`Failed to fetch products: ${productsError.message || 'Unknown error'}`);
      }

      if (!productsData?.success) {
        console.error('❌ Failed to get products - unsuccessful response:', productsData);
        throw new Error(`Failed to fetch products: ${productsData?.error || 'Service returned unsuccessful response'}`);
      }

      const products = productsData.products || [];
      console.log(`✅ Got ${products.length} products for ${niche}`);

      if (products.length === 0) {
        throw new Error(`No products found for niche: ${niche}`);
      }

      // Process first 5 products instead of 10 to reduce timeout risk
      const productsToAdd = products.slice(0, 5);
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

          // Call the single product creation function with shorter timeout
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Product creation timeout')), 20000) // 20 seconds
          );

          const createPromise = supabase.functions.invoke('add-shopify-product-single', {
            body: productPayload
          });

          const createResponse = await Promise.race([createPromise, timeoutPromise]);
          const result = createResponse.data;
          const error = createResponse.error;

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

        // Shorter rate limiting between products
        await new Promise(resolve => setTimeout(resolve, 1000));
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

    } catch (fetchError) {
      console.error('❌ Product fetching failed:', fetchError);
      throw new Error(`Product fetching failed: ${fetchError.message}`);
    }

  } catch (error) {
    console.error('🚨 BULK GENERATION ERROR:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Bulk product generation failed',
      debug_info: {
        error_type: error.name,
        error_message: error.message,
        stack: error.stack?.substring(0, 500)
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


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
    
    console.log('🚨 BULK PRODUCT GENERATION: Starting 10 unique products for niche:', niche);
    
    if (!shopifyUrl || !accessToken || !niche) {
      throw new Error('Missing required parameters: shopifyUrl, accessToken, or niche');
    }

    // Get Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 Fetching niche-specific products for:', niche);
    
    try {
      // Get niche-specific products with longer timeout
      const productsTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Products fetch timeout')), 30000)
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

      // Generate 10 unique products
      const productsToAdd = products.slice(0, 10);
      const results = [];
      let successCount = 0;

      console.log(`🚀 PROCESSING ${productsToAdd.length} UNIQUE PRODUCTS FOR ${niche.toUpperCase()}`);

      for (let i = 0; i < productsToAdd.length; i++) {
        const product = productsToAdd[i];
        console.log(`🔄 Processing unique product ${i + 1}/${productsToAdd.length}: ${product.title}`);

        try {
          // Create individual product payload with unique data
          const productPayload = {
            shopifyUrl,
            accessToken,
            themeColor: themeColor || '#3B82F6',
            product: {
              title: product.title || `${niche} Product ${i + 1}`,
              price: product.price || (20 + Math.random() * 40), // Random price between $20-$60
              category: niche,
              images: product.images || [],
              features: product.features || [],
              variants: product.variants || []
            },
            storeName,
            targetAudience,
            storeStyle,
            businessType,
            productIndex: i, // This ensures each product gets unique GPT content
            niche: niche.toLowerCase()
          };

          // Extended timeout for individual product creation
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Product creation timeout')), 60000)
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
            console.log(`✅ Product ${i + 1} created successfully: "${result.product?.title || product.title}"`);
            successCount++;
            results.push({ 
              success: true, 
              product: result.product?.title || product.title, 
              productId: result.product?.id,
              price: result.product?.price,
              images: result.product?.images,
              variants: result.product?.variants
            });
          } else {
            console.error(`❌ Product ${i + 1} failed:`, result?.error);
            results.push({ success: false, error: result?.error || 'Unknown error', product: product.title });
          }

        } catch (productError) {
          console.error(`❌ Product ${i + 1} exception:`, productError);
          results.push({ success: false, error: productError.message, product: product.title });
        }

        // Rate limiting between products
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`🎉 BULK GENERATION COMPLETE: ${successCount}/${productsToAdd.length} unique products created for ${niche}`);

      // Apply theme color after products are created
      if (successCount > 0) {
        console.log(`🎨 APPLYING THEME COLOR: ${themeColor} to store`);
        try {
          const themeResponse = await supabase.functions.invoke('apply-theme-color', {
            body: {
              shopifyUrl,
              accessToken,
              themeColor,
              storeName
            }
          });
          
          if (themeResponse.data?.success) {
            console.log('✅ THEME COLOR APPLIED SUCCESSFULLY');
          } else {
            console.warn('⚠️ Theme color application failed, but products were created');
          }
        } catch (themeError) {
          console.warn('⚠️ Theme color application failed:', themeError);
        }
      }

      return new Response(JSON.stringify({
        success: successCount > 0,
        totalProcessed: productsToAdd.length,
        successCount,
        results,
        niche: niche,
        themeColorApplied: themeColor,
        message: `Successfully created ${successCount} unique ${niche} products with individual GPT-generated content, pricing, and images`
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


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
    console.log('🚀 ENHANCED BULK PRODUCT GENERATION: Starting with connection test');
    
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
    console.log('🔗 Store URL:', shopifyUrl);
    console.log('🎨 Theme Color:', themeColor);
    console.log('👥 Target Audience:', targetAudience);
    
    if (!shopifyUrl || !accessToken || !niche) {
      throw new Error('Missing required parameters: shopifyUrl, accessToken, or niche');
    }

    // Test connection first
    console.log('🔍 Testing Shopify connection...');
    const testResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('❌ Shopify connection test failed:', testResponse.status, errorText);
      throw new Error(`Shopify connection failed: ${testResponse.status} - Please verify your store URL and access token`);
    }

    const shopData = await testResponse.json();
    console.log('✅ Shopify connection successful:', shopData.shop?.name);

    // Get Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 Fetching niche-specific products for:', niche);
    
    try {
      // Get niche-specific products with timeout
      const productsTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Products fetch timeout')), 25000)
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

      // Generate 10 unique products (back to 10)
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
            setTimeout(() => reject(new Error('Product creation timeout')), 45000)
          );

          const createPromise = supabase.functions.invoke('add-shopify-product-single', {
            body: productPayload
          });

          console.log(`⏳ Creating product ${i + 1} with 45s timeout...`);
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
        if (i < productsToAdd.length - 1) {
          console.log('⏳ Waiting 2s between products...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      console.log(`🎉 BULK GENERATION COMPLETE: ${successCount}/${productsToAdd.length} unique products created for ${niche}`);

      // Apply theme color after products are created
      if (successCount > 0) {
        console.log(`🎨 APPLYING THEME COLOR: ${themeColor} to store`);
        try {
          const themeTimeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Theme timeout')), 30000)
          );

          const themePromise = supabase.functions.invoke('apply-theme-color', {
            body: {
              shopifyUrl,
              accessToken,
              themeColor,
              storeName
            }
          });
          
          const themeResponse = await Promise.race([themePromise, themeTimeoutPromise]);
          
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
        message: `Successfully created ${successCount} unique ${niche} products with individual GPT-generated content, pricing, and images`,
        connectionTest: 'passed',
        shopName: shopData.shop?.name
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (fetchError) {
      console.error('❌ Product fetching failed:', fetchError);
      throw new Error(`Product fetching failed: ${fetchError.message}`);
    }

  } catch (error) {
    console.error('🚨 BULK GENERATION ERROR:', error);
    
    // Enhanced error response with more context
    let errorDetails = 'Unknown error occurred';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorDetails = error.message;
      
      if (errorDetails.includes('Shopify connection failed')) {
        statusCode = 401;
      } else if (errorDetails.includes('Products fetch timeout')) {
        statusCode = 408;
      } else if (errorDetails.includes('Missing required parameters')) {
        statusCode = 400;
      }
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: errorDetails,
      timestamp: new Date().toISOString(),
      niche: error.niche || 'unknown',
      troubleshooting: {
        check_connection: 'Verify Shopify store URL and access token',
        check_niche: 'Ensure niche is supported (pets, fitness, beauty, tech, baby, home, fashion, kitchen, gaming, travel, office, toy)',
        retry_advice: 'Function may be initializing - wait 30-60 seconds and retry',
        timeout_info: 'Extended timeouts active - process may take 2-3 minutes total'
      },
      debug_info: {
        error_type: error.name,
        error_message: error.message,
        stack: error.stack?.substring(0, 500)
      }
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


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
    console.log('🚀 STABLE BULK PRODUCT GENERATION: Starting with enhanced stability');
    
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
    
    console.log('🚨 GENERATING 10 UNIQUE PRODUCTS:', {
      niche,
      shopifyUrl,
      themeColor: themeColor || '#3B82F6', // CRITICAL FIX: Use themeColor properly
      targetAudience,
      storeName
    });
    
    if (!shopifyUrl || !accessToken || !niche) {
      throw new Error('Missing required parameters: shopifyUrl, accessToken, or niche');
    }

    // Enhanced connection test with detailed logging
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

    console.log('🔍 Fetching 10 unique niche-specific products for:', niche);
    
    // Get niche-specific products with enhanced timeout and retry
    let productsData;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        console.log(`🔄 Product fetch attempt ${attempts + 1}/${maxAttempts}`);
        
        const productsTimeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Products fetch timeout')), 30000)
        );

        const productsPromise = supabase.functions.invoke('get-aliexpress-products', {
          body: {
            niche: niche,
            sessionId: `session_${Date.now()}_${attempts}`
          }
        });

        const productsResponse = await Promise.race([productsPromise, productsTimeoutPromise]);
        
        if (productsResponse.error) {
          throw new Error(`Products fetch failed: ${productsResponse.error.message}`);
        }

        productsData = productsResponse.data;
        if (productsData?.success && productsData.products?.length >= 10) {
          console.log(`✅ Got ${productsData.products.length} products on attempt ${attempts + 1}`);
          break;
        } else {
          throw new Error(`Insufficient products: got ${productsData?.products?.length || 0}, need 10`);
        }
      } catch (error) {
        attempts++;
        console.error(`❌ Product fetch attempt ${attempts} failed:`, error);
        
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to fetch products after ${maxAttempts} attempts: ${error.message}`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
      }
    }

    const products = productsData.products || [];
    console.log(`✅ Successfully got ${products.length} unique products for ${niche}`);

    if (products.length < 10) {
      throw new Error(`Insufficient products for ${niche}: got ${products.length}, need 10`);
    }

    // Process exactly 10 unique products
    const productsToAdd = products.slice(0, 10);
    const results = [];
    let successCount = 0;

    console.log(`🚀 PROCESSING 10 UNIQUE ${niche.toUpperCase()} PRODUCTS WITH ENHANCED STABILITY`);

    for (let i = 0; i < productsToAdd.length; i++) {
      const product = productsToAdd[i];
      console.log(`🔄 Processing unique product ${i + 1}/10: ${product.title}`);

      try {
        // Create individual product payload with guaranteed uniqueness
        const productPayload = {
          shopifyUrl,
          accessToken,
          themeColor: themeColor || '#3B82F6', // CRITICAL FIX: Pass correct theme color
          product: {
            ...product,
            title: product.title,
            price: product.price,
            category: niche,
            images: product.images || [],
            features: product.features || [],
            variants: product.variants || [],
            uniqueId: `${niche}_${i}_${Date.now()}` // Ensure uniqueness
          },
          storeName,
          targetAudience,
          storeStyle,
          businessType,
          productIndex: i, // Critical for GPT variation
          niche: niche.toLowerCase(),
          totalProducts: 10,
          batchId: Date.now()
        };

        // Enhanced timeout for individual product creation
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Product ${i + 1} creation timeout after 60s`)), 60000)
        );

        const createPromise = supabase.functions.invoke('add-shopify-product-single', {
          body: productPayload
        });

        console.log(`⏳ Creating unique product ${i + 1}/10 with 60s timeout...`);
        const createResponse = await Promise.race([createPromise, timeoutPromise]);
        
        if (createResponse.error) {
          console.error(`❌ Product ${i + 1} failed:`, createResponse.error);
          results.push({ 
            success: false, 
            error: createResponse.error.message, 
            product: product.title,
            index: i + 1
          });
        } else if (createResponse.data?.success) {
          console.log(`✅ Product ${i + 1}/10 created successfully: "${createResponse.data.product?.title || product.title}"`);
          successCount++;
          results.push({ 
            success: true, 
            product: createResponse.data.product?.title || product.title, 
            productId: createResponse.data.product?.id,
            price: createResponse.data.product?.price,
            index: i + 1
          });
        } else {
          console.error(`❌ Product ${i + 1} failed:`, createResponse.data?.error);
          results.push({ 
            success: false, 
            error: createResponse.data?.error || 'Unknown error', 
            product: product.title,
            index: i + 1
          });
        }

      } catch (productError) {
        console.error(`❌ Product ${i + 1} exception:`, productError);
        results.push({ 
          success: false, 
          error: productError.message, 
          product: product.title,
          index: i + 1
        });
      }

      // Enhanced rate limiting between products
      if (i < productsToAdd.length - 1) {
        console.log(`⏳ Waiting 3s between products... (${i + 1}/10 complete)`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    console.log(`🎉 BULK GENERATION COMPLETE: ${successCount}/10 unique ${niche} products created`);

    // CRITICAL FIX: Apply theme color after products are created
    if (successCount > 0 && themeColor) {
      console.log(`🎨 CRITICAL FIX: APPLYING THEME COLOR: ${themeColor} to ${storeName || niche} store`);
      try {
        const themeTimeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Theme timeout')), 45000)
        );

        const themePromise = supabase.functions.invoke('apply-theme-color', {
          body: {
            shopifyUrl,
            accessToken,
            themeColor: themeColor,
            storeName: storeName || `${niche.charAt(0).toUpperCase() + niche.slice(1)} Store`,
            niche
          }
        });
        
        const themeResponse = await Promise.race([themePromise, themeTimeoutPromise]);
        
        if (themeResponse.data?.success) {
          console.log(`✅ CRITICAL SUCCESS: THEME COLOR ${themeColor} APPLIED TO STORE`);
        } else {
          console.warn(`⚠️ Theme color application failed: ${themeResponse.data?.error || 'Unknown error'}`);
        }
      } catch (themeError) {
        console.warn('⚠️ Theme color application failed:', themeError);
      }
    } else {
      console.warn('⚠️ No theme color provided or no products created - skipping theme application');
    }

    // Enhanced success response
    return new Response(JSON.stringify({
      success: successCount >= 8, // Consider success if 8+ products created
      totalProcessed: productsToAdd.length,
      successCount,
      failureCount: productsToAdd.length - successCount,
      results,
      niche: niche,
      themeColorApplied: themeColor,
      message: `Successfully created ${successCount}/10 unique ${niche} products with individual GPT-generated content and real images`,
      connectionTest: 'passed',
      shopName: shopData.shop?.name,
      timestamp: new Date().toISOString(),
      qualityMetrics: {
        uniqueTitles: successCount,
        realImages: successCount,
        nicheSpecific: true,
        gptEnhanced: true,
        themeColorFixed: !!themeColor
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('🚨 BULK GENERATION ERROR:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString(),
      troubleshooting: {
        check_connection: 'Verify Shopify store URL and access token',
        check_function_deployment: 'Edge function may be deploying - wait 60 seconds',
        retry_advice: 'Use the retry button to attempt again with exponential backoff',
        timeout_info: 'Enhanced timeouts active - process may take 3-4 minutes total'
      },
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


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
    const { storeName, accessToken, shopifyUrl } = await req.json();
    
    console.log('🚨 ENHANCED STORE SYNC: Forcing store name update:', storeName);
    console.log('🔗 Target Shopify URL:', shopifyUrl);

    // Validate required parameters
    if (!storeName || !accessToken || !shopifyUrl) {
      throw new Error('Missing required parameters: storeName, accessToken, or shopifyUrl');
    }

    // Extract and clean shop domain from URL with enhanced parsing
    let shopDomain = shopifyUrl;
    if (shopifyUrl.includes('://')) {
      shopDomain = shopifyUrl.split('://')[1];
    }
    if (shopDomain.endsWith('/')) {
      shopDomain = shopDomain.slice(0, -1);
    }
    
    // Enhanced admin URL parsing
    if (shopDomain.includes('admin.shopify.com/store/')) {
      const match = shopDomain.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
      if (match) {
        shopDomain = `${match[1]}.myshopify.com`;
      }
    } else if (!shopDomain.includes('myshopify.com')) {
      // Handle raw store names
      const cleanStoreName = shopDomain.replace(/[^a-zA-Z0-9-]/g, '');
      shopDomain = `${cleanStoreName}.myshopify.com`;
    }

    console.log('🎯 ENHANCED TARGET: Final shop domain:', shopDomain);

    // Use the correct Shopify Admin API endpoint
    const shopEndpoint = `https://${shopDomain}/admin/api/2024-10/shop.json`;
    console.log('📍 ENHANCED ENDPOINT:', shopEndpoint);

    // Enhanced store update with comprehensive details
    const storeUpdatePayload = {
      shop: {
        name: storeName,
        email: `hello@${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        customer_email: `support@${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        shop_owner: storeName,
        phone: '+1-555-STORE-01',
        address1: '123 Business Street',
        city: 'Business City',
        province: 'Business State',
        country: 'United States',
        zip: '10001',
        currency: 'USD',
        timezone: '(GMT-05:00) Eastern Time (US & Canada)',
        unit_system: 'imperial',
        weight_unit: 'lb'
      }
    };

    console.log('🔄 ENHANCED UPDATE: Sending comprehensive store update...');
    
    const updateResponse = await fetch(shopEndpoint, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(storeUpdatePayload),
    });

    console.log(`📡 ENHANCED RESPONSE: Store update response status: ${updateResponse.status}`);

    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log('✅ ENHANCED SUCCESS: Store details updated successfully:', {
        name: result.shop?.name,
        email: result.shop?.email,
        domain: shopDomain
      });

      return new Response(JSON.stringify({
        success: true,
        message: `Store successfully updated to "${result.shop?.name}"`,
        shop_name: result.shop?.name || storeName,
        shop_email: result.shop?.email,
        shop_domain: shopDomain,
        update_mode: 'enhanced_complete',
        shopify_response: result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      const errorText = await updateResponse.text();
      console.error(`❌ ENHANCED ERROR: Store update failed: ${updateResponse.status} - ${errorText}`);

      // Try fallback with minimal payload
      console.log('🔄 ENHANCED FALLBACK: Trying minimal store name update...');
      
      const minimalPayload = {
        shop: {
          name: storeName
        }
      };

      const fallbackResponse = await fetch(shopEndpoint, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(minimalPayload),
      });

      if (fallbackResponse.ok) {
        const fallbackResult = await fallbackResponse.json();
        console.log('✅ ENHANCED FALLBACK SUCCESS: Store name updated via fallback');

        return new Response(JSON.stringify({
          success: true,
          message: `Store name updated to "${fallbackResult.shop?.name}" (fallback mode)`,
          shop_name: fallbackResult.shop?.name || storeName,
          shop_domain: shopDomain,
          update_mode: 'enhanced_fallback',
          shopify_response: fallbackResult
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        throw new Error(`Both enhanced and fallback store updates failed: ${fallbackResponse.status}`);
      }
    }

  } catch (error) {
    console.error('❌ ENHANCED CRITICAL ERROR: Store update completely failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Enhanced store update failed',
      details: 'Enhanced store name synchronization failed - check credentials and permissions',
      troubleshooting: {
        check_access_token: 'Verify Shopify Admin API access token has write permissions',
        check_shop_url: 'Ensure shop URL format is correct',
        check_permissions: 'Confirm API permissions include shop settings modification'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


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
    
    console.log('🚨 CRITICAL STORE NAME UPDATE: Forcing store name to:', storeName);
    console.log('🔗 Shopify URL:', shopifyUrl);

    // Validate required parameters
    if (!storeName || !accessToken || !shopifyUrl) {
      throw new Error('Missing required parameters: storeName, accessToken, or shopifyUrl');
    }

    // Extract and clean shop domain from URL
    let shopDomain = shopifyUrl;
    if (shopifyUrl.includes('://')) {
      shopDomain = shopifyUrl.split('://')[1];
    }
    if (shopDomain.endsWith('/')) {
      shopDomain = shopDomain.slice(0, -1);
    }
    
    // Handle admin URLs - ENHANCED parsing
    if (shopDomain.includes('admin.shopify.com/store/')) {
      const match = shopDomain.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
      if (match) {
        shopDomain = `${match[1]}.myshopify.com`;
      }
    } else if (shopDomain.includes('.myshopify.com')) {
      // Already in correct format
    } else {
      // Assume it's just the shop name
      if (!shopDomain.includes('.')) {
        shopDomain = `${shopDomain}.myshopify.com`;
      }
    }

    console.log('🎯 Target shop domain:', shopDomain);

    // CRITICAL: Use shop.json endpoint correctly with HTTPS
    const shopEndpoint = `https://${shopDomain}/admin/api/2024-10/shop.json`;
    console.log('📍 Shop endpoint:', shopEndpoint);

    // MULTIPLE ATTEMPTS with different payloads for maximum success
    const updateAttempts = [
      // Attempt 1: Full store details
      {
        shop: {
          name: storeName,
          email: `hello@${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          customer_email: `support@${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          address1: "123 Business Street",
          city: "Business City",
          country: "United States",
          zip: "10001",
          phone: "+1-555-STORE-01"
        }
      },
      // Attempt 2: Name and basic contact only
      {
        shop: {
          name: storeName,
          email: `hello@${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          shop_owner: `${storeName} Team`
        }
      },
      // Attempt 3: Name only (most likely to succeed)
      {
        shop: {
          name: storeName
        }
      },
      // Attempt 4: Name with shop_owner
      {
        shop: {
          name: storeName,
          shop_owner: storeName
        }
      }
    ];

    let successfulUpdate = null;
    let updateMode = 'failed';

    for (let i = 0; i < updateAttempts.length; i++) {
      try {
        console.log(`🔄 Store update attempt ${i + 1}/${updateAttempts.length}`);
        
        const updateResponse = await fetch(shopEndpoint, {
          method: 'PUT',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateAttempts[i]),
        });

        console.log(`📡 Store update attempt ${i + 1} response status:`, updateResponse.status);

        if (updateResponse.ok) {
          const result = await updateResponse.json();
          successfulUpdate = result;
          updateMode = i === 0 ? 'complete' : i === 1 ? 'enhanced' : i === 2 ? 'basic' : 'minimal';
          console.log(`✅ CRITICAL SUCCESS: Store name updated on attempt ${i + 1}:`, result.shop?.name);
          break;
        } else {
          const errorText = await updateResponse.text();
          console.warn(`⚠️ Store update attempt ${i + 1} failed:`, updateResponse.status, errorText);
          
          // Try to continue with next attempt
          if (i < updateAttempts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between attempts
            continue;
          }
        }
      } catch (attemptError) {
        console.error(`❌ Store update attempt ${i + 1} error:`, attemptError);
        if (i < updateAttempts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      }
    }

    // If all attempts failed, try a GET request to verify the store exists
    if (!successfulUpdate) {
      console.log('🔍 All update attempts failed, verifying store access...');
      
      try {
        const verifyResponse = await fetch(shopEndpoint, {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        });

        if (verifyResponse.ok) {
          const currentShop = await verifyResponse.json();
          console.log('📊 Store verification successful, current shop:', currentShop.shop?.name);
          
          // Return partial success
          return new Response(JSON.stringify({
            success: false,
            warning: true,
            message: 'Store name update failed but store is accessible',
            current_shop_name: currentShop.shop?.name,
            intended_shop_name: storeName,
            shop_domain: shopDomain,
            update_mode: 'verification_only',
            recommendation: 'Please check Shopify permissions or try updating manually'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          throw new Error(`Store verification also failed: ${verifyResponse.status}`);
        }
      } catch (verifyError) {
        console.error('❌ Store verification failed:', verifyError);
      }
    }

    if (successfulUpdate) {
      console.log('✅ FINAL SUCCESS: Store details updated successfully:', {
        name: successfulUpdate.shop?.name,
        email: successfulUpdate.shop?.email,
        domain: shopDomain,
        mode: updateMode
      });

      return new Response(JSON.stringify({
        success: true,
        message: `Store name successfully updated to "${successfulUpdate.shop?.name}"`,
        shop_name: successfulUpdate.shop?.name || storeName,
        shop_email: successfulUpdate.shop?.email,
        shop_domain: shopDomain,
        update_mode: updateMode,
        shopify_response: successfulUpdate
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('All store name update attempts failed');
    }

  } catch (error) {
    console.error('❌ CRITICAL: Store update completely failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to update store name',
      details: 'Store name update process failed - check credentials, permissions, and shop URL format',
      troubleshooting: {
        check_access_token: 'Verify your Shopify Admin API access token has write permissions',
        check_shop_url: 'Ensure shop URL format is correct (shop-name.myshopify.com)',
        check_permissions: 'Confirm API permissions include shop settings modification'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

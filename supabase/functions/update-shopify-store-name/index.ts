
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
    
    console.log('🏪 Updating Shopify store name to:', storeName);
    console.log('🔗 Shopify URL:', shopifyUrl);

    // Validate required parameters
    if (!storeName || !accessToken || !shopifyUrl) {
      throw new Error('Missing required parameters: storeName, accessToken, or shopifyUrl');
    }

    // Extract shop domain from URL
    let shopDomain = shopifyUrl;
    if (shopifyUrl.includes && shopifyUrl.includes('://')) {
      shopDomain = shopifyUrl.split('://')[1];
    }
    if (shopDomain.endsWith && shopDomain.endsWith('/')) {
      shopDomain = shopDomain.slice(0, -1);
    }

    console.log('🎯 Target shop domain:', shopDomain);

    // Update the shop name and other store details
    const updateResponse = await fetch(`https://${shopDomain}/admin/api/2024-10/shop.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shop: {
          name: storeName,
          email: `info@${storeName.toLowerCase().replace(/\s+/g, '')}.com`,
          customer_email: `support@${storeName.toLowerCase().replace(/\s+/g, '')}.com`,
          address1: "123 Business Street",
          city: "Business City",
          country: "United States",
          zip: "10001",
          phone: "+1-555-STORE-01"
        }
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Store update failed:', errorText);
      
      // Try a simpler update with just the name
      const simpleUpdateResponse = await fetch(`https://${shopDomain}/admin/api/2024-10/shop.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop: {
            name: storeName
          }
        }),
      });

      if (!simpleUpdateResponse.ok) {
        const simpleErrorText = await simpleUpdateResponse.text();
        throw new Error(`Failed to update store name: ${simpleUpdateResponse.status} - ${simpleErrorText}`);
      }

      const simpleResult = await simpleUpdateResponse.json();
      console.log('✅ Store name updated (simple mode):', simpleResult.shop.name);

      return new Response(JSON.stringify({
        success: true,
        message: 'Store name updated successfully (basic)',
        shop_name: simpleResult.shop.name,
        shop_domain: shopDomain,
        update_mode: 'basic'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await updateResponse.json();
    console.log('✅ Store details updated successfully:', {
      name: result.shop.name,
      email: result.shop.email,
      domain: shopDomain
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Store details updated successfully',
      shop_name: result.shop.name,
      shop_email: result.shop.email,
      shop_domain: shopDomain,
      update_mode: 'complete'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Store update failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to update store details',
      details: 'Store update process failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

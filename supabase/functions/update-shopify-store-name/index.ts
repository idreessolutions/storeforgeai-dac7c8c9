
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
    const { storeName, accessToken } = await req.json();
    
    console.log('🏪 Updating Shopify store name...');
    console.log('New store name:', storeName);

    // First, get the shop info to determine the shop domain
    const shopInfoResponse = await fetch(`https://admin.shopify.com/admin/api/2024-10/shop.json`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!shopInfoResponse.ok) {
      throw new Error(`Failed to get shop info: ${shopInfoResponse.status}`);
    }

    const shopInfo = await shopInfoResponse.json();
    const shopDomain = shopInfo.shop.myshopify_domain;
    
    console.log('Shop domain:', shopDomain);

    // Update the shop name using the correct shop domain
    const updateResponse = await fetch(`https://${shopDomain}/admin/api/2024-10/shop.json`, {
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

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Store name update failed:', errorText);
      throw new Error(`Failed to update store name: ${updateResponse.status} - ${errorText}`);
    }

    const result = await updateResponse.json();
    console.log('✅ Store name updated successfully:', result.shop.name);

    return new Response(JSON.stringify({
      success: true,
      message: 'Store name updated successfully',
      shop_name: result.shop.name,
      shop_domain: shopDomain
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Store name update failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to update store name',
      details: 'Store name update process failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

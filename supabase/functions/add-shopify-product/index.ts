
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
    const { shopifyUrl, accessToken, product } = await req.json();

    console.log('Adding product to Shopify:', product.title);

    // Validate inputs
    if (!shopifyUrl || !accessToken || !product) {
      throw new Error('Missing required parameters');
    }

    // Construct the Shopify Admin API URL
    const apiUrl = `${shopifyUrl}/admin/api/2024-10/products.json`;
    
    console.log('Shopify API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ product }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API error:', errorText);
      
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors) {
          errorMessage = typeof errorData.errors === 'string' 
            ? errorData.errors 
            : JSON.stringify(errorData.errors);
        }
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const responseData = await response.json();
    console.log('Product added successfully:', responseData.product?.id);

    return new Response(JSON.stringify({ 
      success: true, 
      product: responseData.product 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in add-shopify-product function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

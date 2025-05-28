
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

    // Generate completely unique identifiers with current timestamp
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const uniqueId = `${timestamp}-${randomSuffix}`;

    // Generate unique handle
    const baseHandle = product.handle || product.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const uniqueHandle = `${baseHandle}-${uniqueId}`;

    // Prepare variants - ensure we have unique option values
    const preparedVariants = product.variants.map((variant, index) => {
      const variantId = `${timestamp}-v${index}-${randomSuffix}`;
      const baseTitle = variant.title || 'Default';
      const uniqueVariantTitle = `${baseTitle}-${variantId}`;
      
      return {
        title: uniqueVariantTitle,
        price: parseFloat(variant.price).toFixed(2),
        sku: `${variant.sku || 'SKU'}-${variantId}`,
        inventory_management: null,
        inventory_policy: 'continue',
        inventory_quantity: 999,
        weight: 0.5,
        weight_unit: 'lb',
        requires_shipping: true,
        taxable: true,
        compare_at_price: null,
        fulfillment_service: 'manual',
        option1: `${baseTitle}-${variantId}` // This must match the option values
      };
    });

    // Create option values that exactly match the variant option1 values
    const optionValues = preparedVariants.map(variant => variant.option1);

    // Prepare the product payload with proper options structure
    const productPayload = {
      product: {
        title: `${product.title} ${uniqueId}`,
        body_html: product.body_html || `<p>${product.description || 'High-quality product'}</p>`,
        vendor: product.vendor || 'StoreForge AI',
        product_type: product.product_type || 'General',
        handle: uniqueHandle,
        status: 'active',
        published: true,
        tags: product.tags || 'winning products, trending',
        images: product.images || [],
        variants: preparedVariants,
        options: [
          {
            name: 'Size',
            position: 1,
            values: optionValues
          }
        ]
      }
    };

    console.log('Product payload:', JSON.stringify(productPayload, null, 2));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
        'Accept': 'application/json',
        'User-Agent': 'StoreForge AI/1.0'
      },
      body: JSON.stringify(productPayload),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API error:', errorText);
      
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors) {
          if (typeof errorData.errors === 'object') {
            // Handle structured errors
            const errorMessages = [];
            for (const [field, messages] of Object.entries(errorData.errors)) {
              if (Array.isArray(messages)) {
                errorMessages.push(`${field}: ${messages.join(', ')}`);
              } else {
                errorMessages.push(`${field}: ${messages}`);
              }
            }
            errorMessage = errorMessages.join('; ');
          } else {
            errorMessage = errorData.errors;
          }
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

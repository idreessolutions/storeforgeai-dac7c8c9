
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

    console.log('✅ Step 2: Upload Product to Shopify via Admin API:', product.title);

    // Validate inputs
    if (!shopifyUrl || !accessToken || !product) {
      throw new Error('Missing required parameters');
    }

    // Extract domain from URL
    const domain = shopifyUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const apiUrl = `https://${domain}/admin/api/2024-10/products.json`;
    
    console.log('Shopify API URL:', apiUrl);

    // ✅ Enhanced product payload structure based on your code
    const productPayload = {
      product: {
        title: product.title,
        body_html: `<p>${product.description}</p>`,
        vendor: product.vendor || 'StoreForge AI',
        product_type: product.product_type || product.category || 'General',
        handle: product.handle || generateHandle(product.title),
        status: 'active',
        published: true,
        tags: product.tags || 'winning product, trending',
        images: (product.images || []).map((url, index) => ({
          src: url,
          alt: `${product.title} - Image ${index + 1}`,
          position: index + 1
        })),
        variants: (product.variants || []).map((variant, index) => ({
          title: variant.title,
          price: typeof variant.price === 'number' ? variant.price.toFixed(2) : parseFloat(String(variant.price)).toFixed(2),
          sku: variant.sku || `${product.product_type?.substring(0,3).toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
          inventory_management: null,
          inventory_policy: 'continue',
          inventory_quantity: 999,
          weight: 0.5,
          weight_unit: 'lb',
          requires_shipping: true,
          taxable: true,
          compare_at_price: null,
          fulfillment_service: 'manual'
        })),
        seo_title: product.title,
        seo_description: product.description ? product.description.substring(0, 160) : `Buy ${product.title} - Premium quality with fast shipping.`
      }
    };

    // Add options for multiple variants
    if (productPayload.product.variants.length > 1) {
      productPayload.product.options = [
        {
          name: 'Type',
          position: 1,
          values: productPayload.product.variants.map(variant => variant.title)
        }
      ];
      
      // Add option1 field for multiple variants
      productPayload.product.variants.forEach((variant, index) => {
        variant.option1 = variant.title;
      });
    }

    console.log('Product payload:', JSON.stringify({
      title: productPayload.product.title,
      handle: productPayload.product.handle,
      product_type: productPayload.product.product_type,
      vendor: productPayload.product.vendor,
      variants: productPayload.product.variants.map(v => ({ title: v.title, price: v.price, sku: v.sku })),
      images: {
        count: productPayload.product.images.length,
        samples: productPayload.product.images.slice(0, 3).map(img => ({ src: img.src, alt: img.alt }))
      }
    }, null, 2));

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
    console.log('✅ Product uploaded successfully:', {
      id: responseData.product?.id,
      title: responseData.product?.title,
      product_type: responseData.product?.product_type,
      vendor: responseData.product?.vendor,
      images: responseData.product?.images?.length || 0,
      variants: responseData.product?.variants?.length || 0
    });

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

function generateHandle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 255);
}

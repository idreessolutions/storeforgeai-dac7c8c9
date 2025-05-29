
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

    // Clean up the product title - remove any timestamps or random IDs
    const cleanTitle = product.title.replace(/[0-9]{10,}/g, '').replace(/[-_][a-z0-9]{8,}/gi, '').trim();
    
    // Generate clean handle from title
    const cleanHandle = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Prepare clean variants with professional names and SKUs
    const preparedVariants = product.variants.map((variant, index) => {
      // Clean variant title - remove timestamps and random IDs
      let variantTitle = variant.title.replace(/[0-9]{10,}/g, '').replace(/[-_][a-z0-9]{8,}/gi, '').trim();
      if (!variantTitle || variantTitle.length < 2) {
        variantTitle = index === 0 ? 'Standard' : `Option ${index + 1}`;
      }
      
      // Ensure price is valid
      let price = parseFloat(variant.price);
      if (isNaN(price) || price <= 0) {
        price = 29.99 + (index * 5);
      }
      
      // Clean SKU - use meaningful format
      let cleanSKU = variant.sku;
      if (!cleanSKU || cleanSKU.includes('undefined') || cleanSKU.length > 50) {
        const titleCode = cleanTitle.substring(0, 3).toUpperCase();
        cleanSKU = `${titleCode}-${String(index + 1).padStart(3, '0')}`;
      }
      
      return {
        title: variantTitle,
        price: price.toFixed(2),
        sku: cleanSKU,
        inventory_management: null,
        inventory_policy: 'continue',
        inventory_quantity: 999,
        weight: 0.5,
        weight_unit: 'lb',
        requires_shipping: true,
        taxable: true,
        compare_at_price: null,
        fulfillment_service: 'manual'
      };
    });

    // Prepare the product payload with clean data
    const productPayload = {
      product: {
        title: cleanTitle,
        body_html: product.body_html || `<p>${product.description || 'Premium quality product with excellent features and benefits.'}</p>`,
        vendor: product.vendor || 'TrendingProducts',
        product_type: product.product_type || 'General',
        handle: cleanHandle,
        status: 'active',
        published: true,
        tags: product.tags || 'trending, bestseller, premium quality',
        images: product.images && Array.isArray(product.images) ? product.images.map(url => ({
          src: url,
          alt: cleanTitle
        })) : [],
        variants: preparedVariants,
        options: preparedVariants.length > 1 ? [
          {
            name: 'Type',
            position: 1,
            values: preparedVariants.map(variant => variant.title)
          }
        ] : []
      }
    };

    console.log('Clean product payload:', JSON.stringify({
      title: productPayload.product.title,
      handle: productPayload.product.handle,
      variants: productPayload.product.variants.map(v => ({ title: v.title, price: v.price, sku: v.sku })),
      images: productPayload.product.images.length
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
    console.log('Product added successfully:', responseData.product?.id, 'Title:', responseData.product?.title);

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

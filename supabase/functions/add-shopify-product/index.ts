
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
    const { shopifyUrl, accessToken, product, themeColor } = await req.json();

    console.log('✅ Uploading Product to Shopify:', product.title);

    // Validate inputs
    if (!shopifyUrl || !accessToken || !product) {
      throw new Error('Missing required parameters');
    }

    // Extract domain from URL
    const domain = shopifyUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const apiUrl = `https://${domain}/admin/api/2024-10/products.json`;
    
    console.log('Shopify API URL:', apiUrl);

    // Enhanced product payload with theme color integration and comprehensive details
    const safeTitle = product.title || 'Untitled Product';
    const safeDescription = product.description || 'High-quality product designed to enhance your lifestyle.';
    const detailedDescription = product.detailed_description || product.description || safeDescription;
    const appliedThemeColor = themeColor || '#1E40AF';
    
    // Create rich HTML description with theme color styling
    const formattedDescription = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="color: ${appliedThemeColor}; font-size: 18px; font-weight: bold; margin-bottom: 16px;">
          ${safeTitle}
        </div>
        
        <div style="margin-bottom: 20px;">
          <p style="font-size: 16px; color: #333;">${safeDescription}</p>
        </div>

        ${product.features ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: ${appliedThemeColor}; font-size: 16px; margin-bottom: 10px;">✨ Key Features:</h3>
          <ul style="color: #555; padding-left: 20px;">
            ${product.features.map(feature => `<li style="margin-bottom: 5px;">${feature}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        ${product.benefits ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: ${appliedThemeColor}; font-size: 16px; margin-bottom: 10px;">🎯 Benefits:</h3>
          <ul style="color: #555; padding-left: 20px;">
            ${product.benefits.map(benefit => `<li style="margin-bottom: 5px;">${benefit}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        <div style="margin-bottom: 20px;">
          <h3 style="color: ${appliedThemeColor}; font-size: 16px; margin-bottom: 10px;">📦 Product Details:</h3>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid ${appliedThemeColor};">
            <p style="margin: 0; color: #555;">${detailedDescription}</p>
          </div>
        </div>

        ${product.target_audience ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: ${appliedThemeColor}; font-size: 16px; margin-bottom: 10px;">👥 Perfect For:</h3>
          <p style="color: #555; font-style: italic;">${product.target_audience}</p>
        </div>
        ` : ''}

        <div style="margin-bottom: 20px;">
          <h3 style="color: ${appliedThemeColor}; font-size: 16px; margin-bottom: 10px;">🚚 Shipping & Returns:</h3>
          <p style="color: #555; margin-bottom: 8px;"><strong>Shipping:</strong> ${product.shipping_info || 'Fast worldwide shipping'}</p>
          <p style="color: #555; margin: 0;"><strong>Returns:</strong> ${product.return_policy || '30-day money-back guarantee'}</p>
        </div>

        <div style="background-color: ${appliedThemeColor}; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px;">
          <p style="margin: 0; font-weight: bold; font-size: 16px;">🎉 Special Launch Offer - Limited Time!</p>
          <p style="margin: 8px 0 0 0; font-size: 14px;">Order now and get FREE shipping + our satisfaction guarantee!</p>
        </div>
      </div>
    `;

    const productPayload = {
      product: {
        title: safeTitle,
        body_html: formattedDescription,
        vendor: product.vendor || 'StoreForge AI',
        product_type: product.product_type || product.category || 'General',
        handle: product.handle || generateHandle(safeTitle),
        status: 'active',
        published: true,
        tags: product.tags || 'winning product, trending, bestseller',
        images: (product.images || []).map((url, index) => ({
          src: url,
          alt: `${safeTitle} - Image ${index + 1}`,
          position: index + 1
        })),
        variants: (product.variants || []).map((variant, index) => ({
          title: variant.title || 'Standard',
          price: typeof variant.price === 'number' ? variant.price.toFixed(2) : parseFloat(String(variant.price || product.price || 29.99)).toFixed(2),
          sku: variant.sku || `${product.product_type?.substring(0,3).toUpperCase() || 'PRD'}-${String(index + 1).padStart(3, '0')}`,
          inventory_management: null,
          inventory_policy: 'continue',
          inventory_quantity: 999,
          weight: 0.5,
          weight_unit: 'lb',
          requires_shipping: true,
          taxable: true,
          compare_at_price: variant.price ? (variant.price * 1.5).toFixed(2) : null,
          fulfillment_service: 'manual'
        })),
        seo_title: safeTitle,
        seo_description: safeDescription ? safeDescription.substring(0, 160) : `Buy ${safeTitle} - Premium quality with fast shipping.`,
        metafields: [
          {
            namespace: 'custom',
            key: 'theme_color',
            value: appliedThemeColor,
            type: 'single_line_text_field'
          },
          {
            namespace: 'custom',
            key: 'features',
            value: JSON.stringify(product.features || []),
            type: 'json'
          },
          {
            namespace: 'custom',
            key: 'benefits',
            value: JSON.stringify(product.benefits || []),
            type: 'json'
          }
        ]
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

    console.log('Product payload with theme color and enhanced details:', JSON.stringify({
      title: productPayload.product.title,
      handle: productPayload.product.handle,
      product_type: productPayload.product.product_type,
      vendor: productPayload.product.vendor,
      theme_color: appliedThemeColor,
      variants: productPayload.product.variants.map(v => ({ title: v.title, price: v.price, sku: v.sku })),
      images: {
        count: productPayload.product.images.length,
        samples: productPayload.product.images.slice(0, 3).map(img => ({ src: img.src, alt: img.alt }))
      },
      features_count: product.features?.length || 0,
      benefits_count: product.benefits?.length || 0
    }, null, 2));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
        'Accept': 'application/json',
        'User-Agent': 'StoreForge AI/2.0'
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
    console.log('✅ Product uploaded successfully with comprehensive details and theme color:', {
      id: responseData.product?.id,
      title: responseData.product?.title,
      product_type: responseData.product?.product_type,
      vendor: responseData.product?.vendor,
      theme_color: appliedThemeColor,
      images: responseData.product?.images?.length || 0,
      variants: responseData.product?.variants?.length || 0,
      metafields: responseData.product?.metafields?.length || 0
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

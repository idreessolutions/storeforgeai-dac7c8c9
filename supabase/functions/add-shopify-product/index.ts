
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

    console.log('✅ Uploading Real Winning Product to Shopify:', product.title);
    console.log('🎨 Applying theme color:', themeColor);

    // Validate inputs
    if (!shopifyUrl || !accessToken || !product) {
      throw new Error('Missing required parameters');
    }

    // Extract domain from URL
    const domain = shopifyUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const apiUrl = `https://${domain}/admin/api/2024-10/products.json`;
    
    console.log('Shopify API URL:', apiUrl);

    // Enhanced product payload with theme color integration
    const safeTitle = product.title || 'Premium Product';
    const safeDescription = product.description || 'High-quality winning product designed to enhance your lifestyle.';
    const appliedThemeColor = themeColor || '#1E40AF';
    
    // Create rich HTML description with theme color styling
    const formattedDescription = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
        <div style="background: linear-gradient(135deg, ${appliedThemeColor}, ${appliedThemeColor}dd); color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h2 style="margin: 0; font-size: 24px; font-weight: bold;">${safeTitle}</h2>
          <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.95;">🔥 TRENDING NOW - Limited Time Offer!</p>
        </div>
        
        <div style="margin-bottom: 24px; padding: 0 8px;">
          ${safeDescription.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong style="color: ' + appliedThemeColor + ';">$1</strong>')}
        </div>

        ${product.features ? `
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${appliedThemeColor};">
          <h3 style="color: ${appliedThemeColor}; font-size: 18px; margin: 0 0 12px 0; display: flex; align-items: center;">
            <span style="margin-right: 8px;">✨</span> Key Features
          </h3>
          <ul style="margin: 0; padding-left: 20px; color: #555;">
            ${product.features.map(feature => `<li style="margin-bottom: 8px; line-height: 1.5;"><strong>${feature}</strong></li>`).join('')}
          </ul>
        </div>
        ` : ''}

        ${product.benefits ? `
        <div style="background: linear-gradient(135deg, ${appliedThemeColor}11, ${appliedThemeColor}22); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: ${appliedThemeColor}; font-size: 18px; margin: 0 0 12px 0; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🎯</span> Benefits You'll Love
          </h3>
          <div style="display: grid; gap: 8px;">
            ${product.benefits.map(benefit => `<div style="display: flex; align-items: center; color: #333;"><span style="color: ${appliedThemeColor}; margin-right: 8px; font-weight: bold;">✓</span> ${benefit}</div>`).join('')}
          </div>
        </div>
        ` : ''}

        <div style="background-color: #fff; border: 2px solid ${appliedThemeColor}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: ${appliedThemeColor}; font-size: 18px; margin: 0 0 12px 0; display: flex; align-items: center;">
            <span style="margin-right: 8px;">👥</span> Perfect For
          </h3>
          <p style="margin: 0; color: #555; font-style: italic; font-size: 16px;">${product.target_audience || `${product.category} enthusiasts and professionals`}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px;">
            <h4 style="color: ${appliedThemeColor}; font-size: 16px; margin: 0 0 8px 0; display: flex; align-items: center;">
              <span style="margin-right: 8px;">🚚</span> Shipping
            </h4>
            <p style="margin: 0; color: #555; font-size: 14px;">${product.shipping_info || 'Fast worldwide shipping'}</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px;">
            <h4 style="color: ${appliedThemeColor}; font-size: 16px; margin: 0 0 8px 0; display: flex; align-items: center;">
              <span style="margin-right: 8px;">🔄</span> Returns
            </h4>
            <p style="margin: 0; color: #555; font-size: 14px;">${product.return_policy || '30-day money-back guarantee'}</p>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, ${appliedThemeColor}, ${appliedThemeColor}dd); color: white; padding: 24px; border-radius: 12px; text-align: center; box-shadow: 0 4px 12px ${appliedThemeColor}33;">
          <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: bold;">🎉 Special Launch Offer!</h3>
          <p style="margin: 0 0 12px 0; font-size: 16px; opacity: 0.95;">Limited time: FREE shipping + satisfaction guarantee</p>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">⏰ This deal won't last long - order now!</p>
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
          compare_at_price: variant.price ? (variant.price * 1.3).toFixed(2) : null,
          fulfillment_service: 'manual'
        })),
        seo_title: safeTitle,
        seo_description: safeDescription ? safeDescription.substring(0, 160).replace(/[^\w\s]/gi, '') : `Buy ${safeTitle} - Premium quality with fast shipping.`,
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
          },
          {
            namespace: 'custom',
            key: 'product_category',
            value: product.category || 'general',
            type: 'single_line_text_field'
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

    console.log('Real winning product payload:', JSON.stringify({
      title: productPayload.product.title,
      handle: productPayload.product.handle,
      product_type: productPayload.product.product_type,
      vendor: productPayload.product.vendor,
      theme_color: appliedThemeColor,
      variants: productPayload.product.variants.map(v => ({ title: v.title, price: v.price, sku: v.sku })),
      images: {
        count: productPayload.product.images.length,
        samples: productPayload.product.images.slice(0, 2).map(img => ({ src: img.src, alt: img.alt }))
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
    console.log('✅ Real winning product uploaded successfully:', {
      id: responseData.product?.id,
      title: responseData.product?.title,
      product_type: responseData.product?.product_type,
      vendor: responseData.product?.vendor,
      theme_color: appliedThemeColor,
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

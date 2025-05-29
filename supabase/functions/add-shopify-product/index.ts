
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
    
    // Create rich HTML description with theme color styling and proper structure
    const formattedDescription = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px;">
        <!-- Hero Section -->
        <div style="background: linear-gradient(135deg, ${appliedThemeColor}, ${appliedThemeColor}dd); color: white; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 32px; box-shadow: 0 4px 16px ${appliedThemeColor}33;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold; line-height: 1.2;">${safeTitle}</h1>
          <p style="margin: 12px 0 0 0; font-size: 18px; opacity: 0.95;">🔥 TRENDING NOW - Limited Time Offer!</p>
        </div>
        
        <!-- Main Description -->
        <div style="margin-bottom: 32px; padding: 0 16px; font-size: 16px; line-height: 1.7;">
          ${formatDescriptionContent(safeDescription, appliedThemeColor)}
        </div>

        <!-- Features Section -->
        ${product.features && product.features.length > 0 ? `
        <div style="background: linear-gradient(135deg, ${appliedThemeColor}08, ${appliedThemeColor}15); padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid ${appliedThemeColor};">
          <h2 style="color: ${appliedThemeColor}; font-size: 22px; margin: 0 0 16px 0; display: flex; align-items: center; font-weight: bold;">
            <span style="margin-right: 12px; font-size: 24px;">✨</span> Key Features
          </h2>
          <div style="display: grid; gap: 12px;">
            ${product.features.map(feature => 
              `<div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="color: ${appliedThemeColor}; font-weight: bold; font-size: 18px; margin-top: 2px;">•</span>
                <span style="color: #333; font-size: 16px; line-height: 1.5;"><strong>${feature}</strong></span>
              </div>`
            ).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Benefits Section -->
        ${product.benefits && product.benefits.length > 0 ? `
        <div style="background: linear-gradient(135deg, ${appliedThemeColor}12, ${appliedThemeColor}25); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: ${appliedThemeColor}; font-size: 22px; margin: 0 0 16px 0; display: flex; align-items: center; font-weight: bold;">
            <span style="margin-right: 12px; font-size: 24px;">🎯</span> Benefits You'll Love
          </h2>
          <div style="display: grid; gap: 10px;">
            ${product.benefits.map(benefit => 
              `<div style="display: flex; align-items: center; gap: 12px;">
                <span style="color: ${appliedThemeColor}; margin-right: 8px; font-weight: bold; font-size: 16px;">✓</span>
                <span style="color: #333; font-size: 16px;">${benefit}</span>
              </div>`
            ).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Target Audience Section -->
        <div style="background: #ffffff; border: 2px solid ${appliedThemeColor}; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: ${appliedThemeColor}; font-size: 22px; margin: 0 0 12px 0; display: flex; align-items: center; font-weight: bold;">
            <span style="margin-right: 12px; font-size: 24px;">👥</span> Perfect For
          </h2>
          <p style="margin: 0; color: #555; font-style: italic; font-size: 17px; line-height: 1.6;">${product.target_audience || `${product.category} enthusiasts and professionals seeking premium quality solutions`}</p>
        </div>

        <!-- Shipping & Returns -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px;">
          <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-top: 3px solid ${appliedThemeColor};">
            <h3 style="color: ${appliedThemeColor}; font-size: 18px; margin: 0 0 10px 0; display: flex; align-items: center; font-weight: bold;">
              <span style="margin-right: 10px; font-size: 20px;">🚚</span> Shipping
            </h3>
            <p style="margin: 0; color: #555; font-size: 15px; line-height: 1.5;">${product.shipping_info || 'Fast worldwide shipping, arrives in 7-14 days'}</p>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-top: 3px solid ${appliedThemeColor};">
            <h3 style="color: ${appliedThemeColor}; font-size: 18px; margin: 0 0 10px 0; display: flex; align-items: center; font-weight: bold;">
              <span style="margin-right: 10px; font-size: 20px;">🔄</span> Returns
            </h3>
            <p style="margin: 0; color: #555; font-size: 15px; line-height: 1.5;">${product.return_policy || '30-day money-back guarantee'}</p>
          </div>
        </div>

        <!-- Call to Action -->
        <div style="background: linear-gradient(135deg, ${appliedThemeColor}, ${appliedThemeColor}dd); color: white; padding: 32px; border-radius: 16px; text-align: center; box-shadow: 0 8px 24px ${appliedThemeColor}40; margin-bottom: 24px;">
          <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: bold;">🎉 Special Launch Offer!</h2>
          <p style="margin: 0 0 16px 0; font-size: 18px; opacity: 0.95;">Limited time: FREE shipping + satisfaction guarantee</p>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">⏰ This deal won't last long - order now and join thousands of satisfied customers!</p>
        </div>

        <!-- Trust Badges -->
        <div style="display: flex; justify-content: center; gap: 24px; padding: 20px; background: #f9fafb; border-radius: 12px; margin-top: 24px;">
          <div style="text-align: center;">
            <div style="font-size: 24px; margin-bottom: 4px;">🛡️</div>
            <div style="font-size: 12px; color: #666; font-weight: 500;">SECURE PAYMENT</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; margin-bottom: 4px;">🚚</div>
            <div style="font-size: 12px; color: #666; font-weight: 500;">FAST SHIPPING</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; margin-bottom: 4px;">💯</div>
            <div style="font-size: 12px; color: #666; font-weight: 500;">SATISFACTION GUARANTEED</div>
          </div>
        </div>
      </div>
    `;

    // Validate and process variants with proper pricing
    const processedVariants = (product.variants || []).map((variant, index) => {
      const validPrice = Math.max(15, Math.min(80, parseFloat(variant.price) || product.price || 29.99));
      const comparePrice = validPrice < 60 ? (validPrice * 1.25).toFixed(2) : null;
      
      return {
        title: variant.title || 'Standard',
        price: validPrice.toFixed(2),
        compare_at_price: comparePrice,
        sku: variant.sku || generateSKU(product.product_type || 'PRD', index),
        inventory_management: null,
        inventory_policy: 'continue',
        inventory_quantity: 999,
        weight: 0.5,
        weight_unit: 'lb',
        requires_shipping: true,
        taxable: true,
        fulfillment_service: 'manual',
        option1: variant.title || 'Standard'
      };
    });

    // Ensure we have at least one variant
    if (processedVariants.length === 0) {
      const defaultPrice = Math.max(15, Math.min(80, product.price || 29.99));
      processedVariants.push({
        title: 'Standard',
        price: defaultPrice.toFixed(2),
        compare_at_price: defaultPrice < 60 ? (defaultPrice * 1.25).toFixed(2) : null,
        sku: generateSKU(product.product_type || 'PRD', 0),
        inventory_management: null,
        inventory_policy: 'continue',
        inventory_quantity: 999,
        weight: 0.5,
        weight_unit: 'lb',
        requires_shipping: true,
        taxable: true,
        fulfillment_service: 'manual',
        option1: 'Standard'
      });
    }

    // Process images with proper validation
    const processedImages = (product.images || []).slice(0, 8).map((url, index) => ({
      src: url,
      alt: `${safeTitle} - Image ${index + 1}`,
      position: index + 1
    }));

    const productPayload = {
      product: {
        title: safeTitle,
        body_html: formattedDescription,
        vendor: product.vendor || 'StoreForge AI',
        product_type: product.product_type || product.category || 'General',
        handle: product.handle || generateHandle(safeTitle),
        status: 'active',
        published: true,
        tags: product.tags || `winning-product, trending, bestseller, ${product.category?.toLowerCase() || 'general'}`,
        images: processedImages,
        variants: processedVariants,
        seo_title: safeTitle.length > 60 ? safeTitle.substring(0, 60) : safeTitle,
        seo_description: generateSEODescription(safeDescription, safeTitle),
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
            key: 'niche_category',
            value: product.category || 'general',
            type: 'single_line_text_field'
          },
          {
            namespace: 'custom',
            key: 'target_audience',
            value: product.target_audience || '',
            type: 'single_line_text_field'
          }
        ]
      }
    };

    // Add options for multiple variants
    if (processedVariants.length > 1) {
      productPayload.product.options = [
        {
          name: 'Variant',
          position: 1,
          values: processedVariants.map(variant => variant.title)
        }
      ];
    }

    console.log('Enhanced product payload:', JSON.stringify({
      title: productPayload.product.title,
      handle: productPayload.product.handle,
      product_type: productPayload.product.product_type,
      vendor: productPayload.product.vendor,
      theme_color: appliedThemeColor,
      variants_count: processedVariants.length,
      images_count: processedImages.length,
      price_range: `$${Math.min(...processedVariants.map(v => parseFloat(v.price)))} - $${Math.max(...processedVariants.map(v => parseFloat(v.price)))}`
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
      handle: responseData.product?.handle,
      product_type: responseData.product?.product_type,
      vendor: responseData.product?.vendor,
      theme_color: appliedThemeColor,
      images_count: responseData.product?.images?.length || 0,
      variants_count: responseData.product?.variants?.length || 0,
      price_range: responseData.product?.variants ? 
        `$${Math.min(...responseData.product.variants.map(v => parseFloat(v.price)))} - $${Math.max(...responseData.product.variants.map(v => parseFloat(v.price)))}` : 
        'N/A'
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

function formatDescriptionContent(description, themeColor) {
  return description
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, `<strong style="color: ${themeColor};">$1</strong>`)
    .replace(/🔥/g, '<span style="color: #FF6B35; font-weight: bold;">🔥</span>')
    .replace(/✅/g, `<span style="color: ${themeColor};">✅</span>`)
    .replace(/🎯/g, `<span style="color: ${themeColor};">🎯</span>`)
    .replace(/👥/g, `<span style="color: ${themeColor};">👥</span>`)
    .replace(/📦/g, `<span style="color: ${themeColor};">📦</span>`);
}

function generateSEODescription(description, title) {
  const cleanDescription = description.replace(/[^\w\s]/gi, ' ').replace(/\s+/g, ' ').trim();
  const excerpt = cleanDescription.substring(0, 140);
  return `${excerpt}... Shop ${title} with fast shipping and satisfaction guarantee.`;
}

function generateSKU(productType, index) {
  const prefix = productType ? productType.substring(0, 3).toUpperCase() : 'PRD';
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${timestamp}-${String(index + 1).padStart(2, '0')}`;
}

function generateHandle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 255);
}


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
    const { shopifyUrl, accessToken, themeColor, product } = await req.json();
    
    console.log('✅ Uploading Real Winning Product to Shopify:', product.title);
    console.log('🎨 Applying theme color:', themeColor);
    
    const apiUrl = `${shopifyUrl}/admin/api/2024-10/products.json`;
    console.log('Shopify API URL:', apiUrl);

    // Apply theme color to product description
    const styledDescription = applyThemeColorToDescription(product.description || product.detailed_description, themeColor);

    // Prepare product payload for Shopify
    const productPayload = {
      product: {
        title: product.title,
        body_html: styledDescription,
        vendor: product.vendor || 'StoreForge AI',
        product_type: product.product_type || 'General',
        handle: product.handle,
        status: 'active',
        published: true,
        tags: product.tags || '',
        variants: product.variants?.map((variant, index) => ({
          title: variant.title || 'Default',
          price: typeof variant.price === 'number' ? variant.price.toFixed(2) : parseFloat(String(variant.price)).toFixed(2),
          sku: variant.sku || `SKU-${Date.now()}-${index}`,
          inventory_management: null,
          inventory_policy: 'continue',
          inventory_quantity: 999,
          weight: 0.5,
          weight_unit: 'lb',
          requires_shipping: true,
          taxable: true,
          compare_at_price: null
        })) || [
          {
            title: 'Default',
            price: typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(String(product.price)).toFixed(2),
            sku: `SKU-${Date.now()}-0`,
            inventory_management: null,
            inventory_policy: 'continue',
            inventory_quantity: 999,
            weight: 0.5,
            weight_unit: 'lb',
            requires_shipping: true,
            taxable: true,
            compare_at_price: null
          }
        ]
      }
    };

    console.log('Enhanced product payload:', {
      title: productPayload.product.title,
      handle: productPayload.product.handle,
      product_type: productPayload.product.product_type,
      vendor: productPayload.product.vendor,
      theme_color: themeColor,
      variants_count: productPayload.product.variants.length,
      images_count: product.images?.length || 0,
      price_range: `$${Math.min(...productPayload.product.variants.map(v => parseFloat(v.price)))} - $${Math.max(...productPayload.product.variants.map(v => parseFloat(v.price)))}`
    });

    // Create product in Shopify
    const productResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify(productPayload),
    });

    console.log('Response status:', productResponse.status);

    if (!productResponse.ok) {
      const errorText = await productResponse.text();
      console.error('Shopify API Error:', errorText);
      throw new Error(`Shopify API Error: ${productResponse.status} - ${errorText}`);
    }

    const productData = await productResponse.json();
    const createdProduct = productData.product;

    // Upload DALL·E 3 images to Shopify using the images endpoint
    if (product.images && product.images.length > 0) {
      console.log(`🖼️ Uploading ${product.images.length} DALL·E 3 images to Shopify...`);
      
      for (let i = 0; i < product.images.length; i++) {
        const imageUrl = product.images[i];
        try {
          console.log(`📷 Uploading image ${i + 1}/${product.images.length}: ${imageUrl.substring(0, 50)}...`);
          
          const imagePayload = {
            image: {
              src: imageUrl,
              alt: product.title,
              position: i + 1
            }
          };

          const imageResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/products/${createdProduct.id}/images.json`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': accessToken,
            },
            body: JSON.stringify(imagePayload),
          });

          if (imageResponse.ok) {
            console.log(`✅ Successfully uploaded image ${i + 1} to Shopify`);
          } else {
            const imageError = await imageResponse.text();
            console.error(`❌ Failed to upload image ${i + 1}:`, imageError);
          }
          
          // Rate limiting between image uploads
          if (i < product.images.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (imageError) {
          console.error(`❌ Error uploading image ${i + 1}:`, imageError);
        }
      }
    }

    console.log('✅ Real winning product uploaded successfully:', {
      id: createdProduct.id,
      title: createdProduct.title,
      handle: createdProduct.handle,
      product_type: createdProduct.product_type,
      vendor: createdProduct.vendor,
      theme_color: themeColor,
      images_count: product.images?.length || 0,
      variants_count: createdProduct.variants?.length || 0,
      price_range: `$${Math.min(...createdProduct.variants.map(v => parseFloat(v.price)))} - $${Math.max(...createdProduct.variants.map(v => parseFloat(v.price)))}`
    });

    return new Response(JSON.stringify({
      success: true,
      product: createdProduct,
      message: `Successfully added real winning product: ${createdProduct.title}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error adding real winning product to Shopify:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to add real winning product to Shopify'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function applyThemeColorToDescription(description: string, themeColor: string): string {
  if (!description || !themeColor) return description || '';

  // Apply theme color to key sections with HTML styling
  let styledDescription = description
    .replace(/🔥\s*\*\*(.*?)\*\*/g, `<div style="background: linear-gradient(135deg, ${themeColor}, ${themeColor}aa); color: white; padding: 12px; border-radius: 8px; margin: 8px 0; font-weight: bold;">🔥 $1</div>`)
    .replace(/✅\s*\*\*(.*?)\*\*/g, `<h3 style="color: ${themeColor}; font-weight: bold; margin: 16px 0 8px 0;">✅ $1</h3>`)
    .replace(/🎯\s*\*\*(.*?)\*\*/g, `<h3 style="color: ${themeColor}; font-weight: bold; margin: 16px 0 8px 0;">🎯 $1</h3>`)
    .replace(/👥\s*\*\*(.*?)\*\*/g, `<h3 style="color: ${themeColor}; font-weight: bold; margin: 16px 0 8px 0;">👥 $1</h3>`)
    .replace(/📦\s*\*\*(.*?)\*\*/g, `<h3 style="color: ${themeColor}; font-weight: bold; margin: 16px 0 8px 0;">📦 $1</h3>`)
    // Convert bullet points to proper HTML
    .replace(/^•\s*(.+)$/gm, '<li style="margin: 4px 0;">$1</li>')
    .replace(/^✓\s*(.+)$/gm, '<li style="margin: 4px 0; color: #10B981;">✓ $1</li>')
    // Wrap lists in ul tags
    .replace(/(<li[^>]*>.*?<\/li>\s*)+/gs, '<ul style="margin: 8px 0; padding-left: 20px;">$&</ul>')
    // Convert line breaks to proper HTML
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');

  // Add a call-to-action box at the end
  styledDescription += `
    <div style="background: linear-gradient(135deg, ${themeColor}, ${themeColor}dd); color: white; padding: 16px; border-radius: 12px; margin: 20px 0; text-align: center; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
      🚀 Limited Time Offer - Order Now & Save! 
      <br><small style="opacity: 0.9;">Fast shipping • 30-day guarantee • Premium quality</small>
    </div>`;

  return styledDescription;
}

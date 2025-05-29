
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
    
    console.log('✅ Uploading Winning Product to Shopify:', product.title);
    console.log('🎨 Applying theme color:', themeColor);
    
    const apiUrl = `${shopifyUrl}/admin/api/2024-10/products.json`;
    console.log('Shopify API URL:', apiUrl);

    // Apply theme color to product description
    const styledDescription = applyThemeColorToDescription(product.description || product.detailed_description, themeColor);

    // Generate unique handle with timestamp to avoid duplicates
    const timestamp = Date.now();
    const uniqueHandle = generateUniqueHandle(product.title, timestamp);

    // CRITICAL FIX: Don't send any variants initially to avoid "Default Title" conflicts
    const productPayload = {
      product: {
        title: product.title,
        body_html: styledDescription,
        vendor: product.vendor || 'StoreForge AI',
        product_type: product.product_type || 'General',
        handle: uniqueHandle,
        status: 'active',
        published: true,
        tags: product.tags || '',
        // Don't send variants - let Shopify create the default one automatically
      }
    };

    console.log('Enhanced product payload:', {
      title: productPayload.product.title,
      handle: productPayload.product.handle,
      product_type: productPayload.product.product_type,
      vendor: productPayload.product.vendor,
      theme_color: themeColor,
      images_count: product.images?.length || 0,
      has_variants: product.variants && product.variants.length > 0
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
      
      // Parse and handle specific Shopify errors
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors) {
          console.error('Detailed Shopify errors:', errorData.errors);
          
          // Handle specific error cases
          if (errorData.errors.handle) {
            console.log('Handle conflict detected, retrying with new handle...');
            const retryHandle = `${uniqueHandle}-retry-${Math.random().toString(36).substring(2, 8)}`;
            productPayload.product.handle = retryHandle;
            
            const retryResponse = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
              },
              body: JSON.stringify(productPayload),
            });
            
            if (!retryResponse.ok) {
              const retryErrorText = await retryResponse.text();
              throw new Error(`Shopify API Error after retry: ${retryResponse.status} - ${retryErrorText}`);
            }
            
            const retryData = await retryResponse.json();
            console.log('✅ Product created successfully after handle retry');
            return await handleImageUploadAndVariants(retryData.product, product, shopifyUrl, accessToken, themeColor);
          }
        }
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
      }
      
      throw new Error(`Shopify API Error: ${productResponse.status} - ${errorText}`);
    }

    const productData = await productResponse.json();
    const createdProduct = productData.product;

    console.log('✅ Product created successfully:', createdProduct.id);

    // Upload images and handle variants separately
    return await handleImageUploadAndVariants(createdProduct, product, shopifyUrl, accessToken, themeColor);

  } catch (error) {
    console.error('❌ Error adding winning product to Shopify:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to add winning product to Shopify'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleImageUploadAndVariants(createdProduct: any, product: any, shopifyUrl: string, accessToken: string, themeColor: string) {
  // First, update the default variant pricing if needed
  if (createdProduct.variants && createdProduct.variants.length > 0 && product.price) {
    const defaultVariant = createdProduct.variants[0];
    try {
      console.log('🔄 Updating default variant pricing...');
      
      const variantUpdateResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/variants/${defaultVariant.id}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({
          variant: {
            id: defaultVariant.id,
            price: typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(String(product.price)).toFixed(2),
            inventory_quantity: 999,
            inventory_management: null,
            inventory_policy: 'continue'
          }
        }),
      });

      if (variantUpdateResponse.ok) {
        console.log('✅ Default variant updated successfully');
      } else {
        const variantError = await variantUpdateResponse.text();
        console.error('❌ Failed to update variant:', variantError);
      }
    } catch (variantError) {
      console.error('❌ Error updating variant:', variantError);
    }
  }

  // Upload DALL·E 3 images to Shopify using the images endpoint
  if (product.images && product.images.length > 0) {
    console.log(`🖼️ Uploading ${product.images.length} DALL·E 3 images to Shopify...`);
    
    for (let i = 0; i < product.images.length; i++) {
      const imageUrl = product.images[i];
      try {
        console.log(`📷 Uploading image ${i + 1}/${product.images.length}`);
        
        // Ensure imageUrl is a string
        const urlString = typeof imageUrl === 'string' ? imageUrl : imageUrl.toString();
        
        const imagePayload = {
          image: {
            src: urlString,
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

  // Create additional variants if needed
  if (product.variants && product.variants.length > 1) {
    console.log(`🔄 Creating ${product.variants.length - 1} additional variants...`);
    
    for (let i = 1; i < product.variants.length; i++) {
      const variant = product.variants[i];
      try {
        const variantPayload = {
          variant: {
            product_id: createdProduct.id,
            title: variant.title || `Variant ${i + 1}`,
            price: typeof variant.price === 'number' ? variant.price.toFixed(2) : parseFloat(String(variant.price)).toFixed(2),
            sku: variant.sku || `VAR-${i + 1}-${Date.now()}`,
            inventory_quantity: 999,
            inventory_management: null,
            inventory_policy: 'continue'
          }
        };

        const variantResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/products/${createdProduct.id}/variants.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
          },
          body: JSON.stringify(variantPayload),
        });

        if (variantResponse.ok) {
          console.log(`✅ Successfully created variant: ${variant.title}`);
        } else {
          const variantError = await variantResponse.text();
          console.error(`❌ Failed to create variant ${variant.title}:`, variantError);
        }
        
        // Rate limiting between variant creation
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (variantError) {
        console.error(`❌ Error creating variant ${variant.title}:`, variantError);
      }
    }
  }

  console.log('✅ Winning product uploaded successfully:', {
    id: createdProduct.id,
    title: createdProduct.title,
    handle: createdProduct.handle,
    product_type: createdProduct.product_type,
    vendor: createdProduct.vendor,
    theme_color: themeColor,
    images_count: product.images?.length || 0,
    variants_count: product.variants?.length || 0,
    default_price: createdProduct.variants?.[0]?.price || product.price
  });

  return new Response(JSON.stringify({
    success: true,
    product: createdProduct,
    message: `Successfully added winning product: ${createdProduct.title}`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function generateUniqueHandle(title: string, timestamp: number): string {
  const baseHandle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
  
  return `${baseHandle}-${timestamp}`;
}

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

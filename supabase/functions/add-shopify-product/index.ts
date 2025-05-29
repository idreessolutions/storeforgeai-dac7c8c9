
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

    // Ensure proper pricing - convert to string with 2 decimals
    const productPrice = typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(String(product.price || 29.99)).toFixed(2);
    
    console.log('Setting product price:', productPrice);

    // Create the main product WITHOUT variants initially
    const productPayload = {
      product: {
        title: product.title,
        body_html: styledDescription,
        vendor: 'Your Store Name', // Changed from StoreForge AI
        product_type: product.product_type || 'General',
        handle: uniqueHandle,
        status: 'active',
        published: true,
        tags: product.tags || '',
        // Don't send variants initially to avoid conflicts
      }
    };

    console.log('Enhanced product payload:', {
      title: productPayload.product.title,
      handle: productPayload.product.handle,
      product_type: productPayload.product.product_type,
      vendor: productPayload.product.vendor,
      theme_color: themeColor,
      images_count: product.images?.length || 0,
      price: productPrice
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

    console.log('✅ Product created successfully:', createdProduct.id);

    // Now handle pricing, images, and variants
    return await handleProductEnhancements(createdProduct, product, shopifyUrl, accessToken, themeColor, productPrice);

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

async function handleProductEnhancements(createdProduct: any, product: any, shopifyUrl: string, accessToken: string, themeColor: string, productPrice: string) {
  
  // STEP 1: Update the default variant with proper pricing
  if (createdProduct.variants && createdProduct.variants.length > 0) {
    const defaultVariant = createdProduct.variants[0];
    try {
      console.log('🔄 Updating default variant pricing to:', productPrice);
      
      const variantUpdateResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/variants/${defaultVariant.id}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({
          variant: {
            id: defaultVariant.id,
            price: productPrice,
            compare_at_price: (parseFloat(productPrice) * 1.3).toFixed(2), // Add compare price
            inventory_quantity: 999,
            inventory_management: null,
            inventory_policy: 'continue',
            requires_shipping: true,
            taxable: true
          }
        }),
      });

      if (variantUpdateResponse.ok) {
        console.log('✅ Default variant updated successfully with price:', productPrice);
      } else {
        const variantError = await variantUpdateResponse.text();
        console.error('❌ Failed to update variant pricing:', variantError);
      }
    } catch (variantError) {
      console.error('❌ Error updating variant:', variantError);
    }
  }

  // STEP 2: Upload images to Shopify
  if (product.images && product.images.length > 0) {
    console.log(`🖼️ Uploading ${product.images.length} images to Shopify...`);
    
    for (let i = 0; i < product.images.length; i++) {
      const imageUrl = product.images[i];
      try {
        console.log(`📷 Uploading image ${i + 1}/${product.images.length}: ${imageUrl}`);
        
        // Validate image URL before upload
        if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
          console.error(`❌ Invalid image URL at index ${i}:`, imageUrl);
          continue;
        }
        
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
          const imageData = await imageResponse.json();
          console.log(`✅ Successfully uploaded image ${i + 1} to Shopify:`, imageData.image.id);
        } else {
          const imageError = await imageResponse.text();
          console.error(`❌ Failed to upload image ${i + 1}:`, imageError);
        }
        
        // Rate limiting between image uploads
        if (i < product.images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (imageError) {
        console.error(`❌ Error uploading image ${i + 1}:`, imageError);
      }
    }
  }

  // STEP 3: Create additional product variants (if any)
  if (product.variants && product.variants.length > 1) {
    console.log(`🔄 Creating ${product.variants.length - 1} additional variants...`);
    
    // First, we need to add options to the product
    try {
      const optionPayload = {
        product: {
          id: createdProduct.id,
          options: [
            {
              name: "Style",
              values: product.variants.map(v => v.title)
            }
          ]
        }
      };

      const optionResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/products/${createdProduct.id}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify(optionPayload),
      });

      if (optionResponse.ok) {
        console.log('✅ Product options updated successfully');
        
        // Now update variants with proper option values
        for (let i = 0; i < product.variants.length; i++) {
          const variant = product.variants[i];
          const variantPrice = typeof variant.price === 'number' ? variant.price.toFixed(2) : parseFloat(String(variant.price || productPrice)).toFixed(2);
          
          try {
            let variantResponse;
            
            if (i === 0) {
              // Update the existing default variant
              variantResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/variants/${createdProduct.variants[0].id}.json`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Access-Token': accessToken,
                },
                body: JSON.stringify({
                  variant: {
                    id: createdProduct.variants[0].id,
                    option1: variant.title,
                    price: variantPrice,
                    sku: variant.sku || `VAR-${i + 1}-${Date.now()}`,
                    inventory_quantity: 999,
                    inventory_management: null,
                    inventory_policy: 'continue'
                  }
                }),
              });
            } else {
              // Create new variant
              variantResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/products/${createdProduct.id}/variants.json`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Shopify-Access-Token': accessToken,
                },
                body: JSON.stringify({
                  variant: {
                    product_id: createdProduct.id,
                    option1: variant.title,
                    price: variantPrice,
                    sku: variant.sku || `VAR-${i + 1}-${Date.now()}`,
                    inventory_quantity: 999,
                    inventory_management: null,
                    inventory_policy: 'continue'
                  }
                }),
              });
            }

            if (variantResponse.ok) {
              console.log(`✅ Successfully ${i === 0 ? 'updated' : 'created'} variant: ${variant.title} - ${variantPrice}`);
            } else {
              const variantError = await variantResponse.text();
              console.error(`❌ Failed to ${i === 0 ? 'update' : 'create'} variant ${variant.title}:`, variantError);
            }
            
            // Rate limiting between variant operations
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (variantError) {
            console.error(`❌ Error processing variant ${variant.title}:`, variantError);
          }
        }
      } else {
        const optionError = await optionResponse.text();
        console.error('❌ Failed to update product options:', optionError);
      }
    } catch (error) {
      console.error('❌ Error setting up product variants:', error);
    }
  }

  console.log('✅ Product upload completed successfully:', {
    id: createdProduct.id,
    title: createdProduct.title,
    handle: createdProduct.handle,
    price: productPrice,
    images_uploaded: product.images?.length || 0,
    variants_processed: product.variants?.length || 0
  });

  return new Response(JSON.stringify({
    success: true,
    product: createdProduct,
    message: `Successfully added winning product: ${createdProduct.title}`,
    price_set: productPrice,
    images_uploaded: product.images?.length || 0,
    variants_created: product.variants?.length || 0
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

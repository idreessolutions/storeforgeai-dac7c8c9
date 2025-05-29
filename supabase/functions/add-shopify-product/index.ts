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
    
    console.log('✅ Uploading UNIQUE Winning Product to Shopify:', product.title);
    console.log('🎨 Applying theme color:', themeColor);
    
    const apiUrl = `${shopifyUrl}/admin/api/2024-10/products.json`;
    console.log('Shopify API URL:', apiUrl);

    // Apply theme color to product description with enhanced styling
    const styledDescription = applyThemeColorToDescription(product.description || product.detailed_description, themeColor);

    // Generate unique handle with timestamp to avoid duplicates
    const timestamp = Date.now();
    const uniqueHandle = generateUniqueHandle(product.title, timestamp);

    // Ensure proper pricing - convert to string with 2 decimals (FIXED PRICE ISSUE)
    const productPrice = typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(String(product.price || 29.99)).toFixed(2);
    
    console.log('Setting product price:', productPrice);

    // Extract store name for proper vendor naming
    const storeName = extractStoreNameFromUrl(shopifyUrl);

    // Create the main product WITHOUT variants initially
    const productPayload = {
      product: {
        title: product.title,
        body_html: styledDescription,
        vendor: storeName || 'Premium Store', // FIXED: Use actual store name
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
    console.error('❌ Error adding UNIQUE winning product to Shopify:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to add UNIQUE winning product to Shopify'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleProductEnhancements(createdProduct: any, product: any, shopifyUrl: string, accessToken: string, themeColor: string, productPrice: string) {
  
  // STEP 1: Update the default variant with proper pricing (FIXED PRICING)
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
            price: productPrice, // FIXED: Ensure proper price setting
            compare_at_price: (parseFloat(productPrice) * 1.3).toFixed(2),
            inventory_quantity: 999,
            inventory_management: null,
            inventory_policy: 'continue',
            requires_shipping: true,
            taxable: true,
            title: 'Default'
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

  // STEP 2: Upload DALL·E 3 images to Shopify (FIXED IMAGE UPLOAD)
  if (product.images && product.images.length > 0) {
    console.log(`🖼️ Uploading ${product.images.length} DALL·E 3 images to Shopify...`);
    
    for (let i = 0; i < product.images.length; i++) {
      const imageUrl = product.images[i];
      try {
        console.log(`📷 Uploading DALL·E image ${i + 1}/${product.images.length}: ${imageUrl}`);
        
        // FIXED: Validate image URL before upload
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
          console.log(`✅ Successfully uploaded DALL·E image ${i + 1} to Shopify:`, imageData.image.id);
        } else {
          const imageError = await imageResponse.text();
          console.error(`❌ Failed to upload DALL·E image ${i + 1}:`, imageError);
        }
        
        // Rate limiting between image uploads
        if (i < product.images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (imageError) {
        console.error(`❌ Error uploading DALL·E image ${i + 1}:`, imageError);
      }
    }
  }

  // STEP 3: Create additional product variants (FIXED VARIANT CONFLICTS)
  if (product.variants && product.variants.length > 1) {
    console.log(`🔄 Creating ${product.variants.length - 1} additional variants...`);
    
    try {
      // First, add options to the product
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
        
        // Delete the default variant first to avoid "Default Title" conflicts
        if (createdProduct.variants && createdProduct.variants.length > 0) {
          const defaultVariantId = createdProduct.variants[0].id;
          try {
            await fetch(`${shopifyUrl}/admin/api/2024-10/variants/${defaultVariantId}.json`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
              },
            });
            console.log('✅ Removed default variant to prevent conflicts');
          } catch (deleteError) {
            console.error('❌ Error deleting default variant:', deleteError);
          }
        }
        
        // Now create all variants fresh
        for (let i = 0; i < product.variants.length; i++) {
          const variant = product.variants[i];
          const variantPrice = typeof variant.price === 'number' ? variant.price.toFixed(2) : parseFloat(String(variant.price || productPrice)).toFixed(2);
          
          try {
            const variantResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/products/${createdProduct.id}/variants.json`, {
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
                  inventory_policy: 'continue',
                  requires_shipping: true,
                  taxable: true
                }
              }),
            });

            if (variantResponse.ok) {
              console.log(`✅ Successfully created variant: ${variant.title} - ${variantPrice}`);
            } else {
              const variantError = await variantResponse.text();
              console.error(`❌ Failed to create variant ${variant.title}:`, variantError);
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

  console.log('✅ UNIQUE Product upload completed successfully:', {
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
    message: `Successfully added UNIQUE winning product: ${createdProduct.title}`,
    price_set: productPrice,
    images_uploaded: product.images?.length || 0,
    variants_created: product.variants?.length || 0
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function extractStoreNameFromUrl(shopifyUrl: string): string | null {
  try {
    // Extract store name from URL like "https://storename.myshopify.com"
    const match = shopifyUrl.match(/\/\/([^.]+)\.myshopify\.com/);
    return match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) + ' Store' : null;
  } catch (error) {
    console.error('Error extracting store name:', error);
    return null;
  }
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


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

class ShopifyClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(shopUrl: string, accessToken: string) {
    this.baseUrl = shopUrl.replace(/\/$/, '');
    this.accessToken = accessToken;
  }

  async createProduct(productData: any): Promise<any> {
    console.log('🛒 Creating Shopify product:', productData.product.title);
    
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/products.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Shopify API Error:`, errorText);
      throw new Error(`Failed to create product: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  async getThemes(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/themes.json`, {
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get themes: ${response.status}`);
    }

    return await response.json();
  }

  async getThemeAsset(themeId: string, assetKey: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/themes/${themeId}/assets.json?asset[key]=${assetKey}`, {
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get theme asset: ${response.status}`);
    }

    return await response.json();
  }

  async updateThemeAsset(themeId: string, assetData: any): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/themes/${themeId}/assets.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ asset: assetData })
    });

    return response.ok;
  }
}

// Helper function to create signed URLs for images
async function getSigned(supabase: any, bucket: string, fullPath: string, expires = 7200) {
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(fullPath, expires);
    if (error) {
      console.warn(`⚠️ Failed to create signed URL for ${bucket}/${fullPath}:`, error);
      return null;
    }
    console.log(`✅ Created signed URL for ${bucket}/${fullPath}`);
    return data.signedUrl;
  } catch (error) {
    console.error(`❌ Error creating signed URL:`, error);
    return null;
  }
}

// Get ordered product images from storage
async function getOrderedProductImages(supabase: any, niche: string, productIndex: number) {
  console.log(`🖼️ Getting ordered images for Product ${productIndex + 1} in ${niche}`);
  
  const productImages = [];
  
  // Try to get main product images in order: 1st Product Image.jpg, 2nd Product Image.jpg, etc.
  const productImageName = `${productIndex + 1}st Product Image.jpg`;
  const productImagePath = `Products Images/${productImageName}`;
  
  console.log(`📸 Looking for main product image: ${productImagePath}`);
  const productImageUrl = await getSigned(supabase, niche, productImagePath);
  if (productImageUrl) {
    productImages.push({
      src: productImageUrl,
      alt: `Product ${productIndex + 1} - Main Image`,
      position: 1
    });
    console.log(`✅ Found main product image for Product ${productIndex + 1}`);
  }

  // Try to get additional numbered product images (1st, 2nd, 3rd, etc.)
  for (let imgIndex = 1; imgIndex <= 10; imgIndex++) {
    let imageName;
    if (imgIndex === 1) {
      imageName = `1st Product Image.jpg`;
    } else if (imgIndex === 2) {
      imageName = `2nd Product Image.jpg`;
    } else if (imgIndex === 3) {
      imageName = `3rd Product Image.jpg`;
    } else {
      imageName = `${imgIndex}th Product Image.jpg`;
    }
    
    const imagePath = `Products Images/${imageName}`;
    console.log(`📸 Looking for additional image: ${imagePath}`);
    
    const imageUrl = await getSigned(supabase, niche, imagePath);
    if (imageUrl) {
      productImages.push({
        src: imageUrl,
        alt: `Product ${productIndex + 1} - Image ${imgIndex}`,
        position: productImages.length + 1
      });
      console.log(`✅ Found additional image ${imgIndex} for Product ${productIndex + 1}`);
    }
  }

  console.log(`🎯 Found ${productImages.length} product images for Product ${productIndex + 1}`);
  return productImages;
}

// Get ordered variant images from storage
async function getOrderedVariantImages(supabase: any, niche: string, variantIndex: number) {
  console.log(`🎨 Getting variant images for Variant ${variantIndex + 1} in ${niche}`);
  
  const variantImages = [];
  
  // Try to get variant images in order: 1st Variant Product Image.jpg, 2nd Variant Product Image.jpg, etc.
  for (let imgIndex = 1; imgIndex <= 5; imgIndex++) {
    let imageName;
    if (imgIndex === 1) {
      imageName = `1st Variant Product Image.jpg`;
    } else if (imgIndex === 2) {
      imageName = `2nd Variant Product Image.jpg`;
    } else if (imgIndex === 3) {
      imageName = `3rd Variant Product Image.jpg`;
    } else {
      imageName = `${imgIndex}th Variant Product Image.jpg`;
    }
    
    const imagePath = `Variants Product Images/${imageName}`;
    console.log(`🎨 Looking for variant image: ${imagePath}`);
    
    const imageUrl = await getSigned(supabase, niche, imagePath);
    if (imageUrl) {
      variantImages.push({
        src: imageUrl,
        alt: `Variant ${variantIndex + 1} - Image ${imgIndex}`,
        position: imgIndex
      });
      console.log(`✅ Found variant image ${imgIndex} for Variant ${variantIndex + 1}`);
    }
  }

  console.log(`🎯 Found ${variantImages.length} variant images for Variant ${variantIndex + 1}`);
  return variantImages;
}

// Select products from database with randomization
async function selectProducts(supabase: any, niche: string, limit = 10) {
  console.log(`📦 Selecting ${limit} products for niche: ${niche}`);
  
  const { data, error } = await supabase
    .from("product_data")
    .select("*")
    .eq("niche", niche)
    .eq("is_active", true)
    .order("created_at", { ascending: true }) // Get in order for consistent mapping
    .limit(limit);

  if (error) {
    console.error(`❌ Database error:`, error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.error(`❌ No products found for niche: ${niche}`);
    throw new Error(`No products found for niche: ${niche}. Please check if products exist for this niche.`);
  }

  console.log(`✅ Selected ${data.length} products from database in order`);
  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { niche, shopifyUrl, shopifyAccessToken, themeColor, storeName, limit = 10 } = await req.json();

    console.log('🚀 Starting ORDERED product upload:', {
      niche,
      limit,
      themeColor,
      storeName,
      shopifyUrl: shopifyUrl?.substring(0, 30) + '...',
      source: 'Supabase Database + Ordered Storage'
    });

    if (!shopifyUrl || !shopifyAccessToken) {
      throw new Error('Shopify credentials are required');
    }

    if (!niche) {
      throw new Error('Niche is required');
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize Shopify client
    const shopifyClient = new ShopifyClient(shopifyUrl, shopifyAccessToken);

    // Test Shopify connection first
    try {
      console.log('🔗 Testing Shopify connection...');
      await shopifyClient.getThemes();
      console.log('✅ Shopify connection successful');
    } catch (error) {
      console.error('❌ Shopify connection failed:', error);
      throw new Error(`Shopify connection failed: ${error.message}`);
    }

    // Select products from database in order
    const selectedProducts = await selectProducts(supabase, niche, limit);

    console.log(`📦 Processing ${selectedProducts.length} products from database with ordered images`);

    const results = [];
    let successCount = 0;

    for (let i = 0; i < selectedProducts.length; i++) {
      const dbProduct = selectedProducts[i];
      console.log(`\n📦 Processing Product ${i + 1}/${selectedProducts.length}: ${dbProduct.title}`);

      try {
        // Get ordered product images for this specific product
        const productImages = await getOrderedProductImages(supabase, niche, i);

        console.log(`🖼️ Loaded ${productImages.length} ordered images for Product ${i + 1}: ${dbProduct.title}`);

        // Process variants and their ordered images
        const processedVariants = [];
        let allVariantImages = [];

        if (dbProduct.variants && Array.isArray(dbProduct.variants)) {
          console.log(`🎯 Processing ${dbProduct.variants.length} variants with ordered images`);
          
          for (let vIndex = 0; vIndex < dbProduct.variants.length; vIndex++) {
            const variant = dbProduct.variants[vIndex];
            
            // Get ordered variant images for this specific variant
            const variantImages = await getOrderedVariantImages(supabase, niche, vIndex);
            
            if (variantImages.length > 0) {
              // Add variant images with proper positioning
              const variantImagesWithPosition = variantImages.map((img, imgIndex) => ({
                src: img.src,
                alt: `${dbProduct.title} - Variant ${vIndex + 1} ${variant.optionValues?.join(' ')}`,
                position: productImages.length + allVariantImages.length + imgIndex + 1
              }));
              allVariantImages = [...allVariantImages, ...variantImagesWithPosition];
              console.log(`✅ Added ${variantImages.length} ordered images for Variant ${vIndex + 1}`);
            }

            // Create Shopify variant
            processedVariants.push({
              title: variant.optionValues?.join(' / ') || `Variant ${vIndex + 1}`,
              price: variant.price?.toString() || dbProduct.price.toString(),
              compare_at_price: variant.compareAtPrice?.toString() || dbProduct.compare_at_price?.toString(),
              sku: variant.sku || `${niche.toUpperCase()}-P${i + 1}-V${vIndex + 1}`,
              option1: variant.optionValues?.[0] || `Style ${vIndex + 1}`,
              inventory_quantity: 100,
              inventory_management: 'shopify',
              inventory_policy: 'deny',
              requires_shipping: true,
              taxable: true
            });
          }
        }

        // If no variants in DB, create default variant
        if (processedVariants.length === 0) {
          console.log('📝 Creating default variant');
          processedVariants.push({
            title: 'Default',
            price: dbProduct.price.toString(),
            compare_at_price: dbProduct.compare_at_price?.toString(),
            sku: `${niche.toUpperCase()}-P${i + 1}-DEFAULT`,
            option1: 'Default',
            inventory_quantity: 100,
            inventory_management: 'shopify',
            inventory_policy: 'deny',
            requires_shipping: true,
            taxable: true
          });
        }

        // Combine all images in proper order (product images first, then variant images)
        const allImages = [...productImages, ...allVariantImages];

        console.log(`🎨 Total ordered images for Product ${i + 1}: ${allImages.length} (${productImages.length} product + ${allVariantImages.length} variant)`);

        // Prepare tags with theme color
        const productTags = [
          ...(dbProduct.tags || []),
          niche.replace('_', ' '),
          'database-driven',
          'premium',
          `product-${i + 1}`
        ];
        
        if (themeColor) {
          productTags.push(`theme-${themeColor.replace('#', '')}`);
        }

        // Create Shopify product payload
        const shopifyProduct = {
          product: {
            title: `${dbProduct.title} - Product ${i + 1}`,
            body_html: dbProduct.description_md,
            vendor: storeName || 'Premium Store',
            product_type: niche.replace('_', ' '),
            tags: productTags.join(', '),
            status: 'draft',
            published: false,
            options: dbProduct.options || [
              {
                name: 'Style',
                position: 1,
                values: processedVariants.map(v => v.option1)
              }
            ],
            variants: processedVariants,
            images: allImages
          }
        };

        console.log(`🛒 Uploading to Shopify: Product ${i + 1} - ${dbProduct.title}`);
        console.log(`📊 Product details: ${processedVariants.length} variants, ${allImages.length} ordered images`);

        // Upload to Shopify
        const productResponse = await shopifyClient.createProduct(shopifyProduct);
        const createdProduct = productResponse.product;

        successCount++;
        results.push({
          productIndex: i + 1,
          productFolder: dbProduct.product_folder,
          success: true,
          productId: createdProduct.id,
          title: dbProduct.title,
          shopifyUrl: `${shopifyUrl}/admin/products/${createdProduct.id}`,
          imagesUploaded: allImages.length,
          productImages: productImages.length,
          variantImages: allVariantImages.length,
          variantsCreated: createdProduct.variants.length,
          source: 'ordered-database'
        });

        console.log(`✅ Successfully created Product ${i + 1}: ${dbProduct.title} (ID: ${createdProduct.id})`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error processing Product ${i + 1} (${dbProduct.product_folder}):`, error);
        results.push({
          productIndex: i + 1,
          productFolder: dbProduct.product_folder,
          success: false,
          error: error.message,
          title: dbProduct.title
        });
      }
    }

    // Apply theme color to Refresh theme
    if (themeColor && successCount > 0) {
      try {
        console.log(`🎨 Applying theme color ${themeColor}...`);
        
        const themesResponse = await shopifyClient.getThemes();
        const refreshTheme = themesResponse.themes.find((theme: any) => 
          theme.name === 'Refresh' || theme.role === 'main'
        );

        if (refreshTheme) {
          console.log(`🎯 Found theme: ${refreshTheme.name}`);
          const settingsResponse = await shopifyClient.getThemeAsset(refreshTheme.id, 'config/settings_data.json');
          
          if (settingsResponse.asset) {
            const settings = JSON.parse(settingsResponse.asset.value);
            
            if (!settings.current) settings.current = {};
            
            const colorKeys = [
              'colors_accent_1',
              'colors_accent_2', 
              'color_accent',
              'color_primary',
              'colors_button_background'
            ];

            colorKeys.forEach(key => {
              if (settings.current[key] !== undefined) {
                settings.current[key] = themeColor;
              }
            });

            await shopifyClient.updateThemeAsset(refreshTheme.id, {
              key: 'config/settings_data.json',
              value: JSON.stringify(settings)
            });

            console.log(`✅ Theme color applied successfully`);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to apply theme color:`, error);
      }
    }

    console.log(`\n🎉 ORDERED upload complete: ${successCount}/${results.length} products successful`);

    return new Response(JSON.stringify({
      success: true,
      uploadedCount: successCount,
      totalProcessed: results.length,
      results,
      niche,
      source: 'Supabase Database + Ordered Storage',
      orderedImages: true,
      message: `Successfully uploaded ${successCount} products with ordered images from your storage buckets${themeColor ? ' with theme color applied' : ''}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Ordered product upload failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Upload failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

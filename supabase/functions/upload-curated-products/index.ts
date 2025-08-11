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

// Get ordered product images from storage for specific product number
async function getOrderedProductImages(supabase: any, niche: string, productNumber: number) {
  console.log(`🖼️ Getting ordered images for Product ${productNumber} in ${niche}`);
  
  const productImages = [];
  
  // Get main product image for this specific product number
  const productImageName = `${productNumber}${getOrdinalSuffix(productNumber)} Product Image.jpg`;
  const productImagePath = `Products Images/${productImageName}`;
  
  console.log(`📸 Looking for main product image: ${productImagePath}`);
  const productImageUrl = await getSigned(supabase, niche, productImagePath);
  if (productImageUrl) {
    productImages.push({
      src: productImageUrl,
      alt: `Product ${productNumber} - Main Image`,
      position: 1
    });
    console.log(`✅ Found main product image for Product ${productNumber}`);
  }

  console.log(`🎯 Found ${productImages.length} product images for Product ${productNumber}`);
  return productImages;
}

// Get ordered variant images from storage for specific variant number
async function getOrderedVariantImages(supabase: any, niche: string, variantNumber: number) {
  console.log(`🎨 Getting variant images for Variant ${variantNumber} in ${niche}`);
  
  const variantImages = [];
  
  // Get variant image for this specific variant number
  const variantImageName = `${variantNumber}${getOrdinalSuffix(variantNumber)} Variant Product Image.jpg`;
  const variantImagePath = `Variants Product Images/${variantImageName}`;
  
  console.log(`🎨 Looking for variant image: ${variantImagePath}`);
  const imageUrl = await getSigned(supabase, niche, variantImagePath);
  if (imageUrl) {
    variantImages.push({
      src: imageUrl,
      alt: `Variant ${variantNumber} - Main Image`,
      position: 1
    });
    console.log(`✅ Found variant image for Variant ${variantNumber}`);
  }

  console.log(`🎯 Found ${variantImages.length} variant images for Variant ${variantNumber}`);
  return variantImages;
}

// Helper function to get ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
}

// Select products from database or create multiple variations if only one exists
async function selectProducts(supabase: any, niche: string, limit = 10) {
  console.log(`📦 Selecting ${limit} products for niche: ${niche}`);
  
  const { data, error } = await supabase
    .from("product_data")
    .select("*")
    .eq("niche", niche)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(`❌ Database error:`, error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.error(`❌ No products found for niche: ${niche}`);
    throw new Error(`No products found for niche: ${niche}. Please check if products exist for this niche.`);
  }

  console.log(`✅ Found ${data.length} base products in database`);

  // If we have fewer products than needed, create variations of existing products
  const products = [];
  for (let i = 0; i < limit; i++) {
    const baseProduct = data[i % data.length]; // Cycle through available products
    const productNumber = i + 1;
    
    // Create a variation with unique title and adjusted pricing
    const product = {
      ...baseProduct,
      title: `${baseProduct.title} - Product ${productNumber}`,
      price: baseProduct.price + (Math.random() * 10 - 5), // Slight price variation
      product_number: productNumber
    };
    
    products.push(product);
  }

  console.log(`✅ Created ${products.length} products for upload`);
  return products;
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

    // Select products from database (will create variations if needed)
    const selectedProducts = await selectProducts(supabase, niche, limit);

    console.log(`📦 Processing ${selectedProducts.length} products from database with ordered images`);

    const results = [];
    let successCount = 0;

    for (let i = 0; i < selectedProducts.length; i++) {
      const dbProduct = selectedProducts[i];
      const productNumber = i + 1;
      console.log(`\n📦 Processing Product ${productNumber}/${selectedProducts.length}: ${dbProduct.title}`);

      try {
        // Get ordered product images for this specific product number
        const productImages = await getOrderedProductImages(supabase, niche, productNumber);

        console.log(`🖼️ Loaded ${productImages.length} ordered images for Product ${productNumber}: ${dbProduct.title}`);

        // Process variants and their ordered images
        const processedVariants = [];
        let allVariantImages = [];

        if (dbProduct.variants && Array.isArray(dbProduct.variants)) {
          console.log(`🎯 Processing ${dbProduct.variants.length} variants with ordered images`);
          
          for (let vIndex = 0; vIndex < dbProduct.variants.length; vIndex++) {
            const variant = dbProduct.variants[vIndex];
            const variantNumber = vIndex + 1;
            
            // Get ordered variant images for this specific variant number
            const variantImages = await getOrderedVariantImages(supabase, niche, variantNumber);
            
            if (variantImages.length > 0) {
              // Add variant images with proper positioning
              const variantImagesWithPosition = variantImages.map((img, imgIndex) => ({
                src: img.src,
                alt: `${dbProduct.title} - Variant ${variantNumber} ${variant.optionValues?.join(' ')}`,
                position: productImages.length + allVariantImages.length + imgIndex + 1
              }));
              allVariantImages = [...allVariantImages, ...variantImagesWithPosition];
              console.log(`✅ Added ${variantImages.length} ordered images for Variant ${variantNumber}`);
            }

            // Create Shopify variant
            processedVariants.push({
              title: variant.optionValues?.join(' / ') || `Variant ${variantNumber}`,
              price: variant.price?.toString() || dbProduct.price.toString(),
              compare_at_price: variant.compareAtPrice?.toString() || dbProduct.compare_at_price?.toString(),
              sku: `${niche.toUpperCase()}-P${productNumber}-V${variantNumber}`,
              option1: variant.optionValues?.[0] || `Style ${variantNumber}`,
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
            sku: `${niche.toUpperCase()}-P${productNumber}-DEFAULT`,
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

        console.log(`🎨 Total ordered images for Product ${productNumber}: ${allImages.length} (${productImages.length} product + ${allVariantImages.length} variant)`);

        // Prepare tags with theme color
        const productTags = [
          ...(dbProduct.tags || []),
          niche.replace('_', ' '),
          'database-driven',
          'premium',
          `product-${productNumber}`
        ];
        
        if (themeColor) {
          productTags.push(`theme-${themeColor.replace('#', '')}`);
        }

        // Create Shopify product payload - SET TO ACTIVE STATUS
        const shopifyProduct = {
          product: {
            title: dbProduct.title,
            body_html: dbProduct.description_md,
            vendor: storeName || 'Premium Store',
            product_type: niche.replace('_', ' '),
            tags: productTags.join(', '),
            status: 'active', // ✅ CHANGED: Set to active instead of draft
            published: true,  // ✅ CHANGED: Set to published instead of false
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

        console.log(`🛒 Uploading to Shopify: Product ${productNumber} - ${dbProduct.title}`);
        console.log(`📊 Product details: ${processedVariants.length} variants, ${allImages.length} ordered images, STATUS: ACTIVE`);

        // Upload to Shopify
        const productResponse = await shopifyClient.createProduct(shopifyProduct);
        const createdProduct = productResponse.product;

        successCount++;
        results.push({
          productIndex: productNumber,
          productFolder: dbProduct.product_folder,
          success: true,
          productId: createdProduct.id,
          title: dbProduct.title,
          shopifyUrl: `${shopifyUrl}/admin/products/${createdProduct.id}`,
          imagesUploaded: allImages.length,
          productImages: productImages.length,
          variantImages: allVariantImages.length,
          variantsCreated: createdProduct.variants.length,
          status: 'active',
          source: 'ordered-database'
        });

        console.log(`✅ Successfully created Product ${productNumber}: ${dbProduct.title} (ID: ${createdProduct.id}) - STATUS: ACTIVE`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error processing Product ${productNumber} (${dbProduct.product_folder}):`, error);
        results.push({
          productIndex: productNumber,
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

    console.log(`\n🎉 ORDERED upload complete: ${successCount}/${results.length} products successful - ALL SET TO ACTIVE STATUS`);

    return new Response(JSON.stringify({
      success: true,
      uploadedCount: successCount,
      totalProcessed: results.length,
      results,
      niche,
      source: 'Supabase Database + Ordered Storage',
      orderedImages: true,
      status: 'All products set to ACTIVE',
      message: `Successfully uploaded ${successCount} ACTIVE products with ordered images from your storage buckets${themeColor ? ' with theme color applied' : ''}`
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

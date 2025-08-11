
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

// Select products from database with randomization
async function selectProducts(supabase: any, niche: string, limit = 10) {
  console.log(`📦 Selecting ${limit} products for niche: ${niche}`);
  
  const { data, error } = await supabase
    .from("product_data")
    .select("*")
    .eq("niche", niche)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(30); // Fetch more for randomization

  if (error) {
    console.error(`❌ Database error:`, error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.error(`❌ No products found for niche: ${niche}`);
    console.log(`🔍 Available niches in database:`);
    
    // Let's check what niches are actually available
    const { data: availableNiches } = await supabase
      .from("product_data")
      .select("niche")
      .eq("is_active", true);
    
    if (availableNiches) {
      const uniqueNiches = [...new Set(availableNiches.map(p => p.niche))];
      console.log(`📋 Found niches:`, uniqueNiches);
    }
    
    throw new Error(`No products found for niche: ${niche}. Please check if products exist for this niche.`);
  }

  // Shuffle array for randomization
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [data[i], data[j]] = [data[j], data[i]];
  }

  const selectedProducts = data.slice(0, Math.min(limit, data.length));
  console.log(`✅ Selected ${selectedProducts.length} products from database`);
  
  return selectedProducts;
}

// Build image URLs from storage paths
async function buildImages(supabase: any, niche: string, folder: string, paths: string[]) {
  console.log(`🖼️ Building images for ${niche}/${folder} with ${paths.length} paths`);
  const signedUrls = [];
  
  for (const path of paths) {
    const fullPath = `${folder}/${path}`;
    console.log(`📸 Processing image path: ${fullPath}`);
    const signedUrl = await getSigned(supabase, niche, fullPath);
    if (signedUrl) {
      signedUrls.push(signedUrl);
      console.log(`✅ Added signed URL for ${path}`);
    } else {
      console.warn(`⚠️ Skipped missing image: ${fullPath}`);
    }
  }
  
  console.log(`🎯 Built ${signedUrls.length}/${paths.length} image URLs`);
  return signedUrls;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { niche, shopifyUrl, shopifyAccessToken, themeColor, storeName, limit = 10 } = await req.json();

    console.log('🚀 Starting DATABASE-DRIVEN product upload:', {
      niche,
      limit,
      themeColor,
      storeName,
      shopifyUrl: shopifyUrl?.substring(0, 30) + '...',
      source: 'Supabase Database + Storage'
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

    // Select products from database
    const selectedProducts = await selectProducts(supabase, niche, limit);

    console.log(`📦 Processing ${selectedProducts.length} products from database`);

    const results = [];
    let successCount = 0;

    for (let i = 0; i < selectedProducts.length; i++) {
      const dbProduct = selectedProducts[i];
      console.log(`\n📦 Processing product ${i + 1}/${selectedProducts.length}: ${dbProduct.title}`);

      try {
        // Build main images from storage
        const mainImageUrls = await buildImages(
          supabase, 
          niche, 
          dbProduct.product_folder, 
          dbProduct.main_images || []
        );

        console.log(`🖼️ Loaded ${mainImageUrls.length} main images for ${dbProduct.title}`);

        // Process variants and their images
        const processedVariants = [];
        const variantImageUrls = [];

        if (dbProduct.variants && Array.isArray(dbProduct.variants)) {
          console.log(`🎯 Processing ${dbProduct.variants.length} variants`);
          
          for (const variant of dbProduct.variants) {
            // Get variant image if specified
            let variantImageUrl = null;
            if (variant.image) {
              const fullPath = `${dbProduct.product_folder}/${variant.image}`;
              console.log(`🖼️ Getting variant image: ${fullPath}`);
              variantImageUrl = await getSigned(supabase, niche, fullPath);
              if (variantImageUrl) {
                variantImageUrls.push({
                  src: variantImageUrl,
                  alt: `${dbProduct.title} - ${variant.optionValues?.join(' ')}`
                });
                console.log(`✅ Added variant image for ${variant.optionValues?.join(' ')}`);
              }
            }

            // Create Shopify variant
            processedVariants.push({
              title: variant.optionValues?.join(' / ') || `Variant ${processedVariants.length + 1}`,
              price: variant.price?.toString() || dbProduct.price.toString(),
              compare_at_price: variant.compareAtPrice?.toString() || dbProduct.compare_at_price?.toString(),
              sku: variant.sku || `${niche.toUpperCase()}-${i + 1}-${processedVariants.length + 1}`,
              option1: variant.optionValues?.[0] || 'Default',
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
            sku: `${niche.toUpperCase()}-${i + 1}-DEFAULT`,
            option1: 'Default',
            inventory_quantity: 100,
            inventory_management: 'shopify',
            inventory_policy: 'deny',
            requires_shipping: true,
            taxable: true
          });
        }

        // Combine all images (main + variant)
        const allImages = [
          ...mainImageUrls.map((url, index) => ({
            src: url,
            alt: `${dbProduct.title} - Image ${index + 1}`,
            position: index + 1
          })),
          ...variantImageUrls.map((img, index) => ({
            src: img.src,
            alt: img.alt,
            position: mainImageUrls.length + index + 1
          }))
        ];

        console.log(`🎨 Total images for product: ${allImages.length}`);

        // Prepare tags with theme color
        const productTags = [
          ...(dbProduct.tags || []),
          niche.replace('_', ' '),
          'database-driven',
          'premium'
        ];
        
        if (themeColor) {
          productTags.push(`theme-${themeColor.replace('#', '')}`);
        }

        // Create Shopify product payload
        const shopifyProduct = {
          product: {
            title: dbProduct.title,
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
                values: ['Default']
              }
            ],
            variants: processedVariants,
            images: allImages
          }
        };

        console.log(`🛒 Uploading to Shopify: ${dbProduct.title}`);
        console.log(`📊 Product details: ${processedVariants.length} variants, ${allImages.length} images`);

        // Upload to Shopify
        const productResponse = await shopifyClient.createProduct(shopifyProduct);
        const createdProduct = productResponse.product;

        successCount++;
        results.push({
          productFolder: dbProduct.product_folder,
          success: true,
          productId: createdProduct.id,
          title: dbProduct.title,
          shopifyUrl: `${shopifyUrl}/admin/products/${createdProduct.id}`,
          imagesUploaded: allImages.length,
          variantsCreated: createdProduct.variants.length,
          source: 'database'
        });

        console.log(`✅ Successfully created from database: ${dbProduct.title} (ID: ${createdProduct.id})`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error processing ${dbProduct.product_folder}:`, error);
        results.push({
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

    console.log(`\n🎉 DATABASE-DRIVEN upload complete: ${successCount}/${results.length} products successful`);

    return new Response(JSON.stringify({
      success: true,
      uploadedCount: successCount,
      totalProcessed: results.length,
      results,
      niche,
      source: 'Supabase Database + Storage',
      databaseDriven: true,
      message: `Successfully uploaded ${successCount} products from your database and storage buckets${themeColor ? ' with theme color applied' : ''}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Database-driven product upload failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Upload failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

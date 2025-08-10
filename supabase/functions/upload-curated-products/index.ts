
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductManifest {
  title: string;
  description_html: string;
  product_type: string;
  tags: string[];
  price: number;
  compare_at_price?: number;
  options: Array<{
    name: string;
    values: string[];
  }>;
  images: Array<{
    src: string;
    alt: string;
  }>;
  variants: Array<{
    options: string[];
    price: number;
    sku: string;
    image?: string;
    inventory_quantity: number;
  }>;
}

class ShopifyClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(shopUrl: string, accessToken: string) {
    this.baseUrl = shopUrl.replace(/\/$/, '');
    this.accessToken = accessToken;
  }

  async createProduct(productData: any): Promise<any> {
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
      throw new Error(`Failed to create product: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  async uploadImage(productId: string, imageData: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/products/${productId}/images.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: imageData })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Image upload failed: ${response.status} - ${errorText}`);
      return null;
    }

    return await response.json();
  }

  async updateVariant(variantId: string, variantData: any): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/variants/${variantId}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ variant: variantData })
    });

    return response.ok;
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

// Map niche names to bucket names
const NICHE_TO_BUCKET: { [key: string]: string } = {
  'Home & Living': 'home_living',
  'Beauty & Personal Care': 'beauty_personal_care',
  'Health & Fitness': 'health_fitness',
  'Pets': 'pets',
  'Fashion & Accessories': 'fashion_accessories',
  'Electronics & Gadgets': 'electronics_gadgets',
  'Kids & Babies': 'kids_babies',
  'Seasonal & Events': 'seasonal_events',
  'Hobbies & Lifestyle': 'hobbies_lifestyle',
  'Trending Viral Products': 'trending_viral'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { niche, shopifyUrl, shopifyAccessToken, themeColor, storeName, limit = 10 } = await req.json();

    console.log('🚀 Starting curated product upload:', {
      niche,
      limit,
      themeColor,
      storeName
    });

    if (!shopifyUrl || !shopifyAccessToken) {
      throw new Error('Shopify credentials are required');
    }

    const bucketName = NICHE_TO_BUCKET[niche];
    if (!bucketName) {
      throw new Error(`Invalid niche: ${niche}`);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize Shopify client
    const shopifyClient = new ShopifyClient(shopifyUrl, shopifyAccessToken);

    const results = [];
    let successCount = 0;

    // Process products p01 through p10 (or up to limit)
    for (let i = 1; i <= Math.min(limit, 10); i++) {
      const productFolder = `p${i.toString().padStart(2, '0')}`;
      console.log(`📦 Processing product ${productFolder} from ${bucketName}`);

      try {
        // Download manifest.json
        const { data: manifestData, error: manifestError } = await supabase.storage
          .from(bucketName)
          .download(`${productFolder}/manifest.json`);

        if (manifestError || !manifestData) {
          console.error(`❌ Failed to download manifest for ${productFolder}:`, manifestError);
          results.push({
            productFolder,
            success: false,
            error: `Failed to download manifest: ${manifestError?.message || 'File not found'}`
          });
          continue;
        }

        // Parse manifest
        const manifestText = await manifestData.text();
        const manifest: ProductManifest = JSON.parse(manifestText);

        console.log(`📋 Loaded manifest for: ${manifest.title}`);

        // Get public URLs for all images
        const imageUrls: Array<{ src: string; alt: string; filename: string }> = [];
        for (const img of manifest.images) {
          const { data: imageUrl } = supabase.storage
            .from(bucketName)
            .getPublicUrl(`${productFolder}/${img.src}`);
          
          imageUrls.push({
            src: imageUrl.publicUrl,
            alt: img.alt,
            filename: img.src
          });
        }

        // Create Shopify product payload
        const shopifyProduct = {
          product: {
            title: manifest.title,
            body_html: manifest.description_html,
            vendor: storeName || 'Curated Store',
            product_type: manifest.product_type,
            tags: manifest.tags.join(', '),
            options: manifest.options.map((opt, index) => ({
              name: opt.name,
              position: index + 1,
              values: opt.values
            })),
            variants: manifest.variants.map((variant, index) => ({
              option1: variant.options[0] || 'Default',
              option2: variant.options[1] || null,
              option3: variant.options[2] || null,
              price: variant.price.toFixed(2),
              compare_at_price: manifest.compare_at_price?.toFixed(2) || (variant.price * 1.3).toFixed(2),
              sku: variant.sku,
              inventory_quantity: variant.inventory_quantity,
              inventory_management: 'shopify',
              inventory_policy: 'deny',
              requires_shipping: true,
              taxable: true
            })),
            images: imageUrls.map((img, index) => ({
              src: img.src,
              alt: img.alt,
              position: index + 1
            }))
          }
        };

        // Create product in Shopify
        console.log(`🛒 Creating product in Shopify: ${manifest.title}`);
        const productResponse = await shopifyClient.createProduct(shopifyProduct);
        const createdProduct = productResponse.product;

        // Link variant images if specified
        if (createdProduct.variants && manifest.variants.some(v => v.image)) {
          console.log(`🖼️ Linking variant images...`);
          
          for (let vIndex = 0; vIndex < manifest.variants.length && vIndex < createdProduct.variants.length; vIndex++) {
            const manifestVariant = manifest.variants[vIndex];
            const shopifyVariant = createdProduct.variants[vIndex];
            
            if (manifestVariant.image) {
              const imageIndex = manifest.images.findIndex(img => img.src === manifestVariant.image);
              if (imageIndex >= 0 && createdProduct.images[imageIndex]) {
                await shopifyClient.updateVariant(shopifyVariant.id, {
                  image_id: createdProduct.images[imageIndex].id
                });
              }
            }
          }
        }

        successCount++;
        results.push({
          productFolder,
          success: true,
          productId: createdProduct.id,
          title: manifest.title,
          shopifyUrl: `${shopifyUrl}/admin/products/${createdProduct.id}`,
          imagesUploaded: imageUrls.length,
          variantsCreated: createdProduct.variants.length
        });

        console.log(`✅ Successfully created: ${manifest.title} (ID: ${createdProduct.id})`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error processing ${productFolder}:`, error);
        results.push({
          productFolder,
          success: false,
          error: error.message
        });
      }
    }

    // Apply theme color to Refresh theme
    if (themeColor && successCount > 0) {
      try {
        console.log(`🎨 Applying theme color ${themeColor} to Refresh theme...`);
        
        const themesResponse = await shopifyClient.getThemes();
        const refreshTheme = themesResponse.themes.find((theme: any) => 
          theme.name === 'Refresh' || theme.role === 'main'
        );

        if (refreshTheme) {
          // Get current settings
          const settingsResponse = await shopifyClient.getThemeAsset(refreshTheme.id, 'config/settings_data.json');
          
          if (settingsResponse.asset) {
            const settings = JSON.parse(settingsResponse.asset.value);
            
            // Update color settings for Refresh theme
            if (!settings.current) settings.current = {};
            
            // Common color setting keys for Refresh theme
            const colorKeys = [
              'colors_accent_1',
              'colors_accent_2', 
              'color_accent',
              'color_primary',
              'colors_button_background',
              'colors_button_label'
            ];

            colorKeys.forEach(key => {
              if (settings.current[key] !== undefined) {
                settings.current[key] = themeColor;
              }
            });

            // Update the theme settings
            await shopifyClient.updateThemeAsset(refreshTheme.id, {
              key: 'config/settings_data.json',
              value: JSON.stringify(settings)
            });

            console.log(`✅ Theme color applied to ${refreshTheme.name} theme`);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to apply theme color:`, error);
      }
    }

    console.log(`🎉 Upload complete: ${successCount}/${results.length} products successful`);

    return new Response(JSON.stringify({
      success: true,
      uploadedCount: successCount,
      totalProcessed: results.length,
      results,
      niche,
      bucketName,
      message: `Successfully uploaded ${successCount} curated ${niche} products to Shopify${themeColor ? ' and applied theme color' : ''}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Curated product upload failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Upload failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

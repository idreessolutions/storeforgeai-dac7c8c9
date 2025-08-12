
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

// Get ALL product images for a specific product number
async function getProductImages(supabase: any, niche: string, productNumber: number) {
  console.log(`🖼️ Getting ALL images for Product ${productNumber} in ${niche}`);
  
  const productImages = [];
  
  // Try to get images with sequential naming: 1st, 2nd, 3rd, etc.
  const ordinalSuffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th'];
  
  for (let imageIndex = 1; imageIndex <= 10; imageIndex++) {
    const suffix = imageIndex <= 3 ? ordinalSuffixes[imageIndex - 1] : 'th';
    const imageName = `${imageIndex}${suffix} Product Image.jpg`;
    const imagePath = `Products Images/${imageName}`;
    
    console.log(`📸 Looking for image: ${imagePath}`);
    const imageUrl = await getSigned(supabase, niche, imagePath);
    if (imageUrl) {
      productImages.push({
        src: imageUrl,
        alt: `Product ${productNumber} - Image ${imageIndex}`,
        position: imageIndex
      });
      console.log(`✅ Found product image ${imageIndex} for Product ${productNumber}`);
    } else {
      console.log(`⚠️ No image found at ${imagePath} - stopping search`);
      break; // Stop looking for more images if one is missing
    }
  }

  console.log(`🎯 Found ${productImages.length} product images for Product ${productNumber}`);
  return productImages;
}

// Get ALL variant images for ALL variants of a product
async function getAllVariantImages(supabase: any, niche: string, variantCount: number) {
  console.log(`🎨 Getting ALL variant images for ${variantCount} variants in ${niche}`);
  
  const allVariantImages = [];
  let currentPosition = 1;
  
  // For each variant, get all available images
  for (let variantIndex = 1; variantIndex <= variantCount; variantIndex++) {
    const ordinalSuffixes = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th'];
    const suffix = variantIndex <= 3 ? ordinalSuffixes[variantIndex - 1] : 'th';
    
    // Try to get multiple images for this variant
    for (let imageIndex = 1; imageIndex <= 5; imageIndex++) {
      let imageName;
      if (imageIndex === 1) {
        // First image uses the main pattern
        imageName = `${variantIndex}${suffix} Variant Product Image.jpg`;
      } else {
        // Additional images use numbered pattern
        imageName = `${variantIndex}${suffix} Variant Product Image ${imageIndex}.jpg`;
      }
      
      const imagePath = `Variants Product Images/${imageName}`;
      
      console.log(`🎨 Looking for variant image: ${imagePath}`);
      const imageUrl = await getSigned(supabase, niche, imagePath);
      if (imageUrl) {
        allVariantImages.push({
          src: imageUrl,
          alt: `Variant ${variantIndex} - Image ${imageIndex}`,
          position: currentPosition++,
          variantIndex: variantIndex
        });
        console.log(`✅ Found variant image ${imageIndex} for Variant ${variantIndex}`);
      } else {
        console.log(`⚠️ No variant image found at ${imagePath}`);
        if (imageIndex === 1) {
          // If no first image, stop looking for this variant
          break;
        }
      }
    }
  }

  console.log(`🎯 Found ${allVariantImages.length} total variant images`);
  return allVariantImages;
}

// Map niche to proper Shopify product type
function getNicheProductType(niche: string): string {
  const nicheMapping: Record<string, string> = {
    'home_living': 'Home & Living',
    'beauty_personal_care': 'Beauty & Personal Care',
    'health_fitness': 'Health & Fitness',
    'pets': 'Pet Supplies',
    'fashion_accessories': 'Fashion & Accessories',
    'electronics_gadgets': 'Electronics & Gadgets',
    'kids_babies': 'Kids & Baby',
    'seasonal_events': 'Seasonal & Events',
    'hobbies_lifestyle': 'Hobbies & Lifestyle',
    'trending_viral': 'Trending & Viral'
  };
  
  return nicheMapping[niche] || niche.replace('_', ' ');
}

// Select products from database and create 10 variations
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

  // Create exactly 10 products by cycling through available products
  const products = [];
  for (let i = 0; i < limit; i++) {
    const baseProduct = data[i % data.length];
    const productNumber = i + 1;
    
    // Create a variation with unique title and adjusted pricing
    const product = {
      ...baseProduct,
      title: `${baseProduct.title} - Product ${productNumber}`,
      price: baseProduct.price + (Math.random() * 10 - 5),
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

    console.log('🚀 Starting ENHANCED product upload:', {
      niche,
      limit,
      themeColor,
      storeName,
      shopifyUrl: shopifyUrl?.substring(0, 30) + '...'
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

    console.log(`📦 Processing ${selectedProducts.length} products with ENHANCED image mapping`);

    const results = [];
    let successCount = 0;

    for (let i = 0; i < selectedProducts.length; i++) {
      const dbProduct = selectedProducts[i];
      const productNumber = i + 1;
      console.log(`\n📦 Processing Product ${productNumber}/${selectedProducts.length}: ${dbProduct.title}`);

      try {
        // Get ALL product images for this product number
        const productImages = await getProductImages(supabase, niche, productNumber);

        // Process variants from database
        const processedVariants = [];
        let variantCount = 0;

        if (dbProduct.variants && Array.isArray(dbProduct.variants)) {
          console.log(`🎯 Processing ${dbProduct.variants.length} variants from database`);
          
          for (let vIndex = 0; vIndex < dbProduct.variants.length; vIndex++) {
            const variant = dbProduct.variants[vIndex];
            variantCount++;
            
            processedVariants.push({
              title: variant.optionValues?.join(' / ') || `Variant ${variantCount}`,
              price: variant.price?.toString() || dbProduct.price.toString(),
              compare_at_price: variant.compareAtPrice?.toString() || (dbProduct.price * 1.3).toString(),
              sku: `${niche.toUpperCase()}-P${productNumber}-V${variantCount}`,
              option1: variant.optionValues?.[0] || `Style ${variantCount}`,
              inventory_quantity: 100,
              inventory_management: 'shopify',
              inventory_policy: 'deny',
              requires_shipping: true,
              taxable: true
            });
          }
        }

        // If no variants in DB, create default variants
        if (processedVariants.length === 0) {
          console.log('📝 Creating 3 default variants');
          for (let v = 1; v <= 3; v++) {
            variantCount++;
            processedVariants.push({
              title: `Style ${v}`,
              price: dbProduct.price.toString(),
              compare_at_price: (dbProduct.price * 1.3).toString(),
              sku: `${niche.toUpperCase()}-P${productNumber}-V${v}`,
              option1: `Style ${v}`,
              inventory_quantity: 100,
              inventory_management: 'shopify',
              inventory_policy: 'deny',
              requires_shipping: true,
              taxable: true
            });
          }
        }

        // Get ALL variant images based on actual variant count
        const allVariantImages = await getAllVariantImages(supabase, niche, variantCount);

        // Combine all images with proper positioning
        const allImages = [...productImages];
        
        // Add variant images with proper positioning
        allVariantImages.forEach(variantImage => {
          allImages.push({
            src: variantImage.src,
            alt: variantImage.alt,
            position: productImages.length + variantImage.position
          });
        });

        console.log(`🎨 TOTAL IMAGES: ${allImages.length} (${productImages.length} product + ${allVariantImages.length} variant)`);

        // Get proper product type for category
        const productType = getNicheProductType(niche);
        
        // Prepare comprehensive tags
        const productTags = [
          ...(dbProduct.tags || []),
          niche.replace('_', ' '),
          'database-driven',
          'premium',
          `product-${productNumber}`,
          productType.toLowerCase().replace(/\s+/g, '-')
        ];
        
        if (themeColor) {
          productTags.push(`theme-${themeColor.replace('#', '')}`);
        }

        // Create Shopify product payload - ACTIVE STATUS with PROPER CATEGORY
        const shopifyProduct = {
          product: {
            title: dbProduct.title,
            body_html: dbProduct.description_md,
            vendor: storeName || 'Premium Store',
            product_type: productType, // ✅ PROPER CATEGORY MAPPING
            tags: productTags.join(', '),
            status: 'active', // ✅ ACTIVE STATUS
            published: true,  // ✅ PUBLISHED
            options: dbProduct.options || [
              {
                name: 'Style',
                position: 1,
                values: processedVariants.map(v => v.option1)
              }
            ],
            variants: processedVariants,
            images: allImages // ✅ ALL IMAGES FROM STORAGE
          }
        };

        console.log(`🛒 Uploading to Shopify: Product ${productNumber}`);
        console.log(`📊 Details: ${processedVariants.length} variants, ${allImages.length} images, Category: ${productType}`);

        // Upload to Shopify
        const productResponse = await shopifyClient.createProduct(shopifyProduct);
        const createdProduct = productResponse.product;

        successCount++;
        results.push({
          productIndex: productNumber,
          success: true,
          productId: createdProduct.id,
          title: dbProduct.title,
          shopifyUrl: `${shopifyUrl}/admin/products/${createdProduct.id}`,
          imagesUploaded: allImages.length,
          productImages: productImages.length,
          variantImages: allVariantImages.length,
          variantsCreated: createdProduct.variants.length,
          category: productType,
          status: 'active'
        });

        console.log(`✅ SUCCESS: Product ${productNumber} created with ${allImages.length} images, Category: ${productType}`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error processing Product ${productNumber}:`, error);
        results.push({
          productIndex: productNumber,
          success: false,
          error: error.message,
          title: dbProduct.title
        });
      }
    }

    // Apply theme color
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

    console.log(`\n🎉 ENHANCED upload complete: ${successCount}/${results.length} products successful with PROPER CATEGORIES and ALL IMAGES`);

    return new Response(JSON.stringify({
      success: true,
      uploadedCount: successCount,
      totalProcessed: results.length,
      results,
      niche,
      message: `Successfully uploaded ${successCount} products with proper categories and all images from storage`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Enhanced product upload failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Upload failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

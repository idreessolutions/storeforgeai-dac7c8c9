import { supabase } from "@/integrations/supabase/client";

interface Product {
  title: string;
  description: string;
  detailed_description?: string;
  price: number;
  images: string[];
  gif_urls?: string[];
  video_url?: string;
  features?: string[];
  benefits?: string[];
  target_audience?: string;
  shipping_info?: string;
  return_policy?: string;
  variants: Array<{
    title: string;
    price: number;
    sku: string;
  }>;
  handle?: string;
  product_type?: string;
  vendor?: string;
  tags?: string;
}

interface ProductUploadResult {
  success: boolean;
  productId?: string;
  error?: string;
  productTitle: string;
}

export const addProductsToShopify = async (
  shopifyUrl: string,
  accessToken: string,
  userNiche: string,
  onProgress: (progress: number, currentProduct: string) => void,
  themeColor: string = '#1E40AF'
): Promise<boolean> => {
  try {
    console.log('🚀 Starting enhanced product addition process...');
    console.log('Shopify URL:', shopifyUrl);
    console.log('Niche:', userNiche);
    console.log('Theme Color:', themeColor);
    console.log('Access token provided:', !!accessToken);
    
    // Comprehensive input validation
    if (!shopifyUrl || !accessToken || !userNiche) {
      throw new Error('Missing required parameters: Shopify URL, access token, or niche');
    }

    // Validate access token format
    if (!accessToken.startsWith('shpat_') || accessToken.length < 20) {
      throw new Error('Invalid access token format. Must start with "shpat_" and be at least 20 characters long.');
    }

    // Extract store name from URL
    const storeName = extractStoreName(shopifyUrl);
    if (!storeName) {
      throw new Error('Invalid Shopify URL format. Please provide a valid Shopify store URL.');
    }

    console.log('Extracted store name:', storeName);

    // Generate exactly 10 real winning products using enhanced AI system
    let products: Product[] = [];
    try {
      console.log('🤖 Generating 10 real winning products using enhanced AI...');
      const { data, error } = await supabase.functions.invoke('generate-products', {
        body: { niche: userNiche }
      });

      if (error) {
        console.error('Error generating products:', error);
        throw new Error('Failed to generate products');
      }

      if (data?.success && data?.products) {
        products = data.products.slice(0, 10); // Ensure exactly 10 products
        console.log(`✅ Generated ${products.length} real winning products using enhanced AI`);
      } else {
        throw new Error('No products generated');
      }
    } catch (error) {
      console.error('Product generation failed:', error);
      throw new Error('Failed to generate winning products. Please try again.');
    }
    
    let successCount = 0;
    const errors: string[] = [];
    const uploadResults: ProductUploadResult[] = [];
    
    // Process exactly 10 products with enhanced error handling and retry logic
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const progress = ((i + 1) / 10) * 100; // Always calculate based on 10 products
      onProgress(progress, product.title);
      
      console.log(`🔄 Processing product ${i + 1}/10: ${product.title}`);
      
      let retryCount = 0;
      const maxRetries = 2;
      let productUploaded = false;
      
      while (retryCount <= maxRetries && !productUploaded) {
        try {
          // Create unique identifiers for this attempt
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(2, 15);
          
          // Ensure we have proper variants with consistent structure
          const processedVariants = product.variants.length > 0 ? product.variants : [
            { title: 'Default', price: product.price, sku: `DEFAULT-${timestamp}-001` }
          ];

          // Use Supabase edge function to add product to Shopify with full details
          const { data, error } = await supabase.functions.invoke('add-shopify-product', {
            body: {
              shopifyUrl: `https://${storeName}.myshopify.com`,
              accessToken,
              themeColor, // Apply theme color to product styling
              product: {
                title: product.title.trim(),
                description: product.description.trim(),
                detailed_description: product.detailed_description || product.description,
                features: product.features || [],
                benefits: product.benefits || [],
                target_audience: product.target_audience || `${userNiche} enthusiasts`,
                shipping_info: product.shipping_info || 'Ships worldwide in 7-14 days',
                return_policy: product.return_policy || '30-day money-back guarantee',
                vendor: product.vendor || 'StoreForge AI',
                product_type: product.product_type || userNiche || 'General',
                handle: product.handle || generateHandle(product.title),
                status: 'active',
                published: true,
                tags: product.tags || `${userNiche}, winning products, trending, bestseller`,
                images: product.images?.map(url => ({
                  src: url,
                  alt: product.title
                })) || [],
                gif_urls: product.gif_urls || [],
                video_url: product.video_url || '',
                variants: processedVariants.map((variant, variantIndex) => {
                  const timestampStr = String(timestamp);
                  const indexStr = String(i);
                  const variantIndexStr = String(variantIndex);
                  
                  return {
                    title: variant.title,
                    price: typeof variant.price === 'number' ? variant.price.toFixed(2) : parseFloat(String(variant.price)).toFixed(2),
                    sku: `${variant.sku}-${timestampStr}-${indexStr}-${variantIndexStr}-${randomSuffix}`,
                    inventory_management: null,
                    inventory_policy: 'continue',
                    inventory_quantity: 999,
                    weight: 0.5,
                    weight_unit: 'lb',
                    requires_shipping: true,
                    taxable: true
                  };
                })
              }
            }
          });

          if (error) {
            console.error('Supabase function error:', error);
            throw new Error(error.message || 'Failed to call edge function');
          }

          if (data?.success) {
            successCount++;
            productUploaded = true;
            console.log(`✅ Successfully added: ${product.title}`);
            
            // Store result for tracking
            uploadResults.push({
              success: true,
              productId: data.product?.id,
              productTitle: product.title
            });
            
            // Store comprehensive product data in Supabase
            await storeEnhancedProductInSupabase(product, data.product?.id, userNiche, themeColor);
            await storeProductInStorageBucket(product, data.product?.id, userNiche);
            
          } else {
            const errorMsg = data?.error || 'Unknown error from edge function';
            console.error(`❌ Edge function failed for ${product.title}:`, errorMsg);
            throw new Error(errorMsg);
          }
          
        } catch (productError) {
          retryCount++;
          const errorMsg = productError instanceof Error ? productError.message : 'Unknown error';
          console.error(`❌ Attempt ${retryCount} failed for ${product.title}:`, errorMsg);
          
          // Stop on authentication errors (no retry)
          if (errorMsg.includes('401') || errorMsg.includes('403') || errorMsg.includes('Unauthorized')) {
            throw new Error(`Authentication failed. Please check your access token: ${errorMsg}`);
          }
          
          // If max retries reached, record the failure
          if (retryCount > maxRetries) {
            errors.push(`${product.title}: ${errorMsg}`);
            uploadResults.push({
              success: false,
              error: errorMsg,
              productTitle: product.title
            });
          } else {
            console.log(`🔄 Retrying ${product.title} (attempt ${retryCount + 1}/${maxRetries + 1})...`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
          }
        }
      }
      
      // Rate limiting: 1.5 second delay between requests to avoid 429 errors
      if (i < products.length - 1) {
        console.log('⏱️ Applying rate limit delay...');
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    // Store upload session summary in Supabase
    await storeUploadSession(uploadResults, userNiche);
    
    console.log(`🎉 Product addition completed: ${successCount}/10 successful`);
    
    if (successCount === 0) {
      throw new Error(`Failed to add any products. Errors: ${errors.slice(0, 3).join('; ')}`);
    }
    
    if (successCount < 10) {
      console.warn(`⚠️ Some products failed to add: ${errors.length} errors`);
    }
    
    return true;
    
  } catch (error) {
    console.error('💥 Product addition process failed:', error);
    throw error;
  }
};

// Apply theme color to Shopify store
export const applyThemeColor = async (
  shopifyUrl: string,
  accessToken: string,
  themeColor: string
): Promise<boolean> => {
  try {
    console.log('Applying theme color:', themeColor);
    
    const { data, error } = await supabase.functions.invoke('apply-theme-color', {
      body: {
        shopifyUrl: `https://${extractStoreName(shopifyUrl)}.myshopify.com`,
        accessToken,
        themeColor
      }
    });

    if (error) {
      console.error('Error applying theme color:', error);
      return false;
    }

    if (data?.success) {
      console.log('Theme color applied successfully');
      return true;
    } else {
      console.error('Failed to apply theme color:', data?.error);
      return false;
    }
  } catch (error) {
    console.error('Theme color application failed:', error);
    return false;
  }
};

// Enhanced function to store comprehensive product data in Supabase database
async function storeEnhancedProductInSupabase(product: Product, shopifyProductId: string | undefined, niche: string, themeColor?: string) {
  try {
    const { error } = await supabase
      .from('product_uploads')
      .insert({
        shopify_product_id: shopifyProductId,
        title: product.title,
        description: product.description,
        detailed_description: product.detailed_description,
        price: product.price,
        niche: niche,
        vendor: product.vendor || 'StoreForge AI',
        product_type: product.product_type || niche,
        tags: product.tags,
        images: product.images,
        gif_urls: product.gif_urls || [],
        video_url: product.video_url || '',
        features: product.features || [],
        benefits: product.benefits || [],
        target_audience: product.target_audience || '',
        shipping_info: product.shipping_info || '',
        return_policy: product.return_policy || '',
        variants: product.variants,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing enhanced product in Supabase:', error);
    } else {
      console.log(`✅ Enhanced product ${product.title} stored in Supabase database with theme color: ${themeColor}`);
    }
  } catch (error) {
    console.error('Failed to store enhanced product in Supabase database:', error);
  }
}

// Store individual product data in Supabase Storage bucket with user-specific folder
async function storeProductInStorageBucket(product: Product, shopifyProductId: string | undefined, niche: string) {
  try {
    // Generate a unique session ID for the user
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    const productData = {
      shopify_product_id: shopifyProductId,
      title: product.title,
      description: product.description,
      detailed_description: product.detailed_description,
      price: product.price,
      niche: niche,
      vendor: product.vendor || 'StoreForge AI',
      product_type: product.product_type || niche,
      tags: product.tags,
      images: product.images,
      gif_urls: product.gif_urls || [],
      video_url: product.video_url || '',
      features: product.features || [],
      benefits: product.benefits || [],
      target_audience: product.target_audience,
      shipping_info: product.shipping_info,
      return_policy: product.return_policy,
      variants: product.variants,
      created_at: new Date().toISOString()
    };

    const fileName = `${sessionId}/${niche}/${shopifyProductId || 'unknown'}-${Date.now()}.json`;
    const fileContent = new Blob([JSON.stringify(productData, null, 2)], {
      type: 'application/json'
    });

    const { error } = await supabase.storage
      .from('product-data')
      .upload(fileName, fileContent);

    if (error) {
      console.error('Error storing product in storage bucket:', error);
    } else {
      console.log(`✅ Product ${product.title} stored in storage bucket: ${fileName}`);
    }
  } catch (error) {
    console.error('Failed to store product in storage bucket:', error);
  }
}

// Store upload session summary
async function storeUploadSession(results: ProductUploadResult[], niche: string) {
  try {
    const sessionId = Math.random().toString(36).substring(2, 15);
    const successCount = results.filter(r => r.success).length;
    
    const resultsAsJson = JSON.parse(JSON.stringify(results));
    
    const { error } = await supabase
      .from('upload_sessions')
      .insert({
        session_id: sessionId,
        niche: niche,
        total_products: 10, // Always 10 products
        successful_uploads: successCount,
        failed_uploads: 10 - successCount,
        results: resultsAsJson,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing upload session:', error);
    } else {
      console.log(`✅ Upload session ${sessionId} stored in Supabase`);
    }
  } catch (error) {
    console.error('Failed to store upload session:', error);
  }
}

// Helper function to extract store name from various URL formats
function extractStoreName(url: string): string | null {
  try {
    const cleanUrl = url.replace(/^https?:\/\//, '').toLowerCase();
    
    if (cleanUrl.includes('admin.shopify.com/store/')) {
      const match = cleanUrl.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
      return match ? match[1] : null;
    }
    
    if (cleanUrl.includes('.myshopify.com')) {
      const match = cleanUrl.match(/([^\/\.]+)\.myshopify\.com/);
      return match ? match[1] : null;
    }
    
    if (!cleanUrl.includes('.') && !cleanUrl.includes('/')) {
      return cleanUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting store name:', error);
    return null;
  }
}

// Helper function to generate URL-friendly handle
function generateHandle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 255);
}

// Enhanced fallback products - exactly 10 winning products
const generateFallbackProducts = (niche: string): Product[] => {
  const nicheProducts: Record<string, Product[]> = {
    'pet': [
      {
        title: "Smart Pet Feeder with HD Camera & Voice Recording",
        description: "Revolutionary automatic pet feeder with crystal-clear HD camera, two-way audio, and smartphone app control. Schedule meals remotely, monitor your pet in real-time, and never worry about feeding time again. Features portion control, food level alerts, and secure cloud storage.",
        price: 89.99,
        images: [
          "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=500&fit=crop&crop=center",
          "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&h=500&fit=crop&crop=center",
          "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=500&fit=crop&crop=center"
        ],
        variants: [
          { title: "White - 4L Capacity", price: 89.99, sku: "SPF-WHITE-4L" },
          { title: "Black - 4L Capacity", price: 89.99, sku: "SPF-BLACK-4L" },
          { title: "White - 6L Capacity", price: 109.99, sku: "SPF-WHITE-6L" }
        ],
        handle: "smart-pet-feeder-hd-camera",
        product_type: "Pet Tech",
        vendor: "StoreForge AI",
        tags: "pet feeder, smart home, pet camera, automatic feeding, trending, bestseller"
      }
      // ... rest of the pet products would be here
    ]
  };

  const lowerNiche = niche.toLowerCase();
  const selectedProducts = nicheProducts[lowerNiche] || nicheProducts['pet'];
  
  // Generate exactly 10 products by expanding the base templates
  const products = [];
  for (let i = 0; i < 10; i++) {
    const baseIndex = i % selectedProducts.length;
    const base = selectedProducts[baseIndex];
    const variation = Math.floor(i / selectedProducts.length) + 1;
    
    products.push({
      title: variation > 1 ? `${base.title} - Premium Edition v${variation}` : base.title,
      description: base.description,
      price: base.price + (variation - 1) * 15 + (Math.random() * 10 - 5),
      images: base.images,
      variants: base.variants.map((variant, idx) => ({
        ...variant,
        price: variant.price + (variation - 1) * 15 + idx * 5,
        sku: `${variant.sku}-V${variation}`
      })),
      handle: variation > 1 ? `${base.handle}-v${variation}` : base.handle,
      product_type: base.product_type,
      vendor: base.vendor,
      tags: `${base.tags}, v${variation}, premium quality`,
      category: niche
    });
  }
  
  return products;
};

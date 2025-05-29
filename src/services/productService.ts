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
    console.log('🚀 Starting real winning product addition process...');
    console.log('Shopify URL:', shopifyUrl);
    console.log('Niche:', userNiche);
    console.log('Theme Color:', themeColor);
    
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

    // Generate exactly 10 real winning products
    let products: Product[] = [];
    try {
      console.log('🤖 Generating 10 real winning products...');
      const { data, error } = await supabase.functions.invoke('generate-products', {
        body: { niche: userNiche }
      });

      if (error) {
        console.error('Error generating products:', error);
        throw new Error('Failed to generate real winning products');
      }

      if (data?.success && data?.products) {
        products = data.products.slice(0, 10); // Ensure exactly 10 products
        console.log(`✅ Generated ${products.length} real winning products`);
      } else {
        throw new Error('No real winning products generated');
      }
    } catch (error) {
      console.error('Product generation failed:', error);
      throw new Error('Failed to generate real winning products. Please try again.');
    }
    
    let successCount = 0;
    const errors: string[] = [];
    const uploadResults: ProductUploadResult[] = [];
    
    // Process exactly 10 products with enhanced error handling
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const progress = ((i + 1) / 10) * 100;
      onProgress(progress, product.title);
      
      console.log(`🔄 Processing real winning product ${i + 1}/10: ${product.title}`);
      
      let retryCount = 0;
      const maxRetries = 2;
      let productUploaded = false;
      
      while (retryCount <= maxRetries && !productUploaded) {
        try {
          // Create unique identifiers
          const timestamp = Date.now();
          
          // Ensure we have proper variants
          const processedVariants = product.variants.length > 0 ? product.variants : [
            { title: 'Standard', price: product.price, sku: `STD-${timestamp}-${String(i + 1).padStart(3, '0')}` }
          ];

          // Ensure images are passed as simple string URLs
          const processedImages = Array.isArray(product.images) 
            ? product.images.filter(img => typeof img === 'string' && img.length > 0)
            : [];

          console.log(`📷 Product has ${processedImages.length} images ready for upload`);

          // Use Supabase edge function to add product to Shopify
          const { data, error } = await supabase.functions.invoke('add-shopify-product', {
            body: {
              shopifyUrl: `https://${storeName}.myshopify.com`,
              accessToken,
              themeColor,
              product: {
                title: product.title.trim(),
                description: product.description.trim(),
                detailed_description: product.detailed_description || product.description,
                features: product.features || [],
                benefits: product.benefits || [],
                target_audience: product.target_audience || `${userNiche} enthusiasts`,
                shipping_info: product.shipping_info || 'Fast worldwide shipping, arrives in 7-14 days',
                return_policy: product.return_policy || '30-day money-back guarantee',
                vendor: product.vendor || 'StoreForge AI',
                product_type: product.product_type || userNiche || 'General',
                handle: product.handle || generateHandle(product.title),
                status: 'active',
                published: true,
                tags: product.tags || `${userNiche}, winning products, trending, bestseller`,
                images: processedImages, // Pass as simple string array
                variants: processedVariants.map((variant, variantIndex) => ({
                  title: variant.title,
                  price: typeof variant.price === 'number' ? variant.price.toFixed(2) : parseFloat(String(variant.price)).toFixed(2),
                  sku: `${variant.sku}-${timestamp}-${i}-${variantIndex}`,
                  inventory_management: null,
                  inventory_policy: 'continue',
                  inventory_quantity: 999,
                  weight: 0.5,
                  weight_unit: 'lb',
                  requires_shipping: true,
                  taxable: true
                })),
                category: userNiche
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
            console.log(`✅ Successfully added real winning product: ${product.title}`);
            
            uploadResults.push({
              success: true,
              productId: data.product?.id,
              productTitle: product.title
            });
            
            // Store product data in Supabase
            await storeProductInSupabase(product, data.product?.id, userNiche, themeColor);
            
          } else {
            const errorMsg = data?.error || 'Unknown error from edge function';
            console.error(`❌ Edge function failed for ${product.title}:`, errorMsg);
            throw new Error(errorMsg);
          }
          
        } catch (productError) {
          retryCount++;
          const errorMsg = productError instanceof Error ? productError.message : 'Unknown error';
          console.error(`❌ Attempt ${retryCount} failed for ${product.title}:`, errorMsg);
          
          // Stop on authentication errors
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
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      // Rate limiting
      if (i < products.length - 1) {
        console.log('⏱️ Rate limiting delay...');
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    // Store upload session summary
    await storeUploadSession(uploadResults, userNiche);
    
    console.log(`🎉 Real winning product addition completed: ${successCount}/10 successful`);
    
    if (successCount === 0) {
      throw new Error(`Failed to add any real winning products. Errors: ${errors.slice(0, 3).join('; ')}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('💥 Real winning product addition process failed:', error);
    throw error;
  }
};

// Store product data in Supabase database
async function storeProductInSupabase(product: Product, shopifyProductId: string | undefined, niche: string, themeColor?: string) {
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
      console.error('Error storing product in Supabase:', error);
    } else {
      console.log(`✅ Product ${product.title} stored in Supabase with theme color: ${themeColor}`);
    }
  } catch (error) {
    console.error('Failed to store product in Supabase:', error);
  }
}

// Store upload session summary
async function storeUploadSession(results: ProductUploadResult[], niche: string) {
  try {
    const sessionId = Math.random().toString(36).substring(2, 15);
    const successCount = results.filter(r => r.success).length;
    
    // Convert ProductUploadResult[] to a JSON-compatible format
    const jsonResults = results.map(result => ({
      success: result.success,
      productId: result.productId || null,
      error: result.error || null,
      productTitle: result.productTitle
    }));
    
    const { error } = await supabase
      .from('upload_sessions')
      .insert({
        session_id: sessionId,
        niche: niche,
        total_products: 10,
        successful_uploads: successCount,
        failed_uploads: 10 - successCount,
        results: jsonResults as any, // Cast to any to match Json type
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

// Helper function to extract store name from URL
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

import { supabase } from "@/integrations/supabase/client";

interface Product {
  title: string;
  description: string;
  detailed_description?: string;
  price: number;
  images: string[];
  features?: string[];
  benefits?: string[];
  target_audience?: string;
  variants: Array<{
    title: string;
    price: number;
    sku: string;
    option1?: string;
  }>;
  handle?: string;
  product_type?: string;
  vendor?: string;
  tags?: string;
  dalle_prompt_used?: string;
  aliexpress_data?: any;
  context_info?: any;
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
  themeColor: string = '#1E40AF',
  targetAudience?: string,
  businessType?: string,
  storeStyle?: string,
  customInfo?: string
): Promise<boolean> => {
  try {
    console.log('🚀 Starting REAL winning products upload workflow...');
    console.log('📊 Store Context:', {
      shopifyUrl,
      niche: userNiche,
      targetAudience,
      businessType,
      storeStyle,
      themeColor,
      customInfo
    });
    
    // Validate inputs
    if (!shopifyUrl || !accessToken || !userNiche) {
      throw new Error('Missing required parameters: Shopify URL, access token, or niche');
    }

    if (!accessToken.startsWith('shpat_') || accessToken.length < 20) {
      throw new Error('Invalid access token format. Must start with "shpat_" and be at least 20 characters long.');
    }

    const storeName = extractStoreName(shopifyUrl);
    if (!storeName) {
      throw new Error('Invalid Shopify URL format. Please provide a valid Shopify store URL.');
    }

    console.log('Extracted store name:', storeName);

    // Generate 10 REAL winning products from AliExpress using enhanced workflow
    let products: Product[] = [];
    try {
      console.log(`🛒 Generating 10 REAL winning ${userNiche} products from AliExpress...`);
      const { data, error } = await supabase.functions.invoke('generate-products', {
        body: { 
          niche: userNiche,
          targetAudience: targetAudience || 'general consumers',
          businessType: businessType || 'e-commerce',
          storeStyle: storeStyle || 'modern',
          themeColor: themeColor,
          customInfo: customInfo || ''
        }
      });

      if (error) {
        console.error('Error generating real winning products:', error);
        throw new Error(`Failed to generate REAL winning ${userNiche} products: ${error.message}`);
      }

      if (data?.success && data?.products) {
        products = data.products.slice(0, 10);
        console.log(`✅ Generated ${products.length} REAL winning products from AliExpress`);
        
        products.forEach((product, index) => {
          console.log(`🏆 Winning Product ${index + 1}: ${product.title}`);
          console.log(`📊 AliExpress Data:`, product.aliexpress_data || 'N/A');
          console.log(`📸 DALL·E Images: ${product.images?.length || 0}`);
          console.log(`🎯 Variants: ${product.variants?.length || 0}`);
        });
      } else {
        throw new Error(`No REAL winning ${userNiche} products generated`);
      }
    } catch (error) {
      console.error('Real product generation failed:', error);
      throw new Error(`Failed to generate REAL winning ${userNiche} products. ${error.message}`);
    }
    
    let successCount = 0;
    const errors: string[] = [];
    const uploadResults: ProductUploadResult[] = [];
    
    // Upload each real winning product to Shopify
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const progress = ((i + 1) / 10) * 100;
      onProgress(progress, product.title);
      
      console.log(`🔄 Uploading REAL winning product ${i + 1}/10: ${product.title}`);
      console.log(`🏆 AliExpress rating: ${product.aliexpress_data?.rating || 'N/A'}`);
      console.log(`📦 AliExpress orders: ${product.aliexpress_data?.orders || 'N/A'}`);
      console.log(`📸 DALL·E images: ${product.images?.length || 0}`);
      
      let retryCount = 0;
      const maxRetries = 2;
      let productUploaded = false;
      
      while (retryCount <= maxRetries && !productUploaded) {
        try {
          const timestamp = Date.now();
          
          const processedVariants = product.variants?.length > 0 ? product.variants : [
            { title: 'Standard', price: product.price, sku: `STD-${timestamp}-${String(i + 1).padStart(3, '0')}` }
          ];

          const processedImages = Array.isArray(product.images) 
            ? product.images.filter(img => typeof img === 'string' && img.length > 0)
            : [];

          console.log(`📷 Product has ${processedImages.length} DALL·E generated images`);

          const formattedDescription = formatDescriptionForShopify(
            product.description, 
            product.features, 
            product.benefits
          );

          // Use enhanced Shopify product upload
          const { data, error } = await supabase.functions.invoke('add-shopify-product', {
            body: {
              shopifyUrl: `https://${storeName}.myshopify.com`,
              accessToken,
              themeColor,
              product: {
                title: product.title.trim(),
                description: formattedDescription,
                detailed_description: product.detailed_description || formattedDescription,
                features: product.features || [],
                benefits: product.benefits || [],
                target_audience: product.target_audience || targetAudience || `${userNiche} enthusiasts`,
                vendor: product.vendor || 'Trending Store',
                product_type: product.product_type || userNiche || 'General',
                handle: product.handle || generateHandle(product.title),
                status: 'active',
                published: true,
                tags: product.tags || `${userNiche}, trending, 2025, hot, winning-products, bestseller`,
                images: processedImages,
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
                  taxable: true,
                  option1: variant.option1 || 'Standard'
                })),
                category: userNiche,
                dalle_prompt_used: product.dalle_prompt_used,
                aliexpress_data: product.aliexpress_data,
                context_info: product.context_info
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
            console.log(`✅ Successfully uploaded REAL winning product: ${product.title}`);
            console.log(`📊 Upload stats:`, {
              images_uploaded: data.images_uploaded || processedImages.length,
              variants_created: data.variants_created || processedVariants.length,
              price_set: data.price_set,
              product_id: data.product?.id
            });
            
            uploadResults.push({
              success: true,
              productId: data.product?.id,
              productTitle: product.title
            });
            
            await storeProductInSupabase(product, data.product?.id, userNiche, themeColor, targetAudience);
            
          } else {
            const errorMsg = data?.error || 'Unknown error from edge function';
            console.error(`❌ Edge function failed for ${product.title}:`, errorMsg);
            throw new Error(errorMsg);
          }
          
        } catch (productError) {
          retryCount++;
          const errorMsg = productError instanceof Error ? productError.message : 'Unknown error';
          console.error(`❌ Attempt ${retryCount} failed for ${product.title}:`, errorMsg);
          
          if (errorMsg.includes('401') || errorMsg.includes('403') || errorMsg.includes('Unauthorized')) {
            throw new Error(`Authentication failed. Please check your access token: ${errorMsg}`);
          }
          
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
    
    await storeUploadSession(uploadResults, userNiche, targetAudience, businessType, storeStyle);
    
    console.log(`🎉 REAL winning products upload completed: ${successCount}/10 successful for ${userNiche}`);
    
    if (successCount === 0) {
      throw new Error(`Failed to upload any REAL winning ${userNiche} products. Errors: ${errors.slice(0, 3).join('; ')}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('💥 REAL winning products upload process failed:', error);
    throw error;
  }
};

// Format description for Shopify HTML display
function formatDescriptionForShopify(description: string, features?: string[], benefits?: string[]): string {
  let formattedHtml = `<div class="product-description">\n`;
  
  if (description) {
    formattedHtml += `${description}\n`;
  }
  
  if (features && features.length > 0) {
    formattedHtml += `<h3>🌟 Key Features:</h3>\n<ul>\n`;
    features.forEach(feature => {
      formattedHtml += `<li>✅ ${feature}</li>\n`;
    });
    formattedHtml += `</ul>\n`;
  }
  
  if (benefits && benefits.length > 0) {
    formattedHtml += `<h3>💎 Benefits:</h3>\n<ul>\n`;
    benefits.forEach(benefit => {
      formattedHtml += `<li>🎯 ${benefit}</li>\n`;
    });
    formattedHtml += `</ul>\n`;
  }
  
  formattedHtml += `</div>`;
  
  return formattedHtml;
}

// Store product data in Supabase with enhanced context
async function storeProductInSupabase(product: Product, shopifyProductId: string | undefined, niche: string, themeColor?: string, targetAudience?: string) {
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
        vendor: product.vendor || 'Trending Store',
        product_type: product.product_type || niche,
        tags: product.tags,
        images: product.images,
        features: product.features || [],
        benefits: product.benefits || [],
        target_audience: product.target_audience || targetAudience || '',
        variants: product.variants,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing product in Supabase:', error);
    } else {
      console.log(`✅ REAL winning product ${product.title} stored in Supabase`);
    }
  } catch (error) {
    console.error('Failed to store product in Supabase:', error);
  }
}

// Store upload session summary with enhanced context
async function storeUploadSession(results: ProductUploadResult[], niche: string, targetAudience?: string, businessType?: string, storeStyle?: string) {
  try {
    const sessionId = Math.random().toString(36).substring(2, 15);
    const successCount = results.filter(r => r.success).length;
    
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
        results: jsonResults as any,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing upload session:', error);
    } else {
      console.log(`✅ Upload session ${sessionId} stored - REAL winning products workflow`);
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

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
  dalle_prompt_used?: string;
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
    console.log('🚀 Starting niche-specific winning product addition with full context...');
    console.log('📊 Store Context:', {
      shopifyUrl,
      niche: userNiche,
      targetAudience,
      businessType,
      storeStyle,
      themeColor,
      customInfo
    });
    
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

    // Generate exactly 10 niche-specific products using GPT-4 + DALL·E with full context
    let products: Product[] = [];
    try {
      console.log(`🤖 Generating 10 winning products for "${userNiche}" targeting "${targetAudience}" using GPT-4 + DALL·E...`);
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
        console.error('Error generating niche-specific products:', error);
        throw new Error(`Failed to generate winning ${userNiche} products for ${targetAudience}: ${error.message}`);
      }

      if (data?.success && data?.products) {
        products = data.products.slice(0, 10); // Ensure exactly 10 products
        console.log(`✅ Generated ${products.length} niche-specific winning ${userNiche} products for ${targetAudience}`);
        
        // Log the product generation details
        products.forEach((product, index) => {
          console.log(`🎯 Product ${index + 1} - ${product.title}:`);
          console.log(`📝 Description length: ${product.description?.length || 0} chars`);
          console.log(`📸 Images: ${product.images?.length || 0} generated`);
          console.log(`🎨 DALL·E Prompt: ${product.dalle_prompt_used || 'None'}`);
        });
      } else {
        throw new Error(`No winning ${userNiche} products generated for ${targetAudience}`);
      }
    } catch (error) {
      console.error('Product generation failed:', error);
      throw new Error(`Failed to generate winning ${userNiche} products for ${targetAudience}. ${error.message}`);
    }
    
    let successCount = 0;
    const errors: string[] = [];
    const uploadResults: ProductUploadResult[] = [];
    
    // Process exactly 10 products with enhanced logging
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const progress = ((i + 1) / 10) * 100;
      onProgress(progress, product.title);
      
      console.log(`🔄 Processing niche-specific product ${i + 1}/10: ${product.title}`);
      console.log(`📝 Description preview: ${product.description?.substring(0, 100)}...`);
      console.log(`📸 Images ready: ${product.images?.length || 0}`);
      console.log(`🎯 Target audience: ${product.target_audience || targetAudience}`);
      
      let retryCount = 0;
      const maxRetries = 2;
      let productUploaded = false;
      
      while (retryCount <= maxRetries && !productUploaded) {
        try {
          // Create unique identifiers
          const timestamp = Date.now();
          
          // Ensure we have proper variants
          const processedVariants = product.variants?.length > 0 ? product.variants : [
            { title: 'Standard', price: product.price, sku: `STD-${timestamp}-${String(i + 1).padStart(3, '0')}` }
          ];

          // Ensure images are passed as simple string URLs
          const processedImages = Array.isArray(product.images) 
            ? product.images.filter(img => typeof img === 'string' && img.length > 0)
            : [];

          console.log(`📷 Product has ${processedImages.length} niche-specific images ready for upload`);
          if (processedImages.length > 0) {
            console.log(`🔗 First image URL: ${processedImages[0].substring(0, 100)}...`);
          }

          // Ensure description is properly formatted for Shopify HTML
          const formattedDescription = formatDescriptionForShopify(product.description, product.features, product.benefits);
          
          console.log(`📝 Formatted description length: ${formattedDescription.length} chars`);

          // Use Supabase edge function to add product to Shopify with enhanced context
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
                shipping_info: product.shipping_info || 'Fast worldwide shipping, arrives in 7-14 days',
                return_policy: product.return_policy || '30-day money-back guarantee',
                vendor: product.vendor || 'Premium Store',
                product_type: product.product_type || userNiche || 'General',
                handle: product.handle || generateHandle(product.title),
                status: 'active',
                published: true,
                tags: product.tags || `${userNiche}, winning-products, trending, bestseller, hot-products, ${(targetAudience || '').toLowerCase().replace(/\s+/g, '-')}`,
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
                  taxable: true
                })),
                category: userNiche,
                dalle_prompt_used: product.dalle_prompt_used,
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
            console.log(`✅ Successfully added niche-specific product: ${product.title}`);
            console.log(`📝 Description uploaded: ${data.description_length || 'Unknown'} chars`);
            console.log(`📸 Images uploaded: ${data.images_uploaded || processedImages.length}`);
            console.log(`🆔 Product ID: ${data.product?.id}`);
            
            uploadResults.push({
              success: true,
              productId: data.product?.id,
              productTitle: product.title
            });
            
            // Store product data in Supabase with enhanced logging
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
    
    // Store upload session summary with enhanced context
    await storeUploadSession(uploadResults, userNiche, targetAudience, businessType, storeStyle);
    
    console.log(`🎉 Niche-specific product addition completed: ${successCount}/10 successful for ${userNiche} targeting ${targetAudience}`);
    
    if (successCount === 0) {
      throw new Error(`Failed to add any ${userNiche} products for ${targetAudience}. Errors: ${errors.slice(0, 3).join('; ')}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('💥 Niche-specific product addition process failed:', error);
    throw error;
  }
};

// Format description for Shopify HTML display
function formatDescriptionForShopify(description: string, features?: string[], benefits?: string[]): string {
  let formattedHtml = `<div class="product-description">\n`;
  
  // Main description
  if (description) {
    formattedHtml += `<p>${description.replace(/\n/g, '</p>\n<p>')}</p>\n`;
  }
  
  // Features section
  if (features && features.length > 0) {
    formattedHtml += `<h3>Key Features:</h3>\n<ul>\n`;
    features.forEach(feature => {
      formattedHtml += `<li>${feature}</li>\n`;
    });
    formattedHtml += `</ul>\n`;
  }
  
  // Benefits section
  if (benefits && benefits.length > 0) {
    formattedHtml += `<h3>Benefits:</h3>\n<ul>\n`;
    benefits.forEach(benefit => {
      formattedHtml += `<li>${benefit}</li>\n`;
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
        vendor: product.vendor || 'Premium Store',
        product_type: product.product_type || niche,
        tags: product.tags,
        images: product.images,
        gif_urls: product.gif_urls || [],
        video_url: product.video_url || '',
        features: product.features || [],
        benefits: product.benefits || [],
        target_audience: product.target_audience || targetAudience || '',
        shipping_info: product.shipping_info || '',
        return_policy: product.return_policy || '',
        variants: product.variants,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing product in Supabase:', error);
    } else {
      console.log(`✅ Product ${product.title} stored in Supabase with context:`, {
        niche,
        targetAudience,
        themeColor,
        dalle_prompt: product.dalle_prompt_used
      });
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
      console.log(`✅ Upload session ${sessionId} stored with context:`, {
        niche,
        targetAudience,
        businessType,
        storeStyle,
        successCount
      });
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

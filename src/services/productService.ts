
import { supabase } from "@/integrations/supabase/client";

interface Product {
  title: string;
  description: string;
  price: number;
  images: string[];
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
  onProgress: (progress: number, currentProduct: string) => void
): Promise<boolean> => {
  try {
    console.log('Starting product addition process...');
    console.log('Shopify URL:', shopifyUrl);
    console.log('Niche:', userNiche);
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

    // Generate products using OpenAI
    let products: Product[] = [];
    try {
      console.log('Attempting to generate products using OpenAI...');
      const { data, error } = await supabase.functions.invoke('generate-products', {
        body: { niche: userNiche }
      });

      if (error) {
        console.error('Error generating products:', error);
        throw new Error('Failed to generate products');
      }

      if (data?.success && data?.products) {
        products = data.products.slice(0, 10); // Use 10 products for better reliability
        console.log(`Generated ${products.length} products using AI`);
      } else {
        throw new Error('No products generated');
      }
    } catch (error) {
      console.error('Product generation failed, using fallback:', error);
      // Fallback to predefined products
      products = generateFallbackProducts(userNiche).slice(0, 10);
    }
    
    let successCount = 0;
    const errors: string[] = [];
    const uploadResults: ProductUploadResult[] = [];
    
    // Process products one by one with rate limiting
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const progress = ((i + 1) / products.length) * 100;
      onProgress(progress, product.title);
      
      console.log(`Processing product ${i + 1}/${products.length}: ${product.title}`);
      
      try {
        // Create unique identifiers for this attempt
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 15);
        
        // Ensure we have proper variants with consistent structure
        const processedVariants = product.variants.length > 0 ? product.variants : [
          { title: 'Default', price: product.price, sku: 'DEFAULT-001' }
        ];

        // Use Supabase edge function to add product to Shopify
        const { data, error } = await supabase.functions.invoke('add-shopify-product', {
          body: {
            shopifyUrl: `https://${storeName}.myshopify.com`,
            accessToken,
            product: {
              title: product.title.trim(),
              body_html: `<p>${product.description.trim()}</p>`,
              vendor: product.vendor || 'StoreForge AI',
              product_type: product.product_type || userNiche || 'General',
              handle: product.handle || generateHandle(product.title),
              status: 'active',
              published: true,
              tags: product.tags || `${userNiche}, winning products, trending`,
              images: product.images?.map(url => ({
                src: url,
                alt: product.title
              })) || [],
              variants: processedVariants.map((variant, variantIndex) => {
                // Convert all numeric values to strings explicitly for the SKU
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
          console.log(`✓ Successfully added: ${product.title}`);
          
          // Store result for Supabase storage
          uploadResults.push({
            success: true,
            productId: data.product?.id,
            productTitle: product.title
          });
          
          // Store product data in Supabase
          await storeProductInSupabase(product, data.product?.id, userNiche);
          
        } else {
          const errorMsg = data?.error || 'Unknown error from edge function';
          console.error(`✗ Edge function failed for ${product.title}:`, errorMsg);
          
          uploadResults.push({
            success: false,
            error: errorMsg,
            productTitle: product.title
          });
          
          throw new Error(errorMsg);
        }
        
      } catch (productError) {
        const errorMsg = productError instanceof Error ? productError.message : 'Unknown error';
        console.error(`✗ Failed to add ${product.title}:`, errorMsg);
        errors.push(`${product.title}: ${errorMsg}`);
        
        uploadResults.push({
          success: false,
          error: errorMsg,
          productTitle: product.title
        });
        
        // Stop on authentication errors
        if (errorMsg.includes('401') || errorMsg.includes('403') || errorMsg.includes('Unauthorized')) {
          throw new Error(`Authentication failed. Please check your access token: ${errorMsg}`);
        }
      }
      
      // Rate limiting: 1.5 second delay between requests to avoid 429 errors
      if (i < products.length - 1) {
        console.log('Applying rate limit delay...');
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
      }
    }
    
    // Store upload session summary in Supabase
    await storeUploadSession(uploadResults, userNiche);
    
    console.log(`Product addition completed: ${successCount}/${products.length} successful`);
    
    if (successCount === 0) {
      throw new Error(`Failed to add any products. First few errors: ${errors.slice(0, 3).join('; ')}`);
    }
    
    if (successCount < products.length) {
      console.warn(`Some products failed to add: ${errors.length} errors`);
    }
    
    return true;
    
  } catch (error) {
    console.error('Product addition process failed:', error);
    throw error;
  }
};

// Store individual product data in Supabase
async function storeProductInSupabase(product: Product, shopifyProductId: string | undefined, niche: string) {
  try {
    const { error } = await supabase
      .from('product_uploads')
      .insert({
        shopify_product_id: shopifyProductId,
        title: product.title,
        description: product.description,
        price: product.price,
        niche: niche,
        vendor: product.vendor || 'StoreForge AI',
        product_type: product.product_type || niche,
        tags: product.tags,
        images: product.images,
        variants: product.variants,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing product in Supabase:', error);
    } else {
      console.log(`Product ${product.title} stored in Supabase`);
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
    
    // Convert results to JSON-compatible format
    const resultsAsJson = JSON.parse(JSON.stringify(results));
    
    const { error } = await supabase
      .from('upload_sessions')
      .insert({
        session_id: sessionId,
        niche: niche,
        total_products: results.length,
        successful_uploads: successCount,
        failed_uploads: results.length - successCount,
        results: resultsAsJson,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing upload session:', error);
    } else {
      console.log(`Upload session ${sessionId} stored in Supabase`);
    }
  } catch (error) {
    console.error('Failed to store upload session:', error);
  }
}

// Helper function to extract store name from various URL formats
function extractStoreName(url: string): string | null {
  try {
    // Remove protocol and clean up URL
    const cleanUrl = url.replace(/^https?:\/\//, '').toLowerCase();
    
    // Handle admin.shopify.com/store/storename format
    if (cleanUrl.includes('admin.shopify.com/store/')) {
      const match = cleanUrl.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
      return match ? match[1] : null;
    }
    
    // Handle storename.myshopify.com format
    if (cleanUrl.includes('.myshopify.com')) {
      const match = cleanUrl.match(/([^\/\.]+)\.myshopify\.com/);
      return match ? match[1] : null;
    }
    
    // Handle direct store name
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
    .substring(0, 255); // Shopify handle limit
}

// Fallback products if AI generation fails
const generateFallbackProducts = (niche: string): Product[] => {
  const nicheProducts: Record<string, Product[]> = {
    'pet': [
      {
        title: "Smart Pet Feeder with Camera",
        description: "Automatic pet feeder with HD camera, voice recording, and smartphone app control. Perfect for busy pet parents who want to stay connected with their pets.",
        price: 89.99,
        images: ["https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=500&fit=crop&crop=center"],
        variants: [
          { title: "White", price: 89.99, sku: "SPF-WHITE-001" },
          { title: "Black", price: 89.99, sku: "SPF-BLACK-001" }
        ],
        handle: "smart-pet-feeder-with-camera",
        product_type: "Pet Tech",
        vendor: "StoreForge AI",
        tags: "pet, smart home, trending"
      },
      {
        title: "Interactive Dog Puzzle Toy",
        description: "Mental stimulation puzzle toy that keeps dogs engaged and reduces anxiety. Multiple difficulty levels available to challenge your pet.",
        price: 24.99,
        images: ["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=500&fit=crop&crop=center"],
        variants: [
          { title: "Level 1", price: 24.99, sku: "DPT-LV1-001" },
          { title: "Level 2", price: 29.99, sku: "DPT-LV2-001" }
        ],
        handle: "interactive-dog-puzzle-toy",
        product_type: "Pet Toys",
        vendor: "StoreForge AI",
        tags: "dog, puzzle, mental stimulation"
      },
      {
        title: "Cat Water Fountain",
        description: "Fresh flowing water dispenser with filtration system. Encourages healthy hydration for cats and keeps water clean and fresh.",
        price: 34.99,
        images: ["https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=500&h=500&fit=crop&crop=center"],
        variants: [
          { title: "2L Capacity", price: 34.99, sku: "CWF-2L-001" },
          { title: "3L Capacity", price: 39.99, sku: "CWF-3L-001" }
        ],
        handle: "cat-water-fountain",
        product_type: "Pet Care",
        vendor: "StoreForge AI",
        tags: "cat, water, health"
      },
      {
        title: "Pet GPS Tracker Collar",
        description: "Real-time GPS tracking collar for dogs and cats. Monitor your pet's location and activity levels with smartphone notifications.",
        price: 59.99,
        images: ["https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=500&fit=crop&crop=center"],
        variants: [
          { title: "Small", price: 59.99, sku: "GPS-SM-001" },
          { title: "Medium", price: 64.99, sku: "GPS-MD-001" },
          { title: "Large", price: 69.99, sku: "GPS-LG-001" }
        ],
        handle: "pet-gps-tracker-collar",
        product_type: "Pet Safety",
        vendor: "StoreForge AI",
        tags: "gps, tracking, safety, collar"
      },
      {
        title: "Automatic Pet Grooming Brush",
        description: "Self-cleaning slicker brush that removes loose fur and reduces shedding. One-click hair removal system for easy maintenance.",
        price: 19.99,
        images: ["https://images.unsplash.com/photo-1574158622688-3f2d4f4c8b9b?w=500&h=500&fit=crop&crop=center"],
        variants: [
          { title: "For Cats", price: 19.99, sku: "AGB-CAT-001" },
          { title: "For Dogs", price: 22.99, sku: "AGB-DOG-001" }
        ],
        handle: "automatic-pet-grooming-brush",
        product_type: "Pet Grooming",
        vendor: "StoreForge AI",
        tags: "grooming, brush, shedding, maintenance"
      }
    ]
  };

  const lowerNiche = niche.toLowerCase();
  const selectedProducts = nicheProducts[lowerNiche] || nicheProducts['pet'];
  
  return selectedProducts.slice(0, 10); // Return 10 products
};

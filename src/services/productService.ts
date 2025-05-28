
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

    // First, try to generate products using OpenAI
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
        products = data.products.slice(0, 3); // Use only 3 products for testing
        console.log(`Generated ${products.length} products using AI`);
      } else {
        throw new Error('No products generated');
      }
    } catch (error) {
      console.error('Product generation failed, using fallback:', error);
      // Fallback to predefined products
      products = generateFallbackProducts(userNiche).slice(0, 3);
    }
    
    let successCount = 0;
    const errors: string[] = [];
    
    // Process products one by one with progress updates
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
                return {
                  title: variant.title,
                  price: variant.price.toFixed ? variant.price.toFixed(2) : parseFloat(variant.price).toFixed(2),
                  sku: `${variant.sku}-${timestamp}-${i}-${variantIndex}-${randomSuffix}`,
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
        } else {
          const errorMsg = data?.error || 'Unknown error from edge function';
          console.error(`✗ Edge function failed for ${product.title}:`, errorMsg);
          throw new Error(errorMsg);
        }
        
      } catch (productError) {
        const errorMsg = productError instanceof Error ? productError.message : 'Unknown error';
        console.error(`✗ Failed to add ${product.title}:`, errorMsg);
        errors.push(`${product.title}: ${errorMsg}`);
        
        // Stop on authentication errors
        if (errorMsg.includes('401') || errorMsg.includes('403') || errorMsg.includes('Unauthorized')) {
          throw new Error(`Authentication failed. Please check your access token: ${errorMsg}`);
        }
      }
      
      // Add delay between requests to avoid rate limiting
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
      }
    }
    
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
      }
    ]
  };

  const lowerNiche = niche.toLowerCase();
  const selectedProducts = nicheProducts[lowerNiche] || nicheProducts['pet'];
  
  return selectedProducts.slice(0, 5); // Return 5 products
};

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

    // Generate products for the specified niche
    const products = generateProducts(userNiche);
    console.log(`Generated ${products.length} products for ${userNiche} niche`);
    
    let successCount = 0;
    const errors: string[] = [];
    
    // Process products one by one with progress updates
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const progress = ((i + 1) / products.length) * 100;
      onProgress(progress, product.title);
      
      console.log(`Processing product ${i + 1}/${products.length}: ${product.title}`);
      
      try {
        // Use Supabase edge function to add product to Shopify
        const { data, error } = await supabase.functions.invoke('add-shopify-product', {
          body: {
            shopifyUrl: `https://${storeName}.myshopify.com`,
            accessToken,
            product: {
              title: product.title.trim(),
              body_html: `<p>${product.description.trim()}</p>`,
              vendor: 'StoreForge AI',
              product_type: userNiche || 'General',
              handle: generateHandle(product.title),
              status: 'active',
              published: true,
              tags: `${userNiche}, winning products, trending`,
              images: product.images.map(url => ({
                src: url,
                alt: product.title
              })),
              variants: product.variants.map((variant, variantIndex) => {
                return {
                  title: variant.title,
                  price: variant.price.toFixed(2),
                  sku: `${variant.sku}-${Date.now()}-${variantIndex}`,
                  inventory_management: null,
                  inventory_policy: 'continue',
                  inventory_quantity: 100,
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
        await new Promise(resolve => setTimeout(resolve, 1000));
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

// Generate products directly without external API calls
const generateProducts = (niche: string): Product[] => {
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
        ]
      },
      {
        title: "Interactive Dog Puzzle Toy",
        description: "Mental stimulation puzzle toy that keeps dogs engaged and reduces anxiety. Multiple difficulty levels available to challenge your pet.",
        price: 24.99,
        images: ["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=500&fit=crop&crop=center"],
        variants: [
          { title: "Level 1", price: 24.99, sku: "DPT-LV1-001" },
          { title: "Level 2", price: 29.99, sku: "DPT-LV2-001" }
        ]
      },
      {
        title: "Cat Water Fountain",
        description: "Fresh flowing water dispenser with filtration system. Encourages healthy hydration for cats and keeps water clean and fresh.",
        price: 34.99,
        images: ["https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=500&h=500&fit=crop&crop=center"],
        variants: [
          { title: "2L Capacity", price: 34.99, sku: "CWF-2L-001" },
          { title: "3L Capacity", price: 39.99, sku: "CWF-3L-001" }
        ]
      },
      {
        title: "Pet GPS Tracker Collar",
        description: "Real-time GPS tracking collar for dogs and cats. Monitor your pet's location and activity levels throughout the day.",
        price: 59.99,
        images: ["https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=500&fit=crop&crop=center"],
        variants: [
          { title: "Small", price: 59.99, sku: "PGT-S-001" },
          { title: "Medium", price: 59.99, sku: "PGT-M-001" },
          { title: "Large", price: 64.99, sku: "PGT-L-001" }
        ]
      },
      {
        title: "Automatic Pet Grooming Brush",
        description: "Self-cleaning slicker brush that removes loose fur and reduces shedding. One-click hair removal feature makes grooming easy.",
        price: 19.99,
        images: ["https://images.unsplash.com/photo-1601758067099-4ea6f2b2ced9?w=500&h=500&fit=crop&crop=center"],
        variants: [
          { title: "For Cats", price: 19.99, sku: "APG-CAT-001" },
          { title: "For Dogs", price: 22.99, sku: "APG-DOG-001" }
        ]
      }
    ],
    'kitchen': [
      {
        title: "Smart Kitchen Scale with App",
        description: "Precision digital kitchen scale with smartphone connectivity and nutritional tracking.",
        price: 39.99,
        images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&crop=center"],
        variants: [
          { title: "White", price: 39.99, sku: "SKS-WHITE-001" },
          { title: "Black", price: 39.99, sku: "SKS-BLACK-001" }
        ]
      },
      {
        title: "Silicone Cooking Utensil Set",
        description: "Complete set of heat-resistant silicone cooking utensils. Non-stick friendly and dishwasher safe.",
        price: 24.99,
        images: ["https://images.unsplash.com/photo-1584286595398-c4fdb5ab4a5b?w=500&h=500&fit=crop&crop=center"],
        variants: [
          { title: "5-Piece Set", price: 24.99, sku: "SCU-5PC-001" },
          { title: "10-Piece Set", price: 39.99, sku: "SCU-10PC-001" }
        ]
      },
      {
        title: "Multi-Use Pressure Cooker",
        description: "Electric pressure cooker with multiple cooking functions. Perfect for quick, healthy meals.",
        price: 79.99,
        images: ["https://images.unsplash.com/photo-1585515656963-05cc7a2a7c0f?w=500&h=500&fit=crop&crop=center"],
        variants: [
          { title: "6-Quart", price: 79.99, sku: "MPC-6Q-001" },
          { title: "8-Quart", price: 99.99, sku: "MPC-8Q-001" }
        ]
      }
    ],
    'electronics': [
      {
        title: "Wireless Charging Pad",
        description: "Fast wireless charger for smartphones with LED indicator and over-temperature protection.",
        price: 29.99,
        images: ["https://images.unsplash.com/photo-1609592388907-a2b48db523c3?w=500&h=500&fit=crop&crop=center"],
        variants: [
          { title: "10W Fast Charge", price: 29.99, sku: "WCP-10W-001" },
          { title: "15W Ultra Fast", price: 39.99, sku: "WCP-15W-001" }
        ]
      },
      {
        title: "Bluetooth Earbuds Pro",
        description: "Premium noise-cancelling wireless earbuds with long battery life and crystal clear sound quality.",
        price: 79.99,
        images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop&crop=center"],
        variants: [
          { title: "Black", price: 79.99, sku: "BEP-BLACK-001" },
          { title: "White", price: 79.99, sku: "BEP-WHITE-001" }
        ]
      },
      {
        title: "Smart LED Strip Lights",
        description: "RGB LED strips with smartphone app control, music sync, and voice assistant compatibility.",
        price: 34.99,
        images: ["https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=500&fit=crop&crop=center"],
        variants: [
          { title: "16ft Strip", price: 34.99, sku: "SLS-16FT-001" },
          { title: "32ft Strip", price: 54.99, sku: "SLS-32FT-001" }
        ]
      }
    ]
  };

  const lowerNiche = niche.toLowerCase();
  const selectedProducts = nicheProducts[lowerNiche] || nicheProducts['pet'];
  
  // Generate just 5 products to start with for testing
  const products: Product[] = [];
  for (let i = 0; i < 5; i++) {
    const baseProduct = selectedProducts[i % selectedProducts.length];
    
    products.push({
      ...baseProduct,
      title: `${baseProduct.title}`,
      variants: baseProduct.variants.map((variant, variantIndex) => ({
        ...variant,
        sku: `${variant.sku}-${Date.now()}-${i}-${variantIndex}`,
      }))
    });
  }
  
  return products;
};

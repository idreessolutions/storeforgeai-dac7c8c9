
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
    console.log('Starting product generation for niche:', userNiche);
    console.log('Shopify URL:', shopifyUrl);
    console.log('Access token provided:', !!accessToken);
    
    // Generate 20 winning products using the Supabase edge function
    const products = await generateWinningProducts(userNiche);
    
    if (!products || products.length === 0) {
      console.error('No products generated');
      return false;
    }
    
    console.log(`Generated ${products.length} products, starting Shopify upload`);
    
    // Extract store name properly from URL
    let storeName = shopifyUrl;
    if (shopifyUrl.includes('.myshopify.com')) {
      storeName = shopifyUrl.replace('https://', '').replace('http://', '').replace('.myshopify.com', '');
    } else if (shopifyUrl.includes('admin.shopify.com/store/')) {
      storeName = shopifyUrl.split('/store/')[1];
    }
    
    console.log('Store name extracted:', storeName);
    
    // Use the correct Shopify API endpoint
    const shopifyApiUrl = `https://${storeName}.myshopify.com/admin/api/2024-01/products.json`;
    
    console.log('Shopify API URL:', shopifyApiUrl);
    
    let successCount = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const progress = ((i + 1) / products.length) * 100;
      onProgress(progress, product.title);
      
      console.log(`Adding product ${i + 1}/${products.length}:`, product.title);
      
      try {
        // Create product payload for Shopify
        const productPayload = {
          product: {
            title: product.title,
            body_html: `<p>${product.description}</p>`,
            vendor: 'StoreForge AI',
            product_type: userNiche || 'General',
            handle: product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            status: 'active',
            images: product.images.map(url => ({ src: url })),
            variants: product.variants.map(variant => ({
              title: variant.title,
              price: variant.price.toString(),
              sku: variant.sku,
              inventory_management: 'shopify',
              inventory_policy: 'deny',
              inventory_quantity: 100,
              weight: 1,
              weight_unit: 'lb'
            }))
          }
        };
        
        console.log('Sending product to Shopify:', JSON.stringify(productPayload, null, 2));
        
        // Add product to Shopify store
        const response = await fetch(shopifyApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
          },
          body: JSON.stringify(productPayload),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to add product ${product.title}:`, response.status, response.statusText);
          console.error('Error response:', errorText);
          
          // Try to parse error details
          try {
            const errorJson = JSON.parse(errorText);
            console.error('Shopify API error details:', errorJson);
          } catch (e) {
            console.error('Raw error response:', errorText);
          }
        } else {
          const responseData = await response.json();
          console.log(`Successfully added product: ${product.title}`, responseData.product?.id);
          successCount++;
        }
      } catch (productError) {
        console.error(`Error adding individual product ${product.title}:`, productError);
      }
      
      // Wait between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`Successfully added ${successCount}/${products.length} products to Shopify`);
    return successCount > 0;
    
  } catch (error) {
    console.error('Error adding products to Shopify:', error);
    return false;
  }
};

const generateWinningProducts = async (niche: string): Promise<Product[]> => {
  try {
    console.log('Generating products for niche:', niche);
    
    // Use the Supabase edge function instead of the broken API route
    const response = await fetch('/supabase/functions/v1/generate-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        niche: niche,
      }),
    });
    
    if (!response.ok) {
      console.error('Supabase function request failed:', response.status);
      throw new Error(`Supabase function request failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Generated products response:', data);
    
    if (data.success && data.products) {
      // Convert the products to the expected format
      return data.products.map((product: any, index: number) => ({
        title: product.title || `${niche} Product ${index + 1}`,
        description: product.description || `High-quality ${niche.toLowerCase()} product perfect for your customers`,
        price: product.price || (Math.random() * 80 + 20),
        images: [`https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=500&fit=crop`],
        variants: [
          {
            title: 'Default Title',
            price: product.price || (Math.random() * 80 + 20),
            sku: `${product.title?.replace(/\s+/g, '-').toUpperCase() || 'PRODUCT'}-${index + 1}`
          }
        ]
      }));
    }
    
    throw new Error('Invalid response from product generation function');
  } catch (error) {
    console.error('Error generating products, using fallback:', error);
    
    // Fallback to niche-specific predefined products
    return getFallbackProducts(niche);
  }
};

const getFallbackProducts = (niche: string): Product[] => {
  const nicheProducts: Record<string, Product[]> = {
    'pet': [
      {
        title: "Smart Pet Feeder with Camera",
        description: "Automatic pet feeder with HD camera, voice recording, and smartphone app control. Perfect for busy pet parents who want to stay connected with their pets.",
        price: 89.99,
        images: ["https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=500&fit=crop"],
        variants: [
          { title: "White", price: 89.99, sku: "SPF-WHITE-001" },
          { title: "Black", price: 89.99, sku: "SPF-BLACK-001" }
        ]
      },
      {
        title: "Interactive Dog Puzzle Toy",
        description: "Mental stimulation puzzle toy that keeps dogs engaged and reduces anxiety. Multiple difficulty levels available to challenge your pet.",
        price: 24.99,
        images: ["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=500&fit=crop"],
        variants: [
          { title: "Level 1", price: 24.99, sku: "DPT-LV1-001" },
          { title: "Level 2", price: 29.99, sku: "DPT-LV2-001" }
        ]
      },
      {
        title: "Cat Water Fountain",
        description: "Fresh flowing water dispenser with filtration system. Encourages healthy hydration for cats and keeps water clean and fresh.",
        price: 34.99,
        images: ["https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=500&h=500&fit=crop"],
        variants: [
          { title: "2L Capacity", price: 34.99, sku: "CWF-2L-001" },
          { title: "3L Capacity", price: 39.99, sku: "CWF-3L-001" }
        ]
      }
    ],
    'kitchen': [
      {
        title: "Smart Kitchen Scale with App",
        description: "Precision digital kitchen scale with smartphone connectivity and nutritional tracking.",
        price: 39.99,
        images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500"],
        variants: [
          { title: "White", price: 39.99, sku: "SKS-WHITE-001" },
          { title: "Black", price: 39.99, sku: "SKS-BLACK-001" }
        ]
      }
    ]
  };

  const lowerNiche = niche.toLowerCase();
  const selectedProducts = nicheProducts[lowerNiche] || nicheProducts['pet'];
  
  // Generate 20 products by repeating and varying the base products
  const products: Product[] = [];
  for (let i = 0; i < 20; i++) {
    const baseProduct = selectedProducts[i % selectedProducts.length];
    const variation = Math.floor(i / selectedProducts.length) + 1;
    products.push({
      ...baseProduct,
      title: variation > 1 ? `${baseProduct.title} v${variation}` : baseProduct.title,
      price: baseProduct.price + (Math.random() * 20 - 10), // Add some price variation
      variants: baseProduct.variants.map(variant => ({
        ...variant,
        sku: `${variant.sku}-${i + 1}`
      }))
    });
  }
  
  return products;
};

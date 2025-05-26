
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
    console.log('Access token length:', accessToken?.length);
    
    // Generate 20 winning products using ChatGPT API
    const products = await generateWinningProducts(userNiche);
    
    if (!products || products.length === 0) {
      console.error('No products generated');
      return false;
    }
    
    // Extract store name properly from URL
    let storeName = shopifyUrl;
    if (shopifyUrl.includes('.myshopify.com')) {
      storeName = shopifyUrl.replace('https://', '').replace('http://', '').replace('.myshopify.com', '');
    } else if (shopifyUrl.includes('admin.shopify.com/store/')) {
      storeName = shopifyUrl.split('/store/')[1];
    }
    
    const shopifyApiUrl = `https://${storeName}.myshopify.com/admin/api/2023-10/products.json`;
    
    console.log('Adding products to Shopify store:', shopifyApiUrl);
    console.log('Store name extracted:', storeName);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      onProgress(((i + 1) / products.length) * 100, product.title);
      
      console.log(`Adding product ${i + 1}:`, product.title);
      
      // Add product to Shopify store
      const response = await fetch(shopifyApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({
          product: {
            title: product.title,
            body_html: product.description,
            vendor: 'StoreForge AI',
            product_type: userNiche || 'General',
            handle: product.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            images: product.images.map(url => ({ src: url })),
            variants: product.variants.map(variant => ({
              title: variant.title,
              price: variant.price.toString(),
              sku: variant.sku,
              inventory_management: 'shopify',
              inventory_quantity: 100,
            })),
          },
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to add product ${product.title}:`, response.status, errorText);
        
        // Try to parse error for better debugging
        try {
          const errorJson = JSON.parse(errorText);
          console.error('Shopify API error details:', errorJson);
        } catch (e) {
          console.error('Raw error response:', errorText);
        }
      } else {
        const responseData = await response.json();
        console.log(`Successfully added product: ${product.title}`, responseData);
      }
      
      // Wait a bit between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return true;
  } catch (error) {
    console.error('Error adding products to Shopify:', error);
    return false;
  }
};

const generateWinningProducts = async (niche: string): Promise<Product[]> => {
  try {
    console.log('Generating products for niche:', niche);
    
    const response = await fetch('/api/generate-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        niche: niche,
      }),
    });
    
    if (!response.ok) {
      console.error('API request failed:', response.status);
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Generated products response:', data);
    
    if (data.success && data.products) {
      // Convert the products to the expected format
      return data.products.map((product: any, index: number) => ({
        title: product.title || `${niche} Product ${index + 1}`,
        description: product.description || `High-quality ${niche.toLowerCase()} product`,
        price: product.price || (Math.random() * 80 + 20),
        images: [`https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop`],
        variants: [
          {
            title: 'Default Title',
            price: product.price || (Math.random() * 80 + 20),
            sku: `${product.title?.replace(/\s+/g, '-').toUpperCase() || 'PRODUCT'}-${index + 1}`
          }
        ]
      }));
    }
    
    throw new Error('Invalid response from product generation API');
  } catch (error) {
    console.error('Error generating products:', error);
    
    // Fallback to niche-specific predefined products
    return getFallbackProducts(niche);
  }
};

const getFallbackProducts = (niche: string): Product[] => {
  const nicheProducts: Record<string, Product[]> = {
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
      },
      {
        title: "Silicone Cooking Utensil Set",
        description: "Heat-resistant silicone cooking utensils with wooden handles. Safe for non-stick cookware.",
        price: 24.99,
        images: ["https://images.unsplash.com/photo-1556909114-4f0e0f5d1b5a?w=500"],
        variants: [
          { title: "6-piece set", price: 24.99, sku: "SCUS-6PC-001" },
          { title: "10-piece set", price: 34.99, sku: "SCUS-10PC-001" }
        ]
      }
    ],
    'pets': [
      {
        title: "Smart Pet Feeder with Camera",
        description: "Automatic pet feeder with HD camera, voice recording, and smartphone app control.",
        price: 89.99,
        images: ["https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500"],
        variants: [
          { title: "White", price: 89.99, sku: "SPF-WHITE-001" },
          { title: "Black", price: 89.99, sku: "SPF-BLACK-001" }
        ]
      }
    ]
  };

  const lowerNiche = niche.toLowerCase();
  const selectedProducts = nicheProducts[lowerNiche] || nicheProducts['kitchen'];
  
  // Generate 20 products by repeating and varying the base products
  const products: Product[] = [];
  for (let i = 0; i < 20; i++) {
    const baseProduct = selectedProducts[i % selectedProducts.length];
    products.push({
      ...baseProduct,
      title: `${baseProduct.title} ${Math.floor(i / selectedProducts.length) + 1}`,
      price: baseProduct.price + (Math.random() * 20 - 10), // Add some price variation
      variants: baseProduct.variants.map(variant => ({
        ...variant,
        sku: `${variant.sku}-${i + 1}`
      }))
    });
  }
  
  return products;
};

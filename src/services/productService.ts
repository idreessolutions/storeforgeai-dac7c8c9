
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
  onProgress: (progress: number, currentProduct: string) => void
): Promise<boolean> => {
  try {
    // Generate 20 winning products using ChatGPT API
    const products = await generateWinningProducts();
    
    const storeName = shopifyUrl.replace('.myshopify.com', '');
    const shopifyApiUrl = `https://${storeName}.myshopify.com/admin/api/2023-10/products.json`;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      onProgress(((i + 1) / products.length) * 100, product.title);
      
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
            product_type: 'Electronics',
            handle: product.title.toLowerCase().replace(/\s+/g, '-'),
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
        console.error(`Failed to add product ${product.title}:`, await response.text());
      }
      
      // Wait a bit between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return true;
  } catch (error) {
    console.error('Error adding products to Shopify:', error);
    return false;
  }
};

const generateWinningProducts = async (): Promise<Product[]> => {
  const apiKey = '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';
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Generate 20 winning e-commerce products with complete details. Return as JSON array with title, description, price, images (URLs), and variants.'
          },
          {
            role: 'user',
            content: 'Generate 20 trending, winning products for dropshipping with all details including product images, descriptions, prices, and variants.'
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });
    
    const data = await response.json();
    const productsData = JSON.parse(data.choices[0].message.content);
    
    return productsData;
  } catch (error) {
    console.error('Error generating products with ChatGPT:', error);
    
    // Fallback to predefined products if API fails
    return getFallbackProducts();
  }
};

const getFallbackProducts = (): Product[] => {
  return [
    {
      title: "Smart Wireless Earbuds Pro",
      description: "Premium wireless earbuds with noise cancellation and 24-hour battery life. Perfect for music lovers and professionals.",
      price: 89.99,
      images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500"],
      variants: [
        { title: "Black", price: 89.99, sku: "SWE-BLACK-001" },
        { title: "White", price: 89.99, sku: "SWE-WHITE-001" }
      ]
    },
    {
      title: "LED Strip Lights RGB",
      description: "Smart LED strip lights with app control, 16 million colors, and music sync. Transform any space instantly.",
      price: 34.99,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"],
      variants: [
        { title: "5 meters", price: 34.99, sku: "LED-5M-001" },
        { title: "10 meters", price: 59.99, sku: "LED-10M-001" }
      ]
    },
    // Add 18 more products...
  ];
};

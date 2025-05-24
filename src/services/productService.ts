
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
    
    // Generate 20 winning products using ChatGPT API
    const products = await generateWinningProducts(userNiche);
    
    if (!products || products.length === 0) {
      console.error('No products generated');
      return false;
    }
    
    const storeName = shopifyUrl.replace('.myshopify.com', '');
    const shopifyApiUrl = `https://${storeName}.myshopify.com/admin/api/2023-10/products.json`;
    
    console.log('Adding products to Shopify store:', shopifyApiUrl);
    
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
            product_type: 'General',
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
        console.error(`Failed to add product ${product.title}:`, errorText);
      } else {
        console.log(`Successfully added product: ${product.title}`);
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

const generateWinningProducts = async (niche: string): Promise<Product[]> => {
  const apiKey = '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';
  
  try {
    console.log('Generating products for niche:', niche);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Generate 20 winning e-commerce products specifically for the ${niche} niche. Return as a valid JSON array with title, description, price, images (use real product image URLs from unsplash), and variants. Make sure all products are highly relevant to ${niche} and have proven market demand.`
          },
          {
            role: 'user',
            content: `Generate 20 trending, winning products for dropshipping in the ${niche} niche with all details including product images, descriptions, competitive prices, and variants. Focus on products that are currently selling well in this specific niche.`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('OpenAI response received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response from OpenAI');
    }
    
    const content = data.choices[0].message.content;
    console.log('Raw content:', content);
    
    // Clean the content to extract JSON
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON array found in response');
      throw new Error('No valid JSON found in response');
    }
    
    const productsData = JSON.parse(jsonMatch[0]);
    console.log('Generated products:', productsData.length);
    
    return productsData;
  } catch (error) {
    console.error('Error generating products with ChatGPT:', error);
    
    // Fallback to niche-specific predefined products
    return getFallbackProducts(niche);
  }
};

const getFallbackProducts = (niche: string): Product[] => {
  const nicheProducts: Record<string, Product[]> = {
    'pets': [
      {
        title: "Smart Pet Feeder with Camera",
        description: "Automatic pet feeder with HD camera, voice recording, and smartphone app control. Perfect for busy pet owners.",
        price: 89.99,
        images: ["https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500"],
        variants: [
          { title: "White", price: 89.99, sku: "SPF-WHITE-001" },
          { title: "Black", price: 89.99, sku: "SPF-BLACK-001" }
        ]
      },
      {
        title: "Interactive Dog Puzzle Toy",
        description: "Mental stimulation puzzle toy that keeps dogs engaged and entertained for hours. Reduces anxiety and boredom.",
        price: 24.99,
        images: ["https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=500"],
        variants: [
          { title: "Level 1", price: 24.99, sku: "DPT-L1-001" },
          { title: "Level 2", price: 29.99, sku: "DPT-L2-001" }
        ]
      }
    ],
    'electronics': [
      {
        title: "Wireless Charging Station 3-in-1",
        description: "Fast wireless charging station for phone, watch, and earbuds. Compatible with all Qi-enabled devices.",
        price: 49.99,
        images: ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500"],
        variants: [
          { title: "White", price: 49.99, sku: "WCS-WHITE-001" },
          { title: "Black", price: 49.99, sku: "WCS-BLACK-001" }
        ]
      },
      {
        title: "Bluetooth Gaming Headset",
        description: "Premium gaming headset with 7.1 surround sound, noise cancellation, and RGB lighting.",
        price: 79.99,
        images: ["https://images.unsplash.com/photo-1599669454699-248893623440?w=500"],
        variants: [
          { title: "Black/Red", price: 79.99, sku: "BGH-BR-001" },
          { title: "Black/Blue", price: 79.99, sku: "BGH-BB-001" }
        ]
      }
    ]
  };

  const lowerNiche = niche.toLowerCase();
  
  // Return niche-specific products or general fallback
  if (nicheProducts[lowerNiche]) {
    return nicheProducts[lowerNiche];
  }

  // General fallback products
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
    }
  ];
};

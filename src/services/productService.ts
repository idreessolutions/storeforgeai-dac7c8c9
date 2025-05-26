
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
    
    // Generate 20 winning products directly
    const products = generateProducts(userNiche);
    console.log(`Generated ${products.length} products, starting Shopify upload`);
    
    // Extract store name from various URL formats
    let storeName = '';
    if (shopifyUrl.includes('admin.shopify.com/store/')) {
      storeName = shopifyUrl.split('/store/')[1];
    } else if (shopifyUrl.includes('.myshopify.com')) {
      storeName = shopifyUrl.replace('https://', '').replace('http://', '').replace('.myshopify.com', '');
    } else {
      // Assume it's just the store name
      storeName = shopifyUrl.replace('https://', '').replace('http://', '');
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
        
        console.log('Sending product to Shopify:', productPayload.product.title);
        
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

// Generate products directly without external API calls
const generateProducts = (niche: string): Product[] => {
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
      },
      {
        title: "Pet GPS Tracker Collar",
        description: "Real-time GPS tracking collar for dogs and cats. Monitor your pet's location and activity levels throughout the day.",
        price: 59.99,
        images: ["https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=500&fit=crop"],
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
        images: ["https://images.unsplash.com/photo-1601758067099-4ea6f2b2ced9?w=500&h=500&fit=crop"],
        variants: [
          { title: "For Cats", price: 19.99, sku: "APG-CAT-001" },
          { title: "For Dogs", price: 22.99, sku: "APG-DOG-001" }
        ]
      },
      {
        title: "Pet Training Clicker Set",
        description: "Professional dog training clicker with wrist strap. Includes comprehensive training guide and treat pouch for effective training sessions.",
        price: 12.99,
        images: ["https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop"],
        variants: [
          { title: "Blue Set", price: 12.99, sku: "PTC-BLUE-001" },
          { title: "Red Set", price: 12.99, sku: "PTC-RED-001" }
        ]
      },
      {
        title: "Elevated Pet Food Bowls",
        description: "Ergonomic raised feeding station that promotes better digestion and reduces neck strain. Perfect for senior pets or those with joint issues.",
        price: 39.99,
        images: ["https://images.unsplash.com/photo-1589927986089-35812388d1e4?w=500&h=500&fit=crop"],
        variants: [
          { title: "Small (8 inches)", price: 39.99, sku: "EPF-S-001" },
          { title: "Medium (12 inches)", price: 44.99, sku: "EPF-M-001" },
          { title: "Large (16 inches)", price: 49.99, sku: "EPF-L-001" }
        ]
      },
      {
        title: "Pet Hair Remover Tool",
        description: "Reusable lint and pet hair remover for furniture, clothes, and car seats. Chemical-free solution that works on all fabric types.",
        price: 14.99,
        images: ["https://images.unsplash.com/photo-1583512603806-077998240c7a?w=500&h=500&fit=crop"],
        variants: [
          { title: "Single Tool", price: 14.99, sku: "PHR-SINGLE-001" },
          { title: "2-Pack", price: 24.99, sku: "PHR-2PACK-001" }
        ]
      },
      {
        title: "Smart Pet Door with App Control",
        description: "Programmable pet door with smartphone control. Set schedules, monitor pet activity, and control access remotely through the mobile app.",
        price: 129.99,
        images: ["https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=500&fit=crop"],
        variants: [
          { title: "Small (for cats)", price: 129.99, sku: "SPD-S-001" },
          { title: "Medium (small dogs)", price: 149.99, sku: "SPD-M-001" },
          { title: "Large (large dogs)", price: 179.99, sku: "SPD-L-001" }
        ]
      },
      {
        title: "Pet Calming Anxiety Vest",
        description: "Therapeutic pressure vest that helps reduce pet anxiety during storms, fireworks, and travel. Made with breathable, comfortable fabric.",
        price: 29.99,
        images: ["https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=500&fit=crop"],
        variants: [
          { title: "XS", price: 29.99, sku: "PCA-XS-001" },
          { title: "Small", price: 29.99, sku: "PCA-S-001" },
          { title: "Medium", price: 34.99, sku: "PCA-M-001" },
          { title: "Large", price: 39.99, sku: "PCA-L-001" },
          { title: "XL", price: 44.99, sku: "PCA-XL-001" }
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
      },
      {
        title: "Silicone Cooking Utensil Set",
        description: "Complete set of heat-resistant silicone cooking utensils. Non-stick friendly and dishwasher safe.",
        price: 24.99,
        images: ["https://images.unsplash.com/photo-1584286595398-c4fdb5ab4a5b?w=500"],
        variants: [
          { title: "5-Piece Set", price: 24.99, sku: "SCU-5PC-001" },
          { title: "10-Piece Set", price: 39.99, sku: "SCU-10PC-001" }
        ]
      },
      {
        title: "Multi-Use Pressure Cooker",
        description: "Electric pressure cooker with multiple cooking functions. Perfect for quick, healthy meals.",
        price: 79.99,
        images: ["https://images.unsplash.com/photo-1585515656963-05cc7a2a7c0f?w=500"],
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
        images: ["https://images.unsplash.com/photo-1609592388907-a2b48db523c3?w=500"],
        variants: [
          { title: "10W Fast Charge", price: 29.99, sku: "WCP-10W-001" },
          { title: "15W Ultra Fast", price: 39.99, sku: "WCP-15W-001" }
        ]
      },
      {
        title: "Bluetooth Earbuds Pro",
        description: "Premium noise-cancelling wireless earbuds with long battery life and crystal clear sound quality.",
        price: 79.99,
        images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500"],
        variants: [
          { title: "Black", price: 79.99, sku: "BEP-BLACK-001" },
          { title: "White", price: 79.99, sku: "BEP-WHITE-001" }
        ]
      },
      {
        title: "Smart LED Strip Lights",
        description: "RGB LED strips with smartphone app control, music sync, and voice assistant compatibility.",
        price: 34.99,
        images: ["https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500"],
        variants: [
          { title: "16ft Strip", price: 34.99, sku: "SLS-16FT-001" },
          { title: "32ft Strip", price: 54.99, sku: "SLS-32FT-001" }
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
    const priceVariation = (Math.random() * 10 - 5); // ±$5 variation
    
    products.push({
      ...baseProduct,
      title: variation > 1 ? `${baseProduct.title} v${variation}` : baseProduct.title,
      price: Math.max(baseProduct.price + priceVariation, 5), // Ensure minimum $5 price
      variants: baseProduct.variants.map(variant => ({
        ...variant,
        sku: `${variant.sku}-${i + 1}`,
        price: Math.max(variant.price + priceVariation, 5)
      }))
    });
  }
  
  return products;
};

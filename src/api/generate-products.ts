
export async function POST(request: Request) {
  try {
    const { niche } = await request.json();
    
    console.log('Generate products API called with niche:', niche);
    
    // Generate products based on niche - now limited to 10 products
    const products = generateProductsForNiche(niche);
    
    console.log(`Generated ${products.length} products for ${niche} niche`);
    
    return new Response(JSON.stringify({
      success: true,
      products: products
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error in product generation API:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to generate products'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function generateProductsForNiche(niche: string) {
  const baseProducts = {
    'pet': [
      { title: 'Smart Pet Feeder with Camera', description: 'Automatic pet feeder with HD camera, voice recording, and smartphone app control. Perfect for busy pet parents.', price: 89.99 },
      { title: 'Interactive Dog Puzzle Toy', description: 'Mental stimulation puzzle toy that keeps dogs engaged and reduces anxiety. Multiple difficulty levels.', price: 24.99 },
      { title: 'Cat Water Fountain', description: 'Fresh flowing water dispenser with filtration system. Encourages healthy hydration for cats.', price: 34.99 },
      { title: 'Pet GPS Tracker Collar', description: 'Real-time GPS tracking collar for dogs and cats. Monitor your pet\'s location and activity levels.', price: 59.99 },
      { title: 'Automatic Pet Grooming Brush', description: 'Self-cleaning slicker brush that removes loose fur and reduces shedding. One-click hair removal.', price: 19.99 },
      { title: 'Pet Training Clicker Set', description: 'Professional dog training clicker with wrist strap. Includes training guide and treat pouch.', price: 12.99 },
      { title: 'Elevated Pet Food Bowls', description: 'Ergonomic raised feeding station that promotes better digestion and reduces neck strain.', price: 39.99 },
      { title: 'Pet Hair Remover Tool', description: 'Reusable lint and pet hair remover for furniture, clothes, and car seats. Chemical-free solution.', price: 14.99 },
      { title: 'Smart Pet Door with App Control', description: 'Programmable pet door with smartphone control. Set schedules and monitor pet activity.', price: 129.99 },
      { title: 'Pet Calming Anxiety Vest', description: 'Therapeutic pressure vest that helps reduce pet anxiety during storms, fireworks, and travel.', price: 29.99 }
    ],
    'kitchen': [
      { title: 'Smart Kitchen Scale', description: 'Precision digital scale with app connectivity', price: 39.99 },
      { title: 'Silicone Cooking Set', description: 'Heat-resistant cooking utensils', price: 24.99 },
      { title: 'Multi-Use Pressure Cooker', description: 'Electric pressure cooker with multiple functions', price: 79.99 },
      { title: 'Air Fryer Oven Combo', description: 'Multi-function air fryer and toaster oven', price: 149.99 },
      { title: 'Smart Coffee Maker', description: 'WiFi-enabled programmable coffee maker', price: 89.99 },
      { title: 'Herb Garden Kit', description: 'Indoor hydroponic herb growing system', price: 59.99 },
      { title: 'Non-Stick Pan Set', description: 'Professional grade non-stick cookware set', price: 119.99 },
      { title: 'Food Storage Containers', description: 'Airtight glass food storage container set', price: 34.99 },
      { title: 'Electric Spice Grinder', description: 'Powerful spice and coffee grinder', price: 29.99 },
      { title: 'Silicone Baking Mats', description: 'Reusable non-stick baking mat set', price: 19.99 }
    ],
    'electronics': [
      { title: 'Wireless Charging Pad', description: 'Fast wireless charger for smartphones', price: 29.99 },
      { title: 'Bluetooth Earbuds Pro', description: 'Noise-cancelling wireless earbuds', price: 79.99 },
      { title: 'Smart LED Strip', description: 'RGB LED strips with app control', price: 34.99 },
      { title: 'Portable Power Bank', description: 'High-capacity portable battery charger', price: 49.99 },
      { title: 'Smart Watch Fitness Tracker', description: 'Advanced fitness tracking smartwatch', price: 199.99 },
      { title: 'Bluetooth Speaker', description: 'Waterproof portable Bluetooth speaker', price: 59.99 },
      { title: 'USB-C Hub', description: 'Multi-port USB-C hub with HDMI', price: 39.99 },
      { title: 'Ring Light for Video', description: 'LED ring light for content creation', price: 24.99 },
      { title: 'Smart Home Security Camera', description: 'WiFi security camera with night vision', price: 89.99 },
      { title: 'Phone Car Mount', description: 'Magnetic phone holder for car dashboard', price: 16.99 }
    ]
  };

  const nicheProducts = baseProducts[niche.toLowerCase()] || baseProducts['pet'];
  
  // Generate exactly 10 products
  const products = [];
  for (let i = 0; i < 10; i++) {
    const base = nicheProducts[i % nicheProducts.length];
    const variation = Math.floor(i / nicheProducts.length) + 1;
    products.push({
      title: variation > 1 ? `${base.title} v${variation}` : base.title,
      description: base.description,
      price: base.price + (Math.random() * 20 - 10), // Add price variation
      category: niche
    });
  }
  
  return products;
}

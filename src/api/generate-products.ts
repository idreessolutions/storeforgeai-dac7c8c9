
export async function POST(request: Request) {
  try {
    const { niche } = await request.json();
    
    // Simple product generation based on niche
    const products = generateProductsForNiche(niche);
    
    return new Response(JSON.stringify({
      success: true,
      products: products
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error in product generation:', error);
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

function generateProductsForNiche(niche: string) {
  const baseProducts = {
    'kitchen': [
      { title: 'Smart Kitchen Scale', description: 'Precision digital scale with app connectivity', price: 39.99 },
      { title: 'Silicone Cooking Set', description: 'Heat-resistant cooking utensils', price: 24.99 },
      { title: 'Multi-Use Pressure Cooker', description: 'Electric pressure cooker with multiple functions', price: 79.99 }
    ],
    'pets': [
      { title: 'Smart Pet Feeder', description: 'Automatic feeder with camera and app control', price: 89.99 },
      { title: 'Interactive Dog Toy', description: 'Mental stimulation puzzle for dogs', price: 24.99 },
      { title: 'Cat Water Fountain', description: 'Fresh flowing water dispenser', price: 34.99 }
    ],
    'electronics': [
      { title: 'Wireless Charging Pad', description: 'Fast wireless charger for smartphones', price: 29.99 },
      { title: 'Bluetooth Earbuds Pro', description: 'Noise-cancelling wireless earbuds', price: 79.99 },
      { title: 'Smart LED Strip', description: 'RGB LED strips with app control', price: 34.99 }
    ]
  };

  const nicheProducts = baseProducts[niche.toLowerCase()] || baseProducts['electronics'];
  
  // Generate 20 products
  const products = [];
  for (let i = 0; i < 20; i++) {
    const base = nicheProducts[i % nicheProducts.length];
    products.push({
      title: `${base.title} ${Math.floor(i / nicheProducts.length) + 1}`,
      description: base.description,
      price: base.price + (Math.random() * 20 - 10)
    });
  }
  
  return products;
}

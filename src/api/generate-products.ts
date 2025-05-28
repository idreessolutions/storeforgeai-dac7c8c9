
export async function POST(request: Request) {
  try {
    const { niche } = await request.json();
    
    console.log('Generate products API called with niche:', niche);
    
    // Generate exactly 10 winning products based on niche
    const products = generateProductsForNiche(niche);
    
    console.log(`Generated ${products.length} winning products for ${niche} niche`);
    
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
      { title: 'Smart Pet Feeder with HD Camera & Voice Recording', description: 'Revolutionary automatic pet feeder with crystal-clear HD camera, two-way audio, and smartphone app control. Schedule meals remotely, monitor your pet in real-time, and never worry about feeding time again. Features portion control, food level alerts, and secure cloud storage for video recordings.', price: 89.99 },
      { title: 'Interactive Mental Stimulation Puzzle Toy for Dogs', description: 'Keep your dog mentally engaged and reduce destructive behavior with this award-winning puzzle toy. Features adjustable difficulty levels, treat-dispensing compartments, and non-slip base. Made from premium, pet-safe materials that withstand heavy play. Veterinarian recommended for anxiety reduction.', price: 34.99 },
      { title: 'Premium Cat Water Fountain with Triple Filtration', description: 'Encourage healthy hydration with this premium water fountain featuring triple filtration system. Ultra-quiet pump, LED water level indicator, and dishwasher-safe components. Perfect for cats and small dogs. Reduces kidney disease risk and keeps water fresh for days.', price: 49.99 },
      { title: 'GPS Pet Tracker Collar with Real-Time Monitoring', description: 'Never lose your pet again with this advanced GPS tracking collar. Real-time location updates, activity monitoring, safe zone alerts, and waterproof design. Long-lasting battery with smartphone notifications. Peace of mind for pet parents everywhere.', price: 79.99 },
      { title: 'Professional Pet Grooming Brush - Self-Cleaning', description: 'Transform grooming time with this professional-grade self-cleaning brush. Reduces shedding by 95%, gentle on skin, and features one-click hair removal. Suitable for all coat types. Veterinarian recommended for maintaining healthy fur and reducing allergens.', price: 24.99 },
      { title: 'Orthopedic Memory Foam Pet Bed', description: 'Give your pet the comfort they deserve with this premium orthopedic bed. Medical-grade memory foam, removable washable cover, and non-slip bottom. Perfect for senior pets, joint support, and better sleep quality. Available in multiple sizes and colors.', price: 69.99 },
      { title: 'Interactive Treat Dispensing Ball', description: 'Keep pets mentally stimulated and physically active with this innovative treat-dispensing ball. Adjustable difficulty levels, durable construction, and perfect for reducing boredom. Helps with weight management and provides hours of entertainment.', price: 19.99 },
      { title: 'Premium Pet Car Safety Harness', description: 'Ensure your pet\'s safety during car travel with this crash-tested safety harness. Adjustable straps, padded chest protection, and easy attachment to seatbelts. Reduces travel anxiety and prevents distractions while driving. Available in all sizes.', price: 39.99 },
      { title: 'Smart Pet Training Collar with App Control', description: 'Transform pet training with this humane smart collar featuring vibration, sound, and remote control via smartphone app. Multiple training modes, waterproof design, and rechargeable battery. Professional trainer approved for effective, gentle training.', price: 99.99 },
      { title: 'Automatic Pet Door with RFID Technology', description: 'Grant your pet freedom with this intelligent pet door featuring RFID technology. Only opens for your pet, weatherproof seal, programmable access times, and energy efficient. Easy installation and works with existing doors. Multiple size options available.', price: 159.99 }
    ],
    'kitchen': [
      { title: 'Smart Kitchen Scale with Nutritional Tracking', description: 'Precision digital scale with smartphone connectivity and comprehensive nutritional database. Track calories, macros, and portion sizes effortlessly. Perfect for meal prep, baking, and healthy living. Features tempered glass surface and long battery life.', price: 39.99 },
      { title: 'Premium Silicone Cooking Utensil Set', description: 'Complete 12-piece silicone cooking set featuring heat-resistant utensils up to 450°F. Non-stick safe, dishwasher friendly, and ergonomic handles. Includes spatulas, spoons, tongs, and holder. Essential for modern kitchens and perfect for all cookware types.', price: 29.99 },
      { title: 'Multi-Function Electric Pressure Cooker', description: 'Revolutionary 8-in-1 pressure cooker that replaces multiple appliances. Pressure cook, slow cook, rice cooker, steamer, sauté, yogurt maker, and warmer. Saves time and counter space while creating delicious, healthy meals. Large capacity perfect for families.', price: 89.99 },
      { title: 'Countertop Air Fryer Oven Combo', description: 'Crispy, healthy cooking with 85% less oil using advanced air circulation technology. Multi-function design includes air fry, bake, roast, and reheat. Large capacity, digital controls, and easy cleanup. Perfect for healthy family meals and crispy favorites.', price: 149.99 },
      { title: 'WiFi-Enabled Programmable Coffee Maker', description: 'Wake up to perfectly brewed coffee with this smart coffee maker. Smartphone app control, programmable brewing, built-in grinder, and thermal carafe. Multiple brew strengths and sizes. Start brewing from bed and enjoy café-quality coffee at home.', price: 199.99 },
      { title: 'Hydroponic Indoor Herb Garden Kit', description: 'Grow fresh herbs year-round with this innovative hydroponic system. LED grow lights, automatic watering, and no soil required. Includes seeds for basil, cilantro, parsley, and more. Perfect for apartments and fresh cooking ingredients always available.', price: 79.99 },
      { title: 'Professional Non-Stick Cookware Set', description: 'Restaurant-quality 10-piece cookware set featuring diamond-infused non-stick coating. Induction compatible, oven safe to 500°F, and scratch resistant. Includes frying pans, saucepans, stockpot, and utensils. Perfect for professional and home cooking.', price: 299.99 },
      { title: 'Glass Food Storage Container Set', description: 'Keep food fresh longer with this 20-piece glass storage set. Airtight lids, freezer safe, microwave safe, and nested design saves space. BPA-free, stain resistant, and perfect for meal prep. Includes various sizes for all storage needs.', price: 49.99 },
      { title: 'High-Speed Spice and Coffee Grinder', description: 'Powerful electric grinder perfect for spices, coffee beans, nuts, and herbs. Stainless steel blades, compact design, and easy one-touch operation. Removable grinding cup for easy cleaning. Essential for fresh flavors and aromatic coffee.', price: 34.99 },
      { title: 'Reusable Silicone Baking Mat Set', description: 'Replace parchment paper forever with these premium silicone baking mats. Non-stick surface, heat resistant to 480°F, and dishwasher safe. Includes multiple sizes for cookies, pastries, and sheet pan meals. Eco-friendly and saves money on disposables.', price: 24.99 }
    ],
    'electronics': [
      { title: 'Fast Wireless Charging Pad with Cooling', description: 'Charge your devices 40% faster with this advanced wireless charging pad featuring built-in cooling fan. Compatible with all Qi-enabled devices, LED indicators, and overheat protection. Sleek design perfect for office or bedside table.', price: 34.99 },
      { title: 'Premium Noise-Cancelling Bluetooth Earbuds', description: 'Experience studio-quality sound with advanced active noise cancellation. 8-hour battery life, water resistance, and crystal-clear calls. Perfect for commuting, workouts, and professional calls. Includes wireless charging case and multiple ear tip sizes.', price: 129.99 },
      { title: 'RGB LED Strip Lights with Music Sync', description: 'Transform any space with these smart LED strips featuring music synchronization and 16 million colors. App control, voice assistant compatibility, and easy installation. Perfect for gaming setups, room ambiance, and parties. Includes adhesive backing and connectors.', price: 39.99 },
      { title: 'Ultra-Capacity Portable Power Bank', description: 'Never run out of power with this 30,000mAh power bank featuring fast charging technology. Charge multiple devices simultaneously, digital display, and built-in safety features. Perfect for travel, camping, and emergency backup power.', price: 59.99 },
      { title: 'Advanced Fitness Tracking Smartwatch', description: 'Monitor your health 24/7 with this feature-packed smartwatch. Heart rate monitoring, sleep tracking, GPS, water resistance, and 14-day battery life. Includes multiple sport modes, smartphone notifications, and health insights. Perfect for active lifestyles.', price: 249.99 },
      { title: 'Waterproof Portable Bluetooth Speaker', description: 'Take your music anywhere with this rugged Bluetooth speaker. 360-degree sound, 24-hour battery life, and IPX7 water resistance. Perfect for beach, pool, camping, and outdoor adventures. Includes voice assistant and hands-free calling.', price: 79.99 },
      { title: 'Multi-Port USB-C Hub with 4K HDMI', description: 'Expand your laptop connectivity with this premium USB-C hub. Features 4K HDMI output, multiple USB ports, SD card reader, and fast charging passthrough. Compact aluminum design perfect for MacBook and modern laptops. Essential for productivity.', price: 49.99 },
      { title: 'Professional LED Ring Light for Content', description: 'Create professional-quality content with this adjustable LED ring light. Dimmable brightness, color temperature control, and smartphone mount included. Perfect for video calls, streaming, photography, and social media content creation.', price: 34.99 },
      { title: 'AI-Powered Security Camera with Night Vision', description: 'Protect your home with this intelligent security camera featuring AI person detection, full-color night vision, and cloud storage. Two-way audio, motion alerts, and smartphone app control. Weather resistant for indoor and outdoor use.', price: 99.99 },
      { title: 'Magnetic Wireless Car Phone Mount', description: 'Secure your phone safely while driving with this magnetic wireless charging mount. Strong magnetic hold, 360-degree rotation, and fast wireless charging. Compatible with all phone sizes and includes dashboard and vent mounting options.', price: 29.99 }
    ]
  };

  const nicheProducts = baseProducts[niche.toLowerCase()] || baseProducts['pet'];
  
  // Return exactly 10 products
  return nicheProducts.slice(0, 10).map((product, index) => ({
    ...product,
    price: product.price + (Math.random() * 10 - 5), // Add small price variation
    category: niche
  }));
}

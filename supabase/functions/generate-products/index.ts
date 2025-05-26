
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { niche } = await req.json();

    console.log('Generate products request:', { niche });

    // If OpenAI API key is available, use it for better product generation
    if (openAIApiKey) {
      try {
        console.log('Using OpenAI API for product generation...');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are a product specialist. Generate 20 winning product ideas for the ${niche} niche. For each product, provide: title, description, price, and category. Return as JSON array with these exact fields: title, description, price, category. Make sure the JSON is valid and properly formatted. Focus on trending, profitable products that would sell well in dropshipping.`
              },
              {
                role: 'user',
                content: `Generate 20 winning products for the ${niche} niche that would sell well in an e-commerce store. Return only the JSON array, no additional text.`
              }
            ],
            temperature: 0.7,
            max_tokens: 3000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('OpenAI response received');
          
          const productsText = data.choices[0].message.content;
          
          // Parse the JSON response
          try {
            const cleanedText = productsText.replace(/```json\n?|\n?```/g, '').trim();
            const products = JSON.parse(cleanedText);
            console.log(`Successfully parsed ${products.length} products from OpenAI`);
            
            return new Response(JSON.stringify({ 
              success: true, 
              products: products,
              message: `Successfully generated ${products.length} ${niche} products using AI`
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } catch (e) {
            console.error('JSON parsing failed, falling back to predefined products:', e);
          }
        } else {
          console.error('OpenAI API error, falling back to predefined products');
        }
      } catch (error) {
        console.error('OpenAI request failed, falling back to predefined products:', error);
      }
    }

    // Fallback to predefined products if OpenAI is not available or fails
    console.log('Using predefined products for', niche);
    const products = generatePredefinedProducts(niche);

    return new Response(JSON.stringify({ 
      success: true, 
      products: products,
      message: `Successfully generated ${products.length} ${niche} products`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-products function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generatePredefinedProducts(niche: string) {
  const productTemplates = {
    'pet': [
      { title: 'Smart Pet Feeder with Camera', description: 'Automatic pet feeder with HD camera, voice recording, and smartphone app control. Perfect for busy pet parents.', price: 89.99, category: 'Pet Tech' },
      { title: 'Interactive Dog Puzzle Toy', description: 'Mental stimulation puzzle toy that keeps dogs engaged and reduces anxiety. Multiple difficulty levels.', price: 24.99, category: 'Pet Toys' },
      { title: 'Cat Water Fountain', description: 'Fresh flowing water dispenser with filtration system. Encourages healthy hydration for cats.', price: 34.99, category: 'Pet Care' },
      { title: 'Pet GPS Tracker Collar', description: 'Real-time GPS tracking collar for dogs and cats. Monitor your pet\'s location and activity levels.', price: 59.99, category: 'Pet Safety' },
      { title: 'Automatic Pet Grooming Brush', description: 'Self-cleaning slicker brush that removes loose fur and reduces shedding. One-click hair removal.', price: 19.99, category: 'Pet Grooming' },
      { title: 'Pet Training Clicker Set', description: 'Professional dog training clicker with wrist strap. Includes training guide and treat pouch.', price: 12.99, category: 'Pet Training' },
      { title: 'Elevated Pet Food Bowls', description: 'Ergonomic raised feeding station that promotes better digestion and reduces neck strain.', price: 39.99, category: 'Pet Feeding' },
      { title: 'Pet Hair Remover Tool', description: 'Reusable lint and pet hair remover for furniture, clothes, and car seats. Chemical-free solution.', price: 14.99, category: 'Pet Cleaning' },
      { title: 'Smart Pet Door with App Control', description: 'Programmable pet door with smartphone control. Set schedules and monitor pet activity.', price: 129.99, category: 'Pet Tech' },
      { title: 'Pet Calming Anxiety Vest', description: 'Therapeutic pressure vest that helps reduce pet anxiety during storms, fireworks, and travel.', price: 29.99, category: 'Pet Wellness' }
    ],
    'kitchen': [
      { title: 'Smart Kitchen Scale', description: 'Precision digital scale with app connectivity', price: 39.99, category: 'Kitchen Tech' },
      { title: 'Silicone Cooking Set', description: 'Heat-resistant cooking utensils', price: 24.99, category: 'Cooking Tools' },
      { title: 'Multi-Use Pressure Cooker', description: 'Electric pressure cooker with multiple functions', price: 79.99, category: 'Appliances' }
    ],
    'electronics': [
      { title: 'Wireless Charging Pad', description: 'Fast wireless charger for smartphones', price: 29.99, category: 'Mobile Accessories' },
      { title: 'Bluetooth Earbuds Pro', description: 'Noise-cancelling wireless earbuds', price: 79.99, category: 'Audio' },
      { title: 'Smart LED Strip', description: 'RGB LED strips with app control', price: 34.99, category: 'Smart Home' }
    ]
  };

  const nicheProducts = productTemplates[niche.toLowerCase()] || productTemplates['pet'];
  
  // Generate 20 products by cycling through the templates
  const products = [];
  for (let i = 0; i < 20; i++) {
    const base = nicheProducts[i % nicheProducts.length];
    const variation = Math.floor(i / nicheProducts.length) + 1;
    products.push({
      title: variation > 1 ? `${base.title} v${variation}` : base.title,
      description: base.description,
      price: Math.round((base.price + (Math.random() * 20 - 10)) * 100) / 100, // Add price variation
      category: base.category
    });
  }
  
  return products;
}

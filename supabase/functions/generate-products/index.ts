
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

    // Use OpenAI API for better product generation
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
                content: `You are a dropshipping product specialist. Generate exactly 5 winning product ideas for the ${niche} niche that are trending and profitable. Each product should have realistic pricing and detailed descriptions that convert well. Return as a valid JSON array with objects containing: title, description, price, images (array of Unsplash URLs), variants (array with title, price, sku fields), handle, product_type, vendor, and tags. Focus on products that are currently trending and have high profit margins.`
              },
              {
                role: 'user',
                content: `Generate 5 winning dropshipping products for the ${niche} niche. Include realistic Unsplash image URLs and product variants. Return only valid JSON, no additional text.`
              }
            ],
            temperature: 0.7,
            max_tokens: 4000,
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
            
            // Ensure each product has the required structure
            const formattedProducts = products.map((product, index) => ({
              title: product.title || `${niche} Product ${index + 1}`,
              description: product.description || 'High-quality product description',
              price: product.price || 29.99,
              images: product.images || [`https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&crop=center`],
              variants: product.variants || [
                { title: 'Default', price: product.price || 29.99, sku: `SKU-${index + 1}-001` }
              ],
              handle: product.handle || product.title?.toLowerCase().replace(/[^a-z0-9]/g, '-') || `product-${index + 1}`,
              product_type: product.product_type || niche,
              vendor: product.vendor || 'StoreForge AI',
              tags: product.tags || `${niche}, winning products, trending`
            }));
            
            return new Response(JSON.stringify({ 
              success: true, 
              products: formattedProducts,
              message: `Successfully generated ${formattedProducts.length} ${niche} products using AI`
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
      { 
        title: 'Smart Pet Feeder with Camera', 
        description: 'Automatic pet feeder with HD camera, voice recording, and smartphone app control. Perfect for busy pet parents who want to stay connected with their pets.',
        price: 89.99, 
        images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=500&fit=crop&crop=center'],
        variants: [
          { title: 'White', price: 89.99, sku: 'SPF-WHITE-001' },
          { title: 'Black', price: 89.99, sku: 'SPF-BLACK-001' }
        ],
        handle: 'smart-pet-feeder-with-camera',
        product_type: 'Pet Tech',
        vendor: 'StoreForge AI',
        tags: 'pet, smart home, trending'
      },
      { 
        title: 'Interactive Dog Puzzle Toy', 
        description: 'Mental stimulation puzzle toy that keeps dogs engaged and reduces anxiety. Multiple difficulty levels available to challenge your pet.',
        price: 24.99, 
        images: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=500&fit=crop&crop=center'],
        variants: [
          { title: 'Level 1', price: 24.99, sku: 'DPT-LV1-001' },
          { title: 'Level 2', price: 29.99, sku: 'DPT-LV2-001' }
        ],
        handle: 'interactive-dog-puzzle-toy',
        product_type: 'Pet Toys',
        vendor: 'StoreForge AI',
        tags: 'dog, puzzle, mental stimulation'
      },
      { 
        title: 'Cat Water Fountain', 
        description: 'Fresh flowing water dispenser with filtration system. Encourages healthy hydration for cats and keeps water clean and fresh.',
        price: 34.99, 
        images: ['https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=500&h=500&fit=crop&crop=center'],
        variants: [
          { title: '2L Capacity', price: 34.99, sku: 'CWF-2L-001' },
          { title: '3L Capacity', price: 39.99, sku: 'CWF-3L-001' }
        ],
        handle: 'cat-water-fountain',
        product_type: 'Pet Care',
        vendor: 'StoreForge AI',
        tags: 'cat, water, health'
      }
    ],
    'kitchen': [
      { 
        title: 'Smart Kitchen Scale with App', 
        description: 'Precision digital kitchen scale with smartphone connectivity and nutritional tracking.',
        price: 39.99, 
        images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&crop=center'],
        variants: [
          { title: 'White', price: 39.99, sku: 'SKS-WHITE-001' },
          { title: 'Black', price: 39.99, sku: 'SKS-BLACK-001' }
        ],
        handle: 'smart-kitchen-scale',
        product_type: 'Kitchen Tech',
        vendor: 'StoreForge AI',
        tags: 'kitchen, smart, cooking'
      }
    ]
  };

  const nicheProducts = productTemplates[niche.toLowerCase()] || productTemplates['pet'];
  return nicheProducts.slice(0, 5); // Return 5 products for better testing
}

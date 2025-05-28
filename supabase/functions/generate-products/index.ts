
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
                content: `You are a dropshipping product specialist. Generate exactly 10 winning product ideas for the ${niche} niche that are trending and highly profitable. Each product should have realistic pricing, detailed descriptions that convert well, and proper media. Return as a valid JSON array with objects containing: title, description, price, images (array of 3-4 high-quality Unsplash URLs), variants (array with title, price, sku fields), handle, product_type, vendor, and tags. Focus on products that are currently trending and have high profit margins. Make sure all images are real Unsplash URLs that work.`
              },
              {
                role: 'user',
                content: `Generate exactly 10 winning dropshipping products for the ${niche} niche. Each product must include:
                1. Compelling, SEO-optimized title
                2. High-converting description (100-150 words)
                3. Realistic pricing ($15-$150 range)
                4. 3-4 working Unsplash image URLs (format: https://images.unsplash.com/photo-...)
                5. 2-3 product variants with different prices
                6. Professional tags and product type
                7. URL-friendly handle
                
                Return only valid JSON array, no additional text. Make sure images are real Unsplash URLs.`
              }
            ],
            temperature: 0.7,
            max_tokens: 8000,
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
            
            // Ensure we have exactly 10 products and proper structure
            const formattedProducts = products.slice(0, 10).map((product, index) => ({
              title: product.title || `Premium ${niche} Product ${index + 1}`,
              description: product.description || `High-quality ${niche} product with excellent features and durability. Perfect for customers looking for reliability and style.`,
              price: product.price || (29.99 + (index * 5)),
              images: product.images && product.images.length > 0 ? product.images : [
                `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&crop=center`,
                `https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&h=500&fit=crop&crop=center`,
                `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop&crop=center`
              ],
              variants: product.variants && product.variants.length > 0 ? product.variants : [
                { title: 'Standard', price: product.price || (29.99 + (index * 5)), sku: `${niche.toUpperCase()}-STD-${index + 1}` },
                { title: 'Premium', price: (product.price || (29.99 + (index * 5))) + 10, sku: `${niche.toUpperCase()}-PREM-${index + 1}` }
              ],
              handle: product.handle || product.title?.toLowerCase().replace(/[^a-z0-9]/g, '-') || `${niche.toLowerCase()}-product-${index + 1}`,
              product_type: product.product_type || niche,
              vendor: product.vendor || 'StoreForge AI',
              tags: product.tags || `${niche}, winning products, trending, bestseller, premium quality`
            }));
            
            // Ensure we have exactly 10 products
            while (formattedProducts.length < 10) {
              const baseIndex = formattedProducts.length;
              formattedProducts.push({
                title: `Premium ${niche} Essential ${baseIndex + 1}`,
                description: `Premium quality ${niche} product designed for modern customers. Features excellent craftsmanship, durable materials, and stylish design that perfectly fits your lifestyle needs.`,
                price: 39.99 + (baseIndex * 7),
                images: [
                  `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&crop=center`,
                  `https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&h=500&fit=crop&crop=center`
                ],
                variants: [
                  { title: 'Standard', price: 39.99 + (baseIndex * 7), sku: `${niche.toUpperCase()}-STD-${baseIndex + 1}` },
                  { title: 'Deluxe', price: 49.99 + (baseIndex * 7), sku: `${niche.toUpperCase()}-DLX-${baseIndex + 1}` }
                ],
                handle: `${niche.toLowerCase()}-essential-${baseIndex + 1}`,
                product_type: niche,
                vendor: 'StoreForge AI',
                tags: `${niche}, premium, essential, bestseller, trending`
              });
            }
            
            return new Response(JSON.stringify({ 
              success: true, 
              products: formattedProducts.slice(0, 10),
              message: `Successfully generated 10 winning ${niche} products using AI`
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

    // Enhanced fallback to predefined products if OpenAI is not available or fails
    console.log('Using enhanced predefined products for', niche);
    const products = generateEnhancedProducts(niche);

    return new Response(JSON.stringify({ 
      success: true, 
      products: products,
      message: `Successfully generated 10 winning ${niche} products`
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

function generateEnhancedProducts(niche: string) {
  const productTemplates = {
    'pet': [
      { 
        title: 'Smart Pet Feeder with HD Camera & Voice Recording', 
        description: 'Revolutionary automatic pet feeder with crystal-clear HD camera, two-way audio, and smartphone app control. Schedule meals remotely, monitor your pet in real-time, and never worry about feeding time again. Features portion control, food level alerts, and secure cloud storage for video recordings.',
        price: 89.99, 
        images: [
          'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=500&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&h=500&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=500&fit=crop&crop=center'
        ],
        variants: [
          { title: 'White - 4L Capacity', price: 89.99, sku: 'SPF-WHITE-4L-001' },
          { title: 'Black - 4L Capacity', price: 89.99, sku: 'SPF-BLACK-4L-001' },
          { title: 'White - 6L Capacity', price: 109.99, sku: 'SPF-WHITE-6L-001' }
        ],
        handle: 'smart-pet-feeder-hd-camera',
        product_type: 'Pet Tech',
        vendor: 'StoreForge AI',
        tags: 'pet feeder, smart home, pet camera, automatic feeding, trending, bestseller'
      },
      { 
        title: 'Interactive Mental Stimulation Puzzle Toy for Dogs', 
        description: 'Keep your dog mentally engaged and reduce destructive behavior with this award-winning puzzle toy. Features adjustable difficulty levels, treat-dispensing compartments, and non-slip base. Made from premium, pet-safe materials that withstand heavy play. Veterinarian recommended for anxiety reduction.',
        price: 34.99, 
        images: [
          'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=500&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=500&h=500&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=500&fit=crop&crop=center'
        ],
        variants: [
          { title: 'Level 1 - Beginner', price: 34.99, sku: 'DPT-LV1-BEG-001' },
          { title: 'Level 2 - Intermediate', price: 39.99, sku: 'DPT-LV2-INT-001' },
          { title: 'Level 3 - Advanced', price: 44.99, sku: 'DPT-LV3-ADV-001' }
        ],
        handle: 'interactive-dog-puzzle-mental-stimulation',
        product_type: 'Pet Toys',
        vendor: 'StoreForge AI',
        tags: 'dog puzzle, mental stimulation, anxiety relief, interactive toy, bestseller'
      }
    ],
    'home decor': [
      { 
        title: 'Bohemian Macrame Wall Hanging - Handwoven Art', 
        description: 'Transform any space with this stunning handwoven macrame wall hanging. Crafted from premium 100% cotton cord with intricate geometric patterns. Perfect for living rooms, bedrooms, or offices. Each piece is unique and adds instant boho-chic elegance to your decor.',
        price: 49.99, 
        images: [
          'https://images.unsplash.com/photo-1591501761872-9a0a6e1e25f5?w=500&h=500&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1579123082448-5b2c8f605fd8?w=500&h=500&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1522431019691-79b32fb8bfa2?w=500&h=500&fit=crop&crop=center'
        ],
        variants: [
          { title: 'Small - 18" x 24"', price: 49.99, sku: 'MAC-SMALL-18X24-001' },
          { title: 'Medium - 24" x 36"', price: 69.99, sku: 'MAC-MED-24X36-001' },
          { title: 'Large - 30" x 48"', price: 89.99, sku: 'MAC-LARGE-30X48-001' }
        ],
        handle: 'bohemian-macrame-wall-hanging-handwoven',
        product_type: 'Wall Decor',
        vendor: 'StoreForge AI',
        tags: 'macrame, wall hanging, bohemian, home decor, handmade, trending'
      }
    ]
  };

  const nicheProducts = productTemplates[niche.toLowerCase()] || productTemplates['pet'];
  
  // Generate exactly 10 products by expanding the base templates
  const products = [];
  for (let i = 0; i < 10; i++) {
    const baseIndex = i % nicheProducts.length;
    const base = nicheProducts[baseIndex];
    const variation = Math.floor(i / nicheProducts.length) + 1;
    
    products.push({
      title: variation > 1 ? `${base.title} - Premium Edition v${variation}` : base.title,
      description: base.description,
      price: base.price + (variation - 1) * 15 + (Math.random() * 10 - 5),
      images: base.images,
      variants: base.variants.map((variant, idx) => ({
        ...variant,
        price: variant.price + (variation - 1) * 15 + idx * 5,
        sku: `${variant.sku}-V${variation}`
      })),
      handle: variation > 1 ? `${base.handle}-v${variation}` : base.handle,
      product_type: base.product_type,
      vendor: base.vendor,
      tags: `${base.tags}, v${variation}, premium quality`,
      category: niche
    });
  }
  
  return products;
}


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, originalTitle, product, config, prompt, niche, targetAudience, storeName } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.log('⚠️ OpenAI API key not found, using enhanced fallback content');
      return new Response(JSON.stringify({
        success: true,
        enhancedContent: generateFallbackContent(type, originalTitle, product, config)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`🤖 Generating enhanced ${type} content with ChatGPT-4`);

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
            content: `You are an expert e-commerce copywriter specializing in high-converting product content. Create compelling, emotional, and SEO-optimized content that drives sales.`
          },
          {
            role: 'user',
            content: prompt || `Generate enhanced ${type} content for a ${niche} product targeting ${targetAudience} for store ${storeName}.`
          }
        ],
        temperature: 0.8,
        max_tokens: type === 'description' ? 800 : 200
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedContent = data.choices[0].message.content;

    console.log(`✅ ChatGPT enhanced ${type} content generated successfully`);

    return new Response(JSON.stringify({
      success: true,
      enhancedContent: enhancedContent,
      chatgpt_generated: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Content enhancement error:', error);
    
    // Fallback to enhanced manual content
    const { type, originalTitle, product, config } = await req.json();
    
    return new Response(JSON.stringify({
      success: true,
      enhancedContent: generateFallbackContent(type, originalTitle, product, config),
      fallback_used: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackContent(type: string, originalTitle: string, product: any, config: any): string {
  if (type === 'title') {
    const powerWords = ['Premium', 'Ultimate', 'Professional', 'Advanced', 'Elite', 'Smart'];
    const urgencyWords = ['Bestseller', 'Top Rated', 'Must-Have', 'Trending', '#1 Choice'];
    const emojis = ['⭐', '🏆', '💎', '🔥', '✨', '🎯'];
    
    const powerWord = powerWords[Math.floor(Math.random() * powerWords.length)];
    const urgency = urgencyWords[Math.floor(Math.random() * urgencyWords.length)];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    return `${emoji} ${powerWord} ${originalTitle?.substring(0, 30) || 'Product'} - ${urgency}`;
  }
  
  if (type === 'description') {
    const { niche, targetAudience, storeName } = config || {};
    
    return `
<div class="enhanced-product-description">
  <h2>🌟 Transform Your ${niche?.charAt(0).toUpperCase() + niche?.slice(1) || 'Life'} Today!</h2>
  
  <p><strong>Join thousands of satisfied customers who've discovered this game-changing product!</strong></p>
  
  <h3>🔥 Why You'll Love This:</h3>
  <ul>
    ${product?.features?.map((feature: string) => `<li>${feature}</li>`).join('') || 
      `<li>✅ Premium Quality Construction</li>
       <li>💪 Built to Last Years</li>
       <li>🚀 Immediate Results</li>
       <li>💎 Professional Grade Performance</li>
       <li>🛡️ Safe & Reliable</li>`}
  </ul>
  
  <h3>🎯 Perfect For:</h3>
  <p>Designed specifically for ${targetAudience || 'discerning customers'} who demand excellence and results. Whether you're a beginner or expert, this premium solution delivers every time.</p>
  
  <h3>🏆 ${storeName || 'Our'} Quality Promise:</h3>
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; border-radius: 8px; color: white; margin: 15px 0;">
    <p>⭐ <strong>4.8/5 Star Rating</strong> from verified buyers<br>
    🚚 <strong>Free Fast Shipping</strong> on orders over $35<br>
    💝 <strong>30-Day Money-Back Guarantee</strong><br>
    🔒 <strong>Secure Checkout</strong> & customer support</p>
  </div>
  
  <div style="text-align: center; margin: 20px 0;">
    <h3>⚡ Limited Time: Special Launch Price!</h3>
    <p><strong>🎁 Order now and get FREE bonus accessories worth $25!</strong></p>
  </div>
</div>
    `.trim();
  }
  
  return 'Enhanced content generated';
}

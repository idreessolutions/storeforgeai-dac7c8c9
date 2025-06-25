
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
    const { 
      originalTitle, 
      originalDescription, 
      niche, 
      targetAudience, 
      storeStyle 
    } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('🤖 Enhancing product content:', {
      title: originalTitle.substring(0, 50),
      niche,
      targetAudience,
      storeStyle
    });

    const prompt = `You are an expert e-commerce copywriter. Transform this AliExpress product into compelling Shopify product content.

Original Title: ${originalTitle}
Original Description: ${originalDescription}
Niche: ${niche}
Target Audience: ${targetAudience}
Store Style: ${storeStyle}

Create enhanced content with:
1. A compelling, SEO-optimized title (max 75 characters) with relevant emojis
2. A persuasive HTML description with emojis, bullet points, and selling points
3. 4-6 key features that highlight benefits
4. 5-8 relevant tags for SEO

Make it sound human, emotional, and high-converting. Focus on benefits over features.

Return JSON format:
{
  "title": "enhanced title with emojis",
  "description": "HTML formatted description with styling",
  "features": ["feature 1", "feature 2", ...],
  "tags": ["tag1", "tag2", ...]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert e-commerce copywriter who creates compelling product descriptions.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedContent = data.choices[0].message.content;

    try {
      const parsedContent = JSON.parse(enhancedContent);
      console.log('✅ Content enhanced successfully');
      
      return new Response(JSON.stringify(parsedContent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('❌ Failed to parse GPT response:', parseError);
      throw new Error('Invalid response format from GPT');
    }

  } catch (error) {
    console.error('❌ Content enhancement failed:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Content enhancement failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

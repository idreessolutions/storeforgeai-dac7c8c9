
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
    const { shopifyUrl, accessToken, themeColor } = await req.json();

    console.log('Applying theme color to Shopify store:', { shopifyUrl, themeColor });

    // Validate inputs
    if (!shopifyUrl || !accessToken || !themeColor) {
      throw new Error('Missing required parameters');
    }

    // Get the current theme
    const themesResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!themesResponse.ok) {
      throw new Error('Failed to fetch themes');
    }

    const themesData = await themesResponse.json();
    const currentTheme = themesData.themes.find(theme => theme.role === 'main') || themesData.themes[0];

    if (!currentTheme) {
      throw new Error('No theme found');
    }

    console.log('Current theme:', currentTheme.id, currentTheme.name);

    // Update theme settings with the selected color
    const themeSettings = {
      asset: {
        key: 'config/settings_data.json',
        value: JSON.stringify({
          current: {
            color_accent: themeColor,
            color_button: themeColor,
            color_button_text: '#ffffff',
            color_text: '#333333',
            color_body_text: '#333333',
            color_sale_tag: themeColor,
            color_borders: themeColor,
            color_cart_dot: themeColor
          }
        })
      }
    };

    const updateResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${currentTheme.id}/assets.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(themeSettings),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Theme update failed:', errorText);
      throw new Error(`Failed to update theme: ${errorText}`);
    }

    console.log('Theme color applied successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Theme color applied successfully',
      themeId: currentTheme.id,
      appliedColor: themeColor
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in apply-theme-color function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

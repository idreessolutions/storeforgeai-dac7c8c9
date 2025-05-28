
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

    // Get the current published theme
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

    // Get current theme settings
    let currentSettings = {};
    try {
      const settingsResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${currentTheme.id}/assets.json?asset[key]=config/settings_data.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        if (settingsData.asset && settingsData.asset.value) {
          currentSettings = JSON.parse(settingsData.asset.value);
        }
      }
    } catch (error) {
      console.log('Could not fetch existing settings, using defaults');
    }

    // Merge with new color settings
    const updatedSettings = {
      ...currentSettings,
      current: {
        ...currentSettings.current,
        // Primary brand colors
        colors_accent_1: themeColor,
        colors_accent_2: themeColor,
        color_accent: themeColor,
        accent_color: themeColor,
        
        // Button colors
        colors_solid_button_labels: '#ffffff',
        colors_solid_button_background: themeColor,
        button_color: themeColor,
        color_button: themeColor,
        color_button_text: '#ffffff',
        
        // Link and interactive elements
        colors_outline_button_labels: themeColor,
        link_color: themeColor,
        color_sale_tag: themeColor,
        
        // Border and accent elements
        colors_borders_and_shadow: themeColor,
        color_borders: themeColor,
        
        // Cart and checkout
        color_cart_dot: themeColor,
        checkout_accent_color: themeColor,
        
        // Additional theme-specific color settings
        color_primary: themeColor,
        primary_color: themeColor,
        brand_color: themeColor,
        theme_color: themeColor
      }
    };

    // Update theme settings
    const updateResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${currentTheme.id}/assets.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asset: {
          key: 'config/settings_data.json',
          value: JSON.stringify(updatedSettings)
        }
      }),
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
      appliedColor: themeColor,
      colorSettings: Object.keys(updatedSettings.current).filter(key => key.includes('color') || key.includes('accent'))
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

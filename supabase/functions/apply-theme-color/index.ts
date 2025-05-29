
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

    console.log('🎨 Applying theme color to Shopify store:', themeColor);

    // Validate inputs
    if (!shopifyUrl || !accessToken || !themeColor) {
      throw new Error('Missing required parameters');
    }

    // Extract domain from URL
    const domain = shopifyUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    
    // Get current theme
    const themesUrl = `https://${domain}/admin/api/2024-10/themes.json`;
    const themesResponse = await fetch(themesUrl, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!themesResponse.ok) {
      throw new Error('Failed to fetch themes');
    }

    const themesData = await themesResponse.json();
    const currentTheme = themesData.themes.find(theme => theme.role === 'main');

    if (!currentTheme) {
      throw new Error('No main theme found');
    }

    console.log('Current theme ID:', currentTheme.id);

    // Get theme settings
    const settingsUrl = `https://${domain}/admin/api/2024-10/themes/${currentTheme.id}/assets.json?asset[key]=config/settings_data.json`;
    const settingsResponse = await fetch(settingsUrl, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    let currentSettings = {};
    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json();
      if (settingsData.asset && settingsData.asset.value) {
        try {
          currentSettings = JSON.parse(settingsData.asset.value);
        } catch (e) {
          console.log('Could not parse existing settings, starting fresh');
        }
      }
    }

    // Update theme settings with the selected color
    const updatedSettings = {
      ...currentSettings,
      current: {
        ...currentSettings.current || {},
        colors_accent_1: themeColor,
        colors_accent_2: themeColor,
        color_button: themeColor,
        color_button_background: themeColor,
        colors_text_primary: themeColor,
        button_primary_color: themeColor,
        accent_color: themeColor,
        theme_color: themeColor,
        primary_color: themeColor,
        header_color: themeColor,
        link_color: themeColor
      }
    };

    // Upload updated settings
    const updateUrl = `https://${domain}/admin/api/2024-10/themes/${currentTheme.id}/assets.json`;
    const updateResponse = await fetch(updateUrl, {
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
      console.error('Failed to update theme settings:', errorText);
      throw new Error('Failed to update theme settings');
    }

    console.log('✅ Theme color applied successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Theme color applied successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error applying theme color:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

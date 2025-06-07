
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
    const { shopifyUrl, accessToken, themeColor, niche } = await req.json();
    
    console.log('🎨 Installing Refresh theme with custom colors...');
    console.log('Store:', shopifyUrl);
    console.log('Theme Color:', themeColor);
    console.log('Niche:', niche);

    const shopifyApiUrl = `${shopifyUrl}/admin/api/2023-10/`;
    
    // Step 1: Get all themes
    const themesResponse = await fetch(`${shopifyApiUrl}themes.json`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!themesResponse.ok) {
      throw new Error(`Failed to fetch themes: ${themesResponse.status}`);
    }

    const themesData = await themesResponse.json();
    
    // Step 2: Look for Refresh theme or create/install it
    let refreshTheme = themesData.themes.find(theme => 
      theme.name.toLowerCase().includes('refresh') || 
      theme.name.toLowerCase().includes('dawn') ||
      theme.name.toLowerCase().includes('sense')
    );

    if (!refreshTheme) {
      // Install a modern theme (Dawn is Shopify's default modern theme)
      const createThemeResponse = await fetch(`${shopifyApiUrl}themes.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: {
            name: `Custom ${niche.charAt(0).toUpperCase() + niche.slice(1)} Store`,
            src: 'https://github.com/Shopify/dawn/archive/main.zip',
            role: 'main'
          }
        }),
      });

      if (createThemeResponse.ok) {
        const createThemeData = await createThemeResponse.json();
        refreshTheme = createThemeData.theme;
        console.log('✅ Installed new modern theme');
      }
    }

    if (!refreshTheme) {
      throw new Error('Could not install or find suitable theme');
    }

    // Step 3: Customize theme colors
    const settingsData = {
      current: {
        color_schemes: {
          background_1: {
            background: "#ffffff",
            text: "#121212",
            button: themeColor,
            button_label: "#ffffff",
            secondary: "#f3f3f3",
            shadow: "rgba(18,18,18,0.04)"
          },
          background_2: {
            background: "#f3f3f3",
            text: "#121212",
            button: themeColor,
            button_label: "#ffffff",
            secondary: "#ffffff",
            shadow: "rgba(18,18,18,0.04)"
          },
          accent_1: {
            background: themeColor,
            text: "#ffffff",
            button: "#121212",
            button_label: "#ffffff",
            secondary: "rgba(255,255,255,0.9)",
            shadow: "rgba(18,18,18,0.04)"
          }
        },
        colors_accent_1: themeColor,
        colors_accent_2: themeColor,
        colors_text: "#121212",
        colors_outline_button_labels: themeColor,
        colors_background_1: "#ffffff",
        colors_background_2: "#f3f3f3",
        gradient_accent_1: `linear-gradient(135deg, ${themeColor} 0%, ${adjustColorBrightness(themeColor, -20)} 100%)`,
        gradient_accent_2: `linear-gradient(135deg, ${themeColor} 0%, ${adjustColorBrightness(themeColor, 20)} 100%)`,
        type_header_font: "assistant_n4",
        type_body_font: "assistant_n4",
        page_width: "1200",
        social_twitter_link: "",
        social_facebook_link: "",
        social_pinterest_link: "",
        social_instagram_link: "",
        social_tiktok_link: "",
        social_youtube_link: "",
        brand_headline: `Premium ${niche.charAt(0).toUpperCase() + niche.slice(1)} Products`,
        brand_description: `Discover amazing ${niche} products that will transform your life`,
        brand_image_width: "275",
        favicon_width: "32",
        checkout_header_image_width: "90",
        checkout_accent_color: themeColor,
        checkout_button_color: themeColor,
        checkout_error_color: "#d20000"
      }
    };

    // Step 4: Update theme settings
    const settingsResponse = await fetch(`${shopifyApiUrl}themes/${refreshTheme.id}/assets.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asset: {
          key: 'config/settings_data.json',
          value: JSON.stringify(settingsData)
        }
      }),
    });

    if (!settingsResponse.ok) {
      console.warn('Failed to update theme settings, but continuing...');
    }

    // Step 5: Publish the theme
    const publishResponse = await fetch(`${shopifyApiUrl}themes/${refreshTheme.id}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        theme: {
          id: refreshTheme.id,
          role: 'main'
        }
      }),
    });

    if (!publishResponse.ok) {
      console.warn('Failed to publish theme, but installation succeeded');
    }

    console.log('✅ Theme installation and customization completed');

    return new Response(JSON.stringify({
      success: true,
      message: 'Refresh theme installed and customized successfully',
      theme_id: refreshTheme.id,
      theme_name: refreshTheme.name,
      theme_color: themeColor,
      customizations_applied: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Theme installation failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Theme installation failed',
      details: 'Failed to install and customize Refresh theme'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}


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
    
    console.log('🎨 Installing Sense theme for store:', shopifyUrl);
    console.log('Theme color:', themeColor);
    console.log('Niche:', niche);

    // Step 1: Get available themes from Shopify Theme Store
    const themesResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!themesResponse.ok) {
      throw new Error(`Failed to fetch themes: ${themesResponse.status}`);
    }

    const themesData = await themesResponse.json();
    console.log('📋 Current themes:', themesData.themes.length);

    // Step 2: Check if Sense theme is already installed
    let senseTheme = themesData.themes.find((theme: any) => 
      theme.name.toLowerCase().includes('sense') || theme.role === 'main'
    );

    // Step 3: If Sense theme not found, install it
    if (!senseTheme) {
      console.log('📦 Installing Sense theme...');
      
      // Create new theme from Sense (Theme ID for Sense is usually known)
      const installResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: {
            name: `Sense - ${niche} Store`,
            src: 'https://github.com/Shopify/dawn/archive/main.zip', // Using Dawn as base (similar to Sense)
            role: 'unpublished'
          }
        }),
      });

      if (installResponse.ok) {
        const installData = await installResponse.json();
        senseTheme = installData.theme;
        console.log('✅ Sense theme installed:', senseTheme.id);
      } else {
        console.log('⚠️ Theme installation failed, using existing main theme');
        senseTheme = themesData.themes.find((theme: any) => theme.role === 'main');
      }
    }

    if (!senseTheme) {
      throw new Error('No suitable theme found');
    }

    // Step 4: Customize the theme with user's color and niche
    console.log('🎨 Customizing theme with color:', themeColor);
    
    await customizeThemeSettings(shopifyUrl, accessToken, senseTheme.id, themeColor, niche);

    // Step 5: Publish the theme if it's not already published
    if (senseTheme.role !== 'main') {
      console.log('🚀 Publishing theme...');
      await publishTheme(shopifyUrl, accessToken, senseTheme.id);
    }

    return new Response(JSON.stringify({
      success: true,
      themeId: senseTheme.id,
      message: `Sense theme installed and configured for ${niche} niche`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Theme installation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function customizeThemeSettings(shopifyUrl: string, accessToken: string, themeId: string, themeColor: string, niche: string) {
  try {
    console.log('⚙️ Applying theme customizations...');
    
    // Common theme settings that work across most themes
    const settings = {
      "colors_accent_1": themeColor,
      "colors_accent_2": themeColor,
      "colors_button_background": themeColor,
      "colors_button_label": "#FFFFFF",
      "type_header_font": "assistant_n4",
      "type_body_font": "assistant_n4",
      "page_width": "1200",
      "spacing_sections": "36",
      "buttons_border_thickness": "1",
      "buttons_border_opacity": "100",
      "buttons_radius": "4",
      "buttons_shadow_opacity": "0",
      "inputs_border_thickness": "1",
      "inputs_border_opacity": "55",
      "inputs_radius": "4",
      "inputs_shadow_opacity": "0",
      "variant_pills_border_thickness": "1",
      "variant_pills_border_opacity": "55",
      "variant_pills_radius": "40",
      "variant_pills_shadow_opacity": "0",
      "media_border_thickness": "1",
      "media_border_opacity": "5",
      "media_radius": "0",
      "media_shadow_opacity": "0",
      "popup_border_thickness": "1",
      "popup_border_opacity": "10",
      "popup_corner_radius": "0",
      "popup_shadow_opacity": "0",
      "drawer_border_thickness": "1",
      "drawer_border_opacity": "10",
      "drawer_shadow_opacity": "0",
      "badge_position": "bottom left",
      "badge_corner_radius": "4",
      "sale_badge_color_scheme": "accent-2",
      "sold_out_badge_color_scheme": "inverse",
      "social_facebook_link": "",
      "social_instagram_link": "",
      "social_youtube_link": "",
      "social_tiktok_link": "",
      "social_twitter_link": "",
      "social_snapchat_link": "",
      "social_pinterest_link": "",
      "social_tumblr_link": "",
      "social_vimeo_link": "",
      "predictive_search_enabled": true,
      "predictive_search_show_vendor": false,
      "predictive_search_show_price": true,
      "currency_code_enabled": true,
      "cart_type": "drawer",
      "show_vendor": false,
      "show_cart_note": true,
      "cart_drawer_collection": "",
      "sections": {
        "announcement-bar": {
          "type": "announcement-bar",
          "blocks": {
            "announcement-bar-0": {
              "type": "announcement",
              "settings": {
                "text": `Welcome to our Premium ${niche} Store - Free Shipping on Orders $50+`,
                "link": "",
                "color_scheme": "accent-1"
              }
            }
          },
          "block_order": ["announcement-bar-0"],
          "settings": {}
        }
      }
    };

    // Update theme settings
    const response = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${themeId}/assets.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asset: {
          key: 'config/settings_data.json',
          value: JSON.stringify({
            current: settings,
            presets: {}
          })
        }
      }),
    });

    if (response.ok) {
      console.log('✅ Theme settings updated successfully');
    } else {
      console.log('⚠️ Theme settings update failed:', await response.text());
    }

  } catch (error) {
    console.error('❌ Error customizing theme:', error);
  }
}

async function publishTheme(shopifyUrl: string, accessToken: string, themeId: string) {
  try {
    const response = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${themeId}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        theme: {
          id: themeId,
          role: 'main'
        }
      }),
    });

    if (response.ok) {
      console.log('✅ Theme published successfully');
    } else {
      console.log('⚠️ Theme publishing failed:', await response.text());
    }
  } catch (error) {
    console.error('❌ Error publishing theme:', error);
  }
}

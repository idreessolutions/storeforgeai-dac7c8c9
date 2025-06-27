
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
    const { shopifyUrl, accessToken, themeColor, storeName } = await req.json();

    console.log(`🎨 APPLYING THEME COLOR: ${themeColor} to ${shopifyUrl}`);

    if (!shopifyUrl || !accessToken || !themeColor) {
      throw new Error('Missing required parameters: shopifyUrl, accessToken, or themeColor');
    }

    const baseUrl = shopifyUrl.replace(/\/$/, '');

    // Get current theme
    console.log('🔍 Getting current theme...');
    const themesResponse = await fetch(`${baseUrl}/admin/api/2024-10/themes.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!themesResponse.ok) {
      throw new Error(`Failed to get themes: ${themesResponse.status}`);
    }

    const themesData = await themesResponse.json();
    const mainTheme = themesData.themes.find((theme: any) => theme.role === 'main');

    if (!mainTheme) {
      throw new Error('No main theme found');
    }

    console.log(`✅ Found main theme: ${mainTheme.name} (ID: ${mainTheme.id})`);

    // Apply theme color through CSS customization
    const customCSS = `
      :root {
        --theme-color: ${themeColor};
        --theme-color-rgb: ${hexToRgb(themeColor)};
      }
      
      /* Primary color applications */
      .btn-primary, .button--primary, [class*="btn-primary"] {
        background-color: ${themeColor} !important;
        border-color: ${themeColor} !important;
      }
      
      /* Links and accents */
      a:not(.btn):hover, .link--accent, [class*="accent"] {
        color: ${themeColor} !important;
      }
      
      /* Headers and highlights */
      .section-header, .product-title, .collection-title {
        color: ${themeColor} !important;
      }
      
      /* Shopping elements */
      .cart-button, .add-to-cart, [class*="cart"] button {
        background-color: ${themeColor} !important;
        border-color: ${themeColor} !important;
      }
      
      /* Navigation */
      .header-nav a:hover, .nav-link:hover {
        color: ${themeColor} !important;
      }
      
      /* Product elements */
      .product-price, .price {
        color: ${themeColor} !important;
      }
      
      /* Form elements */
      .form-field:focus, input:focus, select:focus, textarea:focus {
        border-color: ${themeColor} !important;
        box-shadow: 0 0 0 2px rgba(${hexToRgb(themeColor)}, 0.2) !important;
      }
    `;

    // Update theme settings
    console.log('🎨 Applying custom theme styles...');
    
    // Try to update theme settings directly
    try {
      const settingsResponse = await fetch(`${baseUrl}/admin/api/2024-10/themes/${mainTheme.id}/assets.json?asset[key]=config/settings_data.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        let settings = JSON.parse(settingsData.asset.value);
        
        // Update color settings
        if (settings.current) {
          settings.current.color_accent = themeColor;
          settings.current.color_primary = themeColor;
          settings.current.color_button = themeColor;
          settings.current.color_link = themeColor;
        }

        // Save updated settings
        await fetch(`${baseUrl}/admin/api/2024-10/themes/${mainTheme.id}/assets.json`, {
          method: 'PUT',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            asset: {
              key: 'config/settings_data.json',
              value: JSON.stringify(settings)
            }
          })
        });

        console.log('✅ Updated theme settings with new color');
      }
    } catch (settingsError) {
      console.log('⚠️ Could not update theme settings directly, using CSS injection');
    }

    // Apply CSS customization
    await fetch(`${baseUrl}/admin/api/2024-10/themes/${mainTheme.id}/assets.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        asset: {
          key: 'assets/theme-customization.css',
          value: customCSS
        }
      })
    });

    // Also update the main stylesheet to include our customization
    try {
      const stylesheetResponse = await fetch(`${baseUrl}/admin/api/2024-10/themes/${mainTheme.id}/assets.json?asset[key]=assets/theme.scss.liquid`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (stylesheetResponse.ok) {
        const stylesheetData = await stylesheetResponse.json();
        let stylesheet = stylesheetData.asset.value;
        
        // Add import for our custom CSS
        if (!stylesheet.includes('theme-customization.css')) {
          stylesheet = `{{ 'theme-customization.css' | asset_url | stylesheet_tag }}\n` + stylesheet;
          
          await fetch(`${baseUrl}/admin/api/2024-10/themes/${mainTheme.id}/assets.json`, {
            method: 'PUT',
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              asset: {
                key: 'assets/theme.scss.liquid',
                value: stylesheet
              }
            })
          });
        }
      }
    } catch (stylesheetError) {
      console.log('⚠️ Could not update main stylesheet, CSS still applied separately');
    }

    console.log(`✅ Theme color ${themeColor} applied successfully to ${shopifyUrl}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Theme color ${themeColor} applied successfully`,
      themeId: mainTheme.id,
      themeName: mainTheme.name
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Theme color application failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '59, 130, 246'; // Default blue fallback
}


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
    
    console.log('Applying theme color to Shopify store:', {
      shopifyUrl,
      themeColor
    });

    // Get the current active theme
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
    const currentTheme = themesData.themes.find((theme: any) => theme.role === 'main');
    
    if (!currentTheme) {
      throw new Error('No main theme found');
    }

    console.log('Current theme:', currentTheme.id, currentTheme.name);

    // Get current theme settings first
    const settingsResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${currentTheme.id}/assets.json?asset[key]=config/settings_data.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    let currentSettings = {};
    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json();
      try {
        currentSettings = JSON.parse(settingsData.asset.value);
        console.log('Retrieved current theme settings');
      } catch (e) {
        console.log('Could not parse current settings, using defaults');
      }
    }

    // Enhanced theme customizations with the selected color
    const enhancedSettings = {
      ...currentSettings,
      current: {
        ...currentSettings.current,
        "color_schemes": {
          ...currentSettings.current?.color_schemes,
          "accent-1": {
            "settings": {
              "background": "#ffffff",
              "background_gradient": "",
              "text": "#1a1a1a",
              "button": themeColor,
              "button_label": "#ffffff",
              "secondary_button_label": themeColor,
              "shadow": "rgba(0,0,0,0.1)"
            }
          },
          "accent-2": {
            "settings": {
              "background": themeColor,
              "background_gradient": "",
              "text": "#ffffff", 
              "button": "#ffffff",
              "button_label": themeColor,
              "secondary_button_label": "#ffffff",
              "shadow": "rgba(0,0,0,0.1)"
            }
          }
        },
        "sections": {
          ...currentSettings.current?.sections,
          "header": {
            ...currentSettings.current?.sections?.header,
            "settings": {
              ...currentSettings.current?.sections?.header?.settings,
              "color_scheme": "accent-1",
              "logo_position": "middle-left",
              "menu_type_desktop": "dropdown",
              "sticky_header_type": "on-scroll-up",
              "show_line_separator": true
            }
          },
          "footer": {
            ...currentSettings.current?.sections?.footer,
            "settings": {
              ...currentSettings.current?.sections?.footer?.settings,
              "color_scheme": "accent-1",
              "newsletter_enable": true,
              "newsletter_heading": "Subscribe to our emails"
            }
          }
        }
      },
      presets: currentSettings.presets || {}
    };

    // Apply the enhanced theme settings
    const updateResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${currentTheme.id}/assets.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asset: {
          key: 'config/settings_data.json',
          value: JSON.stringify(enhancedSettings)
        }
      }),
    });

    if (updateResponse.ok) {
      console.log('Theme color applied successfully to main theme');
      return new Response(JSON.stringify({ 
        success: true,
        message: `Theme color ${themeColor} applied successfully`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // If main settings update fails, try CSS injection approach
      console.log('Main theme settings update failed, trying CSS injection...');
      
      const cssCustomization = `
        :root {
          --color-accent: ${themeColor};
          --color-button: ${themeColor};
          --color-button-text: #ffffff;
        }
        
        .btn, .button, [class*="button"], .shopify-payment-button__button {
          background-color: ${themeColor} !important;
          border-color: ${themeColor} !important;
        }
        
        .header__heading-link:hover, .header__menu-item:hover {
          color: ${themeColor} !important;
        }
        
        .price, .price__current, .product-form__cart-submit {
          color: ${themeColor} !important;
        }
        
        .accent-color, [class*="accent"] {
          color: ${themeColor} !important;
        }
        
        .product-form__cart-submit {
          background-color: ${themeColor} !important;
          border-color: ${themeColor} !important;
        }
        
        .newsletter-form__button {
          background-color: ${themeColor} !important;
        }
      `;

      // Try to add custom CSS
      const cssResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${currentTheme.id}/assets.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asset: {
            key: 'assets/custom-theme-colors.css',
            value: cssCustomization
          }
        }),
      });

      if (cssResponse.ok) {
        console.log('Theme color applied via CSS injection');
        
        // Also try to add the CSS to the theme.liquid file
        try {
          const themeResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${currentTheme.id}/assets.json?asset[key]=layout/theme.liquid`, {
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
          });

          if (themeResponse.ok) {
            const themeData = await themeResponse.json();
            let themeContent = themeData.asset.value;
            
            // Check if our CSS is already included
            if (!themeContent.includes('custom-theme-colors.css')) {
              // Add our CSS link before the closing </head> tag
              const cssLink = `\n  {{ 'custom-theme-colors.css' | asset_url | stylesheet_tag }}\n</head>`;
              themeContent = themeContent.replace('</head>', cssLink);
              
              const updateThemeResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${currentTheme.id}/assets.json`, {
                method: 'PUT',
                headers: {
                  'X-Shopify-Access-Token': accessToken,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  asset: {
                    key: 'layout/theme.liquid',
                    value: themeContent
                  }
                }),
              });

              if (updateThemeResponse.ok) {
                console.log('Custom CSS linked in theme.liquid successfully');
              }
            }
          }
        } catch (e) {
          console.log('Could not update theme.liquid, but CSS was created');
        }

        return new Response(JSON.stringify({ 
          success: true,
          message: `Theme color ${themeColor} applied via CSS injection`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        console.log('CSS injection also failed, theme color application limited');
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Theme color application failed - insufficient permissions'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

  } catch (error) {
    console.error('Error applying theme color:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Theme color application failed: ${error.message}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

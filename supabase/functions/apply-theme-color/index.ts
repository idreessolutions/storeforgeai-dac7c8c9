
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

    // Get current theme settings
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

    // Apply the selected theme color
    const updatedSettings = {
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
          },
          "background-1": {
            "settings": {
              "background": "#ffffff",
              "background_gradient": "",
              "text": "#1a1a1a",
              "button": themeColor,
              "button_label": "#ffffff",
              "secondary_button_label": themeColor,
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
        },
        "type": currentSettings.current?.type || "published",
        "checkout_logo_image": currentSettings.current?.checkout_logo_image || "",
        "checkout_logo_position": currentSettings.current?.checkout_logo_position || "left",
        "checkout_logo_size": currentSettings.current?.checkout_logo_size || "medium",
        "checkout_body_background_color": currentSettings.current?.checkout_body_background_color || "#ffffff",
        "checkout_input_background_color_mode": currentSettings.current?.checkout_input_background_color_mode || "white",
        "checkout_sidebar_background_color": currentSettings.current?.checkout_sidebar_background_color || "#fafafa",
        "checkout_heading_font": currentSettings.current?.checkout_heading_font || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        "checkout_body_font": currentSettings.current?.checkout_body_font || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        "checkout_accent_color": themeColor,
        "checkout_button_color": themeColor,
        "checkout_error_color": "#d20000"
      },
      presets: currentSettings.presets || {}
    };

    // Apply the theme settings
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

    if (updateResponse.ok) {
      console.log('Theme color applied successfully');
      return new Response(JSON.stringify({ 
        success: true,
        message: `Theme color ${themeColor} applied successfully`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Fallback to CSS injection if settings update fails
      console.log('Settings update failed, trying CSS injection...');
      
      const cssCustomization = `
        :root {
          --color-accent: ${themeColor};
          --color-button: ${themeColor};
          --color-button-text: #ffffff;
          --gradient-accent-1: ${themeColor};
        }
        
        .btn, .button, [class*="button"], .shopify-payment-button__button--unbranded {
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
        
        .newsletter-form__button, .footer__newsletter .button {
          background-color: ${themeColor} !important;
        }
        
        .cart-notification-product__name a:hover,
        .card__heading a:hover,
        .full-unstyled-link:hover .card__heading {
          color: ${themeColor} !important;
        }
        
        .badge {
          background-color: ${themeColor} !important;
        }
        
        .link--text:hover {
          color: ${themeColor} !important;
        }
      `;

      // Add custom CSS
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
        
        // Link CSS in theme.liquid
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
            
            if (!themeContent.includes('custom-theme-colors.css')) {
              const cssLink = `\n  {{ 'custom-theme-colors.css' | asset_url | stylesheet_tag }}\n</head>`;
              themeContent = themeContent.replace('</head>', cssLink);
              
              await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${currentTheme.id}/assets.json`, {
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

              console.log('Custom CSS linked in theme.liquid');
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
        console.log('Both settings update and CSS injection failed');
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

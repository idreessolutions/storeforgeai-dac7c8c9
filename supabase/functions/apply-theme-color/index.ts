
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

    // Apply the selected theme color with comprehensive coverage
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
          },
          "background-2": {
            "settings": {
              "background": "#f5f5f5",
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
              "color_scheme": "background-1",
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
              "color_scheme": "background-1",
              "newsletter_enable": true,
              "newsletter_heading": "Subscribe to our emails"
            }
          },
          "featured-collection": {
            ...currentSettings.current?.sections?.["featured-collection"],
            "settings": {
              ...currentSettings.current?.sections?.["featured-collection"]?.settings,
              "color_scheme": "background-1"
            }
          },
          "featured-product": {
            ...currentSettings.current?.sections?.["featured-product"],
            "settings": {
              ...currentSettings.current?.sections?.["featured-product"]?.settings,
              "color_scheme": "background-1"
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
        "checkout_heading_font": currentSettings.current?.checkout_heading_font || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        "checkout_body_font": currentSettings.current?.checkout_body_font || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
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
      console.log('Theme color applied successfully via settings');
      return new Response(JSON.stringify({ 
        success: true,
        message: `Theme color ${themeColor} applied successfully`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Fallback to comprehensive CSS injection
      console.log('Settings update failed, applying comprehensive CSS injection...');
      
      const comprehensiveCss = `
        :root {
          --color-accent: ${themeColor};
          --color-button: ${themeColor};
          --color-button-text: #ffffff;
          --gradient-accent-1: ${themeColor};
          --color-base-accent-1: ${themeColor};
          --color-base-accent-2: ${themeColor};
        }
        
        /* Buttons and CTAs */
        .btn, .button, [class*="button"], .shopify-payment-button__button--unbranded,
        .product-form__cart-submit, .cart-notification__cta, .newsletter-form__button,
        .footer__newsletter .button, .quick-add__submit, .card__content .button,
        .featured-product .button, .collection-list__item .button {
          background-color: ${themeColor} !important;
          border-color: ${themeColor} !important;
          color: #ffffff !important;
        }
        
        .btn:hover, .button:hover, [class*="button"]:hover,
        .product-form__cart-submit:hover, .newsletter-form__button:hover {
          background-color: ${themeColor}dd !important;
          border-color: ${themeColor}dd !important;
        }
        
        /* Links and Navigation */
        .header__heading-link:hover, .header__menu-item:hover,
        .header__active-menu-item, .mega-menu__link:hover,
        .footer__list-social a:hover, .list-menu__item:hover {
          color: ${themeColor} !important;
        }
        
        /* Prices and Accent Colors */
        .price, .price__current, .price--on-sale .price__current,
        .card__information .price, .product__price .price,
        .cart-item__price, .totals__total-value {
          color: ${themeColor} !important;
        }
        
        /* Product Cards and Featured Elements */
        .card__heading a:hover, .full-unstyled-link:hover .card__heading,
        .cart-notification-product__name a:hover, .product__title a:hover {
          color: ${themeColor} !important;
        }
        
        /* Badges and Labels */
        .badge, .product__badge, .card__badge, .collection__badge,
        .price__badge-sale, .price__badge-sold-out {
          background-color: ${themeColor} !important;
          color: #ffffff !important;
        }
        
        /* Form Elements */
        .field__input:focus, .select__select:focus, .customer .field input:focus,
        .localization-form__select:focus, .search__input:focus {
          border-color: ${themeColor} !important;
          box-shadow: 0 0 0 1px ${themeColor} !important;
        }
        
        /* Checkboxes and Radio Buttons */
        .checkbox__input:checked + .checkbox__label::before,
        .radio__input:checked + .radio__label::before {
          background-color: ${themeColor} !important;
          border-color: ${themeColor} !important;
        }
        
        /* Progress and Loading Elements */
        .loading-overlay__spinner, .cart__checkout-button .loading-overlay__spinner {
          color: ${themeColor} !important;
        }
        
        /* Quantity Selectors */
        .quantity__button:hover, .quantity__input:focus {
          border-color: ${themeColor} !important;
        }
        
        /* Collection and Filter Elements */
        .collection-filters__item--active, .facets__item--active,
        .facets__selected, .active-facets__button {
          color: ${themeColor} !important;
          border-color: ${themeColor} !important;
        }
        
        /* Slider and Range Elements */
        .price-range__slider::-webkit-slider-thumb,
        .price-range__slider::-moz-range-thumb {
          background-color: ${themeColor} !important;
        }
        
        /* Social Media and Share Buttons */
        .share-button:hover, .product__share .share-button:hover {
          color: ${themeColor} !important;
        }
        
        /* Cart and Checkout Elements */
        .cart-count-bubble, .cart-notification__header .icon,
        .cart__checkout-button, .cart-drawer__checkout {
          background-color: ${themeColor} !important;
          color: #ffffff !important;
        }
        
        /* Featured Collection and Product Sections */
        .featured-collection .card__content .button,
        .featured-product .product-form__cart-submit,
        .collection-hero__button, .banner__button {
          background-color: ${themeColor} !important;
          border-color: ${themeColor} !important;
        }
        
        /* Pagination */
        .pagination__item--current, .pagination__item:hover {
          background-color: ${themeColor} !important;
          color: #ffffff !important;
        }
        
        /* Breadcrumbs */
        .breadcrumb__link:hover, .breadcrumb__link--current {
          color: ${themeColor} !important;
        }
        
        /* Product Thumbnails */
        .product__media-toggle--active {
          border-color: ${themeColor} !important;
        }
        
        /* Newsletter and Footer */
        .footer__newsletter .newsletter-form__button,
        .footer__payment .icon, .footer__list-social .icon:hover {
          color: ${themeColor} !important;
        }
      `;

      // Add comprehensive custom CSS
      const cssResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${currentTheme.id}/assets.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asset: {
            key: 'assets/custom-theme-colors.css',
            value: comprehensiveCss
          }
        }),
      });

      if (cssResponse.ok) {
        console.log('Theme color applied via comprehensive CSS injection');
        
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
          message: `Theme color ${themeColor} applied via comprehensive CSS`
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

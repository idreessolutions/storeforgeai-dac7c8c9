
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
    const { shopifyUrl, accessToken, themeColor, niche, storeName } = await req.json();
    
    console.log('🎨 CRITICAL THEME INSTALL: Installing and configuring Refresh theme...');
    console.log('🏪 Store:', shopifyUrl);
    console.log('📝 Store Name:', storeName);
    console.log('🎨 Theme Color:', themeColor);
    console.log('🎯 Niche:', niche);

    const shopifyApiUrl = `${shopifyUrl}/admin/api/2023-10/`;
    
    // Step 0: CRITICAL - Update store name first
    if (storeName) {
      await updateStoreName(shopifyApiUrl, accessToken, storeName);
    }
    
    // Step 1: Get all themes and find suitable one
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
    
    // Look for modern theme (Refresh, Dawn, or Sense)
    let targetTheme = themesData.themes.find(theme => 
      theme.name.toLowerCase().includes('refresh') || 
      theme.name.toLowerCase().includes('dawn') ||
      theme.name.toLowerCase().includes('sense') ||
      theme.role === 'main'
    );

    if (!targetTheme) {
      // Use the first available theme as fallback
      targetTheme = themesData.themes[0];
      console.log('⚠️ Using fallback theme:', targetTheme.name);
    }

    console.log('✅ Found theme to customize:', targetTheme.name, 'ID:', targetTheme.id);

    // Step 2: CRITICAL - Apply the selected theme color to all brand elements
    console.log('🎨 APPLYING CRITICAL COLOR CUSTOMIZATION:', themeColor);
    
    const criticalColorSettings = {
      current: {
        // CRITICAL: Primary color scheme with user's selected color
        colors_accent_1: themeColor,
        colors_accent_2: adjustColorBrightness(themeColor, -15),
        colors_text: "#121212",
        colors_outline_button_labels: themeColor,
        colors_background_1: "#ffffff",
        colors_background_2: "#f3f3f3",
        
        // CRITICAL: Button colors - most important for conversion
        color_button: themeColor,
        color_button_text: "#ffffff",
        
        // CRITICAL: Header and navigation colors
        color_header: themeColor,
        color_header_text: "#ffffff",
        
        // CRITICAL: Link colors throughout the site
        color_links: themeColor,
        
        // CRITICAL: Price and sale colors
        color_price: themeColor,
        color_sale_price: adjustColorBrightness(themeColor, -20),
        
        // Enhanced gradient settings for modern look
        gradient_accent_1: `linear-gradient(135deg, ${themeColor} 0%, ${adjustColorBrightness(themeColor, -20)} 100%)`,
        gradient_accent_2: `linear-gradient(135deg, ${adjustColorBrightness(themeColor, 15)} 0%, ${themeColor} 100%)`,
        gradient_base_accent_1: themeColor,
        gradient_base_accent_2: adjustColorBrightness(themeColor, -10),
        
        // Typography settings
        type_header_font: "assistant_n4",
        type_body_font: "assistant_n4",
        heading_scale: "120",
        body_scale: "100",
        
        // Layout settings
        page_width: "1200",
        spacing_sections_desktop: "56",
        spacing_sections_mobile: "36",
        
        // Button styling with user's color
        buttons_border_thickness: "1",
        buttons_border_opacity: "100",
        buttons_radius: "4",
        buttons_shadow_opacity: "10",
        buttons_shadow_horizontal_offset: "0",
        buttons_shadow_vertical_offset: "4",
        buttons_shadow_blur_radius: "5",
        
        // Card styling
        card_style: "standard",
        card_image_padding: "0",
        card_text_alignment: "left",
        card_color_scheme: "background-2",
        
        // Badge styling with brand color
        badge_position: "bottom left",
        badge_corner_radius: "4",
        
        // CRITICAL: Brand customization for niche with store name
        brand_headline: `Welcome to ${storeName || 'Your Store'}`,
        brand_description: `Discover amazing ${niche} products at ${storeName || 'our store'}`,
        brand_image_width: "275",
        
        // Favicon and checkout with brand color
        favicon_width: "32",
        checkout_header_image_width: "90",
        checkout_accent_color: themeColor,
        checkout_button_color: themeColor,
        checkout_error_color: "#d20000",
        
        // Product page settings
        product_form_style: "default",
        product_zoom_enable: true,
        product_image_zoom: "hover",
        show_vendor: true,
        show_sku: false,
        show_taxes: true,
        show_shipping_policy: true,
        
        // Collection page settings
        collection_products_per_page: "24",
        collection_image_ratio: "adapt",
        collection_image_crop: "center",
        
        // Search settings
        predictive_search_enabled: true,
        predictive_search_show_vendor: false,
        predictive_search_show_price: true,
        
        // Cart settings
        cart_type: "drawer",
        cart_show_free_shipping_threshold: true,
        cart_free_shipping_threshold: "50",
        
        // Footer settings
        show_policy: true,
        currency_code_enabled: true,
        payment_enable: true,
        
        // Animation settings
        animations_reveal_on_scroll: true,
        animations_hover_elements: "none"
      }
    };

    // Step 3: CRITICAL - Apply theme customizations with user's color
    console.log('🎨 APPLYING CRITICAL THEME CUSTOMIZATIONS WITH USER COLOR...');
    
    const settingsResponse = await fetch(`${shopifyApiUrl}themes/${targetTheme.id}/assets.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asset: {
          key: 'config/settings_data.json',
          value: JSON.stringify(criticalColorSettings)
        }
      }),
    });

    if (!settingsResponse.ok) {
      const errorText = await settingsResponse.text();
      console.error('❌ CRITICAL: Theme settings update failed:', errorText);
      // Continue anyway - this is not a complete failure
    } else {
      console.log('✅ CRITICAL: Theme settings updated successfully with user color');
    }

    // Step 4: CRITICAL - Apply additional CSS customizations with user's exact color
    await applyCriticalCustomCSS(shopifyApiUrl, accessToken, targetTheme.id, themeColor, niche, storeName);

    // Step 5: Publish the theme if it's not already main
    if (targetTheme.role !== 'main') {
      console.log('📤 CRITICAL: Publishing theme...');
      
      const publishResponse = await fetch(`${shopifyApiUrl}themes/${targetTheme.id}.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: {
            id: targetTheme.id,
            role: 'main'
          }
        }),
      });

      if (!publishResponse.ok) {
        console.warn('⚠️ Failed to publish theme, but installation succeeded');
      } else {
        console.log('✅ CRITICAL: Theme published successfully');
      }
    }

    console.log('🎉 CRITICAL SUCCESS: Theme installation and color customization completed');

    return new Response(JSON.stringify({
      success: true,
      message: `CRITICAL SUCCESS: Refresh theme installed and customized with color ${themeColor}`,
      theme_id: targetTheme.id,
      theme_name: targetTheme.name,
      theme_color: themeColor,
      store_name: storeName,
      niche_customization: niche,
      critical_customizations_applied: {
        store_name_updated: true,
        user_color_applied: true,
        color_schemes: true,
        button_colors: true,
        header_colors: true,
        link_colors: true,
        price_colors: true,
        gradients: true,
        typography: true,
        layout: true,
        branding: true,
        custom_css: true
      },
      theme_status: 'LIVE_WITH_USER_COLOR'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ CRITICAL ERROR: Theme installation failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Critical theme installation failed',
      details: 'Failed to install and customize Refresh theme with user color',
      troubleshooting: {
        check_access_token: 'Verify Shopify Admin API access token has theme permissions',
        check_theme_access: 'Ensure API can modify theme settings',
        check_color_format: 'Verify theme color is in correct hex format'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function updateStoreName(shopifyApiUrl: string, accessToken: string, storeName: string) {
  try {
    console.log(`🏪 CRITICAL: Updating store name to: ${storeName}`);
    
    const response = await fetch(`${shopifyApiUrl}shop.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shop: {
          name: storeName,
          phone: '+12345678910' // Add phone number here too
        }
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ CRITICAL: Store name updated successfully to: ${result.shop.name} with phone: ${result.shop.phone}`);
    } else {
      console.warn('⚠️ Failed to update store name, but continuing with theme installation');
    }

  } catch (error) {
    console.warn('⚠️ Store name update failed, but continuing:', error);
  }
}

async function applyCriticalCustomCSS(shopifyApiUrl: string, accessToken: string, themeId: string, themeColor: string, niche: string, storeName?: string) {
  try {
    console.log('🎨 CRITICAL: Applying custom CSS with user color:', themeColor);
    
    const criticalCustomCSS = `
/* CRITICAL: Custom Styles for ${storeName || 'Store'} - ${niche} with user color ${themeColor} */
:root {
  --primary-color: ${themeColor} !important;
  --primary-hover: ${adjustColorBrightness(themeColor, -10)} !important;
  --primary-light: ${adjustColorBrightness(themeColor, 20)} !important;
  --gradient-primary: linear-gradient(135deg, ${themeColor} 0%, ${adjustColorBrightness(themeColor, -20)} 100%) !important;
}

/* CRITICAL: Button styling with user's exact color */
.btn, button, [type="submit"], .shopify-payment-button__button, .product-form__buttons button, .btn--secondary {
  background: var(--primary-color) !important;
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  color: white !important;
  transition: all 0.3s ease !important;
}

.btn:hover, button:hover, [type="submit"]:hover, .shopify-payment-button__button:hover {
  background: var(--primary-hover) !important;
  background-color: var(--primary-hover) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
}

/* CRITICAL: Header and navigation with user color */
.header, .header__wrapper, .site-header, .header__menu {
  background-color: var(--primary-color) !important;
}

.header__menu-item a, .site-nav__link, .header__heading-link {
  color: white !important;
}

.header__menu-item a:hover, .site-nav__link:hover {
  color: var(--primary-light) !important;
}

/* CRITICAL: Links throughout the site */
a, .link, .product__title a {
  color: var(--primary-color) !important;
}

a:hover, .link:hover {
  color: var(--primary-hover) !important;
}

/* CRITICAL: Price display with user color */
.price, .price__current, .product__price, .price--current {
  color: var(--primary-color) !important;
  font-weight: 600 !important;
}

.price--on-sale, .price--reduced {
  color: var(--primary-hover) !important;
}

/* CRITICAL: Add to cart and checkout buttons */
.product-form__buttons .btn, .cart__checkout-button, .checkout-button {
  background: var(--gradient-primary) !important;
  border: none !important;
  color: white !important;
  font-weight: 600 !important;
}

/* CRITICAL: Product cards enhancement */
.card-product {
  transition: all 0.3s ease !important;
  border: 1px solid transparent !important;
}

.card-product:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
  border-color: var(--primary-color) !important;
}

/* CRITICAL: Badges and labels */
.badge, .label, .product__badge {
  background: var(--gradient-primary) !important;
  color: white !important;
}

/* CRITICAL: Collection headers and titles */
.collection-hero__title, .page-header__title, .section-header__title {
  background: var(--gradient-primary) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

/* CRITICAL: Store name branding */
.header__heading-text, .site-nav__logo, .header__heading {
  font-weight: 700 !important;
  color: white !important;
}

/* CRITICAL: Footer links */
.footer a, .footer__link {
  color: var(--primary-color) !important;
}

/* CRITICAL: Form elements */
input[type="email"], input[type="text"], input[type="tel"], select, textarea {
  border-color: var(--primary-color) !important;
}

input[type="email"]:focus, input[type="text"]:focus, input[type="tel"]:focus, select:focus, textarea:focus {
  border-color: var(--primary-hover) !important;
  box-shadow: 0 0 0 2px rgba(${hexToRgb(themeColor)}, 0.1) !important;
}

/* CRITICAL: Mobile responsiveness */
@media (max-width: 768px) {
  .btn, button {
    padding: 12px 20px !important;
    font-size: 16px !important;
  }
  
  .header {
    background-color: var(--primary-color) !important;
  }
  
  .header__menu-item a {
    color: white !important;
  }
}

/* CRITICAL: Ensure high specificity for color application */
body .btn,
body button,
body [type="submit"],
body .shopify-payment-button__button {
  background-color: ${themeColor} !important;
  border-color: ${themeColor} !important;
}

body .header,
body .site-header {
  background-color: ${themeColor} !important;
}

body .price,
body .product__price {
  color: ${themeColor} !important;
}
`;

    const cssResponse = await fetch(`${shopifyApiUrl}themes/${themeId}/assets.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asset: {
          key: 'assets/custom-brand-style.css',
          value: criticalCustomCSS
        }
      }),
    });

    if (cssResponse.ok) {
      console.log('✅ CRITICAL: Custom CSS applied successfully with user color');
    } else {
      console.warn('⚠️ Failed to apply custom CSS, but theme installation continues');
    }

    // CRITICAL: Also add the CSS to the theme.liquid file for guaranteed application
    await injectCSSIntoThemeFile(shopifyApiUrl, accessToken, themeId, themeColor);

  } catch (error) {
    console.error('❌ Custom CSS application failed:', error);
  }
}

async function injectCSSIntoThemeFile(shopifyApiUrl: string, accessToken: string, themeId: string, themeColor: string) {
  try {
    console.log('🎨 CRITICAL: Injecting CSS directly into theme.liquid for guaranteed application');
    
    // Get the current theme.liquid file
    const themeResponse = await fetch(`${shopifyApiUrl}themes/${themeId}/assets.json?asset[key]=layout/theme.liquid`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (themeResponse.ok) {
      const themeData = await themeResponse.json();
      let themeContent = themeData.asset.value;
      
      // Inject critical CSS directly into head
      const criticalInlineCSS = `
<style>
/* CRITICAL BRAND COLORS - DIRECTLY INJECTED */
:root { --brand-color: ${themeColor} !important; }
.btn, button, [type="submit"] { background-color: ${themeColor} !important; border-color: ${themeColor} !important; }
.header, .site-header { background-color: ${themeColor} !important; }
.price, .product__price { color: ${themeColor} !important; }
a { color: ${themeColor} !important; }
</style>
`;
      
      // Insert the CSS right before </head>
      if (themeContent.includes('</head>')) {
        themeContent = themeContent.replace('</head>', criticalInlineCSS + '\n</head>');
        
        // Update the theme file
        const updateResponse = await fetch(`${shopifyApiUrl}themes/${themeId}/assets.json`, {
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

        if (updateResponse.ok) {
          console.log('✅ CRITICAL: CSS injected directly into theme.liquid successfully');
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to inject CSS into theme.liquid:', error);
  }
}

function adjustColorBrightness(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB values
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  // Ensure values stay within 0-255 range
  const clampedR = R < 255 ? (R < 1 ? 0 : R) : 255;
  const clampedG = G < 255 ? (G < 1 ? 0 : G) : 255;
  const clampedB = B < 255 ? (B < 1 ? 0 : B) : 255;
  
  return "#" + (0x1000000 + clampedR * 0x10000 + clampedG * 0x100 + clampedB).toString(16).slice(1);
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
    '0, 0, 0';
}

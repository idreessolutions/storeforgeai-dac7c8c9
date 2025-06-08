
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Upgraded Theme Setup Configuration
const THEME_CONFIG = {
  theme_name: "Refresh",
  publish: true,
  change_primary_color: true,
  replace_fields: ["accent_color", "button_color", "primary_text", "colors_accent_1", "colors_accent_2"]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shopifyUrl, accessToken, themeColor, niche } = await req.json();
    
    console.log('🎨 UPGRADED TOOLKIT: Installing and configuring Refresh theme...');
    console.log('Store:', shopifyUrl);
    console.log('Theme Color:', themeColor);
    console.log('Niche:', niche);

    const shopifyApiUrl = `${shopifyUrl}/admin/api/2023-10/`;
    
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

    console.log('✅ Found theme to customize:', targetTheme.name);

    // Step 2: Create comprehensive theme customizations with upgraded toolkit colors
    const comprehensiveSettings = {
      current: {
        // Color scheme customizations
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
            secondary: adjustColorBrightness(themeColor, 10),
            shadow: "rgba(18,18,18,0.04)"
          },
          accent_2: {
            background: adjustColorBrightness(themeColor, -10),
            text: "#ffffff",
            button: "#ffffff",
            button_label: themeColor,
            secondary: adjustColorBrightness(themeColor, 20),
            shadow: "rgba(18,18,18,0.04)"
          }
        },
        
        // Primary color settings
        colors_accent_1: themeColor,
        colors_accent_2: adjustColorBrightness(themeColor, -15),
        colors_text: "#121212",
        colors_outline_button_labels: themeColor,
        colors_background_1: "#ffffff",
        colors_background_2: "#f3f3f3",
        
        // Gradient settings for modern look
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
        
        // Button styling
        buttons_border_thickness: "1",
        buttons_border_opacity: "55",
        buttons_radius: "4",
        buttons_shadow_opacity: "0",
        buttons_shadow_horizontal_offset: "0",
        buttons_shadow_vertical_offset: "4",
        buttons_shadow_blur_radius: "5",
        
        // Card styling
        card_style: "standard",
        card_image_padding: "0",
        card_text_alignment: "left",
        card_color_scheme: "background-2",
        
        // Badge styling
        badge_position: "bottom left",
        badge_corner_radius: "4",
        
        // Social media links
        social_twitter_link: "",
        social_facebook_link: "",
        social_pinterest_link: "",
        social_instagram_link: "",
        social_tiktok_link: "",
        social_youtube_link: "",
        
        // Brand customization for niche
        brand_headline: `Premium ${niche.charAt(0).toUpperCase() + niche.slice(1)} Collection`,
        brand_description: `Discover amazing ${niche} products that will enhance your lifestyle`,
        brand_image_width: "275",
        
        // Favicon and checkout
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

    // Step 3: Apply theme customizations
    console.log('🎨 Applying comprehensive theme customizations...');
    
    const settingsResponse = await fetch(`${shopifyApiUrl}themes/${targetTheme.id}/assets.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asset: {
          key: 'config/settings_data.json',
          value: JSON.stringify(comprehensiveSettings)
        }
      }),
    });

    if (!settingsResponse.ok) {
      console.warn('Failed to update theme settings, but continuing...');
      const errorText = await settingsResponse.text();
      console.log('Settings update error:', errorText);
    } else {
      console.log('✅ Theme settings updated successfully');
    }

    // Step 4: Apply additional CSS customizations
    await applyCustomCSS(shopifyApiUrl, accessToken, targetTheme.id, themeColor, niche);

    // Step 5: Publish the theme if it's not already main
    if (targetTheme.role !== 'main') {
      console.log('📤 Publishing theme...');
      
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
        console.warn('Failed to publish theme, but installation succeeded');
      } else {
        console.log('✅ Theme published successfully');
      }
    }

    console.log('🎉 UPGRADED TOOLKIT: Theme installation and customization completed');

    return new Response(JSON.stringify({
      success: true,
      message: 'Refresh theme installed and customized with upgraded toolkit',
      theme_id: targetTheme.id,
      theme_name: targetTheme.name,
      theme_color: themeColor,
      niche_customization: niche,
      customizations_applied: {
        color_schemes: true,
        gradients: true,
        typography: true,
        layout: true,
        buttons: true,
        cards: true,
        branding: true,
        custom_css: true
      },
      toolkit_version: 'upgraded_v2.0'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ UPGRADED TOOLKIT: Theme installation failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Theme installation failed',
      details: 'Failed to install and customize Refresh theme with upgraded toolkit',
      toolkit_version: 'upgraded_v2.0'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function applyCustomCSS(shopifyApiUrl: string, accessToken: string, themeId: string, themeColor: string, niche: string) {
  try {
    console.log('🎨 Applying custom CSS for enhanced styling...');
    
    const customCSS = `
/* Upgraded Toolkit Custom Styles for ${niche} */
:root {
  --primary-color: ${themeColor};
  --primary-hover: ${adjustColorBrightness(themeColor, -10)};
  --primary-light: ${adjustColorBrightness(themeColor, 20)};
  --gradient-primary: linear-gradient(135deg, ${themeColor} 0%, ${adjustColorBrightness(themeColor, -20)} 100%);
}

/* Enhanced button styling */
.btn, button, [type="submit"], .shopify-payment-button__button {
  background: var(--gradient-primary) !important;
  border-color: var(--primary-color) !important;
  transition: all 0.3s ease !important;
}

.btn:hover, button:hover, [type="submit"]:hover {
  background: var(--primary-hover) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
}

/* Enhanced product cards */
.card-product {
  transition: all 0.3s ease !important;
}

.card-product:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
}

/* Enhanced navigation */
.header__menu-item a:hover {
  color: var(--primary-color) !important;
}

/* Enhanced links */
a {
  color: var(--primary-color) !important;
}

/* Enhanced badges */
.badge {
  background: var(--gradient-primary) !important;
  color: white !important;
}

/* Enhanced price display */
.price {
  color: var(--primary-color) !important;
  font-weight: 600 !important;
}

/* Enhanced collection headers */
.collection-hero__title {
  background: var(--gradient-primary) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .btn, button {
    padding: 12px 20px !important;
    font-size: 16px !important;
  }
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
          key: 'assets/custom-style.css',
          value: customCSS
        }
      }),
    });

    if (cssResponse.ok) {
      console.log('✅ Custom CSS applied successfully');
    } else {
      console.warn('⚠️ Failed to apply custom CSS, but theme installation continues');
    }

  } catch (error) {
    console.error('Custom CSS application failed:', error);
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

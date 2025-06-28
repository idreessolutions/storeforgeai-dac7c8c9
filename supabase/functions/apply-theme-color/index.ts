
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

    console.log(`🎨 APPLYING THEME COLOR: ${themeColor} to ${storeName} (${shopifyUrl})`);

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

    // Enhanced theme color application with comprehensive settings
    const criticalThemeSettings = {
      // Primary colors - most important
      'colors_accent_1': themeColor,
      'colors_accent_2': themeColor,
      'colors_button_primary': themeColor,
      'color_button': themeColor,
      'color_accent': themeColor,
      'color_primary': themeColor,
      
      // Links and navigation
      'colors_link': themeColor,
      'color_link': themeColor,
      'navigation_link_color': themeColor,
      
      // Headers and text
      'color_heading': themeColor,
      'colors_heading': themeColor,
      
      // Cart and checkout
      'cart_color': themeColor,
      'checkout_accent_color': themeColor,
      
      // Store branding
      'brand_color': themeColor,
      'primary_brand_color': themeColor,
      
      // Announcements and banners
      'announcement_background': themeColor,
      'banner_background': themeColor,
      
      // Store name and branding text
      'store_name': storeName,
      'site_title': storeName,
      'brand_name': storeName,
      'logo_text': storeName,
      
      // Welcome messages
      'announcement_text': `🎉 Welcome to ${storeName} - Premium Quality Products!`,
      'welcome_message': `Welcome to ${storeName}`,
      'header_message': `Discover Amazing Products at ${storeName}`,
      
      // Footer branding
      'footer_text': `© 2024 ${storeName}. All rights reserved.`,
      'copyright_text': `${storeName} - Your trusted shopping destination`
    };

    let successfulUpdates = 0;
    const totalSettings = Object.keys(criticalThemeSettings).length;

    // Apply theme settings with enhanced error handling
    for (const [settingKey, settingValue] of Object.entries(criticalThemeSettings)) {
      try {
        const success = await updateThemeSetting(
          baseUrl, 
          accessToken, 
          mainTheme.id, 
          settingKey, 
          settingValue
        );
        
        if (success) {
          successfulUpdates++;
          console.log(`✅ Applied: ${settingKey} = ${settingValue}`);
        } else {
          console.log(`⚠️ Failed: ${settingKey}`);
        }
        
        // Rate limiting to prevent API abuse
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`❌ Error applying ${settingKey}:`, error.message);
        continue;
      }
    }

    // Apply comprehensive CSS customization as backup
    await applyAdvancedCSS(baseUrl, accessToken, mainTheme.id, themeColor, storeName);

    const successRate = (successfulUpdates / totalSettings) * 100;
    console.log(`🎯 Theme customization completed: ${successfulUpdates}/${totalSettings} settings applied (${successRate.toFixed(1)}%)`);

    return new Response(JSON.stringify({
      success: true,
      message: `Theme color ${themeColor} and branding applied successfully to ${storeName}`,
      themeId: mainTheme.id,
      themeName: mainTheme.name,
      settingsApplied: successfulUpdates,
      totalSettings: totalSettings,
      successRate: `${successRate.toFixed(1)}%`,
      storeInfo: {
        name: storeName,
        color: themeColor
      }
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

async function updateThemeSetting(
  shopifyUrl: string,
  accessToken: string,
  themeId: string,
  key: string,
  value: any
): Promise<boolean> {
  try {
    // Get current settings
    const settingsResponse = await fetch(
      `${shopifyUrl}/admin/api/2024-10/themes/${themeId}/assets.json?asset[key]=config/settings_data.json`,
      { 
        headers: { 
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        } 
      }
    );

    if (!settingsResponse.ok) return false;

    const settingsData = await settingsResponse.json();
    let currentSettings = {};
    
    try {
      currentSettings = JSON.parse(settingsData.asset.value || '{}');
    } catch {
      currentSettings = {};
    }

    // Update setting
    const updatedSettings = {
      ...currentSettings,
      current: {
        ...(currentSettings as any).current || {},
        [key]: value
      }
    };

    // Save updated settings
    const updateResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${themeId}/assets.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        asset: {
          key: 'config/settings_data.json',
          value: JSON.stringify(updatedSettings)
        }
      })
    });

    return updateResponse.ok;
  } catch (error) {
    return false;
  }
}

async function applyAdvancedCSS(
  shopifyUrl: string,
  accessToken: string,
  themeId: string,
  themeColor: string,
  storeName: string
): Promise<boolean> {
  try {
    const customCSS = `
      /* ${storeName} - Custom Theme Color: ${themeColor} */
      :root {
        --theme-color: ${themeColor};
        --theme-color-rgb: ${hexToRgb(themeColor)};
        --store-name: "${storeName}";
      }
      
      /* PRIMARY BUTTONS AND CALLS TO ACTION */
      .btn-primary, .button--primary, [class*="btn-primary"],
      .shopify-payment-button__button, .product-form__cart-submit,
      button[name="add"], .btn.product-form__cart-submit,
      .cart__submit, .cart-drawer__checkout-button {
        background-color: ${themeColor} !important;
        border-color: ${themeColor} !important;
        color: white !important;
      }
      
      .btn-primary:hover, .button--primary:hover, [class*="btn-primary"]:hover,
      .shopify-payment-button__button:hover, .product-form__cart-submit:hover {
        background-color: ${adjustColor(themeColor, -20)} !important;
        border-color: ${adjustColor(themeColor, -20)} !important;
      }
      
      /* LINKS AND NAVIGATION */
      a:not(.btn):not(.button):hover, .link--accent, [class*="accent"],
      .header__menu-item a:hover, .footer__list-item a:hover,
      .navigation a:hover, .menu__link:hover {
        color: ${themeColor} !important;
      }
      
      /* HEADERS AND TITLES */
      .section-header, .product-title, .collection-title,
      .page-title, .article-title, h1, h2, h3 {
        color: ${themeColor} !important;
      }
      
      /* STORE BRANDING */
      .header__heading-text, .site-header__logo-text,
      .logo__text, [class*="logo"] h1, [class*="brand"] h1 {
        color: ${themeColor} !important;
      }
      
      /* PRODUCT PRICING */
      .product-price, .price, .price__regular, .price__sale,
      .product__price, .product-price__amount {
        color: ${themeColor} !important;
        font-weight: bold !important;
      }
      
      /* CART ELEMENTS */
      .cart-button, .add-to-cart, [class*="cart"] button,
      .cart-count-bubble, .cart__contents-button {
        background-color: ${themeColor} !important;
        border-color: ${themeColor} !important;
      }
      
      /* FORM ELEMENTS */
      .form-field:focus, input:focus, select:focus, textarea:focus,
      .field__input:focus, .customer input:focus {
        border-color: ${themeColor} !important;
        box-shadow: 0 0 0 2px rgba(${hexToRgb(themeColor)}, 0.2) !important;
      }
      
      /* ANNOUNCEMENT BARS */
      .announcement-bar, .banner, .promo-banner {
        background-color: ${themeColor} !important;
        color: white !important;
      }
      
      /* COLLECTION AND PRODUCT BADGES */
      .badge, .product-badge, .collection-badge,
      .on-sale, .new-product, .featured {
        background-color: ${themeColor} !important;
        color: white !important;
      }
      
      /* PAGINATION AND NAVIGATION */
      .pagination__item--current, .pagination .current,
      .active, .selected {
        background-color: ${themeColor} !important;
        color: white !important;
      }
      
      /* STORE NAME INJECTION */
      .header__heading::after {
        content: " - ${storeName}";
        color: ${themeColor};
        font-weight: normal;
      }
    `;

    // Apply the CSS
    await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${themeId}/assets.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        asset: {
          key: 'assets/store-branding.css',
          value: customCSS
        }
      })
    });

    console.log('✅ Advanced CSS customization applied');
    return true;
  } catch (error) {
    console.error('❌ CSS customization failed:', error);
    return false;
  }
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '59, 130, 246';
}

function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

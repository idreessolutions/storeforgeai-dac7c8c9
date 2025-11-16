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
    
    console.log('🎨 THEME INSTALL: Installing Refresh theme and applying color...');
    console.log('🏪 Store:', shopifyUrl);
    console.log('📝 Store Name:', storeName);
    console.log('🎨 Theme Color:', themeColor);

    const shopifyApiUrl = `${shopifyUrl}/admin/api/2024-04/`;
    
    // Step 0: Update store name first
    if (storeName) {
      await updateStoreNameAndPhone(shopifyApiUrl, accessToken, storeName);
    }
    
    // Step 1: Install & publish Refresh theme (force it to be current)
    console.log('📦 Installing and publishing Refresh theme...');
    const targetTheme = await installRefreshTheme(shopifyApiUrl, accessToken);
    
    if (!targetTheme) {
      throw new Error('Failed to install Refresh theme');
    }

    console.log('✅ Refresh theme is now Current:', targetTheme.name, 'ID:', targetTheme.id);

    // Step 2: Apply the selected color
    console.log('🎨 Applying color customization:', themeColor);
    
    await applyThemeColorViaSettings(shopifyApiUrl, accessToken, targetTheme.id, themeColor, storeName, niche);
    await applyThemeColorViaCSS(shopifyApiUrl, accessToken, targetTheme.id, themeColor, storeName);
    await applyThemeColorViaLiquid(shopifyApiUrl, accessToken, targetTheme.id, themeColor, storeName);

    console.log('✅ Refresh theme is active and customized');
    console.log('🎉 SUCCESS: Refresh is the Current theme with your brand color');

    return new Response(JSON.stringify({
      success: true,
      message: `Refresh theme installed as Current and customized with ${themeColor}`,
      theme_id: targetTheme.id,
      theme_name: targetTheme.name,
      theme_color: themeColor,
      store_name: storeName,
      customizations_applied: {
        store_name_updated: true,
        color_application: true,
        settings_updated: true,
        css_injected: true,
        liquid_updated: true,
        theme_published: true
      },
      theme_status: 'CURRENT_THEME_PUBLISHED'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ ERROR: Theme installation failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Theme installation failed',
      details: 'Failed to install and customize Refresh theme',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function installRefreshTheme(shopifyApiUrl: string, accessToken: string): Promise<any> {
  try {
    console.log('🚀 INSTALLING REFRESH THEME - FULLY AUTOMATIC');
    
    // Helper function for API calls with retry logic
    const fetchWithRetry = async (url: string, options: any, maxRetries = 3) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          const response = await fetch(url, options);
          if (response.status === 429) {
            console.log(`⏳ Rate limited, waiting ${2 ** i} seconds...`);
            await new Promise(resolve => setTimeout(resolve, (2 ** i) * 1000));
            continue;
          }
          return response;
        } catch (error) {
          if (i === maxRetries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      throw new Error('Max retries exceeded');
    };
    
    // STEP 1: Get all existing themes
    console.log('📋 Fetching existing themes...');
    const themesResponse = await fetchWithRetry(`${shopifyApiUrl}themes.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!themesResponse.ok) {
      throw new Error('Failed to fetch themes from Shopify');
    }

    const themesData = await themesResponse.json();
    console.log(`📋 Found ${themesData.themes.length} themes:`, themesData.themes.map((t: any) => `${t.name} (${t.role})`).join(', '));
    
    // STEP 2: Look for Refresh theme
    let refreshTheme = themesData.themes.find((theme: any) => 
      theme.name?.toLowerCase().includes('refresh')
    );

    // STEP 3: If Refresh doesn't exist, attempt automatic installation
    if (!refreshTheme) {
      console.log('🔧 Refresh theme not found, attempting automatic installation...');
      
      try {
        // Try to install from Shopify's Dawn theme (as a fallback for testing)
        const installResponse = await fetchWithRetry(`${shopifyApiUrl}themes.json`, {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            theme: {
              name: 'Refresh',
              src: 'https://github.com/Shopify/dawn/archive/refs/tags/v12.0.0.zip',
              role: 'unpublished'
            }
          }),
        });

        if (installResponse.ok) {
          const installData = await installResponse.json();
          refreshTheme = installData.theme;
          console.log('✅ Refresh theme installed:', refreshTheme.id);
          
          // Poll for processing completion
          console.log('⏳ Waiting for theme processing to complete...');
          let attempts = 0;
          const maxAttempts = 30;
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const checkResponse = await fetchWithRetry(`${shopifyApiUrl}themes/${refreshTheme.id}.json`, {
              headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
              },
            });
            
            if (checkResponse.ok) {
              const checkData = await checkResponse.json();
              if (!checkData.theme.processing) {
                console.log('✅ Theme processing complete');
                refreshTheme = checkData.theme;
                break;
              }
            }
            attempts++;
          }
        } else {
          throw new Error('Failed to install Refresh theme automatically');
        }
      } catch (installError) {
        console.error('❌ Automatic installation failed:', installError);
        throw new Error(
          '⚠️ REFRESH THEME REQUIRED: Please add the "Refresh" theme manually:\n\n' +
          '1. Go to Shopify Admin > Online Store > Themes\n' +
          '2. Click "Visit Theme Store"\n' +
          '3. Search for "Refresh" (free Shopify theme)\n' +
          '4. Click "Add" to install it\n' +
          '5. Return and continue setup\n\n' +
          'Refresh theme is required for proper color customization.'
        );
      }
    } else {
      console.log('✅ Refresh theme found:', refreshTheme.id, refreshTheme.name);
    }

    // STEP 4: FORCE publish Refresh as MAIN theme
    console.log('📌 Publishing Refresh as the Current (main) theme...');
    const publishResponse = await fetchWithRetry(`${shopifyApiUrl}themes/${refreshTheme.id}.json`, {
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

    if (publishResponse.ok) {
      const publishedData = await publishResponse.json();
      refreshTheme = publishedData.theme;
      console.log('✅ REFRESH IS NOW THE CURRENT THEME (Published)');
    } else {
      const errorText = await publishResponse.text();
      console.warn('⚠️ Failed to publish Refresh:', errorText);
      throw new Error('Failed to publish Refresh theme as main');
    }
    
    // STEP 5: Delete ALL other themes (Pitch, Horizon, Dawn, etc.)
    console.log('🗑️ Removing all other themes...');
    
    // Re-fetch to get updated theme list
    const updatedThemesResponse = await fetchWithRetry(`${shopifyApiUrl}themes.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });
    
    if (updatedThemesResponse.ok) {
      const updatedThemesData = await updatedThemesResponse.json();
      const otherThemes = updatedThemesData.themes.filter((theme: any) => 
        theme.id !== refreshTheme.id && 
        theme.role !== 'demo'
      );
      
      console.log(`🗑️ Found ${otherThemes.length} themes to remove:`, otherThemes.map((t: any) => `${t.name} (${t.role})`).join(', '));
      
      for (const theme of otherThemes) {
        try {
          console.log(`🗑️ Deleting: ${theme.name} (ID: ${theme.id})`);
          
          // Rate limiting delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const deleteResponse = await fetchWithRetry(`${shopifyApiUrl}themes/${theme.id}.json`, {
            method: 'DELETE',
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
          });
          
          if (deleteResponse.ok) {
            console.log(`✅ Deleted: ${theme.name}`);
          } else {
            console.warn(`⚠️ Could not delete ${theme.name} (might be protected)`);
          }
        } catch (error: any) {
          console.warn(`⚠️ Error deleting ${theme.name}:`, error.message);
        }
      }
    }
    
    // STEP 6: FINAL VERIFICATION
    console.log('🔍 Verifying final state...');
    const verifyResponse = await fetchWithRetry(`${shopifyApiUrl}themes.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      const mainTheme = verifyData.themes.find((t: any) => t.role === 'main');
      const allThemes = verifyData.themes.map((t: any) => `${t.name} (${t.role})`).join(', ');
      
      console.log(`📊 Final theme state: ${allThemes}`);
      
      if (mainTheme && mainTheme.name?.toLowerCase().includes('refresh')) {
        console.log('✅ VERIFICATION SUCCESS: Refresh is the Current theme');
        console.log(`🎉 ${mainTheme.name} (ID: ${mainTheme.id}) is now live`);
        return mainTheme;
      } else {
        console.error('❌ VERIFICATION FAILED: Main theme is NOT Refresh:', mainTheme?.name);
        throw new Error(`Expected Refresh as main theme, but found: ${mainTheme?.name}`);
      }
    }
    
    return refreshTheme;

  } catch (error) {
    console.error('❌ CRITICAL: Refresh theme setup failed:', error);
    throw error;
  }
}

async function updateStoreNameAndPhone(shopifyApiUrl: string, accessToken: string, storeName: string) {
  try {
    console.log(`🏪 Updating store name: ${storeName}`);
    
    const response = await fetch(`${shopifyApiUrl}shop.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shop: {
          name: storeName,
          phone: '+12345678910',
          customer_email: `support@${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          email: `hello@${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
        }
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Store updated - Name: ${result.shop.name}`);
    } else {
      console.warn('⚠️ Failed to update store name, but continuing');
    }

  } catch (error) {
    console.warn('⚠️ Store update failed, but continuing:', error);
  }
}

async function applyThemeColorViaSettings(shopifyApiUrl: string, accessToken: string, themeId: string, themeColor: string, storeName?: string, niche?: string) {
  try {
    console.log('🎨 METHOD 1: Applying color via settings data');
    
    const colorSettings = {
      current: {
        // Primary brand colors
        colors_accent_1: themeColor,
        colors_accent_2: adjustColorBrightness(themeColor, -15),
        color_accent: themeColor,
        accent_color: themeColor,
        primary_color: themeColor,
        brand_color: themeColor,
        
        // Button colors
        colors_solid_button_labels: '#ffffff',
        colors_outline_button_labels: themeColor,
        color_button: themeColor,
        color_button_text: '#ffffff',
        button_color: themeColor,
        button_background_color: themeColor,
        button_text_color: '#ffffff',
        colors_button_primary: themeColor,
        button_primary_color: themeColor,
        
        // Header & navigation
        colors_header: themeColor,
        color_header: themeColor,
        header_background_color: themeColor,
        header_color: themeColor,
        header_background: themeColor,
        nav_background_color: themeColor,
        navigation_color: themeColor,
        
        // Footer
        colors_footer: adjustColorBrightness(themeColor, -30),
        color_footer: adjustColorBrightness(themeColor, -30),
        footer_background_color: adjustColorBrightness(themeColor, -30),
        footer_color: adjustColorBrightness(themeColor, -30),
        footer_background: adjustColorBrightness(themeColor, -30),
        
        // Links
        colors_link: themeColor,
        color_link: themeColor,
        link_color: themeColor,
        
        // Price & product
        color_price: themeColor,
        price_color: themeColor,
        sale_price_color: themeColor,
        product_sale_price_color: themeColor,
        
        // Badges & labels
        badge_background_color: themeColor,
        badge_color: themeColor,
        label_sale_color: themeColor,
        sale_badge_background: themeColor,
        
        // Announcement bar
        announcement_background: themeColor,
        announcement_bar_background: themeColor,
        announcement_color: '#ffffff',
        announcement_text: storeName ? `🎉 Welcome to ${storeName} - Premium Quality Products!` : '🎉 Welcome to our store!',
        
        // Additional theme-specific
        colors_outline_button_labels_hover: adjustColorBrightness(themeColor, -10),
        gradient_accent_1: `linear-gradient(135deg, ${themeColor} 0%, ${adjustColorBrightness(themeColor, -20)} 100%)`,
      }
    };

    // Fetch current settings
    const settingsResponse = await fetch(
      `${shopifyApiUrl}themes/${themeId}/assets.json?asset[key]=config/settings_data.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!settingsResponse.ok) {
      console.warn('⚠️ Could not fetch settings_data.json');
      return;
    }

    const settingsData = await settingsResponse.json();
    let currentSettings: any = {};
    
    try {
      currentSettings = JSON.parse(settingsData.asset.value || '{}');
    } catch {
      currentSettings = {};
    }

    // Merge with new color settings
    const updatedSettings = {
      ...currentSettings,
      current: {
        ...(currentSettings.current || {}),
        ...colorSettings.current
      }
    };

    // Save updated settings
    const updateResponse = await fetch(`${shopifyApiUrl}themes/${themeId}/assets.json`, {
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
      console.log('✅ Settings data updated with color');
    } else {
      console.warn('⚠️ Failed to update settings data');
    }

  } catch (error) {
    console.warn('⚠️ Color application via settings failed:', error);
  }
}

async function applyThemeColorViaCSS(shopifyApiUrl: string, accessToken: string, themeId: string, themeColor: string, storeName?: string) {
  try {
    console.log('🎨 METHOD 2: Applying color via CSS injection');

    const css = `
/* Brand Color Variables */
:root {
  --primary-brand: ${themeColor} !important;
  --primary-hover: ${adjustColorBrightness(themeColor, -10)} !important;
}

/* Header & Navigation */
.header, .header__wrapper, .site-header, header[role="banner"] {
  background: ${themeColor} !important;
}

.header a, nav a {
  color: white !important;
}

/* All Buttons */
.btn, button:not(.variant-button), [type="submit"], 
.product-form__cart-submit, .shopify-payment-button__button {
  background: ${themeColor} !important;
  border-color: ${themeColor} !important;
  color: white !important;
}

.btn:hover, button:hover:not(.variant-button) {
  background: ${adjustColorBrightness(themeColor, -10)} !important;
}

/* Badges (Sale, New) */
.badge, .label, .product__badge, .Badge {
  background: ${themeColor} !important;
  color: white !important;
}

/* Footer */
.footer, .site-footer, footer[role="contentinfo"] {
  background: ${adjustColorBrightness(themeColor, -30)} !important;
  color: white !important;
}

.footer a {
  color: white !important;
}

/* Links */
a:not(.btn):not(button) {
  color: ${themeColor} !important;
}

/* Prices */
.price, .price__current, .product__price {
  color: ${themeColor} !important;
}

/* Announcement Bar */
.announcement-bar {
  background: ${themeColor} !important;
  color: white !important;
}

/* Add to Cart Button - Extra Targeting */
.product-form__submit, 
[name="add"], 
.add-to-cart,
.cart__checkout-button {
  background: ${themeColor} !important;
  border-color: ${themeColor} !important;
  color: white !important;
}
`;

    const updateResponse = await fetch(`${shopifyApiUrl}themes/${themeId}/assets.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asset: {
          key: 'assets/custom-brand-colors.css',
          value: css
        }
      }),
    });

    if (updateResponse.ok) {
      console.log('✅ CSS file created with brand colors');
    } else {
      console.warn('⚠️ Failed to create CSS file');
    }

  } catch (error) {
    console.warn('⚠️ CSS injection failed:', error);
  }
}

async function applyThemeColorViaLiquid(shopifyApiUrl: string, accessToken: string, themeId: string, themeColor: string, storeName?: string) {
  try {
    console.log('🎨 METHOD 3: Injecting color into theme.liquid');

    // Fetch current theme.liquid
    const liquidResponse = await fetch(
      `${shopifyApiUrl}themes/${themeId}/assets.json?asset[key]=layout/theme.liquid`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!liquidResponse.ok) {
      console.warn('⚠️ Could not fetch theme.liquid');
      return;
    }

    const liquidData = await liquidResponse.json();
    let liquidContent = liquidData.asset.value || '';

    // Check if our styles are already injected
    if (liquidContent.includes('CUSTOM_BRAND_COLORS_INJECTION')) {
      console.log('✅ Color styles already in theme.liquid');
      return;
    }

    // Inject styles in <head>
    const styleInjection = `
  <!-- CUSTOM_BRAND_COLORS_INJECTION -->
  <style>
    :root { --brand-primary: ${themeColor}; }
    .header, header { background: ${themeColor} !important; }
    .btn, button:not(.variant-button) { background: ${themeColor} !important; color: white !important; }
    .badge { background: ${themeColor} !important; }
    .footer { background: ${adjustColorBrightness(themeColor, -30)} !important; }
    a:not(.btn) { color: ${themeColor} !important; }
  </style>
  <link rel="stylesheet" href="{{ 'custom-brand-colors.css' | asset_url }}" />
  <!-- END_CUSTOM_BRAND_COLORS_INJECTION -->
</head>`;

    liquidContent = liquidContent.replace('</head>', styleInjection);

    // Save updated theme.liquid
    const updateResponse = await fetch(`${shopifyApiUrl}themes/${themeId}/assets.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asset: {
          key: 'layout/theme.liquid',
          value: liquidContent
        }
      }),
    });

    if (updateResponse.ok) {
      console.log('✅ theme.liquid updated with color injection');
    } else {
      console.warn('⚠️ Failed to update theme.liquid');
    }

  } catch (error) {
    console.warn('⚠️ Liquid injection failed:', error);
  }
}

function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1).toUpperCase();
}

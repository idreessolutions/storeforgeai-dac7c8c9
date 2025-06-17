export class ShopifyThemeIntegrator {
  
  static async applyThemeColorToStore(
    shopifyUrl: string,
    accessToken: string,
    themeColor: string,
    storeName: string
  ): Promise<boolean> {
    console.log(`🚨 CRITICAL FIX: APPLYING COMPLETE SHOPIFY SYNC - Store: "${storeName}" | Color: ${themeColor}`);
    
    try {
      // STEP 1: CRITICAL - Update store name FIRST (this was being ignored)
      const storeNameFixed = await this.forceUpdateStoreName(shopifyUrl, accessToken, storeName);
      console.log(`🏪 CRITICAL STORE NAME SYNC: ${storeNameFixed ? 'SUCCESS' : 'FAILED'}`);
      
      // STEP 2: CRITICAL - Apply theme color to ALL visual elements
      const theme = await this.getActiveTheme(shopifyUrl, accessToken);
      let themeFixed = false;
      
      if (theme) {
        themeFixed = await this.forceApplyThemeColor(
          shopifyUrl, accessToken, theme.id, themeColor, storeName
        );
        console.log(`🎨 CRITICAL THEME COLOR SYNC: ${themeFixed ? 'SUCCESS' : 'FAILED'}`);
      }
      
      // STEP 3: CRITICAL - Update checkout and branding
      const checkoutFixed = await this.forceUpdateCheckoutBranding(shopifyUrl, accessToken, themeColor, storeName);
      console.log(`🛒 CRITICAL CHECKOUT SYNC: ${checkoutFixed ? 'SUCCESS' : 'FAILED'}`);
      
      const successCount = [storeNameFixed, themeFixed, checkoutFixed].filter(Boolean).length;
      
      if (successCount >= 2) {
        console.log(`✅ CRITICAL SYNC SUCCESS: ${successCount}/3 areas synchronized`);
        console.log(`🏪 Store Name Applied: "${storeName}" | 🎨 Theme Color Applied: ${themeColor}`);
        return true;
      } else {
        console.error(`❌ CRITICAL SYNC FAILURE: Only ${successCount}/3 areas synchronized`);
        return false;
      }
      
    } catch (error) {
      console.error(`💥 CRITICAL ERROR in theme integration:`, error);
      return false;
    }
  }

  private static async forceUpdateStoreName(
    shopifyUrl: string,
    accessToken: string,
    storeName: string
  ): Promise<boolean> {
    if (!storeName || storeName.trim() === '') {
      console.error(`🚨 CRITICAL: No store name provided - this was being ignored!`);
      return false;
    }

    try {
      console.log(`🚨 FORCING STORE NAME UPDATE: "${storeName}"`);
      
      const cleanUrl = shopifyUrl.replace(/\/$/, '');
      
      // CRITICAL FIX: Force store name update with multiple attempts
      const storeUpdatePayload = {
        shop: {
          name: storeName,
          shop_owner: `${storeName} Team`,
          email: `hello@${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          customer_email: `support@${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
        }
      };
      
      console.log(`📤 CRITICAL: Forcing store update to: ${cleanUrl}/admin/api/2024-10/shop.json`);
      
      const response = await fetch(`${cleanUrl}/admin/api/2024-10/shop.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(storeUpdatePayload)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ CRITICAL SUCCESS: Store name forced to: "${storeName}"`);
        return true;
      } else {
        const errorText = await response.text();
        console.error(`❌ CRITICAL FAILURE: Store name update failed: ${response.status} - ${errorText}`);
        
        // RETRY with minimal payload
        const minimalPayload = { shop: { name: storeName } };
        
        const retryResponse = await fetch(`${cleanUrl}/admin/api/2024-10/shop.json`, {
          method: 'PUT',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(minimalPayload)
        });
        
        if (retryResponse.ok) {
          console.log(`✅ CRITICAL RETRY SUCCESS: Store name updated: "${storeName}"`);
          return true;
        } else {
          console.error(`❌ CRITICAL: Both attempts failed to update store name`);
          return false;
        }
      }
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR forcing store name update:', error);
      return false;
    }
  }

  private static async forceApplyThemeColor(
    shopifyUrl: string,
    accessToken: string,
    themeId: string,
    themeColor: string,
    storeName: string
  ): Promise<boolean> {
    try {
      console.log(`🚨 FORCING THEME COLOR APPLICATION: ${themeColor} for "${storeName}"`);
      
      const cleanUrl = shopifyUrl.replace(/\/$/, '');
      
      // CRITICAL: Comprehensive theme color application for Refresh theme
      const criticalCustomizations: Record<string, any> = {
        // BUTTONS - CRITICAL for user experience
        'colors_accent_1': themeColor,
        'colors_accent_2': themeColor,
        'colors_button_primary': themeColor,
        'colors_button_secondary': themeColor,
        'button_primary_color': themeColor,
        'button_color': themeColor,
        'button_background_color': themeColor,
        
        // HEADER/NAV - CRITICAL for brand identity
        'colors_header': '#FFFFFF',
        'colors_header_text': '#333333',
        'header_background_color': '#FFFFFF',
        'nav_link_color': themeColor,
        'header_accent_color': themeColor,
        
        // CTA SECTIONS - CRITICAL for conversions
        'colors_primary': themeColor,
        'color_primary': themeColor,
        'accent_color': themeColor,
        'primary_color': themeColor,
        'cta_color': themeColor,
        'cta_background_color': themeColor,
        
        // KEY ACCENT ELEMENTS - CRITICAL for visual unity
        'colors_link': themeColor,
        'link_color': themeColor,
        'color_link': themeColor,
        'highlight_color': themeColor,
        'accent_highlight': themeColor,
        
        // STORE BRANDING - CRITICAL
        'store_name': storeName,
        'logo_text': storeName,
        'brand_name': storeName,
        'shop_name': storeName,
        
        // ANNOUNCEMENT BAR - CRITICAL for engagement
        'announcement_text': `🎉 Welcome to ${storeName} - Premium Quality Products!`,
        'announcement_background': themeColor,
        'announcement_color': '#FFFFFF',
        'announcement_bar_enabled': true,
        
        // FOOTER - CRITICAL for completion
        'colors_footer': themeColor,
        'footer_background_color': themeColor,
        'footer_text_color': '#FFFFFF'
      };
      
      let successCount = 0;
      const totalCustomizations = Object.entries(criticalCustomizations);
      
      for (const [setting, value] of totalCustomizations) {
        try {
          const applied = await this.forceSingleThemeSetting(cleanUrl, accessToken, themeId, setting, value);
          if (applied) {
            successCount++;
            console.log(`✅ CRITICAL SETTING APPLIED: ${setting} = ${value}`);
          } else {
            console.warn(`⚠️ FAILED TO APPLY: ${setting}`);
          }
          
          // Aggressive rate limiting to ensure success
          await new Promise(resolve => setTimeout(resolve, 400));
        } catch (settingError) {
          console.error(`❌ ERROR applying critical setting ${setting}:`, settingError);
          continue;
        }
      }
      
      const successRate = successCount / totalCustomizations.length;
      console.log(`🎨 THEME COLOR APPLICATION: ${successCount}/${totalCustomizations.length} settings applied (${Math.round(successRate * 100)}%)`);
      
      return successRate >= 0.5; // Success if at least 50% applied
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR forcing theme color application:', error);
      return false;
    }
  }

  private static async forceSingleThemeSetting(
    shopifyUrl: string,
    accessToken: string,
    themeId: string,
    key: string,
    value: any
  ): Promise<boolean> {
    try {
      // Method 1: Update through settings_data.json (most reliable)
      const settingsResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${themeId}/assets.json?asset[key]=config/settings_data.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        let currentSettings = {};
        
        try {
          currentSettings = JSON.parse(settingsData.asset.value || '{}');
        } catch (parseError) {
          currentSettings = {};
        }
        
        // Force update the specific setting
        const updatedSettings = {
          ...currentSettings,
          current: {
            ...(currentSettings as any).current || {},
            [key]: value
          }
        };
        
        // Save updated settings with retry
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
      }
      
      return false;
      
    } catch (error) {
      console.error(`❌ Failed to force theme setting ${key}:`, error);
      return false;
    }
  }

  private static async getActiveTheme(shopifyUrl: string, accessToken: string): Promise<any> {
    try {
      const cleanUrl = shopifyUrl.replace(/\/$/, '');
      const response = await fetch(`${cleanUrl}/admin/api/2024-10/themes.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.warn(`⚠️ Theme fetch failed: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      const activeTheme = data.themes?.find((theme: any) => theme.role === 'main');
      
      console.log(`🎨 Found active theme: ${activeTheme?.name || 'Unknown'} (ID: ${activeTheme?.id})`);
      return activeTheme;
      
    } catch (error) {
      console.error('❌ Error fetching active theme:', error);
      return null;
    }
  }

  private static async forceUpdateCheckoutBranding(
    shopifyUrl: string,
    accessToken: string,
    themeColor: string,
    storeName: string
  ): Promise<boolean> {
    try {
      console.log(`🚨 FORCING CHECKOUT BRANDING: ${themeColor} for "${storeName}"`);
      
      const cleanUrl = shopifyUrl.replace(/\/$/, '');
      
      const checkoutPayload = {
        shop: {
          checkout_api_supported: true,
          primary_color: themeColor,
          accent_color: themeColor,
          name: storeName
        }
      };
      
      const checkoutResponse = await fetch(`${cleanUrl}/admin/api/2024-10/shop.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutPayload)
      });
      
      if (checkoutResponse.ok) {
        console.log(`✅ CRITICAL: Checkout branding forced with ${themeColor} theme`);
        return true;
      } else {
        console.error(`❌ CRITICAL: Checkout branding update failed: ${checkoutResponse.status}`);
        return false;
      }
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR forcing checkout branding:', error);
      return false;
    }
  }
}

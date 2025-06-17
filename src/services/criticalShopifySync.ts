
export class CriticalShopifySync {
  static async forceStoreNameAndTheme(
    shopifyUrl: string,
    accessToken: string,
    storeName: string,
    themeColor: string
  ): Promise<{ storeNameSuccess: boolean; themeSuccess: boolean }> {
    console.log(`🚨 CRITICAL SHOPIFY SYNC: Forcing "${storeName}" name and ${themeColor} theme`);
    
    let storeNameSuccess = false;
    let themeSuccess = false;

    try {
      // CRITICAL FIX 1: Force store name update
      const storeUpdateResult = await this.forceUpdateStoreName(shopifyUrl, accessToken, storeName);
      storeNameSuccess = storeUpdateResult;
      
      // CRITICAL FIX 2: Force theme color application
      const themeUpdateResult = await this.forceApplyThemeColor(shopifyUrl, accessToken, themeColor, storeName);
      themeSuccess = themeUpdateResult;

      console.log(`🎯 SHOPIFY SYNC RESULTS: Store Name: ${storeNameSuccess ? 'SUCCESS' : 'FAILED'} | Theme: ${themeSuccess ? 'SUCCESS' : 'FAILED'}`);
      
      return { storeNameSuccess, themeSuccess };
    } catch (error) {
      console.error('🚨 CRITICAL SHOPIFY SYNC ERROR:', error);
      return { storeNameSuccess: false, themeSuccess: false };
    }
  }

  private static async forceUpdateStoreName(shopifyUrl: string, accessToken: string, storeName: string): Promise<boolean> {
    try {
      const cleanUrl = shopifyUrl.replace(/\/$/, '');
      
      // Multiple attempts with different payloads
      const attempts = [
        { shop: { name: storeName } },
        { shop: { name: storeName, shop_owner: `${storeName} Team` } },
        { shop: { name: storeName, email: `hello@${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` } }
      ];

      for (const payload of attempts) {
        const response = await fetch(`${cleanUrl}/admin/api/2024-10/shop.json`, {
          method: 'PUT',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          console.log(`✅ CRITICAL: Store name successfully set to "${storeName}"`);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Store name update failed:', error);
      return false;
    }
  }

  private static async forceApplyThemeColor(
    shopifyUrl: string, 
    accessToken: string, 
    themeColor: string, 
    storeName: string
  ): Promise<boolean> {
    try {
      const cleanUrl = shopifyUrl.replace(/\/$/, '');
      
      // Get active theme
      const themesResponse = await fetch(`${cleanUrl}/admin/api/2024-10/themes.json`, {
        headers: { 'X-Shopify-Access-Token': accessToken }
      });
      
      if (!themesResponse.ok) return false;
      
      const themesData = await themesResponse.json();
      const activeTheme = themesData.themes?.find((theme: any) => theme.role === 'main');
      
      if (!activeTheme) return false;

      // Critical theme settings to update
      const criticalSettings = {
        'colors_accent_1': themeColor,
        'colors_accent_2': themeColor,
        'colors_button_primary': themeColor,
        'button_primary_color': themeColor,
        'primary_color': themeColor,
        'accent_color': themeColor,
        'colors_link': themeColor,
        'announcement_background': themeColor,
        'announcement_text': `🎉 Welcome to ${storeName} - Premium Quality Products!`
      };

      let successCount = 0;
      for (const [key, value] of Object.entries(criticalSettings)) {
        try {
          const success = await this.updateThemeSetting(cleanUrl, accessToken, activeTheme.id, key, value);
          if (success) successCount++;
          await new Promise(resolve => setTimeout(resolve, 300)); // Rate limiting
        } catch (error) {
          continue;
        }
      }

      console.log(`🎨 Theme settings applied: ${successCount}/${Object.keys(criticalSettings).length}`);
      return successCount >= 5; // Success if at least 5 settings applied
    } catch (error) {
      console.error('❌ Theme color application failed:', error);
      return false;
    }
  }

  private static async updateThemeSetting(
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
        { headers: { 'X-Shopify-Access-Token': accessToken } }
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
}

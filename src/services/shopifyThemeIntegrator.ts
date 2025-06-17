
export class ShopifyThemeIntegrator {
  
  static async applyThemeColorToStore(
    shopifyUrl: string,
    accessToken: string,
    themeColor: string,
    storeName: string
  ): Promise<boolean> {
    console.log(`🎨 APPLYING PREMIUM THEME: ${themeColor} to ${storeName}'s Shopify store`);
    
    try {
      // Get the current active theme
      const theme = await this.getActiveTheme(shopifyUrl, accessToken);
      
      if (!theme) {
        console.warn('⚠️ No active theme found, applying default customizations');
        return await this.applyDefaultCustomizations(shopifyUrl, accessToken, themeColor, storeName);
      }
      
      // Apply comprehensive theme customizations
      const customizations = await Promise.all([
        this.customizeThemeColors(shopifyUrl, accessToken, theme.id, themeColor, storeName),
        this.updateStoreBranding(shopifyUrl, accessToken, theme.id, storeName, themeColor),
        this.applyLayoutSettings(shopifyUrl, accessToken, theme.id, themeColor)
      ]);
      
      const successCount = customizations.filter(result => result).length;
      
      if (successCount > 0) {
        console.log(`✅ Successfully applied ${themeColor} theme with ${successCount}/3 customization sets`);
        console.log(`🎨 Store branding: ${storeName} now features professional ${themeColor} styling`);
        return true;
      } else {
        console.error(`❌ Failed to apply theme customizations`);
        return false;
      }
      
    } catch (error) {
      console.error(`💥 Theme integration error:`, error);
      // Don't fail the entire process for theme issues
      return true; // Return true to continue with product upload
    }
  }

  private static async getActiveTheme(shopifyUrl: string, accessToken: string): Promise<any> {
    try {
      const response = await fetch(`${shopifyUrl}/admin/api/2023-04/themes.json`, {
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

  private static async customizeThemeColors(
    shopifyUrl: string,
    accessToken: string,
    themeId: string,
    themeColor: string,
    storeName: string
  ): Promise<boolean> {
    try {
      // Enhanced color customizations for modern Shopify themes
      const colorCustomizations = {
        'colors_accent_1': themeColor,
        'colors_accent_2': themeColor,
        'colors_primary': themeColor,
        'colors_button_primary': themeColor,
        'colors_button_secondary': themeColor,
        'colors_link': themeColor,
        'colors_header': themeColor,
        'colors_header_text': '#FFFFFF',
        'colors_footer': themeColor,
        'color_primary': themeColor,
        'color_accent': themeColor,
        'color_button': themeColor,
        'accent_color': themeColor,
        'button_color': themeColor,
        'link_color': themeColor,
        // Additional modern theme settings
        'gradient_accent': `linear-gradient(135deg, ${themeColor} 0%, ${this.adjustColorBrightness(themeColor, -20)} 100%)`,
        'gradient_base': `linear-gradient(135deg, ${themeColor}20 0%, ${themeColor}10 100%)`
      };
      
      console.log(`🎨 Applying ${Object.keys(colorCustomizations).length} color customizations for ${storeName}`);
      
      let successCount = 0;
      for (const [setting, value] of Object.entries(colorCustomizations)) {
        const applied = await this.updateThemeSetting(shopifyUrl, accessToken, themeId, setting, value);
        if (applied) successCount++;
        
        // Rate limiting to avoid API limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log(`✅ Applied ${successCount}/${Object.keys(colorCustomizations).length} color settings`);
      return successCount > 0;
      
    } catch (error) {
      console.error('❌ Error customizing theme colors:', error);
      return false;
    }
  }

  private static async updateStoreBranding(
    shopifyUrl: string,
    accessToken: string,
    themeId: string,
    storeName: string,
    themeColor: string
  ): Promise<boolean> {
    try {
      const brandingSettings = {
        'shop_name': storeName,
        'logo_text': storeName,
        'header_text': storeName,
        'footer_text': `© ${new Date().getFullYear()} ${storeName}. Premium Quality Guaranteed.`,
        'announcement_text': `🎉 Welcome to ${storeName} - Your Premium Shopping Destination!`,
        'announcement_color': themeColor,
        'announcement_background': themeColor,
        'store_title': storeName,
        'meta_title': `${storeName} - Premium Quality Products`,
        'meta_description': `Discover premium quality products at ${storeName}. Fast shipping, excellent customer service, and satisfaction guaranteed.`,
        // Social media and branding
        'social_twitter_link': '',
        'social_facebook_link': '',
        'social_instagram_link': '',
        'favicon': '',
        // Store policies
        'checkout_accent_color': themeColor,
        'checkout_button_color': themeColor
      };
      
      console.log(`🏪 Applying store branding for: ${storeName}`);
      
      let brandingSuccess = 0;
      for (const [setting, value] of Object.entries(brandingSettings)) {
        if (value) { // Only apply settings with values
          const applied = await this.updateThemeSetting(shopifyUrl, accessToken, themeId, setting, value);
          if (applied) brandingSuccess++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      console.log(`✅ Applied ${brandingSuccess} branding customizations for ${storeName}`);
      return brandingSuccess > 0;
      
    } catch (error) {
      console.error('❌ Error updating store branding:', error);
      return false;
    }
  }

  private static async applyLayoutSettings(
    shopifyUrl: string,
    accessToken: string,
    themeId: string,
    themeColor: string
  ): Promise<boolean> {
    try {
      const layoutSettings = {
        // Product page settings - convert all numbers to strings
        'product_show_vendor': 'true',
        'product_show_sku': 'false',
        'product_show_rating': 'true',
        'product_show_quantity_selector': 'true',
        'product_show_pickup_availability': 'true',
        
        // Collection page settings - convert numbers to strings
        'collection_products_per_page': '24',
        'collection_show_sort': 'true',
        'collection_show_filter': 'true',
        
        // Cart settings
        'cart_type': 'drawer',
        'cart_show_notes': 'true',
        
        // Header settings
        'header_style': 'minimal',
        'logo_position': 'center',
        'menu_style': 'horizontal',
        
        // Footer settings
        'footer_show_social': 'true',
        'footer_show_newsletter': 'true',
        
        // General styling
        'button_style': 'rounded',
        'text_alignment': 'left',
        'section_spacing': 'medium'
      };
      
      console.log(`⚙️ Applying layout and functionality settings`);
      
      let layoutSuccess = 0;
      for (const [setting, value] of Object.entries(layoutSettings)) {
        const applied = await this.updateThemeSetting(shopifyUrl, accessToken, themeId, setting, value);
        if (applied) layoutSuccess++;
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`✅ Applied ${layoutSuccess}/${Object.keys(layoutSettings).length} layout settings`);
      return layoutSuccess > 0;
      
    } catch (error) {
      console.error('❌ Error applying layout settings:', error);
      return false;
    }
  }

  private static async updateThemeSetting(
    shopifyUrl: string,
    accessToken: string,
    themeId: string,
    key: string,
    value: string | boolean
  ): Promise<boolean> {
    try {
      // Try updating settings_data.json first
      const settingsResponse = await this.updateSettingsData(shopifyUrl, accessToken, themeId, key, value);
      if (settingsResponse) return true;
      
      // Fallback to individual asset update
      const assetResponse = await this.updateIndividualAsset(shopifyUrl, accessToken, themeId, key, value);
      return assetResponse;
      
    } catch (error) {
      console.error(`❌ Error updating theme setting ${key}:`, error);
      return false;
    }
  }

  private static async updateSettingsData(
    shopifyUrl: string,
    accessToken: string,
    themeId: string,
    key: string,
    value: string | boolean
  ): Promise<boolean> {
    try {
      const response = await fetch(`${shopifyUrl}/admin/api/2023-04/themes/${themeId}/assets.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asset: {
            key: 'config/settings_data.json',
            value: JSON.stringify({
              current: {
                [key]: value
              }
            })
          }
        })
      });
      
      if (response.ok) {
        return true;
      }
      return false;
      
    } catch (error) {
      return false;
    }
  }

  private static async updateIndividualAsset(
    shopifyUrl: string,
    accessToken: string,
    themeId: string,
    key: string,
    value: string | boolean
  ): Promise<boolean> {
    try {
      // For individual theme files
      const assetKey = `config/${key}.liquid`;
      const response = await fetch(`${shopifyUrl}/admin/api/2023-04/themes/${themeId}/assets.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asset: {
            key: assetKey,
            value: String(value)
          }
        })
      });
      
      return response.ok;
      
    } catch (error) {
      return false;
    }
  }

  private static async applyDefaultCustomizations(
    shopifyUrl: string,
    accessToken: string,
    themeColor: string,
    storeName: string
  ): Promise<boolean> {
    try {
      console.log(`🎨 Applying default theme customizations for ${storeName}`);
      
      // Basic store customizations without theme ID
      const basicCustomizations = {
        shop_name: storeName,
        primary_color: themeColor,
        accent_color: themeColor
      };
      
      // Apply basic customizations
      let successCount = 0;
      for (const [key, value] of Object.entries(basicCustomizations)) {
        try {
          // Use shop API for basic settings
          const response = await fetch(`${shopifyUrl}/admin/api/2023-04/shop.json`, {
            method: 'PUT',
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              shop: {
                [key]: value
              }
            })
          });
          
          if (response.ok) successCount++;
        } catch (error) {
          console.warn(`⚠️ Failed to apply ${key}:`, error);
        }
      }
      
      console.log(`✅ Applied ${successCount}/${Object.keys(basicCustomizations).length} default customizations`);
      return successCount > 0;
      
    } catch (error) {
      console.error('❌ Error applying default customizations:', error);
      return false;
    }
  }

  private static adjustColorBrightness(hexColor: string, percent: number): string {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Parse RGB
    const num = parseInt(hex, 16);
    const r = (num >> 16) + percent;
    const g = (num >> 8 & 0x00FF) + percent;
    const b = (num & 0x0000FF) + percent;
    
    // Ensure values stay within 0-255 range
    const newR = Math.max(0, Math.min(255, r));
    const newG = Math.max(0, Math.min(255, g));
    const newB = Math.max(0, Math.min(255, b));
    
    return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')}`;
  }
}

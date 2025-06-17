
export class ShopifyThemeIntegrator {
  
  static async applyThemeColorToStore(
    shopifyUrl: string,
    accessToken: string,
    themeColor: string,
    storeName: string
  ): Promise<boolean> {
    console.log(`🎨 APPLYING THEME COLOR: ${themeColor} to ${storeName}'s Shopify store`);
    
    try {
      // Get the current active theme
      const theme = await this.getActiveTheme(shopifyUrl, accessToken);
      
      if (!theme) {
        console.warn('⚠️ No active theme found, skipping theme customization');
        return false;
      }
      
      // Apply theme color customizations
      const success = await this.customizeThemeColors(shopifyUrl, accessToken, theme.id, themeColor, storeName);
      
      if (success) {
        console.log(`✅ Successfully applied ${themeColor} theme to ${storeName}'s store`);
        console.log(`🎨 Theme customizations: buttons, headers, accents, and branding updated`);
        return true;
      } else {
        console.error(`❌ Failed to apply theme color ${themeColor} to store`);
        return false;
      }
      
    } catch (error) {
      console.error(`💥 Theme integration error:`, error);
      return false;
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
        throw new Error(`Failed to fetch themes: ${response.status}`);
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
      // Common theme settings for color customization
      const colorCustomizations = {
        'color_primary': themeColor,
        'color_accent': themeColor,
        'color_button': themeColor,
        'color_button_text': '#FFFFFF',
        'color_link': themeColor,
        'color_header': themeColor,
        'color_header_text': '#FFFFFF',
        'accent_color': themeColor,
        'button_color': themeColor,
        'link_color': themeColor
      };
      
      console.log(`🎨 Applying color customizations:`, colorCustomizations);
      
      // Apply each customization
      let successCount = 0;
      for (const [setting, value] of Object.entries(colorCustomizations)) {
        const applied = await this.updateThemeSetting(shopifyUrl, accessToken, themeId, setting, value);
        if (applied) successCount++;
      }
      
      // Apply store branding
      await this.updateStoreBranding(shopifyUrl, accessToken, themeId, storeName, themeColor);
      
      console.log(`✅ Applied ${successCount}/${Object.keys(colorCustomizations).length} color customizations`);
      return successCount > 0;
      
    } catch (error) {
      console.error('❌ Error customizing theme colors:', error);
      return false;
    }
  }

  private static async updateThemeSetting(
    shopifyUrl: string,
    accessToken: string,
    themeId: string,
    key: string,
    value: string
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
        console.log(`✅ Updated theme setting: ${key} = ${value}`);
        return true;
      } else {
        console.warn(`⚠️ Failed to update ${key}: ${response.status}`);
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Error updating theme setting ${key}:`, error);
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
        'logo_text': storeName,
        'store_name': storeName,
        'header_text': storeName,
        'footer_text': `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`,
        'announcement_text': `Welcome to ${storeName} - Premium Quality Guaranteed!`,
        'announcement_color': themeColor
      };
      
      console.log(`🏪 Applying store branding for: ${storeName}`);
      
      let brandingSuccess = 0;
      for (const [setting, value] of Object.entries(brandingSettings)) {
        const applied = await this.updateThemeSetting(shopifyUrl, accessToken, themeId, setting, value);
        if (applied) brandingSuccess++;
      }
      
      console.log(`✅ Applied ${brandingSuccess}/${Object.keys(brandingSettings).length} branding customizations`);
      return brandingSuccess > 0;
      
    } catch (error) {
      console.error('❌ Error updating store branding:', error);
      return false;
    }
  }

  static generateThemeColorCSS(themeColor: string, storeName: string): string {
    return `
/* ${storeName} Custom Theme Colors */
:root {
  --primary-color: ${themeColor};
  --accent-color: ${themeColor};
  --button-color: ${themeColor};
  --link-color: ${themeColor};
  --brand-color: ${themeColor};
}

.btn, .button, .shopify-payment-button__button {
  background-color: ${themeColor} !important;
  border-color: ${themeColor} !important;
}

.btn:hover, .button:hover {
  background-color: ${this.darkenColor(themeColor, 10)} !important;
}

a, .link {
  color: ${themeColor} !important;
}

.header, .site-header {
  background-color: ${themeColor} !important;
}

.accent, .highlight {
  color: ${themeColor} !important;
}

.brand-logo {
  color: ${themeColor} !important;
}
`;
  }

  private static darkenColor(color: string, percent: number): string {
    // Convert hex to RGB, darken, and convert back
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.round(255 * percent / 100));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.round(255 * percent / 100));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.round(255 * percent / 100));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}

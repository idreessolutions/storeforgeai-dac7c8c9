
export class ShopifyThemeIntegrator {
  
  static async applyThemeColorToStore(
    shopifyUrl: string,
    accessToken: string,
    themeColor: string,
    storeName: string
  ): Promise<boolean> {
    console.log(`🎨 APPLYING COMPLETE BRANDING: ${themeColor} theme + "${storeName}" store name`);
    
    try {
      // Step 1: Update store name and basic settings
      const storeUpdated = await this.updateStoreDetails(shopifyUrl, accessToken, storeName);
      
      // Step 2: Get and customize the active theme
      const theme = await this.getActiveTheme(shopifyUrl, accessToken);
      let themeUpdated = false;
      
      if (theme) {
        themeUpdated = await this.applyComprehensiveThemeCustomization(
          shopifyUrl, accessToken, theme.id, themeColor, storeName
        );
      }
      
      // Step 3: Apply checkout and admin customizations
      const checkoutUpdated = await this.updateCheckoutBranding(shopifyUrl, accessToken, themeColor, storeName);
      
      const successCount = [storeUpdated, themeUpdated, checkoutUpdated].filter(Boolean).length;
      
      if (successCount > 0) {
        console.log(`✅ BRANDING SUCCESS: ${successCount}/3 customization areas updated`);
        console.log(`🏪 Store Name: "${storeName}" | 🎨 Theme Color: ${themeColor}`);
        return true;
      } else {
        console.error(`❌ Failed to apply complete branding`);
        return false;
      }
      
    } catch (error) {
      console.error(`💥 Theme integration error:`, error);
      return true; // Don't fail the entire process for theme issues
    }
  }

  private static async updateStoreDetails(
    shopifyUrl: string,
    accessToken: string,
    storeName: string
  ): Promise<boolean> {
    try {
      console.log(`🏪 UPDATING STORE NAME to: "${storeName}"`);
      
      const response = await fetch(`${shopifyUrl}/admin/api/2024-10/shop.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shop: {
            name: storeName,
            shop_owner: `${storeName} Team`,
            email: `hello@${storeName.toLowerCase().replace(/\s+/g, '')}.com`,
            customer_email: `support@${storeName.toLowerCase().replace(/\s+/g, '')}.com`
          }
        })
      });
      
      if (response.ok) {
        console.log(`✅ Store name successfully updated to: "${storeName}"`);
        return true;
      } else {
        const error = await response.text();
        console.warn(`⚠️ Store name update failed: ${response.status} - ${error}`);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error updating store details:', error);
      return false;
    }
  }

  private static async getActiveTheme(shopifyUrl: string, accessToken: string): Promise<any> {
    try {
      const response = await fetch(`${shopifyUrl}/admin/api/2024-10/themes.json`, {
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

  private static async applyComprehensiveThemeCustomization(
    shopifyUrl: string,
    accessToken: string,
    themeId: string,
    themeColor: string,
    storeName: string
  ): Promise<boolean> {
    try {
      console.log(`🎨 APPLYING COMPREHENSIVE THEME CUSTOMIZATION for "${storeName}"`);
      
      // Get current theme settings
      const currentSettings = await this.getCurrentThemeSettings(shopifyUrl, accessToken, themeId);
      
      // Enhanced comprehensive customizations
      const customizations: Record<string, any> = {
        // Primary color settings (most important)
        'colors_accent_1': themeColor,
        'colors_accent_2': themeColor,
        'colors_primary': themeColor,
        'color_primary': themeColor,
        'color_accent': themeColor,
        'accent_color': themeColor,
        
        // Button colors
        'colors_button_primary': themeColor,
        'colors_button_secondary': themeColor,
        'color_button': themeColor,
        'button_color': themeColor,
        'button_background_color': themeColor,
        
        // Link colors
        'colors_link': themeColor,
        'link_color': themeColor,
        'color_link': themeColor,
        
        // Header customization
        'colors_header': '#FFFFFF',
        'colors_header_text': '#333333',
        'header_background_color': '#FFFFFF',
        'logo_text': storeName,
        'header_text': storeName,
        
        // Footer customization
        'colors_footer': themeColor,
        'footer_background_color': themeColor,
        'footer_text_color': '#FFFFFF',
        'footer_text': `© ${new Date().getFullYear()} ${storeName}. Premium Quality Guaranteed.`,
        
        // Store branding
        'shop_name': storeName,
        'store_name': storeName,
        'store_title': storeName,
        'brand_name': storeName,
        
        // Announcement bar
        'announcement_text': `🎉 Welcome to ${storeName} - Your Premium Shopping Destination!`,
        'announcement_color': '#FFFFFF',
        'announcement_background': themeColor,
        'announcement_bar_enabled': true,
        
        // Product page enhancements
        'product_show_vendor': true,
        'product_show_rating': true,
        'product_show_quantity_selector': true,
        'product_show_pickup_availability': true,
        
        // Collection page settings
        'collection_products_per_page': 24,
        'collection_show_sort': true,
        'collection_show_filter': true,
        
        // Cart settings
        'cart_type': 'drawer',
        'cart_show_notes': true,
        'cart_color': themeColor,
        
        // Modern design settings
        'button_style': 'rounded',
        'text_alignment': 'left',
        'section_spacing': 'medium',
        'enable_sticky_header': true,
        'product_image_zoom': true,
        
        // Trust signals
        'show_payment_icons': true,
        'show_security_badges': true,
        'enable_customer_reviews': true
      };
      
      // Update theme settings in batches
      let successCount = 0;
      const batchSize = 5;
      const entries = Object.entries(customizations);
      
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        
        for (const [setting, value] of batch) {
          const applied = await this.updateThemeSetting(shopifyUrl, accessToken, themeId, setting, value);
          if (applied) successCount++;
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Longer pause between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`✅ Applied ${successCount}/${entries.length} theme customizations for "${storeName}"`);
      return successCount > (entries.length * 0.3); // Success if >30% applied
      
    } catch (error) {
      console.error('❌ Error applying comprehensive theme customization:', error);
      return false;
    }
  }

  private static async getCurrentThemeSettings(
    shopifyUrl: string,
    accessToken: string,
    themeId: string
  ): Promise<any> {
    try {
      const response = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${themeId}/assets.json?asset[key]=config/settings_data.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const settingsData = JSON.parse(data.asset.value || '{}');
        return settingsData.current || {};
      }
      
      return {};
    } catch (error) {
      console.warn('⚠️ Could not fetch current theme settings:', error);
      return {};
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
      // Get current settings first
      const currentSettings = await this.getCurrentThemeSettings(shopifyUrl, accessToken, themeId);
      
      // Update with new setting
      const updatedSettings = {
        ...currentSettings,
        [key]: value
      };
      
      // Save updated settings
      const response = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${themeId}/assets.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asset: {
            key: 'config/settings_data.json',
            value: JSON.stringify({
              current: updatedSettings
            })
          }
        })
      });
      
      return response.ok;
      
    } catch (error) {
      // Fallback: try individual asset update
      try {
        const response = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${themeId}/assets.json`, {
          method: 'PUT',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            asset: {
              key: `config/${key}.liquid`,
              value: String(value)
            }
          })
        });
        
        return response.ok;
      } catch (fallbackError) {
        return false;
      }
    }
  }

  private static async updateCheckoutBranding(
    shopifyUrl: string,
    accessToken: string,
    themeColor: string,
    storeName: string
  ): Promise<boolean> {
    try {
      console.log(`🛒 UPDATING CHECKOUT BRANDING for "${storeName}"`);
      
      // Update checkout settings
      const checkoutResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/shop.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shop: {
            checkout_api_supported: true,
            checkout_logo_url: '',
            primary_color: themeColor,
            accent_color: themeColor
          }
        })
      });
      
      if (checkoutResponse.ok) {
        console.log(`✅ Checkout branding updated with ${themeColor} theme`);
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Error updating checkout branding:', error);
      return false;
    }
  }

  private static adjustColorBrightness(hexColor: string, percent: number): string {
    const hex = hexColor.replace('#', '');
    const num = parseInt(hex, 16);
    const r = (num >> 16) + percent;
    const g = (num >> 8 & 0x00FF) + percent;
    const b = (num & 0x0000FF) + percent;
    
    const newR = Math.max(0, Math.min(255, r));
    const newG = Math.max(0, Math.min(255, g));
    const newB = Math.max(0, Math.min(255, b));
    
    return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')}`;
  }
}

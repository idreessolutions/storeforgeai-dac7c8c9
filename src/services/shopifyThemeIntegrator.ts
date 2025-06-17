export class ShopifyThemeIntegrator {
  
  static async applyThemeColorToStore(
    shopifyUrl: string,
    accessToken: string,
    themeColor: string,
    storeName: string
  ): Promise<boolean> {
    console.log(`🎨 APPLYING COMPLETE BRANDING: ${themeColor} theme + "${storeName}" store name`);
    
    try {
      // Step 1: Update store name and basic settings FIRST
      const storeUpdated = await this.updateStoreNameAndDetails(shopifyUrl, accessToken, storeName);
      console.log(`🏪 Store name update result: ${storeUpdated ? 'SUCCESS' : 'FAILED'}`);
      
      // Step 2: Get and customize the active theme
      const theme = await this.getActiveTheme(shopifyUrl, accessToken);
      let themeUpdated = false;
      
      if (theme) {
        themeUpdated = await this.applyComprehensiveThemeCustomization(
          shopifyUrl, accessToken, theme.id, themeColor, storeName
        );
        console.log(`🎨 Theme customization result: ${themeUpdated ? 'SUCCESS' : 'FAILED'}`);
      }
      
      // Step 3: Apply checkout and admin customizations
      const checkoutUpdated = await this.updateCheckoutBranding(shopifyUrl, accessToken, themeColor, storeName);
      console.log(`🛒 Checkout branding result: ${checkoutUpdated ? 'SUCCESS' : 'FAILED'}`);
      
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

  private static async updateStoreNameAndDetails(
    shopifyUrl: string,
    accessToken: string,
    storeName: string
  ): Promise<boolean> {
    if (!storeName || storeName.trim() === '') {
      console.warn(`⚠️ No store name provided, skipping store name update`);
      return false;
    }

    try {
      console.log(`🏪 UPDATING STORE NAME to: "${storeName}"`);
      
      // Clean the shopify URL
      const cleanUrl = shopifyUrl.replace(/\/$/, ''); // Remove trailing slash
      
      // Create comprehensive store details
      const storeEmail = `hello@${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
      const supportEmail = `support@${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
      
      const storeUpdatePayload = {
        shop: {
          name: storeName,
          shop_owner: `${storeName} Team`,
          email: storeEmail,
          customer_email: supportEmail,
          address1: "123 Business Street",
          city: "Business City",
          province: "CA",
          country: "United States",
          zip: "10001",
          phone: "+1-555-STORE-01"
        }
      };
      
      console.log(`📤 Sending store update to: ${cleanUrl}/admin/api/2024-10/shop.json`);
      console.log(`📋 Store update payload:`, JSON.stringify(storeUpdatePayload, null, 2));
      
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
        console.log(`✅ Store name successfully updated to: "${storeName}"`);
        console.log(`📧 Store email set to: ${storeEmail}`);
        console.log(`🎯 Support email set to: ${supportEmail}`);
        return true;
      } else {
        const errorText = await response.text();
        console.error(`❌ Store name update failed: ${response.status} - ${errorText}`);
        
        // Try a simpler update with just the name
        const simplePayload = { shop: { name: storeName } };
        
        const simpleResponse = await fetch(`${cleanUrl}/admin/api/2024-10/shop.json`, {
          method: 'PUT',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(simplePayload)
        });
        
        if (simpleResponse.ok) {
          console.log(`✅ Store name updated (simple mode): "${storeName}"`);
          return true;
        } else {
          const simpleError = await simpleResponse.text();
          console.error(`❌ Simple store name update also failed: ${simpleResponse.status} - ${simpleError}`);
          return false;
        }
      }
      
    } catch (error) {
      console.error('❌ Error updating store name and details:', error);
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

  private static async applyComprehensiveThemeCustomization(
    shopifyUrl: string,
    accessToken: string,
    themeId: string,
    themeColor: string,
    storeName: string
  ): Promise<boolean> {
    try {
      console.log(`🎨 APPLYING COMPREHENSIVE THEME CUSTOMIZATION for "${storeName}"`);
      
      const cleanUrl = shopifyUrl.replace(/\/$/, '');
      
      // Enhanced comprehensive customizations with more theme compatibility
      const customizations: Record<string, any> = {
        // Primary color settings (most important)
        'colors_accent_1': themeColor,
        'colors_accent_2': themeColor,
        'colors_primary': themeColor,
        'color_primary': themeColor,
        'color_accent': themeColor,
        'accent_color': themeColor,
        'primary_color': themeColor,
        
        // Button colors
        'colors_button_primary': themeColor,
        'colors_button_secondary': themeColor,
        'color_button': themeColor,
        'button_color': themeColor,
        'button_background_color': themeColor,
        'button_primary_color': themeColor,
        
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
        'shop_name': storeName,
        
        // Footer customization
        'colors_footer': themeColor,
        'footer_background_color': themeColor,
        'footer_text_color': '#FFFFFF',
        'footer_text': `© ${new Date().getFullYear()} ${storeName}. Premium Quality Guaranteed.`,
        
        // Store branding
        'store_name': storeName,
        'store_title': storeName,
        'brand_name': storeName,
        
        // Announcement bar
        'announcement_text': `🎉 Welcome to ${storeName} - Your Premium Shopping Destination!`,
        'announcement_color': '#FFFFFF',
        'announcement_background': themeColor,
        'announcement_bar_enabled': true,
        'show_announcement': true,
        
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
      
      // Apply customizations in smaller batches with better error handling
      let successCount = 0;
      const totalCustomizations = Object.entries(customizations);
      
      for (const [setting, value] of totalCustomizations) {
        try {
          const applied = await this.updateIndividualThemeSetting(cleanUrl, accessToken, themeId, setting, value);
          if (applied) {
            successCount++;
            console.log(`✅ Applied setting: ${setting} = ${value}`);
          } else {
            console.warn(`⚠️ Failed to apply setting: ${setting}`);
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (settingError) {
          console.warn(`⚠️ Error applying setting ${setting}:`, settingError);
          continue;
        }
      }
      
      console.log(`✅ Applied ${successCount}/${totalCustomizations.length} theme customizations for "${storeName}"`);
      return successCount > (totalCustomizations.length * 0.3); // Success if >30% applied
      
    } catch (error) {
      console.error('❌ Error applying comprehensive theme customization:', error);
      return false;
    }
  }

  private static async updateIndividualThemeSetting(
    shopifyUrl: string,
    accessToken: string,
    themeId: string,
    key: string,
    value: any
  ): Promise<boolean> {
    try {
      // Method 1: Try updating through settings_data.json
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
          console.warn(`⚠️ Could not parse settings_data.json, using empty object`);
          currentSettings = {};
        }
        
        // Update the specific setting
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
        
        if (updateResponse.ok) {
          return true;
        }
      }
      
      // Method 2: Try as individual asset (fallback)
      const assetResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${themeId}/assets.json`, {
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
      
      return assetResponse.ok;
      
    } catch (error) {
      console.warn(`⚠️ Failed to update theme setting ${key}:`, error);
      return false;
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
      
      const cleanUrl = shopifyUrl.replace(/\/$/, '');
      
      // Update checkout settings
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
        console.log(`✅ Checkout branding updated with ${themeColor} theme`);
        return true;
      } else {
        const errorText = await checkoutResponse.text();
        console.warn(`⚠️ Checkout branding update failed: ${checkoutResponse.status} - ${errorText}`);
        return false;
      }
      
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

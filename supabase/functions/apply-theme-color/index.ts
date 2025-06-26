
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

    console.log('🎨 CRITICAL THEME COLOR FIX: Applying comprehensive color scheme');
    console.log('🏪 Store:', shopifyUrl);
    console.log('🎨 Color:', themeColor);
    console.log('📝 Name:', storeName);

    // Validate inputs
    if (!shopifyUrl || !accessToken || !themeColor) {
      throw new Error('Missing required parameters');
    }

    // Extract domain from URL
    const extractDomain = (url: string) => {
      if (url.includes('admin.shopify.com/store/')) {
        const match = url.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
        if (match) return `${match[1]}.myshopify.com`;
      }
      
      let domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (!domain.includes('.myshopify.com')) {
        domain = `${domain}.myshopify.com`;
      }
      return domain;
    };

    const domain = extractDomain(shopifyUrl);
    const finalUrl = `https://${domain}`;
    
    console.log('🔗 FINAL URL:', finalUrl);

    // Step 1: Update store name and basic info
    if (storeName) {
      console.log('🏪 UPDATING STORE NAME:', storeName);
      try {
        const storeResponse = await fetch(`${finalUrl}/admin/api/2024-10/shop.json`, {
          method: 'PUT',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shop: {
              name: storeName,
              phone: '+1-555-123-4567',
              customer_email: `support@${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
            }
          }),
        });

        if (storeResponse.ok) {
          console.log('✅ STORE NAME UPDATED');
        } else {
          console.warn('⚠️ Store name update failed, continuing with theme');
        }
      } catch (error) {
        console.warn('⚠️ Store name update error:', error);
      }
    }

    // Step 2: Get current theme
    console.log('🔍 FETCHING CURRENT THEME');
    const themesResponse = await fetch(`${finalUrl}/admin/api/2024-10/themes.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!themesResponse.ok) {
      throw new Error(`Failed to fetch themes: ${themesResponse.status}`);
    }

    const themesData = await themesResponse.json();
    const currentTheme = themesData.themes.find((theme: any) => theme.role === 'main');

    if (!currentTheme) {
      throw new Error('No main theme found');
    }

    console.log('🎨 FOUND THEME:', currentTheme.name, 'ID:', currentTheme.id);

    // Step 3: Get current theme settings
    console.log('📋 FETCHING THEME SETTINGS');
    const settingsResponse = await fetch(`${finalUrl}/admin/api/2024-10/themes/${currentTheme.id}/assets.json?asset[key]=config/settings_data.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    let currentSettings: any = {};
    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json();
      if (settingsData.asset && settingsData.asset.value) {
        try {
          currentSettings = JSON.parse(settingsData.asset.value);
        } catch (e) {
          console.log('⚠️ Could not parse existing settings, starting fresh');
          currentSettings = {};
        }
      }
    }

    // Step 4: Apply comprehensive theme color settings
    console.log('🚨 APPLYING COMPREHENSIVE COLOR SCHEME');
    
    const enhancedColorSettings = {
      ...currentSettings,
      current: {
        ...currentSettings.current || {},
        
        // PRIMARY COLORS - CRITICAL
        colors_accent_1: themeColor,
        colors_accent_2: themeColor,
        color_accent: themeColor,
        accent_color: themeColor,
        primary_color: themeColor,
        
        // BUTTON COLORS - CRITICAL FOR CTA
        colors_solid_button_labels: '#ffffff',
        colors_outline_button_labels: themeColor,
        color_button: themeColor,
        color_button_text: '#ffffff',
        button_color: themeColor,
        button_background_color: themeColor,
        button_primary_color: themeColor,
        
        // HEADER COLORS
        colors_header: '#ffffff',
        colors_header_text: '#333333',
        color_header: '#ffffff',
        header_background_color: '#ffffff',
        header_color: '#ffffff',
        
        // LINK COLORS
        colors_text: '#121212',
        color_links: themeColor,
        link_color: themeColor,
        colors_link: themeColor,
        
        // BACKGROUND COLORS
        colors_background_1: '#ffffff',
        colors_background_2: '#f8f8f8',
        background_color: '#ffffff',
        
        // GRADIENTS
        gradient_accent_1: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`,
        gradient_accent_2: `linear-gradient(135deg, ${themeColor}22 0%, ${themeColor}44 100%)`,
        
        // STORE BRANDING
        store_name: storeName || 'Premium Store',
        brand_headline: `Welcome to ${storeName || 'Your Store'}`,
        brand_description: `Discover premium products at ${storeName || 'our store'}`,
        
        // TYPOGRAPHY
        type_header_font: 'assistant_n4',
        type_body_font: 'assistant_n4',
        
        // LAYOUT
        page_width: '1200',
        buttons_border_thickness: '2',
        buttons_radius: '6',
        buttons_shadow_opacity: '15',
        
        // CARDS AND BADGES
        card_style: 'standard',
        badge_position: 'bottom left',
        badge_corner_radius: '6',
        
        // ANNOUNCEMENT BAR
        announcement_bar_enabled: true,
        announcement_text: `🎉 Welcome to ${storeName || 'Premium Store'} - Free Shipping on Orders Over $50!`,
        announcement_background_color: themeColor,
        announcement_text_color: '#ffffff'
      }
    };

    // Step 5: Update theme settings
    console.log('💾 SAVING ENHANCED THEME SETTINGS');
    const updateResponse = await fetch(`${finalUrl}/admin/api/2024-10/themes/${currentTheme.id}/assets.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        asset: {
          key: 'config/settings_data.json',
          value: JSON.stringify(enhancedColorSettings)
        }
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Failed to update theme settings:', errorText);
      throw new Error('Failed to update theme settings');
    }

    console.log('✅ COMPREHENSIVE THEME COLOR APPLICATION COMPLETE');
    console.log('🎨 Applied color:', themeColor);
    console.log('🏪 Store name:', storeName);
    console.log('📊 Settings updated for theme:', currentTheme.name);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Theme color ${themeColor} applied successfully to ${storeName}`,
      theme_name: currentTheme.name,
      theme_id: currentTheme.id,
      color_applied: themeColor,
      store_name: storeName,
      settings_updated: Object.keys(enhancedColorSettings.current).length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ CRITICAL: Theme color application failed:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Theme color application failed',
      troubleshooting: {
        check_url: 'Verify Shopify store URL format',
        check_token: 'Verify Admin API access token permissions',
        check_theme: 'Ensure theme supports color customization'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

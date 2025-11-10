import { supabase } from "@/integrations/supabase/client";

export interface ThemeConfiguration {
  storeName: string;
  accessToken: string;
  themeColor: string;
  niche: string;
  targetAudience: string;
  businessType: string;
  storeStyle: string;
  customInfo?: string;
}

// FIXED: Enhanced helper function to extract the actual Shopify domain from admin URLs
const extractShopifyDomain = (shopifyUrl: string): string => {
  if (!shopifyUrl) return '';
  
  console.log('🔍 THEME SERVICE - EXTRACTING FROM:', shopifyUrl);
  
  // Handle admin.shopify.com URLs: https://admin.shopify.com/store/p7vdbh-fh
  if (shopifyUrl.includes('admin.shopify.com/store/')) {
    const match = shopifyUrl.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
    if (match) {
      const storeId = match[1];
      const domain = `${storeId}.myshopify.com`;
      console.log('✅ THEME SERVICE - EXTRACTED ADMIN URL:', storeId, '->', domain);
      return domain;
    }
  }
  
  // Remove protocol if present
  let domain = shopifyUrl.replace(/^https?:\/\//, '');
  
  // If it's already a .myshopify.com domain, return it
  if (domain.includes('.myshopify.com')) {
    const cleanDomain = domain.split('/')[0]; // Remove any path
    console.log('✅ THEME SERVICE - ALREADY MYSHOPIFY:', cleanDomain);
    return cleanDomain;
  }
  
  // If it's just the store name, add .myshopify.com
  const finalDomain = `${domain}.myshopify.com`;
  console.log('✅ THEME SERVICE - CONSTRUCTED DOMAIN:', finalDomain);
  return finalDomain;
};

export const installAndConfigureSenseTheme = async (config: ThemeConfiguration): Promise<boolean> => {
  try {
    console.log('🎨 Installing and configuring theme for personalized store...');
    console.log('Store Details:', {
      name: config.storeName,
      niche: config.niche,
      targetAudience: config.targetAudience,
      businessType: config.businessType,
      storeStyle: config.storeStyle,
      themeColor: config.themeColor
    });

    // FIXED: Get the actual Shopify domain from the form data
    const actualShopifyDomain = extractShopifyDomain(config.storeName);
    const shopifyUrl = `https://${actualShopifyDomain}`;

    console.log('🔗 Using Shopify URL:', shopifyUrl);

    // Step 1: Update store name in Shopify admin settings
    await updateShopifyStoreName(config.storeName, config.accessToken, shopifyUrl);

    // Step 2: Use Supabase edge function to install and configure theme with COMPREHENSIVE color application
    console.log('🎨 APPLYING THEME COLOR TO ALL SHOPIFY ELEMENTS:', config.themeColor);
    
    const { data, error } = await supabase.functions.invoke('install-shopify-theme', {
      body: {
        shopifyUrl: shopifyUrl,
        accessToken: config.accessToken,
        themeColor: config.themeColor,
        niche: config.niche,
        storeName: config.storeName,
        targetAudience: config.targetAudience,
        businessType: config.businessType,
        storeStyle: config.storeStyle,
        customInfo: config.customInfo,
        applyColorToAllElements: true, // NEW: Force comprehensive color application
        storePersonalization: {
          store_name: config.storeName,
          niche: config.niche,
          target_audience: config.targetAudience,
          business_type: config.businessType,
          store_style: config.storeStyle,
          custom_info: config.customInfo
        }
      }
    });

    if (error) {
      console.error('❌ Theme installation failed:', error);
      throw new Error(error.message || 'Failed to install theme');
    }

    if (data?.success) {
      console.log(`✅ Theme installed and configured for ${config.storeName} with ${config.storeStyle} styling`);
      return true;
    } else {
      throw new Error(data?.error || 'Theme installation failed');
    }

  } catch (error) {
    console.error('💥 Theme installation process failed:', error);
    throw error;
  }
};

const updateShopifyStoreName = async (storeName: string, accessToken: string, shopifyUrl: string): Promise<boolean> => {
  try {
    console.log(`🏪 Updating Shopify store name to: ${storeName}`);

    const { data, error } = await supabase.functions.invoke('update-shopify-store-name', {
      body: {
        storeName: storeName,
        accessToken: accessToken,
        shopifyUrl: shopifyUrl
      }
    });

    if (error) {
      console.error('❌ Store name update failed:', error);
      throw new Error(error.message || 'Failed to update store name');
    }

    if (data?.success) {
      console.log(`✅ Store name updated successfully to: ${storeName}`);
      return true;
    } else {
      console.warn('⚠️ Store name update returned no success confirmation');
      return false;
    }

  } catch (error) {
    console.error('💥 Store name update failed:', error);
    // Don't throw error here as this shouldn't block theme installation
    return false;
  }
};

export const applyThemeCustomizations = async (config: ThemeConfiguration): Promise<boolean> => {
  try {
    console.log(`🎨 Applying ${config.storeStyle} theme customizations for ${config.storeName}...`);

    const { data, error } = await supabase.functions.invoke('customize-shopify-theme', {
      body: {
        shopifyUrl: `https://${config.storeName}.myshopify.com`,
        accessToken: config.accessToken,
        themeColor: config.themeColor,
        niche: config.niche,
        storeName: config.storeName,
        customizations: {
          primaryColor: config.themeColor,
          storeTitle: config.storeName, // Use exact store name
          logoText: config.storeName,
          headerMessage: `Discover Amazing ${config.niche} Products`,
          footerText: `Your trusted ${config.niche} destination`,
          storeStyle: config.storeStyle,
          targetAudience: config.targetAudience,
          businessType: config.businessType,
          customInfo: config.customInfo
        }
      }
    });

    if (error) {
      console.error('❌ Theme customization failed:', error);
      throw new Error(error.message || 'Failed to customize theme');
    }

    if (data?.success) {
      console.log(`✅ ${config.storeStyle} theme customizations applied successfully for ${config.storeName}`);
      return true;
    } else {
      throw new Error(data?.error || 'Theme customization failed');
    }

  } catch (error) {
    console.error('💥 Theme customization process failed:', error);
    throw error;
  }
};

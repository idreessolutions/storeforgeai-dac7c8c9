
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

    // Use Supabase edge function to install and configure theme with full personalization
    const { data, error } = await supabase.functions.invoke('install-shopify-theme', {
      body: {
        shopifyUrl: `https://${config.storeName}.myshopify.com`,
        accessToken: config.accessToken,
        themeColor: config.themeColor,
        niche: config.niche,
        storeName: config.storeName,
        targetAudience: config.targetAudience,
        businessType: config.businessType,
        storeStyle: config.storeStyle,
        customInfo: config.customInfo,
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


import { supabase } from "@/integrations/supabase/client";

export interface ThemeConfiguration {
  storeName: string;
  accessToken: string;
  themeColor: string;
  niche: string;
}

export const installAndConfigureSenseTheme = async (config: ThemeConfiguration): Promise<boolean> => {
  try {
    console.log('🎨 Installing and configuring Sense theme...');
    console.log('Store:', config.storeName);
    console.log('Theme Color:', config.themeColor);
    console.log('Niche:', config.niche);

    // Use Supabase edge function to install and configure theme
    const { data, error } = await supabase.functions.invoke('install-shopify-theme', {
      body: {
        shopifyUrl: `https://${config.storeName}.myshopify.com`,
        accessToken: config.accessToken,
        themeColor: config.themeColor,
        niche: config.niche
      }
    });

    if (error) {
      console.error('❌ Theme installation failed:', error);
      throw new Error(error.message || 'Failed to install theme');
    }

    if (data?.success) {
      console.log('✅ Sense theme installed and configured successfully');
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
    console.log('🎨 Applying theme customizations...');

    const { data, error } = await supabase.functions.invoke('customize-shopify-theme', {
      body: {
        shopifyUrl: `https://${config.storeName}.myshopify.com`,
        accessToken: config.accessToken,
        themeColor: config.themeColor,
        niche: config.niche,
        customizations: {
          primaryColor: config.themeColor,
          storeTitle: `Premium ${config.niche} Store`,
          logoText: config.niche,
          headerMessage: `Discover Amazing ${config.niche} Products`,
          footerText: `Your trusted ${config.niche} destination`
        }
      }
    });

    if (error) {
      console.error('❌ Theme customization failed:', error);
      throw new Error(error.message || 'Failed to customize theme');
    }

    if (data?.success) {
      console.log('✅ Theme customizations applied successfully');
      return true;
    } else {
      throw new Error(data?.error || 'Theme customization failed');
    }

  } catch (error) {
    console.error('💥 Theme customization process failed:', error);
    throw error;
  }
};

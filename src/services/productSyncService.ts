
import { supabase } from "@/integrations/supabase/client";
import { AliExpressRealApiClient, AliExpressProduct } from "./aliexpress/realApiClient";
import { ContentEnhancementService, EnhancedContent } from "./contentEnhancementService";

export interface ProductSyncConfig {
  shopifyUrl: string;
  shopifyAccessToken: string;
  aliexpressCredentials: {
    appKey: string;
    appSecret: string;
    accessToken?: string;
  };
  storeConfig: {
    storeName: string;
    themeColor: string;
    targetAudience: string;
    businessType: string;
    storeStyle: string;
    niche: string;
  };
}

export interface SyncedProduct {
  aliexpressProduct: AliExpressProduct;
  enhancedContent: EnhancedContent;
  shopifyProductId?: string;
  status: 'pending' | 'enhanced' | 'uploaded' | 'failed';
  error?: string;
}

export class ProductSyncService {
  private aliexpressClient: AliExpressRealApiClient;
  private config: ProductSyncConfig;

  constructor(config: ProductSyncConfig) {
    this.config = config;
    this.aliexpressClient = new AliExpressRealApiClient(config.aliexpressCredentials);
  }

  async fetchAndEnhanceProduct(productId: string): Promise<SyncedProduct> {
    console.log(`🚀 Starting product sync for AliExpress product: ${productId}`);

    try {
      // Step 1: Fetch product from AliExpress
      console.log('📥 Fetching product from AliExpress...');
      const aliexpressProduct = await this.aliexpressClient.getProductDetails(productId);
      
      if (!aliexpressProduct) {
        throw new Error('Product not found on AliExpress');
      }

      console.log('✅ AliExpress product fetched:', aliexpressProduct.title.substring(0, 50));

      // Step 2: Enhance content with GPT
      console.log('🤖 Enhancing content with GPT...');
      const enhancedContent = await ContentEnhancementService.enhanceProductContent(
        aliexpressProduct.title,
        aliexpressProduct.description,
        this.config.storeConfig.niche,
        this.config.storeConfig.targetAudience,
        this.config.storeConfig.storeStyle
      );

      console.log('✅ Content enhanced:', enhancedContent.title.substring(0, 50));

      return {
        aliexpressProduct,
        enhancedContent,
        status: 'enhanced'
      };
    } catch (error) {
      console.error('❌ Product sync failed:', error);
      throw error;
    }
  }

  async uploadToShopify(syncedProduct: SyncedProduct): Promise<SyncedProduct> {
    console.log('🛒 Uploading product to Shopify...');

    try {
      const { data, error } = await supabase.functions.invoke('sync-product-to-shopify', {
        body: {
          aliexpressProduct: syncedProduct.aliexpressProduct,
          enhancedContent: syncedProduct.enhancedContent,
          shopifyUrl: this.config.shopifyUrl,
          shopifyAccessToken: this.config.shopifyAccessToken,
          storeConfig: this.config.storeConfig
        }
      });

      if (error) {
        throw new Error(`Shopify upload failed: ${error.message}`);
      }

      console.log('✅ Product uploaded to Shopify:', data.productId);

      return {
        ...syncedProduct,
        shopifyProductId: data.productId,
        status: 'uploaded'
      };
    } catch (error) {
      console.error('❌ Shopify upload failed:', error);
      return {
        ...syncedProduct,
        status: 'failed',
        error: error.message
      };
    }
  }

  async searchProducts(keywords: string, limit: number = 10): Promise<AliExpressProduct[]> {
    console.log(`🔍 Searching AliExpress for: "${keywords}"`);

    try {
      const response = await this.aliexpressClient.searchProducts({
        keywords,
        page_size: limit,
        sort: 'orders'
      });

      if (response.aliexpress_ds_product_get_response?.result?.products) {
        const products = response.aliexpress_ds_product_get_response.result.products;
        console.log(`✅ Found ${products.length} products`);
        
        // Parse products
        return products.map(product => ({
          productId: product.product_id || '',
          title: product.subject || '',
          description: product.detail || '',
          price: {
            min: parseFloat(product.target_sale_price_from || '0'),
            max: parseFloat(product.target_sale_price_to || '0'),
            currency: product.target_sale_price_currency || 'USD'
          },
          images: {
            main: product.product_main_image_url || '',
            gallery: [],
            skuImages: {}
          },
          variants: [],
          skuPropertyList: [],
          originalData: product
        }));
      }

      return [];
    } catch (error) {
      console.error('❌ Product search failed:', error);
      throw error;
    }
  }
}

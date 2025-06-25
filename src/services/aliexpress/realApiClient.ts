
export interface AliExpressApiCredentials {
  appKey: string;
  appSecret: string;
  accessToken?: string;
}

export interface AliExpressProduct {
  productId: string;
  title: string;
  description: string;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  images: {
    main: string;
    gallery: string[];
    skuImages: Record<string, string[]>;
  };
  variants: Array<{
    skuId: string;
    price: number;
    inventory: number;
    properties: Record<string, string>;
  }>;
  skuPropertyList: Array<{
    skuPropertyId: string;
    skuPropertyName: string;
    skuPropertyValues: Array<{
      propertyValueId: string;
      propertyValueName: string;
      skuPropertyImagePath?: string;
    }>;
  }>;
  originalData: any;
}

export interface AliExpressApiResponse {
  aliexpress_ds_product_get_response?: {
    result?: {
      product_count?: number;
      products?: any[];
    };
  };
  error_response?: {
    code: string;
    msg: string;
  };
}

export class AliExpressRealApiClient {
  private baseUrl = 'https://api-sg.aliexpress.com/rest';
  private credentials: AliExpressApiCredentials;

  constructor(credentials: AliExpressApiCredentials) {
    this.credentials = credentials;
  }

  private generateSign(params: Record<string, any>): string {
    // Sort parameters and create signature string
    const sortedKeys = Object.keys(params).sort();
    const signString = sortedKeys
      .map(key => `${key}${params[key]}`)
      .join('');
    
    // Use HMAC-MD5 with app secret (simplified for demo - in production use proper crypto)
    const crypto = require('crypto');
    return crypto
      .createHmac('md5', this.credentials.appSecret)
      .update(signString)
      .digest('hex')
      .toUpperCase();
  }

  async searchProducts(params: {
    keywords: string;
    category_id?: string;
    page_no?: number;
    page_size?: number;
    sort?: string;
  }): Promise<AliExpressApiResponse> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    const apiParams: Record<string, string> = {
      app_key: this.credentials.appKey,
      method: 'aliexpress.ds.product.get',
      timestamp,
      format: 'json',
      v: '2.0',
      sign_method: 'md5',
      keywords: params.keywords
    };

    // Add optional parameters
    if (params.category_id) apiParams.category_id = params.category_id;
    if (params.page_no) apiParams.page_no = params.page_no.toString();
    if (params.page_size) apiParams.page_size = params.page_size.toString();
    if (params.sort) apiParams.sort = params.sort;
    if (this.credentials.accessToken) apiParams.access_token = this.credentials.accessToken;

    // Generate signature
    apiParams.sign = this.generateSign(apiParams);

    console.log('🔌 Calling AliExpress Drop Shipping API:', {
      method: 'aliexpress.ds.product.get',
      keywords: params.keywords,
      app_key: this.credentials.appKey
    });

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(apiParams).toString(),
      });

      if (!response.ok) {
        throw new Error(`AliExpress API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ AliExpress API response received');
      
      return data;
    } catch (error) {
      console.error('❌ AliExpress API call failed:', error);
      throw error;
    }
  }

  async getProductDetails(productId: string): Promise<AliExpressProduct | null> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    const apiParams: Record<string, string> = {
      app_key: this.credentials.appKey,
      method: 'aliexpress.ds.product.get',
      timestamp,
      format: 'json',
      v: '2.0',
      sign_method: 'md5',
      product_id: productId
    };

    if (this.credentials.accessToken) {
      apiParams.access_token = this.credentials.accessToken;
    }

    apiParams.sign = this.generateSign(apiParams);

    console.log(`🔍 Fetching product details for ID: ${productId}`);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(apiParams).toString(),
      });

      if (!response.ok) {
        throw new Error(`AliExpress API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.aliexpress_ds_product_get_response?.result?.products?.length > 0) {
        const product = data.aliexpress_ds_product_get_response.result.products[0];
        return this.parseProductData(product);
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to fetch product ${productId}:`, error);
      throw error;
    }
  }

  private parseProductData(rawProduct: any): AliExpressProduct {
    const images = {
      main: rawProduct.product_main_image_url || '',
      gallery: rawProduct.product_video_url ? [rawProduct.product_video_url] : [],
      skuImages: {} as Record<string, string[]>
    };

    // Parse image gallery
    if (rawProduct.ae_item_sku_info_dtos?.ae_item_sku_info_dto) {
      const skuInfos = Array.isArray(rawProduct.ae_item_sku_info_dtos.ae_item_sku_info_dto) 
        ? rawProduct.ae_item_sku_info_dtos.ae_item_sku_info_dto 
        : [rawProduct.ae_item_sku_info_dtos.ae_item_sku_info_dto];

      skuInfos.forEach((sku: any) => {
        if (sku.sku_image && sku.id) {
          images.skuImages[sku.id] = [sku.sku_image];
        }
      });
    }

    // Parse variants
    const variants: AliExpressProduct['variants'] = [];
    if (rawProduct.ae_item_sku_info_dtos?.ae_item_sku_info_dto) {
      const skuInfos = Array.isArray(rawProduct.ae_item_sku_info_dtos.ae_item_sku_info_dto) 
        ? rawProduct.ae_item_sku_info_dtos.ae_item_sku_info_dto 
        : [rawProduct.ae_item_sku_info_dtos.ae_item_sku_info_dto];

      skuInfos.forEach((sku: any) => {
        variants.push({
          skuId: sku.id || '',
          price: parseFloat(sku.sku_price || '0'),
          inventory: parseInt(sku.sku_stock || '0'),
          properties: sku.sku_property_list || {}
        });
      });
    }

    // Parse SKU properties
    const skuPropertyList: AliExpressProduct['skuPropertyList'] = [];
    if (rawProduct.ae_item_properties?.ae_item_property) {
      const properties = Array.isArray(rawProduct.ae_item_properties.ae_item_property)
        ? rawProduct.ae_item_properties.ae_item_property
        : [rawProduct.ae_item_properties.ae_item_property];

      properties.forEach((prop: any) => {
        if (prop.attr_name_id && prop.attr_name) {
          const values = Array.isArray(prop.attr_value_list?.attr_value)
            ? prop.attr_value_list.attr_value
            : prop.attr_value_list?.attr_value ? [prop.attr_value_list.attr_value] : [];

          skuPropertyList.push({
            skuPropertyId: prop.attr_name_id,
            skuPropertyName: prop.attr_name,
            skuPropertyValues: values.map((val: any) => ({
              propertyValueId: val.attr_value_id || '',
              propertyValueName: val.attr_value || '',
              skuPropertyImagePath: val.attr_value_image
            }))
          });
        }
      });
    }

    return {
      productId: rawProduct.product_id || '',
      title: rawProduct.subject || '',
      description: rawProduct.detail || '',
      price: {
        min: parseFloat(rawProduct.target_sale_price_from || '0'),
        max: parseFloat(rawProduct.target_sale_price_to || '0'),
        currency: rawProduct.target_sale_price_currency || 'USD'
      },
      images,
      variants,
      skuPropertyList,
      originalData: rawProduct
    };
  }
}

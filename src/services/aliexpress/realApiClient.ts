
export interface AliExpressApiCredentials {
  appKey: string;
  appSecret: string;
  accessToken?: string;
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
    
    // Create apiParams with proper typing for dynamic property assignment
    const apiParams: Record<string, string> = {
      app_key: this.credentials.appKey,
      method: 'aliexpress.ds.product.get',
      timestamp,
      format: 'json',
      v: '2.0',
      sign_method: 'md5',
      keywords: params.keywords
    };

    // Add optional parameters, converting numbers to strings
    if (params.category_id) {
      apiParams.category_id = params.category_id;
    }
    if (params.page_no) {
      apiParams.page_no = params.page_no.toString();
    }
    if (params.page_size) {
      apiParams.page_size = params.page_size.toString();
    }
    if (params.sort) {
      apiParams.sort = params.sort;
    }

    if (this.credentials.accessToken) {
      apiParams.access_token = this.credentials.accessToken;
    }

    // Generate signature
    apiParams.sign = this.generateSign(apiParams);

    console.log('🔌 Calling real AliExpress Drop Shipping API:', {
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

  async getProductDetails(productId: string): Promise<any> {
    return this.searchProducts({
      keywords: '',
      // Add product-specific parameters here
    });
  }
}

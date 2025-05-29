
export interface ShopifyProduct {
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  handle: string;
  status: string;
  published: boolean;
  tags: string;
}

export interface ShopifyVariant {
  product_id: string;
  title: string;
  price: string;
  sku: string;
  inventory_management: null;
  inventory_policy: string;
  inventory_quantity: number;
  requires_shipping: boolean;
  taxable: boolean;
}

export interface ShopifyImage {
  src: string;
  alt: string;
  position: number;
}

export class ShopifyAPIClient {
  constructor(private shopifyUrl: string, private accessToken: string) {}

  async createProduct(productPayload: { product: ShopifyProduct }) {
    const apiUrl = `${this.shopifyUrl}/admin/api/2024-10/products.json`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify(productPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify API Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  async updateVariant(variantId: string, variantData: Partial<ShopifyVariant>) {
    const response = await fetch(`${this.shopifyUrl}/admin/api/2024-10/variants/${variantId}.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify({ variant: variantData }),
    });

    return response.ok;
  }

  async uploadImage(productId: string, imageData: ShopifyImage) {
    const response = await fetch(`${this.shopifyUrl}/admin/api/2024-10/products/${productId}/images.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify({ image: imageData }),
    });

    return response.ok ? await response.json() : null;
  }

  async updateProductOptions(productId: string, options: any[]) {
    const response = await fetch(`${this.shopifyUrl}/admin/api/2024-10/products/${productId}.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify({ product: { id: productId, options } }),
    });

    return response.ok;
  }

  async createVariant(productId: string, variantData: Partial<ShopifyVariant>) {
    const response = await fetch(`${this.shopifyUrl}/admin/api/2024-10/products/${productId}/variants.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify({ variant: variantData }),
    });

    return response.ok;
  }

  async deleteVariant(variantId: string) {
    const response = await fetch(`${this.shopifyUrl}/admin/api/2024-10/variants/${variantId}.json`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
    });

    return response.ok;
  }
}

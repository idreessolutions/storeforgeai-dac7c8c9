
export class ShopifyAPIClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(shopUrl: string, accessToken: string) {
    this.baseUrl = shopUrl.replace(/\/$/, '');
    this.accessToken = accessToken;
  }

  async createProduct(productData: any): Promise<any> {
    console.log('🛒 Creating product in Shopify:', productData.product.title);
    
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/products.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create product: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  async uploadImage(productId: string, imageData: any): Promise<any> {
    console.log(`📸 Uploading image for product ${productId}`);
    
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/products/${productId}/images.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: imageData })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Image upload failed: ${response.status} - ${errorText}`);
      return null;
    }

    return await response.json();
  }

  async createVariant(productId: string, variantData: any): Promise<any> {
    console.log(`🎯 Creating variant for product ${productId}`);
    
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/products/${productId}/variants.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ variant: variantData })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Variant creation failed: ${response.status} - ${errorText}`);
      return null;
    }

    return await response.json();
  }

  async updateVariant(variantId: string, variantData: any): Promise<boolean> {
    console.log(`🔄 Updating variant ${variantId}`);
    
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/variants/${variantId}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ variant: variantData })
    });

    return response.ok;
  }

  async assignImageToVariant(imageId: string, variantId: string): Promise<boolean> {
    console.log(`🖼️ Assigning image ${imageId} to variant ${variantId}`);
    
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/variants/${variantId}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        variant: {
          id: variantId,
          image_id: imageId
        }
      })
    });

    return response.ok;
  }

  async updateProductOptions(productId: string, options: any[]): Promise<boolean> {
    console.log(`⚙️ Updating product options for ${productId}`);
    
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/products/${productId}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product: {
          id: productId,
          options: options
        }
      })
    });

    return response.ok;
  }

  async deleteVariant(variantId: string): Promise<boolean> {
    console.log(`🗑️ Deleting variant ${variantId}`);
    
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/variants/${variantId}.json`, {
      method: 'DELETE',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  }

  async uploadImageBlob(productId: string, formData: FormData): Promise<any> {
    console.log(`📸 Uploading image blob for product ${productId}`);
    
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/products/${productId}/images.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.accessToken
      },
      body: formData
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  }
}


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
  variant_ids?: string[];
}

export class ShopifyAPIClient {
  constructor(private shopifyUrl: string, private accessToken: string) {}

  async createProduct(productPayload: { product: ShopifyProduct }) {
    const apiUrl = `${this.shopifyUrl}/admin/api/2024-10/products.json`;
    
    console.log(`🏪 Creating product in Shopify: ${productPayload.product.title}`);
    
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
      console.log(`❌ Shopify product creation failed: ${response.status} - ${errorText}`);
      throw new Error(`Shopify API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Product created successfully in Shopify: ${result.product.id}`);
    return result;
  }

  async uploadImage(productId: string, imageData: ShopifyImage) {
    const apiUrl = `${this.shopifyUrl}/admin/api/2023-04/products/${productId}/images.json`;
    
    console.log(`📸 Uploading image to Shopify product ${productId}`);
    console.log(`🖼️ Image data:`, { 
      src: imageData.src.substring(0, 100) + '...', 
      alt: imageData.alt, 
      position: imageData.position 
    });
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': this.accessToken,
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Image upload failed: ${response.status} - ${errorText}`);
        
        // Try to parse error details
        try {
          const errorData = JSON.parse(errorText);
          console.log(`🔍 Shopify error details:`, errorData);
        } catch (parseError) {
          console.log(`🔍 Raw error response: ${errorText}`);
        }
        
        return null;
      }

      const result = await response.json();
      console.log(`✅ Image uploaded successfully: ${result.image?.id || 'Unknown ID'}`);
      console.log(`🔗 Uploaded image URL: ${result.image?.src?.substring(0, 100)}...`);
      return result;
    } catch (error) {
      console.log(`❌ Image upload error:`, error.message);
      return null;
    }
  }

  async assignImageToVariant(imageId: string, variantId: string): Promise<boolean> {
    const apiUrl = `${this.shopifyUrl}/admin/api/2023-04/products/images/${imageId}.json`;
    
    try {
      console.log(`🔗 Assigning image ${imageId} to variant ${variantId}...`);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': this.accessToken,
        },
        body: JSON.stringify({
          image: {
            id: imageId,
            variant_ids: [variantId]
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Image-to-variant assignment failed: ${response.status} - ${errorText}`);
        return false;
      }

      const result = await response.json();
      console.log(`✅ Image ${imageId} successfully assigned to variant ${variantId}`);
      return true;
    } catch (error) {
      console.log(`❌ Error assigning image to variant:`, error.message);
      return false;
    }
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

    const success = response.ok;
    if (!success) {
      const errorText = await response.text();
      console.log(`❌ Variant update failed: ${response.status} - ${errorText}`);
    }
    
    return success;
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

    if (response.ok) {
      const result = await response.json();
      return result.variant;
    }
    return null;
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

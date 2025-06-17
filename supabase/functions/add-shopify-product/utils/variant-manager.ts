
import { ShopifyAPIClient } from './shopify-api.ts';

export class VariantManager {
  constructor(private shopifyClient: ShopifyAPIClient) {}

  async updateDefaultVariant(variant: any, price: string): Promise<boolean> {
    console.log(`🔄 Updating default variant ${variant.id} with price $${price}`);
    
    try {
      const success = await this.shopifyClient.updateVariant(variant.id, {
        price: price,
        inventory_quantity: 100,
        inventory_management: null,
        inventory_policy: 'deny'
      });
      
      if (success) {
        console.log(`✅ Default variant updated successfully with price $${price}`);
      } else {
        console.error(`❌ Failed to update default variant ${variant.id}`);
      }
      
      return success;
    } catch (error) {
      console.error(`❌ Error updating default variant:`, error);
      return false;
    }
  }

  async createProductVariant(
    productId: string,
    title: string,
    price: string,
    color?: string
  ): Promise<any> {
    console.log(`🆕 Creating variant "${title}" for product ${productId} at $${price}`);
    
    try {
      const variantData = {
        product_id: productId,
        title: title,
        price: price,
        inventory_quantity: 100,
        inventory_management: null,
        inventory_policy: 'deny',
        requires_shipping: true,
        taxable: true
      };

      const newVariant = await this.shopifyClient.createVariant(productId, variantData);
      
      if (newVariant) {
        console.log(`✅ Variant "${title}" created successfully: ${newVariant.id}`);
        return newVariant;
      } else {
        console.error(`❌ Failed to create variant "${title}"`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error creating variant "${title}":`, error);
      return null;
    }
  }

  async assignImageToVariant(imageId: string, variantId: string): Promise<boolean> {
    console.log(`🖼️ Assigning image ${imageId} to variant ${variantId}`);
    
    try {
      const success = await this.shopifyClient.assignImageToVariant(imageId, variantId);
      
      if (success) {
        console.log(`✅ Image ${imageId} assigned to variant ${variantId}`);
      } else {
        console.error(`❌ Failed to assign image ${imageId} to variant ${variantId}`);
      }
      
      return success;
    } catch (error) {
      console.error(`❌ Error assigning image to variant:`, error);
      return false;
    }
  }

  async createProductOptions(productId: string, options: any[]): Promise<boolean> {
    console.log(`⚙️ Creating product options for ${productId}:`, options);
    
    try {
      const success = await this.shopifyClient.updateProductOptions(productId, options);
      
      if (success) {
        console.log(`✅ Product options created successfully`);
      } else {
        console.error(`❌ Failed to create product options`);
      }
      
      return success;
    } catch (error) {
      console.error(`❌ Error creating product options:`, error);
      return false;
    }
  }

  async deleteVariant(variantId: string): Promise<boolean> {
    console.log(`🗑️ Deleting variant ${variantId}`);
    
    try {
      const success = await this.shopifyClient.deleteVariant(variantId);
      
      if (success) {
        console.log(`✅ Variant ${variantId} deleted successfully`);
      } else {
        console.error(`❌ Failed to delete variant ${variantId}`);
      }
      
      return success;
    } catch (error) {
      console.error(`❌ Error deleting variant:`, error);
      return false;
    }
  }
}

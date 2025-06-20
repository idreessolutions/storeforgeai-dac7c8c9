
export class EnhancedVariantManager {
  private shopifyClient: any;

  constructor(shopifyClient: any) {
    this.shopifyClient = shopifyClient;
  }

  async updateDefaultVariant(variant: any, price: string): Promise<boolean> {
    if (!variant || !variant.id) {
      console.error('❌ ENHANCED VARIANT: No variant provided for update');
      return false;
    }

    console.log(`🔄 ENHANCED VARIANT: Updating default variant ${variant.id} with price $${price}`);

    try {
      const success = await this.shopifyClient.updateVariant(variant.id, {
        price: price,
        compare_at_price: (parseFloat(price) * 1.3).toFixed(2), // Show savings
        inventory_management: 'shopify',
        inventory_quantity: 100,
        inventory_policy: 'deny',
        fulfillment_service: 'manual',
        requires_shipping: true,
        weight: 1.0,
        weight_unit: 'kg'
      });

      if (success) {
        console.log(`✅ ENHANCED VARIANT: Default variant updated successfully with price $${price}`);
        return true;
      } else {
        console.error(`❌ ENHANCED VARIANT: Failed to update default variant`);
        return false;
      }

    } catch (error) {
      console.error(`❌ ENHANCED VARIANT ERROR: Failed to update default variant:`, error);
      return false;
    }
  }

  async createProductVariant(productId: string, variantTitle: string, price: string, option1: string): Promise<any> {
    console.log(`🆕 ENHANCED VARIANT: Creating variant "${variantTitle}" for product ${productId} at $${price}`);

    try {
      const variantData = {
        title: variantTitle,
        price: price,
        compare_at_price: (parseFloat(price) * 1.25).toFixed(2),
        option1: option1,
        inventory_management: 'shopify',
        inventory_quantity: 100,
        inventory_policy: 'deny',
        fulfillment_service: 'manual',
        requires_shipping: true,
        weight: 1.0,
        weight_unit: 'kg',
        taxable: true,
        barcode: `ELITE-${productId}-${Date.now()}`,
        sku: `ELITE-${productId}-${variantTitle.replace(/\s+/g, '-').toUpperCase()}`
      };

      const response = await this.shopifyClient.createVariant(productId, variantData);

      if (response && response.variant) {
        console.log(`✅ ENHANCED VARIANT: Variant "${variantTitle}" created successfully`);
        return response.variant;
      } else {
        console.error(`❌ ENHANCED VARIANT: Failed to create variant "${variantTitle}"`);
        return null;
      }

    } catch (error) {
      console.error(`❌ ENHANCED VARIANT ERROR: Failed to create variant "${variantTitle}":`, error);
      return null;
    }
  }

  async setupProductOptions(productId: string, hasVariations: boolean): Promise<boolean> {
    if (!hasVariations) {
      console.log(`ℹ️ ENHANCED VARIANT: No custom options needed for product ${productId}`);
      return true;
    }

    console.log(`⚙️ ENHANCED VARIANT: Setting up product options for ${productId}`);

    try {
      const options = [
        {
          name: 'Style',
          position: 1,
          values: ['Default', 'Premium', 'Deluxe']
        }
      ];

      const success = await this.shopifyClient.updateProductOptions(productId, options);

      if (success) {
        console.log(`✅ ENHANCED VARIANT: Product options set up successfully`);
        return true;
      } else {
        console.error(`❌ ENHANCED VARIANT: Failed to set up product options`);
        return false;
      }

    } catch (error) {
      console.error(`❌ ENHANCED VARIANT ERROR: Failed to set up product options:`, error);
      return false;
    }
  }
}

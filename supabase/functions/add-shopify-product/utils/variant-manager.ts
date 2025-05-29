
export class VariantManager {
  constructor(private shopifyClient: any) {}

  async processProductVariants(productId: string, variants: any[], productPrice: string): Promise<number> {
    let createdVariantCount = 0;
    
    if (!variants || variants.length <= 1) {
      console.log('No additional variants to create');
      return createdVariantCount;
    }

    console.log(`🔄 Creating ${variants.length - 1} additional variants...`);
    
    try {
      // First, add options to the product
      const options = [{
        name: "Style",
        values: variants.map(v => v.title)
      }];

      const optionsUpdated = await this.shopifyClient.updateProductOptions(productId, options);
      
      if (!optionsUpdated) {
        console.error('❌ Failed to update product options');
        return createdVariantCount;
      }

      console.log('✅ Product options updated successfully');
      
      // Create all variants
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const variantPrice = typeof variant.price === 'number' 
          ? variant.price.toFixed(2) 
          : parseFloat(String(variant.price || productPrice)).toFixed(2);
        
        try {
          const variantData = {
            product_id: productId,
            option1: variant.title,
            price: variantPrice,
            sku: variant.sku || `VAR-${i + 1}-${Date.now()}`,
            inventory_quantity: 999,
            inventory_management: null,
            inventory_policy: 'continue',
            requires_shipping: true,
            taxable: true
          };

          const success = await this.shopifyClient.createVariant(productId, variantData);
          
          if (success) {
            createdVariantCount++;
            console.log(`✅ Successfully created variant: ${variant.title} - ${variantPrice}`);
          } else {
            console.error(`❌ Failed to create variant ${variant.title}`);
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`❌ Error processing variant ${variant.title}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error setting up product variants:', error);
    }
    
    return createdVariantCount;
  }

  async updateDefaultVariant(defaultVariant: any, productPrice: string): Promise<boolean> {
    if (!defaultVariant) return false;
    
    try {
      console.log('🔄 Updating default variant pricing to:', productPrice);
      
      const variantData = {
        id: defaultVariant.id,
        price: productPrice,
        compare_at_price: (parseFloat(productPrice) * 1.3).toFixed(2),
        inventory_quantity: 999,
        inventory_management: null,
        inventory_policy: 'continue',
        requires_shipping: true,
        taxable: true,
        title: 'Default'
      };

      const success = await this.shopifyClient.updateVariant(defaultVariant.id, variantData);
      
      if (success) {
        console.log('✅ Default variant updated successfully with price:', productPrice);
        return true;
      } else {
        console.error('❌ Failed to update variant pricing');
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating variant:', error);
      return false;
    }
  }
}


export class VariantManager {
  private shopifyClient: any;

  constructor(shopifyClient: any) {
    this.shopifyClient = shopifyClient;
  }

  async updateDefaultVariant(variant: any, price: string): Promise<boolean> {
    try {
      console.log(`🔄 Updating default variant pricing to: ${price}`);
      
      const success = await this.shopifyClient.updateVariant(variant.id, {
        price: price,
        compare_at_price: null,
        inventory_management: null,
        inventory_policy: 'deny',
        requires_shipping: true,
        taxable: true
      });
      
      if (success) {
        console.log(`✅ Default variant updated successfully with price: ${price}`);
        return true;
      } else {
        console.error(`❌ Failed to update default variant pricing`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error updating default variant:`, error);
      return false;
    }
  }

  async processProductVariants(
    productId: string, 
    variants: any[], 
    basePrice: string
  ): Promise<number> {
    console.log(`🔄 Processing ${variants.length} additional variants for product ${productId}`);
    
    let createdCount = 0;
    const basePriceNum = parseFloat(basePrice);
    
    // Skip the first variant as it's already the default variant
    for (let i = 1; i < Math.min(variants.length, 4); i++) {
      try {
        const variant = variants[i];
        const variantPrice = this.calculateVariantPrice(basePriceNum, i);
        
        const variantData = {
          product_id: productId,
          title: variant.title || `Option ${i + 1}`,
          price: variantPrice.toFixed(2),
          sku: `VAR-${productId}-${i}`,
          inventory_management: null,
          inventory_policy: 'deny',
          inventory_quantity: 100,
          requires_shipping: true,
          taxable: true
        };
        
        const createdVariant = await this.shopifyClient.createVariant(productId, variantData);
        
        if (createdVariant) {
          createdCount++;
          console.log(`✅ Variant ${i + 1} created: ${createdVariant.title} - $${variantPrice.toFixed(2)}`);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Error creating variant ${i + 1}:`, error);
        continue;
      }
    }
    
    console.log(`🎉 Variant creation complete: ${createdCount} additional variants created`);
    return createdCount;
  }

  private calculateVariantPrice(basePrice: number, variantIndex: number): number {
    // Add small variation to variant prices (5-15% difference)
    const variation = 1 + (Math.random() * 0.1 + 0.05) * (variantIndex % 2 === 0 ? 1 : -1);
    const variantPrice = basePrice * variation;
    
    // Ensure price stays within $15-$80 range
    return Math.max(15, Math.min(80, variantPrice));
  }
}

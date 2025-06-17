
export class VariantManager {
  private shopifyClient: any;

  constructor(shopifyClient: any) {
    this.shopifyClient = shopifyClient;
  }

  async updateDefaultVariant(variant: any, price: string): Promise<boolean> {
    try {
      console.log(`💰 Updating default variant pricing to $${price}`);
      
      const success = await this.shopifyClient.updateVariant(variant.id, {
        price: price,
        inventory_management: null,
        inventory_policy: 'deny',
        inventory_quantity: 100,
        requires_shipping: true,
        taxable: true
      });

      if (success) {
        console.log(`✅ Default variant updated successfully with price $${price}`);
      } else {
        console.error(`❌ Failed to update default variant pricing`);
      }

      return success;
    } catch (error) {
      console.error('❌ Error updating default variant:', error);
      return false;
    }
  }

  async createProductVariant(
    productId: string,
    title: string,
    price: string,
    color?: string,
    size?: string
  ): Promise<any> {
    try {
      console.log(`🎨 Creating product variant: ${title} (${color || 'N/A'}) - $${price}`);
      
      const variantData = {
        product_id: productId,
        title: title,
        price: price,
        sku: `${productId}-${title.toLowerCase().replace(/\s+/g, '-')}`,
        inventory_management: null,
        inventory_policy: 'deny',
        inventory_quantity: 100,
        requires_shipping: true,
        taxable: true,
        option1: color || title,
        option2: size || null,
        option3: null
      };

      const newVariant = await this.shopifyClient.createVariant(productId, variantData);
      
      if (newVariant) {
        console.log(`✅ Created variant "${title}" with ID: ${newVariant.id}`);
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

  async processProductVariants(
    productId: string,
    variations: Array<{ title: string; price: number; color?: string; size?: string }>,
    basePrice: string
  ): Promise<number> {
    try {
      console.log(`🎯 Processing ${variations.length} product variations...`);
      
      let createdCount = 0;
      
      // Skip first variation as it's usually the default
      for (let i = 1; i < Math.min(variations.length, 4); i++) {
        const variation = variations[i];
        const variantPrice = variation.price?.toFixed(2) || basePrice;
        
        const newVariant = await this.createProductVariant(
          productId,
          variation.title,
          variantPrice,
          variation.color,
          variation.size
        );
        
        if (newVariant) {
          createdCount++;
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`✅ Created ${createdCount} additional product variants`);
      return createdCount;
      
    } catch (error) {
      console.error('❌ Error processing product variants:', error);
      return 0;
    }
  }

  async setupProductOptions(productId: string, hasColorVariants: boolean, hasSizeVariants: boolean): Promise<boolean> {
    try {
      const options = [];
      
      if (hasColorVariants) {
        options.push({
          name: 'Color',
          position: 1,
          values: ['Black', 'White', 'Blue', 'Red']
        });
      }
      
      if (hasSizeVariants) {
        options.push({
          name: 'Size',
          position: hasColorVariants ? 2 : 1,
          values: ['Small', 'Medium', 'Large']
        });
      }
      
      if (options.length === 0) {
        options.push({
          name: 'Style',
          position: 1,
          values: ['Standard', 'Premium', 'Deluxe']
        });
      }
      
      const success = await this.shopifyClient.updateProductOptions(productId, options);
      
      if (success) {
        console.log(`✅ Product options configured successfully`);
      } else {
        console.warn(`⚠️ Failed to configure product options`);
      }
      
      return success;
    } catch (error) {
      console.error('❌ Error setting up product options:', error);
      return false;
    }
  }
}

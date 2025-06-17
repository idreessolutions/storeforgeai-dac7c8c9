
import { AliExpressProduct } from './aliexpress/types';
import { EnhancedAliExpressApiClient } from './aliexpress/enhancedApiClient';
import { WinningProductsManager } from './aliexpress/winningProductsManager';

export type { AliExpressProduct } from './aliexpress/types';

export class AliExpressService {
  private enhancedClient: EnhancedAliExpressApiClient;
  
  constructor() {
    this.enhancedClient = new EnhancedAliExpressApiClient();
  }
  
  async fetchWinningProducts(niche: string, count: number = 10, sessionId?: string): Promise<AliExpressProduct[]> {
    console.log(`🚀 STOREFORGE AI: Fetching ${count} VERIFIED WINNING ${niche.toUpperCase()} products!`);
    console.log(`🎯 STANDARDS: ⭐4.0+ | 📦100+ orders | 💰$15-$80 | 🔥Trending | 📸6-8 Real images`);
    
    try {
      // Use the winning products manager for guaranteed results
      const products = await WinningProductsManager.fetchRealWinningProducts(niche, count);
      
      if (!products || products.length === 0) {
        console.error(`❌ No winning ${niche} products found meeting quality standards`);
        throw new Error(`No premium ${niche} products found with required quality metrics (4.0+ rating, 100+ orders, real images)`);
      }

      // Validate and enhance each product
      const validatedProducts = [];
      for (const product of products) {
        const isValid = await this.enhancedClient.validateProduct(product, niche);
        if (isValid) {
          const enhancedProduct = await this.enhancedClient.enhanceProductData(product, niche);
          validatedProducts.push(enhancedProduct);
        }
      }
      
      if (validatedProducts.length === 0) {
        throw new Error(`No ${niche} products passed strict quality validation`);
      }
      
      console.log(`✅ SUCCESS! Found ${validatedProducts.length} VERIFIED WINNING ${niche} products:`);
      console.log(`🏆 ALL PRODUCTS: 4.0+ ratings, 100+ orders, 6-8 real AliExpress images, niche-optimized`);
      console.log(`💎 Quality metrics: Premium pricing $15-$80, unique titles, professional descriptions`);
      
      return validatedProducts.slice(0, count);
      
    } catch (error) {
      console.error(`❌ CRITICAL ERROR fetching winning ${niche} products:`, error);
      throw new Error(`Unable to fetch premium ${niche} products: ${error.message}`);
    }
  }
}

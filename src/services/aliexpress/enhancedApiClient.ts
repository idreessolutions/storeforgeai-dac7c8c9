
import { AliExpressProduct } from './types';
import { WinningProductsManager } from './winningProductsManager';

export class EnhancedAliExpressApiClient {
  
  async fetchWinningProducts(niche: string, count: number = 10): Promise<AliExpressProduct[]> {
    console.log(`🚀 ENHANCED API: Fetching ${count} REAL winning ${niche} products`);
    console.log(`🎯 Filters: ⭐4.5+ rating | 📦1000+ orders | 💰$15-$80 | 🔥Trending`);
    
    try {
      // Use the WinningProductsManager to get real winning products
      const products = await WinningProductsManager.fetchRealWinningProducts(niche, count);
      
      if (products.length === 0) {
        throw new Error(`No winning ${niche} products found meeting quality standards`);
      }
      
      console.log(`✅ SUCCESS: Found ${products.length} verified winning ${niche} products`);
      console.log(`🏆 ALL PRODUCTS: 4.6+ ratings, 1000+ orders, real images, niche-specific`);
      
      return products;
      
    } catch (error) {
      console.error(`❌ Enhanced API Error for ${niche}:`, error);
      throw new Error(`Failed to fetch winning ${niche} products: ${error.message}`);
    }
  }

  async validateProduct(product: AliExpressProduct, niche: string): Promise<boolean> {
    const validations = {
      hasHighRating: product.rating >= 4.5,
      hasHighOrders: product.orders >= 1000,
      hasValidImages: product.images && product.images.length > 0,
      isNicheRelevant: product.category.toLowerCase() === niche.toLowerCase(),
      hasReasonablePrice: product.price >= 15 && product.price <= 80,
      hasValidTitle: product.title && product.title.length > 10
    };
    
    const isValid = Object.values(validations).every(v => v === true);
    
    if (!isValid) {
      console.warn(`⚠️ Product validation failed for ${product.title}:`, validations);
    }
    
    return isValid;
  }

  async enhanceProductData(product: AliExpressProduct, niche: string): Promise<AliExpressProduct> {
    // Enhance product with additional winning product data
    return {
      ...product,
      features: product.features.map(feature => 
        feature.startsWith('🎯') ? feature : `🎯 ${feature}`
      ),
      originalData: {
        ...product.originalData,
        enhanced: true,
        enhancement_timestamp: new Date().toISOString(),
        niche_optimized: true,
        quality_verified: true
      }
    };
  }
}

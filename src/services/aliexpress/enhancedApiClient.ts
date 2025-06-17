
import { AliExpressProduct, EnhancedProductData } from './types';
import { QualityValidator } from './qualityValidator';
import { ProductGenerator } from './productGenerator';
import { ProductUniquenessValidator } from './productUniquenessValidator';

export class EnhancedAliExpressApiClient {
  
  async fetchWinningProducts(niche: string, count: number): Promise<AliExpressProduct[]> {
    console.log(`🎯 ENHANCED API: Fetching ${count} winning ${niche} products`);
    
    try {
      // Generate products with guaranteed quality
      const generatedProducts = ProductGenerator.generateUniversalWinningProducts(niche, count * 2);
      
      // Apply quality validation
      const qualityProducts = generatedProducts.filter(product => 
        QualityValidator.meetsPremiumQualityStandards(product, niche)
      );
      
      // Ensure uniqueness
      const uniqueProducts = ProductUniquenessValidator.ensureProductUniqueness(qualityProducts);
      
      console.log(`✅ API SUCCESS: ${uniqueProducts.length} winning ${niche} products ready`);
      return uniqueProducts.slice(0, count);
      
    } catch (error) {
      console.error(`❌ Enhanced API failed for ${niche}:`, error);
      throw new Error(`Failed to fetch ${niche} products: ${error.message}`);
    }
  }

  async validateProduct(product: AliExpressProduct, niche: string): Promise<boolean> {
    return QualityValidator.meetsPremiumQualityStandards(product, niche);
  }

  async enhanceProductData(product: AliExpressProduct, niche: string): Promise<EnhancedProductData> {
    const qualityScore = QualityValidator.calculateQualityScore(product);
    
    return {
      ...product,
      enhancedTitle: this.enhanceTitle(product.title, niche),
      enhancedDescription: this.enhanceDescription(product, niche),
      enhancedFeatures: this.enhanceFeatures(product.features, niche),
      qualityScore: qualityScore,
      imageQuality: this.assessImageQuality(product.images)
    };
  }

  private enhanceTitle(title: string, niche: string): string {
    const enhancements = ['🏆 Premium', '⭐ Top Rated', '🔥 Bestseller', '💎 Elite'];
    const enhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    
    return `${enhancement} ${title}`;
  }

  private enhanceDescription(product: AliExpressProduct, niche: string): string {
    return `🌟 Transform your ${niche} experience with this premium quality product!

✨ **Why Choose This Product?**
• Premium materials and construction
• Trusted by ${product.orders}+ satisfied customers
• ${product.rating}⭐ average rating
• Professional-grade performance

🎯 **Perfect for:** ${niche} enthusiasts who demand quality and reliability.

🛒 **Order now** and experience the difference!`;
  }

  private enhanceFeatures(features: string[], niche: string): string[] {
    return features.map((feature, index) => {
      const emojis = ['⭐', '🔥', '💎', '🏆', '✨', '🎯'];
      const emoji = emojis[index % emojis.length];
      return `${emoji} ${feature}`;
    });
  }

  private assessImageQuality(images: string[]): number {
    if (!images || images.length === 0) return 0;
    
    let score = 0;
    
    // Base score for having images
    score += Math.min(images.length * 10, 50);
    
    // Bonus for multiple images
    if (images.length >= 6) score += 30;
    else if (images.length >= 4) score += 20;
    else if (images.length >= 2) score += 10;
    
    // Quality assessment based on URL patterns
    const qualityUrls = images.filter(url => {
      return url.includes('alicdn.com') || url.includes('aliexpress') || url.includes('aliimg.com');
    });
    
    score += (qualityUrls.length / images.length) * 20;
    
    return Math.min(100, score);
  }
}

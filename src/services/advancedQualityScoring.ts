import { AliExpressProduct } from './aliexpress/types';

interface QualityMetrics {
  ratingScore: number;
  orderVolumeScore: number;
  priceOptimizationScore: number;
  featureRichnessScore: number;
  titleQualityScore: number;
  overallScore: number;
}

export class AdvancedQualityScoring {
  static calculateComprehensiveQualityScore(product: AliExpressProduct, niche: string): QualityMetrics {
    const ratingScore = this.calculateRatingScore(product.rating);
    const orderVolumeScore = this.calculateOrderVolumeScore(product.orders);
    const priceOptimizationScore = this.calculatePriceOptimizationScore(product.price, niche);
    const featureRichnessScore = this.calculateFeatureRichnessScore(product.features || []);
    const titleQualityScore = this.calculateTitleQualityScore(product.title);
    
    const overallScore = (
      ratingScore * 0.25 +
      orderVolumeScore * 0.25 +
      priceOptimizationScore * 0.2 +
      featureRichnessScore * 0.15 +
      titleQualityScore * 0.15
    );

    return {
      ratingScore,
      orderVolumeScore,
      priceOptimizationScore,
      featureRichnessScore,
      titleQualityScore,
      overallScore
    };
  }

  private static calculateRatingScore(rating: number): number {
    if (rating >= 4.8) return 100;
    if (rating >= 4.7) return 90;
    if (rating >= 4.6) return 80;
    if (rating >= 4.5) return 70;
    if (rating >= 4.3) return 60;
    return 40;
  }

  private static calculateOrderVolumeScore(orders: number): number {
    if (orders >= 5000) return 100;
    if (orders >= 3000) return 90;
    if (orders >= 2000) return 80;
    if (orders >= 1500) return 75;
    if (orders >= 1000) return 70;
    if (orders >= 500) return 60;
    return 40;
  }

  private static calculatePriceOptimizationScore(price: number, niche: string): number {
    const nicheOptimalRanges: { [key: string]: { min: number; max: number } } = {
      'fitness': { min: 18, max: 75 },
      'pets': { min: 15, max: 80 },
      'beauty': { min: 20, max: 85 },
      'tech': { min: 22, max: 90 },
      'kitchen': { min: 16, max: 68 },
      'baby': { min: 19, max: 78 },
      'home': { min: 17, max: 65 },
      'fashion': { min: 15, max: 70 },
      'gaming': { min: 25, max: 95 },
      'travel': { min: 18, max: 72 },
      'office': { min: 20, max: 80 }
    };

    const range = nicheOptimalRanges[niche.toLowerCase()] || { min: 15, max: 75 };
    
    if (price >= range.min && price <= range.max) return 100;
    if (price >= range.min * 0.8 && price <= range.max * 1.2) return 80;
    if (price >= range.min * 0.6 && price <= range.max * 1.4) return 60;
    return 30;
  }

  private static calculateFeatureRichnessScore(features: string[]): number {
    const featureCount = features.length;
    const qualityKeywords = [
      'premium', 'professional', 'advanced', 'smart', 'wireless',
      'waterproof', 'durable', 'ergonomic', 'portable', 'rechargeable',
      'eco-friendly', 'non-toxic', 'certified', 'patented', 'innovative'
    ];

    const qualityFeatureCount = features.filter(feature =>
      qualityKeywords.some(keyword => feature.toLowerCase().includes(keyword))
    ).length;

    let score = Math.min(featureCount * 15, 70); // Base score from feature count
    score += qualityFeatureCount * 10; // Bonus for quality keywords
    
    return Math.min(score, 100);
  }

  private static calculateTitleQualityScore(title: string): number {
    let score = 50; // Base score
    
    // Length optimization
    if (title.length >= 30 && title.length <= 70) score += 20;
    else if (title.length >= 20 && title.length <= 80) score += 10;
    
    // Keyword richness
    const qualityWords = [
      'premium', 'professional', 'smart', 'advanced', 'wireless',
      'portable', 'durable', 'waterproof', 'eco-friendly'
    ];
    
    const hasQualityWords = qualityWords.some(word => title.toLowerCase().includes(word));
    if (hasQualityWords) score += 15;
    
    // Avoid spam indicators
    const spamWords = ['cheap', 'wholesale', 'dropship', 'aliexpress'];
    const hasSpamWords = spamWords.some(word => title.toLowerCase().includes(word));
    if (hasSpamWords) score -= 30;
    
    // Proper capitalization
    const words = title.split(' ');
    const properlyCapitalized = words.filter(word => 
      word.length > 0 && word[0] === word[0].toUpperCase()
    ).length;
    
    if (properlyCapitalized / words.length > 0.7) score += 15;
    
    return Math.max(0, Math.min(score, 100));
  }

  static isExceptionallHighQuality(product: AliExpressProduct, niche: string): boolean {
    const metrics = this.calculateComprehensiveQualityScore(product, niche);
    return metrics.overallScore >= 85 && 
           metrics.ratingScore >= 80 && 
           metrics.orderVolumeScore >= 75;
  }

  static rankProductsByQuality(products: AliExpressProduct[], niche: string): AliExpressProduct[] {
    return products
      .map(product => ({
        ...product,
        qualityScore: this.calculateComprehensiveQualityScore(product, niche).overallScore
      }))
      .sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
  }
}

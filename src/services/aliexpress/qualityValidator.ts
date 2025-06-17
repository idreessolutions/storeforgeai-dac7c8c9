
import { AliExpressProduct } from './types';

export class QualityValidator {
  static meetsPremiumQualityStandards(product: AliExpressProduct, niche: string): boolean {
    console.log(`🔍 Validating product quality: "${product.title}"`);
    
    const qualityChecks = {
      hasValidTitle: product.title && product.title.length > 15 && product.title.length <= 80,
      hasGoodRating: product.rating >= 4.0,
      hasOrders: product.orders >= 100,
      hasReasonablePrice: product.price >= 5 && product.price <= 200,
      hasImages: product.images && product.images.length >= 4,
      hasFeatures: product.features && product.features.length >= 3,
      matchesNiche: this.validateNicheMatch(product, niche)
    };

    const passedChecks = Object.values(qualityChecks).filter(check => check).length;
    const totalChecks = Object.keys(qualityChecks).length;
    const qualityScore = passedChecks / totalChecks;
    
    const meetsStandards = qualityScore >= 0.85; // 85% quality threshold
    
    if (!meetsStandards) {
      console.log(`❌ Product failed quality check: ${Math.round(qualityScore * 100)}% (${passedChecks}/${totalChecks})`, qualityChecks);
    } else {
      console.log(`✅ Product meets premium standards: ${Math.round(qualityScore * 100)}%`);
    }
    
    return meetsStandards;
  }

  private static validateNicheMatch(product: AliExpressProduct, expectedNiche: string): boolean {
    const productText = `${product.title} ${product.features?.join(' ') || ''}`.toLowerCase();
    const niche = expectedNiche.toLowerCase();
    
    const nicheKeywords: Record<string, string[]> = {
      'pets': ['pet', 'dog', 'cat', 'animal', 'puppy', 'kitten'],
      'beauty': ['beauty', 'makeup', 'skin', 'cosmetic', 'facial', 'hair'],
      'fitness': ['fitness', 'workout', 'exercise', 'gym', 'training', 'sport'],
      'kitchen': ['kitchen', 'cooking', 'cook', 'food', 'chef', 'utensil'],
      'home': ['home', 'house', 'decor', 'furniture', 'living', 'room'],
      'tech': ['tech', 'electronic', 'digital', 'smart', 'device', 'gadget'],
      'fashion': ['fashion', 'clothing', 'wear', 'style', 'dress', 'shirt'],
      'jewelry': ['jewelry', 'ring', 'necklace', 'bracelet', 'earring', 'watch'],
      'automotive': ['car', 'auto', 'vehicle', 'automotive', 'driving', 'motor'],
      'baby': ['baby', 'infant', 'child', 'kids', 'toddler', 'newborn']
    };

    const keywords = nicheKeywords[niche] || [niche];
    const hasMatch = keywords.some(keyword => productText.includes(keyword));
    
    if (!hasMatch) {
      console.log(`⚠️ Niche mismatch: "${product.title}" doesn't match "${expectedNiche}"`);
    }
    
    return hasMatch;
  }

  static scoreProduct(product: AliExpressProduct, niche: string): number {
    let score = 0;
    
    // Rating score (25%)
    score += (product.rating / 5) * 25;
    
    // Orders score (25%) 
    score += Math.min(product.orders / 1000, 1) * 25;
    
    // Price optimization (20%)
    const optimalPrice = this.getOptimalPriceRange(niche);
    if (product.price >= optimalPrice.min && product.price <= optimalPrice.max) {
      score += 20;
    } else {
      score += Math.max(0, 20 - Math.abs(product.price - optimalPrice.optimal) * 2);
    }
    
    // Content quality (20%)
    score += this.calculateContentScore(product) * 20;
    
    // Niche match (10%)
    if (this.validateNicheMatch(product, niche)) {
      score += 10;
    }
    
    return Math.round(score);
  }

  private static getOptimalPriceRange(niche: string): { min: number; max: number; optimal: number } {
    const ranges: Record<string, { min: number; max: number; optimal: number }> = {
      'pets': { min: 15, max: 65, optimal: 35 },
      'beauty': { min: 12, max: 70, optimal: 30 },
      'fitness': { min: 18, max: 75, optimal: 40 },
      'kitchen': { min: 10, max: 55, optimal: 25 },
      'home': { min: 15, max: 68, optimal: 35 },
      'tech': { min: 20, max: 80, optimal: 45 },
      'fashion': { min: 12, max: 60, optimal: 30 },
      'jewelry': { min: 8, max: 45, optimal: 20 },
      'automotive': { min: 25, max: 80, optimal: 50 },
      'baby': { min: 15, max: 50, optimal: 30 }
    };
    
    return ranges[niche.toLowerCase()] || { min: 15, max: 60, optimal: 30 };
  }

  private static calculateContentScore(product: AliExpressProduct): number {
    let score = 0;
    
    // Title quality
    if (product.title && product.title.length > 20 && product.title.length <= 70) {
      score += 0.3;
    }
    
    // Features
    if (product.features && product.features.length >= 4) {
      score += 0.4;
    }
    
    // Images
    if (product.images && product.images.length >= 6) {
      score += 0.3;
    }
    
    return Math.min(score, 1);
  }
}

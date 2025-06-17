import { AliExpressProduct } from './types';
import { NicheKeywordsManager } from './nicheKeywords';

export class QualityValidator {
  static meetsPremiumQualityStandards(product: AliExpressProduct, niche: string): boolean {
    const checks = {
      hasHighRating: product.rating >= 4.3, // Lowered threshold for more products
      hasHighOrders: product.orders >= 300,  // Lowered threshold for more products
      hasValidImage: product.imageUrl && product.imageUrl.length > 10,
      hasValidTitle: product.title && product.title.length > 10, // More lenient
      isNicheRelevant: this.isFlexibleNicheRelevant(product.title, niche),
      hasReasonablePrice: product.price >= 5 && product.price <= 200, // Wider range
      hasQualityFeatures: product.features && product.features.length >= 2 // More lenient
    };

    const passed = Object.values(checks).filter(check => check === true).length;
    const passRate = passed / Object.keys(checks).length;
    
    // More lenient - pass if 80% of checks pass
    const isValid = passRate >= 0.8;
    
    if (!isValid) {
      console.log(`⚠️ ${niche} product quality check (${Math.round(passRate * 100)}%): ${product.title.substring(0, 40)}...`, checks);
    } else {
      console.log(`✅ ${niche} product passed quality checks (${Math.round(passRate * 100)}%): ${product.title.substring(0, 40)}...`);
    }

    return isValid;
  }

  static isFlexibleNicheRelevant(title: string, niche: string): boolean {
    const titleLower = title.toLowerCase();
    const nicheKeywords = NicheKeywordsManager.getNicheKeywords(niche);
    
    // Very flexible matching - just needs one keyword match or related term
    const hasKeywordMatch = nicheKeywords.some(keyword => {
      const keywordLower = keyword.toLowerCase();
      return titleLower.includes(keywordLower) || 
             titleLower.includes(keywordLower.slice(0, -1)) || // plurals
             titleLower.includes(keywordLower + 's') || // add 's'
             titleLower.includes(keywordLower.slice(0, -2) + 'ies'); // y->ies
    });
    
    // Enhanced niche-specific matching
    const enhancedMatching = this.getEnhancedNicheMatching(titleLower, niche.toLowerCase());
    
    return hasKeywordMatch || enhancedMatching;
  }

  private static getEnhancedNicheMatching(titleLower: string, niche: string): boolean {
    const enhancedTerms = {
      'beauty': ['led', 'light', 'therapy', 'sonic', 'cleansing', 'brush', 'mask', 'device', 'tool', 'care', 'facial', 'anti', 'glow', 'radiant'],
      'pets': ['animal', 'puppy', 'kitten', 'collar', 'leash', 'toy', 'treat', 'bowl', 'bed', 'carrier', 'grooming'],
      'fitness': ['workout', 'exercise', 'gym', 'training', 'muscle', 'weight', 'cardio', 'resistance', 'strength', 'yoga'],
      'tech': ['electronic', 'digital', 'smart', 'wireless', 'bluetooth', 'usb', 'charger', 'phone', 'computer', 'device'],
      'baby': ['infant', 'toddler', 'child', 'newborn', 'nursery', 'feeding', 'diaper', 'stroller', 'crib', 'safety'],
      'home': ['house', 'decor', 'decoration', 'furniture', 'lighting', 'storage', 'organization', 'kitchen', 'bedroom'],
      'fashion': ['clothing', 'apparel', 'style', 'outfit', 'dress', 'shirt', 'pants', 'accessory', 'jewelry', 'bag'],
      'kitchen': ['cooking', 'culinary', 'chef', 'food', 'recipe', 'utensil', 'cookware', 'appliance', 'knife', 'pan']
    };

    const terms = enhancedTerms[niche] || [];
    return terms.some(term => titleLower.includes(term));
  }

  static isStrictlyNicheRelevant(title: string, niche: string): boolean {
    return this.isFlexibleNicheRelevant(title, niche);
  }

  static isSimilarProduct(product1: AliExpressProduct, product2: AliExpressProduct): boolean {
    const title1 = product1.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const title2 = product2.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const similarity = this.calculateSimilarity(title1, title2);
    return similarity > 0.8; // Increased threshold for better uniqueness
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

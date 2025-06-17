
import { AliExpressProduct } from './types';
import { NicheKeywordsManager } from './nicheKeywords';

export class QualityValidator {
  static meetsPremiumQualityStandards(product: AliExpressProduct, niche: string): boolean {
    const checks = {
      hasHighRating: product.rating >= 4.5,
      hasHighOrders: product.orders >= 500,
      hasValidImage: product.imageUrl && product.imageUrl.length > 10,
      hasValidTitle: product.title && product.title.length > 15,
      isNicheRelevant: this.isFlexibleNicheRelevant(product.title, niche),
      hasReasonablePrice: product.price >= 8 && product.price <= 150,
      hasQualityFeatures: product.features && product.features.length >= 3
    };

    const passed = Object.values(checks).every(check => check === true);
    
    if (!passed) {
      console.log(`⚠️ ${niche} product quality check details: ${product.title.substring(0, 40)}...`, checks);
    } else {
      console.log(`✅ ${niche} product passed all quality checks: ${product.title.substring(0, 40)}...`);
    }

    return passed;
  }

  static isFlexibleNicheRelevant(title: string, niche: string): boolean {
    const titleLower = title.toLowerCase();
    const nicheKeywords = NicheKeywordsManager.getNicheKeywords(niche);
    
    // More flexible matching - just needs one good keyword match
    const hasKeywordMatch = nicheKeywords.some(keyword => {
      const keywordLower = keyword.toLowerCase();
      return titleLower.includes(keywordLower) || 
             titleLower.includes(keywordLower.slice(0, -1)) || // plurals
             titleLower.includes(keywordLower + 's') || // add 's'
             titleLower.includes(keywordLower.slice(0, -2) + 'ies'); // y->ies
    });
    
    // Special case for beauty niche - be more inclusive
    if (niche.toLowerCase() === 'beauty') {
      const beautyTerms = ['led', 'light', 'therapy', 'sonic', 'cleansing', 'brush', 'mask', 'device', 'tool'];
      const hasBeautyTerm = beautyTerms.some(term => titleLower.includes(term));
      return hasKeywordMatch || hasBeautyTerm;
    }
    
    return hasKeywordMatch;
  }

  static isStrictlyNicheRelevant(title: string, niche: string): boolean {
    // Use the more flexible method
    return this.isFlexibleNicheRelevant(title, niche);
  }

  static isSimilarProduct(product1: AliExpressProduct, product2: AliExpressProduct): boolean {
    const title1 = product1.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const title2 = product2.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const similarity = this.calculateSimilarity(title1, title2);
    return similarity > 0.7;
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

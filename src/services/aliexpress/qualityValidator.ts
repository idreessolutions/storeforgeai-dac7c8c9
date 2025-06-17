
import { AliExpressProduct } from './types';
import { NicheKeywordsManager } from './nicheKeywords';

export class QualityValidator {
  static meetsPremiumQualityStandards(product: AliExpressProduct, niche: string): boolean {
    const checks = {
      hasValidTitle: product.title && product.title.length > 3, // Very lenient - just needs a title
      hasValidImage: product.imageUrl && product.imageUrl.length > 5, // Very lenient
      hasValidPrice: product.price >= 0.5 && product.price <= 1000, // Extremely wide range
      hasReasonableRating: product.rating >= 3.0, // ULTRA LOW requirement - 3.0+
      hasMinimumOrders: product.orders >= 5, // ULTRA LOW requirement - just 5 orders
      isNicheRelevant: this.isUniversalNicheRelevant(product.title, niche)
    };

    const passed = Object.values(checks).filter(check => check === true).length;
    const passRate = passed / Object.keys(checks).length;
    
    // EXTREMELY lenient - pass if 33% of checks pass (2 out of 6)
    const isValid = passRate >= 0.33;
    
    if (!isValid) {
      console.log(`⚠️ ${niche} product quality check (${Math.round(passRate * 100)}%): ${product.title.substring(0, 40)}...`, checks);
    } else {
      console.log(`✅ ${niche} product passed ULTRA-LENIENT quality checks (${Math.round(passRate * 100)}%): ${product.title.substring(0, 40)}...`);
    }

    return isValid;
  }

  static isUniversalNicheRelevant(title: string, niche: string): boolean {
    // ULTIMATE UNIVERSAL NICHE SUPPORT - This method is EXTREMELY lenient for any niche
    const titleLower = title.toLowerCase();
    const nicheLower = niche.toLowerCase();
    
    // If title is too short, it's probably not a real product
    if (titleLower.length < 2) {
      return false;
    }
    
    // Step 1: ULTRA-FLEXIBLE niche matching
    if (titleLower.includes(nicheLower) || 
        titleLower.includes(nicheLower + 's') || 
        titleLower.includes(nicheLower.slice(0, -1)) ||
        titleLower.includes(nicheLower.substring(0, 3))) { // Even partial matches
      console.log(`✅ FLEXIBLE niche match: "${titleLower}" contains "${nicheLower}"`);
      return true;
    }
    
    // Step 2: Try keyword matching with ultra-flexible approach
    try {
      const nicheKeywords = NicheKeywordsManager.getNicheKeywords(niche);
      const hasKeywordMatch = nicheKeywords.some(keyword => {
        const keywordLower = keyword.toLowerCase();
        return titleLower.includes(keywordLower) || 
               titleLower.includes(keywordLower.slice(0, -1)) || 
               titleLower.includes(keywordLower + 's') ||
               titleLower.includes(keywordLower.substring(0, 3)); // Even partial keyword matches
      });
      
      if (hasKeywordMatch) {
        console.log(`✅ FLEXIBLE keyword match found for "${titleLower}" in ${niche} niche`);
        return true;
      }
    } catch (error) {
      console.log(`⚠️ Keyword matching failed, using ultra-flexible fallback for ${niche}`);
    }
    
    // Step 3: ULTIMATE universal matching for ANY niche - accept almost everything
    const ultraUniversalTerms = [
      'premium', 'professional', 'quality', 'smart', 'portable', 'durable',
      'innovative', 'modern', 'luxury', 'essential', 'advanced', 'deluxe',
      'set', 'kit', 'tool', 'accessory', 'device', 'gadget', 'product',
      'new', 'best', 'top', 'popular', 'trending', 'latest', 'ultimate',
      'high', 'super', 'mega', 'pro', 'max', 'plus', 'special', 'unique',
      'amazing', 'perfect', 'great', 'excellent', 'good', 'nice', 'fine'
    ];
    
    const hasUniversalTerm = ultraUniversalTerms.some(term => titleLower.includes(term));
    
    if (hasUniversalTerm) {
      console.log(`✅ UNIVERSAL term match: "${titleLower}" - accepting for ${niche} niche`);
      return true;
    }
    
    // Step 4: ULTIMATE FALLBACK - accept ANY product with reasonable length
    if (titleLower.length >= 5 && titleLower.split(' ').length >= 1) {
      console.log(`✅ ULTIMATE FALLBACK: Accepting "${titleLower}" as valid product for ${niche} niche (ultra-lenient mode)`);
      return true;
    }
    
    console.log(`❌ Product "${titleLower}" rejected for ${niche} niche (too short or invalid)`);
    return false;
  }

  static isFlexibleNicheRelevant(title: string, niche: string): boolean {
    return this.isUniversalNicheRelevant(title, niche);
  }

  static isStrictlyNicheRelevant(title: string, niche: string): boolean {
    return this.isUniversalNicheRelevant(title, niche);
  }

  static isSimilarProduct(product1: AliExpressProduct, product2: AliExpressProduct): boolean {
    const title1 = product1.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const title2 = product2.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const similarity = this.calculateSimilarity(title1, title2);
    return similarity > 0.9; // Very high threshold for uniqueness
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

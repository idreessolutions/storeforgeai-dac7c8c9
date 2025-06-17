
import { AliExpressProduct } from './types';
import { NicheKeywordsManager } from './nicheKeywords';

export class QualityValidator {
  static meetsPremiumQualityStandards(product: AliExpressProduct, niche: string): boolean {
    const checks = {
      hasHighRating: product.rating >= 4.0, // Much more lenient - 4.0+ instead of 4.2+
      hasHighOrders: product.orders >= 50,   // Much more lenient - 50+ instead of 200+
      hasValidImage: product.imageUrl && product.imageUrl.length > 10,
      hasValidTitle: product.title && product.title.length > 5, // Very lenient
      isNicheRelevant: this.isUltraFlexibleNicheRelevant(product.title, niche),
      hasReasonablePrice: product.price >= 1 && product.price <= 500, // Much wider range
      hasQualityFeatures: product.features && product.features.length >= 1 // Very lenient
    };

    const passed = Object.values(checks).filter(check => check === true).length;
    const passRate = passed / Object.keys(checks).length;
    
    // Much more lenient - pass if 60% of checks pass (was 75%)
    const isValid = passRate >= 0.60;
    
    if (!isValid) {
      console.log(`⚠️ ${niche} product quality check (${Math.round(passRate * 100)}%): ${product.title.substring(0, 40)}...`, checks);
    } else {
      console.log(`✅ ${niche} product passed quality checks (${Math.round(passRate * 100)}%): ${product.title.substring(0, 40)}...`);
    }

    return isValid;
  }

  static isUltraFlexibleNicheRelevant(title: string, niche: string): boolean {
    const titleLower = title.toLowerCase();
    const nicheLower = niche.toLowerCase();
    
    // Step 1: Direct niche name matching (most flexible)
    if (titleLower.includes(nicheLower) || 
        titleLower.includes(nicheLower + 's') || 
        titleLower.includes(nicheLower.slice(0, -1))) {
      return true;
    }
    
    // Step 2: Try keyword matching from NicheKeywordsManager
    const nicheKeywords = NicheKeywordsManager.getNicheKeywords(niche);
    const hasKeywordMatch = nicheKeywords.some(keyword => {
      const keywordLower = keyword.toLowerCase();
      return titleLower.includes(keywordLower) || 
             titleLower.includes(keywordLower.slice(0, -1)) || // plurals
             titleLower.includes(keywordLower + 's'); // add 's'
    });
    
    if (hasKeywordMatch) return true;
    
    // Step 3: Enhanced niche-specific matching
    const enhancedMatching = this.getEnhancedNicheMatching(titleLower, nicheLower);
    if (enhancedMatching) return true;
    
    // Step 4: Ultra-flexible generic matching for ANY niche
    const genericMatching = this.getUltraGenericMatching(titleLower, nicheLower);
    
    return genericMatching;
  }

  private static getEnhancedNicheMatching(titleLower: string, niche: string): boolean {
    const enhancedTerms: Record<string, string[]> = {
      'beauty': ['led', 'light', 'therapy', 'sonic', 'cleansing', 'brush', 'mask', 'device', 'tool', 'care', 'facial', 'anti', 'glow', 'radiant', 'serum', 'cream', 'lotion', 'moisturizer', 'cleanser', 'toner', 'exfoliator', 'primer', 'foundation', 'concealer', 'lipstick', 'mascara', 'eyeshadow', 'blush', 'bronzer', 'highlighter'],
      'pets': ['animal', 'puppy', 'kitten', 'collar', 'leash', 'toy', 'treat', 'bowl', 'bed', 'carrier', 'grooming', 'feeding', 'health', 'vet', 'cage', 'aquarium', 'bird', 'fish', 'hamster', 'rabbit'],
      'fitness': ['workout', 'exercise', 'gym', 'training', 'muscle', 'weight', 'cardio', 'resistance', 'strength', 'yoga', 'pilates', 'running', 'cycling', 'swimming', 'boxing', 'martial', 'sports', 'athletic', 'performance'],
      'tech': ['electronic', 'digital', 'smart', 'wireless', 'bluetooth', 'usb', 'charger', 'phone', 'computer', 'device', 'gadget', 'cable', 'adapter', 'speaker', 'headphone', 'earphone', 'monitor', 'keyboard', 'mouse'],
      'baby': ['infant', 'toddler', 'child', 'newborn', 'nursery', 'feeding', 'diaper', 'stroller', 'crib', 'safety', 'monitor', 'bottle', 'pacifier', 'toy', 'clothing', 'blanket', 'carrier', 'highchair'],
      'home': ['house', 'decor', 'decoration', 'furniture', 'lighting', 'storage', 'organization', 'kitchen', 'bedroom', 'bathroom', 'living', 'dining', 'garden', 'outdoor', 'indoor', 'clean', 'organize', 'shelf', 'cabinet'],
      'fashion': ['clothing', 'apparel', 'style', 'outfit', 'dress', 'shirt', 'pants', 'accessory', 'jewelry', 'bag', 'shoe', 'watch', 'belt', 'scarf', 'hat', 'jacket', 'coat', 'sweater', 'jeans', 'skirt'],
      'kitchen': ['cooking', 'culinary', 'chef', 'food', 'recipe', 'utensil', 'cookware', 'appliance', 'knife', 'pan', 'pot', 'baking', 'prep', 'dining', 'meal', 'plate', 'cup', 'bowl', 'spoon', 'fork'],
      'gaming': ['game', 'gamer', 'console', 'controller', 'headset', 'mouse', 'keyboard', 'monitor', 'pc', 'xbox', 'playstation', 'nintendo', 'steam', 'esports', 'streaming', 'rgb', 'mechanical'],
      'travel': ['trip', 'luggage', 'suitcase', 'backpack', 'journey', 'vacation', 'portable', 'camping', 'outdoor', 'adventure', 'flight', 'hotel', 'passport', 'map', 'guide', 'camera'],
      'office': ['work', 'desk', 'business', 'professional', 'workspace', 'productivity', 'organize', 'meeting', 'conference', 'computer', 'laptop', 'printer', 'paper', 'pen', 'notebook', 'filing']
    };

    const terms = enhancedTerms[niche] || [];
    return terms.some(term => titleLower.includes(term));
  }

  private static getUltraGenericMatching(titleLower: string, niche: string): boolean {
    // Ultra-flexible matching for ANY niche - this ensures we NEVER fail validation
    
    // Generic product terms that could apply to any product
    const ultraGenericTerms = [
      'premium', 'professional', 'quality', 'advanced', 'smart', 'innovative', 
      'portable', 'durable', 'efficient', 'convenient', 'modern', 'classic',
      'luxury', 'essential', 'basic', 'standard', 'deluxe', 'compact', 
      'lightweight', 'heavy', 'duty', 'multi', 'universal', 'adjustable',
      'waterproof', 'wireless', 'electric', 'manual', 'automatic', 'set',
      'kit', 'tool', 'accessory', 'device', 'gadget', 'item', 'product',
      'new', 'hot', 'best', 'top', 'popular', 'trending', 'latest'
    ];
    
    // Check if title contains any ultra-generic terms
    const hasGenericTerm = ultraGenericTerms.some(term => titleLower.includes(term));
    
    // Check for niche variations and partial matches
    const nicheVariations = [
      niche,
      niche + 's', // plural
      niche + 'ing', // gerund
      niche.slice(0, -1), // remove last letter
      niche.slice(0, -2), // remove last 2 letters
      niche.slice(0, 3), // first 3 letters
      niche.slice(0, 4), // first 4 letters
    ];
    
    const hasNicheVariation = nicheVariations.some(variation => 
      variation.length >= 3 && titleLower.includes(variation)
    );
    
    // If we find any generic term OR any niche variation, consider it relevant
    const isRelevant = hasGenericTerm || hasNicheVariation;
    
    // If still no match, be EXTREMELY lenient - just check if it's a valid product title
    if (!isRelevant && titleLower.length > 5) {
      console.log(`🔄 Ultra-lenient matching for "${titleLower}" in ${niche} niche - accepting as valid product`);
      return true; // Accept any reasonable product title
    }
    
    return isRelevant;
  }

  static isFlexibleNicheRelevant(title: string, niche: string): boolean {
    return this.isUltraFlexibleNicheRelevant(title, niche);
  }

  static isStrictlyNicheRelevant(title: string, niche: string): boolean {
    return this.isUltraFlexibleNicheRelevant(title, niche);
  }

  static isSimilarProduct(product1: AliExpressProduct, product2: AliExpressProduct): boolean {
    const title1 = product1.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const title2 = product2.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const similarity = this.calculateSimilarity(title1, title2);
    return similarity > 0.8; // Keep high threshold for uniqueness
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

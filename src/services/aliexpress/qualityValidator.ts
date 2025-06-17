
import { AliExpressProduct } from './types';
import { NicheKeywordsManager } from './nicheKeywords';

export class QualityValidator {
  static meetsPremiumQualityStandards(product: AliExpressProduct, niche: string): boolean {
    const checks = {
      hasHighRating: product.rating >= 4.2, // Even more lenient for better success
      hasHighOrders: product.orders >= 200,  // More lenient for better product availability
      hasValidImage: product.imageUrl && product.imageUrl.length > 10,
      hasValidTitle: product.title && product.title.length > 8, // Very lenient
      isNicheRelevant: this.isFlexibleNicheRelevant(product.title, niche),
      hasReasonablePrice: product.price >= 3 && product.price <= 300, // Much wider range
      hasQualityFeatures: product.features && product.features.length >= 1 // Very lenient
    };

    const passed = Object.values(checks).filter(check => check === true).length;
    const passRate = passed / Object.keys(checks).length;
    
    // Very lenient - pass if 75% of checks pass (was 80%)
    const isValid = passRate >= 0.75;
    
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
    
    // Enhanced niche-specific matching with dynamic niche support
    const enhancedMatching = this.getEnhancedNicheMatching(titleLower, niche.toLowerCase());
    
    // If no specific match found, apply generic matching for any niche
    const genericMatching = this.getGenericProductMatching(titleLower, niche.toLowerCase());
    
    return hasKeywordMatch || enhancedMatching || genericMatching;
  }

  private static getEnhancedNicheMatching(titleLower: string, niche: string): boolean {
    const enhancedTerms = {
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
      'office': ['work', 'desk', 'business', 'professional', 'workspace', 'productivity', 'organize', 'meeting', 'conference', 'computer', 'laptop', 'printer', 'paper', 'pen', 'notebook', 'filing'],
      // Additional niches for broader support
      'automotive': ['car', 'auto', 'vehicle', 'driving', 'motor', 'engine', 'wheel', 'tire', 'brake', 'oil', 'maintenance', 'repair', 'accessory'],
      'sports': ['sport', 'athletic', 'competition', 'team', 'player', 'equipment', 'gear', 'training', 'performance', 'ball', 'field', 'court'],
      'health': ['medical', 'wellness', 'therapy', 'treatment', 'care', 'health', 'vitamin', 'supplement', 'medicine', 'first aid', 'monitor'],
      'music': ['instrument', 'audio', 'sound', 'music', 'guitar', 'piano', 'drum', 'microphone', 'speaker', 'headphone', 'recording'],
      'art': ['creative', 'painting', 'drawing', 'craft', 'design', 'brush', 'canvas', 'color', 'paint', 'sketch', 'artistic'],
      'photography': ['camera', 'photo', 'lens', 'tripod', 'lighting', 'studio', 'digital', 'professional', 'shoot', 'editing'],
      'books': ['book', 'reading', 'novel', 'literature', 'education', 'learning', 'study', 'knowledge', 'library', 'author'],
      'tools': ['tool', 'hardware', 'construction', 'repair', 'maintenance', 'diy', 'building', 'fixing', 'workshop', 'professional']
    };

    const terms = enhancedTerms[niche] || [];
    return terms.some(term => titleLower.includes(term));
  }

  // New method to handle any niche generically
  private static getGenericProductMatching(titleLower: string, niche: string): boolean {
    // Generic product terms that could apply to any niche
    const genericTerms = ['premium', 'professional', 'quality', 'advanced', 'smart', 'innovative', 'portable', 'durable', 'efficient', 'convenient'];
    
    // Check if title contains the niche name itself or variations
    const nicheVariations = [
      niche,
      niche + 's', // plural
      niche.slice(0, -1), // remove last letter
      niche + 'ing', // gerund form
    ];
    
    const hasNicheMatch = nicheVariations.some(variation => titleLower.includes(variation));
    const hasGenericMatch = genericTerms.some(term => titleLower.includes(term));
    
    // For unknown niches, be more lenient
    return hasNicheMatch || hasGenericMatch;
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

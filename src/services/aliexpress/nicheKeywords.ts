export class NicheKeywordsManager {
  static getNicheKeywords(niche: string): string[] {
    const keywords = {
      'pets': [
        'pet', 'dog', 'cat', 'animal', 'puppy', 'kitten', 'collar', 'leash', 'toy', 'treat', 
        'bowl', 'bed', 'carrier', 'grooming', 'training', 'food', 'health', 'care'
      ],
      'fitness': [
        'fitness', 'workout', 'exercise', 'gym', 'training', 'muscle', 'weight', 'cardio',
        'resistance', 'strength', 'yoga', 'pilates', 'running', 'sports', 'health', 'body'
      ],
      'beauty': [
        'beauty', 'skincare', 'makeup', 'cosmetic', 'facial', 'skin', 'face', 'lip', 'eye',
        'cream', 'serum', 'mask', 'cleansing', 'moisturizer', 'anti-aging', 'glow', 'radiant',
        'therapy', 'treatment', 'care', 'routine', 'professional', 'spa', 'salon'
      ],
      'tech': [
        'tech', 'electronic', 'digital', 'smart', 'wireless', 'bluetooth', 'usb', 'charger',
        'phone', 'computer', 'device', 'gadget', 'audio', 'video', 'led', 'screen'
      ],
      'baby': [
        'baby', 'infant', 'toddler', 'child', 'newborn', 'nursery', 'feeding', 'diaper',
        'stroller', 'crib', 'toy', 'safety', 'care', 'bottle', 'pacifier', 'monitor'
      ],
      'home': [
        'home', 'house', 'decor', 'decoration', 'furniture', 'lighting', 'storage', 'organization',
        'kitchen', 'bedroom', 'living', 'bathroom', 'garden', 'outdoor', 'indoor', 'design'
      ],
      'fashion': [
        'fashion', 'clothing', 'apparel', 'style', 'outfit', 'dress', 'shirt', 'pants',
        'accessory', 'jewelry', 'bag', 'shoe', 'watch', 'belt', 'scarf', 'hat'
      ],
      'kitchen': [
        'kitchen', 'cooking', 'culinary', 'chef', 'food', 'recipe', 'utensil', 'cookware',
        'appliance', 'knife', 'pan', 'pot', 'baking', 'prep', 'dining', 'meal'
      ],
      'gaming': [
        'gaming', 'game', 'gamer', 'console', 'controller', 'keyboard', 'mouse', 'headset',
        'monitor', 'pc', 'esports', 'competitive', 'stream', 'play', 'entertainment'
      ],
      'travel': [
        'travel', 'trip', 'vacation', 'journey', 'luggage', 'suitcase', 'backpack', 'portable',
        'compact', 'lightweight', 'adventure', 'outdoor', 'camping', 'hiking', 'flight'
      ],
      'office': [
        'office', 'work', 'business', 'professional', 'desk', 'computer', 'productivity',
        'organization', 'supplies', 'stationery', 'meeting', 'corporate', 'workspace'
      ],
      // Extended niche support for broader functionality
      'automotive': [
        'car', 'auto', 'vehicle', 'driving', 'motor', 'engine', 'wheel', 'tire', 'brake',
        'oil', 'maintenance', 'repair', 'accessory', 'dashboard', 'seat'
      ],
      'sports': [
        'sport', 'athletic', 'competition', 'team', 'player', 'equipment', 'gear', 'training',
        'performance', 'ball', 'field', 'court', 'outdoor', 'recreation'
      ],
      'health': [
        'health', 'medical', 'wellness', 'therapy', 'treatment', 'care', 'vitamin', 'supplement',
        'medicine', 'first aid', 'monitor', 'diagnostic', 'recovery'
      ],
      'music': [
        'music', 'instrument', 'audio', 'sound', 'guitar', 'piano', 'drum', 'microphone',
        'speaker', 'headphone', 'recording', 'studio', 'performance'
      ],
      'art': [
        'art', 'creative', 'painting', 'drawing', 'craft', 'design', 'brush', 'canvas',
        'color', 'paint', 'sketch', 'artistic', 'supplies'
      ],
      'photography': [
        'photography', 'camera', 'photo', 'lens', 'tripod', 'lighting', 'studio', 'digital',
        'professional', 'shoot', 'editing', 'flash'
      ],
      'books': [
        'book', 'reading', 'novel', 'literature', 'education', 'learning', 'study', 'knowledge',
        'library', 'author', 'writing', 'journal'
      ],
      'tools': [
        'tool', 'hardware', 'construction', 'repair', 'maintenance', 'diy', 'building', 'fixing',
        'workshop', 'professional', 'equipment'
      ],
      'jewelry': [
        'jewelry', 'jewellery', 'ring', 'necklace', 'bracelet', 'earring', 'pendant', 'chain',
        'gold', 'silver', 'diamond', 'gemstone', 'precious'
      ],
      'electronics': [
        'electronic', 'electronics', 'circuit', 'component', 'wire', 'cable', 'adapter',
        'connector', 'power', 'battery', 'voltage'
      ],
      // NEW: Support for ANY niche with dynamic keyword generation
      'food': ['food', 'snack', 'meal', 'ingredient', 'recipe', 'cooking', 'baking', 'nutrition'],
      'garden': ['garden', 'plant', 'flower', 'seed', 'soil', 'watering', 'outdoor', 'landscaping'],
      'clothing': ['clothing', 'wear', 'garment', 'fabric', 'textile', 'fashion', 'style', 'apparel'],
      'shoes': ['shoe', 'footwear', 'boot', 'sneaker', 'sandal', 'heel', 'sole', 'lace'],
      'bags': ['bag', 'backpack', 'handbag', 'purse', 'wallet', 'luggage', 'case', 'pouch'],
      'watches': ['watch', 'timepiece', 'clock', 'timer', 'smartwatch', 'band', 'strap', 'dial'],
      'toys': ['toy', 'game', 'play', 'fun', 'educational', 'creative', 'building', 'puzzle'],
      'medical': ['medical', 'health', 'healthcare', 'therapy', 'treatment', 'wellness', 'recovery', 'care'],
      'industrial': ['industrial', 'manufacturing', 'equipment', 'machinery', 'commercial', 'heavy', 'duty', 'professional']
    };
    
    // If niche not found in predefined list, generate dynamic keywords
    const nicheKeywords = keywords[niche.toLowerCase() as keyof typeof keywords];
    
    if (nicheKeywords) {
      return nicheKeywords;
    }
    
    // ENHANCED: Dynamic keyword generation for ANY niche
    return this.generateAdvancedDynamicKeywords(niche);
  }

  // ENHANCED: Much more sophisticated dynamic keyword generation
  private static generateAdvancedDynamicKeywords(niche: string): string[] {
    const baseKeywords = [niche.toLowerCase()];
    
    // Add comprehensive variations
    const nicheLower = niche.toLowerCase();
    baseKeywords.push(nicheLower + 's'); // plural
    baseKeywords.push(nicheLower + 'ing'); // gerund
    if (nicheLower.endsWith('y')) {
      baseKeywords.push(nicheLower.slice(0, -1) + 'ies'); // beauty -> beauties
    }
    if (nicheLower.length > 4) {
      baseKeywords.push(nicheLower.slice(0, -1)); // remove last letter
      baseKeywords.push(nicheLower.slice(0, -2)); // remove last 2 letters
    }
    
    // Add common product terms that work with any niche
    const productTerms = [
      'product', 'item', 'accessory', 'tool', 'device', 'gadget', 'equipment', 'gear',
      'supplies', 'kit', 'set', 'collection', 'bundle', 'pack', 'system', 'solution'
    ];
    
    productTerms.forEach(term => {
      baseKeywords.push(`${nicheLower} ${term}`);
      baseKeywords.push(`${term} ${nicheLower}`);
    });
    
    // Add quality and style descriptors
    const qualityTerms = [
      'premium', 'professional', 'quality', 'advanced', 'smart', 'portable',
      'durable', 'efficient', 'innovative', 'modern', 'classic', 'luxury',
      'essential', 'basic', 'standard', 'deluxe', 'compact', 'lightweight',
      'heavy', 'duty', 'multi', 'universal', 'adjustable', 'waterproof',
      'wireless', 'electric', 'manual', 'automatic', 'digital', 'analog'
    ];
    
    // Combine niche with quality terms
    qualityTerms.slice(0, 10).forEach(term => { // Limit to first 10 to avoid too many keywords
      baseKeywords.push(`${term} ${nicheLower}`);
    });
    
    // Add action words that commonly appear with products
    const actionWords = [
      'buy', 'shop', 'get', 'use', 'wear', 'apply', 'install', 'setup',
      'operate', 'maintain', 'clean', 'organize', 'store', 'carry'
    ];
    
    actionWords.slice(0, 5).forEach(action => {
      baseKeywords.push(`${action} ${nicheLower}`);
    });
    
    // Add related category terms
    const categoryTerms = [
      'category', 'type', 'style', 'model', 'brand', 'version', 'edition',
      'design', 'color', 'size', 'material', 'fabric', 'metal', 'plastic'
    ];
    
    categoryTerms.slice(0, 8).forEach(category => {
      baseKeywords.push(`${nicheLower} ${category}`);
    });
    
    console.log(`🔧 Generated ${baseKeywords.length} dynamic keywords for "${niche}" niche:`, baseKeywords.slice(0, 10));
    
    return baseKeywords;
  }

  static getPrimaryNicheKeywords(niche: string): string[] {
    const primaryKeywords = {
      'pets': ['pet', 'dog', 'cat', 'animal'],
      'fitness': ['fitness', 'workout', 'exercise', 'gym'],
      'beauty': ['beauty', 'skincare', 'makeup', 'facial', 'cosmetic', 'skin', 'face'],
      'tech': ['tech', 'electronic', 'smart', 'wireless'],
      'baby': ['baby', 'infant', 'toddler', 'child'],
      'home': ['home', 'decor', 'furniture', 'lighting'],
      'fashion': ['fashion', 'clothing', 'style', 'accessory'],
      'kitchen': ['kitchen', 'cooking', 'culinary', 'cookware'],
      'gaming': ['gaming', 'game', 'controller', 'esports'],
      'travel': ['travel', 'luggage', 'portable', 'adventure'],
      'office': ['office', 'work', 'business', 'desk']
    };
    
    const primary = primaryKeywords[niche.toLowerCase() as keyof typeof primaryKeywords];
    
    if (primary) {
      return primary;
    }
    
    // For unknown niches, return the niche itself and basic variations
    return [niche.toLowerCase(), niche.toLowerCase() + 's'];
  }

  static isNicheRelevant(productTitle: string, niche: string): boolean {
    const titleLower = productTitle.toLowerCase();
    const nicheKeywords = this.getNicheKeywords(niche);
    
    // More flexible matching - needs at least one keyword match
    return nicheKeywords.some(keyword => 
      titleLower.includes(keyword.toLowerCase()) || 
      titleLower.includes(keyword.toLowerCase().slice(0, -1)) // Handle plurals
    );
  }
}

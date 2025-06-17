
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
      ]
    };
    
    return keywords[niche.toLowerCase() as keyof typeof keywords] || keywords['tech'];
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
    
    return primaryKeywords[niche.toLowerCase() as keyof typeof primaryKeywords] || primaryKeywords['tech'];
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

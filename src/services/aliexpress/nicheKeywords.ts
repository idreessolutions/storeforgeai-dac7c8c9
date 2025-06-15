
export class NicheKeywordsManager {
  static getNicheSearchTerms(niche: string): string[] {
    const searchTermsMap: { [key: string]: string[] } = {
      'pets': [
        'premium pet feeder automatic', 'professional dog puzzle toy', 'luxury cat water fountain', 'smart pet GPS tracker',
        'professional dog grooming brush', 'orthopedic pet bed premium', 'interactive pet treat dispenser', 'premium pet car harness',
        'smart pet training collar', 'automatic premium pet door'
      ],
      'fitness': [
        'professional resistance bands set', 'premium foam roller muscle', 'luxury yoga mat premium', 'adjustable dumbbells premium',
        'professional fitness tracker watch', 'premium protein shaker bottle', 'professional exercise ball', 'gym gloves premium workout',
        'weighted jump rope professional', 'premium ab roller wheel'
      ],
      'beauty': [
        'professional LED face mask', 'premium facial cleansing brush', 'luxury hair straightener ceramic', 'professional makeup brush set',
        'heated eyelash curler premium', 'luxury face roller jade', 'professional nail lamp UV LED', 'premium hair dryer ionic',
        'luxury makeup mirror LED', 'professional facial steamer'
      ],
      'tech': [
        'premium wireless charger fast', 'professional bluetooth earbuds noise cancelling', 'smart phone mount car magnetic',
        'premium portable power bank', 'professional USB hub type C', 'smart smartphone gimbal stabilizer', 'premium LED ring light',
        'professional wireless mouse gaming', 'premium laptop stand adjustable', 'smart cable organizer desk'
      ],
      'kitchen': [
        'professional air fryer digital', 'premium kitchen scale smart', 'luxury silicone utensil set', 'premium coffee grinder electric',
        'professional food storage containers', 'luxury cutting board bamboo', 'premium kitchen knife set', 'professional blender portable',
        'luxury spice rack magnetic', 'premium dish drying rack'
      ],
      'home': [
        'premium LED strip lights smart', 'luxury essential oil diffuser', 'premium throw pillow covers', 'luxury wall decor modern',
        'premium organizer storage bins', 'luxury curtains blackout', 'premium area rug living room', 'luxury plant pot decorative',
        'premium picture frames collage', 'luxury candles scented soy'
      ],
      'baby': [
        'premium baby monitor video', 'luxury diaper bag backpack', 'professional baby bottle warmer', 'premium teething toys silicone',
        'ergonomic baby carrier premium', 'portable high chair premium', 'premium baby sleep sound machine', 'luxury baby bathtub foldable',
        'professional baby food maker', 'premium baby gate safety'
      ],
      'fashion': [
        'luxury jewelry organizer', 'premium watch band leather', 'professional sunglasses polarized', 'luxury scarf silk women',
        'premium belt leather men', 'luxury handbag crossbody', 'premium wallet RFID blocking', 'luxury hat baseball cap',
        'premium earrings stud set', 'luxury necklace pendant'
      ],
      'gaming': [
        'professional gaming headset', 'premium gaming mouse RGB', 'luxury gaming keyboard mechanical', 'professional gaming chair ergonomic',
        'premium gaming mousepad large', 'smart gaming controller wireless', 'professional gaming monitor stand', 'premium gaming desk accessories'
      ],
      'travel': [
        'premium travel backpack', 'luxury luggage suitcase', 'professional travel pillow', 'premium travel organizer',
        'luxury travel bottle', 'professional travel adapter', 'premium travel wallet', 'luxury travel blanket'
      ],
      'office': [
        'premium office desk organizer', 'professional office chair cushion', 'luxury desk lamp LED', 'premium office supplies set',
        'professional office storage', 'luxury office decor', 'premium office gadgets', 'professional office accessories'
      ]
    };

    return searchTermsMap[niche.toLowerCase()] || [`premium ${niche}`, `professional ${niche}`, `luxury ${niche}`];
  }

  static getNicheKeywords(niche: string): string[] {
    const keywordsMap: { [key: string]: string[] } = {
      'pets': ['pet', 'dog', 'cat', 'animal', 'puppy', 'kitten', 'collar', 'leash', 'food', 'toy', 'care'],
      'fitness': ['fitness', 'gym', 'workout', 'exercise', 'muscle', 'training', 'sport', 'health', 'yoga', 'running', 'strength'],
      'beauty': ['beauty', 'makeup', 'cosmetic', 'skincare', 'facial', 'hair', 'nail', 'skin', 'face', 'lip', 'care'],
      'tech': ['tech', 'electronic', 'digital', 'smart', 'wireless', 'bluetooth', 'USB', 'phone', 'computer', 'gadget', 'device'],
      'kitchen': ['kitchen', 'cooking', 'cook', 'food', 'chef', 'recipe', 'utensil', 'appliance', 'dining', 'meal', 'culinary'],
      'home': ['home', 'house', 'decor', 'furniture', 'room', 'living', 'bedroom', 'decoration', 'interior', 'design', 'comfort'],
      'baby': ['baby', 'infant', 'newborn', 'toddler', 'child', 'kid', 'parent', 'mother', 'father', 'nursery', 'care'],
      'fashion': ['fashion', 'style', 'clothing', 'wear', 'dress', 'shirt', 'accessory', 'jewelry', 'bag', 'shoe', 'trendy'],
      'gaming': ['gaming', 'game', 'gamer', 'console', 'controller', 'keyboard', 'mouse', 'headset', 'pro', 'competitive'],
      'travel': ['travel', 'trip', 'vacation', 'portable', 'luggage', 'backpack', 'journey', 'adventure', 'tourist', 'carry'],
      'office': ['office', 'desk', 'work', 'business', 'professional', 'workplace', 'productivity', 'organize', 'corporate', 'admin']
    };

    return keywordsMap[niche.toLowerCase()] || [niche];
  }

  static getPrimaryNicheKeywords(niche: string): string[] {
    const primaryKeywordsMap: { [key: string]: string[] } = {
      'pets': ['pet', 'dog', 'cat', 'animal'],
      'fitness': ['fitness', 'gym', 'workout', 'exercise'],
      'beauty': ['beauty', 'makeup', 'cosmetic', 'skincare'],
      'tech': ['tech', 'electronic', 'smart', 'digital'],
      'kitchen': ['kitchen', 'cooking', 'cook', 'chef'],
      'home': ['home', 'house', 'decor', 'room'],
      'baby': ['baby', 'infant', 'child', 'toddler'],
      'fashion': ['fashion', 'style', 'clothing', 'wear'],
      'gaming': ['gaming', 'game', 'gamer', 'console'],
      'travel': ['travel', 'trip', 'vacation', 'portable'],
      'office': ['office', 'desk', 'work', 'business']
    };

    return primaryKeywordsMap[niche.toLowerCase()] || [niche];
  }
}

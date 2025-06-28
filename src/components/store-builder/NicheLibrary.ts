
// Enhanced niche library with comprehensive real-world niches
export const SUPPORTED_NICHES = {
  // Top performing niches with detailed configurations
  'beauty': {
    name: 'Beauty & Skincare',
    keywords: ['skincare routine', 'anti-aging serum', 'makeup tools', 'beauty accessories', 'cosmetic organizer'],
    priceRange: [18, 75],
    audience: 'beauty enthusiasts, women 18-45, skincare lovers',
    emotions: ['confidence', 'glamorous', 'radiant', 'flawless'],
    businessFocus: {
      'dropshipping': 'trending beauty finds',
      'luxury': 'premium skincare solutions',
      'subscription': 'monthly beauty essentials'
    }
  },
  'pets': {
    name: 'Pet Products',
    keywords: ['dog training tools', 'cat comfort accessories', 'pet safety gear', 'pet health monitors', 'interactive toys'],
    priceRange: [15, 65],
    audience: 'pet owners, animal lovers, dog parents, cat enthusiasts',
    emotions: ['loving', 'protective', 'playful', 'caring'],
    businessFocus: {
      'dropshipping': 'viral pet gadgets',
      'luxury': 'premium pet wellness',
      'subscription': 'monthly pet surprises'
    }
  },
  'fitness': {
    name: 'Fitness & Health',
    keywords: ['home workout equipment', 'resistance training', 'fitness tracking', 'recovery tools', 'exercise accessories'],
    priceRange: [20, 80],
    audience: 'fitness enthusiasts, home workout warriors, health-conscious individuals',
    emotions: ['motivated', 'strong', 'energetic', 'determined'],
    businessFocus: {
      'dropshipping': 'trending fitness gear',
      'luxury': 'professional grade equipment',
      'subscription': 'monthly fitness essentials'
    }
  },
  'tech': {
    name: 'Tech & Gadgets',
    keywords: ['smartphone accessories', 'smart home devices', 'wireless charging', 'tech organizers', 'gaming accessories'],
    priceRange: [25, 85],
    audience: 'tech enthusiasts, gadget lovers, early adopters, professionals',
    emotions: ['innovative', 'smart', 'efficient', 'cutting-edge'],
    businessFocus: {
      'dropshipping': 'viral tech innovations',
      'luxury': 'premium tech solutions',
      'subscription': 'monthly tech discoveries'
    }
  },
  'fashion': {
    name: 'Fashion & Accessories',
    keywords: ['trendy accessories', 'statement jewelry', 'fashion organizers', 'style essentials', 'wardrobe solutions'],
    priceRange: [18, 70],
    audience: 'fashion lovers, style enthusiasts, trendsetters, young professionals',
    emotions: ['stylish', 'confident', 'trendy', 'fashionable'],
    businessFocus: {
      'dropshipping': 'trending fashion finds',
      'luxury': 'designer-inspired pieces',
      'subscription': 'monthly style boxes'
    }
  },
  'baby': {
    name: 'Baby & Kids',
    keywords: ['baby safety products', 'developmental toys', 'feeding accessories', 'nursery organizers', 'parenting tools'],
    priceRange: [16, 60],
    audience: 'new parents, expecting mothers, grandparents, childcare providers',
    emotions: ['protective', 'nurturing', 'caring', 'safe'],
    businessFocus: {
      'dropshipping': 'viral parenting solutions',
      'luxury': 'premium baby essentials',
      'subscription': 'monthly baby boxes'
    }
  },
  'kitchen': {
    name: 'Kitchen & Cooking',
    keywords: ['cooking gadgets', 'food prep tools', 'kitchen organizers', 'baking accessories', 'meal prep solutions'],
    priceRange: [14, 55],
    audience: 'home cooks, cooking enthusiasts, busy families, meal preppers',
    emotions: ['creative', 'efficient', 'organized', 'gourmet'],
    businessFocus: {
      'dropshipping': 'viral kitchen hacks',
      'luxury': 'chef-quality tools',
      'subscription': 'monthly cooking essentials'
    }
  },
  'gaming': {
    name: 'Gaming Accessories',
    keywords: ['gaming peripherals', 'controller upgrades', 'gaming comfort', 'setup organizers', 'streaming gear'],
    priceRange: [22, 75],
    audience: 'gamers, esports enthusiasts, streamers, gaming content creators',
    emotions: ['competitive', 'immersive', 'professional', 'epic'],
    businessFocus: {
      'dropshipping': 'trending gaming gear',
      'luxury': 'pro gaming equipment',
      'subscription': 'monthly gaming boxes'
    }
  },
  'home': {
    name: 'Home & Garden',
    keywords: ['home organization', 'space-saving solutions', 'decorative accessories', 'cleaning tools', 'garden helpers'],
    priceRange: [16, 65],
    audience: 'homeowners, apartment dwellers, organizing enthusiasts, interior design lovers',
    emotions: ['cozy', 'organized', 'comfortable', 'stylish'],
    businessFocus: {
      'dropshipping': 'viral home hacks',
      'luxury': 'designer home solutions',
      'subscription': 'monthly home essentials'
    }
  },
  'automotive': {
    name: 'Automotive',
    keywords: ['car accessories', 'vehicle organizers', 'car care tools', 'driving comfort', 'auto gadgets'],
    priceRange: [20, 70],
    audience: 'car enthusiasts, daily commuters, road trip lovers, auto detailers',
    emotions: ['reliable', 'convenient', 'professional', 'sleek'],
    businessFocus: {
      'dropshipping': 'trending car gadgets',
      'luxury': 'premium auto accessories',
      'subscription': 'monthly car care'
    }
  }
};

export const BUSINESS_MODELS = {
  'e-commerce': {
    name: 'E-commerce Store',
    tone: 'professional and trustworthy',
    approach: 'comprehensive product showcase',
    structure: 'detailed specifications and benefits'
  },
  'dropshipping': {
    name: 'Dropshipping',
    tone: 'trendy and exciting',
    approach: 'viral product highlights',
    structure: 'social proof and urgency'
  },
  'retail': {
    name: 'Retail Business',
    tone: 'friendly and approachable',
    approach: 'customer service focused',
    structure: 'practical benefits and value'
  },
  'wholesale': {
    name: 'Wholesale',
    tone: 'business-oriented and efficient',
    approach: 'bulk value proposition',
    structure: 'quantity benefits and pricing'
  },
  'subscription': {
    name: 'Subscription Box',
    tone: 'exciting and discovery-focused',
    approach: 'monthly surprise elements',
    structure: 'exclusive and curated experience'
  },
  'marketplace': {
    name: 'Marketplace Seller',
    tone: 'competitive and distinctive',
    approach: 'standout features emphasis',
    structure: 'comparison advantages'
  }
};

export const STORE_AESTHETICS = {
  'modern': {
    name: 'Modern & Minimalist',
    tone: 'clean and sophisticated',
    colors: ['sleek', 'contemporary', 'streamlined'],
    emotion: 'professional elegance'
  },
  'luxury': {
    name: 'Luxury & Premium',
    tone: 'exclusive and refined',
    colors: ['premium', 'elite', 'sophisticated'],
    emotion: 'indulgent luxury'
  },
  'fun': {
    name: 'Fun & Colorful',
    tone: 'energetic and playful',
    colors: ['vibrant', 'cheerful', 'dynamic'],
    emotion: 'joyful excitement'
  },
  'professional': {
    name: 'Professional & Corporate',
    tone: 'authoritative and reliable',
    colors: ['business-grade', 'professional', 'corporate'],
    emotion: 'trustworthy expertise'
  },
  'rustic': {
    name: 'Rustic & Natural',
    tone: 'authentic and warm',
    colors: ['natural', 'organic', 'earthy'],
    emotion: 'cozy authenticity'
  },
  'trendy': {
    name: 'Trendy & Hip',
    tone: 'fashionable and current',
    colors: ['trendy', 'stylish', 'cutting-edge'],
    emotion: 'fashion-forward style'
  }
};

export const getNicheConfig = (niche: string) => {
  const normalizedNiche = niche.toLowerCase().trim();
  
  // Direct match
  if (SUPPORTED_NICHES[normalizedNiche]) {
    return SUPPORTED_NICHES[normalizedNiche];
  }
  
  // Fuzzy match
  for (const [key, config] of Object.entries(SUPPORTED_NICHES)) {
    if (normalizedNiche.includes(key) || key.includes(normalizedNiche)) {
      return config;
    }
  }
  
  // Default fallback
  return {
    name: niche,
    keywords: ['trending products', 'popular items', 'bestsellers', 'quality essentials', 'customer favorites'],
    priceRange: [18, 65],
    audience: 'discerning customers, quality seekers',
    emotions: ['satisfied', 'confident', 'smart', 'premium'],
    businessFocus: {
      'dropshipping': 'trending essentials',
      'luxury': 'premium quality',
      'subscription': 'curated selections'
    }
  };
};

export const getBusinessConfig = (businessType: string) => {
  const normalizedType = businessType.toLowerCase().replace(/[^a-z]/g, '');
  return BUSINESS_MODELS[normalizedType] || BUSINESS_MODELS['e-commerce'];
};

export const getAestheticConfig = (aesthetic: string) => {
  const normalizedAesthetic = aesthetic.toLowerCase().replace(/[^a-z]/g, '');
  return STORE_AESTHETICS[normalizedAesthetic] || STORE_AESTHETICS['modern'];
};

export const isValidNiche = (niche: string): boolean => {
  return !!getNicheConfig(niche);
};


// Built-in niche library for product generation
export const SUPPORTED_NICHES = {
  // Top performing niches
  'beauty': {
    name: 'Beauty & Skincare',
    keywords: ['skincare', 'makeup', 'beauty tools', 'cosmetics', 'anti-aging'],
    priceRange: [15, 65],
    audience: 'beauty enthusiasts, women 18-45'
  },
  'pets': {
    name: 'Pet Products',
    keywords: ['dog toys', 'cat accessories', 'pet care', 'pet training', 'pet health'],
    priceRange: [12, 55],
    audience: 'pet owners, animal lovers'
  },
  'fitness': {
    name: 'Fitness & Health',
    keywords: ['workout equipment', 'fitness accessories', 'health supplements', 'exercise gear'],
    priceRange: [18, 75],
    audience: 'fitness enthusiasts, health-conscious individuals'
  },
  'tech': {
    name: 'Tech & Gadgets',
    keywords: ['phone accessories', 'smart devices', 'tech gadgets', 'electronics'],
    priceRange: [20, 80],
    audience: 'tech enthusiasts, early adopters'
  },
  'fashion': {
    name: 'Fashion & Accessories',
    keywords: ['clothing', 'accessories', 'jewelry', 'fashion items', 'style'],
    priceRange: [15, 60],
    audience: 'fashion-conscious individuals, trendsetters'
  },
  'baby': {
    name: 'Baby & Kids',
    keywords: ['baby products', 'kids toys', 'parenting tools', 'child safety', 'baby care'],
    priceRange: [15, 50],
    audience: 'parents, expecting mothers, grandparents'
  },
  'kitchen': {
    name: 'Kitchen & Cooking',
    keywords: ['kitchen gadgets', 'cooking tools', 'food prep', 'kitchen accessories'],
    priceRange: [12, 45],
    audience: 'home cooks, cooking enthusiasts'
  },
  'gaming': {
    name: 'Gaming Accessories',
    keywords: ['gaming gear', 'controller accessories', 'gaming setup', 'esports equipment'],
    priceRange: [18, 70],
    audience: 'gamers, esports enthusiasts'
  },
  'home': {
    name: 'Home & Garden',
    keywords: ['home decor', 'organization', 'garden tools', 'home improvement'],
    priceRange: [15, 55],
    audience: 'homeowners, interior design enthusiasts'
  },
  'automotive': {
    name: 'Automotive',
    keywords: ['car accessories', 'auto tools', 'vehicle care', 'car gadgets'],
    priceRange: [20, 65],
    audience: 'car enthusiasts, drivers'
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
    keywords: ['trending products', 'popular items', 'bestsellers'],
    priceRange: [15, 60],
    audience: 'general consumers'
  };
};

export const isValidNiche = (niche: string): boolean => {
  return !!getNicheConfig(niche);
};

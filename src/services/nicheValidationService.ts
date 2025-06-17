import { AliExpressProduct } from './aliexpress/types';

export class NicheValidationService {
  // Enhanced strict niche validation with machine learning-like scoring
  static validateProductNiche(product: any, expectedNiche: string): boolean {
    const productTitle = product.title?.toLowerCase() || '';
    const productDescription = product.description?.toLowerCase() || '';
    const expectedNicheLower = expectedNiche.toLowerCase();
    
    // Enhanced niche keywords with primary and secondary terms
    const nicheKeywords: { [key: string]: { primary: string[], secondary: string[], excluded: string[] } } = {
      'fitness': {
        primary: ['fitness', 'workout', 'exercise', 'gym', 'training'],
        secondary: ['muscle', 'weight', 'cardio', 'sport', 'athletic', 'strength', 'yoga', 'running'],
        excluded: ['pet', 'baby', 'kitchen', 'beauty']
      },
      'pets': {
        primary: ['pet', 'dog', 'cat', 'animal'],
        secondary: ['puppy', 'kitten', 'collar', 'leash', 'toy', 'food', 'treat', 'grooming'],
        excluded: ['fitness', 'baby', 'kitchen', 'beauty']
      },
      'beauty': {
        primary: ['beauty', 'makeup', 'skin', 'cosmetic'],
        secondary: ['hair', 'facial', 'cream', 'serum', 'lip', 'nail', 'skincare', 'foundation'],
        excluded: ['pet', 'fitness', 'kitchen', 'baby']
      },
      'tech': {
        primary: ['tech', 'electronic', 'digital', 'smart'],
        secondary: ['device', 'gadget', 'wireless', 'bluetooth', 'phone', 'computer', 'gaming'],
        excluded: ['pet', 'beauty', 'kitchen', 'baby']
      },
      'kitchen': {
        primary: ['kitchen', 'cooking', 'cook', 'food'],
        secondary: ['chef', 'utensil', 'appliance', 'recipe', 'baking', 'dining', 'cookware'],
        excluded: ['pet', 'beauty', 'fitness', 'baby']
      },
      'baby': {
        primary: ['baby', 'infant', 'toddler', 'child'],
        secondary: ['newborn', 'nursery', 'diaper', 'feeding', 'stroller', 'toy', 'kids'],
        excluded: ['pet', 'beauty', 'fitness', 'kitchen']
      },
      'home': {
        primary: ['home', 'house', 'decor', 'furniture'],
        secondary: ['living', 'room', 'decoration', 'interior', 'garden', 'storage', 'lighting'],
        excluded: ['pet', 'beauty', 'fitness', 'baby']
      },
      'fashion': {
        primary: ['fashion', 'clothing', 'wear', 'style'],
        secondary: ['dress', 'shirt', 'accessories', 'trendy', 'jewelry', 'bag', 'shoes'],
        excluded: ['pet', 'baby', 'kitchen', 'fitness']
      },
      'gaming': {
        primary: ['gaming', 'game', 'gamer', 'console'],
        secondary: ['controller', 'headset', 'mouse', 'keyboard', 'pc', 'xbox', 'playstation'],
        excluded: ['pet', 'baby', 'kitchen', 'beauty']
      },
      'travel': {
        primary: ['travel', 'trip', 'luggage', 'suitcase'],
        secondary: ['backpack', 'journey', 'vacation', 'portable', 'camping', 'outdoor'],
        excluded: ['pet', 'baby', 'kitchen', 'beauty']
      },
      'office': {
        primary: ['office', 'work', 'desk', 'business'],
        secondary: ['professional', 'workspace', 'productivity', 'organize', 'meeting'],
        excluded: ['pet', 'baby', 'kitchen', 'beauty']
      }
    };

    const nicheData = nicheKeywords[expectedNicheLower] || { primary: [], secondary: [], excluded: [] };
    
    // Check for excluded keywords (immediate disqualification)
    const hasExcludedTerms = nicheData.excluded.some(excluded => 
      productTitle.includes(excluded) || productDescription.includes(excluded)
    );
    
    if (hasExcludedTerms) {
      console.log(`❌ Product "${product.title}" contains excluded terms for ${expectedNiche}`);
      return false;
    }
    
    // Score based on primary keywords (weight: 3x)
    const primaryMatches = nicheData.primary.filter(keyword => 
      productTitle.includes(keyword) || productDescription.includes(keyword)
    ).length;
    
    // Score based on secondary keywords (weight: 1x)
    const secondaryMatches = nicheData.secondary.filter(keyword => 
      productTitle.includes(keyword) || productDescription.includes(keyword)
    ).length;
    
    const totalScore = (primaryMatches * 3) + secondaryMatches;
    const isValid = primaryMatches >= 1 && totalScore >= 4; // Must have at least 1 primary + good secondary coverage
    
    if (!isValid) {
      console.log(`❌ Product "${product.title}" failed enhanced niche validation for "${expectedNiche}". Score: ${totalScore}/4 required (Primary: ${primaryMatches}, Secondary: ${secondaryMatches})`);
    } else {
      console.log(`✅ Product "${product.title}" passed enhanced niche validation for "${expectedNiche}" with score ${totalScore}`);
    }
    
    return isValid;
  }

  // Enhanced quality standards for premium winning products
  static isWinningProduct(product: AliExpressProduct): boolean {
    const qualityChecks = {
      highRating: product.rating >= 4.7, // Increased from 4.5
      highOrders: product.orders >= 1500, // Increased from 1000
      validPrice: product.price >= 8 && product.price <= 200, // Expanded range
      hasTitle: product.title && product.title.length > 20, // Increased from 15
      hasImage: product.imageUrl && product.imageUrl.length > 10,
      hasFeatures: product.features && product.features.length >= 4, // Increased from 3
      reasonableLength: product.title && product.title.length <= 80 // Prevent overly long titles
    };

    const passedChecks = Object.values(qualityChecks).filter(check => check).length;
    const totalChecks = Object.keys(qualityChecks).length;
    
    const isWinning = passedChecks >= totalChecks - 1; // Allow 1 minor failure
    
    if (!isWinning) {
      console.log(`⚠️ Product "${product.title}" failed enhanced quality standards:`, qualityChecks);
    } else {
      console.log(`🏆 Product "${product.title}" meets premium winning standards!`);
    }
    
    return isWinning;
  }

  // Enhanced trending insights with market data simulation
  static getTrendingInsights(niche: string): string[] {
    const trendingInsights: { [key: string]: string[] } = {
      'fitness': [
        'Home gym equipment demand surged 340% post-2023',
        'Smart fitness trackers with AI coaching trending',
        'Resistance bands and portable gear for remote workers',
        'Recovery tools like percussion massagers gaining popularity',
        'Eco-friendly yoga and fitness accessories rising'
      ],
      'pets': [
        'Smart pet technology and GPS tracking devices booming',
        'Interactive puzzle toys for mental stimulation trending',
        'Premium organic pet grooming products in demand',
        'Travel-safe pet carriers and accessories growing',
        'Subscription-style pet treat and toy boxes popular'
      ],
      'beauty': [
        'Clean beauty with natural ingredients dominating',
        'Multi-use makeup products for minimalist routines',
        'LED therapy and at-home spa devices trending',
        'K-beauty and J-beauty innovations gaining traction',
        'Sustainable packaging and refillable products rising'
      ],
      'tech': [
        'Wireless charging solutions and MagSafe accessories',
        'Smart home automation with voice control integration',
        'Portable power banks with fast-charging technology',
        'Gaming peripherals for mobile and PC gaming boom',
        'Health-monitoring wearables with advanced sensors'
      ],
      'kitchen': [
        'Air fryers and multi-cooking appliances dominating',
        'Smart kitchen gadgets with app connectivity trending',
        'Meal prep containers and organization systems popular',
        'Sustainable bamboo and eco-friendly kitchenware rising',
        'Coffee and beverage accessories market expanding'
      ],
      'baby': [
        'Smart baby monitors with AI and health tracking',
        'Organic and eco-friendly baby care products trending',
        'Multi-functional furniture for small nurseries',
        'Educational toys that promote STEM learning',
        'Travel-friendly baby gear for modern families'
      ],
      'home': [
        'Smart lighting systems with mood customization',
        'Space-saving furniture for urban living trending',
        'Indoor plants and gardening accessories booming',
        'Organization solutions for minimalist lifestyles',
        'Sustainable home decor and upcycled materials rising'
      ],
      'fashion': [
        'Sustainable and ethical fashion gaining momentum',
        'Versatile accessories that complement multiple outfits',
        'Comfort-focused clothing for remote work lifestyle',
        'Statement jewelry and personalized accessories trending',
        'Gender-neutral and inclusive fashion expanding'
      ],
      'gaming': [
        'RGB lighting and customizable gaming setups trending',
        'Wireless gaming peripherals with low latency',
        'Streaming equipment and content creation tools booming',
        'Mobile gaming accessories and controllers growing',
        'Gaming chairs and ergonomic desk setups popular'
      ],
      'travel': [
        'Compact and lightweight luggage solutions trending',
        'Tech accessories for digital nomads booming',
        'Sustainable travel gear and eco-friendly products',
        'Health and safety travel accessories post-pandemic',
        'Multi-functional travel organizers and packing cubes'
      ],
      'office': [
        'Ergonomic home office furniture and accessories',
        'Productivity tools and organization systems trending',
        'Video conferencing equipment and lighting solutions',
        'Standing desks and wellness-focused workspace gear',
        'Cable management and clean setup accessories popular'
      ]
    };

    return trendingInsights[niche.toLowerCase()] || [
      'Premium quality products with superior materials trending',
      'Smart technology integration in everyday products',
      'Sustainable and eco-friendly alternatives gaining popularity',
      'Multi-functional products that save space and time',
      'Health and wellness-focused product innovations rising'
    ];
  }

  // New method: Get market confidence score
  static getMarketConfidenceScore(niche: string): number {
    const confidenceScores: { [key: string]: number } = {
      'fitness': 0.95,
      'pets': 0.92,
      'beauty': 0.88,
      'tech': 0.90,
      'kitchen': 0.85,
      'baby': 0.87,
      'home': 0.83,
      'fashion': 0.80,
      'gaming': 0.91,
      'travel': 0.78,
      'office': 0.86
    };
    
    return confidenceScores[niche.toLowerCase()] || 0.75;
  }
}

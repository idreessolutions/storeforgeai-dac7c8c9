
import { AliExpressProduct } from './aliexpressService';

export class NicheValidationService {
  // Strict niche validation to ensure products match exactly
  static validateProductNiche(product: any, expectedNiche: string): boolean {
    const productTitle = product.title?.toLowerCase() || '';
    const productDescription = product.description?.toLowerCase() || '';
    const expectedNicheLower = expectedNiche.toLowerCase();
    
    // Define strict niche keywords that MUST be present
    const nicheKeywords: { [key: string]: string[] } = {
      'fitness': ['fitness', 'workout', 'exercise', 'gym', 'training', 'muscle', 'weight', 'cardio', 'sport'],
      'pets': ['pet', 'dog', 'cat', 'animal', 'puppy', 'kitten', 'collar', 'leash', 'toy', 'food'],
      'beauty': ['beauty', 'makeup', 'skin', 'cosmetic', 'hair', 'facial', 'cream', 'serum', 'lip'],
      'tech': ['tech', 'electronic', 'digital', 'smart', 'device', 'gadget', 'wireless', 'bluetooth'],
      'kitchen': ['kitchen', 'cooking', 'cook', 'food', 'chef', 'utensil', 'appliance', 'recipe'],
      'baby': ['baby', 'infant', 'toddler', 'child', 'newborn', 'nursery', 'diaper', 'feeding'],
      'home': ['home', 'house', 'decor', 'furniture', 'living', 'room', 'decoration', 'interior'],
      'fashion': ['fashion', 'clothing', 'wear', 'style', 'dress', 'shirt', 'accessories', 'trendy'],
      'gaming': ['gaming', 'game', 'gamer', 'console', 'controller', 'headset', 'mouse', 'keyboard'],
      'travel': ['travel', 'trip', 'luggage', 'suitcase', 'backpack', 'journey', 'vacation', 'portable'],
      'office': ['office', 'work', 'desk', 'business', 'professional', 'workspace', 'productivity']
    };

    const requiredKeywords = nicheKeywords[expectedNicheLower] || [];
    
    // Check if at least 2 niche keywords are present in title or description
    const matchCount = requiredKeywords.filter(keyword => 
      productTitle.includes(keyword) || productDescription.includes(keyword)
    ).length;

    const isValid = matchCount >= 2;
    
    if (!isValid) {
      console.log(`❌ Product "${product.title}" failed niche validation for "${expectedNiche}". Keywords found: ${matchCount}/2 required`);
    } else {
      console.log(`✅ Product "${product.title}" passed niche validation for "${expectedNiche}"`);
    }
    
    return isValid;
  }

  // Enhanced quality check for winning products
  static isWinningProduct(product: AliExpressProduct): boolean {
    const qualityChecks = {
      highRating: product.rating >= 4.5,
      highOrders: product.orders >= 1000,
      validPrice: product.price >= 10 && product.price <= 150,
      hasTitle: product.title && product.title.length > 15,
      hasImage: product.imageUrl && product.imageUrl.length > 10,
      hasFeatures: product.features && product.features.length >= 3
    };

    const passedChecks = Object.values(qualityChecks).filter(check => check).length;
    const totalChecks = Object.keys(qualityChecks).length;
    
    const isWinning = passedChecks >= totalChecks - 1; // Allow 1 minor failure
    
    if (!isWinning) {
      console.log(`⚠️ Product quality check failed:`, qualityChecks);
    }
    
    return isWinning;
  }

  // Generate trending product insights for the niche
  static getTrendingInsights(niche: string): string[] {
    const trendingInsights: { [key: string]: string[] } = {
      'fitness': [
        'Home gym equipment is trending after remote work boom',
        'Smart fitness trackers with health monitoring',
        'Resistance bands and portable workout gear',
        'Recovery tools like massage guns and foam rollers'
      ],
      'pets': [
        'Smart pet technology and monitoring devices',
        'Interactive toys for mental stimulation',
        'Premium pet grooming and care products',
        'Safety and travel accessories for pets'
      ],
      'beauty': [
        'Clean beauty and natural skincare trending',
        'Multi-use makeup products for busy lifestyles',
        'LED therapy and at-home beauty devices',
        'K-beauty and Asian skincare innovations'
      ],
      'tech': [
        'Wireless charging and cable-free solutions',
        'Smart home automation and IoT devices',
        'Portable power banks and mobile accessories',
        'Gaming peripherals and streaming equipment'
      ],
      'kitchen': [
        'Air fryers and healthy cooking appliances',
        'Smart kitchen gadgets with app connectivity',
        'Meal prep containers and organization tools',
        'Sustainable and eco-friendly kitchenware'
      ]
    };

    return trendingInsights[niche.toLowerCase()] || [
      'High-quality products with premium materials',
      'Smart technology integration trending',
      'Sustainable and eco-friendly options popular',
      'Multi-functional products for convenience'
    ];
  }
}


interface PricingContext {
  originalPrice: number;
  niche: string;
  targetAudience: string;
  features: string[];
  rating: number;
  orders: number;
}

export class SmartPricingService {
  
  static calculateOptimalPrice(context: PricingContext): number {
    const {
      originalPrice,
      niche,
      targetAudience,
      features,
      rating,
      orders
    } = context;

    // Enhanced pricing algorithm for $15-$80 range
    const nicheMultipliers = {
      'beauty': 1.8,      // Beauty products have good margins
      'fitness': 1.6,     // Fitness gear premium
      'pets': 1.7,        // Pet owners spend well
      'electronics': 1.9, // Tech premium
      'kitchen': 1.4,     // Kitchen utility focus
      'home': 1.5,        // Home improvement value
      'jewelry': 2.2,     // Jewelry high margins
      'fashion': 1.6,     // Fashion moderate premium
      'automotive': 1.8,  // Car accessories premium
      'tech': 1.9,        // Technology premium
      'baby': 2.0,        // Baby products high value
      'luxury': 2.5,      // Luxury positioning
      'gaming': 1.7,      // Gaming accessories
      'sports': 1.6,      // Sports equipment
      'travel': 1.5       // Travel gear
    };

    let multiplier = nicheMultipliers[niche.toLowerCase() as keyof typeof nicheMultipliers] || 1.5;

    // Adjust based on target audience
    if (targetAudience.toLowerCase().includes('premium') || 
        targetAudience.toLowerCase().includes('luxury') ||
        targetAudience.toLowerCase().includes('professional')) {
      multiplier += 0.3;
    }

    // Quality indicators boost
    if (rating >= 4.7) multiplier += 0.2;
    else if (rating >= 4.5) multiplier += 0.1;

    if (orders >= 1000) multiplier += 0.2;
    else if (orders >= 500) multiplier += 0.1;

    // Feature-based value enhancement
    const premiumFeatures = [
      'wireless', 'smart', 'premium', 'professional', 'advanced',
      'automatic', 'rechargeable', 'waterproof', 'eco-friendly',
      'bluetooth', 'led', 'digital', 'portable', 'ergonomic'
    ];

    const featureBonus = features.filter(feature => 
      premiumFeatures.some(premium => 
        feature.toLowerCase().includes(premium)
      )
    ).length * 0.1;

    multiplier += featureBonus;

    // Calculate base price from original (ensure minimum viability)
    const basePrice = Math.max(8, originalPrice || 12);
    let finalPrice = basePrice * multiplier;

    // Strict enforcement of $15-$80 range
    finalPrice = Math.max(15, Math.min(80, finalPrice));

    // Apply psychological pricing
    return this.applyPsychologicalPricing(finalPrice);
  }

  private static applyPsychologicalPricing(price: number): number {
    if (price < 25) {
      return Math.floor(price) + 0.99; // $X.99 for lower prices
    } else if (price < 50) {
      return Math.floor(price) + 0.95; // $X.95 for mid-range
    } else {
      return Math.floor(price) + 0.99; // $X.99 for higher prices
    }
  }

  static generateVariantPricing(basePrice: number, variantCount: number): number[] {
    const prices = [basePrice];
    
    for (let i = 1; i < variantCount; i++) {
      // Add 8-20% variation for different variants
      const variation = 1 + (0.08 + Math.random() * 0.12) * (i % 2 === 0 ? 1 : -1);
      const variantPrice = Math.max(15, Math.min(80, basePrice * variation));
      prices.push(this.applyPsychologicalPricing(variantPrice));
    }
    
    return prices;
  }

  static validatePriceRange(price: number): boolean {
    return price >= 15 && price <= 80;
  }

  static adjustForCompetition(price: number, competitorPrices: number[]): number {
    if (competitorPrices.length === 0) return price;
    
    const avgCompetitorPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;
    
    // Position slightly below average competitor price for competitiveness
    const targetPrice = avgCompetitorPrice * 0.92;
    
    // Ensure it stays within our range
    const adjustedPrice = Math.max(15, Math.min(80, targetPrice));
    
    return this.applyPsychologicalPricing(adjustedPrice);
  }
}

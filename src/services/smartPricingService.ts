
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

    // Base multiplier based on niche emotional value
    const nicheMultipliers = {
      'pets': 2.8,      // High emotional value
      'baby': 2.6,      // High emotional value
      'beauty': 2.4,    // Premium positioning
      'fitness': 2.2,   // Health investment value
      'tech': 2.0,      // Innovation premium
      'home': 1.8,      // Utility focus
      'kitchen': 1.8,   // Utility focus
      'fashion': 2.2,   // Style premium
      'car': 2.0,       // Functional premium
      'gifts': 2.4      // Emotional premium
    };

    let multiplier = nicheMultipliers[niche.toLowerCase() as keyof typeof nicheMultipliers] || 2.0;

    // Adjust based on target audience
    if (targetAudience.toLowerCase().includes('premium') || 
        targetAudience.toLowerCase().includes('luxury')) {
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
      'automatic', 'rechargeable', 'waterproof', 'eco-friendly'
    ];

    const featureBonus = features.filter(feature => 
      premiumFeatures.some(premium => 
        feature.toLowerCase().includes(premium)
      )
    ).length * 0.1;

    multiplier += featureBonus;

    // Calculate final price
    let finalPrice = originalPrice * multiplier;

    // Ensure price falls within optimal range ($15-$80)
    finalPrice = Math.max(15, Math.min(80, finalPrice));

    // Round to psychological pricing points
    return this.applyPsychologicalPricing(finalPrice);
  }

  private static applyPsychologicalPricing(price: number): number {
    if (price < 20) {
      return Math.round(price * 100) / 100; // Keep cents for low prices
    } else if (price < 50) {
      return Math.floor(price) + 0.95; // .95 ending
    } else {
      return Math.floor(price) + 0.99; // .99 ending
    }
  }

  static generateVariantPricing(basePrice: number, variantCount: number): number[] {
    const prices = [basePrice];
    
    for (let i = 1; i < variantCount; i++) {
      // Add 5-15% variation for different variants
      const variation = 1 + (Math.random() * 0.1 + 0.05) * (i % 2 === 0 ? 1 : -1);
      const variantPrice = Math.max(15, Math.min(80, basePrice * variation));
      prices.push(this.applyPsychologicalPricing(variantPrice));
    }
    
    return prices;
  }
}

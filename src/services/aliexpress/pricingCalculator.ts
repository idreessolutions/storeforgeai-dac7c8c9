
export class PricingCalculator {
  static calculateSmartPrice(niche: string, index: number): number {
    // Universal smart pricing that works for any niche
    const basePrice = 8 + (Math.random() * 45); // $8-$53 base range
    
    // Add niche-specific multipliers if applicable
    const nicheMultipliers: Record<string, number> = {
      'luxury': 2.5,
      'premium': 1.8,
      'jewelry': 2.0,
      'electronics': 1.5,
      'beauty': 1.4,
      'tech': 1.6,
      'automotive': 1.7,
      'professional': 1.9
    };
    
    const multiplier = nicheMultipliers[niche.toLowerCase()] || 1.0;
    let finalPrice = basePrice * multiplier;
    
    // Ensure reasonable range
    finalPrice = Math.max(5, Math.min(120, finalPrice));
    
    // Psychological pricing
    if (finalPrice < 20) {
      return Math.floor(finalPrice) + 0.99;
    } else if (finalPrice < 50) {
      return Math.floor(finalPrice) + 0.95;
    } else {
      return Math.floor(finalPrice) + 0.99;
    }
  }
}

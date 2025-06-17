
import { AliExpressProduct } from './aliexpress/types';

export class EnhancedContentGenerator {
  static generateUniqueProductContent(
    product: AliExpressProduct,
    niche: string,
    storeName: string,
    targetAudience: string,
    storeStyle: string,
    productIndex: number
  ): any {
    console.log(`🚨 CRITICAL: Generating UNIQUE content for product ${productIndex + 1}: ${product.title}`);
    
    const basePrice = product.price || 29.99;
    const enhancedPrice = this.calculateSmartPrice(basePrice, niche, productIndex);
    
    const uniqueContent = this.createUniqueContent(product, niche, storeName, targetAudience, storeStyle, productIndex);
    const smartVariations = this.generateSmartVariations(niche, enhancedPrice, productIndex);
    
    return {
      title: uniqueContent.title,
      description: uniqueContent.description,
      features: uniqueContent.features,
      benefits: uniqueContent.benefits,
      variations: smartVariations,
      price: enhancedPrice
    };
  }

  private static calculateSmartPrice(originalPrice: number, niche: string, index: number): number {
    const nicheMultipliers: Record<string, number> = {
      'pets': 2.2, 'baby': 2.4, 'beauty': 2.6, 'fitness': 2.0,
      'tech': 1.8, 'kitchen': 1.9, 'home': 1.7, 'fashion': 2.1,
      'jewelry': 3.0, 'automotive': 1.6
    };
    
    const multiplier = nicheMultipliers[niche.toLowerCase()] || 2.0;
    const variation = 1 + (index * 0.08); // 8% variation per product
    
    let smartPrice = originalPrice * multiplier * variation;
    
    // Ensure within $15-$80 range
    smartPrice = Math.max(15, Math.min(80, smartPrice));
    
    // Psychological pricing
    if (smartPrice < 25) return Math.floor(smartPrice) + 0.99;
    else if (smartPrice < 50) return Math.floor(smartPrice) + 0.95;
    else return Math.floor(smartPrice) + 0.99;
  }

  private static createUniqueContent(
    product: AliExpressProduct,
    niche: string,
    storeName: string,
    targetAudience: string,
    storeStyle: string,
    index: number
  ): any {
    const powerWords = ['Ultimate', 'Premium', 'Professional', 'Revolutionary', 'Advanced', 'Elite', 'Supreme', 'Exclusive'];
    const emotionalHooks = [
      '✨ Transform your life with this game-changing innovation',
      '🚀 Discover what professionals don\'t want you to know',
      '💎 Experience premium quality that exceeds expectations', 
      '🏆 Join thousands who\'ve revolutionized their routine',
      '⚡ Unlock the secret to effortless success'
    ];
    
    const powerWord = powerWords[index % powerWords.length];
    const hook = emotionalHooks[index % emotionalHooks.length];
    const nicheWord = this.getNicheSpecificWord(niche, index);
    
    const title = `🏆 ${powerWord} ${nicheWord} - ${this.getUrgencyWord(index)} Edition`;
    
    const description = `${hook}

🎯 **Perfect for ${targetAudience}** who demand excellence!

🏆 **Why Choose This ${powerWord} ${niche.charAt(0).toUpperCase() + niche.slice(1)} Solution?**
• ✅ **Premium Quality**: Engineered with superior materials
• 🚀 **Instant Results**: Experience improvements from day one  
• 💯 **Safety First**: Rigorously tested and certified
• 🎁 **Complete Package**: Everything included - no extras needed
• 🛡️ **Satisfaction Guaranteed**: 30-day money-back promise

💎 **Exclusive ${storeName} Features:**
🔹 ${storeStyle === 'luxury' ? 'Luxury' : storeStyle === 'fun' ? 'Innovative' : 'Professional'} design
🔹 User-friendly operation - perfect for everyone
🔹 Durable construction built to last
🔹 Compact and convenient storage

🏆 **Social Proof**: Over ${(product.orders || 1000).toLocaleString()}+ satisfied customers | ${product.rating || 4.8}⭐ average rating

⚡ **Limited-Time Offer Available**
🛒 **Order Now** and join the ${storeName} family!`;

    const features = [
      `🏆 Premium ${niche} quality`,
      `⚡ ${powerWord} technology`, 
      `💎 Professional-grade materials`,
      `🚀 ${storeStyle === 'luxury' ? 'Luxury' : 'High-performance'} design`,
      `✅ Satisfaction guaranteed`
    ];

    const benefits = [
      `Save time with instant ${niche} solutions`,
      `Professional results without the professional cost`,
      `Durable quality that lasts for years`,
      `Easy to use - no experience required`,
      `Backed by our satisfaction guarantee`
    ];

    return { title, description, features, benefits };
  }

  private static generateSmartVariations(niche: string, basePrice: number, index: number): Array<any> {
    const nicheVariations: Record<string, string[][]> = {
      'pets': [['Small', 'Medium', 'Large'], ['Black', 'Brown', 'White']],
      'beauty': [['Natural', 'Medium', 'Dark'], ['Regular', 'Sensitive', 'Deluxe']],
      'fitness': [['Light', 'Medium', 'Heavy'], ['Standard', 'Pro', 'Elite']],
      'kitchen': [['Small', 'Large', 'XL'], ['Basic', 'Premium', 'Professional']],
      'fashion': [['S', 'M', 'L', 'XL'], ['Black', 'White', 'Blue', 'Red']],
      'tech': [['Basic', 'Advanced', 'Pro'], ['Black', 'White', 'Silver']],
      'home': [['Small', 'Medium', 'Large'], ['White', 'Black', 'Wood']],
      'jewelry': [['Silver', 'Gold', 'Rose Gold'], ['Small', 'Medium', 'Large']],
      'automotive': [['Standard', 'Premium', 'Deluxe'], ['Black', 'Silver', 'Chrome']],
      'baby': [['Newborn', '0-6M', '6-12M'], ['Blue', 'Pink', 'White']]
    };

    const variations = nicheVariations[niche.toLowerCase()] || [['Standard', 'Premium', 'Deluxe']];
    const selectedVariation = variations[index % variations.length];
    
    return selectedVariation.slice(0, 3).map((option, i) => ({
      title: option,
      price: Math.round((basePrice * (1 + i * 0.15)) * 100) / 100,
      color: variations[1] ? option : undefined,
      size: variations[0] ? option : undefined
    }));
  }

  private static getNicheSpecificWord(niche: string, index: number): string {
    const nicheWords: Record<string, string[]> = {
      'pets': ['Pet Care Essential', 'Pet Comfort Solution', 'Pet Training Tool', 'Pet Health Kit'],
      'beauty': ['Beauty Essential', 'Skincare Solution', 'Beauty Tool', 'Cosmetic Must-Have'],
      'fitness': ['Fitness Gear', 'Workout Essential', 'Training Equipment', 'Exercise Tool'],
      'kitchen': ['Kitchen Essential', 'Cooking Solution', 'Chef Tool', 'Culinary Aid'],
      'home': ['Home Essential', 'Living Solution', 'Decor Piece', 'Home Upgrade'],
      'tech': ['Tech Innovation', 'Smart Solution', 'Digital Tool', 'Tech Essential'],
      'fashion': ['Style Essential', 'Fashion Statement', 'Wardrobe Must-Have', 'Style Solution'],
      'jewelry': ['Elegant Accessory', 'Fashion Piece', 'Jewelry Essential', 'Style Statement'],
      'automotive': ['Car Essential', 'Auto Upgrade', 'Vehicle Solution', 'Driving Aid'],
      'baby': ['Baby Essential', 'Child Safety Tool', 'Parenting Aid', 'Baby Comfort Solution']
    };

    const words = nicheWords[niche.toLowerCase()] || ['Essential', 'Solution', 'Tool', 'Kit'];
    return words[index % words.length];
  }

  private static getUrgencyWord(index: number): string {
    const urgencyWords = ['Bestseller', 'Limited Edition', 'Top Rated', 'Must-Have', 'Premium', 'Exclusive'];
    return urgencyWords[index % urgencyWords.length];
  }
}


export class ProductContentEnhancer {
  
  static generateWinningProductContent(niche: string, productIndex: number): {
    title: string;
    description: string;
    features: string[];
    variations: Array<{ title: string; price: number; color?: string; size?: string }>;
    price: number;
  } {
    const basePrice = this.generateSmartPrice(niche, productIndex);
    
    return {
      title: this.generateUniqueTitle(niche, productIndex),
      description: this.generatePersuasiveDescription(niche, productIndex),
      features: this.generateNicheFeatures(niche, productIndex),
      variations: this.generateSmartVariations(niche, basePrice, productIndex),
      price: basePrice
    };
  }

  private static generateUniqueTitle(niche: string, productIndex: number): string {
    const powerWords = ['Ultimate', 'Premium', 'Professional', 'Revolutionary', 'Advanced', 'Elite', 'Smart', 'Pro'];
    const urgencyWords = ['Bestseller', 'Top Rated', 'Must-Have', 'Trending', 'Limited Edition', '#1 Choice'];
    const emojis = ['⭐', '🏆', '💎', '🔥', '✨', '🎯', '⚡', '💪'];
    
    const powerWord = powerWords[productIndex % powerWords.length];
    const urgency = urgencyWords[productIndex % urgencyWords.length];
    const emoji = emojis[productIndex % emojis.length];
    
    const nicheSpecific = this.getNicheSpecificWord(niche, productIndex);
    
    return `${emoji} ${powerWord} ${nicheSpecific} - ${urgency}`;
  }

  private static generatePersuasiveDescription(niche: string, productIndex: number): string {
    const hooks = [
      `🚀 Transform your ${niche} experience with this game-changing innovation!`,
      `💎 Discover the secret that ${niche} professionals don't want you to know!`,
      `⚡ Experience the future of ${niche} technology today!`,
      `🏆 Join thousands who've revolutionized their ${niche} routine!`,
      `✨ Elevate your ${niche} game with this premium solution!`
    ];

    const hook = hooks[productIndex % hooks.length];
    const nicheWord = this.getNicheSpecificWord(niche, productIndex);

    return `${hook}

🎯 **Perfect for anyone who demands excellence!**

🏆 **Why Choose This Premium ${nicheWord}?**
• ✅ **Professional Quality**: Engineered with superior materials for lasting performance
• 🚀 **Instant Results**: Experience remarkable improvements from day one  
• 💯 **Safety First**: Rigorously tested and certified for peace of mind
• 🎁 **Complete Package**: Everything included - no hidden extras needed
• 🛡️ **Satisfaction Guaranteed**: 30-day money-back promise

💎 **Exclusive Features:**
🔹 Premium design that stands out from the competition
🔹 User-friendly operation - perfect for beginners and experts
🔹 Durable construction built to last for years
🔹 Compact and convenient for any space

🏆 **Social Proof**: Over ${(1000 + productIndex * 200).toLocaleString()}+ satisfied customers | 4.8⭐ average rating

⚡ **Limited-Time Offer**: 
🎯 Regular Price: $${(this.generateSmartPrice(niche, productIndex) * 1.5).toFixed(2)}
💰 **Your Price: Only $${this.generateSmartPrice(niche, productIndex).toFixed(2)}** *(Save $${(this.generateSmartPrice(niche, productIndex) * 0.5).toFixed(2)}!)*

🛒 **Order Now** and transform your ${niche} experience today!`;
  }

  private static generateNicheFeatures(niche: string, productIndex: number): string[] {
    const nicheFeatures: Record<string, string[]> = {
      pets: ['🐕 Pet-Safe Materials', '✅ Vet Recommended', '💪 Durable Design', '🧼 Easy Cleaning', '❤️ Pet Comfort', '🛡️ Safety First'],
      beauty: ['✨ Dermatologist Tested', '💄 Professional Quality', '⏰ Long-Lasting', '🌿 Natural Ingredients', '💎 Premium Formula', '👩‍⚕️ Expert Approved'],
      fitness: ['💪 Professional Grade', '🏋️ Gym Quality', '⚡ High Performance', '🎯 Effective Results', '🔥 Fat Burning', '💯 Proven Results'],
      kitchen: ['🍳 Professional Grade', '👨‍🍳 Chef Quality', '🧽 Easy Cleaning', '⭐ Restaurant Standard', '🔥 Heat Resistant', '🛡️ Food Safe'],
      home: ['🏠 Premium Materials', '✨ Stylish Design', '🔧 Easy Setup', '💎 Quality Finish', '🎨 Modern Style', '💪 Durable Build'],
      tech: ['⚡ Fast Performance', '📱 Smart Features', '🚀 Latest Technology', '🔋 Long Battery', '📶 Reliable Connection', '⭐ User Friendly'],
      fashion: ['👗 Premium Fabric', '✨ Trendy Design', '😊 Comfortable Fit', '💪 Quality Construction', '🎨 Stylish Look', '⭐ Fashion Forward'],
      jewelry: ['💎 Premium Quality', '✨ Elegant Design', '🌟 Eye-Catching', '💍 Luxury Feel', '🎨 Artistic Craft', '⭐ Timeless Style'],
      automotive: ['🚗 Universal Fit', '🔧 Easy Install', '💪 Durable Build', '⭐ Professional Grade', '🛡️ Weather Resistant', '🚀 Performance Boost'],
      baby: ['👶 Baby Safe', '👩‍⚕️ Pediatrician Approved', '😊 Comfort First', '🛡️ Safety Tested', '🧼 Easy Clean', '❤️ Parent Trusted']
    };

    const features = nicheFeatures[niche.toLowerCase()] || nicheFeatures.pets;
    const startIndex = (productIndex * 2) % features.length;
    
    return features.slice(startIndex, startIndex + 5);
  }

  private static generateSmartVariations(niche: string, basePrice: number, productIndex: number): Array<{ title: string; price: number; color?: string; size?: string }> {
    const variationTypes = this.getVariationTypes(niche, productIndex);
    
    return variationTypes.map((variation, index) => ({
      title: variation.title,
      price: Math.round((basePrice * (1 + index * 0.15)) * 100) / 100,
      color: variation.color,
      size: variation.size
    }));
  }

  private static getVariationTypes(niche: string, productIndex: number): Array<{ title: string; color?: string; size?: string }> {
    const nicheVariations: Record<string, Array<{ title: string; color?: string; size?: string }>> = {
      pets: [
        { title: 'Small', size: 'Small' },
        { title: 'Medium', size: 'Medium' },
        { title: 'Large', size: 'Large' }
      ],
      beauty: [
        { title: 'Natural', color: 'Natural' },
        { title: 'Premium', color: 'Premium' },
        { title: 'Deluxe', color: 'Deluxe' }
      ],
      fitness: [
        { title: 'Standard', size: 'Standard' },
        { title: 'Pro', size: 'Pro' },
        { title: 'Elite', size: 'Elite' }
      ]
    };

    const variations = nicheVariations[niche.toLowerCase()] || [
      { title: 'Standard', color: 'Black' },
      { title: 'Premium', color: 'White' },
      { title: 'Deluxe', color: 'Blue' }
    ];

    // Rotate variations based on product index for uniqueness
    const startIndex = productIndex % variations.length;
    return [
      variations[startIndex],
      variations[(startIndex + 1) % variations.length],
      variations[(startIndex + 2) % variations.length]
    ];
  }

  private static generateSmartPrice(niche: string, productIndex: number): number {
    const priceRanges: Record<string, [number, number]> = {
      pets: [18, 65],
      beauty: [15, 70], 
      fitness: [22, 75],
      kitchen: [12, 55],
      home: [20, 68],
      tech: [25, 80],
      fashion: [15, 60],
      jewelry: [12, 45],
      automotive: [30, 80],
      baby: [18, 50]
    };

    const [min, max] = priceRanges[niche.toLowerCase()] || [18, 65];
    const basePrice = min + (max - min) * Math.random();
    
    // Add slight variation per product
    const variation = 1 + (productIndex * 0.03);
    let finalPrice = basePrice * variation;
    
    // Ensure within $15-$80 range
    finalPrice = Math.max(15, Math.min(80, finalPrice));
    
    // Psychological pricing
    if (finalPrice < 25) return Math.floor(finalPrice) + 0.99;
    else if (finalPrice < 50) return Math.floor(finalPrice) + 0.95;
    else return Math.floor(finalPrice) + 0.99;
  }

  private static getNicheSpecificWord(niche: string, productIndex: number): string {
    const nicheWords: Record<string, string[]> = {
      pets: ['Pet Care Essential', 'Pet Comfort Tool', 'Pet Training Aid', 'Pet Health Solution', 'Pet Safety Kit'],
      beauty: ['Beauty Essential', 'Skin Care Tool', 'Beauty Solution', 'Cosmetic Kit', 'Beauty Device'],
      fitness: ['Fitness Equipment', 'Workout Tool', 'Exercise Essential', 'Training Aid', 'Gym Accessory'],
      kitchen: ['Kitchen Tool', 'Cooking Aid', 'Culinary Essential', 'Chef Tool', 'Kitchen Gadget'],
      home: ['Home Essential', 'Living Solution', 'Home Comfort', 'Interior Upgrade', 'Home Organizer']
    };

    const words = nicheWords[niche.toLowerCase()] || ['Premium Product', 'Essential Tool', 'Quality Solution'];
    return words[productIndex % words.length];
  }
}

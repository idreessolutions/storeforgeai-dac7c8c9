
export class EnhancedContentGenerator {
  
  static generateUniqueProductContent(product: any, niche: string, storeName: string, targetAudience: string, storeStyle: string, productIndex: number = 0) {
    console.log(`🎨 GENERATING UNIQUE CONTENT for ${niche} product ${productIndex + 1}: ${product.title?.substring(0, 60)}`);
    
    const contentVariation = this.getContentVariation(productIndex);
    const emotionalHook = this.getEmotionalHook(niche, productIndex);
    const urgencyPhrase = this.getUrgencyPhrase(productIndex);
    const socialProof = this.getSocialProof(product, productIndex);
    
    return {
      title: this.generateUniqueTitle(product.title, niche, contentVariation, urgencyPhrase),
      description: this.generateRichDescription(product, niche, targetAudience, storeName, emotionalHook, socialProof, contentVariation, storeStyle),
      features: this.generateEnhancedFeatures(product.features || [], niche, productIndex),
      benefits: this.generateEmotionalBenefits(niche, targetAudience, productIndex),
      variations: this.generateProductVariations(product, niche, productIndex)
    };
  }

  private static getContentVariation(productIndex: number): string {
    const variations = [
      'premium', 'revolutionary', 'professional', 'innovative', 'exclusive', 
      'ultimate', 'advanced', 'elite', 'luxury', 'cutting-edge'
    ];
    return variations[productIndex % variations.length];
  }

  private static getEmotionalHook(niche: string, productIndex: number): string {
    const hooks = {
      'beauty': [
        '✨ Transform your skin with professional-grade results that celebrities swear by',
        '🌟 Unlock the secret to radiant, youthful skin that stops people in their tracks',
        '💎 Experience luxury spa treatments from the comfort of your home',
        '👑 Join thousands who\'ve discovered the fountain of youth'
      ],
      'pets': [
        '🐾 Give your beloved pet the care they truly deserve with this game-changing solution',
        '❤️ Watch your furry friend\'s happiness soar with this veterinarian-recommended essential',
        '🏆 Treat your pet like royalty with this award-winning product',
        '😍 Fall in love with your pet all over again as they experience pure joy'
      ],
      'fitness': [
        '💪 Achieve the body transformation you\'ve always dreamed of in record time',
        '🔥 Unlock your hidden athletic potential with professional-grade equipment',
        '🏆 Join the ranks of elite athletes who trust this performance enhancer',
        '⚡ Experience breakthrough results that will shock your friends and family'
      ],
      'tech': [
        '🚀 Step into the future with technology that will revolutionize your daily routine',
        '⚡ Experience lightning-fast performance that leaves competitors in the dust',
        '🧠 Unleash the power of artificial intelligence in your everyday life',
        '💻 Transform how you work, play, and connect with cutting-edge innovation'
      ],
      'kitchen': [
        '👨‍🍳 Create restaurant-quality meals that will impress even the toughest food critics',
        '🍳 Turn your kitchen into a culinary paradise with this chef-approved essential',
        '✨ Make cooking so effortless, you\'ll wonder how you lived without it',
        '🏆 Join master chefs worldwide who swear by this game-changing tool'
      ]
    };
    
    const nicheHooks = hooks[niche.toLowerCase() as keyof typeof hooks] || hooks['tech'];
    return nicheHooks[productIndex % nicheHooks.length];
  }

  private static getUrgencyPhrase(productIndex: number): string {
    const urgencyPhrases = [
      '🔥 TRENDING NOW', '⚡ LIMITED TIME', '🏆 BESTSELLER', '🎯 EXCLUSIVE DEAL',
      '🌟 TOP RATED', '💎 PREMIUM CHOICE', '🚀 FLYING OFF SHELVES', '⭐ CUSTOMER FAVORITE'
    ];
    return urgencyPhrases[productIndex % urgencyPhrases.length];
  }

  private static getSocialProof(product: any, productIndex: number): string {
    const proofTemplates = [
      `🏆 Over ${(product.orders || 1000).toLocaleString()}+ satisfied customers worldwide`,
      `⭐ ${product.rating || 4.8}/5 stars from verified buyers who love their results`,
      `💎 Featured in top ${product.category || 'product'} lists by industry experts`,
      `🎯 Recommended by professionals in over 50 countries`,
      `✅ Trusted by ${(product.orders || 1000).toLocaleString()}+ happy customers who rave about quality`
    ];
    return proofTemplates[productIndex % proofTemplates.length];
  }

  private static generateUniqueTitle(originalTitle: string, niche: string, variation: string, urgency: string): string {
    const cleanTitle = this.cleanTitle(originalTitle);
    const emoji = this.getNicheEmoji(niche);
    
    const titleTemplates = [
      `${emoji} ${urgency} - ${variation.charAt(0).toUpperCase() + variation.slice(1)} ${cleanTitle}`,
      `${emoji} ${cleanTitle} - ${urgency} ${variation.charAt(0).toUpperCase() + variation.slice(1)} Quality`,
      `${urgency} ${emoji} ${variation.charAt(0).toUpperCase() + variation.slice(1)} ${cleanTitle} Experience`,
      `${emoji} ${variation.charAt(0).toUpperCase() + variation.slice(1)} ${cleanTitle} - ${urgency}`
    ];
    
    return titleTemplates[Math.floor(Math.random() * titleTemplates.length)].substring(0, 75);
  }

  private static generateRichDescription(
    product: any, 
    niche: string, 
    targetAudience: string, 
    storeName: string,
    emotionalHook: string,
    socialProof: string,
    variation: string,
    storeStyle: string
  ): string {
    const price = product.price || 29.99;
    const rating = product.rating || 4.8;
    const orders = product.orders || 1000;
    
    const styleAdjustment = storeStyle === 'luxury' ? '💎 Luxury' : storeStyle === 'fun' ? '🎉 Fun' : '⭐ Professional';
    
    return `${emotionalHook}

🎯 **Perfect for ${targetAudience}** who demand nothing but the best!

🏆 **Why This ${variation.charAt(0).toUpperCase() + variation.slice(1)} ${niche.charAt(0).toUpperCase() + niche.slice(1)} Product?**
• ✅ **Premium Quality**: Engineered with the finest materials for lasting performance
• 🚀 **Instant Results**: See remarkable improvements from day one
• 💯 **Safety First**: Rigorously tested and certified for your peace of mind
• 🎁 **Complete Package**: Everything you need included - no hidden extras
• 🛡️ **Satisfaction Guaranteed**: 30-day money-back promise

💎 **Exclusive ${storeName} Features:**
🔹 ${styleAdjustment} design that complements any lifestyle
🔹 User-friendly operation - perfect for beginners and experts
🔹 Durable construction built to last for years
🔹 Compact and portable for ultimate convenience

${socialProof}

⚡ **Limited-Time Special**: 
🎯 Original Value: $${(price * 1.5).toFixed(2)}
💰 **Your Price: $${price.toFixed(2)}** *(Save $${(price * 0.5).toFixed(2)}!)*

🔥 **BONUS**: Order now and get FREE premium accessories worth $29.99!

🏆 **What Our Customers Say:**
"This completely transformed my ${niche} routine! Best purchase I've made this year!" - Sarah M. ⭐⭐⭐⭐⭐

"Professional quality at an affordable price. Highly recommend!" - Mike T. ⭐⭐⭐⭐⭐

⏰ **Don't Wait - Limited Stock Available!**
Join ${orders.toLocaleString()}+ satisfied customers who've already upgraded their ${niche} game.

🛒 **Order Now** and experience the ${storeName} difference!

*${storeName} - Your trusted partner for premium ${niche} solutions.*`;
  }

  private static generateEnhancedFeatures(originalFeatures: string[], niche: string, productIndex: number): string[] {
    const enhancementWords = ['Premium', 'Advanced', 'Professional', 'Elite', 'Superior', 'Innovative'];
    const enhancement = enhancementWords[productIndex % enhancementWords.length];
    
    const enhancedFeatures = originalFeatures.slice(0, 4).map((feature, index) => {
      const emoji = this.getFeatureEmoji(niche, index);
      return `${emoji} ${enhancement} ${feature.toLowerCase()}`;
    });

    // Add 2 unique features based on niche and product index
    const uniqueFeatures = this.getUniqueFeatures(niche, productIndex);
    return [...enhancedFeatures, ...uniqueFeatures].slice(0, 6);
  }

  private static generateEmotionalBenefits(niche: string, targetAudience: string, productIndex: number): string[] {
    const benefitSets = {
      'beauty': [
        '✨ Boost your confidence with radiant, glowing skin',
        '🌟 Turn heads everywhere you go with your youthful appearance',
        '💎 Save thousands on expensive spa treatments',
        '👑 Feel like royalty with professional-grade results'
      ],
      'pets': [
        '❤️ Strengthen the bond with your beloved companion',
        '😊 Watch your pet\'s happiness and energy soar',
        '🏆 Give your furry friend the best life possible',
        '🛡️ Ensure your pet\'s safety and well-being'
      ],
      'fitness': [
        '💪 Achieve the body transformation you\'ve always wanted',
        '🔥 Boost your energy and confidence dramatically',
        '🏆 Outperform your fitness goals faster than ever',
        '⚡ Feel stronger and more capable every single day'
      ],
      'tech': [
        '🚀 Stay ahead of the curve with cutting-edge technology',
        '⚡ Save hours of time with lightning-fast performance',
        '💻 Impress colleagues and friends with your tech-savvy setup',
        '🧠 Simplify your life with intelligent automation'
      ]
    };
    
    const nicheBenefits = benefitSets[niche.toLowerCase() as keyof typeof benefitSets] || benefitSets['tech'];
    return nicheBenefits;
  }

  private static generateProductVariations(product: any, niche: string, productIndex: number): Array<{ title: string; price: number; color?: string; size?: string }> {
    const basePrice = product.price || 29.99;
    const variations = [];
    
    // Generate 2-4 variations based on niche
    const variationTypes = {
      'beauty': [
        { title: 'Classic', price: basePrice, color: 'Rose Gold' },
        { title: 'Premium', price: basePrice * 1.2, color: 'Platinum' },
        { title: 'Deluxe', price: basePrice * 1.4, color: 'Gold' }
      ],
      'pets': [
        { title: 'Small', price: basePrice * 0.9, size: 'S', color: 'Blue' },
        { title: 'Medium', price: basePrice, size: 'M', color: 'Red' },
        { title: 'Large', price: basePrice * 1.1, size: 'L', color: 'Black' }
      ],
      'fitness': [
        { title: 'Beginner', price: basePrice * 0.85, color: 'Blue' },
        { title: 'Pro', price: basePrice, color: 'Black' },
        { title: 'Elite', price: basePrice * 1.3, color: 'Red' }
      ]
    };
    
    const nicheVariations = variationTypes[niche.toLowerCase() as keyof typeof variationTypes] || [
      { title: 'Standard', price: basePrice, color: 'Black' },
      { title: 'Premium', price: basePrice * 1.2, color: 'White' }
    ];
    
    return nicheVariations.map(v => ({
      ...v,
      price: Math.round(v.price * 100) / 100
    }));
  }

  private static getNicheEmoji(niche: string): string {
    const emojiMap: Record<string, string> = {
      'beauty': '✨',
      'pets': '🐾',
      'fitness': '💪',
      'tech': '🚀',
      'kitchen': '🍳',
      'home': '🏠',
      'baby': '👶',
      'fashion': '👗'
    };
    return emojiMap[niche.toLowerCase()] || '⭐';
  }

  private static getFeatureEmoji(niche: string, index: number): string {
    const emojiSets = {
      'beauty': ['✨', '💄', '🌟', '💎', '🌸', '👑'],
      'pets': ['🐕', '🐱', '❤️', '🏆', '🎾', '🦴'],
      'fitness': ['💪', '🏋️', '🔥', '⚡', '🎯', '🏆'],
      'tech': ['⚡', '📱', '🚀', '💻', '🔋', '📡']
    };
    
    const emojis = emojiSets[niche.toLowerCase() as keyof typeof emojiSets] || emojiSets['tech'];
    return emojis[index % emojis.length];
  }

  private static getUniqueFeatures(niche: string, productIndex: number): string[] {
    const uniqueFeatureSets = {
      'beauty': [
        ['🌟 Dermatologist-tested formula', '💎 Clinical-grade technology'],
        ['✨ Anti-aging breakthrough', '🌸 Gentle on sensitive skin'],
        ['👑 Luxury spa experience', '💄 Professional makeup artist quality']
      ],
      'pets': [
        ['❤️ Veterinarian recommended', '🏆 Pet safety certified'],
        ['🎾 Interactive play design', '🦴 Promotes healthy habits'],
        ['🐕 Stress-reducing technology', '🐱 Comfort-focused engineering']
      ],
      'fitness': [
        ['🔥 Fat-burning optimization', '⚡ Energy-boosting design'],
        ['🎯 Precision targeting', '🏆 Athletic performance enhancement'],
        ['💪 Muscle-building support', '🏋️ Professional gym quality']
      ],
      'tech': [
        ['🚀 Next-generation technology', '💻 Smart connectivity'],
        ['📱 Universal compatibility', '🔋 Long-lasting battery'],
        ['⚡ Lightning-fast performance', '📡 Advanced wireless technology']
      ]
    };

    const nicheFeatures = uniqueFeatureSets[niche.toLowerCase() as keyof typeof uniqueFeatureSets] || uniqueFeatureSets['tech'];
    return nicheFeatures[productIndex % nicheFeatures.length];
  }

  private static cleanTitle(title: string): string {
    return title
      .replace(/^(Hot|New|Best|Top|Premium|Professional)\s+/i, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 50);
  }
}

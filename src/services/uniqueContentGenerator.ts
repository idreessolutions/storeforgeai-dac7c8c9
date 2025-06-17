
export class UniqueContentGenerator {
  
  static generateUniqueProductContent(product: any, niche: string, index: number): {
    title: string;
    description: string;
    features: string[];
    benefits: string[];
  } {
    console.log(`🎨 Generating UNIQUE content for ${niche} product ${index + 1}: ${product.title}`);
    
    const uniqueTitle = this.generateUniqueTitle(product.title, niche, index);
    const uniqueDescription = this.generateUniqueDescription(product, niche, index);
    const enhancedFeatures = this.generateUniqueFeatures(product.features || [], niche, index);
    const uniqueBenefits = this.generateUniqueBenefits(product, niche, index);
    
    console.log(`✅ Generated UNIQUE content for "${uniqueTitle}"`);
    
    return {
      title: uniqueTitle,
      description: uniqueDescription,
      features: enhancedFeatures,
      benefits: uniqueBenefits
    };
  }

  private static generateUniqueTitle(baseTitle: string, niche: string, index: number): string {
    const nicheEmojis = {
      'pets': ['🐕', '🐱', '🐾', '🦴'],
      'fitness': ['💪', '🏋️', '🏃', '🔥'],
      'beauty': ['✨', '💄', '👑', '💎'],
      'tech': ['⚡', '📱', '🚀', '🔧'],
      'baby': ['👶', '🍼', '💤', '🧸'],
      'home': ['🏠', '✨', '🛋️', '🌟'],
      'kitchen': ['👨‍🍳', '🍳', '🔪', '⭐']
    };
    
    const powerWords = ['Ultimate', 'Premium', 'Professional', 'Advanced', 'Smart', 'Elite', 'Pro'];
    const urgencyWords = ['Bestseller', 'Hot Deal', 'Trending', 'Limited', 'Exclusive', 'Popular'];
    
    const emojiSet = nicheEmojis[niche.toLowerCase() as keyof typeof nicheEmojis] || ['⭐'];
    const emoji = emojiSet[index % emojiSet.length];
    const powerWord = powerWords[index % powerWords.length];
    const urgency = urgencyWords[index % urgencyWords.length];
    
    const cleanTitle = baseTitle.replace(/[🐕🐱🐾💪🏋️✨💄👶🍼🏠⚡📱👨‍🍳🍳⭐🔥💎👑🚀🔧💤🧸🛋️🌟🔪]/g, '').trim();
    
    const titleTemplates = [
      `${emoji} ${powerWord} ${cleanTitle} - ${urgency}`,
      `${emoji} ${cleanTitle} ${powerWord} Edition - ${urgency}`,
      `${emoji} ${urgency}: ${powerWord} ${cleanTitle}`,
      `${emoji} ${powerWord} ${cleanTitle} | ${urgency} Item`
    ];
    
    return titleTemplates[index % titleTemplates.length].substring(0, 70);
  }

  private static generateUniqueDescription(product: any, niche: string, index: number): string {
    const nicheIntros = {
      'pets': [
        '🐕 Transform your furry friend\'s life with this incredible product!',
        '🐾 Every pet parent dreams of finding the perfect solution...',
        '🐱 Your beloved companion deserves nothing but the best!',
        '🦴 Discover why thousands of pet owners are raving about this amazing find!'
      ],
      'fitness': [
        '💪 Ready to transform your fitness journey? This is your game-changer!',
        '🔥 Thousands of fitness enthusiasts can\'t be wrong about this incredible tool!',
        '🏋️ Take your workouts to the next level with this premium equipment!',
        '🏃 Whether you\'re a beginner or pro, this will revolutionize your training!'
      ],
      'beauty': [
        '✨ Unlock your skin\'s true potential with this revolutionary beauty essential!',
        '💄 Beauty experts worldwide are calling this the must-have product of the year!',
        '👑 Treat yourself like royalty with this luxurious beauty solution!',
        '💎 Discover the secret that top beauty influencers don\'t want you to know!'
      ],
      'tech': [
        '⚡ Experience the future of technology with this cutting-edge innovation!',
        '📱 This smart device will completely change how you think about convenience!',
        '🚀 Join thousands of tech enthusiasts who\'ve already upgraded their life!',
        '🔧 Professional-grade technology now available for everyday users!'
      ],
      'baby': [
        '👶 Every parent\'s dream solution for peaceful nights and happy days!',
        '🍼 Trusted by pediatricians and loved by thousands of parents worldwide!',
        '💤 Transform your parenting experience with this incredible innovation!',
        '🧸 Safety meets convenience in this must-have baby essential!'
      ],
      'home': [
        '🏠 Transform your living space into the sanctuary you\'ve always dreamed of!',
        '✨ Create the perfect ambiance that guests will never forget!',
        '🛋️ Elevate your home\'s style with this stunning addition!',
        '🌟 Turn your house into a home with this incredible upgrade!'
      ],
      'kitchen': [
        '👨‍🍳 Unleash your inner chef with this professional-grade kitchen essential!',
        '🍳 Transform your cooking experience from ordinary to extraordinary!',
        '⭐ Master chefs worldwide recommend this incredible kitchen tool!',
        '🔪 Elevate every meal with this must-have culinary innovation!'
      ]
    };
    
    const nicheIntroSet = nicheIntros[niche.toLowerCase() as keyof typeof nicheIntros] || nicheIntros['tech'];
    const intro = nicheIntroSet[index % nicheIntroSet.length];
    
    const rating = product.rating || (4.6 + Math.random() * 0.3);
    const orders = product.orders || (1000 + index * 200);
    
    const descriptionTemplates = [
      `${intro}

🎯 **Why This Product is Taking ${niche.charAt(0).toUpperCase() + niche.slice(1)} Enthusiasts by Storm:**

With an incredible **${rating.toFixed(1)}⭐ rating** from over **${orders.toLocaleString()}+ verified customers**, this isn't just another product - it's a complete game-changer that's transforming lives every single day!

✨ **What Makes This So Special:**
${(product.features || []).map((f: string, i: number) => `${['🚀', '💎', '⭐', '🔥', '💪', '✨'][i % 6]} ${f}`).join('\n')}

🏆 **Real Results from Real Customers:**
"This completely exceeded my expectations! I wish I had found this sooner." - Sarah M. ⭐⭐⭐⭐⭐

"Best purchase I've made all year. The quality is outstanding!" - Mike R. ⭐⭐⭐⭐⭐

💯 **Why Choose This Over Competitors:**
✅ Premium quality materials that last for years
✅ Designed by industry professionals
✅ Backed by thousands of 5-star reviews
✅ Fast shipping and excellent customer service
✅ 30-day satisfaction guarantee

🎉 **Limited Time Special:**
Join the thousands of satisfied customers who've already upgraded their ${niche} experience! Don't miss out on this incredible opportunity.

⚡ **Order now** and discover why this is becoming the #1 choice for ${niche} enthusiasts worldwide!

*Free shipping • 30-day returns • Premium quality guaranteed*`,

      `${intro}

🌟 **The ${niche.charAt(0).toUpperCase() + niche.slice(1)} Revolution Starts Here!**

Over **${orders.toLocaleString()}+ happy customers** and a stunning **${rating.toFixed(1)}⭐ average rating** prove this isn't just hype - it's the real deal that's changing lives!

🎯 **Premium Features That Set This Apart:**
${(product.features || []).map((f: string, i: number) => `${['💎', '🚀', '⚡', '🏆', '✨', '🔥'][i % 6]} ${f}`).join('\n')}

💫 **Customer Success Stories:**
"I can't believe the difference this has made! Absolutely life-changing." - Jennifer K. ⭐⭐⭐⭐⭐

"Professional quality at an amazing price. Highly recommend!" - David L. ⭐⭐⭐⭐⭐

🏅 **Why Thousands Choose This Daily:**
✅ Scientifically designed for maximum effectiveness
✅ Premium materials built to last
✅ Easy to use - works right out of the box
✅ Professional-grade quality at home prices
✅ Comprehensive satisfaction guarantee

🚀 **Transform Your ${niche.charAt(0).toUpperCase() + niche.slice(1)} Experience:**
This isn't just a purchase - it's an investment in your quality of life. Join the community of satisfied customers who've discovered the difference premium quality makes!

💥 **Order Today** and experience why this is rated the #1 ${niche} product by customers worldwide!

*Premium quality • Fast delivery • Risk-free guarantee*`
    ];
    
    return descriptionTemplates[index % descriptionTemplates.length];
  }

  private static generateUniqueFeatures(baseFeatures: string[], niche: string, index: number): string[] {
    const nicheFeaturePrefixes = {
      'pets': ['🐕 Pet-Safe', '🐾 Veterinarian', '🦴 Durable', '🐱 Comfort'],
      'fitness': ['💪 Professional', '🔥 High-Performance', '🏋️ Gym-Quality', '🏃 Athletic'],
      'beauty': ['✨ Dermatologist', '💄 Professional', '👑 Luxury', '💎 Premium'],
      'tech': ['⚡ Smart', '📱 Advanced', '🚀 Cutting-Edge', '🔧 Professional'],
      'baby': ['👶 Baby-Safe', '🍼 Pediatrician', '💤 Sleep-Friendly', '🧸 Gentle'],
      'home': ['🏠 Home-Perfect', '✨ Stylish', '🛋️ Comfort', '🌟 Premium'],
      'kitchen': ['👨‍🍳 Chef-Quality', '🍳 Professional', '⭐ Restaurant-Grade', '🔪 Precision']
    };
    
    const prefixSet = nicheFeaturePrefixes[niche.toLowerCase() as keyof typeof nicheFeaturePrefixes] || nicheFeaturePrefixes['tech'];
    
    const enhancedFeatures = [];
    for (let i = 0; i < Math.max(5, baseFeatures.length); i++) {
      const baseFeature = baseFeatures[i] || `Quality ${niche} feature`;
      const prefix = prefixSet[i % prefixSet.length];
      const cleanFeature = baseFeature.replace(/[🐕🐱🐾💪🏋️✨💄👶🍼🏠⚡📱👨‍🍳🍳⭐🔥💎👑🚀🔧💤🧸🛋️🌟🔪]/g, '').trim();
      enhancedFeatures.push(`${prefix} ${cleanFeature}`);
    }
    
    return enhancedFeatures;
  }

  private static generateUniqueBenefits(product: any, niche: string, index: number): string[] {
    const nicheBenefits = {
      'pets': [
        '🐕 Enhances your pet\'s happiness and well-being',
        '🐾 Strengthens the bond between you and your furry friend',
        '🦴 Promotes healthy habits and natural behaviors',
        '🐱 Reduces stress and anxiety for both pet and owner'
      ],
      'fitness': [
        '💪 Accelerates your fitness transformation',
        '🔥 Burns calories more efficiently than traditional methods',
        '🏋️ Builds strength and endurance simultaneously',
        '🏃 Fits seamlessly into any workout routine'
      ],
      'beauty': [
        '✨ Reveals your skin\'s natural radiance and glow',
        '💄 Professional salon results in the comfort of home',
        '👑 Boosts confidence with visible improvements',
        '💎 Anti-aging benefits that turn back the clock'
      ],
      'tech': [
        '⚡ Streamlines your daily routine for maximum efficiency',
        '📱 Future-proofs your tech setup with cutting-edge features',
        '🚀 Saves time and effort with smart automation',
        '🔧 Professional-grade performance for everyday use'
      ],
      'baby': [
        '👶 Promotes better sleep for the whole family',
        '🍼 Reduces parenting stress with foolproof solutions',
        '💤 Creates a safer, more comfortable environment',
        '🧸 Supports healthy development and growth'
      ],
      'home': [
        '🏠 Transforms your space into a stylish sanctuary',
        '✨ Creates the perfect ambiance for any occasion',
        '🛋️ Maximizes comfort and functionality',
        '🌟 Impresses guests and elevates your lifestyle'
      ],
      'kitchen': [
        '👨‍🍳 Elevates your cooking to professional chef level',
        '🍳 Saves time while improving food quality',
        '⭐ Makes meal preparation enjoyable and efficient',
        '🔪 Delivers consistent, restaurant-quality results'
      ]
    };
    
    const benefitSet = nicheBenefits[niche.toLowerCase() as keyof typeof nicheBenefits] || nicheBenefits['tech'];
    return benefitSet.slice(0, 4);
  }
}


export class UniqueContentGenerator {
  
  static generateUniqueProductContent(product: any, niche: string, productIndex: number) {
    const contentTemplates = this.getContentTemplates(niche, productIndex);
    const uniqueElements = this.generateUniqueElements(product, niche, productIndex);
    
    return {
      title: this.generateUniqueTitle(product.title, niche, productIndex, uniqueElements),
      description: this.generateUniqueDescription(product, niche, productIndex, contentTemplates),
      features: this.generateUniqueFeatures(product.features || [], niche, productIndex),
      benefits: this.generateUniqueBenefits(niche, productIndex, uniqueElements)
    };
  }

  private static getContentTemplates(niche: string, productIndex: number) {
    const templates = {
      'beauty': [
        {
          hook: "Transform your skincare routine with professional-grade technology",
          style: "luxury spa experience",
          audience: "beauty enthusiasts seeking professional results"
        },
        {
          hook: "Discover the secret to radiant, youthful skin",
          style: "clinical-grade treatment",
          audience: "those who want salon-quality results at home"
        },
        {
          hook: "Unlock your skin's natural glow with advanced beauty technology",
          style: "innovative beauty solution",
          audience: "modern beauty lovers"
        }
      ],
      'pets': [
        {
          hook: "Give your beloved pet the care they deserve",
          style: "pet wellness solution",
          audience: "devoted pet parents"
        },
        {
          hook: "Enhance your pet's happiness and health",
          style: "premium pet care",
          audience: "pet lovers who want the best"
        },
        {
          hook: "Create a better life for your furry family member",
          style: "innovative pet product",
          audience: "caring pet owners"
        }
      ],
      'fitness': [
        {
          hook: "Achieve your fitness goals faster than ever",
          style: "performance enhancement",
          audience: "fitness enthusiasts and athletes"
        },
        {
          hook: "Transform your body with professional-grade equipment",
          style: "gym-quality workout",
          audience: "serious fitness practitioners"
        }
      ],
      'tech': [
        {
          hook: "Experience the future of technology today",
          style: "cutting-edge innovation",
          audience: "tech enthusiasts and early adopters"
        }
      ]
    };

    const nicheTemplates = templates[niche.toLowerCase() as keyof typeof templates] || templates['tech'];
    return nicheTemplates[productIndex % nicheTemplates.length];
  }

  private static generateUniqueElements(product: any, niche: string, productIndex: number) {
    const emotionalTriggers = [
      'confidence', 'convenience', 'luxury', 'innovation', 'results', 'comfort', 'efficiency', 'style'
    ];
    
    const valuePropositions = [
      'Save time and money', 'Professional results at home', 'Trusted by thousands', 
      'Easy to use', 'Durable and reliable', 'Innovative design', 'Premium quality'
    ];

    return {
      emotionalTrigger: emotionalTriggers[productIndex % emotionalTriggers.length],
      valueProposition: valuePropositions[productIndex % valuePropositions.length],
      uniqueAngle: this.getUniqueAngle(niche, productIndex),
      socialProof: this.generateSocialProof(product, productIndex)
    };
  }

  private static getUniqueAngle(niche: string, productIndex: number): string {
    const angles = {
      'beauty': ['Anti-aging breakthrough', 'Professional spa treatment', 'Dermatologist recommended', 'Clinical results'],
      'pets': ['Veterinarian approved', 'Pet happiness guaranteed', 'Safety first design', 'Loved by pets worldwide'],
      'fitness': ['Athletic performance', 'Professional training', 'Results guaranteed', 'Used by trainers'],
      'tech': ['Future technology', 'Smart innovation', 'User-friendly design', 'Advanced features']
    };

    const nicheAngles = angles[niche.toLowerCase() as keyof typeof angles] || angles['tech'];
    return nicheAngles[productIndex % nicheAngles.length];
  }

  private static generateSocialProof(product: any, productIndex: number): string {
    const proofTypes = [
      `Over ${(product.orders || 1000).toLocaleString()}+ satisfied customers`,
      `${product.rating || 4.8}⭐ average rating from verified buyers`,
      `Featured in top ${product.category || 'product'} lists`,
      `Recommended by professionals worldwide`,
      `Trusted by thousands of happy customers`
    ];

    return proofTypes[productIndex % proofTypes.length];
  }

  private static generateUniqueTitle(originalTitle: string, niche: string, productIndex: number, elements: any): string {
    const titleVariations = [
      `✨ ${elements.uniqueAngle} ${originalTitle}`,
      `🏆 Premium ${originalTitle} - ${elements.emotionalTrigger}`,
      `⭐ ${originalTitle} - ${elements.valueProposition}`,
      `🚀 Advanced ${originalTitle} Experience`,
      `💎 Professional ${originalTitle} Solution`
    ];

    return titleVariations[productIndex % titleVariations.length].substring(0, 75);
  }

  private static generateUniqueDescription(product: any, niche: string, productIndex: number, template: any): string {
    const descriptionStructures = [
      // Structure 1: Problem-Solution-Benefits
      `${template.hook} ✨

🎯 **The Problem:** Many people struggle with finding the right ${niche} solution that delivers real results.

💡 **The Solution:** Our ${template.style} is designed specifically for ${template.audience} who demand excellence.

🏆 **Why Choose This?**
• Premium quality materials and construction
• Proven results from thousands of satisfied customers
• Easy to use with professional-grade performance
• Backed by our satisfaction guarantee

⭐ **Customer Success:** "${product.rating || 4.8}/5 stars from ${(product.orders || 1000).toLocaleString()}+ verified customers"

✅ **Perfect For:** ${template.audience} who want professional results without the professional price tag.

🛒 **Order Now** and experience the difference quality makes!`,

      // Structure 2: Benefits-Features-Social Proof
      `Discover why thousands choose this premium ${niche} solution! 🌟

✨ **Transform Your Experience:**
Transform your daily routine with our innovative design that delivers exceptional results every time.

🏆 **Professional Quality:**
• Engineered for durability and performance
• Used by professionals worldwide
• Premium materials for long-lasting value

📊 **Proven Results:**
Join ${(product.orders || 1000).toLocaleString()}+ satisfied customers who've experienced the difference.

💯 **Satisfaction Guaranteed:**
We're so confident you'll love it, we offer a full satisfaction guarantee.

🎁 **Special Features:**
Each unit comes with everything you need to get started immediately.`,

      // Structure 3: Story-Driven
      `The ${niche} solution that's changing everything! 🚀

When we set out to create the perfect ${niche} product, we had one goal: deliver professional results that anyone can achieve at home.

🎯 **What Makes It Special:**
Our unique approach combines innovative design with user-friendly features, creating an experience that exceeds expectations.

⭐ **Real Customer Results:**
"This completely transformed my ${niche} routine!" - Verified Customer

🏆 **Quality You Can Trust:**
With ${product.rating || 4.8}⭐ rating and ${(product.orders || 1000).toLocaleString()}+ orders, you're choosing a proven winner.

✅ **Get Yours Today** and discover why this is becoming the #1 choice for ${niche} enthusiasts everywhere!`
    ];

    return descriptionStructures[productIndex % descriptionStructures.length];
  }

  private static generateUniqueFeatures(originalFeatures: string[], niche: string, productIndex: number): string[] {
    const featureEnhancers = [
      'Premium', 'Professional', 'Advanced', 'Enhanced', 'Superior', 'Innovative', 'Smart', 'Elite'
    ];

    const enhancer = featureEnhancers[productIndex % featureEnhancers.length];
    
    const enhancedFeatures = originalFeatures.map((feature, index) => {
      const emoji = this.getFeatureEmoji(niche, index);
      return `${emoji} ${enhancer} ${feature.toLowerCase()}`;
    });

    // Add unique features based on product index
    const uniqueFeatures = this.getUniqueFeatures(niche, productIndex);
    return [...enhancedFeatures, ...uniqueFeatures].slice(0, 6);
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
        ['🌟 Dermatologist tested formula', '💎 Clinical-grade technology'],
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

  private static generateUniqueBenefits(niche: string, productIndex: number, elements: any): string[] {
    const benefitTemplates = [
      `🚀 Experience ${elements.emotionalTrigger} like never before`,
      `💎 ${elements.valueProposition} with premium quality`,
      `🏆 Join thousands who've discovered the difference`,
      `⭐ Professional results in the comfort of your home`,
      `✨ Transform your ${niche} routine today`
    ];

    // Rotate benefits based on product index for uniqueness
    const startIndex = productIndex % benefitTemplates.length;
    const rotatedBenefits = [
      ...benefitTemplates.slice(startIndex),
      ...benefitTemplates.slice(0, startIndex)
    ];

    return rotatedBenefits.slice(0, 4);
  }
}

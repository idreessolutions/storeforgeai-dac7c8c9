
import { getNicheConfig, SUPPORTED_NICHES } from '../components/store-builder/NicheLibrary';

interface ProductGenerationParams {
  niche: string;
  storeName: string;
  targetAudience: string;
  businessType: string;
  storeStyle: string;
  themeColor: string;
  customInfo?: string;
  productIndex: number;
}

export class EnhancedProductGenerator {
  static generateUniqueProduct(params: ProductGenerationParams): any {
    const nicheConfig = getNicheConfig(params.niche);
    const contentVariation = this.getContentVariation(params.productIndex);
    
    console.log(`🚨 GENERATING UNIQUE PRODUCT ${params.productIndex + 1} for ${params.niche.toUpperCase()}`);
    console.log(`🎨 Style: ${params.storeStyle} | Business: ${params.businessType} | Color: ${params.themeColor}`);

    const product = {
      title: this.generateDynamicTitle(params, nicheConfig, contentVariation),
      description: this.generatePowerfulDescription(params, nicheConfig, contentVariation),
      price: this.calculateSmartPrice(params, nicheConfig),
      images: this.generateWorkingImages(params.niche, params.productIndex),
      variants: this.generateSmartVariants(params, nicheConfig),
      tags: this.generateTargetedTags(params, nicheConfig),
      seoTitle: this.generateSEOTitle(params, nicheConfig),
      features: this.generateFeatures(params, nicheConfig),
      benefits: this.generateBenefits(params, nicheConfig)
    };

    console.log(`✅ UNIQUE PRODUCT CREATED: "${product.title}" - $${product.price}`);
    return product;
  }

  private static getContentVariation(index: number): string {
    const variations = [
      'emotional', 'professional', 'trendy', 'luxury', 
      'practical', 'innovative', 'premium', 'essential',
      'exclusive', 'advanced'
    ];
    return variations[index % variations.length];
  }

  private static generateDynamicTitle(
    params: ProductGenerationParams, 
    nicheConfig: any, 
    variation: string
  ): string {
    const powerWords = this.getPowerWords(params.storeStyle, variation);
    const nicheKeyword = nicheConfig.keywords[params.productIndex % nicheConfig.keywords.length];
    const businessPrefix = this.getBusinessPrefix(params.businessType);
    const styleModifier = this.getStyleModifier(params.storeStyle);
    
    const titleTemplates = [
      `${powerWords[0]} ${nicheKeyword} ${styleModifier} - ${businessPrefix}`,
      `${businessPrefix} ${powerWords[1]} ${nicheKeyword} Collection`,
      `${styleModifier} ${nicheKeyword} ${powerWords[2]} Edition`,
      `Ultimate ${nicheKeyword} ${powerWords[0]} for ${params.targetAudience}`,
      `${powerWords[2]} ${nicheKeyword} - ${styleModifier} ${businessPrefix}`,
      `Professional ${nicheKeyword} ${powerWords[0]} Kit`,
      `${params.storeName} Exclusive ${nicheKeyword} ${styleModifier}`,
      `Premium ${nicheKeyword} ${powerWords[1]} System`
    ];

    const title = titleTemplates[params.productIndex % titleTemplates.length];
    return title.substring(0, 75); // Shopify title limit
  }

  private static generatePowerfulDescription(
    params: ProductGenerationParams,
    nicheConfig: any,
    variation: string
  ): string {
    const emoji = this.getNicheEmoji(params.niche);
    const urgency = this.getUrgencyTrigger(params.productIndex);
    const benefits = this.generateBenefits(params, nicheConfig);
    const features = this.generateFeatures(params, nicheConfig);
    const socialProof = this.getSocialProof(params.productIndex);
    const guarantee = this.getGuarantee(params.businessType);
    const businessTone = this.getBusinessTone(params.businessType);
    const styleTone = this.getStyleTone(params.storeStyle);

    // Apply custom information if provided
    const customSection = params.customInfo ? `\n✨ **${params.storeName} Special Features:** ${params.customInfo}\n` : '';

    return `${emoji} **${urgency} - ${params.storeName} Exclusive!** ${emoji}

${businessTone} ${styleTone}

🎯 **Perfect for ${params.targetAudience}** who demand ${this.getQualityLevel(params.storeStyle)} quality!

${this.getEmotionalHook(params.niche, variation, params.themeColor, params.storeName)}

🏆 **Why This ${params.niche} Solution Dominates:**
${features.map(f => `• ✅ ${f}`).join('\n')}

💎 **Transform Your ${params.niche} Experience:**
${benefits.map(b => `🔹 ${b}`).join('\n')}
${customSection}
📊 **${socialProof}**
⭐ ${(4.2 + Math.random() * 0.8).toFixed(1)}/5 stars | ${(500 + params.productIndex * 100).toLocaleString()}+ satisfied customers

${this.getCallToAction(params.businessType, params.storeStyle)}

🛡️ **${guarantee}** - Your satisfaction guaranteed!

🎨 **${params.storeName} Brand Promise:** We specialize in ${params.niche} products that match your ${params.storeStyle} lifestyle perfectly.`;
  }

  private static generateWorkingImages(niche: string, index: number): string[] {
    // Real working image URLs from Unsplash based on niche
    const nicheImageLibrary = {
      beauty: [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        'https://images.unsplash.com/photo-1487412912498-0447578fcca8',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43',
        'https://images.unsplash.com/photo-1588614959060-4d144f28b207'
      ],
      pets: [
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee',
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b',
        'https://images.unsplash.com/photo-1592194996308-7b43878e84a6',
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e'
      ],
      tech: [
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1',
        'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43',
        'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
      ],
      fitness: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        'https://images.unsplash.com/photo-1434596922112-19c563067271',
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
        'https://images.unsplash.com/photo-1598971639058-fab3c3109a00'
      ],
      kitchen: [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
        'https://images.unsplash.com/photo-1556909042-f6aa4b57cc02',
        'https://images.unsplash.com/photo-1571197102211-d770383d1d16',
        'https://images.unsplash.com/photo-1574781330855-d2a8944a2b8d',
        'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89'
      ],
      fashion: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
        'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f',
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
        'https://images.unsplash.com/photo-1445205170230-053b83016050'
      ]
    };

    const nicheImages = nicheImageLibrary[niche.toLowerCase() as keyof typeof nicheImageLibrary] 
      || nicheImageLibrary.tech;

    // Generate 6-8 unique images per product with variations
    const images = [];
    const baseIndex = (index * 2) % nicheImages.length;
    
    for (let i = 0; i < 6; i++) {
      const imageIndex = (baseIndex + i) % nicheImages.length;
      const variation = (index * 100 + i * 50) % 1000;
      images.push(`${nicheImages[imageIndex]}?w=800&h=600&fit=crop&auto=format&q=80&random=${variation}`);
    }
    
    console.log(`📸 Generated ${images.length} unique images for ${niche} product ${index + 1}`);
    return images;
  }

  private static calculateSmartPrice(
    params: ProductGenerationParams,
    nicheConfig: any
  ): number {
    const [minPrice, maxPrice] = nicheConfig.priceRange;
    const basePrice = minPrice + (params.productIndex * 3);
    
    const styleMultiplier = this.getStyleMultiplier(params.storeStyle);
    const businessMultiplier = this.getBusinessMultiplier(params.businessType);
    
    let finalPrice = basePrice * styleMultiplier * businessMultiplier;
    
    // Add some randomization to ensure uniqueness
    const randomFactor = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
    finalPrice *= randomFactor;
    
    finalPrice = Math.max(minPrice, Math.min(maxPrice, finalPrice));
    
    return Math.floor(finalPrice) + 0.99;
  }

  private static generateSmartVariants(
    params: ProductGenerationParams,
    nicheConfig: any
  ): any[] {
    const variants = [];
    const basePrice = this.calculateSmartPrice(params, nicheConfig);
    
    const variantTypes = this.getVariantTypes(params.niche);
    
    for (let i = 0; i < Math.min(3, variantTypes.length); i++) {
      const variant = variantTypes[i];
      const priceMultiplier = 1 + (i * 0.15);
      
      variants.push({
        title: variant.name,
        price: Math.round(basePrice * priceMultiplier * 100) / 100,
        option1: variant.option1,
        option2: variant.option2,
        sku: `${params.niche.toUpperCase()}-${params.storeName.replace(/\s+/g, '').toUpperCase()}-${params.productIndex + 1}-${i + 1}`,
        inventory_quantity: 100,
        weight: variant.weight || 1.0
      });
    }
    
    return variants;
  }

  // Helper methods
  private static getPowerWords(style: string, variation: string): string[] {
    const styleWords = {
      'modern': ['Smart', 'Advanced', 'Innovative'],
      'luxury': ['Premium', 'Exclusive', 'Elite'], 
      'fun': ['Amazing', 'Awesome', 'Incredible'],
      'professional': ['Professional', 'Expert', 'Pro'],
      'rustic': ['Natural', 'Authentic', 'Classic'],
      'trendy': ['Trendy', 'Stylish', 'Hot']
    };
    
    return styleWords[style.toLowerCase()] || ['Quality', 'Premium', 'Professional'];
  }

  private static getBusinessPrefix(businessType: string): string {
    const prefixes = {
      'e-commerce': 'Bestseller',
      'dropshipping': 'Trending',
      'retail': 'Store Favorite', 
      'wholesale': 'Bulk Essential',
      'subscription': 'Monthly Pick',
      'marketplace': 'Top Rated'
    };
    
    return prefixes[businessType.toLowerCase()] || 'Premium';
  }

  private static getStyleModifier(style: string): string {
    const modifiers = {
      'modern': 'Contemporary',
      'luxury': 'Luxury',
      'fun': 'Vibrant', 
      'professional': 'Professional',
      'rustic': 'Natural',
      'trendy': 'Trendy'
    };
    
    return modifiers[style.toLowerCase()] || 'Premium';
  }

  private static getBusinessTone(businessType: string): string {
    const tones = {
      'e-commerce': 'Transform your online shopping experience with this must-have item.',
      'dropshipping': 'Discover the latest trending product that\'s taking the market by storm.',
      'retail': 'Add this customer favorite to your collection today.',
      'wholesale': 'Perfect for bulk orders and business customers.',
      'subscription': 'This month\'s featured item in our curated collection.',
      'marketplace': 'Join thousands of satisfied marketplace buyers.'
    };
    
    return tones[businessType.toLowerCase()] || 'Experience the difference with this premium product.';
  }

  private static getStyleTone(style: string): string {
    const tones = {
      'modern': 'Sleek, contemporary design meets cutting-edge functionality.',
      'luxury': 'Indulge in the finest quality with this exclusive luxury piece.',
      'fun': 'Bright, colorful, and designed to bring joy to your daily routine.',
      'professional': 'Engineered for professionals who demand excellence.',
      'rustic': 'Embrace natural beauty with this authentic, handcrafted quality.',
      'trendy': 'Stay ahead of the curve with this fashion-forward essential.'
    };
    
    return tones[style.toLowerCase()] || 'Designed with your lifestyle in mind.';
  }

  private static getVariantTypes(niche: string): any[] {
    const variants = {
      'beauty': [
        { name: 'Light Shade', option1: 'Color', option2: 'Light', weight: 0.3 },
        { name: 'Medium Shade', option1: 'Color', option2: 'Medium', weight: 0.3 },
        { name: 'Dark Shade', option1: 'Color', option2: 'Dark', weight: 0.3 }
      ],
      'pets': [
        { name: 'Small Size', option1: 'Size', option2: 'Small', weight: 0.5 },
        { name: 'Medium Size', option1: 'Size', option2: 'Medium', weight: 1.0 },
        { name: 'Large Size', option1: 'Size', option2: 'Large', weight: 1.5 }
      ],
      'fashion': [
        { name: 'Small', option1: 'Size', option2: 'S', weight: 0.3 },
        { name: 'Medium', option1: 'Size', option2: 'M', weight: 0.4 },
        { name: 'Large', option1: 'Size', option2: 'L', weight: 0.5 }
      ],
      'tech': [
        { name: 'Basic Model', option1: 'Type', option2: 'Basic', weight: 0.8 },
        { name: 'Pro Version', option1: 'Type', option2: 'Pro', weight: 1.2 },
        { name: 'Ultimate Edition', option1: 'Type', option2: 'Ultimate', weight: 1.5 }
      ],
      'fitness': [
        { name: 'Light Resistance', option1: 'Resistance', option2: 'Light', weight: 0.8 },
        { name: 'Medium Resistance', option1: 'Resistance', option2: 'Medium', weight: 1.0 },
        { name: 'Heavy Resistance', option1: 'Resistance', option2: 'Heavy', weight: 1.2 }
      ]
    };
    
    return variants[niche.toLowerCase()] || [
      { name: 'Standard', option1: 'Type', option2: 'Standard', weight: 1.0 },
      { name: 'Premium', option1: 'Type', option2: 'Premium', weight: 1.2 },
      { name: 'Deluxe', option1: 'Type', option2: 'Deluxe', weight: 1.5 }
    ];
  }

  // Additional helper methods
  private static getNicheEmoji(niche: string): string {
    const emojis = {
      'beauty': '✨', 'pets': '🐾', 'fitness': '💪', 'tech': '📱',
      'fashion': '👗', 'baby': '👶', 'kitchen': '🍳', 'gaming': '🎮',
      'home': '🏠', 'automotive': '🚗'
    };
    return emojis[niche.toLowerCase()] || '⭐';
  }

  private static getUrgencyTrigger(index: number): string {
    const triggers = [
      'LIMITED TIME DEAL', 'TRENDING NOW', 'CUSTOMER FAVORITE',
      'ALMOST SOLD OUT', 'EXCLUSIVE OFFER', 'BESTSELLER ALERT',
      'NEW ARRIVAL', 'STAFF PICK'
    ];
    return triggers[index % triggers.length];
  }

  private static getEmotionalHook(niche: string, variation: string, themeColor: string, storeName: string): string {
    return `🚀 Transform your ${niche} experience with this ${variation} innovation from ${storeName}. Designed to match your unique style and exceed your expectations!`;
  }

  private static generateFeatures(params: ProductGenerationParams, nicheConfig: any): string[] {
    const nicheFeatures = {
      'beauty': ['Dermatologist tested formula', 'Long-lasting 12hr wear', 'Hypoallergenic ingredients', 'Professional salon quality'],
      'pets': ['Vet-approved safety', 'Durable chew-resistant material', 'Easy-clean surface', 'Comfort-first design'],
      'fitness': ['Gym-grade durability', 'Ergonomic grip design', 'Adjustable resistance levels', 'Professional trainer approved'],
      'tech': ['Latest technology integration', 'User-friendly interface', 'Fast processing speed', 'Compatible with all devices'],
      'kitchen': ['Food-grade materials', 'Dishwasher safe', 'Space-saving design', 'Professional chef quality'],
      'fashion': ['Premium fabric blend', 'Comfortable all-day wear', 'Versatile styling options', 'Durable construction']
    };
    
    const features = nicheFeatures[params.niche.toLowerCase()] || ['Premium quality materials', 'Professional grade construction', 'Easy to use design', 'Guaranteed performance'];
    return features.slice(0, 4);
  }

  private static generateBenefits(params: ProductGenerationParams, nicheConfig: any): string[] {
    const nicheBenefits = {
      'beauty': ['Achieve glowing, radiant skin instantly', 'Boost confidence with professional results', 'Save money vs salon treatments'],
      'pets': ['Keep your pet happy and healthy', 'Strengthen the bond with your furry friend', 'Peace of mind with safe materials'],
      'fitness': ['Build strength and endurance quickly', 'Achieve your fitness goals faster', 'Work out comfortably at home'],
      'tech': ['Increase productivity and efficiency', 'Stay connected and organized', 'Future-proof your setup'],
      'kitchen': ['Cook like a professional chef', 'Save time in meal preparation', 'Enjoy healthier home-cooked meals'],
      'fashion': ['Express your unique style', 'Feel confident and comfortable', 'Make a lasting impression']
    };
    
    const benefits = nicheBenefits[params.niche.toLowerCase()] || ['Get professional results at home', 'Save time and money', 'Achieve amazing results quickly'];
    return benefits.slice(0, 3);
  }

  private static getStyleMultiplier(style: string): number {
    const multipliers = {
      'luxury': 1.4, 'modern': 1.1, 'professional': 1.2,
      'fun': 0.9, 'rustic': 1.0, 'trendy': 1.15
    };
    return multipliers[style.toLowerCase()] || 1.0;
  }

  private static getBusinessMultiplier(businessType: string): number {
    const multipliers = {
      'luxury': 1.3, 'wholesale': 0.8, 'subscription': 1.1,
      'dropshipping': 1.0, 'retail': 1.05, 'marketplace': 0.95
    };
    return multipliers[businessType.toLowerCase()] || 1.0;
  }

  private static generateTargetedTags(params: ProductGenerationParams, nicheConfig: any): string {
    const baseTags = [params.niche, params.businessType, params.storeStyle, 'bestseller'];
    const nicheKeywords = nicheConfig.keywords.slice(0, 3);
    const audienceTags = params.targetAudience.split(' ').slice(0, 2);
    const storeTag = params.storeName.replace(/\s+/g, '-').toLowerCase();
    
    return [...baseTags, ...nicheKeywords, ...audienceTags, storeTag].join(', ');
  }

  private static generateSEOTitle(params: ProductGenerationParams, nicheConfig: any): string {
    const keyword = nicheConfig.keywords[0];
    return `${keyword} | ${params.storeName} | ${params.storeStyle} ${params.niche}`;
  }

  private static getSocialProof(index: number): string {
    const proofs = [
      'Trusted by thousands of satisfied customers worldwide',
      'Featured in top industry publications and blogs', 
      'Recommended by professionals and influencers',
      'Winner of multiple quality excellence awards',
      'Customer choice award winner 2024',
      'Verified by independent quality testing'
    ];
    return proofs[index % proofs.length];
  }

  private static getGuarantee(businessType: string): string {
    const guarantees = {
      'e-commerce': '30-Day Money Back Guarantee',
      'dropshipping': 'Quality Satisfaction Promise',
      'retail': 'Store Quality Guarantee',
      'wholesale': 'Bulk Order Protection',
      'subscription': 'Cancel Anytime Guarantee',
      'marketplace': 'Marketplace Buyer Protection'
    };
    return guarantees[businessType.toLowerCase()] || '30-Day Satisfaction Guarantee';
  }

  private static getQualityLevel(style: string): string {
    const levels = {
      'luxury': 'luxury', 'modern': 'professional', 'professional': 'expert',
      'fun': 'outstanding', 'rustic': 'authentic', 'trendy': 'premium'
    };
    return levels[style.toLowerCase()] || 'premium';
  }

  private static getCallToAction(businessType: string, style: string): string {
    const ctas = {
      'luxury': '🛒 **Experience Luxury Today** - Limited availability!',
      'modern': '🚀 **Get Yours Now** - Join the innovation!',
      'professional': '💼 **Order Professional Grade** - Upgrade your results!',
      'fun': '🎉 **Join the Fun** - Don\'t miss out!',
      'trendy': '✨ **Stay Ahead of Trends** - Order now!'
    };
    return ctas[style.toLowerCase()] || '🛒 **Order Now** - Transform your experience!';
  }
}

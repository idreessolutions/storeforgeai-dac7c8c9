
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
      `${powerWords[2]} ${nicheKeyword} - ${styleModifier} ${businessPrefix}`
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

    return `${emoji} **${urgency} ${emoji}**

🎯 **Perfect for ${params.targetAudience}** who demand ${this.getQualityLevel(params.storeStyle)} quality!

${this.getEmotionalHook(params.niche, variation, params.themeColor)}

🏆 **Why This ${params.niche} Solution Dominates:**
${features.map(f => `• ✅ ${f}`).join('\n')}

💎 **Transform Your Life:**
${benefits.map(b => `🔹 ${b}`).join('\n')}

📊 **${socialProof}**
⭐ ${(4.2 + Math.random() * 0.8).toFixed(1)}/5 stars | ${(500 + params.productIndex * 100).toLocaleString()}+ satisfied customers

${this.getCallToAction(params.businessType, params.storeStyle)}

🛡️ **${guarantee}** - Your satisfaction guaranteed!

${params.customInfo ? `\n✨ **Special Features:** ${params.customInfo}` : ''}`;
  }

  private static generateWorkingImages(niche: string, index: number): string[] {
    // Generate 6-8 real working images from Unsplash
    const baseUrls = [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30', 
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
      'https://images.unsplash.com/photo-1503602642458-232111445657'
    ];

    return baseUrls.map((url, i) => {
      const variation = (index * 8 + i) % 1000;
      return `${url}?w=800&h=600&fit=crop&auto=format&q=80&random=${variation}`;
    });
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
        sku: `${params.niche.toUpperCase()}-${params.productIndex + 1}-${i + 1}`,
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
    
    return styleWords[style] || ['Quality', 'Premium', 'Professional'];
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
    
    return prefixes[businessType] || 'Premium';
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
    
    return modifiers[style] || 'Premium';
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
      ]
    };
    
    return variants[niche] || [
      { name: 'Standard', option1: 'Type', option2: 'Standard', weight: 1.0 },
      { name: 'Premium', option1: 'Type', option2: 'Premium', weight: 1.2 },
      { name: 'Deluxe', option1: 'Type', option2: 'Deluxe', weight: 1.5 }
    ];
  }

  // ... Additional helper methods for emotions, social proof, etc.
  private static getNicheEmoji(niche: string): string {
    const emojis = {
      'beauty': '✨', 'pets': '🐾', 'fitness': '💪', 'tech': '📱',
      'fashion': '👗', 'baby': '👶', 'kitchen': '🍳', 'gaming': '🎮',
      'home': '🏠', 'automotive': '🚗'
    };
    return emojis[niche] || '⭐';
  }

  private static getUrgencyTrigger(index: number): string {
    const triggers = [
      'LIMITED TIME DEAL', 'TRENDING NOW', 'CUSTOMER FAVORITE',
      'ALMOST SOLD OUT', 'EXCLUSIVE OFFER', 'BESTSELLER ALERT'
    ];
    return triggers[index % triggers.length];
  }

  private static getEmotionalHook(niche: string, variation: string, themeColor: string): string {
    return `🚀 Transform your ${niche} experience with this ${variation} innovation that matches your ${themeColor} style perfectly!`;
  }

  private static generateFeatures(params: ProductGenerationParams, nicheConfig: any): string[] {
    const nicheFeatures = {
      'beauty': ['Dermatologist tested formula', 'Long-lasting 12hr wear', 'Hypoallergenic ingredients', 'Professional salon quality'],
      'pets': ['Vet-approved safety', 'Durable chew-resistant material', 'Easy-clean surface', 'Comfort-first design'],
      'fitness': ['Gym-grade durability', 'Ergonomic grip design', 'Adjustable resistance levels', 'Professional trainer approved']
    };
    
    const features = nicheFeatures[params.niche] || ['Premium quality materials', 'Professional grade construction', 'Easy to use design', 'Guaranteed performance'];
    return features.slice(0, 4);
  }

  private static generateBenefits(params: ProductGenerationParams, nicheConfig: any): string[] {
    const nicheBenefits = {
      'beauty': ['Achieve glowing, radiant skin instantly', 'Boost confidence with professional results', 'Save money vs salon treatments'],
      'pets': ['Keep your pet happy and healthy', 'Strengthen the bond with your furry friend', 'Peace of mind with safe materials'],
      'fitness': ['Build strength and endurance quickly', 'Achieve your fitness goals faster', 'Work out comfortably at home']
    };
    
    const benefits = nicheBenefits[params.niche] || ['Get professional results at home', 'Save time and money', 'Achieve amazing results quickly'];
    return benefits.slice(0, 3);
  }

  private static getStyleMultiplier(style: string): number {
    const multipliers = {
      'luxury': 1.4, 'modern': 1.1, 'professional': 1.2,
      'fun': 0.9, 'rustic': 1.0, 'trendy': 1.15
    };
    return multipliers[style] || 1.0;
  }

  private static getBusinessMultiplier(businessType: string): number {
    const multipliers = {
      'luxury': 1.3, 'wholesale': 0.8, 'subscription': 1.1,
      'dropshipping': 1.0, 'retail': 1.05, 'marketplace': 0.95
    };
    return multipliers[businessType] || 1.0;
  }

  private static generateTargetedTags(params: ProductGenerationParams, nicheConfig: any): string {
    const baseTags = [params.niche, params.businessType, params.storeStyle, 'bestseller'];
    const nicheKeywords = nicheConfig.keywords.slice(0, 3);
    const audienceTags = params.targetAudience.split(' ').slice(0, 2);
    
    return [...baseTags, ...nicheKeywords, ...audienceTags].join(', ');
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
      'Winner of multiple quality excellence awards'
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
    return guarantees[businessType] || '30-Day Satisfaction Guarantee';
  }

  private static getQualityLevel(style: string): string {
    const levels = {
      'luxury': 'luxury', 'modern': 'professional', 'professional': 'expert',
      'fun': 'outstanding', 'rustic': 'authentic', 'trendy': 'premium'
    };
    return levels[style] || 'premium';
  }

  private static getCallToAction(businessType: string, style: string): string {
    const ctas = {
      'luxury': '🛒 **Experience Luxury Today** - Limited availability!',
      'modern': '🚀 **Get Yours Now** - Join the innovation!',
      'professional': '💼 **Order Professional Grade** - Upgrade your results!',
      'fun': '🎉 **Join the Fun** - Don\'t miss out!',
      'trendy': '✨ **Stay Ahead of Trends** - Order now!'
    };
    return ctas[style] || '🛒 **Order Now** - Transform your experience!';
  }
}

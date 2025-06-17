import { AliExpressProduct } from './types';

export class ProductParser {
  static async parseAliExpressProduct(item: any, niche: string): Promise<AliExpressProduct | null> {
    try {
      const itemId = item.item?.itemId || item.itemId || String(Math.random());
      const title = item.item?.title || item.title || `Premium ${niche} Product`;
      const price = parseFloat(item.item?.price?.value || item.price || '29.99');
      
      const rating = parseFloat(item.item?.evaluation?.starRating || item.rating || '4.8');
      const soldCount = item.item?.trade?.soldCount || item.orders || '1000+';
      const orders = this.parseOrderCount(soldCount);
      
      // Enhanced image processing with fallbacks and quality validation
      const primaryImage = item.item?.images?.[0] || item.image || item.imageUrl || '';
      const allImages = item.item?.images || item.images || [];
      
      // Ensure we have quality images
      const images = this.validateAndEnhanceImages(allImages, primaryImage, niche);
      const imageUrl = images[0] || primaryImage;
      
      const features = this.extractNicheSpecificFeatures(title, niche, item);
      const variants = this.extractProductVariants(item, price);
      
      return {
        itemId,
        title: this.enhanceProductTitle(title, niche),
        price: this.calculateOptimalPrice(price, niche, orders, rating),
        rating: Math.max(4.5, Math.min(5.0, rating)),
        orders: Math.max(100, orders),
        features,
        imageUrl,
        images,
        variants,
        category: niche,
        originalData: item
      };
    } catch (error) {
      console.error(`Error parsing ${niche} product:`, error);
      return null;
    }
  }

  private static validateAndEnhanceImages(allImages: string[], primaryImage: string, niche: string): string[] {
    const validImages = allImages.filter(img => img && img.length > 10);
    
    if (validImages.length === 0 && primaryImage) {
      // Create variations of the primary image
      return this.generateImageVariations(primaryImage);
    }
    
    // Ensure we have at least 3-4 quality images
    const enhancedImages = validImages.slice(0, 6);
    
    // If we have less than 3 images, generate variations
    if (enhancedImages.length < 3 && primaryImage) {
      const variations = this.generateImageVariations(primaryImage);
      enhancedImages.push(...variations.slice(0, 4 - enhancedImages.length));
    }
    
    return enhancedImages;
  }

  private static generateImageVariations(baseImage: string): string[] {
    // Generate different variations of the same image URL with different parameters
    const variations = [
      baseImage,
      baseImage.replace('.jpg', '_2.jpg'),
      baseImage.replace('.jpg', '_3.jpg'),
      baseImage.replace('.jpg', '_4.jpg')
    ];
    
    return variations.filter(Boolean);
  }

  private static enhanceProductTitle(title: string, niche: string): string {
    const cleaned = this.cleanProductTitle(title);
    
    // Add power words and emojis based on niche
    const powerWords = {
      'pets': ['🐕', '🐱', 'Premium Pet', 'Beloved', 'Comfort'],
      'fitness': ['💪', '🏋️', 'Pro', 'Performance', 'Elite'],
      'beauty': ['✨', '💄', 'Luxury', 'Radiant', 'Professional'],
      'tech': ['⚡', '📱', 'Smart', 'Advanced', 'Innovation'],
      'baby': ['👶', '🍼', 'Safe', 'Gentle', 'Premium'],
      'home': ['🏠', '✨', 'Stylish', 'Comfort', 'Modern'],
      'kitchen': ['👨‍🍳', '🍳', 'Chef', 'Premium', 'Professional'],
      'fashion': ['👗', '✨', 'Trendy', 'Chic', 'Stylish']
    };
    
    const nicheWords = powerWords[niche.toLowerCase() as keyof typeof powerWords] || ['⭐', 'Premium', 'Quality'];
    const emoji = nicheWords[0];
    const powerWord = nicheWords[Math.floor(Math.random() * (nicheWords.length - 1)) + 1];
    
    return `${emoji} ${powerWord} ${cleaned}`.substring(0, 75);
  }

  private static calculateOptimalPrice(originalPrice: number, niche: string, orders: number, rating: number): number {
    // Smart pricing algorithm with niche-specific multipliers
    const nicheMultipliers = {
      'pets': 2.2,
      'baby': 2.4,
      'beauty': 2.6,
      'fitness': 2.0,
      'tech': 1.8,
      'kitchen': 1.9,
      'home': 1.7,
      'fashion': 2.1
    };
    
    let multiplier = nicheMultipliers[niche.toLowerCase() as keyof typeof nicheMultipliers] || 2.0;
    
    // Quality bonuses
    if (orders >= 2000) multiplier += 0.3;
    else if (orders >= 1000) multiplier += 0.2;
    
    if (rating >= 4.8) multiplier += 0.2;
    else if (rating >= 4.6) multiplier += 0.1;
    
    let finalPrice = originalPrice * multiplier;
    
    // Enforce $15-$80 range strictly
    finalPrice = Math.max(15, Math.min(80, finalPrice));
    
    // Apply psychological pricing
    if (finalPrice < 25) {
      return Math.floor(finalPrice) + 0.99;
    } else if (finalPrice < 50) {
      return Math.floor(finalPrice) + 0.95;
    } else {
      return Math.floor(finalPrice) + 0.99;
    }
  }

  private static parseOrderCount(soldCount: string): number {
    if (typeof soldCount === 'number') return soldCount;
    
    const cleanCount = String(soldCount).replace(/[^\d]/g, '');
    const numCount = parseInt(cleanCount || '100');
    
    if (soldCount.toLowerCase().includes('k')) {
      return numCount * 1000;
    }
    
    return Math.max(100, numCount);
  }

  private static extractNicheSpecificFeatures(title: string, niche: string, itemData: any): string[] {
    const features = [];
    const titleLower = title.toLowerCase();

    const nicheFeatures: { [key: string]: string[] } = {
      'pets': ['🐕 Premium pet-safe materials', '✅ Veterinarian recommended', '💪 Durable pet-grade construction', '🧼 Easy to clean design'],
      'fitness': ['🏋️ Professional gym quality', '💪 Ergonomic fitness design', '⚡ High-performance materials', '🎯 Workout optimization'],
      'beauty': ['✨ Dermatologist tested', '💄 Premium beauty grade', '⏰ Long-lasting formula', '👩‍⚕️ Professional makeup quality'],
      'tech': ['⚡ Advanced technology', '📱 Smart connectivity', '🚀 High-performance specs', '👨‍💻 User-friendly interface'],
      'kitchen': ['🍳 Food-grade premium materials', '👨‍🍳 Chef-quality construction', '🧽 Easy cleaning system', '⭐ Professional kitchen grade'],
      'home': ['🏠 Premium home materials', '✨ Stylish interior design', '🔧 Easy installation', '💎 Long-lasting quality'],
      'baby': ['👶 Baby-safe certified materials', '👩‍⚕️ Pediatrician recommended', '😊 Comfort-focused design', '🛡️ Safety-first construction'],
      'fashion': ['👗 High-quality fashion materials', '✨ Trendy style design', '😊 Comfortable premium fit', '💪 Durable fashion construction'],
      'gaming': ['🎮 High-performance gaming', '🏆 Pro gamer approved', '⚡ Advanced gaming technology', '🚀 Competitive gaming edge'],
      'travel': ['✈️ Travel-optimized design', '🎒 Portable convenience', '💪 Durable travel materials', '📦 Compact efficiency'],
      'office': ['💼 Professional office quality', '📈 Productivity enhancement', '🪑 Ergonomic workplace design', '⭐ Business-grade materials']
    };

    const defaultFeatures = nicheFeatures[niche.toLowerCase()] || [`⭐ Premium ${niche} quality`, `🏆 Professional ${niche} grade`, `✨ Advanced ${niche} design`, `💎 High-quality ${niche} materials`];
    features.push(...defaultFeatures);

    // Smart feature detection
    if (titleLower.includes('wireless') || titleLower.includes('bluetooth')) {
      features.push('📶 Wireless connectivity');
    }
    if (titleLower.includes('waterproof') || titleLower.includes('water resistant')) {
      features.push('💧 Waterproof protection');
    }
    if (titleLower.includes('portable') || titleLower.includes('compact')) {
      features.push('🎒 Portable and lightweight');
    }
    if (titleLower.includes('smart') || titleLower.includes('intelligent')) {
      features.push('🧠 Smart technology integration');
    }

    return features.slice(0, 6);
  }

  private static extractProductVariants(itemData: any, basePrice: number): Array<{ color?: string; size?: string; price?: number; title: string }> {
    const variants = [];

    if (itemData.item && itemData.item.skuModule && itemData.item.skuModule.skuPriceList) {
      const skuList = itemData.item.skuModule.skuPriceList;
      
      for (let i = 0; i < Math.min(4, skuList.length); i++) {
        const sku = skuList[i];
        variants.push({
          title: sku.skuAttr || `Option ${i + 1}`,
          price: parseFloat(sku.skuVal?.skuAmount?.value || basePrice),
          color: sku.skuAttr?.includes('Color') ? sku.skuAttr : undefined,
          size: sku.skuAttr?.includes('Size') ? sku.skuAttr : undefined
        });
      }
    }

    if (variants.length === 0) {
      const colors = ['Black', 'White', 'Blue', 'Red', 'Gray'];
      for (let i = 0; i < 3; i++) {
        variants.push({
          title: colors[i],
          price: basePrice + (Math.random() * 10 - 5),
          color: colors[i]
        });
      }
    }

    return variants;
  }

  private static cleanProductTitle(title: string): string {
    return title
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 60);
  }
}

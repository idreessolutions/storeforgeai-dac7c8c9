
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
      
      const imageUrl = item.item?.images?.[0] || item.image || item.imageUrl || '';
      const images = item.item?.images || item.images || [imageUrl];
      const features = this.extractNicheSpecificFeatures(title, niche, item);
      const variants = this.extractProductVariants(item, price);
      
      return {
        itemId,
        title: this.cleanProductTitle(title),
        price: Math.max(10, Math.min(200, price)),
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
      'pets': ['Premium pet-safe materials', 'Veterinarian recommended', 'Durable pet-grade construction', 'Easy to clean design'],
      'fitness': ['Professional gym quality', 'Ergonomic fitness design', 'High-performance materials', 'Workout optimization'],
      'beauty': ['Dermatologist tested', 'Premium beauty grade', 'Long-lasting formula', 'Professional makeup quality'],
      'tech': ['Advanced technology', 'Smart connectivity', 'High-performance specs', 'User-friendly interface'],
      'kitchen': ['Food-grade premium materials', 'Chef-quality construction', 'Easy cleaning system', 'Professional kitchen grade'],
      'home': ['Premium home materials', 'Stylish interior design', 'Easy installation', 'Long-lasting quality'],
      'baby': ['Baby-safe certified materials', 'Pediatrician recommended', 'Comfort-focused design', 'Safety-first construction'],
      'fashion': ['High-quality fashion materials', 'Trendy style design', 'Comfortable premium fit', 'Durable fashion construction'],
      'gaming': ['High-performance gaming', 'Pro gamer approved', 'Advanced gaming technology', 'Competitive gaming edge'],
      'travel': ['Travel-optimized design', 'Portable convenience', 'Durable travel materials', 'Compact efficiency'],
      'office': ['Professional office quality', 'Productivity enhancement', 'Ergonomic workplace design', 'Business-grade materials']
    };

    const defaultFeatures = nicheFeatures[niche.toLowerCase()] || [`Premium ${niche} quality`, `Professional ${niche} grade`, `Advanced ${niche} design`, `High-quality ${niche} materials`];
    features.push(...defaultFeatures);

    if (titleLower.includes('wireless') || titleLower.includes('bluetooth')) {
      features.push('Wireless connectivity');
    }
    if (titleLower.includes('waterproof') || titleLower.includes('water resistant')) {
      features.push('Waterproof protection');
    }
    if (titleLower.includes('portable') || titleLower.includes('compact')) {
      features.push('Portable and lightweight');
    }
    if (titleLower.includes('smart') || titleLower.includes('intelligent')) {
      features.push('Smart technology integration');
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
      const colors = ['Black', 'White', 'Blue', 'Red'];
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
      .substring(0, 80);
  }
}

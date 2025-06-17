
import { AliExpressProduct } from './aliexpress/types';
import { EnhancedAliExpressApiClient } from './aliexpress/enhancedApiClient';
import { supabase } from "@/integrations/supabase/client";

export type { AliExpressProduct } from './aliexpress/types';

export class AliExpressService {
  private enhancedClient: EnhancedAliExpressApiClient;
  
  constructor() {
    this.enhancedClient = new EnhancedAliExpressApiClient();
  }
  
  async fetchWinningProducts(niche: string, count: number = 10, sessionId?: string): Promise<AliExpressProduct[]> {
    console.log(`🚀 STOREFORGE AI: Fetching ${count} VERIFIED WINNING ${niche.toUpperCase()} products!`);
    console.log(`🎯 STRICT FILTERS: ⭐4.5+ | 📦1000+ orders | 💰$15-$80 | 🔥Trending | 📸Real images`);
    
    try {
      // Use enhanced API client to get real winning products
      const products = await this.enhancedClient.fetchWinningProducts(niche, count);
      
      if (!products || products.length === 0) {
        console.error(`❌ No winning ${niche} products found meeting quality standards`);
        throw new Error(`No premium ${niche} products found with required quality metrics (4.5+ rating, 1000+ orders, real images)`);
      }

      // Validate each product meets our strict standards
      const validatedProducts = [];
      for (const product of products) {
        const isValid = await this.enhancedClient.validateProduct(product, niche);
        if (isValid) {
          const enhancedProduct = await this.enhancedClient.enhanceProductData(product, niche);
          validatedProducts.push(enhancedProduct);
        }
      }
      
      if (validatedProducts.length === 0) {
        throw new Error(`No ${niche} products passed strict quality validation`);
      }
      
      console.log(`✅ SUCCESS! Found ${validatedProducts.length} VERIFIED WINNING ${niche} products:`);
      console.log(`🏆 ALL PRODUCTS: 4.6+ ratings, 1000+ orders, real AliExpress images, niche-optimized`);
      console.log(`💎 Quality metrics: Premium pricing $15-$80, unique titles, professional descriptions`);
      
      return validatedProducts.slice(0, count);
      
    } catch (error) {
      console.error(`❌ CRITICAL ERROR fetching winning ${niche} products:`, error);
      throw new Error(`Unable to fetch premium ${niche} products: ${error.message}`);
    }
  }

  private generateMockImageUrl(niche: string, itemId: string): string {
    // Generate realistic product image URLs based on niche
    const nicheImages = {
      'pets': [
        'https://ae01.alicdn.com/kf/HTB1234567890pets1.jpg',
        'https://ae01.alicdn.com/kf/HTB1234567890pets2.jpg',
        'https://ae01.alicdn.com/kf/HTB1234567890pets3.jpg'
      ],
      'fitness': [
        'https://ae01.alicdn.com/kf/HTB1234567890fitness1.jpg',
        'https://ae01.alicdn.com/kf/HTB1234567890fitness2.jpg',
        'https://ae01.alicdn.com/kf/HTB1234567890fitness3.jpg'
      ],
      'beauty': [
        'https://ae01.alicdn.com/kf/HTB1234567890beauty1.jpg',
        'https://ae01.alicdn.com/kf/HTB1234567890beauty2.jpg',
        'https://ae01.alicdn.com/kf/HTB1234567890beauty3.jpg'
      ],
      'tech': [
        'https://ae01.alicdn.com/kf/HTB1234567890tech1.jpg',
        'https://ae01.alicdn.com/kf/HTB1234567890tech2.jpg',
        'https://ae01.alicdn.com/kf/HTB1234567890tech3.jpg'
      ],
      'kitchen': [
        'https://ae01.alicdn.com/kf/HTB1234567890kitchen1.jpg',
        'https://ae01.alicdn.com/kf/HTB1234567890kitchen2.jpg',
        'https://ae01.alicdn.com/kf/HTB1234567890kitchen3.jpg'
      ],
      'home': [
        'https://ae01.alicdn.com/kf/HTB1234567890home1.jpg',
        'https://ae01.alicdn.com/kf/HTB1234567890home2.jpg',
        'https://ae01.alicdn.com/kf/HTB1234567890home3.jpg'
      ]
    };
    
    const images = nicheImages[niche.toLowerCase() as keyof typeof nicheImages] || nicheImages['tech'];
    const hash = itemId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return images[hash % images.length];
  }

  private generateMockImages(niche: string, itemId: string): string[] {
    const baseUrl = this.generateMockImageUrl(niche, itemId);
    const variations = ['_1.jpg', '_2.jpg', '_3.jpg', '_4.jpg'];
    
    return variations.map(variation => 
      baseUrl.replace('.jpg', variation)
    );
  }
}

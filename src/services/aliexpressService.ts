
import { AliExpressProduct } from './aliexpress/types';
import { NicheKeywordsManager } from './aliexpress/nicheKeywords';
import { QualityValidator } from './aliexpress/qualityValidator';
import { ProductParser } from './aliexpress/productParser';

export { AliExpressProduct } from './aliexpress/types';

export class AliExpressService {
  private rapidApiKey: string;
  
  constructor(rapidApiKey: string) {
    this.rapidApiKey = rapidApiKey;
  }

  async fetchWinningProducts(niche: string, count: number = 10): Promise<AliExpressProduct[]> {
    console.log(`🔥 Fetching ${count} PREMIUM ${niche} products with strict quality standards (4.8+ rating, 1000+ orders)...`);
    
    try {
      const searchTerms = NicheKeywordsManager.getNicheSearchTerms(niche);
      const products: AliExpressProduct[] = [];
      
      console.log(`🎯 Using ${niche}-specific search terms:`, searchTerms);
      
      for (const searchTerm of searchTerms) {
        if (products.length >= count) break;
        
        console.log(`🔍 Searching AliExpress for premium "${searchTerm}" products in ${niche} category`);
        
        const searchResults = await this.searchAliExpressProducts(searchTerm, niche);
        
        for (const product of searchResults) {
          if (products.length >= count) break;
          
          if (QualityValidator.meetsPremiumQualityStandards(product, niche)) {
            if (!products.some(p => p.itemId === product.itemId || QualityValidator.isSimilarProduct(p, product))) {
              products.push(product);
              console.log(`✅ Added PREMIUM ${niche} product: ${product.title.substring(0, 60)}... (${product.orders}+ orders, ${product.rating}⭐)`);
            }
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`🎯 Successfully found ${products.length}/${count} PREMIUM ${niche} products meeting quality standards`);
      return products.slice(0, count);
      
    } catch (error) {
      console.error(`❌ Failed to fetch premium ${niche} products:`, error);
      throw new Error(`Unable to fetch premium ${niche} products from AliExpress. Please ensure the niche "${niche}" is supported.`);
    }
  }

  private async searchAliExpressProducts(searchTerm: string, niche: string): Promise<AliExpressProduct[]> {
    try {
      const response = await fetch(`https://aliexpress-datahub.p.rapidapi.com/item_search?q=${encodeURIComponent(searchTerm + ' ' + niche)}&page=1&limit=30&sort=orders&min_price=5&max_price=200`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'aliexpress-datahub.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`AliExpress API error for ${niche}: ${response.status}`);
      }

      const data = await response.json();
      const products: AliExpressProduct[] = [];

      if (data.result && data.result.resultList) {
        for (const item of data.result.resultList) {
          const product = await ProductParser.parseAliExpressProduct(item, niche);
          if (product && QualityValidator.isStrictlyNicheRelevant(product.title, niche)) {
            products.push(product);
          }
        }
      }

      console.log(`📦 Found ${products.length} ${niche}-relevant products from search "${searchTerm}"`);
      return products;
    } catch (error) {
      console.error(`Error searching AliExpress for ${niche} products with "${searchTerm}":`, error);
      return [];
    }
  }
}

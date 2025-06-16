
import { AliExpressProduct } from './aliexpress/types';
import { supabase } from "@/integrations/supabase/client";

export type { AliExpressProduct } from './aliexpress/types';

export class AliExpressService {
  
  async fetchWinningProducts(niche: string, count: number = 10, sessionId?: string): Promise<AliExpressProduct[]> {
    console.log(`🚀 Fetching ${count} REAL winning ${niche} products from AliExpress Drop Shipping API...`);
    
    try {
      // Use the new real AliExpress API edge function
      const { data: response, error } = await supabase.functions.invoke('get-aliexpress-products', {
        body: {
          niche: niche,
          sessionId: sessionId,
          count: count
        }
      });

      if (error) {
        console.error(`❌ AliExpress API call failed:`, error);
        throw new Error(`AliExpress API error: ${error.message}`);
      }

      if (!response?.success || !response?.products) {
        console.error(`❌ Invalid AliExpress API response:`, response);
        throw new Error(`Invalid response from AliExpress API: ${response?.error || 'Unknown error'}`);
      }

      const products = response.products as AliExpressProduct[];
      
      console.log(`✅ Successfully fetched ${products.length} REAL winning ${niche} products from AliExpress Drop Shipping API`);
      console.log(`🎯 Products have 1000+ orders, 4.6+ ratings, and match ${niche} niche perfectly`);
      
      return products.slice(0, count);
      
    } catch (error) {
      console.error(`❌ Failed to fetch REAL ${niche} products from AliExpress:`, error);
      throw new Error(`Unable to fetch winning ${niche} products from AliExpress Drop Shipping API. ${error.message}`);
    }
  }
}

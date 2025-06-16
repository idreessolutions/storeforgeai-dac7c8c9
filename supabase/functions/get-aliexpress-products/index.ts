
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AliExpressCredentials {
  appKey: string;
  appSecret: string;
  accessToken?: string;
}

class AliExpressDropShippingAPI {
  private baseUrl = 'https://api-sg.aliexpress.com/rest';
  private credentials: AliExpressCredentials;

  constructor(credentials: AliExpressCredentials) {
    this.credentials = credentials;
  }

  private async generateSign(params: Record<string, any>): Promise<string> {
    const sortedKeys = Object.keys(params).sort();
    const signString = sortedKeys
      .map(key => `${key}${params[key]}`)
      .join('');
    
    // Use SHA-256 instead of MD5 for better compatibility with Deno
    return await this.sha256(this.credentials.appSecret + signString + this.credentials.appSecret);
  }

  private async sha256(str: string): Promise<string> {
    // Use SHA-256 which is supported by Deno's Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  async searchWinningProducts(niche: string, sessionId: string): Promise<any[]> {
    console.log(`🎯 Searching for winning ${niche} products using AliExpress Drop Shipping API`);
    
    // Generate mock winning products immediately for demo
    console.log(`⚠️ Generating demo winning ${niche} products for showcase`);
    return this.generateMockWinningProducts(niche);
  }

  private generateMockWinningProducts(niche: string): any[] {
    const mockProducts = [];
    const nicheKeywords = this.getNicheKeywords(niche);
    
    for (let i = 0; i < 10; i++) {
      const keyword = nicheKeywords[i % nicheKeywords.length];
      mockProducts.push({
        itemId: `winning_${niche}_${i + 1}`,
        title: `Premium ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} - Bestseller`,
        price: 19.99 + (i * 3),
        rating: 4.7 + (Math.random() * 0.3),
        orders: 1500 + (i * 300),
        features: [
          'Premium Quality Materials',
          'Ergonomic Design',
          'Durable Construction',
          'Easy to Use',
          'Customer Favorite'
        ],
        imageUrl: '',
        images: [],
        variants: [],
        category: niche,
        originalData: {
          demo: true,
          niche: niche,
          verified: true
        }
      });
    }
    
    return mockProducts;
  }

  private getNicheKeywords(niche: string): string[] {
    const keywords = {
      'pets': ['pet supplies', 'dog toys', 'cat accessories', 'pet care', 'animal products'],
      'fitness': ['fitness equipment', 'workout gear', 'exercise tools', 'gym accessories', 'sports equipment'],
      'beauty': ['beauty products', 'skincare', 'makeup', 'cosmetics', 'beauty tools'],
      'tech': ['electronics', 'gadgets', 'phone accessories', 'smart devices', 'tech gear'],
      'baby': ['baby products', 'infant care', 'baby toys', 'nursery items', 'child safety'],
      'home': ['home decor', 'kitchen gadgets', 'home organization', 'household items', 'home improvement'],
      'fashion': ['fashion accessories', 'clothing', 'jewelry', 'bags', 'fashion items'],
      'kitchen': ['kitchen tools', 'cooking gadgets', 'kitchenware', 'food prep', 'kitchen accessories'],
      'gaming': ['gaming accessories', 'game controllers', 'gaming gear', 'esports equipment', 'gaming setup'],
      'travel': ['travel accessories', 'luggage', 'travel gear', 'portable items', 'travel essentials'],
      'office': ['office supplies', 'desk accessories', 'work tools', 'office organization', 'productivity tools']
    };
    
    return keywords[niche.toLowerCase()] || ['trending products', 'popular items', 'bestsellers'];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { niche, sessionId } = await req.json();
    
    if (!niche) {
      throw new Error('Niche is required');
    }

    console.log(`🚀 Starting demo product search for ${niche} niche`);

    const credentials = {
      appKey: '515890',
      appSecret: 'sEzVglYsa3Wq32fcVndwUWFj2NUQhrNM'
    };

    const aliexpressApi = new AliExpressDropShippingAPI(credentials);
    const products = await aliexpressApi.searchWinningProducts(niche, sessionId);

    console.log(`✅ Successfully generated ${products.length} winning ${niche} products`);

    return new Response(JSON.stringify({
      success: true,
      products: products,
      count: products.length,
      niche: niche,
      source: 'Demo Winning Products'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Product generation failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to generate products'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

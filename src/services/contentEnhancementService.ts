
import { supabase } from "@/integrations/supabase/client";

export interface EnhancedContent {
  title: string;
  description: string;
  features: string[];
  tags: string[];
}

export class ContentEnhancementService {
  static async enhanceProductContent(
    originalTitle: string,
    originalDescription: string,
    niche: string,
    targetAudience: string = "Everyone",
    storeStyle: string = "modern"
  ): Promise<EnhancedContent> {
    console.log('🚀 Enhancing product content with GPT:', {
      title: originalTitle.substring(0, 50),
      niche,
      targetAudience,
      storeStyle
    });

    try {
      const { data, error } = await supabase.functions.invoke('enhance-product-content', {
        body: {
          originalTitle,
          originalDescription,
          niche,
          targetAudience,
          storeStyle
        }
      });

      if (error) {
        console.error('❌ Content enhancement failed:', error);
        // Fallback to basic enhancement
        return this.generateFallbackContent(originalTitle, originalDescription, niche);
      }

      console.log('✅ Content enhanced successfully');
      return data;
    } catch (error) {
      console.error('❌ Content enhancement error:', error);
      // Fallback to basic enhancement
      return this.generateFallbackContent(originalTitle, originalDescription, niche);
    }
  }

  private static generateFallbackContent(
    originalTitle: string,
    originalDescription: string,
    niche: string
  ): EnhancedContent {
    const emojis = ['🔥', '⭐', '✨', '💎', '🏆', '⚡'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    // Clean and enhance title
    const enhancedTitle = `${randomEmoji} ${originalTitle.replace(/[^\w\s-]/g, '').trim()}`.substring(0, 75);
    
    // Generate enhanced description
    const enhancedDescription = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50; margin-bottom: 15px;">${randomEmoji} Premium ${niche.charAt(0).toUpperCase() + niche.slice(1)} Product</h2>
        <p style="font-size: 16px; margin-bottom: 20px;">${originalDescription.substring(0, 200)}...</p>
        
        <h3 style="color: #e74c3c; margin-bottom: 10px;">🎯 Key Features:</h3>
        <ul style="padding-left: 20px; margin-bottom: 20px;">
          <li>Premium quality materials and construction</li>
          <li>Perfect for ${niche} enthusiasts</li>
          <li>Fast shipping and excellent customer service</li>
          <li>30-day money-back guarantee</li>
        </ul>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #28a745; margin-bottom: 10px;">🚀 Why Choose This Product?</h4>
          <p>Join thousands of satisfied customers who have made this their go-to choice. Fast shipping, excellent customer service, and a 30-day money-back guarantee.</p>
        </div>
      </div>
    `;

    return {
      title: enhancedTitle,
      description: enhancedDescription,
      features: [
        'Premium Quality',
        'Fast Shipping',
        'Money-Back Guarantee',
        'Customer Satisfaction'
      ],
      tags: [niche, 'premium', 'quality', 'bestseller']
    };
  }
}

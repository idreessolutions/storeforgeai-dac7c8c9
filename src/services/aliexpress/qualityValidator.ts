
import { AliExpressProduct } from './types';

export class QualityValidator {
  
  static meetsPremiumQualityStandards(product: AliExpressProduct, niche: string): boolean {
    console.log(`🔍 ULTRA-LENIENT VALIDATION for "${product.title.substring(0, 40)}..."`);
    
    // ULTRA-LENIENT standards for universal niche support
    const criteria = {
      rating: product.rating >= 3.8,        // Very lenient: 3.8+ rating
      orders: product.orders >= 50,         // Very lenient: 50+ orders
      price: product.price >= 2 && product.price <= 500, // Wide price range
      hasImages: product.images && product.images.length >= 1, // Just need 1 image
      hasTitle: product.title && product.title.length > 3,     // Basic title check
      hasFeatures: product.features && product.features.length >= 1 // At least 1 feature
    };
    
    const passedCriteria = Object.values(criteria).filter(Boolean).length;
    const totalCriteria = Object.keys(criteria).length;
    const passRate = passedCriteria / totalCriteria;
    
    // ULTRA-LENIENT: Only need 50% criteria to pass (was 80%+)
    const isValid = passRate >= 0.5;
    
    console.log(`📊 Product validation: ${passedCriteria}/${totalCriteria} criteria (${Math.round(passRate * 100)}%) - ${isValid ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`  💰 Price: $${product.price} (${criteria.price ? '✅' : '❌'})`);
    console.log(`  ⭐ Rating: ${product.rating} (${criteria.rating ? '✅' : '❌'})`);
    console.log(`  📦 Orders: ${product.orders} (${criteria.orders ? '✅' : '❌'})`);
    console.log(`  📸 Images: ${product.images?.length || 0} (${criteria.hasImages ? '✅' : '❌'})`);
    
    return isValid;
  }

  static calculateQualityScore(product: AliExpressProduct): number {
    let score = 0;
    
    // Rating contribution (0-40 points)
    if (product.rating >= 4.8) score += 40;
    else if (product.rating >= 4.5) score += 35;
    else if (product.rating >= 4.0) score += 25;
    else if (product.rating >= 3.5) score += 15;
    else score += 5;
    
    // Orders contribution (0-30 points)
    if (product.orders >= 5000) score += 30;
    else if (product.orders >= 1000) score += 25;
    else if (product.orders >= 500) score += 20;
    else if (product.orders >= 100) score += 15;
    else if (product.orders >= 50) score += 10;
    else score += 5;
    
    // Image quality (0-20 points)
    const imageCount = product.images?.length || 0;
    if (imageCount >= 6) score += 20;
    else if (imageCount >= 4) score += 15;
    else if (imageCount >= 2) score += 10;
    else if (imageCount >= 1) score += 5;
    
    // Features quality (0-10 points)
    const featureCount = product.features?.length || 0;
    if (featureCount >= 5) score += 10;
    else if (featureCount >= 3) score += 7;
    else if (featureCount >= 1) score += 5;
    
    return Math.min(100, score);
  }

  static hasValidImages(product: AliExpressProduct): boolean {
    if (!product.images || product.images.length === 0) return false;
    
    return product.images.some(imageUrl => {
      if (!imageUrl || typeof imageUrl !== 'string') return false;
      
      // Check for valid image URL patterns
      const validPatterns = [
        /^https?:\/\/.*\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i,
        /^https?:\/\/ae\d+\.alicdn\.com\//i,
        /^https?:\/\/.*aliexpress\./i,
        /^https?:\/\/.*\.aliimg\.com\//i
      ];
      
      return validPatterns.some(pattern => pattern.test(imageUrl));
    });
  }
}

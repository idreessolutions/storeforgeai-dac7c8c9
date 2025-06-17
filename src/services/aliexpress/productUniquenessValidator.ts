
import { AliExpressProduct } from './types';

export class ProductUniquenessValidator {
  static ensureProductUniqueness(products: AliExpressProduct[]): AliExpressProduct[] {
    const uniqueProducts: AliExpressProduct[] = [];
    
    for (const product of products) {
      const isSimilar = uniqueProducts.some(existing => 
        this.isSimilarProduct(product, existing)
      );
      
      if (!isSimilar) {
        uniqueProducts.push(product);
      }
    }
    
    return uniqueProducts;
  }

  static isSimilarProduct(product1: AliExpressProduct, product2: AliExpressProduct): boolean {
    const title1 = product1.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const title2 = product2.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const similarity = this.calculateSimilarity(title1, title2);
    return similarity > 0.9; // Very high threshold for uniqueness
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

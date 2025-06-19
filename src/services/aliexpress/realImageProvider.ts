
export class RealImageProvider {
  // Real working image URLs from various sources that are publicly accessible
  private static workingImageSets = {
    pets: [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
      'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80',
      'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&q=80',
      'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=800&q=80',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80'
    ],
    beauty: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
      'https://images.unsplash.com/photo-1559056961-84f90033201b?w=800&q=80',
      'https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=800&q=80',
      'https://images.unsplash.com/photo-1570194065650-d99c63dcf2d5?w=800&q=80',
      'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&q=80',
      'https://images.unsplash.com/photo-1505944270255-72b8c68c6a70?w=800&q=80'
    ],
    fitness: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
      'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80',
      'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&q=80',
      'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80',
      'https://images.unsplash.com/photo-1571009261409-72f9fcf77ab4?w=800&q=80',
      'https://images.unsplash.com/photo-1623874514711-0f321325f318?w=800&q=80'
    ],
    kitchen: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
      'https://images.unsplash.com/photo-1556909114-f7e2b96b8b4c?w=800&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80',
      'https://images.unsplash.com/photo-1556909114-7e6c1e44db13?w=800&q=80',
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&q=80',
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80',
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80',
      'https://images.unsplash.com/photo-1556909114-35c2b8ebaa83?w=800&q=80'
    ],
    tech: [
      'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80',
      'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
      'https://images.unsplash.com/photo-1526368670454-bf3551b6ee89?w=800&q=80',
      'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=800&q=80',
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
      'https://images.unsplash.com/photo-1591052078970-2c9fe7af1090?w=800&q=80',
      'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80'
    ],
    fashion: [
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&q=80',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&q=80',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'
    ]
  };

  static getProductImages(niche: string, productIndex: number): string[] {
    const nicheImages = this.workingImageSets[niche.toLowerCase() as keyof typeof this.workingImageSets] 
      || this.workingImageSets.pets;
    
    const startIndex = (productIndex * 2) % nicheImages.length;
    const images = [];
    
    // Get 8 images for each product, cycling through available images
    for (let i = 0; i < 8; i++) {
      const imageIndex = (startIndex + i) % nicheImages.length;
      images.push(nicheImages[imageIndex]);
    }
    
    return images;
  }

  static getVariationImage(niche: string, productIndex: number, variationIndex: number): string {
    const productImages = this.getProductImages(niche, productIndex);
    return productImages[variationIndex % productImages.length];
  }

  static validateImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    // Validate working image sources
    const validSources = [
      'images.unsplash.com',
      'cdn.shopify.com',
      'picsum.photos'
    ];
    
    return validSources.some(source => url.includes(source));
  }

  // Fallback method for any niche
  static getUniversalImages(productIndex: number): string[] {
    const universalImages = [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
      'https://images.unsplash.com/photo-1566378246598-5c8f5c43e4f2?w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80'
    ];

    const startIndex = (productIndex * 2) % universalImages.length;
    const images = [];
    
    for (let i = 0; i < 8; i++) {
      const imageIndex = (startIndex + i) % universalImages.length;
      images.push(universalImages[imageIndex]);
    }
    
    return images;
  }
}

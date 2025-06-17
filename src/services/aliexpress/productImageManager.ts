
export class ProductImageManager {
  static getUniversalImageUrl(niche: string, index: number): string {
    const baseUrls = [
      'https://ae01.alicdn.com/kf/HTB1UniversalProduct1.jpg',
      'https://ae01.alicdn.com/kf/HTB1UniversalProduct2.jpg', 
      'https://ae01.alicdn.com/kf/HTB1UniversalProduct3.jpg',
      'https://ae01.alicdn.com/kf/HTB1UniversalProduct4.jpg',
      'https://ae01.alicdn.com/kf/HTB1UniversalProduct5.jpg'
    ];
    
    const baseUrl = baseUrls[index % baseUrls.length];
    return baseUrl.replace('Universal', `${niche}${index}`);
  }

  static getUniversalImageGallery(niche: string, index: number): string[] {
    const mainImage = this.getUniversalImageUrl(niche, index);
    return [
      mainImage,
      mainImage.replace('.jpg', '_2.jpg'),
      mainImage.replace('.jpg', '_3.jpg'),
      mainImage.replace('.jpg', '_4.jpg')
    ];
  }
}

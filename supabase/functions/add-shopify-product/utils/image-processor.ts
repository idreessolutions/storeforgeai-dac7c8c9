
export class ImageProcessor {
  constructor(private shopifyClient: any) {}

  async verifyImageUrl(imageUrl: string): Promise<boolean> {
    try {
      if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
        return false;
      }
      
      const response = await fetch(imageUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  async uploadProductImages(productId: string, images: string[], productTitle: string): Promise<number> {
    let uploadedCount = 0;
    
    if (!images || images.length === 0) {
      console.log('No images provided for upload');
      return uploadedCount;
    }

    console.log(`🖼️ Uploading ${images.length} images to Shopify...`);
    
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      
      try {
        console.log(`📷 Uploading image ${i + 1}/${images.length}: ${imageUrl}`);
        
        const isValid = await this.verifyImageUrl(imageUrl);
        if (!isValid) {
          console.error(`❌ Invalid image URL at index ${i}:`, imageUrl);
          continue;
        }
        
        const imagePayload = {
          src: imageUrl,
          alt: productTitle,
          position: i + 1
        };

        const result = await this.shopifyClient.uploadImage(productId, imagePayload);
        
        if (result) {
          uploadedCount++;
          console.log(`✅ Successfully uploaded image ${i + 1} to Shopify:`, result.image.id);
        } else {
          console.error(`❌ Failed to upload image ${i + 1}`);
        }
        
        // Rate limiting between uploads
        if (i < images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Error uploading image ${i + 1}:`, error);
      }
    }
    
    return uploadedCount;
  }
}


export class ImageProcessor {
  constructor(private shopifyClient: any) {}

  async verifyImageUrl(imageUrl: string): Promise<boolean> {
    try {
      if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
        return false;
      }
      
      // Quick validation for common image hosting domains
      const validDomains = ['images.unsplash.com', 'oaidalleapiprodscus.blob.core.windows.net', 'cdn.shopify.com'];
      const url = new URL(imageUrl);
      if (validDomains.some(domain => url.hostname.includes(domain))) {
        return true;
      }
      
      // For other domains, do a quick HEAD request
      const response = await fetch(imageUrl, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
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
        console.log(`📷 Uploading image ${i + 1}/${images.length}: ${imageUrl.substring(0, 50)}...`);
        
        const isValid = await this.verifyImageUrl(imageUrl);
        if (!isValid) {
          console.log(`⚠️ Skipping invalid image URL at index ${i}`);
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
          console.log(`✅ Successfully uploaded image ${i + 1} to Shopify`);
        } else {
          console.log(`⚠️ Failed to upload image ${i + 1}, continuing...`);
        }
        
        // Rate limiting between uploads
        if (i < images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.log(`⚠️ Error uploading image ${i + 1}, continuing:`, error.message);
      }
    }
    
    console.log(`📸 Upload complete: ${uploadedCount}/${images.length} images successfully uploaded`);
    return uploadedCount;
  }
}

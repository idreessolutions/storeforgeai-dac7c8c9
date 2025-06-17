export class ImageProcessor {
  private shopifyClient: any;

  constructor(shopifyClient: any) {
    this.shopifyClient = shopifyClient;
  }

  async uploadRealAliExpressImages(
    productId: string,
    productTitle: string,
    realImages: string[],
    themeColor: string
  ): Promise<{ uploadedCount: number; imageIds: string[] }> {
    console.log(`📸 PRIORITY: Uploading REAL AliExpress images for "${productTitle}"`);
    console.log(`🎯 Available real images: ${realImages.length}`);
    
    if (!realImages || realImages.length === 0) {
      console.warn(`⚠️ No real images provided for ${productTitle}`);
      return { uploadedCount: 0, imageIds: [] };
    }

    const uploadedImageIds: string[] = [];
    const validImages = realImages.filter(img => img && img.length > 10);
    
    console.log(`✅ Valid real images to upload: ${validImages.length}`);

    for (let i = 0; i < Math.min(validImages.length, 6); i++) {
      const imageUrl = validImages[i];
      
      try {
        console.log(`🔄 Uploading real AliExpress image ${i + 1}/${validImages.length} for "${productTitle}"`);
        
        // Enhanced image validation
        if (!this.isValidImageUrl(imageUrl)) {
          console.warn(`⚠️ Invalid image URL skipped: ${imageUrl}`);
          continue;
        }

        const imageData = {
          src: imageUrl,
          alt: `${productTitle} - Premium Quality Image ${i + 1}`,
          position: i + 1
        };

        // FIX: Use the correct method name from ShopifyAPIClient
        const imageResponse = await this.shopifyClient.uploadImage(productId, imageData);
        
        if (imageResponse && imageResponse.image && imageResponse.image.id) {
          uploadedImageIds.push(imageResponse.image.id);
          console.log(`✅ Real AliExpress image ${i + 1} uploaded successfully for "${productTitle}": ${imageResponse.image.id}`);
        } else {
          console.warn(`⚠️ Image upload failed for "${productTitle}" image ${i + 1}`);
        }

        // Rate limiting for quality uploads
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error uploading real image ${i + 1} for "${productTitle}":`, error);
        continue;
      }
    }

    console.log(`🎉 REAL IMAGE UPLOAD COMPLETE for "${productTitle}": ${uploadedImageIds.length}/${validImages.length} images uploaded successfully`);
    
    return {
      uploadedCount: uploadedImageIds.length,
      imageIds: uploadedImageIds
    };
  }

  private isValidImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string' || url.length < 10) {
      return false;
    }
    
    // Enhanced validation for real AliExpress images
    const validPatterns = [
      /^https?:\/\/.*\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i,
      /^https?:\/\/ae\d+\.alicdn\.com\//i,
      /^https?:\/\/.*aliexpress\./i,
      /^https?:\/\/.*\.aliimg\.com\//i
    ];
    
    return validPatterns.some(pattern => pattern.test(url));
  }

  async assignImagesToVariants(imageIds: string[], variants: any[]): Promise<number> {
    console.log(`🎯 Assigning ${imageIds.length} real images to ${variants.length} variants...`);
    
    let assignmentCount = 0;
    
    for (let i = 0; i < Math.min(variants.length, imageIds.length); i++) {
      try {
        const variant = variants[i];
        const imageId = imageIds[i];
        
        if (variant && variant.id && imageId) {
          // FIX: Use the correct method for image-to-variant assignment
          const success = await this.shopifyClient.assignImageToVariant(imageId, variant.id);
          if (success) {
            assignmentCount++;
            console.log(`✅ Image ${imageId} assigned to variant ${variant.id}`);
          }
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Error assigning image ${i + 1} to variant:`, error);
        continue;
      }
    }
    
    console.log(`🎉 Image assignment complete: ${assignmentCount} assignments successful`);
    return assignmentCount;
  }

  async enhanceImageWithThemeColor(imageUrl: string, themeColor: string): Promise<string> {
    // For now, return the original image URL as theme color enhancement
    // would require image processing capabilities
    console.log(`🎨 Theme color ${themeColor} noted for image: ${imageUrl}`);
    return imageUrl;
  }
}

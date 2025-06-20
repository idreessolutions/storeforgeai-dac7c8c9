
export class EnhancedImageUploader {
  private shopifyClient: any;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor(shopifyClient: any) {
    this.shopifyClient = shopifyClient;
  }

  async uploadProductImages(productId: string, imageUrls: string[], productTitle: string): Promise<{
    uploadedCount: number;
    imageIds: string[];
    failedUploads: string[];
  }> {
    console.log(`🚨 ENHANCED IMAGE UPLOAD: Starting upload of ${imageUrls.length} images for product ${productId}`);
    
    const uploadedImageIds: string[] = [];
    const failedUploads: string[] = [];
    let uploadedCount = 0;

    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      console.log(`🔄 ENHANCED UPLOAD ${i + 1}/${imageUrls.length}: ${imageUrl}`);

      try {
        const imageId = await this.uploadSingleImageWithRetry(productId, imageUrl, i + 1, productTitle);
        if (imageId) {
          uploadedImageIds.push(imageId);
          uploadedCount++;
          console.log(`✅ ENHANCED SUCCESS: Image ${i + 1} uploaded with ID: ${imageId}`);
        } else {
          failedUploads.push(imageUrl);
          console.error(`❌ ENHANCED FAILURE: Image ${i + 1} failed to upload`);
        }
      } catch (error) {
        console.error(`❌ ENHANCED ERROR: Image ${i + 1} upload exception:`, error);
        failedUploads.push(imageUrl);
      }

      // Rate limiting - wait between uploads
      if (i < imageUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    console.log(`🎉 ENHANCED UPLOAD COMPLETE: ${uploadedCount}/${imageUrls.length} images uploaded successfully`);

    return {
      uploadedCount,
      imageIds: uploadedImageIds,
      failedUploads
    };
  }

  private async uploadSingleImageWithRetry(productId: string, imageUrl: string, imageIndex: number, productTitle: string): Promise<string | null> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`📤 ENHANCED ATTEMPT ${attempt}/${this.maxRetries} for image ${imageIndex}`);

        // Enhanced image payload with better metadata
        const imagePayload = {
          image: {
            src: imageUrl,
            alt: `${productTitle} - Image ${imageIndex}`,
            position: imageIndex,
            filename: `product-${productId}-image-${imageIndex}.jpg`
          }
        };

        const response = await this.shopifyClient.uploadImage(productId, imagePayload.image);

        if (response && response.image && response.image.id) {
          console.log(`✅ ENHANCED SUCCESS: Image ${imageIndex} uploaded on attempt ${attempt}`);
          return response.image.id.toString();
        } else {
          console.warn(`⚠️ ENHANCED WARNING: Attempt ${attempt} returned no image ID`);
        }

      } catch (error) {
        console.error(`❌ ENHANCED ERROR: Attempt ${attempt} failed:`, error);
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * attempt; // Exponential backoff
          console.log(`⏳ ENHANCED RETRY: Waiting ${delay}ms before attempt ${attempt + 1}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return null;
  }

  async assignImagesToVariants(imageIds: string[], variants: any[]): Promise<number> {
    if (!imageIds.length || !variants.length) {
      console.warn(`⚠️ ENHANCED WARNING: No images or variants to assign`);
      return 0;
    }

    console.log(`🎯 ENHANCED ASSIGNMENT: Assigning ${imageIds.length} images to ${variants.length} variants`);
    
    let assignmentCount = 0;

    for (let i = 0; i < variants.length && i < imageIds.length; i++) {
      const variant = variants[i];
      const imageId = imageIds[i];

      try {
        console.log(`🔄 ENHANCED ASSIGNING: Image ${imageId} to variant ${variant.id}`);

        const success = await this.shopifyClient.assignImageToVariant(imageId, variant.id);
        
        if (success) {
          assignmentCount++;
          console.log(`✅ ENHANCED ASSIGNMENT SUCCESS: Image ${imageId} → Variant ${variant.id}`);
        } else {
          console.error(`❌ ENHANCED ASSIGNMENT FAILED: Image ${imageId} → Variant ${variant.id}`);
        }

      } catch (error) {
        console.error(`❌ ENHANCED ASSIGNMENT ERROR:`, error);
      }

      // Rate limiting between assignments
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`🎉 ENHANCED ASSIGNMENT COMPLETE: ${assignmentCount} successful assignments`);
    return assignmentCount;
  }
}

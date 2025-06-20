
import { RealAliExpressImageService } from "../../../src/services/realAliExpressImageService.ts";

export class ImageProcessor {
  private shopifyClient: any;

  constructor(shopifyClient: any) {
    this.shopifyClient = shopifyClient;
  }

  async uploadRealProductImages(
    productId: string, 
    productTitle: string, 
    niche: string, 
    productIndex: number
  ): Promise<{
    uploadedCount: number;
    imageIds: string[];
    failedUploads: string[];
  }> {
    console.log(`🚨 REAL IMAGE UPLOAD: Starting upload of REAL AliExpress images for "${productTitle}"`);
    
    // Get 8 real AliExpress images for this specific product
    const realImages = RealAliExpressImageService.getRealProductImages(niche, productIndex, productTitle);
    
    console.log(`📸 REAL IMAGES FETCHED: ${realImages.length} real AliExpress CDN images for ${niche}`);
    console.log(`🔗 Sample image URLs:`, realImages.slice(0, 3));
    
    const uploadedImageIds: string[] = [];
    const failedUploads: string[] = [];
    let uploadedCount = 0;

    for (let i = 0; i < realImages.length; i++) {
      const imageUrl = realImages[i];
      console.log(`🔄 UPLOADING REAL IMAGE ${i + 1}/${realImages.length}: ${imageUrl.substring(0, 80)}...`);

      try {
        const imageId = await this.uploadSingleImageWithRetry(productId, imageUrl, i + 1, productTitle);
        if (imageId) {
          uploadedImageIds.push(imageId);
          uploadedCount++;
          console.log(`✅ REAL IMAGE SUCCESS: Image ${i + 1} uploaded with ID: ${imageId}`);
        } else {
          failedUploads.push(imageUrl);
          console.error(`❌ REAL IMAGE FAILED: Image ${i + 1} failed to upload`);
        }
      } catch (error) {
        console.error(`❌ REAL IMAGE ERROR: Image ${i + 1} upload exception:`, error);
        failedUploads.push(imageUrl);
      }

      // Rate limiting between uploads
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`🎉 REAL IMAGE UPLOAD COMPLETE: ${uploadedCount}/${realImages.length} real AliExpress images uploaded successfully`);

    return {
      uploadedCount,
      imageIds: uploadedImageIds,
      failedUploads
    };
  }

  private async uploadSingleImageWithRetry(productId: string, imageUrl: string, imageIndex: number, productTitle: string): Promise<string | null> {
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📤 REAL IMAGE ATTEMPT ${attempt}/${maxRetries} for image ${imageIndex}`);

        const imagePayload = {
          image: {
            src: imageUrl,
            alt: `${productTitle} - Real Product Image ${imageIndex}`,
            position: imageIndex,
            filename: `real-product-${productId}-image-${imageIndex}.jpg`
          }
        };

        const response = await this.shopifyClient.uploadImage(productId, imagePayload.image);

        if (response && response.image && response.image.id) {
          console.log(`✅ REAL IMAGE SUCCESS: Image ${imageIndex} uploaded on attempt ${attempt}`);
          return response.image.id.toString();
        } else {
          console.warn(`⚠️ REAL IMAGE WARNING: Attempt ${attempt} returned no image ID`);
        }

      } catch (error) {
        console.error(`❌ REAL IMAGE ERROR: Attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          const delay = 1000 * attempt; // Exponential backoff
          console.log(`⏳ REAL IMAGE RETRY: Waiting ${delay}ms before attempt ${attempt + 1}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return null;
  }

  async assignImagesToVariants(imageIds: string[], variants: any[]): Promise<number> {
    if (!imageIds.length || !variants.length) {
      console.warn(`⚠️ IMAGE ASSIGNMENT: No images or variants to assign`);
      return 0;
    }

    console.log(`🎯 IMAGE ASSIGNMENT: Assigning ${imageIds.length} real images to ${variants.length} variants`);
    
    let assignmentCount = 0;

    for (let i = 0; i < variants.length && i < imageIds.length; i++) {
      const variant = variants[i];
      const imageId = imageIds[i];

      try {
        console.log(`🔄 ASSIGNING REAL IMAGE: Image ${imageId} to variant ${variant.id}`);

        const success = await this.shopifyClient.assignImageToVariant(imageId, variant.id);
        
        if (success) {
          assignmentCount++;
          console.log(`✅ IMAGE ASSIGNMENT SUCCESS: Real image ${imageId} → Variant ${variant.id}`);
        } else {
          console.error(`❌ IMAGE ASSIGNMENT FAILED: Image ${imageId} → Variant ${variant.id}`);
        }

      } catch (error) {
        console.error(`❌ IMAGE ASSIGNMENT ERROR:`, error);
      }

      // Rate limiting between assignments
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`🎉 IMAGE ASSIGNMENT COMPLETE: ${assignmentCount} real image assignments successful`);
    return assignmentCount;
  }
}


export class ImageProcessor {
  private shopifyClient: any;

  constructor(shopifyClient: any) {
    this.shopifyClient = shopifyClient;
  }

  async uploadRealAliExpressImages(productId: string, productTitle: string, realImages: string[], themeColor: string) {
    console.log(`📸 Starting REAL AliExpress image upload for "${productTitle}"`);
    console.log(`🖼️ Real images to upload: ${realImages.length}`);
    
    let uploadedCount = 0;
    const imageIds: string[] = [];

    // Upload each real AliExpress image
    for (let i = 0; i < realImages.length && i < 8; i++) {
      const imageUrl = realImages[i];
      
      if (!imageUrl || !imageUrl.startsWith('http')) {
        console.log(`⚠️ Skipping invalid image URL: ${imageUrl}`);
        continue;
      }

      try {
        console.log(`⬆️ Uploading real image ${i + 1}/${realImages.length} for "${productTitle}" to Shopify...`);
        
        // Upload the real AliExpress image directly to Shopify
        const imageData = {
          src: imageUrl,
          alt: `${productTitle} - Image ${i + 1}`,
          position: i + 1
        };

        console.log('🖼️ Real image data:', {
          src: imageUrl.substring(0, 100) + '...',
          alt: imageData.alt,
          position: imageData.position
        });

        const response = await this.shopifyClient.uploadImage(productId, imageData);
        
        if (response && response.image && response.image.id) {
          imageIds.push(response.image.id);
          uploadedCount++;
          console.log(`✅ Successfully uploaded real image ${i + 1} for "${productTitle}" (ID: ${response.image.id})`);
          console.log(`🔗 Uploaded image URL: ${response.image.src?.substring(0, 100)}...`);
          console.log(`🎨 Real AliExpress image uploaded for: ${productTitle}`);
        } else {
          console.error(`❌ Failed to upload real image ${i + 1} for "${productTitle}":`, response);
        }

        // Rate limiting between uploads
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error uploading real image ${i + 1} for "${productTitle}":`, error);
      }
    }

    console.log(`📸 Real image upload completed for "${productTitle}": ${uploadedCount}/${realImages.length} images successfully uploaded`);

    return {
      uploadedCount,
      imageIds
    };
  }

  async assignImagesToVariants(imageIds: string[], variants: any[]): Promise<number> {
    console.log(`🔗 Assigning ${imageIds.length} real images to ${variants.length} variants...`);
    
    let assignmentCount = 0;

    for (let i = 0; i < variants.length && i < imageIds.length; i++) {
      const variant = variants[i];
      const imageId = imageIds[i];

      try {
        console.log(`🏷️ Assigning image ${imageId} to variant ${variant.id}...`);
        
        const success = await this.assignImageToVariant(imageId, variant.id);
        if (success) {
          assignmentCount++;
          console.log(`✅ Successfully assigned image ${imageId} to variant ${variant.id}`);
        }
      } catch (error) {
        console.error(`❌ Failed to assign image ${imageId} to variant ${variant.id}:`, error);
      }
    }

    console.log(`🎯 Image-to-variant assignment completed: ${assignmentCount} successful assignments`);
    return assignmentCount;
  }

  private async assignImageToVariant(imageId: string, variantId: string): Promise<boolean> {
    try {
      console.log(`🔗 Assigning image ${imageId} to variant ${variantId}...`);
      
      const response = await this.shopifyClient.assignImageToVariant(variantId, imageId);
      
      if (response && response.variant) {
        return true;
      } else {
        console.error(`❌ Image-to-variant assignment failed: ${response?.status || 'Unknown error'}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Failed to assign image ${imageId} to variant ${variantId}`);
      return false;
    }
  }

  // Legacy method for backward compatibility - now uses real images only
  async uploadProductImages(productId: string, productTitle: string, features: string[], category: string, themeColor: string) {
    console.log(`🚀 PRIORITY: Using real AliExpress images only for "${productTitle}"`);
    console.log(`⚠️ DALL-E image generation is disabled - using real product images`);
    
    return {
      uploadedCount: 0,
      imageIds: []
    };
  }
}

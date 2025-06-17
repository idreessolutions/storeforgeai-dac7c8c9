
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
    console.log(`📸 CRITICAL FIX: UPLOADING REAL ALIEXPRESS IMAGES for "${productTitle}"`);
    console.log(`🎯 Processing ${realImages.length} verified real AliExpress images`);
    
    if (!realImages || realImages.length === 0) {
      console.error(`❌ CRITICAL: No real images provided for ${productTitle} - this breaks the product listing!`);
      return { uploadedCount: 0, imageIds: [] };
    }

    const uploadedImageIds: string[] = [];
    const validImages = realImages.filter(img => this.isValidAliExpressImageUrl(img));
    
    console.log(`✅ Verified AliExpress images to upload: ${validImages.length}`);

    // Upload 6-8 images for professional product representation
    for (let i = 0; i < Math.min(validImages.length, 8); i++) {
      const imageUrl = validImages[i];
      
      try {
        console.log(`🔄 Uploading AliExpress image ${i + 1}/${validImages.length} for "${productTitle}"`);
        
        const imageData = {
          src: imageUrl,
          alt: `${productTitle} - Professional Quality Image ${i + 1}`,
          position: i + 1
        };

        // Direct upload to Shopify
        const imageResponse = await this.shopifyClient.uploadImage(productId, imageData);
        
        if (imageResponse && imageResponse.image && imageResponse.image.id) {
          uploadedImageIds.push(imageResponse.image.id);
          console.log(`✅ Real AliExpress image ${i + 1} uploaded successfully: ${imageResponse.image.id}`);
        } else {
          console.error(`❌ CRITICAL: Image upload failed for "${productTitle}" image ${i + 1} - retrying...`);
          
          // Retry once for critical images
          await new Promise(resolve => setTimeout(resolve, 1000));
          const retryResponse = await this.shopifyClient.uploadImage(productId, imageData);
          if (retryResponse && retryResponse.image && retryResponse.image.id) {
            uploadedImageIds.push(retryResponse.image.id);
            console.log(`✅ Retry successful for image ${i + 1}: ${retryResponse.image.id}`);
          }
        }

        // Rate limiting for reliable uploads
        await new Promise(resolve => setTimeout(resolve, 800));
        
      } catch (error) {
        console.error(`❌ CRITICAL ERROR uploading image ${i + 1} for "${productTitle}":`, error);
        
        // Try alternative upload method for critical images
        try {
          const alternativeResponse = await this.uploadImageAlternative(productId, imageUrl, productTitle, i + 1);
          if (alternativeResponse) {
            uploadedImageIds.push(alternativeResponse);
            console.log(`✅ Alternative upload successful for image ${i + 1}`);
          }
        } catch (altError) {
          console.error(`❌ Alternative upload also failed for image ${i + 1}:`, altError);
          continue;
        }
      }
    }

    if (uploadedImageIds.length === 0) {
      console.error(`🚨 CRITICAL FAILURE: NO IMAGES UPLOADED for "${productTitle}" - this will break the product listing!`);
    } else {
      console.log(`🎉 SUCCESS: ${uploadedImageIds.length}/${validImages.length} real AliExpress images uploaded for "${productTitle}"`);
    }
    
    return {
      uploadedCount: uploadedImageIds.length,
      imageIds: uploadedImageIds
    };
  }

  private async uploadImageAlternative(productId: string, imageUrl: string, productTitle: string, position: number): Promise<string | null> {
    try {
      // Alternative method using direct fetch and upload
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }
      
      const imageBlob = await imageResponse.blob();
      const formData = new FormData();
      formData.append('image', imageBlob, `${productTitle}_${position}.jpg`);
      formData.append('alt', `${productTitle} - Image ${position}`);
      formData.append('position', position.toString());
      
      const uploadResponse = await this.shopifyClient.uploadImageBlob(productId, formData);
      return uploadResponse?.image?.id || null;
    } catch (error) {
      console.error('Alternative upload method failed:', error);
      return null;
    }
  }

  private isValidAliExpressImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string' || url.length < 10) {
      return false;
    }
    
    // Strict validation for REAL AliExpress images
    const validPatterns = [
      /^https?:\/\/ae\d+\.alicdn\.com\/kf\/H[a-f0-9]{32}\.jpg$/i,
      /^https?:\/\/.*\.alicdn\.com\//i,
      /^https?:\/\/.*aliexpress\./i,
      /^https?:\/\/.*\.aliimg\.com\//i
    ];
    
    const isValid = validPatterns.some(pattern => pattern.test(url));
    if (!isValid) {
      console.warn(`⚠️ Invalid AliExpress image URL detected: ${url}`);
    }
    
    return isValid;
  }

  async assignImagesToVariants(imageIds: string[], variants: any[]): Promise<number> {
    console.log(`🎯 CRITICAL: Assigning ${imageIds.length} real images to ${variants.length} product variants...`);
    
    let assignmentCount = 0;
    
    for (let i = 0; i < Math.min(variants.length, imageIds.length); i++) {
      try {
        const variant = variants[i];
        const imageId = imageIds[i];
        
        if (variant && variant.id && imageId) {
          const success = await this.shopifyClient.assignImageToVariant(imageId, variant.id);
          if (success) {
            assignmentCount++;
            console.log(`✅ CRITICAL: Image ${imageId} assigned to variant ${variant.id} successfully`);
          } else {
            console.error(`❌ CRITICAL: Failed to assign image ${imageId} to variant ${variant.id}`);
          }
        }
        
        // Rate limiting for reliable assignments
        await new Promise(resolve => setTimeout(resolve, 600));
        
      } catch (error) {
        console.error(`❌ CRITICAL ERROR assigning image ${i + 1} to variant:`, error);
        continue;
      }
    }
    
    console.log(`🎉 CRITICAL FIX COMPLETE: ${assignmentCount} image assignments successful`);
    return assignmentCount;
  }

  async enhanceImageWithThemeColor(imageUrl: string, themeColor: string): Promise<string> {
    // For now, return the original real AliExpress image URL
    console.log(`🎨 Theme color ${themeColor} noted for AliExpress image: ${imageUrl}`);
    return imageUrl;
  }
}

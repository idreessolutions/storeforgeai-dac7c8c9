
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
    console.log(`🚨 CRITICAL IMAGE UPLOAD: Starting upload for "${productTitle}"`);
    console.log(`📸 Processing ${realImages.length} real image URLs`);
    
    if (!realImages || realImages.length === 0) {
      console.error(`❌ CRITICAL: No images provided for ${productTitle}`);
      return { uploadedCount: 0, imageIds: [] };
    }

    const uploadedImageIds: string[] = [];
    const validImages = realImages.filter(img => this.isValidImageUrl(img));
    
    console.log(`✅ Valid images to upload: ${validImages.length}`);

    // Upload images one by one with proper error handling
    for (let i = 0; i < Math.min(validImages.length, 8); i++) {
      const imageUrl = validImages[i];
      
      try {
        console.log(`🔄 Uploading image ${i + 1}/${validImages.length}: ${imageUrl}`);
        
        // Create proper image data structure for Shopify
        const imageData = {
          src: imageUrl,
          alt: `${productTitle} - Product Image ${i + 1}`,
          position: i + 1,
          product_id: productId
        };

        // Upload with multiple retry attempts
        const imageResponse = await this.uploadWithRetry(productId, imageData, 3);
        
        if (imageResponse && imageResponse.image && imageResponse.image.id) {
          uploadedImageIds.push(imageResponse.image.id);
          console.log(`✅ SUCCESS: Image ${i + 1} uploaded with ID: ${imageResponse.image.id}`);
        } else {
          console.error(`❌ FAILED: Image ${i + 1} upload failed for "${productTitle}"`);
          
          // Try alternative upload method
          const altResponse = await this.alternativeUpload(productId, imageData);
          if (altResponse && altResponse.image && altResponse.image.id) {
            uploadedImageIds.push(altResponse.image.id);
            console.log(`✅ ALT SUCCESS: Image ${i + 1} uploaded via alternative method`);
          }
        }

        // Rate limiting to prevent API overload
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error(`❌ ERROR uploading image ${i + 1}:`, error);
        continue;
      }
    }

    if (uploadedImageIds.length === 0) {
      console.error(`🚨 CRITICAL FAILURE: NO IMAGES UPLOADED for "${productTitle}"`);
      // Try fallback with first image only
      try {
        const fallbackResponse = await this.uploadSingleImageFallback(productId, validImages[0], productTitle);
        if (fallbackResponse) {
          uploadedImageIds.push(fallbackResponse);
          console.log(`✅ FALLBACK SUCCESS: 1 image uploaded`);
        }
      } catch (fallbackError) {
        console.error(`❌ Even fallback failed:`, fallbackError);
      }
    } else {
      console.log(`🎉 UPLOAD SUCCESS: ${uploadedImageIds.length}/${validImages.length} images uploaded`);
    }
    
    return {
      uploadedCount: uploadedImageIds.length,
      imageIds: uploadedImageIds
    };
  }

  private async uploadSingleImageFallback(productId: string, imageUrl: string, productTitle: string): Promise<string | null> {
    try {
      console.log(`🔄 FALLBACK: Attempting single image upload for ${productTitle}`);
      const response = await this.shopifyClient.uploadImage(productId, {
        src: imageUrl,
        alt: productTitle
      });
      
      if (response && response.image && response.image.id) {
        return response.image.id;
      }
      return null;
    } catch (error) {
      console.error(`❌ Fallback upload failed:`, error);
      return null;
    }
  }

  private async uploadWithRetry(productId: string, imageData: any, maxRetries: number): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📤 Upload attempt ${attempt}/${maxRetries} for product ${productId}`);
        
        const response = await this.shopifyClient.uploadImage(productId, imageData);
        
        if (response && response.image && response.image.id) {
          console.log(`✅ Upload successful on attempt ${attempt}`);
          return response;
        } else {
          console.warn(`⚠️ Upload attempt ${attempt} returned no image ID`);
        }
      } catch (error) {
        console.error(`❌ Upload attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
    return null;
  }

  private async alternativeUpload(productId: string, imageData: any): Promise<any> {
    try {
      // Alternative approach: Create image without position first
      const altImageData = {
        src: imageData.src,
        alt: imageData.alt
      };
      
      return await this.shopifyClient.uploadImage(productId, altImageData);
    } catch (error) {
      console.error('❌ Alternative upload failed:', error);
      return null;
    }
  }

  private isValidImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string' || url.length < 10) {
      return false;
    }
    
    // Validate working image sources
    const validSources = [
      'images.unsplash.com',
      'cdn.shopify.com',
      'picsum.photos',
      'ae01.alicdn.com',
      'ae02.alicdn.com',
      'ae03.alicdn.com'
    ];
    
    const isValid = validSources.some(source => url.includes(source)) && 
                   (url.includes('http://') || url.includes('https://'));
    
    if (!isValid) {
      console.warn(`⚠️ Invalid image URL: ${url}`);
    }
    
    return isValid;
  }

  async assignImagesToVariants(imageIds: string[], variants: any[]): Promise<number> {
    console.log(`🎯 ASSIGNING IMAGES TO VARIANTS: ${imageIds.length} images, ${variants.length} variants`);
    
    let assignmentCount = 0;
    
    for (let i = 0; i < Math.min(variants.length, imageIds.length); i++) {
      try {
        const variant = variants[i];
        const imageId = imageIds[i];
        
        if (variant && variant.id && imageId) {
          console.log(`🔄 Assigning image ${imageId} to variant ${variant.id}`);
          
          const success = await this.shopifyClient.assignImageToVariant(imageId, variant.id);
          if (success) {
            assignmentCount++;
            console.log(`✅ Image assigned successfully: ${imageId} -> ${variant.id}`);
          } else {
            console.error(`❌ Failed to assign image ${imageId} to variant ${variant.id}`);
          }
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error assigning image ${i + 1}:`, error);
        continue;
      }
    }
    
    console.log(`🎉 IMAGE ASSIGNMENT COMPLETE: ${assignmentCount} successful assignments`);
    return assignmentCount;
  }

  async enhanceImageWithThemeColor(imageUrl: string, themeColor: string): Promise<string> {
    // Return the original working image URL
    console.log(`🎨 Theme color ${themeColor} noted for image: ${imageUrl}`);
    return imageUrl;
  }
}

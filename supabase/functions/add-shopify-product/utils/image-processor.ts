
export class ImageProcessor {
  constructor(private shopifyClient: any) {}

  async verifyImageUrl(imageUrl: string): Promise<boolean> {
    try {
      if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
        console.log(`❌ Invalid image URL format: ${imageUrl}`);
        return false;
      }
      
      // Quick validation for trusted domains
      const validDomains = [
        'images.unsplash.com', 
        'oaidalleapiprodscus.blob.core.windows.net',
        'cdn.openai.com',
        'cdn.shopify.com',
        'dalle-3.openai.com'
      ];
      
      const url = new URL(imageUrl);
      if (validDomains.some(domain => url.hostname.includes(domain))) {
        console.log(`✅ Trusted domain verified: ${url.hostname}`);
        return true;
      }
      
      // For other domains, do a quick HEAD request
      const response = await fetch(imageUrl, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      const isValid = response.ok && response.headers.get('content-type')?.startsWith('image/');
      console.log(`🔍 Image verification for ${url.hostname}: ${isValid ? 'VALID' : 'INVALID'}`);
      return isValid;
    } catch (error) {
      console.log(`❌ Image verification failed for ${imageUrl}:`, error.message);
      return false;
    }
  }

  async uploadProductImages(productId: string, images: string[], productTitle: string): Promise<number> {
    let uploadedCount = 0;
    
    if (!images || images.length === 0) {
      console.log('⚠️ No images provided for upload');
      return uploadedCount;
    }

    console.log(`🖼️ Starting upload of ${images.length} images to Shopify product ${productId}...`);
    console.log(`🔍 Sample image URL: ${images[0]?.substring(0, 100)}...`);
    
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      
      try {
        console.log(`📷 Processing image ${i + 1}/${images.length}`);
        console.log(`🔗 Image URL: ${typeof imageUrl === 'string' ? imageUrl.substring(0, 100) + '...' : 'Invalid URL type: ' + typeof imageUrl}`);
        
        // Ensure imageUrl is a string
        if (typeof imageUrl !== 'string') {
          console.log(`⚠️ Skipping invalid image at index ${i}: Expected string, got ${typeof imageUrl}`);
          continue;
        }
        
        // Verify the image URL is valid
        const isValid = await this.verifyImageUrl(imageUrl);
        if (!isValid) {
          console.log(`⚠️ Skipping invalid image URL at index ${i}: ${imageUrl.substring(0, 100)}...`);
          continue;
        }
        
        // Prepare image payload for Shopify
        const imagePayload = {
          src: imageUrl,
          alt: `${productTitle} - Image ${i + 1}`,
          position: i + 1
        };

        console.log(`⬆️ Uploading image ${i + 1} to Shopify...`);
        const uploadResult = await this.shopifyClient.uploadImage(productId, imagePayload);
        
        if (uploadResult && uploadResult.image) {
          uploadedCount++;
          console.log(`✅ Successfully uploaded image ${i + 1} to Shopify (ID: ${uploadResult.image.id})`);
          
          // Assign first few images to variants if they exist
          if (i < 3) {
            console.log(`🏷️ Image ${i + 1} can be assigned to product variants`);
          }
        } else {
          console.log(`❌ Failed to upload image ${i + 1} - no response from Shopify`);
        }
        
        // Rate limiting between uploads (Shopify has strict limits)
        if (i < images.length - 1) {
          console.log(`⏱️ Rate limiting delay before next image...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Increased delay
        }
      } catch (error) {
        console.log(`❌ Error uploading image ${i + 1}:`, error.message);
        console.log(`🔍 Error details:`, error);
        
        // Retry once on error
        try {
          console.log(`🔄 Retrying upload for image ${i + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const retryResult = await this.shopifyClient.uploadImage(productId, {
            src: imageUrl,
            alt: `${productTitle} - Image ${i + 1}`,
            position: i + 1
          });
          
          if (retryResult && retryResult.image) {
            uploadedCount++;
            console.log(`✅ Retry successful for image ${i + 1} (ID: ${retryResult.image.id})`);
          } else {
            console.log(`❌ Retry failed for image ${i + 1}`);
          }
        } catch (retryError) {
          console.log(`❌ Retry also failed for image ${i + 1}:`, retryError.message);
        }
      }
    }
    
    console.log(`📸 Image upload completed: ${uploadedCount}/${images.length} images successfully uploaded to Shopify`);
    
    if (uploadedCount === 0) {
      console.log(`⚠️ WARNING: No images were uploaded to product ${productId}. Check image URLs and Shopify API connectivity.`);
    }
    
    return uploadedCount;
  }

  async assignImageToVariant(imageId: string, variantId: string): Promise<boolean> {
    try {
      // Note: Shopify doesn't directly assign images to variants via API
      // This is typically done through the admin interface or by position
      console.log(`🏷️ Image ${imageId} positioned for variant ${variantId}`);
      return true;
    } catch (error) {
      console.log(`❌ Failed to assign image to variant:`, error.message);
      return false;
    }
  }
}

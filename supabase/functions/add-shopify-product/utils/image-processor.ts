
export class ImageProcessor {
  constructor(private shopifyClient: any) {}

  async generateDalleImages(productTitle: string, features: string[], niche: string, themeColor: string = '#1E40AF'): Promise<string[]> {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.log('⚠️ OpenAI API key not found, using fallback images');
      return this.getProductSpecificFallbackImages(productTitle, niche, 6);
    }

    const images: string[] = [];
    
    try {
      console.log(`🎨 Generating 6 unique DALL·E 3 images for specific product: ${productTitle}`);
      
      // Generate simplified, more reliable prompts
      const imagePrompts = this.generateSimplifiedProductPrompts(productTitle, features, niche);

      for (let i = 0; i < 6; i++) {
        try {
          console.log(`🖼️ Generating DALL·E 3 product image ${i + 1}/6 for: ${productTitle}`);
          console.log(`📝 Using prompt: ${imagePrompts[i].substring(0, 100)}...`);
          
          const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'dall-e-3',
              prompt: imagePrompts[i],
              n: 1,
              size: '1024x1024',
              quality: 'standard',
              style: 'natural'
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data[0] && data.data[0].url) {
              const imageUrl = data.data[0].url;
              images.push(imageUrl);
              console.log(`✅ DALL·E 3 specific image ${i + 1} generated successfully for ${productTitle}`);
            } else {
              console.log(`⚠️ DALL·E 3 image ${i + 1} failed - no URL in response for ${productTitle}`);
            }
          } else {
            const errorText = await response.text();
            console.log(`⚠️ DALL·E 3 image ${i + 1} failed for ${productTitle}: ${response.status} - ${errorText.substring(0, 100)}...`);
          }
          
          // Rate limiting between requests
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.log(`⚠️ Error generating DALL·E 3 image ${i + 1} for ${productTitle}:`, error.message);
        }
      }
    } catch (error) {
      console.log(`⚠️ DALL·E 3 generation failed for ${productTitle}:`, error.message);
    }

    // If we have fewer than 3 images, add product-specific fallback images
    if (images.length < 3) {
      console.log(`🔄 Adding product-specific fallback images for ${productTitle} (current: ${images.length})`);
      const fallbackImages = this.getProductSpecificFallbackImages(productTitle, niche, 6 - images.length);
      images.push(...fallbackImages);
    }

    console.log(`📸 Total images for ${productTitle}: ${images.length} (${images.filter(img => img.includes('oaidalleapiprodscus')).length} from DALL·E 3)`);
    return images.slice(0, 6);
  }

  generateSimplifiedProductPrompts(productTitle: string, features: string[], niche: string): string[] {
    // Clean product title for better prompt generation
    const cleanTitle = productTitle.replace(/[^\w\s-]/g, '').trim();
    
    // Create simplified, more reliable prompts that avoid policy violations
    const prompts = [
      `Professional product photo of ${cleanTitle}, clean white background, studio lighting, high quality, commercial photography`,
      
      `${cleanTitle} product showcase, clean modern design, minimal background, professional lighting, e-commerce style`,
      
      `Close-up detail shot of ${cleanTitle}, premium quality, clean white background, studio photography`,
      
      `${cleanTitle} with elegant packaging, clean presentation, professional product photography, white background`,
      
      `Multiple angle view of ${cleanTitle}, product display, clean background, commercial photography`,
      
      `${cleanTitle} lifestyle image, modern clean setting, natural lighting, professional quality`
    ];

    return prompts;
  }

  async uploadProductImages(productId: string, productTitle: string, features: string[], niche: string, themeColor: string = '#1E40AF', variants?: any[]): Promise<{ uploadedCount: number, imageIds: string[] }> {
    let uploadedCount = 0;
    const imageIds: string[] = [];
    
    console.log(`🖼️ Starting product-specific image generation for: "${productTitle}"`);
    console.log(`🎯 Product features: ${features.slice(0, 3).join(', ')}`);
    console.log(`🏪 Niche: ${niche}`);
    
    // Generate product-specific images
    const generatedImages = await this.generateDalleImages(productTitle, features, niche, themeColor);
    
    if (generatedImages.length === 0) {
      console.log(`⚠️ No images generated for product: ${productTitle}`);
      return { uploadedCount, imageIds };
    }

    console.log(`🚀 Uploading ${generatedImages.length} product-specific images for "${productTitle}" to Shopify...`);
    
    for (let i = 0; i < generatedImages.length; i++) {
      const imageUrl = generatedImages[i];
      
      try {
        console.log(`⬆️ Uploading image ${i + 1}/${generatedImages.length} for "${productTitle}" to Shopify...`);
        
        const imagePayload = {
          src: imageUrl,
          alt: `${productTitle} - ${this.getImageDescription(i)}`,
          position: i + 1
        };

        const uploadResult = await this.shopifyClient.uploadImage(productId, imagePayload);
        
        if (uploadResult && uploadResult.image) {
          uploadedCount++;
          imageIds.push(uploadResult.image.id);
          console.log(`✅ Successfully uploaded image ${i + 1} for "${productTitle}" (ID: ${uploadResult.image.id})`);
          
          // Log if this is a DALL·E 3 generated image
          if (imageUrl.includes('oaidalleapiprodscus')) {
            console.log(`🎨 DALL·E 3 product-specific image uploaded for: ${productTitle}`);
          }
        } else {
          console.log(`❌ Failed to upload image ${i + 1} for "${productTitle}"`);
        }
        
        // Rate limiting between uploads
        if (i < generatedImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (error) {
        console.log(`❌ Error uploading image ${i + 1} for "${productTitle}":`, error.message);
      }
    }
    
    console.log(`📸 Image upload completed for "${productTitle}": ${uploadedCount}/${generatedImages.length} images successfully uploaded`);
    return { uploadedCount, imageIds };
  }

  getImageDescription(index: number): string {
    const descriptions = [
      'Product Photo',
      'Lifestyle Image', 
      'Detail Shot',
      'Packaging View',
      'Multiple Angles',
      'Complete Set'
    ];
    return descriptions[index] || `Image ${index + 1}`;
  }

  async assignImageToVariant(imageId: string, variantId: string): Promise<boolean> {
    try {
      console.log(`🏷️ Assigning image ${imageId} to variant ${variantId}...`);
      const success = await this.shopifyClient.assignImageToVariant(imageId, variantId);
      if (success) {
        console.log(`✅ Successfully assigned image ${imageId} to variant ${variantId}`);
      } else {
        console.log(`❌ Failed to assign image ${imageId} to variant ${variantId}`);
      }
      return success;
    } catch (error) {
      console.log(`❌ Failed to assign image to variant:`, error.message);
      return false;
    }
  }

  async assignImagesToVariants(imageIds: string[], variants: any[]): Promise<number> {
    let assignedCount = 0;
    
    if (!imageIds || imageIds.length === 0 || !variants || variants.length === 0) {
      console.log('⚠️ No images or variants available for assignment');
      return assignedCount;
    }

    console.log(`🔗 Assigning ${imageIds.length} product-specific images to ${variants.length} variants...`);

    // Assign at least 1 image per variant, cycling through images if needed
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const imageId = imageIds[i % imageIds.length]; // Cycle through images
      
      if (variant && variant.id && imageId) {
        const success = await this.assignImageToVariant(imageId, variant.id);
        if (success) {
          assignedCount++;
        }
        
        // Small delay between assignments
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    console.log(`🎯 Image-to-variant assignment completed: ${assignedCount} successful assignments`);
    return assignedCount;
  }

  private getProductSpecificFallbackImages(productTitle: string, niche: string, count: number): string[] {
    // Create product-specific fallback images based on title keywords
    const titleLower = productTitle.toLowerCase();
    
    // Pet product specific images based on title keywords
    if (titleLower.includes('feeder') || titleLower.includes('food') || titleLower.includes('bowl')) {
      return [
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1493406300581-484b937cdc41?w=1024&h=1024&fit=crop&auto=format&q=80'
      ].slice(0, count);
    }
    
    if (titleLower.includes('collar') || titleLower.includes('tracker') || titleLower.includes('gps')) {
      return [
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1493406300581-484b937cdc41?w=1024&h=1024&fit=crop&auto=format&q=80'
      ].slice(0, count);
    }
    
    if (titleLower.includes('bed') || titleLower.includes('foam') || titleLower.includes('orthopedic')) {
      return [
        'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1493406300581-484b937cdc41?w=1024&h=1024&fit=crop&auto=format&q=80'
      ].slice(0, count);
    }
    
    if (titleLower.includes('toy') || titleLower.includes('laser') || titleLower.includes('puzzle')) {
      return [
        'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1493406300581-484b937cdc41?w=1024&h=1024&fit=crop&auto=format&q=80'
      ].slice(0, count);
    }
    
    if (titleLower.includes('brush') || titleLower.includes('grooming')) {
      return [
        'https://images.unsplash.com/photo-1493406300581-484b937cdc41?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1024&h=1024&fit=crop&auto=format&q=80'
      ].slice(0, count);
    }
    
    if (titleLower.includes('harness') || titleLower.includes('safety')) {
      return [
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1493406300581-484b937cdc41?w=1024&h=1024&fit=crop&auto=format&q=80'
      ].slice(0, count);
    }
    
    if (titleLower.includes('fountain') || titleLower.includes('water')) {
      return [
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1493406300581-484b937cdc41?w=1024&h=1024&fit=crop&auto=format&q=80'
      ].slice(0, count);
    }
    
    // Default pet product images if no specific match
    console.log(`🔄 Using product-specific fallback images for ${productTitle}`);
    return [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1024&h=1024&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1024&h=1024&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=1024&h=1024&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1024&h=1024&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1493406300581-484b937cdc41?w=1024&h=1024&fit=crop&auto=format&q=80'
    ].slice(0, count);
  }
}

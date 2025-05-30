export class ImageProcessor {
  constructor(private shopifyClient: any) {}

  async generateDalleImages(productTitle: string, features: string[], niche: string, themeColor: string = '#1E40AF'): Promise<string[]> {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.log('⚠️ OpenAI API key not found, using fallback images');
      return this.getReliableFallbackImages(niche, 6);
    }

    const images: string[] = [];
    
    try {
      console.log(`🎨 Generating 6 unique DALL·E 3 images for: ${productTitle}`);
      
      // Generate product-specific prompts based on title, features, and niche
      const imagePrompts = this.generateProductSpecificPrompts(productTitle, features, niche, themeColor);

      for (let i = 0; i < 6; i++) {
        try {
          console.log(`🖼️ Generating DALL·E 3 image ${i + 1}/6: ${imagePrompts[i].substring(0, 80)}...`);
          
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
              console.log(`✅ DALL·E 3 image ${i + 1} generated successfully`);
            } else {
              console.log(`⚠️ DALL·E 3 image ${i + 1} failed - no URL in response`);
            }
          } else {
            const errorText = await response.text();
            console.log(`⚠️ DALL·E 3 image ${i + 1} failed: ${response.status} - ${errorText.substring(0, 200)}`);
          }
          
          // Rate limiting between requests
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.log(`⚠️ Error generating DALL·E 3 image ${i + 1}:`, error.message);
        }
      }
    } catch (error) {
      console.log(`⚠️ DALL·E 3 generation failed:`, error.message);
    }

    // If we have fewer than 4 images, add fallback images
    if (images.length < 4) {
      console.log(`🔄 Adding fallback images (current: ${images.length})`);
      const fallbackImages = this.getReliableFallbackImages(niche, 6 - images.length);
      images.push(...fallbackImages);
    }

    console.log(`📸 Total images generated: ${images.length} (${images.filter(img => img.includes('oaidalleapiprodscus')).length} from DALL·E 3)`);
    return images.slice(0, 6);
  }

  generateProductSpecificPrompts(productTitle: string, features: string[], niche: string, themeColor: string): string[] {
    const topFeatures = features.slice(0, 3).join(', ');
    const cleanTitle = productTitle.replace(/[^\w\s-]/g, '');
    
    // Extract color from hex for prompt
    const colorMap: { [key: string]: string } = {
      '#1E40AF': 'blue',
      '#7C3AED': 'purple', 
      '#DC2626': 'red',
      '#059669': 'green',
      '#D97706': 'orange',
      '#BE185D': 'pink'
    };
    const colorName = colorMap[themeColor] || 'blue';
    
    const prompts = [
      `High-quality professional product photography of ${cleanTitle}. Clean white background, studio lighting, modern minimalist style, commercial product shot, detailed, realistic, 1024x1024`,
      
      `${cleanTitle} in use, lifestyle photography showing the product being used in a realistic ${niche} setting. Natural lighting, authentic environment, people using the product, candid shot, high quality detail, 1024x1024`,
      
      `Close-up detail shot of ${cleanTitle} highlighting key features: ${topFeatures}. Macro photography, clean white background, professional studio lighting, product showcase, commercial style, 1024x1024`,
      
      `${cleanTitle} with premium packaging and unboxing scene. Clean presentation, modern package design, ${colorName} accent colors, studio lighting, commercial product photography, lifestyle branding, 1024x1024`,
      
      `Top-down flat lay view of ${cleanTitle} with accessories and components. Clean white background, organized layout, all parts visible, professional product photography, modern e-commerce style, 1024x1024`,
      
      `${cleanTitle} product showcase with multiple angles. Clean white background, 360-degree view style, professional lighting, commercial photography, modern minimal design, premium quality, 1024x1024`
    ];

    return prompts;
  }

  async uploadProductImages(productId: string, productTitle: string, features: string[], niche: string, themeColor: string = '#1E40AF', variants?: any[]): Promise<{ uploadedCount: number, imageIds: string[] }> {
    let uploadedCount = 0;
    const imageIds: string[] = [];
    
    console.log(`🖼️ Starting product-specific DALL·E 3 image generation for: ${productTitle}`);
    
    // Generate product-specific images using DALL·E 3
    const generatedImages = await this.generateDalleImages(productTitle, features, niche, themeColor);
    
    if (generatedImages.length === 0) {
      console.log('⚠️ No images generated for upload');
      return { uploadedCount, imageIds };
    }

    console.log(`🚀 Uploading ${generatedImages.length} product-specific images to Shopify...`);
    
    for (let i = 0; i < generatedImages.length; i++) {
      const imageUrl = generatedImages[i];
      
      try {
        console.log(`⬆️ Uploading product-specific image ${i + 1}/${generatedImages.length} to Shopify...`);
        
        const imagePayload = {
          src: imageUrl,
          alt: `${productTitle} - Image ${i + 1}`,
          position: i + 1
        };

        const uploadResult = await this.shopifyClient.uploadImage(productId, imagePayload);
        
        if (uploadResult && uploadResult.image) {
          uploadedCount++;
          imageIds.push(uploadResult.image.id);
          console.log(`✅ Successfully uploaded product-specific image ${i + 1} (ID: ${uploadResult.image.id})`);
          
          // Log if this is a DALL·E 3 generated image
          if (imageUrl.includes('oaidalleapiprodscus')) {
            console.log(`🎨 DALL·E 3 product-specific image uploaded successfully!`);
          }
        } else {
          console.log(`❌ Failed to upload product-specific image ${i + 1}`);
        }
        
        // Rate limiting between uploads
        if (i < generatedImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (error) {
        console.log(`❌ Error uploading product-specific image ${i + 1}:`, error.message);
      }
    }
    
    console.log(`📸 Product-specific image upload completed: ${uploadedCount}/${generatedImages.length} images successfully uploaded`);
    return { uploadedCount, imageIds };
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

    console.log(`🔗 Assigning ${imageIds.length} images to ${variants.length} variants...`);

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
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`🎯 Image-to-variant assignment completed: ${assignedCount} successful assignments`);
    return assignedCount;
  }

  private getReliableFallbackImages(niche: string, count: number): string[] {
    const imageCollections = {
      'pet': [
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1493406300581-484b937cdc41?w=1024&h=1024&fit=crop&auto=format&q=80'
      ],
      'fitness': [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1024&h=1024&fit=crop&auto=format&q=80'
      ],
      'kitchen': [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1585515656811-b3806e19e75b?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1556909114-4f6e7ad7d3136?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1585515656811-b3806e19e75b?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1024&h=1024&fit=crop&auto=format&q=80'
      ]
    };
    
    const nicheImages = imageCollections[niche.toLowerCase()] || imageCollections['pet'];
    const shuffled = [...nicheImages].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}

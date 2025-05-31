
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
      console.log(`🎨 Generating 6 unique DALL·E 3 images for specific product: ${productTitle}`);
      
      // Generate highly specific product prompts based on exact title, features, and niche
      const imagePrompts = this.generateHighlySpecificProductPrompts(productTitle, features, niche, themeColor);

      for (let i = 0; i < 6; i++) {
        try {
          console.log(`🖼️ Generating DALL·E 3 product-specific image ${i + 1}/6 for: ${productTitle}`);
          console.log(`📝 Prompt: ${imagePrompts[i].substring(0, 120)}...`);
          
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
              quality: 'hd',
              style: 'natural'
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data[0] && data.data[0].url) {
              const imageUrl = data.data[0].url;
              images.push(imageUrl);
              console.log(`✅ DALL·E 3 specific product image ${i + 1} generated successfully for ${productTitle}`);
            } else {
              console.log(`⚠️ DALL·E 3 image ${i + 1} failed - no URL in response for ${productTitle}`);
            }
          } else {
            const errorText = await response.text();
            console.log(`⚠️ DALL·E 3 image ${i + 1} failed for ${productTitle}: ${response.status} - ${errorText.substring(0, 200)}`);
          }
          
          // Rate limiting between requests to avoid API limits
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          console.log(`⚠️ Error generating DALL·E 3 image ${i + 1} for ${productTitle}:`, error.message);
        }
      }
    } catch (error) {
      console.log(`⚠️ DALL·E 3 generation failed for ${productTitle}:`, error.message);
    }

    // If we have fewer than 4 images, add specific fallback images for this niche
    if (images.length < 4) {
      console.log(`🔄 Adding specific fallback images for ${productTitle} (current: ${images.length})`);
      const fallbackImages = this.getProductSpecificFallbackImages(productTitle, niche, 6 - images.length);
      images.push(...fallbackImages);
    }

    console.log(`📸 Total specific images generated for ${productTitle}: ${images.length} (${images.filter(img => img.includes('oaidalleapiprodscus')).length} from DALL·E 3)`);
    return images.slice(0, 6);
  }

  generateHighlySpecificProductPrompts(productTitle: string, features: string[], niche: string, themeColor: string): string[] {
    // Clean and extract key product details
    const cleanTitle = productTitle.replace(/[^\w\s-]/g, '').trim();
    const topFeatures = features.slice(0, 3);
    const featureText = topFeatures.length > 0 ? topFeatures.join(', ') : 'premium quality, durable design, easy to use';
    
    // Extract color name for prompts
    const colorMap: { [key: string]: string } = {
      '#1E40AF': 'blue',
      '#7C3AED': 'purple', 
      '#DC2626': 'red',
      '#059669': 'green',
      '#D97706': 'orange',
      '#BE185D': 'pink'
    };
    const colorName = colorMap[themeColor] || 'blue';
    
    // Create highly specific prompts that match the exact product
    const prompts = [
      // Main product shot - professional studio photography
      `Professional high-resolution product photography of "${cleanTitle}". Clean white studio background, perfect lighting, commercial product shot for e-commerce. Show the exact product as described: ${featureText}. Realistic, detailed, sharp focus, premium quality image suitable for Shopify store. 1024x1024 resolution.`,
      
      // Lifestyle/in-use shot
      `"${cleanTitle}" being used in a realistic ${niche} environment. Lifestyle photography showing the actual product in action, demonstrating its key features: ${featureText}. Natural lighting, authentic setting, people using the product, candid realistic scene. High quality detail, commercial photography style.`,
      
      // Close-up detail shot highlighting specific features
      `Extreme close-up macro photography of "${cleanTitle}" highlighting its premium features: ${featureText}. Show intricate details, build quality, materials, and craftsmanship. Professional product photography, clean white background, studio lighting, commercial style for ${niche} market.`,
      
      // Packaging and unboxing scene
      `"${cleanTitle}" with premium product packaging and unboxing presentation. Modern package design with ${colorName} accent colors, clean professional presentation, all components visible. Studio lighting, commercial product photography, e-commerce style showing what customers receive.`,
      
      // Multiple angles view
      `"${cleanTitle}" shown from multiple angles - front, side, and detail views. Professional 360-degree product photography style, clean white background, consistent lighting, showing all aspects of this ${niche} product. Commercial quality suitable for online store, highlighting ${featureText}.`,
      
      // Product with accessories or components
      `Complete "${cleanTitle}" product showcase including all accessories and components. Organized flat lay arrangement, clean white background, professional e-commerce photography. Show everything included with the product, emphasizing ${featureText}. Modern minimal design, premium presentation.`
    ];

    return prompts;
  }

  async uploadProductImages(productId: string, productTitle: string, features: string[], niche: string, themeColor: string = '#1E40AF', variants?: any[]): Promise<{ uploadedCount: number, imageIds: string[] }> {
    let uploadedCount = 0;
    const imageIds: string[] = [];
    
    console.log(`🖼️ Starting DALL·E 3 product-specific image generation for: "${productTitle}"`);
    console.log(`🎯 Product features: ${features.slice(0, 3).join(', ')}`);
    console.log(`🏪 Niche: ${niche}`);
    
    // Generate product-specific images using DALL·E 3 with exact product details
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
          await new Promise(resolve => setTimeout(resolve, 2000));
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
    // More specific fallback images based on product type and niche
    const nicheSpecificImages = {
      'pet': [
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1493406300581-484b937cdc41?w=1024&h=1024&fit=crop&auto=format&q=80'
      ],
      'kitchen': [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1585515656811-b3806e19e75b?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1556909114-4f6e7ad7d3136?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1585515656811-b3806e19e75b?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1024&h=1024&fit=crop&auto=format&q=80'
      ],
      'electronics': [
        'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1024&h=1024&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1024&h=1024&fit=crop&auto=format&q=80'
      ]
    };
    
    const images = nicheSpecificImages[niche.toLowerCase()] || nicheSpecificImages['electronics'];
    console.log(`🔄 Using ${count} specific fallback images for ${productTitle} in ${niche} niche`);
    return images.slice(0, count);
  }

  private getReliableFallbackImages(niche: string, count: number): string[] {
    return this.getProductSpecificFallbackImages('Generic Product', niche, count);
  }
}

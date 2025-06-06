export class ImageProcessor {
  constructor(private shopifyClient: any) {}

  async generateDalleImages(productTitle: string, features: string[], niche: string, themeColor: string = '#1E40AF', customPrompt?: string): Promise<string[]> {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.log('⚠️ OpenAI API key not found, using fallback images');
      return this.getProductSpecificFallbackImages(productTitle, niche, 6);
    }

    const images: string[] = [];
    
    try {
      console.log(`🎨 Generating 6 unique DALL·E 3 images for: ${productTitle}`);
      console.log(`🎯 Niche: ${niche}, Features: ${features?.slice(0, 2).join(', ')}`);
      
      // Use custom prompt if provided, otherwise generate product-specific prompts
      const imagePrompts = customPrompt 
        ? this.createPromptVariations(customPrompt, productTitle)
        : this.generateProductSpecificPrompts(productTitle, features, niche);

      // DALL·E 3 only supports 1 image per request
      for (let i = 0; i < 6; i++) {
        try {
          console.log(`🖼️ Generating DALL·E 3 image ${i + 1}/6 for: ${productTitle}`);
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
              n: 1, // DALL·E 3 only supports n=1
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
              console.log(`✅ DALL·E 3 image ${i + 1} generated successfully for ${productTitle}`);
            } else {
              console.log(`⚠️ DALL·E 3 image ${i + 1} failed - no URL in response for ${productTitle}`);
            }
          } else {
            const errorText = await response.text();
            console.log(`⚠️ DALL·E 3 image ${i + 1} failed for ${productTitle}: ${response.status} - ${errorText.substring(0, 100)}...`);
          }
          
          // Rate limiting between requests (DALL·E 3 has strict limits)
          await new Promise(resolve => setTimeout(resolve, 3000));
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

  createPromptVariations(basePrompt: string, productTitle: string): string[] {
    return [
      basePrompt,
      `${basePrompt}, close-up product details, macro photography`,
      `${basePrompt}, lifestyle setting, in-use scenario`, 
      `${basePrompt}, product packaging view, unboxing presentation`,
      `${basePrompt}, multiple angles, product showcase`,
      `${basePrompt}, professional studio lighting, commercial photography`
    ];
  }

  generateProductSpecificPrompts(productTitle: string, features: string[], niche: string): string[] {
    // Clean product title for better prompt generation
    const cleanTitle = productTitle.replace(/[^\w\s-]/g, '').trim();
    
    // Create niche-aware, product-specific prompts using the enhanced pattern
    const prompts = [
      `E-commerce style image of ${cleanTitle} with ${features?.slice(0, 2).join(', ') || 'premium features'} on clean white background, realistic lighting, professional photography`,
      
      `${cleanTitle} in lifestyle setting, ${niche.toLowerCase()} environment, natural lighting, high quality product photography`,
      
      `Close-up detail shot of ${cleanTitle}, premium quality materials visible, clean white background, macro photography, commercial style`,
      
      `${cleanTitle} with elegant packaging, product presentation, professional e-commerce photography, white background`,
      
      `Multiple angle view of ${cleanTitle}, product display showcase, clean background, commercial photography style`,
      
      `${cleanTitle} lifestyle image, modern clean setting, ${niche.toLowerCase()} environment, professional studio lighting`
    ];

    return prompts;
  }

  async uploadProductImages(productId: string, productTitle: string, features: string[], niche: string, themeColor: string = '#1E40AF', variants?: any[], customPrompt?: string): Promise<{ uploadedCount: number, imageIds: string[] }> {
    let uploadedCount = 0;
    const imageIds: string[] = [];
    
    console.log(`🖼️ Starting product-specific image generation for: "${productTitle}"`);
    console.log(`🎯 Product features: ${features?.slice(0, 3).join(', ')}`);
    console.log(`🏪 Niche: ${niche}`);
    
    // Generate product-specific images
    const generatedImages = await this.generateDalleImages(productTitle, features, niche, themeColor, customPrompt);
    
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
    // Create product-specific fallback images based on niche and title keywords
    const titleLower = productTitle.toLowerCase();
    const nicheKey = niche.toLowerCase();
    
    console.log(`🔄 Using product-specific fallback images for ${productTitle} in ${niche} niche`);
    
    // Enhanced niche-specific image mapping
    const nicheImageMap: { [key: string]: string[] } = {
      'tech': [
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1592659762303-90081d34b277?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1560472355-536de3962603?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1024&h=1024&fit=crop'
      ],
      'fitness': [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1024&h=1024&fit=crop'
      ],
      'kitchen': [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1585515656811-b3806e19e75b?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1024&h=1024&fit=crop'
      ],
      'beauty': [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1024&h=1024&fit=crop'
      ],
      'home': [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1024&h=1024&fit=crop'
      ],
      'pet': [
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1444212477490-ca407925329e?w=1024&h=1024&fit=crop'
      ]
    };

    // Find best matching niche images
    let selectedImages: string[] = [];
    
    // Check for exact niche match first
    if (nicheImageMap[nicheKey]) {
      selectedImages = [...nicheImageMap[nicheKey]];
    } else {
      // Check for partial matches in niche name
      for (const [key, images] of Object.entries(nicheImageMap)) {
        if (nicheKey.includes(key) || key.includes(nicheKey)) {
          selectedImages = [...images];
          break;
        }
      }
    }

    // Default to tech images if no match
    if (selectedImages.length === 0) {
      selectedImages = [...nicheImageMap['tech']];
    }

    // Duplicate and return required count
    while (selectedImages.length < count) {
      selectedImages.push(...selectedImages);
    }

    return selectedImages.slice(0, count);
  }
}


export class NichePromptService {
  
  static generateProductPrompt(
    productData: any,
    niche: string,
    targetAudience: string,
    storeStyle: string = 'modern'
  ): string {
    const nicheSpecificPrompts = {
      'pets': `You are an expert copywriter for pet product stores. Write emotional, caring content that focuses on the love between pets and their owners. Use words like "beloved", "furry friend", "companion", and emphasize safety, comfort, and bonding. Target audience: ${targetAudience}.`,
      
      'baby': `You are a copywriter specializing in baby products. Write content that emphasizes safety, development, and parent peace-of-mind. Use gentle, nurturing language and focus on milestones, protection, and convenience for busy parents. Target audience: ${targetAudience}.`,
      
      'beauty': `You are a beauty and skincare expert copywriter. Write luxurious, aspirational content that focuses on transformation, self-care, and confidence. Use terms like "radiant", "luminous", "pamper yourself", and emphasize results and premium quality. Target audience: ${targetAudience}.`,
      
      'fitness': `You are a fitness industry copywriter. Write motivational, energetic content that focuses on transformation, strength, and achieving goals. Use action words like "power through", "dominate", "achieve", and emphasize results and perseverance. Target audience: ${targetAudience}.`,
      
      'tech': `You are a tech product copywriter. Write innovative, cutting-edge content that focuses on efficiency, smart features, and future-forward benefits. Use terms like "revolutionary", "smart", "seamless", and emphasize how technology improves daily life. Target audience: ${targetAudience}.`,
      
      'kitchen': `You are a culinary copywriter. Write content that focuses on cooking joy, family time, and creating delicious meals. Use terms like "culinary", "gourmet", "effortless cooking", and emphasize convenience and quality results. Target audience: ${targetAudience}.`,
      
      'home': `You are a home improvement copywriter. Write content that focuses on comfort, style, and creating the perfect living space. Use terms like "sanctuary", "cozy", "stylish living", and emphasize quality of life improvements. Target audience: ${targetAudience}.`,
      
      'fashion': `You are a fashion copywriter. Write trendy, style-conscious content that focuses on self-expression, confidence, and staying current. Use terms like "chic", "on-trend", "statement piece", and emphasize personal style and confidence. Target audience: ${targetAudience}.`,
      
      'car': `You are an automotive copywriter. Write content that focuses on performance, safety, and driving experience enhancement. Use terms like "precision", "reliability", "enhanced performance", and emphasize quality and durability. Target audience: ${targetAudience}.`,
      
      'gifts': `You are a gift specialist copywriter. Write content that focuses on thoughtfulness, special occasions, and creating memorable moments. Use terms like "thoughtful", "memorable", "special moment", and emphasize emotional value and uniqueness. Target audience: ${targetAudience}.`
    };

    const basePrompt = nicheSpecificPrompts[niche.toLowerCase() as keyof typeof nicheSpecificPrompts] || 
      `You are a professional e-commerce copywriter. Write compelling product content that converts browsers into buyers.`;

    return `${basePrompt}

PRODUCT TO REWRITE:
Title: ${productData.title}
Current Price: $${productData.price}
Rating: ${productData.rating}/5 (${productData.orders} orders)
Features: ${productData.features?.join(', ') || 'Premium quality product'}

REQUIREMENTS:
1. Create a catchy, benefit-focused title (different from original, max 60 characters)
2. Write a compelling 500-800 word description with:
   - Emotional hook opening
   - 4-5 key benefits (not just features)
   - Use cases specific to ${targetAudience}
   - Social proof elements
   - Strong call-to-action
3. Extract 4-5 key features that appeal to ${targetAudience}
4. List 3-4 main benefits for ${targetAudience}
5. Create a DALL·E 3 prompt for realistic product images

TONE: ${storeStyle === 'luxury' ? 'Premium and sophisticated' : storeStyle === 'fun' ? 'Playful and energetic' : 'Professional and trustworthy'}

Return ONLY this JSON:
{
  "title": "Optimized product title for ${targetAudience}",
  "description": "500-800 word description with emotional appeal...",
  "features": ["benefit-focused feature 1", "benefit-focused feature 2", "benefit-focused feature 3", "benefit-focused feature 4"],
  "benefits": ["key benefit 1", "key benefit 2", "key benefit 3"],
  "dallePrompt": "Professional e-commerce image of [PRODUCT] with [KEY FEATURES] on clean white background, realistic lighting, ${storeStyle} style",
  "recommendedPrice": ${Math.max(15, Math.min(80, productData.price * 2))}
}`;
  }

  static generateImagePrompt(
    productTitle: string,
    features: string[],
    niche: string,
    imageVariation: number = 1
  ): string {
    const nicheStyles = {
      'pets': 'cute, pet-friendly environment',
      'baby': 'soft, safe, pastel colors',
      'beauty': 'elegant, spa-like, luxurious',
      'fitness': 'dynamic, energetic, athletic',
      'tech': 'sleek, modern, high-tech',
      'kitchen': 'clean, culinary, professional',
      'home': 'cozy, stylish, comfortable',
      'fashion': 'trendy, stylish, fashionable',
      'car': 'sleek, automotive, premium',
      'gifts': 'elegant, gift-worthy, special'
    };

    const variations = [
      'product only on white background, professional lighting',
      'lifestyle setting with product in use, natural lighting',
      'close-up detail shot showing key features, macro photography',
      'multiple angle view showcasing product design',
      'packaging and unboxing presentation view',
      'product with accessories and complementary items'
    ];

    const nicheStyle = nicheStyles[niche.toLowerCase() as keyof typeof nicheStyles] || 'professional, high-quality';
    const variation = variations[imageVariation % variations.length];
    const keyFeatures = features.slice(0, 2).join(' and ');

    return `Professional e-commerce photograph of ${productTitle} featuring ${keyFeatures}, ${variation}, ${nicheStyle}, high resolution, photorealistic, commercial photography style`;
  }
}

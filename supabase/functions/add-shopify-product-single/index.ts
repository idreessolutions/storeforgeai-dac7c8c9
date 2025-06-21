
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Copy the ShopifyAPIClient class directly instead of importing
export class ShopifyAPIClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(shopUrl: string, accessToken: string) {
    this.baseUrl = shopUrl.replace(/\/$/, '');
    this.accessToken = accessToken;
  }

  async createProduct(productData: any): Promise<any> {
    console.log('🛒 Creating product in Shopify:', productData.product.title);
    
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/products.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create product: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  async uploadImage(productId: string, imageData: any): Promise<any> {
    console.log(`📸 Uploading image for product ${productId}`);
    
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/products/${productId}/images.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: imageData })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Image upload failed: ${response.status} - ${errorText}`);
      return null;
    }

    return await response.json();
  }

  async createVariant(productId: string, variantData: any): Promise<any> {
    console.log(`🎯 Creating variant for product ${productId}`);
    
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/products/${productId}/variants.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ variant: variantData })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Variant creation failed: ${response.status} - ${errorText}`);
      return null;
    }

    return await response.json();
  }

  async updateVariant(variantId: string, variantData: any): Promise<boolean> {
    console.log(`🔄 Updating variant ${variantId}`);
    
    const response = await fetch(`${this.baseUrl}/admin/api/2024-10/variants/${variantId}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ variant: variantData })
    });

    return response.ok;
  }
}

// Copy the EnhancedAliExpressImageService class directly
export class EnhancedAliExpressImageService {
  static getRealProductImages(niche: string, productIndex: number, productTitle: string): string[] {
    const nicheImageSets = {
      'pets': [
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
        'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400',
        'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400',
        'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400'
      ],
      'fitness': [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400',
        'https://images.unsplash.com/photo-1434596922112-19c563067271?w=400',
        'https://images.unsplash.com/photo-1549476464-37392f717541?w=400',
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
        'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400'
      ],
      'beauty': [
        'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
        'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400',
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400'
      ],
      'tech': [
        'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=400',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
        'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
      ],
      'baby': [
        'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
        'https://images.unsplash.com/photo-1544945827-0f4fd5de582c?w=400',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
        'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=400',
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400'
      ],
      'home': [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        'https://images.unsplash.com/photo-1572297648687-0d73e7b86048?w=400',
        'https://images.unsplash.com/photo-1501342418113-ff8de6c8bdbe?w=400',
        'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=400'
      ],
      'fashion': [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400'
      ],
      'kitchen': [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        'https://images.unsplash.com/photo-1572297648687-0d73e7b86048?w=400',
        'https://images.unsplash.com/photo-1501342418113-ff8de6c8bdbe?w=400',
        'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=400'
      ],
      'gaming': [
        'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
        'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
        'https://images.unsplash.com/photo-1552820728-909c6c077661?w=400',
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
        'https://images.unsplash.com/photo-1548092372-0d1bd40894a3?w=400'
      ],
      'travel': [
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400'
      ],
      'office': [
        'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400',
        'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=400',
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400',
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400'
      ],
      'toy': [
        'https://images.unsplash.com/photo-1558877385-8c3cf1869973?w=400',
        'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
        'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=400',
        'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400',
        'https://images.unsplash.com/photo-1632482434103-b3c55c6ac2fb?w=400',
        'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400'
      ]
    };

    const defaultImages = [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
      'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400'
    ];

    const images = nicheImageSets[niche.toLowerCase() as keyof typeof nicheImageSets] || defaultImages;
    const startIndex = (productIndex * 2) % images.length;
    
    return [
      images[startIndex],
      images[(startIndex + 1) % images.length],
      images[(startIndex + 2) % images.length],
      images[(startIndex + 3) % images.length],
      images[(startIndex + 4) % images.length],
      images[(startIndex + 5) % images.length]
    ];
  }
}

// Copy the EnhancedProductGenerator class directly
export class EnhancedProductGenerator {
  static generateNicheSpecificDescription(title: string, niche: string, businessType: string, storeStyle: string, targetAudience: string): string {
    const nicheDescriptions = {
      'pets': `Transform your pet's life with this premium ${title}. Designed specifically for pet lovers who demand the best for their furry companions. Made with high-quality materials that ensure durability and comfort.`,
      'fitness': `Achieve your fitness goals with this professional-grade ${title}. Perfect for fitness enthusiasts who are serious about their health and performance. Built to withstand intense workouts.`,
      'beauty': `Elevate your beauty routine with this luxurious ${title}. Crafted for those who appreciate premium skincare and beauty products. Experience the difference quality makes.`,
      'tech': `Stay ahead with this cutting-edge ${title}. Designed for tech enthusiasts who demand innovation and performance. Features the latest technology for optimal results.`,
      'baby': `Keep your little one safe and happy with this essential ${title}. Specially designed for caring parents who prioritize their baby's comfort and safety.`,
      'home': `Transform your living space with this stylish ${title}. Perfect for homeowners who appreciate quality design and functionality in their home decor.`,
      'fashion': `Express your unique style with this trendy ${title}. Designed for fashion-forward individuals who love to make a statement with their wardrobe choices.`,
      'kitchen': `Elevate your cooking experience with this innovative ${title}. Perfect for home chefs who appreciate quality kitchen tools and gadgets.`,
      'gaming': `Level up your gaming experience with this premium ${title}. Designed for serious gamers who demand performance and reliability.`,
      'travel': `Make your travels more comfortable with this essential ${title}. Perfect for adventurers who value convenience and quality on the go.`,
      'office': `Boost your productivity with this professional ${title}. Ideal for professionals who value efficiency and quality in their workspace.`,
      'toy': `Spark imagination and creativity with this amazing ${title}. Perfect for children and parents who appreciate safe, educational, and fun toys.`
    };

    const baseDescription = nicheDescriptions[niche.toLowerCase() as keyof typeof nicheDescriptions] || 
      `Discover the exceptional quality of this premium ${title}. Carefully selected for discerning customers who value excellence.`;

    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50; margin-bottom: 15px;">✨ Premium ${niche.charAt(0).toUpperCase() + niche.slice(1)} Product</h2>
        <p style="font-size: 16px; margin-bottom: 20px;">${baseDescription}</p>
        
        <h3 style="color: #e74c3c; margin-bottom: 10px;">🎯 Key Features:</h3>
        <ul style="padding-left: 20px; margin-bottom: 20px;">
          <li>Premium quality materials and construction</li>
          <li>Designed specifically for ${targetAudience.toLowerCase()}</li>
          <li>Perfect for ${businessType} customers</li>
          <li>Matches ${storeStyle} aesthetic perfectly</li>
          <li>Satisfaction guaranteed</li>
        </ul>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #28a745; margin-bottom: 10px;">🚀 Why Choose This Product?</h4>
          <p>Join thousands of satisfied customers who have made this their go-to choice. Fast shipping, excellent customer service, and a 30-day money-back guarantee.</p>
        </div>
      </div>
    `;
  }

  static generateSmartVariations(basePrice: number, niche: string): Array<{title: string, price: number, color?: string, size?: string, style?: string}> {
    const variations = [
      { title: "Premium Edition", price: basePrice * 1.3, style: "Premium" },
      { title: "Deluxe Package", price: basePrice * 1.5, style: "Deluxe" }
    ];

    return variations;
  }
}

// Copy the VariantManager class directly
export class VariantManager {
  private shopifyClient: ShopifyAPIClient;

  constructor(shopifyClient: ShopifyAPIClient) {
    this.shopifyClient = shopifyClient;
  }

  async updateDefaultVariant(variant: any, price: string): Promise<boolean> {
    return await this.shopifyClient.updateVariant(variant.id, {
      price: price,
      compare_at_price: (parseFloat(price) * 1.3).toFixed(2)
    });
  }

  async createProductVariant(productId: string, title: string, price: string, option: string): Promise<any> {
    return await this.shopifyClient.createVariant(productId, {
      option1: option,
      price: price,
      inventory_quantity: 100,
      inventory_management: null
    });
  }
}

// Copy helper functions directly
export const extractStoreNameFromUrl = (url: string): string => {
  if (!url) return '';
  
  console.log('🔍 EXTRACTING FROM:', url);
  
  if (url.includes('admin.shopify.com/store/')) {
    const match = url.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
    if (match) {
      const storeId = match[1];
      console.log('✅ EXTRACTED ADMIN URL:', storeId);
      return storeId;
    }
  }
  
  let domain = url.replace(/^https?:\/\//, '');
  
  if (domain.includes('.myshopify.com')) {
    const cleanDomain = domain.split('/')[0];
    const storeName = cleanDomain.replace('.myshopify.com', '');
    console.log('✅ EXTRACTED MYSHOPIFY:', storeName);
    return storeName;
  }
  
  const finalStoreName = domain.split('/')[0];
  console.log('✅ EXTRACTED GENERAL:', finalStoreName);
  return finalStoreName;
};

export const generateUniqueHandle = (title: string, timestamp: number): string => {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50) + `-${timestamp}`;
};

export const applyThemeColorToDescription = (description: string, themeColor: string): string => {
  return description.replace(/#e74c3c/g, themeColor || '#e74c3c');
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      shopifyUrl, 
      accessToken, 
      themeColor, 
      product, 
      storeName, 
      targetAudience, 
      storeStyle, 
      businessType, 
      productIndex,
      niche 
    } = await req.json();
    
    console.log('🚨 SINGLE PRODUCT UPLOAD: Processing product:', {
      title: product?.title?.substring(0, 50),
      storeName: storeName,
      niche: niche,
      productIndex: productIndex,
      businessType: businessType,
      storeStyle: storeStyle
    });
    
    if (!shopifyUrl || !accessToken || !product) {
      throw new Error('Missing required parameters: shopifyUrl, accessToken, or product');
    }

    // Initialize API clients
    const extractedStoreName = extractStoreNameFromUrl(shopifyUrl);
    const fullShopifyUrl = `https://${extractedStoreName}.myshopify.com`;
    const shopifyClient = new ShopifyAPIClient(fullShopifyUrl, accessToken);
    const variantManager = new VariantManager(shopifyClient);

    // Generate enhanced description
    const enhancedDescription = EnhancedProductGenerator.generateNicheSpecificDescription(
      product.title,
      niche,
      businessType || 'e-commerce',
      storeStyle || 'modern',
      targetAudience || 'Everyone'
    );
    
    const styledDescription = applyThemeColorToDescription(enhancedDescription, themeColor);
    const timestamp = Date.now();
    const uniqueHandle = generateUniqueHandle(product.title, timestamp);
    const productPrice = product.price?.toFixed(2) || '29.99';
    
    console.log('🚨 PRODUCT DETAILS:', {
      title: product.title?.substring(0, 40),
      price: productPrice,
      niche: niche,
      handle: uniqueHandle,
      businessType: businessType,
      storeStyle: storeStyle
    });

    // Create main product payload
    const productPayload = {
      product: {
        title: product.title,
        body_html: styledDescription,
        vendor: storeName || extractedStoreName || 'Premium Store',
        product_type: product.category || niche || 'General',
        handle: uniqueHandle,
        status: 'active',
        published: true,
        tags: `${niche}, ${targetAudience}, ${storeStyle}, ${businessType}, ${storeName}, enhanced-product-${productIndex + 1}`,
        metafields: [
          {
            namespace: 'custom',
            key: 'business_model',
            value: businessType || 'e-commerce',
            type: 'single_line_text_field'
          },
          {
            namespace: 'custom',
            key: 'store_style',
            value: storeStyle || 'modern',
            type: 'single_line_text_field'
          },
          {
            namespace: 'custom',
            key: 'niche',
            value: niche || 'general',
            type: 'single_line_text_field'
          }
        ]
      }
    };

    console.log('🚨 CREATING PRODUCT: With enhanced payload');

    // Create product in Shopify
    const productData = await shopifyClient.createProduct(productPayload);
    const createdProduct = productData.product;

    console.log('✅ PRODUCT CREATED:', createdProduct.id);

    // Upload images
    let uploadedImageCount = 0;
    let imageIds: string[] = [];
    
    console.log(`🚨 STARTING IMAGE UPLOAD: Using enhanced images for ${niche}`);
    
    try {
      const realImages = EnhancedAliExpressImageService.getRealProductImages(niche, productIndex, createdProduct.title);
      
      for (let i = 0; i < Math.min(realImages.length, 6); i++) {
        const imageUrl = realImages[i];
        console.log(`🔄 UPLOADING IMAGE ${i + 1}/6: ${imageUrl}`);

        try {
          const imagePayload = {
            src: imageUrl,
            alt: `${createdProduct.title} - Product Image ${i + 1}`,
            position: i + 1,
            filename: `product-${createdProduct.id}-image-${i + 1}.jpg`
          };

          const response = await shopifyClient.uploadImage(createdProduct.id, imagePayload);

          if (response && response.image && response.image.id) {
            imageIds.push(response.image.id.toString());
            uploadedImageCount++;
            console.log(`✅ IMAGE SUCCESS: Image ${i + 1} uploaded with ID: ${response.image.id}`);
          }
        } catch (imageError) {
          console.error(`❌ IMAGE ERROR: Image ${i + 1} failed:`, imageError);
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      console.log(`🎉 IMAGE UPLOAD SUCCESS: ${uploadedImageCount} images uploaded`);
      
    } catch (imageError) {
      console.error('🚨 IMAGE UPLOAD ERROR:', imageError);
    }

    // Update default variant with correct pricing
    let variantUpdateSuccess = false;
    let createdVariants: any[] = [];
    
    if (createdProduct.variants && createdProduct.variants.length > 0) {
      const defaultVariant = createdProduct.variants[0];
      variantUpdateSuccess = await variantManager.updateDefaultVariant(defaultVariant, productPrice);
      createdVariants.push(defaultVariant);
      console.log(`✅ DEFAULT VARIANT UPDATED: Price set to $${productPrice}`);
    }

    // Create product variations
    let createdVariantCount = 0;
    console.log(`🚨 CREATING VARIATIONS: Smart variations for ${niche}`);
    
    const smartVariations = EnhancedProductGenerator.generateSmartVariations(parseFloat(productPrice), niche);
    
    for (let i = 0; i < Math.min(smartVariations.length, 2); i++) {
      const variation = smartVariations[i];
      
      try {
        const newVariant = await variantManager.createProductVariant(
          createdProduct.id,
          variation.title,
          variation.price.toFixed(2),
          variation.color || variation.size || variation.style || 'Standard'
        );
        
        if (newVariant) {
          createdVariants.push(newVariant);
          createdVariantCount++;
          console.log(`✅ VARIATION SUCCESS: "${variation.title}" at $${variation.price.toFixed(2)}`);
        }
      } catch (variantError) {
        console.error(`❌ Variation creation failed for "${variation.title}":`, variantError);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    const isSuccessful = createdProduct.id && uploadedImageCount >= 3;
    
    console.log('🎉 SINGLE PRODUCT COMPLETE - RESULTS:', {
      productId: createdProduct.id,
      title: createdProduct.title?.substring(0, 50),
      price: productPrice,
      imagesUploaded: uploadedImageCount,
      variantsCreated: createdVariantCount,
      niche: niche,
      status: isSuccessful ? 'SUCCESS' : 'PARTIAL_SUCCESS'
    });

    return new Response(JSON.stringify({
      success: isSuccessful,
      product: createdProduct,
      message: isSuccessful ? 
        `SUCCESS: "${createdProduct.title}" created with ${uploadedImageCount} images and ${createdVariantCount} variants!` :
        `PARTIAL SUCCESS: Product created with ${uploadedImageCount} images`,
      price_set: productPrice,
      images_uploaded: uploadedImageCount,
      variants_created: createdVariantCount,
      niche_applied: niche,
      shopify_integration: 'COMPLETE'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('🚨 SINGLE PRODUCT ERROR:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Single product creation failed',
      debug_info: {
        error_type: error.name,
        error_message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

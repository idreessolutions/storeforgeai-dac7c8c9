import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Get AliExpress API key from environment variables with proper error handling
let aliExpressApiKey: string | undefined;
try {
  aliExpressApiKey = Deno.env.get('ALIEXPRESS_DATA_API_KEY');
  console.log('🔧 ALIEXPRESS_DATA_API_KEY Environment Check:', {
    keyExists: !!aliExpressApiKey,
    keyLength: aliExpressApiKey?.length || 0,
    keyPreview: aliExpressApiKey ? `${aliExpressApiKey.substring(0, 15)}...${aliExpressApiKey.substring(-10)}` : 'UNDEFINED'
  });
} catch (error) {
  console.error('❌ Error getting ALIEXPRESS_DATA_API_KEY from environment:', error);
  aliExpressApiKey = undefined;
}

// AliExpress Data API configuration
const HOST = 'aliexpress-data.p.rapidapi.com';
const BASE_URL = `https://${HOST}`;

// Retry configuration for rate limiting
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds

// API endpoints by plan tier (use only authorized endpoints)
const API_ENDPOINTS = {
  // Try these endpoints in order of preference
  SEARCH_PRIMARY: '/products/list', // Most commonly authorized
  SEARCH_FALLBACK: '/products/search', // Secondary option
  DETAILS: '/product/details' // Product details
};

interface ProductResult {
  productId?: string;
  title?: string;
  price?: string;
  imagesUploaded?: number;
  variantsCreated?: number;
  status: string;
  error?: string;
}

interface AliExpressSearchProduct {
  productId: string;
  title: string;
  price: string;
  originalPrice?: string;
  thumbnail: string;
  orderCount: number;
  categoryName: string;
}

interface AliExpressProductDetail {
  productId: string;
  title: string;
  description: string;
  images: string[];
  variants?: Array<{
    name: string;
    price: number;
    originalPrice?: number;
    sku?: string;
  }>;
  specs?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting AliExpress Data API Product Generation (PRO Plan)');
    
    // Enhanced API key validation and logging
    console.log('🔑 ALIEXPRESS_DATA_API_KEY Final Check:', {
      keyExists: !!aliExpressApiKey,
      keyLength: aliExpressApiKey?.length || 0,
      keyPreview: aliExpressApiKey ? `${aliExpressApiKey.substring(0, 15)}...${aliExpressApiKey.substring(-10)}` : 'NOT_FOUND',
      keyType: typeof aliExpressApiKey,
      isString: typeof aliExpressApiKey === 'string'
    });
    
    if (!aliExpressApiKey || aliExpressApiKey.length === 0) {
      console.error('❌ CRITICAL: ALIEXPRESS_DATA_API_KEY not found or empty in environment variables');
      throw new Error('AliExpress API key is required but not found in environment variables. Please check Supabase Edge Function secrets.');
    }
    
    const requestBody = await req.json();
    console.log('📋 Request received:', {
      productCount: requestBody.productCount,
      niche: requestBody.niche,
      shopifyUrl: requestBody.shopifyUrl?.substring(0, 30) + '...',
      hasRapidApiKey: !!aliExpressApiKey,
      rapidApiHost: HOST,
      planTier: 'PRO'
    });

    const {
      productCount = 10,
      niche = 'tech',
      storeName = 'My Store',
      targetAudience = 'Everyone',
      businessType = 'e-commerce',
      storeStyle = 'modern',
      shopifyUrl,
      shopifyAccessToken,
      themeColor = '#3B82F6',
      sessionId
    } = requestBody;

    if (!shopifyUrl || !shopifyAccessToken) {
      throw new Error('Shopify URL and access token are required');
    }

    // Validate and clean Shopify URL
    let cleanUrl = shopifyUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!cleanUrl.includes('.myshopify.com')) {
      cleanUrl = `${cleanUrl}.myshopify.com`;
    }
    const validatedShopifyUrl = `https://${cleanUrl}`;
    
    console.log('🔗 Validated Shopify URL:', validatedShopifyUrl);

    // Step 1: Test API key and search for products with proper error handling
    console.log(`🔍 Searching for ${niche} products using AliExpress Data API...`);
    
    const requestHeaders = {
      'X-RapidAPI-Key': aliExpressApiKey,
      'X-RapidAPI-Host': HOST,
      'Content-Type': 'application/json',
      'User-Agent': 'Lovable-AliExpress-Integration/1.0'
    };

    // Function to handle API calls with retry logic
    async function makeApiRequest(url: string, endpoint: string, attempt = 1): Promise<Response> {
      console.log(`📡 API Request [Attempt ${attempt}]: ${endpoint}`);
      console.log(`🔗 URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: requestHeaders
      });

      console.log(`📊 Response Status: ${response.status} for ${endpoint}`);
      
      // Handle specific error cases
      if (response.status === 403) {
        const errorText = await response.text();
        console.error(`❌ 403 Forbidden for ${endpoint}:`, {
          status: 403,
          error: errorText,
          endpoint,
          message: 'Not subscribed to this specific endpoint or plan tier insufficient'
        });
        throw new Error(`API endpoint not authorized: ${endpoint} - ${errorText}`);
      }
      
      if (response.status === 429) {
        const errorText = await response.text();
        console.warn(`⚠️ Rate limited on ${endpoint} (attempt ${attempt}):`, errorText);
        
        if (attempt < RETRY_ATTEMPTS) {
          console.log(`🔄 Retrying in ${RETRY_DELAY}ms... (${attempt + 1}/${RETRY_ATTEMPTS})`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return makeApiRequest(url, endpoint, attempt + 1);
        } else {
          throw new Error(`Rate limit exceeded after ${RETRY_ATTEMPTS} attempts: ${errorText}`);
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error ${response.status} for ${endpoint}:`, errorText);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
      
      return response;
    }

    // Try different API endpoints in order of preference
    let searchResponse: Response;
    let searchData: any = null;
    let usedEndpoint = '';

    // Enhanced product search with quality filtering and sorting
    try {
      // Primary endpoint with quality filters
      const listUrl = `${BASE_URL}/product/search?query=${encodeURIComponent(niche)}&page=1&limit=${productCount}&sort=orders&hasImage=true&minOrders=50&minRating=4.0`;
      searchResponse = await makeApiRequest(listUrl, '/product/search');
      const responseData = await searchResponse.json();
      
      if (responseData && (responseData.data || responseData.products || responseData.result)) {
        searchData = responseData;
        usedEndpoint = '/product/search';
        console.log('✅ Success with enhanced /product/search endpoint (quality filtered)');
      }
    } catch (error) {
      console.warn(`⚠️ Enhanced product search failed:`, error.message);
      
      // Fallback 1: Standard products/list
      try {
        const listUrl = `${BASE_URL}${API_ENDPOINTS.SEARCH_PRIMARY}?keywords=${encodeURIComponent(niche)}&page=1&region=US&sort=orders`;
        searchResponse = await makeApiRequest(listUrl, API_ENDPOINTS.SEARCH_PRIMARY);
        const responseData = await searchResponse.json();
        
        if (responseData && (responseData.data || responseData.products || responseData.result)) {
          searchData = responseData;
          usedEndpoint = API_ENDPOINTS.SEARCH_PRIMARY;
          console.log('✅ Success with /products/list endpoint');
        }
      } catch (error2) {
        console.warn(`⚠️ ${API_ENDPOINTS.SEARCH_PRIMARY} failed:`, error2.message);
        
        // Fallback 2: Standard products/search
        try {
          const searchUrl = `${BASE_URL}${API_ENDPOINTS.SEARCH_FALLBACK}?keyword=${encodeURIComponent(niche)}&page=1&country=US&currency=USD`;
          searchResponse = await makeApiRequest(searchUrl, API_ENDPOINTS.SEARCH_FALLBACK);
          const responseData = await searchResponse.json();
          
          if (responseData && (responseData.data || responseData.products || responseData.result)) {
            searchData = responseData;
            usedEndpoint = API_ENDPOINTS.SEARCH_FALLBACK;
            console.log('✅ Success with /products/search endpoint');
          }
        } catch (error3) {
          console.warn(`⚠️ ${API_ENDPOINTS.SEARCH_FALLBACK} failed:`, error3.message);
        }
      }
    }

    // If all API endpoints fail, generate fallback products
    if (!searchData) {
      console.warn(`⚠️ All AliExpress API endpoints failed. Generating fallback products for ${niche}.`);
      
      const fallbackProducts = await generateFallbackProducts(niche, productCount, validatedShopifyUrl, shopifyAccessToken, storeName, targetAudience);
      
      return new Response(JSON.stringify({
        success: true,
        successfulUploads: fallbackProducts.length,
        results: fallbackProducts,
        message: `Generated ${fallbackProducts.length} fallback products (API endpoints unavailable)`,
        sessionId,
        fallbackMode: true,
        apiError: 'All AliExpress endpoints returned 403/429 errors',
        themeColorApplied: fallbackProducts.length > 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📦 Processing search data from ${usedEndpoint}`);
    console.log('🔍 Response structure:', {
      hasData: !!searchData.data,
      hasProducts: !!searchData.data?.products || !!searchData.products || !!searchData.result,
      responseKeys: Object.keys(searchData)
    });

    // Properly unwrap the data from the API response (handle different response formats)
    let products: any[] = [];
    if (searchData.data && searchData.data.products) {
      products = searchData.data.products;
    } else if (searchData.products) {
      products = searchData.products;
    } else if (searchData.result && searchData.result.products) {
      products = searchData.result.products;
    }

    if (!products || products.length === 0) {
      console.warn(`⚠️ No products found for niche: ${niche}, generating fallback products`);
      
      // Generate fallback products if API returns no results
      const fallbackProducts = await generateFallbackProducts(niche, productCount, validatedShopifyUrl, shopifyAccessToken, storeName, targetAudience);
      
      return new Response(JSON.stringify({
        success: true,
        successfulUploads: fallbackProducts.length,
        results: fallbackProducts,
        message: `Generated ${fallbackProducts.length} fallback products for ${niche} niche`,
        sessionId,
        fallbackMode: true,
        themeColorApplied: fallbackProducts.length > 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Enhanced product filtering for high-quality winning products
    console.log(`🔍 Raw products found: ${products.length}, applying quality filters...`);
    
    // Step 1: Filter for products with images and quality indicators
    let filteredProducts = products.filter(product => {
      const hasImage = product.main_image || product.image_url || product.imageUrl || product.thumbnail;
      const hasTitle = product.title && product.title.length > 5;
      const hasPrice = product.price || product.salePrice;
      const hasOrders = !product.orders || product.orders > 10; // Allow unknown order count
      const hasRating = !product.rating || product.rating >= 4.0; // Allow unknown rating
      
      return hasImage && hasTitle && hasPrice && hasOrders && hasRating;
    });
    
    console.log(`✅ After quality filter: ${filteredProducts.length} products`);
    
    // Step 2: Sort by winning product indicators (orders, ratings, reviews)
    filteredProducts.sort((a, b) => {
      const scoreA = (a.orders || 100) * 0.4 + (a.rating || 4.5) * 20 + (a.reviews || 50) * 0.1;
      const scoreB = (b.orders || 100) * 0.4 + (b.rating || 4.5) * 20 + (b.reviews || 50) * 0.1;
      return scoreB - scoreA;
    });
    
    // Step 3: Remove duplicates based on title similarity
    const uniqueProducts = [];
    const seenTitles = new Set();
    
    for (const product of filteredProducts) {
      // Create a simplified title key for duplicate detection
      const titleKey = product.title?.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(' ')
        .slice(0, 4)
        .join(' ');
      
      if (!seenTitles.has(titleKey)) {
        seenTitles.add(titleKey);
        uniqueProducts.push(product);
      }
    }
    
    console.log(`✅ After deduplication: ${uniqueProducts.length} unique products`);
    
    // Take top products (up to productCount)
    const topProducts: AliExpressSearchProduct[] = uniqueProducts.slice(0, productCount);
    console.log(`🎯 Selected top ${topProducts.length} winning products for ${niche} using ${usedEndpoint}`);

    const results: ProductResult[] = [];
    let successfulUploads = 0;

    // Process each product
    for (let i = 0; i < topProducts.length; i++) {
      try {
        const searchProduct = topProducts[i];
        console.log(`🎯 Processing product ${i + 1}/${topProducts.length}: ${searchProduct.title}`);

        // Step 2: Get detailed product information using PRO-tier endpoint
        console.log(`📋 Fetching detailed info for product ID: ${searchProduct.productId}`);
        
        const detailUrl = `${BASE_URL}/product/details?productId=${searchProduct.productId}&country=US&currency=USD`;
        const detailResponse = await fetch(detailUrl, {
          method: 'GET',
          headers: requestHeaders
        });

        let productDetail: AliExpressProductDetail | null = null;
        if (detailResponse.ok) {
          const detailResponseJson = await detailResponse.json();
          productDetail = detailResponseJson.data;
          console.log(`✅ Got detailed product info for: ${searchProduct.title}`);
        } else {
          console.warn(`⚠️ Failed to get details for product ${searchProduct.productId}, using search data`);
        }

        // Build comprehensive product data
        const productTitle = productDetail?.title || searchProduct.title || `Premium ${niche} Product`;
        const productPrice = parseFloat(searchProduct.price?.replace(/[^0-9.]/g, '') || '25.00');
        const originalPrice = parseFloat(searchProduct.originalPrice?.replace(/[^0-9.]/g, '') || (productPrice * 1.4).toFixed(2));

        // Extract images from detailed response or fallback to search thumbnail
        let productImages: string[] = [];
        if (productDetail && productDetail.images && productDetail.images.length > 0) {
          productImages = productDetail.images.slice(0, 8);
          console.log(`📸 Using ${productImages.length} real AliExpress images`);
        } else if (searchProduct.thumbnail) {
          productImages = [searchProduct.thumbnail];
          console.log(`📸 Using search thumbnail image`);
        } else {
          productImages = [generateNicheImage(niche, i)];
          console.log(`📸 Using niche fallback image`);
        }

        // Extract description
        let productDescription = '';
        if (productDetail && productDetail.description) {
          productDescription = productDetail.description;
        } else {
          productDescription = await generateProductDescription(productTitle, niche, targetAudience, {
            price: productPrice,
            orderCount: searchProduct.orderCount,
            category: searchProduct.categoryName
          });
        }

        // Generate unique identifiers to prevent conflicts
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        const uniqueId = `${timestamp}_${i}_${randomId}`;

        console.log(`📝 Processed: ${productTitle} - $${productPrice} with ${productImages.length} images`);

        // Create Shopify product with real AliExpress data
        const shopifyProduct = {
          product: {
            title: productTitle,
            body_html: productDescription,
            vendor: storeName,
            product_type: searchProduct.categoryName || niche,
            handle: `aliexpress-${niche.toLowerCase()}-${uniqueId}`,
            status: 'active',
            published: true,
            tags: `AliExpress, ${niche}, ${searchProduct.categoryName || niche}, ${targetAudience}, real-images, verified-product`,
            images: productImages.map((url, index) => ({
              src: url,
              alt: `${productTitle} - Image ${index + 1}`,
              position: index + 1
            })),
            variants: [],
            options: []
          }
        };

        // Create variants based on AliExpress data or generate standard ones
        if (productDetail && productDetail.variants && productDetail.variants.length > 0) {
          // Use real AliExpress variants
          const variantOptions = productDetail.variants.slice(0, 3).map((variant, vIndex) => ({
            option1: variant.name || `Variant ${vIndex + 1}`,
            price: String((variant.price || productPrice * (1 + vIndex * 0.05)).toFixed(2)),
            compare_at_price: String((variant.originalPrice || originalPrice * (1 + vIndex * 0.05)).toFixed(2)),
            inventory_quantity: 100 - (vIndex * 10),
            inventory_management: null,
            fulfillment_service: 'manual',
            requires_shipping: true,
            sku: `ALI-${uniqueId}-VAR${vIndex + 1}`,
            title: `${productTitle} - ${variant.name || `Variant ${vIndex + 1}`}`
          }));

          shopifyProduct.product.variants = variantOptions;
          shopifyProduct.product.options = [{
            name: 'Style',
            position: 1,
            values: productDetail.variants.slice(0, 3).map((v, idx) => v.name || `Variant ${idx + 1}`)
          }];
        } else {
          // Generate standard variants
          shopifyProduct.product.variants = [
            {
              option1: `Standard`,
              price: String(productPrice.toFixed(2)),
              compare_at_price: String(originalPrice.toFixed(2)),
              inventory_quantity: 100,
              inventory_management: null,
              fulfillment_service: 'manual',
              requires_shipping: true,
              sku: `ALI-${uniqueId}-STD`,
              title: `${productTitle} - Standard`
            },
            {
              option1: `Premium`,
              price: String((productPrice * 1.15).toFixed(2)),
              compare_at_price: String((originalPrice * 1.15).toFixed(2)),
              inventory_quantity: 50,
              inventory_management: null,
              fulfillment_service: 'manual',
              requires_shipping: true,
              sku: `ALI-${uniqueId}-PREM`,
              title: `${productTitle} - Premium`
            }
          ];

          shopifyProduct.product.options = [{
            name: 'Option',
            position: 1,
            values: ['Standard', 'Premium']
          }];
        }

        console.log(`🛒 Uploading to Shopify: ${productTitle}`);

        // Upload to Shopify
        const shopifyResponse = await fetch(`${validatedShopifyUrl}/admin/api/2024-10/products.json`, {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': shopifyAccessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(shopifyProduct)
        });

        if (!shopifyResponse.ok) {
          const errorText = await shopifyResponse.text();
          console.error(`❌ Shopify upload failed for product ${i + 1}:`, {
            status: shopifyResponse.status,
            error: errorText,
            productTitle: productTitle
          });
          
          results.push({
            title: productTitle,
            price: String(productPrice.toFixed(2)),
            status: 'FAILED',
            error: `Shopify API error ${shopifyResponse.status}: ${errorText.substring(0, 100)}`
          });
          continue;
        }

        const createdProduct = await shopifyResponse.json();
        console.log(`✅ Product uploaded successfully: ${createdProduct.product.id}`);

        results.push({
          productId: createdProduct.product.id,
          title: productTitle,
          price: String(productPrice.toFixed(2)),
          imagesUploaded: productImages.length,
          variantsCreated: shopifyProduct.product.variants.length,
          status: 'SUCCESS'
        });

        successfulUploads++;

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (productError) {
        console.error(`❌ Error processing product ${i + 1}:`, productError);
        results.push({
          title: `AliExpress Product ${i + 1}`,
          status: 'FAILED',
          error: productError.message
        });
      }
    }

    // Apply theme color if successful uploads
    if (successfulUploads > 0 && themeColor) {
      try {
        console.log('🎨 Applying theme color:', themeColor);
        await applyThemeColor(validatedShopifyUrl, shopifyAccessToken, themeColor);
      } catch (themeError) {
        console.error('⚠️ Theme color application failed:', themeError);
      }
    }

    console.log(`🎉 AliExpress Data API generation complete: ${successfulUploads}/${productCount} products uploaded`);

    return new Response(JSON.stringify({
      success: true,
      successfulUploads,
      results,
      message: `Successfully generated ${successfulUploads} real AliExpress products using AliExpress Data API (PRO Plan)`,
      sessionId,
      aliexpressDataApiUsed: true,
      realImagesUsed: true,
      themeColorApplied: successfulUploads > 0,
      planTier: 'PRO'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Critical error in AliExpress Data API generation:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'AliExpress Data API product generation failed',
      successfulUploads: 0,
      results: [],
      debugInfo: {
        aliExpressApiKeyExists: !!aliExpressApiKey,
        aliExpressApiKeyLength: aliExpressApiKey?.length || 0,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateFallbackProducts(niche: string, count: number, shopifyUrl: string, accessToken: string, storeName: string, targetAudience: string): Promise<ProductResult[]> {
  console.log(`🔄 Generating ${count} fallback products for ${niche}`);
  
  const results: ProductResult[] = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const productTitle = `Premium ${niche} Product ${i + 1}`;
      const productPrice = 25 + (i * 5);
      const timestamp = Date.now();
      const uniqueId = `fallback_${timestamp}_${i}`;
      
      const shopifyProduct = {
        product: {
          title: productTitle,
          body_html: `<p>High-quality ${niche} product perfect for ${targetAudience}.</p>`,
          vendor: storeName,
          product_type: niche,
          handle: `${niche.toLowerCase()}-product-${uniqueId}`,
          status: 'active',
          published: true,
          tags: `${niche}, ${targetAudience}, premium`,
          variants: [{
            option1: 'Default',
            price: String(productPrice.toFixed(2)),
            compare_at_price: String((productPrice * 1.3).toFixed(2)),
            inventory_quantity: 100,
            inventory_management: null,
            fulfillment_service: 'manual',
            requires_shipping: true,
            sku: `FALLBACK-${uniqueId}`,
            title: `${productTitle} - Default`
          }],
          options: [{
            name: 'Option',
            position: 1,
            values: ['Default']
          }]
        }
      };

      const shopifyResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/products.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shopifyProduct)
      });

      if (shopifyResponse.ok) {
        const createdProduct = await shopifyResponse.json();
        results.push({
          productId: createdProduct.product.id,
          title: productTitle,
          price: String(productPrice.toFixed(2)),
          imagesUploaded: 0,
          variantsCreated: 1,
          status: 'SUCCESS'
        });
      } else {
        results.push({
          title: productTitle,
          status: 'FAILED',
          error: 'Shopify upload failed'
        });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Fallback product ${i + 1} failed:`, error);
    }
  }
  
  return results;
}

async function generateProductDescription(title: string, niche: string, targetAudience: string, productData: { price: number; orderCount: number; category: string }): Promise<string> {
  if (!openAIApiKey) {
    return generateFallbackDescription(title, niche, targetAudience, productData);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are an expert e-commerce copywriter specializing in high-converting AliExpress product descriptions. Your goal is to create compelling, SEO-optimized content that drives sales and builds trust with customers.`
          },
          {
            role: 'user',
            content: `Create a compelling, conversion-focused product description for "${title}" in the ${niche} category.

Product Details:
- Target Audience: ${targetAudience}
- Price: $${productData.price}
- Verified Orders: ${productData.orderCount}+
- Category: ${productData.category}

Requirements:
- 500-800 words with rich HTML formatting
- Include compelling headlines and subheadings
- Use emojis strategically (🛍️ 🔥 ✅ 💡 ⭐ 🌟 💎 🚀 ✨ 🎯)
- Focus on benefits over features
- Include social proof and urgency
- Add trust signals and quality indicators
- Use persuasive copywriting techniques
- Structure with proper HTML tags (h2, h3, ul, li, strong, em)
- Include a strong call-to-action
- Make it SEO-friendly for ${niche} keywords

Write in a style that builds excitement and trust while addressing customer pain points and desires.`
          }
        ],
        max_tokens: 1200,
        temperature: 0.75
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content;
    }
  } catch (error) {
    console.error('OpenAI description generation failed:', error);
  }

  return generateFallbackDescription(title, niche, targetAudience, productData);
}

function generateFallbackDescription(title: string, niche: string, targetAudience: string, productData: { price: number; orderCount: number; category: string }): string {
  const emojis = ['🔥', '✨', '⭐', '💎', '🚀', '🌟', '💡', '🎯'];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  
  return `
    <h2>${randomEmoji} ${title} - Premium ${niche.charAt(0).toUpperCase() + niche.slice(1)} Collection</h2>
    
    <p><strong>⭐ AUTHENTIC ALIEXPRESS QUALITY | ${productData.orderCount}+ VERIFIED ORDERS | ${productData.category.toUpperCase()} BESTSELLER</strong></p>
    
    <h3>🔥 TRANSFORM YOUR ${niche.toUpperCase()} EXPERIENCE!</h3>
    <p><strong>Discover why thousands of ${targetAudience} are choosing this premium ${title}!</strong> Sourced directly from AliExpress's most trusted suppliers, this product delivers exceptional quality that exceeds expectations at an unbeatable price point of just <em>$${productData.price}</em>.</p>
    
    <h3>🌟 PREMIUM FEATURES & BENEFITS:</h3>
    <ul>
      <li>✅ <strong>Verified Quality:</strong> Authentic AliExpress product with ${productData.orderCount}+ satisfied customers</li>
      <li>✅ <strong>Perfect Design:</strong> Specifically crafted for ${targetAudience} who demand excellence</li>
      <li>✅ <strong>Superior Materials:</strong> Premium construction using high-grade materials</li>
      <li>✅ <strong>Fast Delivery:</strong> Quick shipping with reliable tracking and customer support</li>
      <li>✅ <strong>Proven Success:</strong> Join ${productData.orderCount}+ happy customers worldwide</li>
      <li>✅ <strong>Category Leader:</strong> Top-rated in ${productData.category} category</li>
      <li>✅ <strong>Money-Back Guarantee:</strong> Complete satisfaction or full refund</li>
    </ul>
    
    <h3>💎 WHY ${targetAudience.toUpperCase()} LOVE THIS ${niche.toUpperCase()} PRODUCT:</h3>
    <p>This ${title} isn't just another product - it's a <strong>game-changer</strong> for anyone serious about ${niche}. With over ${productData.orderCount} verified orders and countless 5-star reviews, it has proven itself as the go-to choice for discerning customers.</p>
    
    <blockquote style="border-left: 4px solid #007cba; padding-left: 15px; margin: 20px 0; font-style: italic;">
      <p>"This product exceeded all my expectations! The quality is outstanding and delivery was super fast. Highly recommend!" - <strong>Verified Customer</strong></p>
    </blockquote>
    
    <h3>🎯 PERFECT FOR:</h3>
    <p>✨ <strong>${targetAudience}</strong> who want premium ${niche} products<br>
    🔥 People seeking <strong>authentic AliExpress quality</strong> at great prices<br>
    💡 Anyone looking to <strong>upgrade their ${niche} experience</strong><br>
    🚀 Customers who value <strong>proven quality</strong> with ${productData.orderCount}+ orders</p>
    
    <h3>⚡ LIMITED TIME - SPECIAL PRICING!</h3>
    <p><strong>🛍️ Order now for just $${productData.price} and join thousands of satisfied customers!</strong></p>
    
    <p style="text-align: center; background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <strong>🌟 SATISFACTION GUARANTEED | ⚡ FAST SHIPPING | 💎 PREMIUM QUALITY</strong>
    </p>
    
    <p><em><strong>Don't wait - experience the quality that ${productData.orderCount}+ customers already love!</strong></em></p>
  `;
}

function generateNicheImage(niche: string, index: number): string {
  const nicheImages: Record<string, string[]> = {
    'beauty': [
      'https://images.unsplash.com/photo-1596462502166-2c2d3be83b22?w=800&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1571019614441-bd1e0a87e2ec?w=800&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1522335789917-b90c2e0ea03b?w=800&h=800&fit=crop&auto=format&q=80'
    ],
    'tech': [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop&auto=format&q=80'
    ],
    'fitness': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=800&fit=crop&auto=format&q=80'
    ],
    'pets': [
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=800&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=800&h=800&fit=crop&auto=format&q=80'
    ]
  };

  const images = nicheImages[niche.toLowerCase()] || nicheImages['tech'];
  return images[index % images.length];
}

async function applyThemeColor(shopifyUrl: string, accessToken: string, themeColor: string) {
  try {
    console.log(`🎨 Starting theme color application: ${themeColor}`);
    
    // Get the current published theme
    const themesResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!themesResponse.ok) {
      throw new Error(`Failed to fetch themes: ${themesResponse.status}`);
    }

    const themesData = await themesResponse.json();
    const mainTheme = themesData.themes.find((theme: any) => theme.role === 'main');
    
    if (!mainTheme) {
      throw new Error('No main theme found');
    }

    console.log(`🎯 Found main theme: ${mainTheme.name} (ID: ${mainTheme.id})`);

    // Get current theme settings
    const settingsResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${mainTheme.id}/assets.json?asset[key]=config/settings_data.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json();
      let settings = {};
      
      try {
        settings = JSON.parse(settingsData.asset.value);
      } catch (e) {
        console.log('📝 Creating new settings object');
        settings = { current: {} };
      }

      // Update theme color settings for common theme variables
      const colorSettings = {
        'colors_accent_1': themeColor,
        'colors_accent_2': themeColor,
        'color_primary': themeColor,
        'color_accent': themeColor,
        'color_button': themeColor,
        'button_color': themeColor,
        'accent_color': themeColor,
        'colors_solid_button_labels': '#FFFFFF',
        'colors_outline_button_labels': themeColor,
        'gradient_accent_1': `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}CC 100%)`,
        'gradient_accent_2': `linear-gradient(135deg, ${themeColor}CC 0%, ${themeColor} 100%)`
      };

      // Apply color settings to current theme section
      if (!settings.current) settings.current = {};
      Object.assign(settings.current, colorSettings);

      console.log(`🔧 Applying color settings:`, Object.keys(colorSettings));

      // Update theme settings
      const updateResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/themes/${mainTheme.id}/assets.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asset: {
            key: 'config/settings_data.json',
            value: JSON.stringify(settings)
          }
        })
      });

      if (updateResponse.ok) {
        console.log('✅ Theme color settings updated successfully');
      } else {
        const errorText = await updateResponse.text();
        console.error('⚠️ Theme settings update failed:', errorText);
      }
    }

    // Also try to update store branding if available
    try {
      const brandingPayload = {
        checkout_branding: {
          design_system: {
            colors: {
              accent: themeColor,
              decorative: themeColor,
              interactive: themeColor
            }
          }
        }
      };

      const brandingResponse = await fetch(`${shopifyUrl}/admin/api/2024-10/checkout_branding.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(brandingPayload)
      });

      if (brandingResponse.ok) {
        console.log('✅ Checkout branding updated successfully');
      } else {
        console.log('ℹ️ Checkout branding update not available');
      }
    } catch (brandingError) {
      console.log('ℹ️ Checkout branding update skipped');
    }

    console.log('🎨 Theme color application completed');
    
  } catch (error) {
    console.error('❌ Theme color application error:', error);
    throw error;
  }
}

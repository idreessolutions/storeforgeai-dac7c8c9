
export function extractStoreNameFromUrl(shopifyUrl: string): string {
  try {
    // Handle various URL formats
    const cleanUrl = shopifyUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    if (cleanUrl.includes('.myshopify.com')) {
      return cleanUrl.split('.myshopify.com')[0];
    }
    
    // Handle custom domains - extract first part
    return cleanUrl.split('.')[0];
  } catch (error) {
    console.warn('Could not extract store name from URL:', shopifyUrl);
    return 'premium-store';
  }
}

export function generateUniqueHandle(title: string, timestamp: number): string {
  const baseHandle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
    
  return `${baseHandle}-${timestamp.toString().slice(-6)}`;
}

export function applyThemeColorToDescription(description: string, themeColor: string): string {
  console.log(`🎨 Applying theme color ${themeColor} to product description`);
  
  if (!description) {
    return `<div style="color: ${themeColor};">Premium quality product designed with excellence.</div>`;
  }

  // Enhanced theme color integration with beautiful styling
  const styledDescription = `
    <div class="product-description" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6;">
      <style>
        .highlight-accent { color: ${themeColor}; font-weight: 600; }
        .theme-border { border-left: 3px solid ${themeColor}; padding-left: 15px; margin: 10px 0; }
        .theme-button { 
          background-color: ${themeColor}; 
          color: white; 
          padding: 8px 16px; 
          border-radius: 5px; 
          text-decoration: none; 
          display: inline-block; 
          margin: 10px 0; 
          font-weight: bold;
        }
        .feature-highlight { 
          background: linear-gradient(90deg, ${themeColor}20, transparent); 
          padding: 8px 12px; 
          border-radius: 5px; 
          margin: 5px 0; 
        }
      </style>
      ${enhanceDescriptionWithThemeElements(description, themeColor)}
    </div>
  `;
  
  return styledDescription;
}

function enhanceDescriptionWithThemeElements(description: string, themeColor: string): string {
  // Convert plain text to styled HTML with theme color integration
  let enhanced = description
    // Style headings
    .replace(/\*\*(.*?)\*\*/g, '<h3 class="highlight-accent">$1</h3>')
    // Style bullet points with theme color
    .replace(/• (.*?)(?=\n|$)/g, '<div class="feature-highlight">• <strong>$1</strong></div>')
    .replace(/✅ (.*?)(?=\n|$)/g, '<div class="feature-highlight">✅ <strong class="highlight-accent">$1</strong></div>')
    .replace(/🔥 (.*?)(?=\n|$)/g, '<div class="theme-border">🔥 <strong class="highlight-accent">$1</strong></div>')
    .replace(/⭐ (.*?)(?=\n|$)/g, '<div class="feature-highlight">⭐ <strong>$1</strong></div>')
    // Style important sections
    .replace(/🎯 \*\*(.*?)\*\*/g, '<div class="theme-border"><h4 class="highlight-accent">🎯 $1</h4></div>')
    .replace(/✨ \*\*(.*?)\*\*/g, '<div class="theme-border"><h4 class="highlight-accent">✨ $1</h4></div>')
    // Convert line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // Wrap in paragraphs
  enhanced = `<p>${enhanced}</p>`;
  
  // Add a call-to-action with theme color
  enhanced += `
    <div class="theme-border" style="text-align: center; margin-top: 20px;">
      <p><strong class="highlight-accent">🛒 Ready to transform your experience?</strong></p>
      <div class="theme-button">Order Now - Premium Quality Guaranteed!</div>
    </div>
  `;
  
  return enhanced;
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

export function validateProductData(product: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!product.title || product.title.length < 10) {
    errors.push('Product title must be at least 10 characters');
  }
  
  if (!product.description || product.description.length < 100) {
    errors.push('Product description must be at least 100 characters');
  }
  
  if (!product.price || product.price < 1) {
    errors.push('Product price must be greater than $1');
  }
  
  if (product.price > 1000) {
    errors.push('Product price seems too high (over $1000)');
  }
  
  if (!product.images || product.images.length === 0) {
    errors.push('Product must have at least one image');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function generateProductTags(product: any, niche: string, targetAudience: string): string {
  const baseTags = [
    niche,
    targetAudience,
    'bestseller',
    'premium-quality',
    'verified-product'
  ];
  
  // Add smart tags based on product characteristics
  if (product.rating >= 4.7) baseTags.push('top-rated');
  if (product.orders >= 1000) baseTags.push('popular-choice');
  if (product.price <= 30) baseTags.push('great-value');
  if (product.price >= 50) baseTags.push('premium');
  
  // Add niche-specific tags
  const nicheTags = {
    'pets': ['pet-lovers', 'animal-care', 'pet-supplies'],
    'fitness': ['workout', 'health', 'exercise'],
    'beauty': ['skincare', 'cosmetics', 'self-care'],
    'tech': ['gadgets', 'electronics', 'innovation'],
    'baby': ['baby-care', 'parenting', 'child-safety'],
    'home': ['home-decor', 'lifestyle', 'comfort'],
    'kitchen': ['cooking', 'food-prep', 'kitchen-tools'],
    'fashion': ['style', 'trendy', 'apparel']
  };
  
  const specificTags = nicheTags[niche.toLowerCase() as keyof typeof nicheTags] || [];
  baseTags.push(...specificTags);
  
  return baseTags.join(', ');
}

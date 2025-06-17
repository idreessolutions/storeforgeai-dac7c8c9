export function extractStoreNameFromUrl(url: string): string {
  try {
    if (!url) return 'store';
    
    // Handle different URL formats
    let cleanUrl = url;
    
    // Remove protocol if present
    if (cleanUrl.includes('://')) {
      cleanUrl = cleanUrl.split('://')[1];
    }
    
    // Extract subdomain from myshopify.com
    if (cleanUrl.includes('.myshopify.com')) {
      return cleanUrl.split('.myshopify.com')[0];
    }
    
    // If it's just the subdomain
    if (!cleanUrl.includes('.')) {
      return cleanUrl;
    }
    
    // Fallback
    return cleanUrl.split('.')[0] || 'store';
  } catch (error) {
    console.error('Error extracting store name:', error);
    return 'store';
  }
}

export function generateUniqueHandle(title: string, timestamp: number): string {
  if (!title) return `product-${timestamp}`;
  
  // Convert to lowercase and replace spaces/special chars with hyphens
  let handle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  // Limit length and add timestamp for uniqueness
  handle = handle.substring(0, 50);
  return `${handle}-${timestamp}`;
}

export function applyThemeColorToDescription(description: string, themeColor: string): string {
  if (!description || !themeColor) return description;
  
  // Add color-themed styling to key elements
  const coloredDescription = description
    .replace(/🏆/g, `<span style="color: ${themeColor};">🏆</span>`)
    .replace(/✅/g, `<span style="color: ${themeColor};">✅</span>`)
    .replace(/💎/g, `<span style="color: ${themeColor};">💎</span>`)
    .replace(/⚡/g, `<span style="color: ${themeColor};">⚡</span>`);
  
  return coloredDescription;
}

export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice.toFixed(2);
}

export function generateSKU(productTitle: string, variantTitle?: string): string {
  const cleanTitle = productTitle.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase();
  const cleanVariant = variantTitle ? variantTitle.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase() : '';
  const timestamp = Date.now().toString().slice(-6);
  
  return `${cleanTitle}${cleanVariant ? '-' + cleanVariant : ''}-${timestamp}`;
}

export function validateShopifyUrl(url: string): boolean {
  if (!url) return false;
  
  const patterns = [
    /^https?:\/\/[a-zA-Z0-9-]+\.myshopify\.com\/?$/,
    /^[a-zA-Z0-9-]+\.myshopify\.com\/?$/,
    /^[a-zA-Z0-9-]+$/
  ];
  
  return patterns.some(pattern => pattern.test(url));
}

export function cleanHtml(html: string): string {
  if (!html) return '';
  
  // Remove potentially harmful tags while keeping formatting
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .trim();
}

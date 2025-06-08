
export function extractStoreNameFromUrl(url: string): string {
  try {
    // Handle various URL formats
    let cleanUrl = url.replace(/^https?:\/\//, '').toLowerCase();
    
    // Remove trailing slashes and query parameters
    cleanUrl = cleanUrl.split('?')[0].split('/')[0];
    
    if (cleanUrl.includes('admin.shopify.com/store/')) {
      const match = cleanUrl.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
      return match ? match[1] : cleanUrl;
    }
    
    if (cleanUrl.includes('.myshopify.com')) {
      const match = cleanUrl.match(/([^\/\.]+)\.myshopify\.com/);
      return match ? match[1] : cleanUrl;
    }
    
    // If it's just a store name without domain
    if (!cleanUrl.includes('.') && !cleanUrl.includes('/')) {
      return cleanUrl;
    }
    
    return cleanUrl;
  } catch (error) {
    console.error('Error extracting store name:', error);
    return 'store';
  }
}

export function generateUniqueHandle(title: string, timestamp: number): string {
  const baseHandle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
    
  return `${baseHandle}-${timestamp}`;
}

export function applyThemeColorToDescription(description: string, themeColor: string): string {
  if (!description) return '';
  
  // Apply theme color to key phrases
  return description
    .replace(/Premium/g, `<span style="color:${themeColor}">Premium</span>`)
    .replace(/Quality/g, `<span style="color:${themeColor}">Quality</span>`)
    .replace(/Best/g, `<span style="color:${themeColor}">Best</span>`)
    .replace(/Professional/g, `<span style="color:${themeColor}">Professional</span>`)
    .replace(/Advanced/g, `<span style="color:${themeColor}">Advanced</span>`);
}

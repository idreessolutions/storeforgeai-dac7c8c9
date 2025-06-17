
export function extractStoreNameFromUrl(url: string): string {
  try {
    const cleanUrl = url.replace(/^https?:\/\//, '').toLowerCase();
    
    if (cleanUrl.includes('admin.shopify.com/store/')) {
      const match = cleanUrl.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
      return match ? match[1] : 'store';
    }
    
    if (cleanUrl.includes('.myshopify.com')) {
      const match = cleanUrl.match(/([^\/\.]+)\.myshopify\.com/);
      return match ? match[1] : 'store';
    }
    
    if (!cleanUrl.includes('.') && !cleanUrl.includes('/')) {
      return cleanUrl;
    }
    
    return 'store';
  } catch (error) {
    console.error('Error extracting store name:', error);
    return 'store';
  }
}

export function generateUniqueHandle(title: string, timestamp: number): string {
  const baseHandle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
  
  return `${baseHandle}-${timestamp}`;
}

export function applyThemeColorToDescription(description: string, themeColor: string): string {
  if (!description) return '';
  
  // Apply theme color styling to the description
  const styledDescription = `
    <div style="color: #333; font-family: Arial, sans-serif;">
      ${description.replace(/\n/g, '<br>')}
      <div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, ${themeColor}15, ${themeColor}25); border-left: 4px solid ${themeColor}; border-radius: 8px;">
        <p style="margin: 0; color: ${themeColor}; font-weight: bold;">✨ Premium Quality Guaranteed</p>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Thousands of satisfied customers worldwide!</p>
      </div>
    </div>
  `;
  
  return styledDescription;
}

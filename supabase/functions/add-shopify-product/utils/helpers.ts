
export function extractStoreNameFromUrl(shopifyUrl: string): string | null {
  try {
    const cleanUrl = shopifyUrl.replace(/^https?:\/\//, '').toLowerCase();
    
    if (cleanUrl.includes('admin.shopify.com/store/')) {
      const match = cleanUrl.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
      return match ? match[1] : null;
    }
    
    if (cleanUrl.includes('.myshopify.com')) {
      const match = cleanUrl.match(/([^\/\.]+)\.myshopify\.com/);
      return match ? match[1] : null;
    }
    
    if (!cleanUrl.includes('.') && !cleanUrl.includes('/')) {
      return cleanUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting store name:', error);
    return null;
  }
}

export function generateUniqueHandle(title: string, timestamp: number): string {
  const baseHandle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
  
  return `${baseHandle}-${timestamp}`;
}

export function applyThemeColorToDescription(description: string, themeColor: string): string {
  if (!description || !themeColor) return description || '';

  // Apply theme color to key sections with HTML styling
  let styledDescription = description
    .replace(/🔥\s*\*\*(.*?)\*\*/g, `<div style="background: linear-gradient(135deg, ${themeColor}, ${themeColor}aa); color: white; padding: 12px; border-radius: 8px; margin: 8px 0; font-weight: bold;">🔥 $1</div>`)
    .replace(/✅\s*\*\*(.*?)\*\*/g, `<h3 style="color: ${themeColor}; font-weight: bold; margin: 16px 0 8px 0;">✅ $1</h3>`)
    .replace(/🎯\s*\*\*(.*?)\*\*/g, `<h3 style="color: ${themeColor}; font-weight: bold; margin: 16px 0 8px 0;">🎯 $1</h3>`)
    .replace(/👥\s*\*\*(.*?)\*\*/g, `<h3 style="color: ${themeColor}; font-weight: bold; margin: 16px 0 8px 0;">👥 $1</h3>`)
    .replace(/📦\s*\*\*(.*?)\*\*/g, `<h3 style="color: ${themeColor}; font-weight: bold; margin: 16px 0 8px 0;">📦 $1</h3>`)
    // Convert bullet points to proper HTML
    .replace(/^•\s*(.+)$/gm, '<li style="margin: 4px 0;">$1</li>')
    .replace(/^✓\s*(.+)$/gm, '<li style="margin: 4px 0; color: #10B981;">✓ $1</li>')
    // Wrap lists in ul tags
    .replace(/(<li[^>]*>.*?<\/li>\s*)+/gs, '<ul style="margin: 8px 0; padding-left: 20px;">$&</ul>')
    // Convert line breaks to proper HTML
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');

  // Add a call-to-action box at the end
  styledDescription += `
    <div style="background: linear-gradient(135deg, ${themeColor}, ${themeColor}dd); color: white; padding: 16px; border-radius: 12px; margin: 20px 0; text-align: center; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
      🚀 Limited Time Offer - Order Now & Save! 
      <br><small style="opacity: 0.9;">Fast shipping • 30-day guarantee • Premium quality</small>
    </div>`;

  return styledDescription;
}

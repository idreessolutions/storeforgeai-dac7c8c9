
export const generateProducts = async (
  shopifyUrl: string,
  accessToken: string,
  niche: string,
  themeColor: string,
  targetAudience: string,
  businessType: string,
  storeStyle: string,
  customInfo: string,
  storeName: string
) => {
  console.log(`🚀 Starting product generation for ${niche} niche`);
  
  try {
    // Call the Supabase Edge Function for adding products
    const response = await fetch(`https://utozxityfmoxonfyvdfm.supabase.co/functions/v1/add-shopify-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0b3p4aXR5Zm1veG9uZnl2ZGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NTM4OTksImV4cCI6MjA2MzUyOTg5OX0.2z4k6cS6lc-0UISH7a17lIGY9m9hPINY3up9Zd-nRrk`
      },
      body: JSON.stringify({
        shopifyUrl,
        shopifyAccessToken: accessToken,
        niche,
        themeColor,
        targetAudience,
        businessType,
        storeStyle,
        customInfo,
        storeName,
        productCount: 10
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Edge Function response error:', errorText);
      throw new Error(`Failed to generate products: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Product generation failed');
    }
    
    console.log('✅ Product generation successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Product generation failed:', error);
    throw error;
  }
};

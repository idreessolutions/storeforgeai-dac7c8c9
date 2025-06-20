
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
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/add-shopify-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        shopifyUrl,
        accessToken,
        niche,
        themeColor,
        targetAudience,
        businessType,
        storeStyle,
        customInfo,
        storeName
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate products: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Product generation failed:', error);
    throw error;
  }
};

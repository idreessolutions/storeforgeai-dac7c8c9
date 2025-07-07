
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
    const requestData = {
      productCount: 10,
      niche: niche || 'tech',
      storeName: storeName || 'My Store',
      targetAudience: targetAudience || 'Everyone',
      businessType: businessType || 'e-commerce',
      storeStyle: storeStyle || 'modern',
      shopifyUrl: shopifyUrl,
      shopifyAccessToken: accessToken,
      themeColor: themeColor || '#3B82F6',
      customInfo: customInfo || '',
      enhancedGeneration: true,
      useRealImages: true
    };

    console.log('🎯 Sending request to Edge Function:', requestData);

    // Make direct fetch call with proper error handling
    const response = await fetch(`https://utozxityfmoxonfyvdfm.supabase.co/functions/v1/add-shopify-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0b3p4aXR5Zm1veG9uZnl2ZGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NTM4OTksImV4cCI6MjA2MzUyOTg5OX0.2z4k6cS6lc-0UISH7a17lIGY9m9hPINY3up9Zd-nRrk`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0b3p4aXR5Zm1veG9uZnl2ZGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NTM4OTksImV4cCI6MjA2MzUyOTg5OX0.2z4k6cS6lc-0UISH7a17lIGY9m9hPINY3up9Zd-nRrk'
      },
      body: JSON.stringify(requestData)
    });

    console.log('🔍 Edge Function response status:', response.status);
    console.log('🔍 Edge Function response headers:', Object.fromEntries(response.headers.entries()));

    // Check if response is ok first
    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      console.error('❌ Edge Function response error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      // More specific error messages
      if (response.status === 404) {
        throw new Error(`Edge Function not found. Please check if the function is deployed. Status: ${response.status}`);
      } else if (response.status === 500) {
        throw new Error(`Edge Function internal error: ${errorText}`);
      } else if (response.status === 403) {
        throw new Error(`Edge Function access denied. Check API keys. Status: ${response.status}`);
      } else if (response.status >= 400) {
        throw new Error(`Edge Function failed with status ${response.status}: ${errorText}`);
      }
    }

    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error('❌ Failed to parse Edge Function response as JSON:', parseError);
      const responseText = await response.text();
      throw new Error(`Invalid JSON response from Edge Function: ${responseText.substring(0, 200)}`);
    }
    
    if (!result.success) {
      console.error('❌ Generation failed:', result);
      throw new Error(result.error || result.message || 'Product generation failed');
    }
    
    console.log('✅ Product generation successful:', result);
    return result;
    
  } catch (error: any) {
    console.error('❌ Product generation failed:', error);
    
    // Enhanced error reporting with more specific messages
    if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
      throw new Error('Cannot connect to Edge Function - Network error. Please check your internet connection and try again.');
    } else if (error.message?.includes('NetworkError')) {
      throw new Error('Network error occurred while connecting to Edge Function. Please try again.');
    } else if (error.message?.includes('timeout')) {
      throw new Error('Request timed out. The Edge Function may be overloaded. Please try again.');
    }
    
    // Re-throw the original error if it's already descriptive
    throw error;
  }
};

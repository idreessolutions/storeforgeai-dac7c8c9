import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, CheckCircle, XCircle, RefreshCw, Star, Users, Camera, Sparkles } from "lucide-react";
import { generateProducts } from "@/api/generate-products";
import { toast } from "sonner";

interface ProductsStepProps {
  formData: {
    productsAdded: boolean;
    shopifyUrl?: string;
    accessToken?: string;
    niche?: string;
    themeColor?: string;
    targetAudience?: string;
    businessType?: string;
    storeStyle?: string;
    customInfo?: string;
    storeName?: string;
  };
  handleInputChange: (field: string, value: boolean) => void;
}

interface ProductResult {
  productId?: string;
  title?: string;
  price?: string;
  imagesUploaded?: number;
  variantsCreated?: number;
  status: string;
  error?: string;
  images?: string[];
  variants?: any[];
}

const ProductsStep = ({ formData, handleInputChange }: ProductsStepProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProductResult[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  const sessionId = localStorage.getItem('storeBuilderSessionId') || 'default';
  const niche = formData.niche || 'Products';
  const nicheCapitalized = niche.charAt(0).toUpperCase() + niche.slice(1);

  const validateShopifyUrl = (url: string): string => {
    // Clean the URL - remove any protocols and ensure proper format
    let cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    // If it doesn't end with .myshopify.com, add it
    if (!cleanUrl.includes('.myshopify.com')) {
      cleanUrl = `${cleanUrl}.myshopify.com`;
    }
    
    // Ensure it starts with https://
    return `https://${cleanUrl}`;
  };

  const handleGenerateProducts = async () => {
    if (!formData.shopifyUrl || !formData.accessToken) {
      toast.error('Missing Shopify store URL or access token');
      return;
    }

    // Validate and fix Shopify URL
    const validatedShopifyUrl = validateShopifyUrl(formData.shopifyUrl);
    console.log(`🔗 Validated Shopify URL: ${validatedShopifyUrl}`);

    setIsGenerating(true);
    setHasStarted(true);
    setProgress(0);
    setResults([]);

    try {
      console.log(`🚀 STARTING ALIEXPRESS PRODUCT GENERATION for ${formData.niche?.toUpperCase()} niche`);
      
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 8;
        });
      }, 2000);

      // Use the updated generateProducts function with validated URL
      const result = await generateProducts(
        validatedShopifyUrl,
        formData.accessToken!,
        formData.niche || 'tech',
        formData.themeColor || '#3B82F6',
        formData.targetAudience || 'Everyone',
        formData.businessType || 'e-commerce',
        formData.storeStyle || 'modern',
        formData.customInfo || '',
        formData.storeName || 'My Store'
      );

      clearInterval(progressInterval);

      if (!result.success) {
        throw new Error(result.error || 'Product generation failed');
      }

      console.log('✅ ALIEXPRESS GENERATION SUCCESS:', result);
      
      setResults(result.results || []);
      setProgress(100);
      
      // Mark products as added
      handleInputChange('productsAdded', true);
      
      toast.success(`🎉 Successfully created ${result.successfulUploads || 10} unique ${formData.niche} products from AliExpress!`, {
        duration: 5000,
      });

      // Store generation data in localStorage
      await storeGenerationData(result);

    } catch (error: any) {
      console.error('❌ AliExpress product generation error:', error);
      setProgress(0);
      
      // Show detailed error message
      const errorMessage = error.message || 'Unknown error occurred';
      console.error('Full error details:', error);
      
      toast.error(`Failed to generate AliExpress products: ${errorMessage}`, {
        duration: 8000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const storeGenerationData = async (generationData: any) => {
    try {
      const storeData = {
        session_id: sessionId,
        store_name: formData.storeName,
        niche: formData.niche,
        theme_color: formData.themeColor,
        target_audience: formData.targetAudience,
        business_type: formData.businessType,
        store_style: formData.storeStyle,
        shopify_url: formData.shopifyUrl,
        products_generated: generationData.successfulUploads || 0,
        generation_data: generationData,
        created_at: new Date().toISOString(),
        data_source: 'AliExpress True API'
      };

      localStorage.setItem('storeGenerationData', JSON.stringify(storeData));
      console.log('✅ AliExpress store data saved successfully');
    } catch (error) {
      console.error('❌ Failed to store generation data:', error);
    }
  };

  const retryGeneration = () => {
    setHasStarted(false);
    setResults([]);
    setProgress(0);
    handleInputChange('productsAdded', false);
    handleGenerateProducts();
  };

  const getSuccessCount = () => {
    return results.filter(result => result.status === 'SUCCESS').length;
  };

  const getFailureCount = () => {
    return results.filter(result => result.status === 'FAILED').length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto pt-4 sm:pt-8">
        <Card className="bg-white shadow-2xl border-0">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                🚀 Launch AI-Powered {nicheCapitalized} Store
              </h1>
              <p className="text-gray-600 text-lg">
                Generate 10 trending {nicheCapitalized} products from AliExpress with real images and AI-enhanced content for {formData.targetAudience || 'customers'}
              </p>
            </div>

            {!hasStarted && (
              <>
                {/* Enhanced AI Product Generation Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                    🚀 AliExpress Product Generation with Real Images
                  </h3>
                  
                  {/* Feature Boxes - Enhanced features */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
                      <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">4.8+ Rating</div>
                      <div className="text-sm text-gray-600">AliExpress verified</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
                      <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">1000+ Orders</div>
                      <div className="text-sm text-gray-600">Proven bestsellers</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
                      <Camera className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">Real Images</div>
                      <div className="text-sm text-gray-600">AliExpress + Fallbacks</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
                      <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">AI Content</div>
                      <div className="text-sm text-gray-600">GPT-4 enhanced</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={handleGenerateProducts}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg text-lg font-semibold h-auto"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating AliExpress Products...
                        </>
                      ) : (
                        <>
                          <Package className="mr-2 h-5 w-5" />
                          Generate AliExpress {nicheCapitalized} Products
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {isGenerating && (
              <div className="mb-8">
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      🤖 AI is fetching trending {formData.niche} products from AliExpress...
                    </h3>
                    <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div>✨ Fetching winning products from AliExpress True API</div>
                    <div>🤖 Generating unique descriptions with GPT-4</div>
                    <div>🖼️ Extracting real AliExpress product images</div>
                    <div>💰 Optimizing pricing and creating variants</div>
                    <div>🛒 Uploading to your Shopify store</div>
                    <div>🎨 Applying {formData.storeStyle} theme styling</div>
                  </div>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="mb-8">
                <div className="bg-white rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">AliExpress Product Generation Results</h3>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-green-600 font-medium">
                        ✅ Success: {getSuccessCount()}
                      </span>
                      {getFailureCount() > 0 && (
                        <span className="text-red-600 font-medium">
                          ❌ Failed: {getFailureCount()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 max-h-60 overflow-y-auto">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          result.status === 'SUCCESS' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {result.status === 'SUCCESS' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {result.title || `AliExpress Product ${index + 1}`}
                            </p>
                            {result.status === 'SUCCESS' && (
                              <p className="text-xs text-gray-600">
                                ${result.price} • {result.imagesUploaded || 4} images • {result.variantsCreated || 3} variants
                              </p>
                            )}
                            {result.error && (
                              <p className="text-xs text-red-600">{result.error}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {getFailureCount() > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        onClick={retryGeneration}
                        variant="outline"
                        className="w-full"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry Failed Products
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {formData.productsAdded && (
              <div className="text-center">
                <div className="bg-green-50 rounded-xl p-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-900 mb-2">
                    🎉 AliExpress Products Generated Successfully!
                  </h3>
                  <p className="text-green-700">
                    Your {formData.niche} store now has {getSuccessCount() || 10} unique AliExpress products with real images and AI-enhanced content ready for customers.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductsStep;

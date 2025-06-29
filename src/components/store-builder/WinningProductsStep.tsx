
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, CheckCircle, XCircle, RefreshCw, Star, Users, Camera, Sparkles, Zap, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WinningProductsStepProps {
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
  success: boolean;
  error?: string;
}

const WinningProductsStep = ({ formData, handleInputChange }: WinningProductsStepProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  const sessionId = localStorage.getItem('storeBuilderSessionId') || 'default';
  const niche = formData.niche || 'Tech';
  const nicheCapitalized = niche.charAt(0).toUpperCase() + niche.slice(1);

  const generateProducts = async () => {
    if (!formData.shopifyUrl || !formData.accessToken) {
      toast.error('Missing Shopify store URL or access token');
      return;
    }

    setIsGenerating(true);
    setHasStarted(true);
    setProgress(0);
    setResults([]);
    setCurrentStage("Initializing AI systems...");

    try {
      console.log(`🚀 Starting product generation for ${niche} niche`);
      
      const requestData = {
        productCount: 10,
        niche: formData.niche || 'tech',
        storeName: formData.storeName || 'My Store',
        targetAudience: formData.targetAudience || 'Everyone',
        businessType: formData.businessType || 'e-commerce',
        storeStyle: formData.storeStyle || 'modern',
        shopifyUrl: formData.shopifyUrl,
        shopifyAccessToken: formData.accessToken,
        themeColor: formData.themeColor || '#3B82F6',
        sessionId: sessionId
      };

      console.log('🎯 Request data:', requestData);

      // Simulate progress stages
      const stages = [
        { progress: 10, stage: "🔍 Finding winning products..." },
        { progress: 25, stage: "🤖 Generating AI content with GPT-4..." },
        { progress: 40, stage: "🎨 Creating unique product images..." },
        { progress: 55, stage: "💰 Optimizing pricing strategies..." },
        { progress: 70, stage: "📦 Preparing product variations..." },
        { progress: 85, stage: "🛒 Uploading to your Shopify store..." },
      ];

      // Start progress simulation
      let stageIndex = 0;
      const progressInterval = setInterval(() => {
        if (stageIndex < stages.length) {
          setProgress(stages[stageIndex].progress);
          setCurrentStage(stages[stageIndex].stage);
          stageIndex++;
        }
      }, 3000);

      const { data, error } = await supabase.functions.invoke('add-shopify-product', {
        body: requestData
      });

      clearInterval(progressInterval);

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(`Edge Function Error: ${error.message || 'Unknown error'}`);
      }

      if (!data || !data.success) {
        const errorMsg = data?.error || data?.message || 'Product generation failed';
        console.error('❌ Generation failed:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ Generation successful:', data);
      
      setResults(data.results || []);
      setProgress(100);
      setCurrentStage("🎉 Products successfully generated!");
      
      // Mark products as added
      handleInputChange('productsAdded', true);
      
      const successCount = data.successfulUploads || data.results?.filter((r: any) => r.success).length || 0;
      
      toast.success(
        `🎉 Successfully created ${successCount} unique ${niche} products with AI-generated content and images!`,
        { duration: 5000 }
      );

      // Store generation data
      await storeGenerationData(data);

    } catch (error: any) {
      console.error('❌ Product generation error:', error);
      setProgress(0);
      setCurrentStage("❌ Generation failed");
      
      let errorMessage = 'Product generation failed';
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Failed to generate products: ${errorMessage}`, {
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
        created_at: new Date().toISOString()
      };

      localStorage.setItem('storeGenerationData', JSON.stringify(storeData));
      console.log('✅ Store data saved successfully');
    } catch (error) {
      console.error('❌ Failed to store generation data:', error);
    }
  };

  const retryGeneration = () => {
    setHasStarted(false);
    setResults([]);
    setProgress(0);
    setCurrentStage("");
    handleInputChange('productsAdded', false);
    generateProducts();
  };

  const getSuccessCount = () => {
    return results.filter(result => result.success).length;
  };

  const getFailureCount = () => {
    return results.filter(result => !result.success).length;
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
                Generate 10 unique {nicheCapitalized} products with AI-enhanced content, smart pricing, and professional images
              </p>
            </div>

            {!hasStarted && (
              <>
                {/* Enhanced Features Display */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                    🚀 AI-Powered Product Generation
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
                      <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">High-Quality</div>
                      <div className="text-sm text-gray-600">Premium products</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
                      <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">Proven Winners</div>
                      <div className="text-sm text-gray-600">Market-validated</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
                      <Camera className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">AI Images</div>
                      <div className="text-sm text-gray-600">6-8 per product</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
                      <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">GPT Content</div>
                      <div className="text-sm text-gray-600">600-800 words</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={generateProducts}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg text-lg font-semibold h-auto"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating Products...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          Launch AI-Powered {nicheCapitalized} Store
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
                      {currentStage}
                    </h3>
                    <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  {/* Animated placeholder products */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-32 mb-3"></div>
                        <div className="bg-gray-200 rounded h-4 mb-2"></div>
                        <div className="bg-gray-200 rounded h-3 w-2/3"></div>
                      </div>
                    ))}
                  </div>

                  <div className="text-sm text-gray-600 space-y-1 mt-4">
                    <div>• Sourcing winning {niche} products with verified sales data</div>
                    <div>• Generating unique 600-800 word descriptions with GPT-4</div>
                    <div>• Creating 6-8 professional images per product</div>
                    <div>• Optimizing pricing with psychological patterns ($X.99)</div>
                    <div>• Setting up 2-4 product variations per item</div>
                    <div>• Uploading to your Shopify store with proper formatting</div>
                  </div>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="mb-8">
                <div className="bg-white rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Generation Results</h3>
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
                          result.success 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {result.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {result.title || `Product ${index + 1}`}
                            </p>
                            {result.success && (
                              <p className="text-xs text-gray-600">
                                ${result.price} • {result.imagesUploaded || 6} images • {result.variantsCreated || 3} variants
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
                    🎉 Products Generated Successfully!
                  </h3>
                  <p className="text-green-700">
                    Your {niche} store now has {getSuccessCount() || 10} unique, AI-enhanced products with professional images and compelling descriptions ready for customers.
                  </p>
                  <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-green-600">
                    <div className="flex items-center">
                      <ShoppingBag className="h-4 w-4 mr-1" />
                      {getSuccessCount() || 10} Products
                    </div>
                    <div className="flex items-center">
                      <Camera className="h-4 w-4 mr-1" />
                      Professional Images
                    </div>
                    <div className="flex items-center">
                      <Sparkles className="h-4 w-4 mr-1" />
                      AI Content
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WinningProductsStep;

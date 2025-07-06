import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, CheckCircle, XCircle, RefreshCw, Star, Users, Camera, Sparkles, Zap, ShoppingBag, TrendingUp } from "lucide-react";
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
  status: string;
  error?: string;
}

const WinningProductsStep = ({ formData, handleInputChange }: WinningProductsStepProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [productPreviews, setProductPreviews] = useState<any[]>([]);

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
    setProductPreviews([]);
    setCurrentStage("🌟 Connecting to Amazon Influencer Database...");

    try {
      console.log(`🚀 AMAZON RAPIDAPI: Starting generation for ${niche} niche`);
      
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
        sessionId: sessionId,
        rapidApiIntegration: true
      };

      console.log('🎯 Amazon RapidAPI request:', requestData);

      // Enhanced progress stages for Amazon API integration
      const stages = [
        { progress: 10, stage: "📡 Fetching trending Amazon influencer data...", previews: [] },
        { progress: 25, stage: "🔥 Analyzing hot-selling products from top influencers...", previews: generatePreviewProducts(niche, 3) },
        { progress: 40, stage: "🤖 Enhancing with GPT-4 emotional copywriting...", previews: generatePreviewProducts(niche, 6) },
        { progress: 60, stage: "🎨 Creating unique DALL-E product images...", previews: generatePreviewProducts(niche, 8) },
        { progress: 75, stage: "💰 Optimizing pricing & creating variations...", previews: generatePreviewProducts(niche, 10) },
        { progress: 90, stage: "🛒 Uploading to your Shopify store...", previews: generatePreviewProducts(niche, 10) },
      ];

      // Start progress simulation with previews
      let stageIndex = 0;
      const progressInterval = setInterval(() => {
        if (stageIndex < stages.length) {
          setProgress(stages[stageIndex].progress);
          setCurrentStage(stages[stageIndex].stage);
          setProductPreviews(stages[stageIndex].previews);
          stageIndex++;
        }
      }, 3000);

      const { data, error } = await supabase.functions.invoke('add-shopify-product', {
        body: requestData
      });

      clearInterval(progressInterval);

      if (error) {
        console.error('❌ Amazon RapidAPI generation failed:', error);
        throw new Error(`Amazon Integration Error: ${error.message || 'Unknown error'}`);
      }

      if (!data || !data.success) {
        const errorMsg = data?.error || data?.message || 'Amazon product generation failed';
        console.error('❌ Generation failed:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ Amazon RapidAPI generation successful:', data);
      
      setResults(data.results || []);
      setProgress(100);
      setCurrentStage("🎉 Amazon trending products uploaded successfully!");
      
      // Mark products as added
      handleInputChange('productsAdded', true);
      
      const successCount = data.successfulUploads || data.results?.filter((r: any) => r.status === 'SUCCESS').length || 0;
      
      toast.success(
        `🎉 Successfully created ${successCount} trending ${niche} products from Amazon influencer data!`,
        { duration: 5000 }
      );

      // Store generation data
      await storeGenerationData(data);

    } catch (error: any) {
      console.error('❌ Amazon RapidAPI generation error:', error);
      setProgress(0);
      setCurrentStage("❌ Generation failed");
      setProductPreviews([]);
      
      let errorMessage = 'Amazon product generation failed';
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Failed to generate trending products: ${errorMessage}`, {
        duration: 8000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate preview products for UI feedback
  const generatePreviewProducts = (niche: string, count: number) => {
    const nicheProducts = {
      tech: ['Smart Wireless Charger Pro', 'Bluetooth Gaming Headset', '4K AI Webcam', 'Portable Power Station'],
      pets: ['Smart Pet Water Fountain', 'Interactive Puzzle Feeder', 'Premium Training Collar', 'Self-Cleaning Litter Box'],
      beauty: ['LED Light Therapy Mask', 'Jade Facial Roller Set', 'Electric Makeup Brush Cleaner', 'Skincare Fridge'],
      fitness: ['Resistance Band System', 'Smart Yoga Mat', 'Digital Body Scale', 'Foam Roller with Vibration'],
      kitchen: ['Air Fryer Oven Pro', 'Smart Espresso Machine', 'Chef Knife Set', 'Silicone Utensil Collection'],
      home: ['Smart LED Strip Lights', 'Aromatherapy Diffuser', 'Bamboo Organizer Set', 'Memory Foam Bath Mat']
    };

    const products = nicheProducts[niche.toLowerCase() as keyof typeof nicheProducts] || nicheProducts.tech;
    
    return Array.from({ length: count }, (_, i) => ({
      title: `${products[i % products.length]} - Amazon Trending`,
      price: `$${(19.99 + Math.random() * 40).toFixed(2)}`,
      isPreview: true
    }));
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
        api_source: 'rapidapi_amazon_data',
        created_at: new Date().toISOString()
      };

      localStorage.setItem('storeGenerationData', JSON.stringify(storeData));
      console.log('✅ RapidAPI Amazon store data saved successfully');
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
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                🚀 Launch AI-Powered {nicheCapitalized} Store
              </h1>
              <p className="text-gray-600 text-lg">
                Generate 10 trending {nicheCapitalized} products from Amazon influencer data with AI-enhanced content and DALL-E images
              </p>
            </div>

            {!hasStarted && (
              <>
                {/* Enhanced Features Display - Amazon RapidAPI Integration */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8 border border-green-200">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-2">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      NEW: Amazon RapidAPI Integration
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                    🔥 Amazon Trending Products with AI Enhancement
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-green-100">
                      <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">Amazon Data</div>
                      <div className="text-sm text-gray-600">Real influencer trends</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-yellow-100">
                      <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">Hot Sellers</div>
                      <div className="text-sm text-gray-600">Verified winners</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-blue-100">
                      <Camera className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">DALL-E Images</div>
                      <div className="text-sm text-gray-600">6 unique per product</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-purple-100">
                      <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">GPT-4 Content</div>
                      <div className="text-sm text-gray-600">600-800 words</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={generateProducts}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold h-auto shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating Products...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="mr-2 h-5 w-5" />
                          Generate Amazon Trending {nicheCapitalized} Products
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {isGenerating && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentStage}
                    </h3>
                    <span className="text-sm text-gray-600 font-medium">{Math.round(progress)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                    <div 
                      className="bg-gradient-to-r from-green-600 to-blue-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  {/* Product Previews */}
                  {productPreviews.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        🔍 Discovering Products ({productPreviews.length}/10)
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {productPreviews.map((preview, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 shadow-sm border animate-pulse">
                            <div className="bg-gradient-to-r from-green-200 to-blue-200 rounded-lg h-16 mb-2"></div>
                            <div className="text-xs font-medium text-gray-700 truncate mb-1">
                              {preview.title.substring(0, 25)}...
                            </div>
                            <div className="text-xs text-green-600 font-semibold">{preview.price}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-600 space-y-1 bg-white rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      🔥 Fetching trending products from Amazon influencers
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                      🤖 Generating unique 600-800 word descriptions with GPT-4
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                      🎨 Creating 6 DALL-E images per product
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                      💰 Optimizing pricing with psychological patterns ($X.99)
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                      🔧 Setting up 3 product variations per item
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></div>
                      🛒 Uploading to your Shopify store with proper formatting
                    </div>
                  </div>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="mb-8">
                <div className="bg-white rounded-xl border p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                      Amazon Product Generation Results
                    </h3>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-green-600 font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Success: {getSuccessCount()}
                      </span>
                      {getFailureCount() > 0 && (
                        <span className="text-red-600 font-medium flex items-center">
                          <XCircle className="h-4 w-4 mr-1" />
                          Failed: {getFailureCount()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 max-h-72 overflow-y-auto">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                          result.status === 'SUCCESS' 
                            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                            : 'bg-red-50 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {result.status === 'SUCCESS' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-semibold text-sm">
                              {result.title || `Amazon Product ${index + 1}`}
                            </p>
                            {result.status === 'SUCCESS' && (
                              <p className="text-xs text-gray-600 flex items-center space-x-3">
                                <span className="flex items-center">
                                  <span className="text-green-600 font-medium">${result.price}</span>
                                </span>
                                <span className="flex items-center">
                                  <Camera className="h-3 w-3 mr-1" />
                                  {result.imagesUploaded || 6} DALL-E images
                                </span>
                                <span className="flex items-center">
                                  <Package className="h-3 w-3 mr-1" />
                                  {result.variantsCreated || 3} variants
                                </span>
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
                        className="w-full hover:bg-gray-50"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry Failed Amazon Products
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {formData.productsAdded && (
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border border-green-200">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-900 mb-3">
                    🎉 Amazon Trending Products Generated Successfully!
                  </h3>
                  <p className="text-green-700 text-lg leading-relaxed">
                    Your {niche} store now has {getSuccessCount() || 10} trending Amazon products with DALL-E generated images and GPT-4 enhanced descriptions ready for customers.
                  </p>
                  <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-green-600">
                    <div className="flex items-center bg-white rounded-full px-3 py-1 shadow-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Amazon Trending
                    </div>
                    <div className="flex items-center bg-white rounded-full px-3 py-1 shadow-sm">
                      <Camera className="h-4 w-4 mr-1" />
                      DALL-E Images
                    </div>
                    <div className="flex items-center bg-white rounded-full px-3 py-1 shadow-sm">
                      <Sparkles className="h-4 w-4 mr-1" />
                      GPT-4 Content
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

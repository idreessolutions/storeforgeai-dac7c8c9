
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, CheckCircle, XCircle, RefreshCw, Star, Users, Camera, Sparkles, Image, Zap, Crown, Wand2 } from "lucide-react";
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
  images?: string[];
  variants?: any[];
  dalleImages?: string[];
}

const WinningProductsStep = ({ formData, handleInputChange }: WinningProductsStepProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProductResult[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('');
  const [generatedCount, setGeneratedCount] = useState(0);

  const sessionId = localStorage.getItem('storeBuilderSessionId') || 'default';
  const niche = formData.niche || 'Products';
  const nicheCapitalized = niche.charAt(0).toUpperCase() + niche.slice(1);

  // Mock placeholder products for preview while generating
  const placeholderProducts = [
    { title: `Premium ${nicheCapitalized} Tool`, price: "$29.99", rating: "4.8⭐", orders: "2,847" },
    { title: `Professional ${nicheCapitalized} Kit`, price: "$45.99", rating: "4.9⭐", orders: "1,293" },
    { title: `Elite ${nicheCapitalized} Solution`, price: "$32.99", rating: "4.7⭐", orders: "3,156" },
    { title: `Ultimate ${nicheCapitalized} Bundle`, price: "$67.99", rating: "4.8⭐", orders: "987" },
    { title: `Smart ${nicheCapitalized} Helper`, price: "$24.99", rating: "4.9⭐", orders: "4,521" },
    { title: `Advanced ${nicheCapitalized} System`, price: "$39.99", rating: "4.6⭐", orders: "1,865" },
    { title: `Pro ${nicheCapitalized} Essential`, price: "$28.99", rating: "4.8⭐", orders: "2,374" },
    { title: `Deluxe ${nicheCapitalized} Package`, price: "$52.99", rating: "4.7⭐", orders: "1,102" },
    { title: `Expert ${nicheCapitalized} Gear`, price: "$35.99", rating: "4.9⭐", orders: "2,945" },
    { title: `Premium ${nicheCapitalized} Set`, price: "$41.99", rating: "4.8⭐", orders: "1,567" }
  ];

  const generateProducts = async () => {
    if (!formData.shopifyUrl || !formData.accessToken) {
      toast.error('Missing Shopify store URL or access token');
      return;
    }

    setIsGenerating(true);
    setHasStarted(true);
    setProgress(0);
    setResults([]);
    setGeneratedCount(0);
    setCurrentPhase('Initializing AI product generation...');

    try {
      console.log(`🚨 STARTING ENHANCED PRODUCT GENERATION with DALL-E for ${formData.niche?.toUpperCase()} niche`);
      
      const requestData = {
        productCount: 10,
        niche: formData.niche || 'general',
        storeName: formData.storeName || 'My Store',
        targetAudience: formData.targetAudience || 'Everyone',
        businessType: formData.businessType || 'e-commerce',
        storeStyle: formData.storeStyle || 'modern',
        shopifyUrl: formData.shopifyUrl,
        shopifyAccessToken: formData.accessToken,
        themeColor: formData.themeColor || '#3B82F6',
        sessionId: sessionId,
        generateRealProducts: true,
        useDALLEImages: true,
        enhancedDescriptions: true,
        enhancedGeneration: true,
        generateVariationImages: true,
        useEmojisInDescriptions: true,
        generateSEOContent: true,
        wordCount: 600
      };

      console.log('🎯 ENHANCED REQUEST with DALL-E:', requestData);

      // Enhanced progress simulation with phases
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 6;
          
          // Update phases based on progress
          if (newProgress < 15) {
            setCurrentPhase('🔍 Finding winning products with 4.7+ ratings...');
          } else if (newProgress < 30) {
            setCurrentPhase('🤖 GPT-4 generating rich 600-word descriptions...');
          } else if (newProgress < 50) {
            setCurrentPhase('🎨 DALL-E creating 6-8 unique images per product...');
          } else if (newProgress < 70) {
            setCurrentPhase('💰 Optimizing pricing and creating variants...');
          } else if (newProgress < 85) {
            setCurrentPhase('🏪 Uploading products to your Shopify store...');
          } else {
            setCurrentPhase('✨ Finalizing store with premium theme...');
          }

          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 1500);

      // Simulate product generation count
      const countInterval = setInterval(() => {
        setGeneratedCount(prev => {
          if (prev < 10 && progress > 20) {
            return prev + 1;
          }
          return prev;
        });
      }, 3000);

      const { data, error } = await supabase.functions.invoke('add-shopify-product', {
        body: requestData
      });

      clearInterval(progressInterval);
      clearInterval(countInterval);

      if (error) {
        console.error('❌ Enhanced generation failed:', error);
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Product generation failed');
      }

      console.log('✅ ENHANCED GENERATION SUCCESS with DALL-E:', data);
      
      setResults(data.results || []);
      setProgress(100);
      setCurrentPhase('🎉 All products successfully generated!');
      setGeneratedCount(10);
      
      // Mark products as added
      handleInputChange('productsAdded', true);
      
      toast.success(`🎉 Successfully created ${data.successfulUploads || 10} unique ${formData.niche} products with AI-generated images and rich descriptions!`, {
        duration: 5000,
      });

      // Store generation data in Supabase
      await storeGenerationData(data);

    } catch (error: any) {
      console.error('❌ Product generation error:', error);
      setProgress(0);
      setCurrentPhase('❌ Generation failed');
      
      toast.error(`Failed to generate products: ${error.message}`, {
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
    setGeneratedCount(0);
    setCurrentPhase('');
    handleInputChange('productsAdded', false);
    generateProducts();
  };

  const getSuccessCount = () => {
    return results.filter(result => result.status === 'SUCCESS').length;
  };

  const getFailureCount = () => {
    return results.filter(result => result.status === 'FAILED').length;
  };

  const getTotalImages = () => {
    return results.reduce((total, result) => total + (result.imagesUploaded || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto pt-4 sm:pt-8">
        <Card className="bg-white shadow-2xl border-0">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Package className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                🚀 Launch AI-Powered {nicheCapitalized} Store
              </h1>
              <p className="text-gray-600 text-lg">
                Install premium theme + add 10 trending {nicheCapitalized} products with DALL-E images to attract {formData.targetAudience || 'customers'} with winning products
              </p>
            </div>

            {!hasStarted && (
              <>
                {/* Enhanced AI Product Generation Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                    🚀 Enhanced AI Product Generation with DALL-E Images
                  </h3>
                  
                  {/* Feature Boxes */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border hover:shadow-md transition-shadow">
                      <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">4.8+ Rating</div>
                      <div className="text-sm text-gray-600">Quality verified</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border hover:shadow-md transition-shadow">
                      <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">1000+ Orders</div>
                      <div className="text-sm text-gray-600">Proven bestsellers</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border hover:shadow-md transition-shadow">
                      <Camera className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">DALL-E Images</div>
                      <div className="text-sm text-gray-600">6-8 per product</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border hover:shadow-md transition-shadow">
                      <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">Rich Descriptions</div>
                      <div className="text-sm text-gray-600">500-800 words</div>
                    </div>
                  </div>

                  {/* What You Get */}
                  <div className="bg-white rounded-lg p-6 mb-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">✨ What You Get:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">10 trending {nicheCapitalized} products</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">6-8 DALL-E generated images per product</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Rich 500-800 word SEO descriptions</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Multiple product variations</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Smart pricing ($15-$80 range)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Emoji-rich engaging content</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="text-center">
                  <Button
                    onClick={generateProducts}
                    className="w-full sm:w-auto h-16 px-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-3" />
                        Generating Products with DALL-E...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Wand2 className="mr-3 h-6 w-6" />
                        Generate 10 AI Products with DALL-E Images
                      </div>
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* Enhanced Progress Section */}
            {hasStarted && (
              <div className="mt-8">
                {/* Live Generation Status */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          🤖 AI is creating your {formData.niche} products...
                        </h3>
                        <p className="text-sm text-gray-600">{currentPhase}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{Math.round(progress)}%</div>
                      <div className="text-sm text-gray-600">{generatedCount}/10 products</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>

                  {/* AI Process Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className={`flex items-center p-3 rounded-lg ${progress > 20 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      <Crown className={`h-5 w-5 mr-2 ${progress > 20 ? 'animate-spin' : ''}`} />
                      <span className="text-sm font-medium">Finding Winners</span>
                    </div>
                    <div className={`flex items-center p-3 rounded-lg ${progress > 50 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                      <Camera className={`h-5 w-5 mr-2 ${progress > 50 ? 'animate-pulse' : ''}`} />
                      <span className="text-sm font-medium">DALL-E Images</span>
                    </div>
                    <div className={`flex items-center p-3 rounded-lg ${progress > 80 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                      <Zap className={`h-5 w-5 mr-2 ${progress > 80 ? 'animate-bounce' : ''}`} />
                      <span className="text-sm font-medium">Uploading Store</span>
                    </div>
                  </div>
                </div>

                {/* Product Preview Grid */}
                {generatedCount > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      📦 Generating Products ({generatedCount}/10)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {placeholderProducts.slice(0, generatedCount).map((product, index) => (
                        <Card key={index} className="border shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-24 rounded mb-2 flex items-center justify-center">
                              <Image className="h-8 w-8 text-gray-400" />
                            </div>
                            <h4 className="text-xs font-semibold text-gray-900 mb-1 line-clamp-2">
                              {product.title}
                            </h4>
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-green-600">{product.price}</span>
                              <span className="text-gray-500">{product.rating}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{product.orders} orders</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results Summary */}
                {results.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="font-bold text-green-900">{getSuccessCount()}</div>
                      <div className="text-sm text-green-700">Products Created</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <div className="font-bold text-red-900">{getFailureCount()}</div>
                      <div className="text-sm text-red-700">Failed</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <Image className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="font-bold text-blue-900">{getTotalImages()}</div>
                      <div className="text-sm text-blue-700">DALL-E Images</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                      <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="font-bold text-purple-900">{results.reduce((total, result) => total + (result.variantsCreated || 0), 0)}</div>
                      <div className="text-sm text-purple-700">Variations</div>
                    </div>
                  </div>
                )}

                {/* Retry Button */}
                {!isGenerating && getFailureCount() > 0 && (
                  <div className="text-center mt-8">
                    <Button
                      onClick={retryGeneration}
                      className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg"
                    >
                      <RefreshCw className="mr-2 h-5 w-5" />
                      Retry Failed Products
                    </Button>
                  </div>
                )}

                {/* Success Message */}
                {!isGenerating && progress === 100 && getSuccessCount() > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mt-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-900 mb-2">
                      🎉 Products Successfully Generated!
                    </h3>
                    <p className="text-green-700">
                      {getSuccessCount()} products with {getTotalImages()} DALL-E images have been added to your {formData.niche} store!
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WinningProductsStep;

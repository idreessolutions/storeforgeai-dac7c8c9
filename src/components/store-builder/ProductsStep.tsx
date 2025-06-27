
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
}

const ProductsStep = ({ formData, handleInputChange }: ProductsStepProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProductResult[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  const sessionId = localStorage.getItem('storeBuilderSessionId') || 'default';

  const generateProducts = async () => {
    if (!formData.shopifyUrl || !formData.accessToken) {
      toast.error('Missing Shopify store URL or access token');
      return;
    }

    setIsGenerating(true);
    setHasStarted(true);
    setProgress(0);
    setResults([]);

    try {
      console.log(`🚨 STARTING ENHANCED PRODUCT GENERATION for ${formData.niche?.toUpperCase()} niche`);
      
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
        sessionId: sessionId
      };

      console.log('🎯 ENHANCED REQUEST:', requestData);

      // Start progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 2000);

      const { data, error } = await supabase.functions.invoke('add-shopify-product', {
        body: requestData
      });

      clearInterval(progressInterval);

      if (error) {
        console.error('❌ Enhanced generation failed:', error);
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Product generation failed');
      }

      console.log('✅ ENHANCED GENERATION SUCCESS:', data);
      
      setResults(data.results || []);
      setProgress(100);
      
      // Mark products as added
      handleInputChange('productsAdded', true);
      
      toast.success(`🎉 Successfully created ${data.successfulUploads} unique ${formData.niche} products!`, {
        duration: 5000,
      });

    } catch (error: any) {
      console.error('❌ Product generation error:', error);
      setProgress(0);
      
      toast.error(`Failed to generate products: ${error.message}`, {
        duration: 8000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const retryGeneration = () => {
    setHasStarted(false);
    setResults([]);
    setProgress(0);
    handleInputChange('productsAdded', false);
  };

  const getSuccessCount = () => {
    return results.filter(result => result.status === 'SUCCESS').length;
  };

  const getFailureCount = () => {
    return results.filter(result => result.status === 'FAILED').length;
  };

  return (
    <Card className="border-0 shadow-lg max-w-4xl mx-auto">
      <CardContent className="py-12 px-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Generate Products</h2>
          <p className="text-gray-600">
            AI-powered product generation with unique content for your {formData.niche} store
          </p>
        </div>

        {!hasStarted && (
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                🚀 Enhanced AI Product Generation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>10 unique {formData.niche} products</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Real product images & variants</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>AI-enhanced descriptions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Optimized pricing & SEO</span>
                </div>
              </div>
            </div>

            <Button
              onClick={generateProducts}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Products...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-5 w-5" />
                  Generate 10 Unique Products
                </>
              )}
            </Button>
          </div>
        )}

        {isGenerating && (
          <div className="mb-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  🤖 AI is creating your {formData.niche} products...
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
                <div>✨ Generating unique content with different tones</div>
                <div>🖼️ Sourcing real product images</div>
                <div>💰 Optimizing pricing and variants</div>
                <div>🛒 Uploading to your Shopify store</div>
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
                          {result.title || `Product ${index + 1}`}
                        </p>
                        {result.status === 'SUCCESS' && (
                          <p className="text-xs text-gray-600">
                            ${result.price} • {result.imagesUploaded} images • {result.variantsCreated} variants
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
                Your {formData.niche} store now has {getSuccessCount()} unique, AI-enhanced products ready for customers.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsStep;

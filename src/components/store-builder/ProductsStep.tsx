
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, CheckCircle, XCircle, RefreshCw, Star, Users, Camera, Sparkles } from "lucide-react";
import { generateCuratedProducts } from "@/services/curatedProductService";
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

const ProductsStep = ({ formData, handleInputChange }: ProductsStepProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProductName, setCurrentProductName] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  const sessionId = localStorage.getItem('storeBuilderSessionId') || 'default';
  const niche = formData.niche || 'Home & Living';
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
    setCurrentProductName('');

    try {
      console.log(`🚀 STARTING SUPABASE PRODUCT GENERATION for ${formData.niche?.toUpperCase()} from your bucket folders`);
      
      // Use ONLY the curated product service that pulls from YOUR Supabase buckets
      await generateCuratedProducts(
        validatedShopifyUrl,
        formData.accessToken!,
        formData.niche || 'Home & Living',
        (progressValue: number, productName: string) => {
          setProgress(progressValue);
          setCurrentProductName(productName);
          console.log(`Supabase Progress: ${progressValue}% - ${productName}`);
        },
        formData.themeColor || '#3B82F6',
        formData.storeName || 'My Store'
      );

      console.log('✅ SUPABASE SUCCESS: Products loaded from your bucket folders');
      
      // Mark products as added
      handleInputChange('productsAdded', true);
      
      toast.success(`🎉 Successfully created 10 curated ${formData.niche} products from YOUR Supabase buckets!`, {
        duration: 5000,
      });

      // Store generation data in localStorage
      await storeGenerationData({
        success: true,
        successfulUploads: 10,
        source: 'Your Supabase Bucket Folders',
        system: 'Curated Products from Storage'
      });

    } catch (error: any) {
      console.error('❌ Supabase bucket generation error:', error);
      setProgress(0);
      setCurrentProductName('');
      
      // Show detailed error message
      const errorMessage = error.message || 'Unknown error occurred';
      console.error('Full Supabase error details:', error);
      
      toast.error(`Failed to generate products from your Supabase buckets: ${errorMessage}`, {
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
        products_generated: generationData.successfulUploads || 10,
        generation_data: generationData,
        created_at: new Date().toISOString(),
        data_source: 'Supabase Curated Products'
      };

      localStorage.setItem('storeGenerationData', JSON.stringify(storeData));
      console.log('✅ Curated store data saved successfully');
    } catch (error) {
      console.error('❌ Failed to store generation data:', error);
    }
  };

  const retryGeneration = () => {
    setHasStarted(false);
    setProgress(0);
    setCurrentProductName('');
    handleInputChange('productsAdded', false);
    handleGenerateProducts();
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
                🗂️ Launch From YOUR Supabase Buckets
              </h1>
              <p className="text-gray-600 text-lg">
                Generate 10 products for {nicheCapitalized} directly from YOUR Supabase bucket folders with real images and AI-enhanced descriptions
              </p>
            </div>

            {!hasStarted && (
              <>
                {/* Enhanced Supabase Product Generation Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                    🗂️ Premium Products from YOUR Supabase Storage Buckets
                  </h3>
                  
                  {/* Feature Boxes - Supabase focused */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
                      <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">Your Folders</div>
                      <div className="text-sm text-gray-600">Product 1-20</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
                      <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">Real Titles</div>
                      <div className="text-sm text-gray-600">From Titles folder</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
                      <Camera className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">Your Images</div>
                      <div className="text-sm text-gray-600">From bucket folders</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
                      <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">AI Descriptions</div>
                      <div className="text-sm text-gray-600">500-800 words</div>
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
                          Loading from YOUR Supabase Buckets...
                        </>
                      ) : (
                        <>
                          <Package className="mr-2 h-5 w-5" />
                          Generate From YOUR {nicheCapitalized} Bucket
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
                      🗂️ Loading {formData.niche} products from YOUR Supabase bucket...
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
                    <div>📦 {currentProductName || `Reading from YOUR ${formData.niche} bucket...`}</div>
                    <div>🗂️ Accessing Product 1-20 folders in YOUR Supabase</div>
                    <div>📝 Reading titles from YOUR Titles folders</div>
                    <div>🖼️ Using YOUR real images from Products Images folders</div>
                    <div>🎨 Getting YOUR variant images from Variants Product Images</div>
                    <div>🤖 Generating unique 500-800 word descriptions with AI</div>
                    <div>💰 Applying smart pricing ($15-$80 range)</div>
                    <div>🛒 Uploading to your Shopify store</div>
                  </div>
                </div>
              </div>
            )}

            {formData.productsAdded && (
              <div className="text-center">
                <div className="bg-green-50 rounded-xl p-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-900 mb-2">
                    🎉 Products Generated from YOUR Supabase Buckets!
                  </h3>
                  <p className="text-green-700">
                    Your {formData.niche} store now has 10 products generated from YOUR Supabase bucket folders with YOUR real images and AI-enhanced descriptions.
                  </p>
                  
                  {hasStarted && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <Button
                        onClick={retryGeneration}
                        variant="outline"
                        className="w-full border-green-300 text-green-700 hover:bg-green-100"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Generate Different Products from YOUR Buckets
                      </Button>
                    </div>
                  )}
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

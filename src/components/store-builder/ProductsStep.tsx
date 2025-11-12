
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, CheckCircle, XCircle, RefreshCw, Star, Users, Camera, Sparkles, Shield, Lock, DollarSign, FileText, Zap, Image } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 relative overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-200 rounded-full opacity-20 animate-float-delayed"></div>
      
      <div className="max-w-4xl mx-auto pt-4 sm:pt-8 relative z-10">
        <Card className="bg-white shadow-2xl border-0 rounded-2xl">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Package className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Add Winning Products Automatically
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                Our AI will add 10 premium, niche-specific products directly into your Shopify store — complete with images, variations, pricing, and SEO-optimized descriptions.
              </p>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Real Product Images</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Shield className="h-4 w-4" />
                  <span>AI-Powered Selection</span>
                </div>
                <div className="flex items-center gap-2 text-purple-600">
                  <Sparkles className="h-4 w-4" />
                  <span>SEO Optimized</span>
                </div>
              </div>
            </div>

            {!hasStarted && (
              <>
                {/* What You'll Get Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                    <span 
                      dangerouslySetInnerHTML={{
                        __html: '<lord-icon src="https://cdn.lordicon.com/gmypinsw.json" trigger="hover" stroke="bold" state="hover-burst" colors="primary:#e8e230,secondary:#e8e230" style="width:24px;height:24px"></lord-icon>'
                      }}
                    /> What You'll Get
                  </h3>
                  
                  {/* Feature Boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-5 text-center shadow-md border-2 border-transparent hover:border-purple-300 transition-all">
                      <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="h-7 w-7 text-white" />
                      </div>
                      <div className="font-bold text-gray-900 mb-1">AI-Picked Products</div>
                      <div className="text-sm text-gray-600">Selected by AI from top suppliers</div>
                    </div>
                    <div className="bg-white rounded-xl p-5 text-center shadow-md border-2 border-transparent hover:border-blue-300 transition-all">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Image className="h-7 w-7 text-white" />
                      </div>
                      <div className="font-bold text-gray-900 mb-1">Real Product Images</div>
                      <div className="text-sm text-gray-600">Real product photos</div>
                    </div>
                    <div className="bg-white rounded-xl p-5 text-center shadow-md border-2 border-transparent hover:border-green-300 transition-all">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <DollarSign className="h-7 w-7 text-white" />
                      </div>
                      <div className="font-bold text-gray-900 mb-1">Smart Pricing</div>
                      <div className="text-sm text-gray-600">Competitive pricing powered by AI</div>
                    </div>
                    <div className="bg-white rounded-xl p-5 text-center shadow-md border-2 border-transparent hover:border-purple-300 transition-all">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-7 w-7 text-white" />
                      </div>
                      <div className="font-bold text-gray-900 mb-1">SEO Descriptions</div>
                      <div className="text-sm text-gray-600">500–800 word story-based copy</div>
                    </div>
                  </div>

                  {/* Main CTA Button */}
                  <div className="text-center">
                    <Button
                      onClick={handleGenerateProducts}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-6 rounded-xl text-lg font-bold h-auto shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                          Adding Products to Your Store...
                        </>
                      ) : (
                        <>
                          <span 
                            dangerouslySetInnerHTML={{
                              __html: '<lord-icon src="https://cdn.lordicon.com/pmtkscxd.json" trigger="hover" stroke="bold" colors="primary:#e83a30,secondary:#e8e230" style="width:20px;height:20px"></lord-icon>'
                            }}
                          /> Add 10 Winning Products to My Store
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Process Info */}
                  <div className="mt-6 bg-white rounded-xl p-5 border border-purple-200">
                    <h4 className="font-semibold text-gray-900 mb-3 text-center">Once you click the button, our AI:</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>Uploads products</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>Adds variations & images</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>Writes descriptions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>Categorizes everything automatically</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust Box */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-5 border-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">You stay in full control</span> — you can edit or remove anything later inside Shopify.
                    </div>
                  </div>
                </div>
              </>
            )}

            {isGenerating && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                      Adding {formData.niche} products to your store...
                    </h3>
                    <span className="text-lg font-bold text-purple-600">{Math.round(progress)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <div className="text-sm text-gray-700 space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">{currentProductName || `Selecting winning ${formData.niche} products...`}</span>
                    </div>
                    <div className="ml-6 space-y-1 text-gray-600">
                      <div>✨ AI selecting best products</div>
                      <div>🖼️ Processing real product images</div>
                      <div>💰 Applying smart pricing strategy</div>
                      <div>✍️ Generating SEO descriptions (500-800 words)</div>
                      <div>🎨 Adding variations and options</div>
                      <div>🛒 Uploading to your Shopify store</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.productsAdded && (
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-900 mb-3">
                    🎉 Products Successfully Added!
                  </h3>
                  <p className="text-green-700 text-lg mb-4">
                    Your {formData.niche} store now has 10 premium products with real images, smart pricing, and SEO-optimized descriptions.
                  </p>
                  
                  <div className="bg-white rounded-xl p-4 mb-4 inline-block">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>You can edit everything later in Shopify</span>
                    </div>
                  </div>
                  
                  {hasStarted && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <Button
                        onClick={retryGeneration}
                        variant="outline"
                        className="w-full sm:w-auto border-green-400 text-green-700 hover:bg-green-100 font-semibold"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Add Different Products
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

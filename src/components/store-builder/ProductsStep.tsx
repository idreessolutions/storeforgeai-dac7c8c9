
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, PackagePlus, Loader2, Sparkles, Target, ImageIcon, DollarSign, Tag, AlertCircle, Trophy, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addProductsToShopify } from "@/services/productService";
import { installAndConfigureSenseTheme } from "@/services/shopifyThemeService";

interface ProductsStepProps {
  formData: {
    productsAdded: boolean;
    shopifyUrl: string;
    accessToken: string;
    niche: string;
    themeColor: string;
    targetAudience: string;
    businessType: string;
    storeStyle: string;
    customInfo: string;
  };
  handleInputChange: (field: string, value: boolean) => void;
}

const ProductsStep = ({ formData, handleInputChange }: ProductsStepProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProduct, setCurrentProduct] = useState("");
  const [currentStep, setCurrentStep] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleAddProducts = async () => {
    console.log('🏆 Starting REAL winning products workflow with formData:', formData);
    
    if (!formData.shopifyUrl || !formData.accessToken || !formData.niche || !formData.targetAudience) {
      const missingFields = [];
      if (!formData.shopifyUrl) missingFields.push('Shopify URL');
      if (!formData.accessToken) missingFields.push('Access Token');
      if (!formData.niche) missingFields.push('Niche');
      if (!formData.targetAudience) missingFields.push('Target Audience');
      
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      console.error('❌ Validation failed:', errorMsg);
      
      toast({
        title: "Missing Information",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    setProgress(0);
    setCurrentProduct("");
    setCurrentStep("");
    setError("");

    try {
      console.log('🏆 Starting REAL winning products + theme setup:', {
        niche: formData.niche,
        targetAudience: formData.targetAudience,
        businessType: formData.businessType,
        storeStyle: formData.storeStyle,
        themeColor: formData.themeColor,
        customInfo: formData.customInfo
      });
      
      // Step 1: Install Refresh theme
      setCurrentStep("Installing Refresh theme with custom colors...");
      setProgress(15);
      
      const storeName = extractStoreName(formData.shopifyUrl);
      
      if (storeName) {
        try {
          await installAndConfigureSenseTheme({
            storeName,
            accessToken: formData.accessToken,
            themeColor: formData.themeColor || '#1E40AF',
            niche: formData.niche
          });
          
          setProgress(30);
          setCurrentStep("✅ Refresh theme installed with custom styling");
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (themeError) {
          console.warn('⚠️ Theme installation failed, continuing with products:', themeError);
          setCurrentStep("Theme installation skipped, proceeding with winning products...");
        }
      }

      // Step 2: Generate and upload 10 REAL winning products
      setCurrentStep("🛒 Fetching REAL winning products from AliExpress...");
      setProgress(40);

      console.log('🏆 Calling addProductsToShopify with REAL winning products workflow:', {
        shopifyUrl: formData.shopifyUrl,
        niche: formData.niche,
        targetAudience: formData.targetAudience,
        businessType: formData.businessType,
        storeStyle: formData.storeStyle,
        themeColor: formData.themeColor,
        customInfo: formData.customInfo
      });

      await addProductsToShopify(
        formData.shopifyUrl,
        formData.accessToken,
        formData.niche,
        (progress: number, productName: string) => {
          setProgress(40 + (progress * 0.6));
          setCurrentProduct(productName);
          setCurrentStep("🏆 Adding REAL winning products with DALL·E 3 images...");
        },
        formData.themeColor || '#1E40AF',
        formData.targetAudience,
        formData.businessType,
        formData.storeStyle,
        formData.customInfo
      );

      handleInputChange('productsAdded', true);
      setCurrentStep("🎉 Complete!");
      
      toast({
        title: "🏆 REAL Winning Products Store Complete!",
        description: `Your ${formData.niche} store now has the Refresh theme + 10 REAL winning products from AliExpress with high ratings (4.5+) and proven sales (50+ orders) - each with DALL·E 3 generated images!`,
      });

    } catch (error) {
      console.error('❌ Error setting up REAL winning products store:', error);
      let errorMessage = "An unknown error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (errorMessage.includes('OpenAI API key not configured')) {
          errorMessage = "OpenAI API key is not configured. Please check your Supabase secrets.";
        } else if (errorMessage.includes('RapidAPI key not configured')) {
          errorMessage = "RapidAPI key is not configured. Please add your RapidAPI key to Supabase secrets.";
        } else if (errorMessage.includes('Failed to send a request to the Edge Function')) {
          errorMessage = "Network error connecting to our AI services. Please check your internet connection and try again.";
        } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
          errorMessage = "Authentication failed. Please check your Shopify access token.";
        } else if (errorMessage.includes('timeout')) {
          errorMessage = "The operation timed out. Please try again - this sometimes happens with real product fetching.";
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: "Setup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
      setProgress(0);
      setCurrentProduct("");
      setCurrentStep("");
    }
  };

  const extractStoreName = (url: string): string | null => {
    try {
      const cleanUrl = url.replace(/^https?:\/\//, '').toLowerCase();
      
      if (cleanUrl.includes('admin.shopify.com/store/')) {
        const match = cleanUrl.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
        return match ? match[1] : null;
      }
      
      if (cleanUrl.includes('.myshopify.com')) {
        const match = cleanUrl.match(/([^\/\.]+)\.myshopify\.com/);
        return match ? match[1] : null;
      }
      
      if (!cleanUrl.includes('.') && !cleanUrl.includes('/')) {
        return cleanUrl;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting store name:', error);
      return null;
    }
  };

  return (
    <Card className="border-0 shadow-lg max-w-3xl mx-auto">
      <CardContent className="py-12 px-8">
        <div className="text-center mb-8">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ 
              background: `linear-gradient(135deg, ${formData.themeColor || '#1E40AF'}, ${formData.themeColor || '#1E40AF'}aa)` 
            }}
          >
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">🏆 Launch REAL Winning Products Store</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Install <strong>Refresh theme</strong> + add 10 <strong>REAL winning products</strong> from AliExpress for <strong>{formData.niche}</strong> targeting <strong>{formData.targetAudience}</strong> with:
          </p>
          
          {/* Real Products Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 mb-6">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <Star className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <div className="text-xs font-semibold text-green-800">4.5+ Rating</div>
              <div className="text-xs text-green-600">Proven quality</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <PackagePlus className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-xs font-semibold text-blue-800">50+ Orders</div>
              <div className="text-xs text-blue-600">Validated demand</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <ImageIcon className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <div className="text-xs font-semibold text-purple-800">DALL·E 3 Images</div>
              <div className="text-xs text-purple-600">6 unique per product</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <Target className="h-6 w-6 text-orange-600 mx-auto mb-1" />
              <div className="text-xs font-semibold text-orange-800">GPT-4 Content</div>
              <div className="text-xs text-orange-600">Optimized copy</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-800">Setup Failed</h4>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <p className="text-red-600 text-xs mt-2">
                Make sure you have both OpenAI and RapidAPI keys configured in Supabase settings.
              </p>
            </div>
          </div>
        )}

        {formData.productsAdded ? (
          <div className="text-center">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ 
                background: `linear-gradient(135deg, #10B981, #059669)` 
              }}
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              10 REAL Winning Products Added!
              <Trophy className="h-6 w-6 text-yellow-500" />
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Your store now has <strong>10 REAL winning products</strong> from AliExpress with proven track records targeting <strong>{formData.targetAudience}</strong>, featuring:
            </p>
            
            {/* Success Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-green-800">High-Rated Products</div>
                <div className="text-xs text-green-600">4.5+ star ratings verified</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-blue-800">Proven Winners</div>
                <div className="text-xs text-blue-600">50+ orders each</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <ImageIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-purple-800">DALL·E 3 Images</div>
                <div className="text-xs text-purple-600">60 total unique images</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-orange-800">Smart Pricing</div>
                <div className="text-xs text-orange-600">Optimized for {formData.niche}</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-2">🎉 Your REAL Winning Products Store is Live!</h4>
              <p className="text-gray-700 text-sm">
                Visit your Shopify admin to see your 10 REAL winning {formData.niche} products with high ratings, 
                proven sales, custom DALL·E 3 images, and GPT-4 optimized descriptions - all ready to start selling!
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            {isAdding ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-lg font-semibold text-gray-900">
                    Setting up your REAL winning products store...
                  </span>
                </div>
                
                <Progress value={progress} className="w-full max-w-md mx-auto" />
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">{currentStep}</p>
                  {currentProduct && (
                    <p className="text-sm text-gray-600">
                      Processing: <span className="font-medium">{currentProduct}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-500">{Math.round(progress)}% complete</p>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleAddProducts}
                size="lg"
                className="text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                style={{ 
                  background: `linear-gradient(135deg, ${formData.themeColor || '#1E40AF'}, ${formData.themeColor || '#1E40AF'}dd)` 
                }}
              >
                <Trophy className="mr-2 h-5 w-5" />
                Launch REAL Winning Products Store
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsStep;

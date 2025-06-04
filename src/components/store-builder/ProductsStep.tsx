
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, PackagePlus, Loader2, Sparkles, Target, ImageIcon, DollarSign, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addProductsToShopify } from "@/services/productService";

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
  const { toast } = useToast();

  const handleAddProducts = async () => {
    if (!formData.shopifyUrl || !formData.accessToken || !formData.niche) {
      toast({
        title: "Missing Information",
        description: "Please ensure you have entered your Shopify URL, access token, and niche.",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    setProgress(0);
    setCurrentProduct("");
    setCurrentStep("");

    try {
      console.log('🚀 Starting complete store setup for niche:', formData.niche);
      console.log('🎯 Target audience:', formData.targetAudience);
      console.log('🏢 Business type:', formData.businessType);
      console.log('🎨 Store style:', formData.storeStyle);
      console.log('💬 Custom info:', formData.customInfo);
      console.log('🎨 Using theme color:', formData.themeColor);
      
      // Step 1: Install and configure Sense theme
      setCurrentStep("Installing Sense theme...");
      setProgress(10);
      
      const { installAndConfigureSenseTheme } = await import("@/services/shopifyThemeService");
      const storeName = extractStoreName(formData.shopifyUrl);
      
      if (storeName) {
        await installAndConfigureSenseTheme({
          storeName,
          accessToken: formData.accessToken,
          themeColor: formData.themeColor || '#1E40AF',
          niche: formData.niche
        });
        
        setProgress(30);
        setCurrentStep("Theme installed successfully");
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Step 2: Add 10 winning products with full context
      setCurrentStep("Generating winning products...");
      setProgress(40);

      await addProductsToShopify(
        formData.shopifyUrl,
        formData.accessToken,
        formData.niche,
        (progress: number, productName: string) => {
          setProgress(40 + (progress * 0.6)); // 40% to 100%
          setCurrentProduct(productName);
          setCurrentStep("Adding winning products...");
        },
        formData.themeColor || '#1E40AF',
        formData.targetAudience,
        formData.businessType,
        formData.storeStyle,
        formData.customInfo
      );

      handleInputChange('productsAdded', true);
      setCurrentStep("Complete!");
      
      toast({
        title: "🎉 Store Setup Complete!",
        description: `Your ${formData.niche} store for ${formData.targetAudience} now has the Sense theme installed with your custom color and 10 winning products ready to sell!`,
      });

    } catch (error) {
      console.error('Error setting up store:', error);
      toast({
        title: "Setup Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
      setProgress(0);
      setCurrentProduct("");
      setCurrentStep("");
    }
  };

  // Helper function to extract store name from URL
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
            <PackagePlus className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Store Setup</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Install the <strong>Sense theme</strong> with your custom styling and add 10 trending <strong>{formData.niche}</strong> winning products for <strong>{formData.targetAudience}</strong> - all automatically!
          </p>
        </div>

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
              <Sparkles className="h-6 w-6 text-yellow-500" />
              10 Real Winning {formData.niche} Products Added!
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Your store is now fully stocked with 10 unique, trending winning products specifically curated for the <strong>{formData.niche}</strong> niche targeting <strong>{formData.targetAudience}</strong>, each featuring:
            </p>
            
            {/* Success Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-green-800">Niche-Specific</div>
                <div className="text-xs text-green-600">All {formData.niche} products</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <ImageIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-blue-800">Premium Media</div>
                <div className="text-xs text-blue-600">6-8 unique images each</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-purple-800">Optimized Pricing</div>
                <div className="text-xs text-purple-600">$15-80 range</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <Tag className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-orange-800">Themed Styling</div>
                <div className="text-xs text-orange-600">Your color applied</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                10 unique {formData.niche} product types
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Professional 400-500 word descriptions
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                6-8 unique high-quality images each
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Custom theme color styling applied
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                SEO-optimized titles and {formData.niche} tags
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Realistic pricing ($15-80 range)
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Proper variants and category assignment
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Trending {formData.niche} products selected
              </div>
            </div>
            
            <Button 
              disabled 
              className="w-full max-w-md"
              style={{ 
                backgroundColor: '#10B981',
                color: 'white'
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              10 Real {formData.niche} Products Successfully Added
            </Button>
          </div>
        ) : (
          <div>
            {isAdding && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-700">
                    {currentStep || `Setting up your ${formData.niche} store for ${formData.targetAudience}...`}
                  </p>
                  <span 
                    className="text-sm font-semibold"
                    style={{ color: formData.themeColor || '#1E40AF' }}
                  >
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-3"
                  style={{ 
                    '--progress-background': formData.themeColor || '#1E40AF' 
                  } as React.CSSProperties}
                />
                {currentProduct && (
                  <p className="text-sm text-gray-500 mt-2 truncate">
                    <span className="font-medium">Currently adding:</span> {currentProduct}
                  </p>
                )}
              </div>
            )}
            
            {/* Updated features section */}
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border-l-4" style={{ borderColor: formData.themeColor || '#1E40AF' }}>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5" style={{ color: formData.themeColor || '#1E40AF' }} />
                Complete {formData.niche} Store Setup for {formData.targetAudience}:
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold text-sm mt-0.5">🎨</span>
                    <span><strong>Sense theme</strong> auto-installed & configured</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>10 trending {formData.niche} winning products for {formData.targetAudience}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ImageIcon className="h-4 w-4 mt-0.5 text-blue-600" />
                    <span>Product-specific images (6 per product)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold text-sm mt-0.5">✍️</span>
                    <span>AI-generated descriptions for {formData.niche} targeting {formData.targetAudience}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold text-sm mt-0.5">🎨</span>
                    <span>Your custom color applied to theme</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 mt-0.5 text-indigo-600" />
                    <span>SEO-optimized for {formData.niche} keywords</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>Winning price points for {formData.targetAudience} ($15-80)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold text-sm mt-0.5">🚀</span>
                    <span>Ready-to-sell {formData.storeStyle} store setup</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              className="w-full font-semibold py-4 text-lg"
              onClick={handleAddProducts}
              disabled={isAdding}
              style={{ 
                backgroundColor: formData.themeColor || '#1E40AF',
                color: 'white'
              }}
            >
              {isAdding ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Setting Up Your {formData.niche} Store for {formData.targetAudience}...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Setup Complete {formData.niche} Store for {formData.targetAudience} Now
                  <Sparkles className="h-5 w-5 ml-2" />
                </div>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsStep;


import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Sparkles, Loader2, Target, Zap, Star, Trophy, ShoppingBag, Wand2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateWinningProducts } from "@/services/enhancedProductService";
import { installAndConfigureSenseTheme } from "@/services/shopifyThemeService";

interface WinningProductsStepProps {
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
    storeName: string;
  };
  handleInputChange: (field: string, value: boolean) => void;
}

const WinningProductsStep = ({ formData, handleInputChange }: WinningProductsStepProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProduct, setCurrentProduct] = useState("");
  const [currentStep, setCurrentStep] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Enhanced niche configurations
  const nicheConfig = {
    'pets': { emoji: '🐾', color: '#ff6600', description: 'Premium pet care essentials', trend: 'Smart pet tech trending +45%' },
    'fitness': { emoji: '💪', color: '#00cc66', description: 'Powerful fitness equipment', trend: 'Home gym demand +67%' },
    'beauty': { emoji: '💄', color: '#e91e63', description: 'Luxurious beauty products', trend: 'Clean beauty rising +38%' },
    'tech': { emoji: '📱', color: '#3f51b5', description: 'Cutting-edge technology', trend: 'Smart devices +52%' },
    'baby': { emoji: '👶', color: '#fbbf24', description: 'Safe baby care items', trend: 'Baby tech growing +29%' },
    'home': { emoji: '🏠', color: '#4caf50', description: 'Cozy home essentials', trend: 'Home decor +41%' },
    'fashion': { emoji: '👗', color: '#d81b60', description: 'Trendy fashion pieces', trend: 'Sustainable fashion +33%' },
    'kitchen': { emoji: '🍳', color: '#ff5722', description: 'Smart kitchen gadgets', trend: 'Smart appliances +58%' },
    'gaming': { emoji: '🎮', color: '#9c27b0', description: 'Epic gaming accessories', trend: 'Gaming gear +71%' },
    'travel': { emoji: '✈️', color: '#03a9f4', description: 'Essential travel gear', trend: 'Travel accessories +44%' },
    'office': { emoji: '💼', color: '#607d8b', description: 'Smart office solutions', trend: 'Remote work gear +63%' }
  };

  const currentNicheConfig = nicheConfig[formData.niche.toLowerCase()] || nicheConfig['pets'];

  const handleGenerateWinningProducts = async () => {
    console.log(`🚀 CRITICAL: Starting winning ${formData.niche} product generation`);
    
    // Validate all required fields
    const requiredFields = ['shopifyUrl', 'accessToken', 'niche', 'targetAudience', 'storeName'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      const errorMsg = `Missing required information: ${missingFields.join(', ')}`;
      console.error('❌ Validation failed:', errorMsg);
      
      toast({
        title: "Missing Information",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setCurrentProduct("");
    setCurrentStep("");
    setError("");

    try {
      console.log(`🎯 WINNING PRODUCTS: Generating for ${formData.niche} niche targeting ${formData.targetAudience}`);
      
      // Step 1: Install premium theme
      setCurrentStep(`🎨 Installing premium ${formData.niche} theme...`);
      setProgress(10);
      
      const storeName = extractStoreName(formData.shopifyUrl);
      
      if (storeName) {
        try {
          await installAndConfigureSenseTheme({
            storeName: formData.storeName || storeName,
            accessToken: formData.accessToken,
            themeColor: formData.themeColor || currentNicheConfig.color,
            niche: formData.niche,
            targetAudience: formData.targetAudience,
            businessType: formData.businessType,
            storeStyle: formData.storeStyle,
            customInfo: formData.customInfo
          });
          
          setProgress(20);
          setCurrentStep(`✅ Premium ${formData.niche} theme installed`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (themeError) {
          console.warn(`⚠️ Theme installation failed, continuing with products:`, themeError);
        }
      }

      // Step 2: Generate winning products
      setCurrentStep(`${currentNicheConfig.emoji} Analyzing winning ${formData.niche} products...`);
      setProgress(25);

      await generateWinningProducts(
        formData.shopifyUrl,
        formData.accessToken,
        formData.niche,
        (progress: number, productName: string) => {
          setProgress(25 + (progress * 0.7));
          setCurrentProduct(productName);
          setCurrentStep(`🤖 Creating winning ${formData.niche} products...`);
        },
        formData.themeColor || currentNicheConfig.color,
        formData.targetAudience,
        formData.businessType,
        formData.storeStyle,
        formData.customInfo,
        formData.storeName
      );

      handleInputChange('productsAdded', true);
      setCurrentStep("🎉 Winning products live!");
      
      toast({
        title: `🏆 WINNING ${formData.niche.toUpperCase()} Store Complete!`,
        description: `Your ${formData.niche} store now has 10 WINNING products with 4.5+ ratings and 1000+ orders each!`,
      });

    } catch (error) {
      console.error(`❌ CRITICAL: Winning ${formData.niche} product generation failed:`, error);
      let errorMessage = "An unknown error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (errorMessage.includes('No winning')) {
          errorMessage = `No winning ${formData.niche} products found. Please try: pets, fitness, beauty, tech, baby, home, fashion, kitchen, gaming, travel, or office.`;
        } else if (errorMessage.includes('Product database connection failed')) {
          errorMessage = "Product database connection failed. Please check configuration.";
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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
      
      return cleanUrl.includes('.') || cleanUrl.includes('/') ? null : cleanUrl;
    } catch (error) {
      console.error('Error extracting store name:', error);
      return null;
    }
  };

  return (
    <Card className="border-0 shadow-xl max-w-4xl mx-auto">
      <CardContent className="py-12 px-8">
        <div className="text-center mb-8">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 relative"
            style={{ 
              background: `linear-gradient(135deg, ${formData.themeColor || currentNicheConfig.color}, ${formData.themeColor || currentNicheConfig.color}aa)` 
            }}
          >
            <span className="text-4xl">{currentNicheConfig.emoji}</span>
            <div className="absolute -top-2 -right-2">
              <TrendingUp className="h-6 w-6 text-green-500 animate-pulse" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            🏆 Generate WINNING {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Products
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Install <strong>premium theme</strong> + add 10 <strong>WINNING {formData.niche} products</strong> with <strong>verified sales</strong> targeting <strong>{formData.targetAudience}</strong>
          </p>
          
          {/* Trending Badge */}
          <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200 mt-4">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-green-800">{currentNicheConfig.trend}</span>
          </div>
          
          {/* Quality Guarantees */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 mb-6">
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-green-800">4.5+ Rating</div>
              <div className="text-xs text-green-600">Quality verified</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-blue-800">1000+ Orders</div>
              <div className="text-xs text-blue-600">Proven bestsellers</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <Wand2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-purple-800">AI Enhanced</div>
              <div className="text-xs text-purple-600">6-8 images each</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
              <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-orange-800">Smart Priced</div>
              <div className="text-xs text-orange-600">$15-$80 range</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <Zap className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-800">Generation Failed</h4>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {formData.productsAdded ? (
          <div className="text-center">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ 
                background: `linear-gradient(135deg, #10B981, #059669)` 
              }}
            >
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
              <span className="text-3xl">{currentNicheConfig.emoji}</span>
              10 WINNING {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Products Live!
              <Trophy className="h-8 w-8 text-yellow-500" />
            </h3>
            <p className="text-gray-600 mb-8 max-w-3xl mx-auto text-lg">
              Your {formData.niche} store now has <strong>10 WINNING {formData.niche} products</strong> with verified quality and proven sales records!
            </p>
            
            {/* Success Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <Star className="h-10 w-10 text-green-600 mx-auto mb-3" />
                <div className="font-bold text-green-800">WINNING Products</div>
                <div className="text-sm text-green-600">4.5+ star ratings</div>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <Trophy className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                <div className="font-bold text-blue-800">Proven Sales</div>
                <div className="text-sm text-blue-600">1000+ orders each</div>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <Wand2 className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                <div className="font-bold text-purple-800">60+ AI Images</div>
                <div className="text-sm text-purple-600">Professional quality</div>
              </div>
              <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                <Sparkles className="h-10 w-10 text-orange-600 mx-auto mb-3" />
                <div className="font-bold text-orange-800">Ready to Sell</div>
                <div className="text-sm text-orange-600">Published & live</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-xl border border-green-200">
              <h4 className="font-bold text-gray-900 mb-3 text-xl">
                🎉 Your WINNING {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Store is Ready!
              </h4>
              <p className="text-gray-700">
                Visit your Shopify admin to see your 10 WINNING {formData.niche} products with verified 4.5+ ratings, 
                proven 1000+ orders each, custom AI images, optimized descriptions, and pricing - all ready to generate sales!
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            {isGenerating ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="text-xl font-bold text-gray-900">
                    Generating WINNING {formData.niche} products...
                  </span>
                </div>
                
                <Progress value={progress} className="w-full max-w-md mx-auto h-3" />
                
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
                onClick={handleGenerateWinningProducts}
                size="lg"
                className="text-white font-bold py-4 px-10 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${formData.themeColor || currentNicheConfig.color}, ${formData.themeColor || currentNicheConfig.color}dd)` 
                }}
              >
                <span className="mr-3 text-2xl">{currentNicheConfig.emoji}</span>
                Generate 10 WINNING {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Products
                <Trophy className="ml-3 h-6 w-6" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WinningProductsStep;

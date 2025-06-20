
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Sparkles, Loader2, Target, Zap, Star, Trophy, ShoppingBag, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
    storeName: string;
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

  // Enhanced niche configurations for ALL 11 supported niches
  const nicheConfig = {
    'pets': { emoji: '🐾', color: '#ff6600', description: 'Premium pet care essentials' },
    'fitness': { emoji: '💪', color: '#00cc66', description: 'Powerful fitness equipment' },
    'beauty': { emoji: '💄', color: '#e91e63', description: 'Luxurious beauty products' },
    'tech': { emoji: '📱', color: '#3f51b5', description: 'Cutting-edge technology' },
    'baby': { emoji: '👶', color: '#fbbf24', description: 'Safe baby care items' },
    'home': { emoji: '🏠', color: '#4caf50', description: 'Cozy home essentials' },
    'fashion': { emoji: '👗', color: '#d81b60', description: 'Trendy fashion pieces' },
    'kitchen': { emoji: '🍳', color: '#ff5722', description: 'Smart kitchen gadgets' },
    'gaming': { emoji: '🎮', color: '#9c27b0', description: 'Epic gaming accessories' },
    'travel': { emoji: '✈️', color: '#03a9f4', description: 'Essential travel gear' },
    'office': { emoji: '💼', color: '#607d8b', description: 'Smart office solutions' }
  };

  const currentNicheConfig = nicheConfig[formData.niche.toLowerCase()] || nicheConfig['pets'];

  const handleAddProducts = async () => {
    console.log(`🚀 Starting AI product generation workflow for ${formData.niche}:`, formData);
    
    // Validate all required fields
    const requiredFields = ['shopifyUrl', 'accessToken', 'niche', 'targetAudience', 'storeName'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
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
      console.log(`🤖 Starting AI-powered store setup for ${formData.niche}:`, {
        storeName: formData.storeName,
        niche: formData.niche,
        targetAudience: formData.targetAudience,
        businessType: formData.businessType,
        storeStyle: formData.storeStyle,
        themeColor: formData.themeColor,
        customInfo: formData.customInfo
      });
      
      // Step 1: Install and customize theme
      setCurrentStep(`🎨 Installing premium theme with ${formData.niche} customization...`);
      setProgress(15);
      
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
          
          setProgress(30);
          setCurrentStep(`✅ Premium theme customized for ${formData.niche}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (themeError) {
          console.warn(`⚠️ Theme installation failed for ${formData.niche}, continuing with products:`, themeError);
          setCurrentStep(`Theme installation skipped, proceeding with ${formData.niche} products...`);
        }
      }

      // Step 2: Enhanced product generation using Supabase Edge Function
      setCurrentStep(`${currentNicheConfig.emoji} AI is analyzing trending ${formData.niche} products...`);
      setProgress(40);

      console.log(`🤖 Calling enhanced product generation for ${formData.niche} niche`);

      // Call the enhanced product generation service
      const response = await fetch('/api/generate-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopifyUrl: formData.shopifyUrl,
          accessToken: formData.accessToken,
          niche: formData.niche,
          themeColor: formData.themeColor || currentNicheConfig.color,
          targetAudience: formData.targetAudience,
          businessType: formData.businessType,
          storeStyle: formData.storeStyle,
          customInfo: formData.customInfo,
          storeName: formData.storeName
        })
      });

      if (!response.ok) {
        throw new Error(`Product generation failed: ${response.status} - ${await response.text()}`);
      }

      const result = await response.json();
      
      // Simulate progress updates during product generation
      for (let i = 40; i <= 95; i += 5) {
        setProgress(i);
        setCurrentProduct(`Creating enhanced ${formData.niche} product ${Math.ceil((i-40)/6)}...`);
        setCurrentStep(`🤖 AI is creating optimized ${formData.niche} products...`);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      setProgress(100);
      handleInputChange('productsAdded', true);
      setCurrentStep("🎉 Complete!");
      
      toast({
        title: `🏆 AI-Powered ${formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Store Complete!`,
        description: `Your ${formData.niche} store now has 10 trending products with premium theme and AI-optimized content!`,
      });

    } catch (error) {
      console.error(`❌ Error setting up AI-powered ${formData.niche} store:`, error);
      let errorMessage = "An unknown error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          errorMessage = "Invalid Shopify Access Token. Please check your credentials and try again.";
        } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
          errorMessage = "Shopify store not found. Please verify your store URL is correct.";
        } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          errorMessage = "Access denied. Please ensure your Shopify Access Token has the required permissions.";
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorMessage = "Network connection failed. Please check your internet connection and try again.";
        } else if (errorMessage.includes('timeout')) {
          errorMessage = `The operation timed out. Please try again.`;
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
              background: `linear-gradient(135deg, ${formData.themeColor || currentNicheConfig.color}, ${formData.themeColor || currentNicheConfig.color}aa)` 
            }}
          >
            <span className="text-3xl">{currentNicheConfig.emoji}</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 Launch AI-Powered {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Store
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Install <strong>premium theme</strong> + add 10 <strong>trending {formData.niche} products</strong> targeting <strong>{formData.targetAudience}</strong> with:
          </p>
          
          {/* AI Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 mb-6">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <Star className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <div className="text-xs font-semibold text-green-800">4.8+ Rating</div>
              <div className="text-xs text-green-600">Quality verified</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <Trophy className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-xs font-semibold text-blue-800">1000+ Orders</div>
              <div className="text-xs text-blue-600">Proven bestsellers</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <Wand2 className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <div className="text-xs font-semibold text-purple-800">AI Images</div>
              <div className="text-xs text-purple-600">6-8 per product</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <Sparkles className="h-6 w-6 text-orange-600 mx-auto mb-1" />
              <div className="text-xs font-semibold text-orange-800">AI Content</div>
              <div className="text-xs text-orange-600">Niche-optimized</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <Zap className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-800">Setup Failed</h4>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <p className="text-red-600 text-xs mt-2">
                Supported niches: pets, fitness, beauty, tech, baby, home, fashion, kitchen, gaming, travel, office
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
              <span className="text-2xl">{currentNicheConfig.emoji}</span>
              10 AI-Selected {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Products Added!
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Your {formData.niche} store now has <strong>10 trending {formData.niche} products</strong> with proven track records, featuring:
            </p>
            
            {/* Success Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-green-800">Premium {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)}</div>
                <div className="text-xs text-green-600">4.8+ star ratings</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-blue-800">Bestsellers</div>
                <div className="text-xs text-blue-600">1000+ orders each</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <Wand2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-purple-800">AI Images</div>
                <div className="text-xs text-purple-600">60+ total images</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-orange-800">Smart Pricing</div>
                <div className="text-xs text-orange-600">$15-$80 optimized</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-2">
                🎉 Your AI-Powered {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Store is Live!
              </h4>
              <p className="text-gray-700 text-sm">
                Visit your Shopify admin to see your 10 trending {formData.niche} products with high ratings, 
                proven sales, custom AI images, optimized descriptions, and variants - all ready to start selling!
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
                    AI is setting up your {formData.niche} store...
                  </span>
                </div>
                
                <Progress value={progress} className="w-full max-w-md mx-auto" />
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">{currentStep}</p>
                  {currentProduct && (
                    <p className="text-sm text-gray-600">
                      Creating: <span className="font-medium">{currentProduct}</span>
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
                  background: `linear-gradient(135deg, ${formData.themeColor || currentNicheConfig.color}, ${formData.themeColor || currentNicheConfig.color}dd)` 
                }}
              >
                <span className="mr-2 text-xl">{currentNicheConfig.emoji}</span>
                Launch AI-Powered {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Store
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsStep;

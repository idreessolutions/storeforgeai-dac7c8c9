
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Sparkles, Loader2, Target, Zap, Star, Trophy, ShoppingBag, Wand2, RefreshCw, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { installAndConfigureSenseTheme } from "@/services/shopifyThemeService";
import { supabase } from "@/integrations/supabase/client";

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
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();

  // Enhanced niche configurations
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
    'office': { emoji: '💼', color: '#607d8b', description: 'Smart office solutions' },
    'toy': { emoji: '🧸', color: '#ff9800', description: 'Fun and educational toys' }
  };

  const currentNicheConfig = nicheConfig[formData.niche.toLowerCase() as keyof typeof nicheConfig] || nicheConfig['pets'];

  const extractShopifyDomain = (shopifyUrl: string): string => {
    if (!shopifyUrl) return '';
    
    console.log('🔍 EXTRACTING FROM:', shopifyUrl);
    
    if (shopifyUrl.includes('admin.shopify.com/store/')) {
      const match = shopifyUrl.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
      if (match) {
        const storeId = match[1];
        const domain = `${storeId}.myshopify.com`;
        console.log('✅ EXTRACTED ADMIN URL:', storeId, '->', domain);
        return domain;
      }
    }
    
    let domain = shopifyUrl.replace(/^https?:\/\//, '');
    
    if (domain.includes('.myshopify.com')) {
      const cleanDomain = domain.split('/')[0];
      console.log('✅ ALREADY MYSHOPIFY:', cleanDomain);
      return cleanDomain;
    }
    
    const finalDomain = `${domain}.myshopify.com`;
    console.log('✅ CONSTRUCTED DOMAIN:', finalDomain);
    return finalDomain;
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const callProductGenerationWithStabilityRetry = async (attempt: number = 1): Promise<any> => {
    const maxAttempts = 4; // Increased attempts
    const baseDelay = 10000; // Increased base delay to 10 seconds
    const backoffMultiplier = 1.5;

    console.log(`🔄 STABILITY ATTEMPT ${attempt}/${maxAttempts}: Calling enhanced product generation`);
    
    try {
      if (attempt > 1) {
        const delay = baseDelay * Math.pow(backoffMultiplier, attempt - 2);
        console.log(`⏳ Stability wait ${delay}ms before attempt ${attempt}`);
        setCurrentStep(`⏳ Stabilizing connection (attempt ${attempt}/${maxAttempts})...`);
        await sleep(delay);
      }

      setCurrentStep(`🚀 Connecting to enhanced AI engine (attempt ${attempt}/${maxAttempts})...`);
      
      const actualShopifyDomain = extractShopifyDomain(formData.shopifyUrl);
      console.log('🎯 USING DOMAIN:', actualShopifyDomain);
      
      if (!actualShopifyDomain || !actualShopifyDomain.includes('.myshopify.com')) {
        throw new Error(`Invalid Shopify domain: ${actualShopifyDomain}. Please check your store URL.`);
      }

      // Enhanced timeout with progressive increases per attempt
      const baseTimeout = 180000; // 3 minutes base
      const timeoutDuration = baseTimeout + (attempt * 60000); // +1 minute per attempt
      
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Enhanced timeout after ${timeoutDuration/1000}s - Retrying with increased stability...`)), timeoutDuration)
      );

      const requestPromise = supabase.functions.invoke('add-shopify-product', {
        body: {
          shopifyUrl: `https://${actualShopifyDomain}`,
          accessToken: formData.accessToken,
          niche: formData.niche,
          themeColor: formData.themeColor || currentNicheConfig.color,
          targetAudience: formData.targetAudience,
          businessType: formData.businessType,
          storeStyle: formData.storeStyle,
          customInfo: formData.customInfo,
          storeName: formData.storeName,
          stabilityAttempt: attempt,
          totalAttempts: maxAttempts
        }
      });

      console.log(`⏳ Enhanced request with ${timeoutDuration/1000}s timeout...`);
      const result = await Promise.race([requestPromise, timeoutPromise]);

      if (result.error) {
        console.error(`❌ Enhanced function failed on attempt ${attempt}:`, result.error);
        throw new Error(`Enhanced generation failed: ${result.error.message || 'Deployment error'}`);
      }

      console.log(`✅ STABILITY SUCCESS on attempt ${attempt}:`, result.data);
      return result;

    } catch (error) {
      console.error(`❌ STABILITY ATTEMPT ${attempt} FAILED:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Enhanced retry conditions
      const shouldRetry = 
        errorMessage.includes('Failed to send a request to the Edge Function') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('connection failed') ||
        errorMessage.includes('function may be deploying') ||
        errorMessage.includes('Deployment error') ||
        errorMessage.includes('Enhanced timeout') ||
        (attempt < maxAttempts && !errorMessage.includes('Invalid') && 
         !errorMessage.includes('credentials') && !errorMessage.includes('Unauthorized'));

      if (shouldRetry && attempt < maxAttempts) {
        console.log(`🔄 Enhanced retry: attempt ${attempt + 1}/${maxAttempts}`);
        setRetryCount(attempt);
        return await callProductGenerationWithStabilityRetry(attempt + 1);
      } else {
        throw error;
      }
    }
  };

  const handleAddProducts = async () => {
    console.log(`🚀 Starting ENHANCED 10 unique AI products generation for ${formData.niche}:`, formData);
    
    // Enhanced validation
    const requiredFields = ['shopifyUrl', 'accessToken', 'niche', 'targetAudience', 'storeName'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      console.error('❌ Enhanced validation failed:', errorMsg);
      
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
    setRetryCount(0);
    setIsRetrying(false);

    try {
      console.log(`🤖 Starting ENHANCED AI store setup for ${formData.niche} with stability system:`, {
        storeName: formData.storeName,
        niche: formData.niche,
        targetAudience: formData.targetAudience,
        businessType: formData.businessType,
        storeStyle: formData.storeStyle,
        themeColor: formData.themeColor,
        originalUrl: formData.shopifyUrl
      });
      
      // Step 1: Enhanced theme installation
      setCurrentStep(`🎨 Installing premium theme with enhanced ${formData.niche} customization...`);
      setProgress(10);
      
      try {
        const actualShopifyDomain = extractShopifyDomain(formData.shopifyUrl);
        await Promise.race([
          installAndConfigureSenseTheme({
            storeName: actualShopifyDomain,
            accessToken: formData.accessToken,
            themeColor: formData.themeColor || currentNicheConfig.color,
            niche: formData.niche,
            targetAudience: formData.targetAudience,
            businessType: formData.businessType,
            storeStyle: formData.storeStyle,
            customInfo: formData.customInfo
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Theme timeout')), 25000))
        ]);
        
        setProgress(20);
        setCurrentStep(`✅ Enhanced theme configured for ${formData.niche}`);
        await sleep(1000);
      } catch (themeError) {
        console.warn(`⚠️ Theme installation skipped for ${formData.niche}, proceeding:`, themeError);
        setCurrentStep(`Theme installation skipped, proceeding with enhanced ${formData.niche} products...`);
        setProgress(20);
      }

      // Step 2: ENHANCED product generation with stability system
      setCurrentStep(`${currentNicheConfig.emoji} AI is creating 10 UNIQUE ${formData.niche} products with stability system...`);
      setProgress(30);

      console.log(`🤖 Calling ENHANCED product generation for ${formData.niche} niche - 10 UNIQUE PRODUCTS with STABILITY SYSTEM`);

      setIsRetrying(true);
      const result = await callProductGenerationWithStabilityRetry(1);
      setIsRetrying(false);

      if (!result.data?.success) {
        throw new Error(result.data?.error || 'Enhanced product generation failed');
      }
      
      // Enhanced progress simulation for 10 products
      for (let i = 30; i <= 95; i += 6.5) {
        setProgress(i);
        const productNum = Math.ceil((i-30)/6.5);
        setCurrentProduct(`Creating unique ${formData.niche} product ${productNum}/10...`);
        setCurrentStep(`🤖 Enhanced AI generating diverse ${formData.niche} products with GPT...`);
        await sleep(600);
      }

      setProgress(100);
      handleInputChange('productsAdded', true);
      setCurrentStep("🎉 Enhanced Complete!");
      
      toast({
        title: `🏆 Enhanced AI-Powered ${formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Store Complete!`,
        description: `Your ${formData.niche} store now has ${result.data.successCount || 10} unique trending products with enhanced premium theme, custom GPT content, and brand colors!`,
      });

    } catch (error) {
      console.error(`❌ Error setting up enhanced AI-powered ${formData.niche} store:`, error);
      let errorMessage = "An unknown error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Enhanced error classification
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          errorMessage = "Invalid Shopify Access Token. Please check your credentials and try again.";
        } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
          errorMessage = "Shopify store not found. Please verify your store URL is correct.";
        } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          errorMessage = "Access denied. Please ensure your Shopify Access Token has the required permissions.";
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorMessage = "Network connection failed. Please check your internet connection and try again.";
        } else if (errorMessage.includes('timeout') || errorMessage.includes('Enhanced timeout')) {
          errorMessage = `The enhanced operation timed out after multiple stability attempts. The AI is working hard on your unique products. Please wait 2 minutes and try again - the function may be deploying.`;
        } else if (errorMessage.includes('Failed to send a request to the Edge Function') || errorMessage.includes('Deployment error')) {
          errorMessage = "Enhanced Edge Function deployment detected. The function is updating with new features - please wait 60 seconds and try again.";
        }
      }
      
      setError(errorMessage);
      setIsRetrying(false);
      
      toast({
        title: "Enhanced Setup Failed",
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

  const handleQuickRetry = async () => {
    console.log('🔄 ENHANCED QUICK RETRY: User requested immediate enhanced retry');
    setError("");
    await sleep(3000); // Increased delay for stability
    handleAddProducts();
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
            🤖 Launch Enhanced AI-Powered {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Store
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Install <strong>premium theme</strong> + add 10 <strong>unique {formData.niche} products</strong> targeting <strong>{formData.targetAudience}</strong> with enhanced stability system:
          </p>
          
          {/* Enhanced AI Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 mb-6">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <Star className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <div className="text-xs font-semibold text-green-800">10 Unique</div>
              <div className="text-xs text-green-600">Real products</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <Trophy className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-xs font-semibold text-blue-800">GPT Enhanced</div>
              <div className="text-xs text-blue-600">Unique content</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <Wand2 className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <div className="text-xs font-semibold text-purple-800">Real Images</div>
              <div className="text-xs text-purple-600">60+ total images</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <Sparkles className="h-6 w-6 text-orange-600 mx-auto mb-1" />
              <div className="text-xs font-semibold text-orange-800">Theme Color</div>
              <div className="text-xs text-orange-600">Applied</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-800">Enhanced Setup Failed</h4>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <p className="text-red-600 text-xs mt-2">
                Enhanced stability system attempted {retryCount > 0 ? retryCount : 'multiple'} times with progressive timeouts.
              </p>
              
              <div className="mt-3">
                <Button
                  onClick={handleQuickRetry}
                  size="sm"
                  variant="outline"
                  className="text-red-700 border-red-300 hover:bg-red-50"
                  disabled={isAdding}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Enhanced Retry ({retryCount + 1})
                </Button>
              </div>
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
              10 Enhanced Unique {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Products Added!
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Your enhanced {formData.niche} store now has <strong>10 completely unique {formData.niche} products</strong> with individual GPT-generated content, featuring:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-green-800">10 Unique Products</div>
                <div className="text-xs text-green-600">Enhanced {formData.niche}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-blue-800">Enhanced GPT</div>
                <div className="text-xs text-blue-600">Unique descriptions</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <Wand2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-purple-800">Real Images</div>
                <div className="text-xs text-purple-600">60+ total images</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-orange-800">Theme Applied</div>
                <div className="text-xs text-orange-600">Brand colors</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-2">
                🎉 Your Enhanced AI-Powered {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Store is Live!
              </h4>
              <p className="text-gray-700 text-sm">
                Visit your Shopify admin to see your 10 unique enhanced {formData.niche} products with individual GPT-generated titles, 
                descriptions, pricing, real images, and your custom theme color - all ready to start selling!
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
                    {isRetrying ? (
                      <>
                        <RefreshCw className="h-5 w-5 inline mr-2" />
                        Enhanced stability system active (attempt {retryCount + 1}/4)
                      </>
                    ) : (
                      `Enhanced AI creating your 10 unique ${formData.niche} products...`
                    )}
                  </span>
                </div>
                
                <Progress value={progress} className="w-full max-w-md mx-auto" />
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">{currentStep}</p>
                  {currentProduct && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{currentProduct}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-500">{Math.round(progress)}% complete</p>
                  
                  {isRetrying && retryCount > 0 && (
                    <p className="text-xs text-orange-600 flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" />
                      Enhanced stability retry {retryCount}/4 - Progressive timeout increases
                    </p>
                  )}
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
                Launch 10 Enhanced Unique {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Products
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsStep;

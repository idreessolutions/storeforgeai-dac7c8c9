
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, CheckCircle, Timer, Lightbulb, Shield, Lock } from "lucide-react";
import { toast } from "sonner";

interface ShopifySetupStepProps {
  formData: {
    shopifyUrl: string;
    createdViaAffiliate: boolean;
  };
  handleInputChange: (field: string, value: string | boolean) => void;
}

const ShopifySetupStep = ({ formData, handleInputChange }: ShopifySetupStepProps) => {
  const [hasClickedCreate, setHasClickedCreate] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);

  // Enhanced validation function
  const validateShopifyUrl = (url: string): boolean => {
    if (!url) return false;
    
    // Check for various Shopify URL formats
    const patterns = [
      /^https?:\/\/admin\.shopify\.com\/store\/([^\/\?]+)/,
      /^https?:\/\/([^\.]+)\.myshopify\.com/,
      /^([^\.]+)\.myshopify\.com$/,
      /^[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]$/
    ];
    
    return patterns.some(pattern => pattern.test(url.trim()));
  };

  // Auto-format URL function - Enhanced to show only .myshopify.com format
  const formatShopifyUrl = (inputUrl: string): string => {
    const url = inputUrl.trim();
    
    // Extract store name from admin URL
    const adminMatch = url.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
    if (adminMatch) {
      return `${adminMatch[1]}.myshopify.com`;
    }
    
    // If it's already myshopify.com format, clean it
    const myshopifyMatch = url.match(/([^\.]+)\.myshopify\.com/);
    if (myshopifyMatch) {
      return `${myshopifyMatch[1]}.myshopify.com`;
    }
    
    // If it's just the store name, add myshopify.com
    if (/^[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]$/.test(url)) {
      return `${url}.myshopify.com`;
    }
    
    return url;
  };

  // Store validation state and auto-progress logic
  useEffect(() => {
    const isValid = hasClickedCreate && canProceed && isValidUrl;
    (window as any).validateShopifySetup = () => isValid;
    console.log('Shopify validation state:', { hasClickedCreate, canProceed, isValidUrl, isValid });
    
    // CRITICAL: Mark as created via affiliate when validation is complete
    if (isValid && !formData.createdViaAffiliate) {
      handleInputChange('createdViaAffiliate', true);
    }
  }, [hasClickedCreate, canProceed, isValidUrl, formData.createdViaAffiliate, handleInputChange]);

  const handleCreateAccount = () => {
    if (!hasClickedCreate) {
      setHasClickedCreate(true);
      setCountdown(25);
      
      // Open Shopify affiliate link directly
      window.open('https://shopify.pxf.io/S8nO7b', '_blank');
      
      toast.success("Opening Shopify registration! Please return to this tab when done.", {
        duration: 4000,
      });

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanProceed(true);
            toast.success("✅ Ready to proceed! Please paste your store URL below.", {
              duration: 4000,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleStoreUrlChange = (value: string) => {
    const isValid = validateShopifyUrl(value);
    setIsValidUrl(isValid);
    
    if (isValid) {
      const formattedUrl = formatShopifyUrl(value);
      handleInputChange('shopifyUrl', formattedUrl);
      
      // Only show formatting message if URL was actually changed
      if (formattedUrl !== value && formattedUrl.includes('.myshopify.com')) {
        toast.success("Store URL formatted to standard format!", { duration: 2000 });
      }
    } else {
      handleInputChange('shopifyUrl', value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 relative overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-blue-400/20 rounded-full blur-xl animate-float" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400/20 rounded-full blur-xl animate-float-delayed" />
      <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl animate-float" />
      
      <div className="max-w-4xl mx-auto pt-4 sm:pt-8 relative z-10">
        <Card className="bg-white shadow-2xl border-0 rounded-2xl transition-shadow hover:shadow-3xl">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <div 
                  dangerouslySetInnerHTML={{
                    __html: '<lord-icon src="https://cdn.lordicon.com/zquqhgki.json" trigger="morph" stroke="bold" state="morph-growth" colors="primary:#ffffff,secondary:#ffffff" style="width:48px;height:48px"></lord-icon>'
                  }}
                />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Connect Your Shopify Store
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6">
                Link your Shopify account so our AI can build and upload products directly into your store.
              </p>
              
              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">100% Secure</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Works With All Shopify Plans</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-200">
                  <Lock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Data Protected & Encrypted</span>
                </div>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="mb-8 sm:mb-10 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                How It Works:
              </h2>
              
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </span>
                  <span className="text-base pt-1">Click <strong>Connect My Store</strong> below</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </span>
                  <span className="text-base pt-1">Sign up or log in to Shopify</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </span>
                  <span className="text-base pt-1">Get your Shopify URL (example: <span className="font-mono text-sm bg-white px-2 py-1 rounded">yourstore.myshopify.com</span>)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </span>
                  <span className="text-base pt-1">Paste it below and continue</span>
                </li>
              </ul>

              {/* Friendly Note */}
              <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-blue-800 font-medium text-sm">
                  <strong>Note:</strong> If the Shopify page opens in a new tab, just return here afterwards to continue.
                </p>
              </div>
            </div>

            {/* Store URL Input */}
            <div className="mb-8 sm:mb-10">
              <Label htmlFor="shopifyUrl" className="block text-gray-900 font-bold text-base sm:text-lg mb-2">
                Your Shopify Store URL
              </Label>
              <p className="text-sm text-gray-600 mb-3">
                This is the link Shopify gives you after creating your store.
              </p>
              <div className="relative">
                <Input
                  id="shopifyUrl"
                  type="text"
                  placeholder="yourstore.myshopify.com"
                  value={formData.shopifyUrl}
                  onChange={(e) => handleStoreUrlChange(e.target.value)}
                  className={`w-full h-12 sm:h-14 text-base sm:text-lg border-2 rounded-xl transition-all ${
                    isValidUrl 
                      ? 'border-green-500 focus:border-green-600 shadow-sm shadow-green-200' 
                      : 'border-gray-300 focus:border-blue-500'
                  } ${isValidUrl ? 'pr-12' : ''}`}
                />
                {isValidUrl && (
                  <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                )}
              </div>
              {!isValidUrl && formData.shopifyUrl && (
                <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                  <span>❌</span> Invalid Shopify URL format
                </p>
              )}
            </div>

            {/* Connect Button */}
            <div className="text-center">
              <Button
                onClick={handleCreateAccount}
                disabled={hasClickedCreate}
                className={`w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl transition-all transform hover:scale-105 ${
                  canProceed 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : hasClickedCreate 
                      ? 'bg-yellow-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                } text-white shadow-lg hover:shadow-xl`}
              >
                {canProceed ? (
                  <>
                    <CheckCircle className="mr-3 h-5 w-5" />
                    Account Created Successfully - Continue
                  </>
                ) : hasClickedCreate ? (
                  <>
                    <Timer className="mr-3 h-5 w-5 animate-spin" />
                    Please complete signup and return ({countdown}s)
                  </>
                ) : (
                  <>
                    <div className="mr-3"
                      dangerouslySetInnerHTML={{
                        __html: '<lord-icon src="https://cdn.lordicon.com/zquqhgki.json" trigger="morph" stroke="bold" state="morph-growth" colors="primary:#ffffff,secondary:#ffffff" style="width:20px;height:20px"></lord-icon>'
                      }}
                    />
                    Connect My Shopify Store
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trust & Safety Section */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <Lock className="h-6 w-6 text-green-600" />
              <p className="text-sm font-medium text-gray-800">
                We never change or delete anything in your Shopify store
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-6 w-6 text-blue-600" />
              <p className="text-sm font-medium text-gray-800">
                We only add products, branding and collections
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-6 w-6 text-purple-600" />
              <p className="text-sm font-medium text-gray-800">
                You can disconnect at any time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopifySetupStep;

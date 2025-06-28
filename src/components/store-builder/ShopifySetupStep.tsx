
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, ExternalLink, CheckCircle, Timer } from "lucide-react";
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

  // Auto-format URL function
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
      
      if (formattedUrl !== value) {
        toast.success("Store URL automatically formatted!", { duration: 2000 });
      }
    } else {
      handleInputChange('shopifyUrl', value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto pt-4 sm:pt-8">
        <Card className="bg-white shadow-2xl border-0">
          <CardContent className="p-4 sm:p-8 lg:p-12">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Store className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Create Your Dream Store</h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">Get started with your professional Shopify store</p>
            </div>

            {/* Instructions */}
            <div className="mb-6 sm:mb-8">
              <div className="bg-gray-100 rounded-xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
                <p className="text-gray-800 font-medium mb-3 sm:mb-4 text-sm sm:text-base">
                  First you need to create a Shopify account before we start building your completely free store!
                </p>
                
                <ul className="text-gray-700 space-y-2 sm:space-y-3 mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base">
                  <li className="flex items-start">
                    <span className="mr-2 sm:mr-3 text-blue-600 font-bold">•</span>
                    <span>Click the <strong>Create Account</strong> button below</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 sm:mr-3 text-blue-600 font-bold">•</span>
                    <span>Complete the registration information to signup</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 sm:mr-3 text-blue-600 font-bold">•</span>
                    <span>Return to this tab and paste your store URL below</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 sm:mr-3 text-blue-600 font-bold">•</span>
                    <span>Click the next button</span>
                  </li>
                </ul>

                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 sm:p-3">
                  <p className="text-yellow-800 font-medium text-xs sm:text-sm lg:text-base">
                    🟨 Remember to return to this tab to continue creating your store.
                  </p>
                </div>
              </div>
            </div>

            {/* Store URL Input */}
            <div className="mb-6 sm:mb-8">
              <Label htmlFor="shopifyUrl" className="block text-gray-700 font-semibold text-sm sm:text-base lg:text-lg mb-2 sm:mb-3">
                Store URL
              </Label>
              <Input
                id="shopifyUrl"
                type="text"
                placeholder="mystore.myshopify.com or admin.shopify.com/store/mystore"
                value={formData.shopifyUrl}
                onChange={(e) => handleStoreUrlChange(e.target.value)}
                className={`w-full h-10 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg border-2 rounded-xl transition-colors ${
                  isValidUrl 
                    ? 'border-green-500 focus:border-green-600' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Create Account Button */}
            <div className="text-center">
              <Button
                onClick={handleCreateAccount}
                disabled={hasClickedCreate}
                className={`w-full h-10 sm:h-12 lg:h-16 text-base sm:text-lg lg:text-xl font-bold rounded-xl transition-all transform hover:scale-105 ${
                  canProceed 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : hasClickedCreate 
                      ? 'bg-yellow-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                } text-white shadow-lg`}
              >
                {canProceed ? (
                  <>
                    <CheckCircle className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                    Account Created Successfully - Continue
                  </>
                ) : hasClickedCreate ? (
                  <>
                    <Timer className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                    Please complete signup and return ({countdown}s)
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                    Create Account
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShopifySetupStep;

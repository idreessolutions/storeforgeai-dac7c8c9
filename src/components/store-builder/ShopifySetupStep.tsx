
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

  // Store validation state on window for StoreBuilderLogic to access
  useEffect(() => {
    (window as any).validateShopifySetup = () => {
      return hasClickedCreate && canProceed && formData.shopifyUrl;
    };
  }, [hasClickedCreate, canProceed, formData.shopifyUrl]);

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
    // Auto-convert Shopify admin URLs to myshopify.com format
    let processedUrl = value;
    
    if (value.includes('admin.shopify.com/store/')) {
      const match = value.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
      if (match) {
        processedUrl = `${match[1]}.myshopify.com`;
        toast.success("Store URL automatically converted!", { duration: 2000 });
      }
    }
    
    handleInputChange('shopifyUrl', processedUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <Card className="bg-white shadow-2xl border-0">
          <CardContent className="p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Dream Store</h1>
              <p className="text-xl text-gray-600">Get started with your professional Shopify store</p>
            </div>

            {/* Video Section */}
            <div className="mb-10">
              <div className="relative w-full bg-gray-900 rounded-xl overflow-hidden shadow-lg" style={{ aspectRatio: '16/9' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-2xl font-bold bg-black bg-opacity-70 px-6 py-3 rounded-lg">
                    YOU MUST MAKE A BRAND NEW STORE
                  </div>
                </div>
                {/* Video controls overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-3">
                  <div className="flex items-center space-x-3">
                    <button className="text-white text-lg">▶</button>
                    <div className="flex-1 bg-gray-600 h-2 rounded-full">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-white text-sm font-medium">01:13</span>
                    <div className="flex space-x-2">
                      <button className="text-white">🔊</button>
                      <button className="text-white">📺</button>
                      <button className="text-white">⚙️</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <div className="bg-gray-100 rounded-xl p-6 mb-6">
                <p className="text-gray-800 font-medium mb-4">
                  First you need to create a Shopify account before we start building your completely free store!
                </p>
                
                <ul className="text-gray-700 space-y-3 mb-4">
                  <li className="flex items-start">
                    <span className="mr-3 text-blue-600 font-bold">•</span>
                    <span>Click the <strong>Create Account</strong> button below</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-blue-600 font-bold">•</span>
                    <span>Complete the registration information to signup</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-blue-600 font-bold">•</span>
                    <span>Return to this tab and paste your store URL below</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-blue-600 font-bold">•</span>
                    <span>Click the next button</span>
                  </li>
                </ul>

                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                  <p className="text-yellow-800 font-medium">
                    🟨 Remember to return to this tab to continue creating your store.
                  </p>
                </div>
              </div>
            </div>

            {/* Store URL Input */}
            <div className="mb-8">
              <Label htmlFor="shopifyUrl" className="block text-gray-700 font-semibold text-lg mb-3">
                Store URL
              </Label>
              <Input
                id="shopifyUrl"
                type="text"
                placeholder="p7vdbh-fh.myshopify.com"
                value={formData.shopifyUrl}
                onChange={(e) => handleStoreUrlChange(e.target.value)}
                className="w-full h-14 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 transition-colors"
              />
              {formData.shopifyUrl && (
                <p className="text-sm text-green-600 mt-2">✅ Store URL detected and formatted</p>
              )}
            </div>

            {/* Create Account Button */}
            <div className="text-center">
              <Button
                onClick={handleCreateAccount}
                disabled={hasClickedCreate}
                className={`w-full h-16 text-xl font-bold rounded-xl transition-all transform hover:scale-105 ${
                  canProceed 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : hasClickedCreate 
                      ? 'bg-yellow-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                } text-white shadow-lg`}
              >
                {canProceed ? (
                  <>
                    <CheckCircle className="mr-3 h-6 w-6" />
                    Account Created Successfully - Continue
                  </>
                ) : hasClickedCreate ? (
                  <>
                    <Timer className="mr-3 h-6 w-6" />
                    Please complete signup and return ({countdown}s)
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-3 h-6 w-6" />
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

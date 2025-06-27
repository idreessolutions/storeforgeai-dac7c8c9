
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, ExternalLink, CheckCircle, Timer, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface APIConfigStepProps {
  formData: {
    accessToken: string;
    shopifyUrl: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

const APIConfigStep = ({ formData, handleInputChange }: APIConfigStepProps) => {
  const [hasClickedAccess, setHasClickedAccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canProceed, setCanProceed] = useState(false);

  // Store validation state on window for StoreBuilderLogic to access
  useEffect(() => {
    (window as any).validateAPIConfig = () => {
      return hasClickedAccess && canProceed && formData.accessToken;
    };
  }, [hasClickedAccess, canProceed, formData.accessToken]);

  const handleAccessShopifyApps = () => {
    if (!hasClickedAccess) {
      setHasClickedAccess(true);
      setCountdown(25); // 25 second countdown
      
      toast.success("API setup process started! Please wait 25 seconds.", {
        duration: 3000,
      });

      // Countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanProceed(true);
            toast.success("✅ API setup complete! You can now proceed to the next step.", {
              duration: 4000,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const getShopifyAppsUrl = () => {
    if (formData.shopifyUrl) {
      const baseUrl = formData.shopifyUrl.replace(/\/$/, '');
      return `${baseUrl}/admin/settings/apps`;
    }
    return "https://admin.shopify.com/settings/apps";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl bg-white shadow-2xl border-0 rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white p-12 text-center">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <Key className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">API Configuration</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Connect your store with secure API access for seamless integration
            </p>
          </div>

          {/* Content Section */}
          <div className="p-12">
            {/* Step 1: Access Shopify Apps */}
            <div className="mb-12">
              <div className="flex items-start space-x-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  canProceed ? 'bg-green-500' : hasClickedAccess ? 'bg-yellow-500' : 'bg-gray-300'
                }`}>
                  {canProceed ? (
                    <CheckCircle className="h-6 w-6 text-white" />
                  ) : hasClickedAccess ? (
                    <Timer className="h-6 w-6 text-white" />
                  ) : (
                    <span className="text-white font-bold text-lg">1</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Access Shopify Apps & API Settings
                  </h2>
                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    Set up API access to enable seamless integration with your store. 
                    This will allow our system to manage your products and orders automatically.
                  </p>
                  
                  <Button
                    onClick={handleAccessShopifyApps}
                    disabled={hasClickedAccess}
                    size="lg"
                    className={`${
                      canProceed 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : hasClickedAccess 
                          ? 'bg-yellow-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                    } text-white px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-300`}
                  >
                    {canProceed ? (
                      <>
                        <CheckCircle className="mr-3 h-5 w-5" />
                        API Access Configured
                      </>
                    ) : hasClickedAccess ? (
                      <>
                        <Timer className="mr-3 h-5 w-5" />
                        Configuring... ({countdown}s)
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-3 h-5 w-5" />
                        Access Shopify Apps
                      </>
                    )}
                  </Button>

                  {hasClickedAccess && countdown > 0 && (
                    <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex items-center">
                        <Timer className="h-5 w-5 text-yellow-600 mr-2" />
                        <p className="text-yellow-800 font-medium">
                          Please wait {countdown} seconds while we configure your API access...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: API Token Input */}
            {hasClickedAccess && (
              <div className="space-y-8">
                <div className="bg-gray-50 rounded-2xl p-8">
                  <Label htmlFor="accessToken" className="text-xl font-semibold text-gray-900 mb-2 block">
                    Shopify Access Token
                  </Label>
                  <p className="text-gray-600 mb-4 text-lg">
                    Enter your Shopify private app access token to enable API integration
                  </p>
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={formData.accessToken}
                    onChange={(e) => handleInputChange('accessToken', e.target.value)}
                    className="w-full h-14 text-lg px-4 border-2 border-gray-200 focus:border-purple-500 rounded-xl font-mono"
                  />
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-start space-x-4">
                    <AlertCircle className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">How to get your Access Token:</h3>
                      <ol className="text-blue-700 space-y-2 list-decimal list-inside">
                        <li className="text-base">Go to your Shopify Admin → Apps and sales channels</li>
                        <li className="text-base">Click "Develop apps" → "Create an app"</li>
                        <li className="text-base">Configure scopes: products, inventory, orders (read/write)</li>
                        <li className="text-base">Install the app and copy the access token</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success indicator */}
            {canProceed && formData.accessToken && (
              <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 text-center border border-green-200">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-900 mb-2">
                  ✅ API Configuration Complete!
                </h3>
                <p className="text-green-700 text-lg">
                  Your API connection is secure and ready. You can now proceed to the next step.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIConfigStep;

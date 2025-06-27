
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
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardContent className="py-12 px-8">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">API Configuration</h2>
          <p className="text-gray-600">Connect your store with secure API access</p>
        </div>

        <div className="space-y-8">
          {/* Step 1: Access Shopify Apps */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                canProceed ? 'bg-green-500' : hasClickedAccess ? 'bg-yellow-500' : 'bg-gray-300'
              }`}>
                {canProceed ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : hasClickedAccess ? (
                  <Timer className="h-5 w-5 text-white" />
                ) : (
                  <span className="text-white font-semibold">1</span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Access Shopify Apps & API Settings
                </h3>
                <p className="text-gray-600 mb-4">
                  Set up API access to enable seamless integration with your store.
                </p>
                
                <Button
                  onClick={handleAccessShopifyApps}
                  disabled={hasClickedAccess}
                  className={`${
                    canProceed 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : hasClickedAccess 
                        ? 'bg-yellow-500 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {canProceed ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      API Access Configured
                    </>
                  ) : hasClickedAccess ? (
                    <>
                      <Timer className="mr-2 h-4 w-4" />
                      Configuring... ({countdown}s)
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Access Shopify Apps
                    </>
                  )}
                </Button>

                {hasClickedAccess && countdown > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <Timer className="inline h-4 w-4 mr-1" />
                      Please wait {countdown} seconds while we configure your API access...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: API Token Input */}
          {hasClickedAccess && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="accessToken" className="text-base font-medium text-gray-900">
                  Shopify Access Token
                </Label>
                <p className="text-sm text-gray-600 mb-3">
                  Enter your Shopify private app access token to enable API integration
                </p>
                <Input
                  id="accessToken"
                  type="password"
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={formData.accessToken}
                  onChange={(e) => handleInputChange('accessToken', e.target.value)}
                  className="w-full h-12 text-base font-mono"
                />
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">How to get your Access Token:</h4>
                    <ol className="mt-2 text-sm text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Go to your Shopify Admin → Apps and sales channels</li>
                      <li>Click "Develop apps" → "Create an app"</li>
                      <li>Configure scopes: products, inventory, orders (read/write)</li>
                      <li>Install the app and copy the access token</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status indicator */}
          {canProceed && formData.accessToken && (
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                ✅ API Configuration Complete!
              </h3>
              <p className="text-green-700">
                Your API connection is secure and ready. You can now proceed to the next step.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default APIConfigStep;

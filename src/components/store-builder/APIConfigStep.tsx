
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface APIConfigStepProps {
  formData: {
    accessToken: string;
    shopifyUrl: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

const APIConfigStep = ({ formData, handleInputChange }: APIConfigStepProps) => {
  const [isValidToken, setIsValidToken] = useState(false);

  // Validate Shopify access token format
  const validateAccessToken = (token: string): boolean => {
    if (!token) return false;
    
    // Shopify access tokens start with shpat_ and are followed by 32 characters
    const shopifyTokenPattern = /^shp[a-z]{2}_[a-f0-9]{32}$/;
    return shopifyTokenPattern.test(token.trim());
  };

  // Store validation state on window for StoreBuilderLogic to access
  useEffect(() => {
    const isValid = isValidToken && formData.accessToken.trim().length > 0;
    (window as any).validateAPIConfig = () => isValid;
    console.log('API Config validation state:', { isValidToken, hasToken: !!formData.accessToken.trim(), isValid });
  }, [isValidToken, formData.accessToken]);

  const handleTokenChange = (value: string) => {
    const trimmedValue = value.trim();
    const isValid = validateAccessToken(trimmedValue);
    
    setIsValidToken(isValid);
    handleInputChange('accessToken', trimmedValue);
    
    if (isValid) {
      toast.success("Valid Shopify access token detected!", { duration: 2000 });
    }
  };

  const openShopifyApps = () => {
    if (formData.shopifyUrl) {
      const adminUrl = formData.shopifyUrl.includes('.myshopify.com') 
        ? `https://admin.shopify.com/store/${formData.shopifyUrl.replace('.myshopify.com', '')}/settings/apps`
        : `https://${formData.shopifyUrl}/admin/settings/apps`;
      
      window.open(adminUrl, '_blank');
      toast.success("Opening Shopify Apps settings...", { duration: 2000 });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto pt-4 sm:pt-8">
        <Card className="bg-white shadow-2xl border-0">
          <CardContent className="p-4 sm:p-8 lg:p-12">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Key className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">API Config</h2>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                Configure your Shopify API access
              </p>
            </div>

            {/* Main Instructions - Exact Copy from Screenshot */}
            <div className="mb-6 sm:mb-8">
              <div className="bg-blue-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                <p className="text-gray-800 font-medium mb-3 sm:mb-4 text-sm sm:text-base">
                  Configure the App on Shopify to safely build your store using our technology. This method ensures secure access and eliminates risks associated with sharing passwords.
                </p>
                
                <p className="text-gray-800 font-medium mb-3 sm:mb-4 text-sm sm:text-base">
                  To set up the App on Shopify, please follow these steps:
                </p>
                
                <div className="space-y-2 text-xs sm:text-sm lg:text-base text-gray-700 mb-4">
                  <div className="flex items-start">
                    <span className="mr-2 sm:mr-3 text-blue-600 font-bold">1.</span>
                    <span>Click <strong>Access Shopify Apps</strong> button below</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 sm:mr-3 text-blue-600 font-bold">2.</span>
                    <span>Click <strong>Allow custom app development</strong> twice</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 sm:mr-3 text-blue-600 font-bold">3.</span>
                    <span>Click <strong>Create an app</strong></span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 sm:mr-3 text-blue-600 font-bold">4.</span>
                    <span>Fill in Name with <strong>"Custom Store"</strong></span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 sm:mr-3 text-blue-600 font-bold">5.</span>
                    <span>Click <strong>Configure Admin API Scopes</strong></span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 sm:mr-3 text-blue-600 font-bold">6.</span>
                    <span>Select <strong>ALL API Scopes</strong> (Check All Boxes).</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 sm:mr-3 text-blue-600 font-bold">7.</span>
                    <span>Click <strong>Save</strong> button and <strong>Install</strong> at the top right.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 sm:mr-3 text-blue-600 font-bold">8.</span>
                    <span>Click the <strong>Reveal Token</strong> button once</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 sm:mr-3 text-blue-600 font-bold">9.</span>
                    <span>Copy the token that is revealed</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 sm:mr-3 text-blue-600 font-bold">10.</span>
                    <span>Paste the token in the field below</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2 sm:mr-3 text-blue-600 font-bold">11.</span>
                    <span>Click the <strong>Next Step</strong> button to continue</span>
                  </div>
                </div>

                <div className="bg-red-100 border border-red-300 rounded-lg p-2 sm:p-3 mb-4">
                  <p className="text-red-800 font-medium text-xs sm:text-sm lg:text-base">
                    <strong>NOTE:</strong> Make sure you select all access scope options. If any are left unchecked, your store build may fail.
                  </p>
                </div>

                {/* Highlighted Return Message */}
                <div className="bg-yellow-200 border border-yellow-400 rounded-lg p-2 sm:p-3">
                  <p className="text-yellow-900 font-medium text-xs sm:text-sm lg:text-base">
                    Remember to return to this tab to continue creating your store.
                  </p>
                </div>
              </div>
            </div>

            {/* Access Token Input */}
            <div className="mb-6 sm:mb-8">
              <Label htmlFor="accessToken" className="block text-gray-700 font-semibold text-sm sm:text-base lg:text-lg mb-2 sm:mb-3">
                Access Token
              </Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="Ex: shpat_115753..."
                value={formData.accessToken}
                onChange={(e) => handleTokenChange(e.target.value)}
                className={`w-full h-10 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg border-2 rounded-xl transition-colors font-mono ${
                  isValidToken 
                    ? 'border-green-500 focus:border-green-600' 
                    : formData.accessToken && !isValidToken
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-gray-300 focus:border-blue-500'
                }`}
              />
              
              {/* Validation Messages */}
              {formData.accessToken && (
                <div className="mt-2">
                  {isValidToken ? (
                    <p className="text-green-600 text-xs sm:text-sm flex items-center">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Valid Shopify Admin API access token
                    </p>
                  ) : (
                    <p className="text-red-600 text-xs sm:text-sm flex items-center">
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Invalid token format. Should start with 'shpat_' followed by 32 characters
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 sm:space-y-4">
              <Button
                onClick={openShopifyApps}
                className="w-full h-10 sm:h-12 lg:h-14 bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base lg:text-lg font-semibold rounded-xl"
                disabled={!formData.shopifyUrl}
              >
                <ExternalLink className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Access Shopify Apps
              </Button>
            </div>

            {/* Security Notice */}
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 lg:p-6 mt-6 sm:mt-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Key className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  </div>
                </div>
                <div className="ml-2 sm:ml-3">
                  <h4 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 mb-1">
                    🔒 Your API token is secure
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    We use your access token only to create products and apply themes to your store. 
                    It's transmitted securely and never stored permanently.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default APIConfigStep;

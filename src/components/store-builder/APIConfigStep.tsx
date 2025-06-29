
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, AlertCircle, ExternalLink } from "lucide-react";
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
    
    // Remove the success toast - we don't want any success messages
    console.log('Token validation:', { isValid, token: trimmedValue });
  };

  const openShopifyApps = () => {
    if (formData.shopifyUrl) {
      // Extract store name from URL and create the development apps URL
      const storeName = formData.shopifyUrl.replace('.myshopify.com', '');
      const developmentUrl = `https://admin.shopify.com/store/${storeName}/settings/apps/development?link_source=search`;
      
      window.open(developmentUrl, '_blank');
      toast.success("Opening Shopify Apps development settings...", { duration: 2000 });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto pt-4 sm:pt-8">
        <Card className="bg-white shadow-2xl border-0">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Key className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">API Config</h2>
              <p className="text-gray-600 text-base sm:text-lg">
                Configure your Shopify API access
              </p>
            </div>

            {/* Main Instructions - Light Grey Background */}
            <div className="mb-8">
              <div className="bg-gray-100 rounded-xl p-6 sm:p-8 mb-6">
                <p className="text-gray-800 font-medium mb-4 text-base sm:text-lg">
                  Configure the App on Shopify to safely build your store using our technology. This method ensures secure access and eliminates risks associated with sharing passwords.
                </p>
                
                <p className="text-gray-800 font-medium mb-4 text-base sm:text-lg">
                  To set up the App on Shopify, please follow these steps:
                </p>
                
                <div className="space-y-2 text-sm sm:text-base text-gray-700 mb-6">
                  <div className="flex items-start">
                    <span className="mr-3 text-blue-600 font-bold">1.</span>
                    <span>Click <strong>Access Shopify Apps</strong> button below</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3 text-blue-600 font-bold">2.</span>
                    <span>Click <strong>Allow custom app development</strong> twice</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3 text-blue-600 font-bold">3.</span>
                    <span>Click <strong>Create an app</strong></span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3 text-blue-600 font-bold">4.</span>
                    <span>Fill in Name with <strong>"Custom Store"</strong></span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3 text-blue-600 font-bold">5.</span>
                    <span>Click <strong>Configure Admin API Scopes</strong></span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3 text-blue-600 font-bold">6.</span>
                    <span>Select <strong>ALL API Scopes</strong> (Check All Boxes).</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3 text-blue-600 font-bold">7.</span>
                    <span>Click <strong>Save</strong> button and <strong>Install</strong> at the top right.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3 text-blue-600 font-bold">8.</span>
                    <span>Click the <strong>Reveal Token</strong> button once</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3 text-blue-600 font-bold">9.</span>
                    <span>Copy the token that is revealed</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3 text-blue-600 font-bold">10.</span>
                    <span>Paste the token in the field below</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3 text-blue-600 font-bold">11.</span>
                    <span>Click the <strong>Next Step</strong> button to continue</span>
                  </div>
                </div>

                <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
                  <p className="text-red-800 font-medium text-sm sm:text-base">
                    <strong>NOTE:</strong> Make sure you select all access scope options. If any are left unchecked, your store build may fail.
                  </p>
                </div>

                {/* Highlighted Return Message - Yellow Background */}
                <div className="bg-yellow-200 border border-yellow-400 rounded-lg p-3">
                  <p className="text-yellow-900 font-medium text-sm sm:text-base">
                    Remember to return to this tab to continue creating your store.
                  </p>
                </div>
              </div>
            </div>

            {/* Access Token Input - FIXED: Always visible, no password type, proper styling */}
            <div className="mb-8">
              <Label htmlFor="accessToken" className="block text-gray-700 font-semibold text-base sm:text-lg mb-3">
                Access Token
              </Label>
              <Input
                id="accessToken"
                type="text"
                placeholder="Ex: shpat_336469..."
                value={formData.accessToken}
                onChange={(e) => handleTokenChange(e.target.value)}
                className={`w-full h-12 sm:h-14 text-base sm:text-lg border-2 rounded-xl transition-colors font-mono ${
                  isValidToken 
                    ? 'border-green-500 focus:border-green-600 bg-white' 
                    : formData.accessToken && !isValidToken
                      ? 'border-red-500 focus:border-red-600 bg-white'
                      : 'border-gray-300 focus:border-blue-500 bg-white'
                }`}
              />
              
              {/* FIXED: Only show error messages, no success messages */}
              {formData.accessToken && !isValidToken && (
                <div className="mt-2">
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Invalid token format. Should start with 'shpat_' followed by 32 characters
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="text-center">
              <Button
                onClick={openShopifyApps}
                className="w-full h-12 sm:h-14 bg-green-600 hover:bg-green-700 text-white text-base sm:text-lg font-semibold rounded-xl mb-4"
                disabled={!formData.shopifyUrl}
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Access Shopify Apps
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default APIConfigStep;

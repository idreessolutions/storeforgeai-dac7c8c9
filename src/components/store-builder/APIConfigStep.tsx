
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
  const [showInstructions, setShowInstructions] = useState(true);

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

  const openAdminPanel = () => {
    if (formData.shopifyUrl) {
      const adminUrl = formData.shopifyUrl.includes('.myshopify.com') 
        ? `https://admin.shopify.com/store/${formData.shopifyUrl.replace('.myshopify.com', '')}`
        : `https://${formData.shopifyUrl}/admin`;
      
      window.open(adminUrl, '_blank');
      toast.success("Opening Shopify admin panel...", { duration: 2000 });
    }
  };

  return (
    <Card className="border-0 shadow-lg max-w-4xl mx-auto">
      <CardContent className="py-8 lg:py-12 px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Connect Your Store</h2>
          <p className="text-gray-600 text-base lg:text-lg">
            Add your Shopify Admin API access token to start building products
          </p>
        </div>

        {showInstructions && (
          <div className="mb-8">
            <div className="bg-blue-50 rounded-xl p-4 lg:p-6 mb-6">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3">
                How to get your Shopify Admin API Access Token:
              </h3>
              
              <div className="space-y-4 text-sm lg:text-base text-gray-700">
                <div className="flex items-start">
                  <span className="mr-3 text-blue-600 font-bold">1.</span>
                  <span>Go to your Shopify admin panel → Apps → App and sales channel settings</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-3 text-blue-600 font-bold">2.</span>
                  <span>Click "Develop apps" → "Create an app"</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-3 text-blue-600 font-bold">3.</span>
                  <span>Configure Admin API scopes: <strong>read_products, write_products, read_themes, write_themes</strong></span>
                </div>
                <div className="flex items-start">
                  <span className="mr-3 text-blue-600 font-bold">4.</span>
                  <span>Install the app and copy the Admin API access token</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-3 text-blue-600 font-bold">5.</span>
                  <span>Paste the token below (starts with <code className="bg-gray-200 px-1 rounded">shpat_</code>)</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-200">
                <Button
                  onClick={openAdminPanel}
                  variant="outline"
                  className="w-full lg:w-auto"
                  disabled={!formData.shopifyUrl}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Shopify Admin Panel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Access Token Input */}
        <div className="mb-8">
          <Label htmlFor="accessToken" className="block text-gray-700 font-semibold text-base lg:text-lg mb-3">
            Shopify Admin API Access Token
          </Label>
          <Input
            id="accessToken"
            type="password"
            placeholder="Ex: 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"
            value={formData.accessToken}
            onChange={(e) => handleTokenChange(e.target.value)}
            className={`w-full h-12 lg:h-14 text-base lg:text-lg border-2 rounded-xl transition-colors font-mono ${
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
                <p className="text-green-600 text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Valid Shopify Admin API access token
                </p>
              ) : (
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Invalid token format. Should start with 'shpat_' followed by 32 characters
                </p>
              )}
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Key className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm lg:text-base font-semibold text-gray-900 mb-1">
                🔒 Your API token is secure
              </h4>
              <p className="text-xs lg:text-sm text-gray-600">
                We use your access token only to create products and apply themes to your store. 
                It's transmitted securely and never stored permanently.
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Instructions */}
        <div className="text-center mt-6">
          <Button
            onClick={() => setShowInstructions(!showInstructions)}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700"
          >
            {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default APIConfigStep;

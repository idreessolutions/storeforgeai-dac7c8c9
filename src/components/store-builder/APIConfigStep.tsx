
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface APIConfigStepProps {
  formData: {
    accessToken: string;
    shopifyUrl: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

const APIConfigStep = ({ formData, handleInputChange }: APIConfigStepProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Store validation state on window for StoreBuilderLogic to access
  useEffect(() => {
    (window as any).validateAPIConfig = () => {
      return isValid && formData.accessToken && formData.shopifyUrl;
    };
  }, [isValid, formData.accessToken, formData.shopifyUrl]);

  const validateAccessToken = async () => {
    if (!formData.accessToken || !formData.shopifyUrl) {
      toast.error("Please enter both store URL and access token");
      return;
    }

    setIsValidating(true);
    
    try {
      // Extract store domain from URL
      let storeDomain = formData.shopifyUrl;
      if (storeDomain.includes('://')) {
        storeDomain = storeDomain.split('://')[1];
      }
      if (!storeDomain.includes('.myshopify.com')) {
        storeDomain = `${storeDomain}.myshopify.com`;
      }

      const response = await fetch(`https://${storeDomain}/admin/api/2024-10/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': formData.accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsValid(true);
        toast.success(`✅ Successfully connected to ${data.shop?.name || 'your store'}!`);
      } else {
        setIsValid(false);
        toast.error("Invalid access token or store URL. Please check and try again.");
      }
    } catch (error) {
      setIsValid(false);
      toast.error("Failed to validate connection. Please check your credentials.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleTokenChange = (value: string) => {
    handleInputChange('accessToken', value);
    setIsValid(false); // Reset validation when token changes
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <Card className="bg-white shadow-2xl border-0">
          <CardContent className="p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Key className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Connect Your Store</h1>
              <p className="text-xl text-gray-600">Secure API connection to manage your products</p>
            </div>

            {/* Video Section */}
            <div className="mb-10">
              <div className="relative w-full bg-gray-900 rounded-xl overflow-hidden shadow-lg" style={{ aspectRatio: '16/9' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-2xl font-bold bg-black bg-opacity-70 px-6 py-3 rounded-lg">
                    API CONFIGURATION TUTORIAL
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-3">
                  <div className="flex items-center space-x-3">
                    <button className="text-white text-lg">▶</button>
                    <div className="flex-1 bg-gray-600 h-2 rounded-full">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    <span className="text-white text-sm font-medium">02:30</span>
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
              <div className="bg-gray-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How to get your Shopify Admin API Access Token:</h3>
                
                <ol className="text-gray-700 space-y-3">
                  <li className="flex items-start">
                    <span className="mr-3 text-purple-600 font-bold">1.</span>
                    <span>Go to your Shopify Admin → Settings → Apps and sales channels</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-purple-600 font-bold">2.</span>
                    <span>Click "Develop apps for your store" → "Create an app"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-purple-600 font-bold">3.</span>
                    <span>Name it "Store Builder" → Configure Admin API scopes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-purple-600 font-bold">4.</span>
                    <span>Enable: Products, Themes, Shop settings → Save → Install app</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-purple-600 font-bold">5.</span>
                    <span>Copy the "Admin API access token" and paste it below</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Access Token Input */}
            <div className="mb-8">
              <Label htmlFor="accessToken" className="block text-gray-700 font-semibold text-lg mb-3">
                Shopify Admin API Access Token
              </Label>
              <div className="relative">
                <Input
                  id="accessToken"
                  type={showToken ? "text" : "password"}
                  placeholder="Ex: shpat_225357..."
                  value={formData.accessToken}
                  onChange={(e) => handleTokenChange(e.target.value)}
                  className="w-full h-14 text-lg border-2 border-gray-300 rounded-xl focus:border-purple-500 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.accessToken && (
                <p className="text-sm text-gray-600 mt-2">
                  Token format: {formData.accessToken.startsWith('shpat_') ? '✅ Valid format' : '⚠️ Should start with "shpat_"'}
                </p>
              )}
            </div>

            {/* Validation Button */}
            <div className="text-center mb-8">
              <Button
                onClick={validateAccessToken}
                disabled={isValidating || !formData.accessToken}
                className={`w-full h-16 text-xl font-bold rounded-xl transition-all transform hover:scale-105 ${
                  isValid 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                } text-white shadow-lg`}
              >
                {isValidating ? (
                  <>
                    <AlertCircle className="mr-3 h-6 w-6 animate-spin" />
                    Validating Connection...
                  </>
                ) : isValid ? (
                  <>
                    <CheckCircle className="mr-3 h-6 w-6" />
                    Connection Verified ✅
                  </>
                ) : (
                  <>
                    <Key className="mr-3 h-6 w-6" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>

            {/* Status Messages */}
            {isValid && (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-900 mb-2">
                    🎉 Successfully Connected!
                  </h3>
                  <p className="text-green-700">
                    Your store is ready for product generation and theme customization.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default APIConfigStep;


import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";

interface APIConfigStepProps {
  formData: {
    accessToken: string;
    shopifyUrl: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

const APIConfigStep = ({ formData, handleInputChange }: APIConfigStepProps) => {
  const [appsAccessed, setAppsAccessed] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleAccessShopifyApps = () => {
    setAppsAccessed(true);
    setCountdown(25); // 25 second countdown
    console.log('🚨 CRITICAL: User accessed Shopify Apps - starting 25s countdown');
    
    if (formData.shopifyUrl) {
      // Extract store name from the domain (e.g., "your-store" from "your-store.myshopify.com")
      const storeName = formData.shopifyUrl.replace('.myshopify.com', '');
      const appsUrl = `https://admin.shopify.com/store/${storeName}/settings/apps/development`;
      window.open(appsUrl, '_blank');
    } else {
      window.open('https://admin.shopify.com/settings/apps/development', '_blank');
    }
  };

  const validateAPIConfig = () => {
    if (!appsAccessed) {
      console.log('🚨 CRITICAL: User must click Access Shopify Apps first');
      return false;
    }
    if (countdown > 0) {
      console.log(`🚨 CRITICAL: User must wait ${countdown} more seconds before proceeding`);
      return false;
    }
    if (!formData.accessToken.trim()) {
      console.log('🚨 CRITICAL: Access token is required');
      return false;
    }
    return true;
  };

  // This function will be called by the parent component
  React.useEffect(() => {
    (window as any).validateAPIConfig = validateAPIConfig;
  }, [appsAccessed, countdown, formData.accessToken]);

  return (
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardContent className="py-12 px-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">API Config</h2>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-700 mb-4">
              Configure the App on Shopify to safely build your store using our technology. This method ensures secure access and eliminates risks associated with sharing passwords.
            </p>
            
            <p className="text-gray-700 mb-6">
              To set up the App on Shopify, please follow these steps:
            </p>
            
            <ul className="space-y-2 text-gray-700 mb-6">
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Click <strong>Access Shopify Apps</strong> button below
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Click <strong>Allow custom app development</strong> twice
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Click <strong>Create an app</strong>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Fill in Name with <strong>"Custom Store"</strong>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Click <strong>Configure Admin API Scopes</strong>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Select <strong>ALL API Scopes (Check All Boxes)</strong>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Click <strong>Save</strong> button and <strong>Install</strong> at the top right
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Click the <strong>Reveal Token</strong> button once
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Copy the token that is revealed
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Paste the token in the field below
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Click the <strong>Next Step</strong> button to continue
              </li>
            </ul>

            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm font-medium">
                <strong>NOTE:</strong> Make sure you select all access scope options. If any are left unchecked, your store build may fail.
              </p>
            </div>

            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm font-medium">
                Remember to return to this tab to continue creating your store.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="accessToken" className="text-sm font-medium text-gray-700">
                  Access Token
                </Label>
                <Input
                  id="accessToken"
                  placeholder="Ex: shpat_115753..."
                  value={formData.accessToken}
                  onChange={(e) => handleInputChange('accessToken', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Button 
            className={`w-full py-4 text-lg font-semibold flex items-center justify-center ${
              appsAccessed && countdown === 0
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : appsAccessed && countdown > 0
                ? 'bg-orange-500 text-white cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            onClick={handleAccessShopifyApps}
            disabled={appsAccessed && countdown > 0}
          >
            {appsAccessed && countdown > 0 ? (
              <>
                <AlertCircle className="mr-2 h-5 w-5" />
                Wait {countdown}s before Next Step
              </>
            ) : appsAccessed && countdown === 0 ? (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Apps Accessed - Ready to Proceed
              </>
            ) : (
              <>
                Access Shopify Apps
                <ExternalLink className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default APIConfigStep;

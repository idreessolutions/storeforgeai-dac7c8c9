
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
      setCountdown(25);
      
      toast.success("API setup process started! Please wait 25 seconds.", {
        duration: 3000,
      });

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card className="bg-white shadow-lg">
        <CardContent className="p-8">
          {/* Video Section */}
          <div className="mb-8">
            <div className="relative w-full bg-gray-200 rounded-lg overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-white p-4 rounded shadow-md mb-4 max-w-xs mx-auto">
                      <div className="text-xs text-gray-600 mb-2">Apps and sales channels</div>
                      <div className="space-y-1">
                        <div className="h-2 bg-gray-200 rounded"></div>
                        <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Video controls overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                <div className="flex items-center space-x-2">
                  <button className="text-white">▶</button>
                  <div className="flex-1 bg-gray-600 h-1 rounded">
                    <div className="bg-green-500 h-1 rounded" style={{ width: '80%' }}></div>
                  </div>
                  <span className="text-white text-sm">01:13</span>
                  <div className="flex space-x-1">
                    <button className="text-white">🔊</button>
                    <button className="text-white">📺</button>
                    <button className="text-white">⚙️</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Configure the App on Shopify to safely build your store using our technology. This method ensures secure access and eliminates risks associated with sharing passwords.
            </p>
            
            <p className="text-gray-700 mb-4">
              To set up the App on Shopify, please follow these steps:
            </p>

            <ul className="text-gray-700 space-y-2 mb-4">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Click <strong>Access Shopify Apps</strong> button below</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Click <strong>Allow custom app development</strong> twice</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Click <strong>Create an app</strong></span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Fill in Name with "Custom Store"</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Click <strong>Configure Admin API Scopes</strong></span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Select ALL API Scopes (Check All Boxes)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Click <strong>Save</strong> button and <strong>Install</strong> at the top right</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Click the Reveal Token button once</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Copy the token that is revealed</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Paste the token in the field below</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Click the Next Step button to continue</span>
              </li>
            </ul>

            <div className="p-3 bg-yellow-100 border border-yellow-300 rounded text-sm text-gray-700">
              <strong>NOTE:</strong> Make sure you select all access scope options. If any are left unchecked, your store build may fail.
            </div>

            {hasClickedAccess && countdown > 0 && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
                Remember to return to this tab to continue creating your store.
              </div>
            )}
          </div>

          {/* Access Token Input */}
          <div className="mb-6">
            <Label htmlFor="accessToken" className="block text-gray-700 font-medium mb-2">
              Access Token
            </Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="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"
              value={formData.accessToken}
              onChange={(e) => handleInputChange('accessToken', e.target.value)}
              className="w-full font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleAccessShopifyApps}
              disabled={hasClickedAccess}
              className={`w-full ${
                canProceed 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : hasClickedAccess 
                    ? 'bg-yellow-500 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
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
                'Access Shopify Apps'
              )}
            </Button>

            <Button 
              variant="outline" 
              className="w-full border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              Next Step
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIConfigStep;

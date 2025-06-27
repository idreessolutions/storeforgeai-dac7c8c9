
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
      return hasClickedCreate && canProceed && formData.shopifyUrl && formData.createdViaAffiliate;
    };
  }, [hasClickedCreate, canProceed, formData.shopifyUrl, formData.createdViaAffiliate]);

  const handleCreateAccount = () => {
    if (!hasClickedCreate) {
      setHasClickedCreate(true);
      setCountdown(25);
      
      toast.success("Account creation process started! Please wait 25 seconds.", {
        duration: 3000,
      });

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanProceed(true);
            toast.success("✅ Account setup complete! You can now proceed to the next step.", {
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
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-white text-xl font-bold bg-black bg-opacity-70 px-4 py-2 rounded">
                  YOU MUST MAKE A BRAND NEW STORE
                </div>
              </div>
              {/* Video controls overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                <div className="flex items-center space-x-2">
                  <button className="text-white">▶</button>
                  <div className="flex-1 bg-gray-600 h-1 rounded">
                    <div className="bg-green-500 h-1 rounded" style={{ width: '60%' }}></div>
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
              First you need to create a Shopify account before we start building your completely free store!
            </p>
            
            <ul className="text-gray-700 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Click the <strong>Create Account</strong> button below</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Complete the registration information to signup</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Return to this tab and paste your store URL below</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Click the next button</span>
              </li>
            </ul>

            {hasClickedCreate && countdown > 0 && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
                Remember to return to this tab to continue creating your store.
              </div>
            )}
          </div>

          {/* Store URL Input */}
          <div className="mb-6">
            <Label htmlFor="shopifyUrl" className="block text-gray-700 font-medium mb-2">
              Store URL
            </Label>
            <Input
              id="shopifyUrl"
              type="url"
              placeholder="t3tq4m-je.myshopify.com"
              value={formData.shopifyUrl}
              onChange={(e) => handleInputChange('shopifyUrl', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleCreateAccount}
              disabled={hasClickedCreate}
              className={`w-full ${
                canProceed 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : hasClickedCreate 
                    ? 'bg-yellow-500 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {canProceed ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Account Created Successfully
                </>
              ) : hasClickedCreate ? (
                <>
                  <Timer className="mr-2 h-4 w-4" />
                  Setting up... ({countdown}s)
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <Button 
              variant="outline" 
              className="w-full border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              Next Step
            </Button>
          </div>

          {/* Confirmation Checkbox */}
          {hasClickedCreate && (
            <div className="mt-6 flex items-center space-x-2">
              <Checkbox
                id="createdViaAffiliate"
                checked={formData.createdViaAffiliate}
                onCheckedChange={(checked) => handleInputChange('createdViaAffiliate', !!checked)}
              />
              <Label htmlFor="createdViaAffiliate" className="text-sm text-gray-700">
                I have successfully created my Shopify account
              </Label>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopifySetupStep;

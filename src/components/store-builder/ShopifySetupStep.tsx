
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
      setCountdown(25); // 25 second countdown
      
      toast.success("Account creation process started! Please wait 25 seconds.", {
        duration: 3000,
      });

      // Countdown timer
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

  const affiliateUrl = "https://partners.shopify.com/";

  return (
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardContent className="py-12 px-8">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Shopify Store</h2>
          <p className="text-gray-600">Set up your professional e-commerce store</p>
        </div>

        <div className="space-y-8">
          {/* Step 1: Create Account */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                canProceed ? 'bg-green-500' : hasClickedCreate ? 'bg-yellow-500' : 'bg-gray-300'
              }`}>
                {canProceed ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : hasClickedCreate ? (
                  <Timer className="h-5 w-5 text-white" />
                ) : (
                  <span className="text-white font-semibold">1</span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Create Your Shopify Account
                </h3>
                <p className="text-gray-600 mb-4">
                  Start your 14-day free trial with Shopify to create your online store.
                </p>
                
                <Button
                  onClick={handleCreateAccount}
                  disabled={hasClickedCreate}
                  className={`${
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
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>

                {hasClickedCreate && countdown > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <Timer className="inline h-4 w-4 mr-1" />
                      Please wait {countdown} seconds while we set up your account...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Store URL */}
          {hasClickedCreate && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="shopifyUrl" className="text-base font-medium text-gray-900">
                  Your Shopify Store URL
                </Label>
                <p className="text-sm text-gray-600 mb-3">
                  Enter your complete Shopify store URL (e.g., https://yourstore.myshopify.com)
                </p>
                <Input
                  id="shopifyUrl"
                  type="url"
                  placeholder="https://yourstore.myshopify.com"
                  value={formData.shopifyUrl}
                  onChange={(e) => handleInputChange('shopifyUrl', e.target.value)}
                  className="w-full h-12 text-base"
                />
              </div>

              {/* Confirmation checkbox */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="createdViaAffiliate"
                  checked={formData.createdViaAffiliate}
                  onCheckedChange={(checked) => handleInputChange('createdViaAffiliate', !!checked)}
                  className="mt-1"
                />
                <div>
                  <Label htmlFor="createdViaAffiliate" className="text-base font-medium text-gray-900">
                    I have successfully created my Shopify account
                  </Label>
                  <p className="text-sm text-gray-600">
                    Confirm that you've completed the Shopify account setup process
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status indicator */}
          {canProceed && formData.shopifyUrl && formData.createdViaAffiliate && (
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                ✅ Shopify Setup Complete!
              </h3>
              <p className="text-green-700">
                Your store is ready. You can now proceed to the next step.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopifySetupStep;

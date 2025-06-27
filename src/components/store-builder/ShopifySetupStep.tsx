
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl bg-white shadow-2xl border-0 rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-12 text-center">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <Store className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Create Shopify Store</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Set up your professional e-commerce store with our guided process
            </p>
          </div>

          {/* Content Section */}
          <div className="p-12">
            {/* Step 1: Create Account */}
            <div className="mb-12">
              <div className="flex items-start space-x-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  canProceed ? 'bg-green-500' : hasClickedCreate ? 'bg-yellow-500' : 'bg-gray-300'
                }`}>
                  {canProceed ? (
                    <CheckCircle className="h-6 w-6 text-white" />
                  ) : hasClickedCreate ? (
                    <Timer className="h-6 w-6 text-white" />
                  ) : (
                    <span className="text-white font-bold text-lg">1</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Create Your Shopify Account
                  </h2>
                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    Start your 14-day free trial with Shopify to create your online store. 
                    We'll guide you through the entire setup process.
                  </p>
                  
                  <Button
                    onClick={handleCreateAccount}
                    disabled={hasClickedCreate}
                    size="lg"
                    className={`${
                      canProceed 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : hasClickedCreate 
                          ? 'bg-yellow-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    } text-white px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-300`}
                  >
                    {canProceed ? (
                      <>
                        <CheckCircle className="mr-3 h-5 w-5" />
                        Account Created Successfully
                      </>
                    ) : hasClickedCreate ? (
                      <>
                        <Timer className="mr-3 h-5 w-5" />
                        Setting up... ({countdown}s)
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-3 h-5 w-5" />
                        Create Account
                      </>
                    )}
                  </Button>

                  {hasClickedCreate && countdown > 0 && (
                    <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex items-center">
                        <Timer className="h-5 w-5 text-yellow-600 mr-2" />
                        <p className="text-yellow-800 font-medium">
                          Please wait {countdown} seconds while we set up your account...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Store URL */}
            {hasClickedCreate && (
              <div className="space-y-8">
                <div className="bg-gray-50 rounded-2xl p-8">
                  <Label htmlFor="shopifyUrl" className="text-xl font-semibold text-gray-900 mb-2 block">
                    Your Shopify Store URL
                  </Label>
                  <p className="text-gray-600 mb-4 text-lg">
                    Enter your complete Shopify store URL (e.g., https://yourstore.myshopify.com)
                  </p>
                  <Input
                    id="shopifyUrl"
                    type="url"
                    placeholder="https://yourstore.myshopify.com"
                    value={formData.shopifyUrl}
                    onChange={(e) => handleInputChange('shopifyUrl', e.target.value)}
                    className="w-full h-14 text-lg px-4 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>

                {/* Confirmation checkbox */}
                <div className="flex items-start space-x-4 bg-blue-50 rounded-2xl p-6">
                  <Checkbox
                    id="createdViaAffiliate"
                    checked={formData.createdViaAffiliate}
                    onCheckedChange={(checked) => handleInputChange('createdViaAffiliate', !!checked)}
                    className="mt-1"
                  />
                  <div>
                    <Label htmlFor="createdViaAffiliate" className="text-lg font-semibold text-gray-900 mb-1 block">
                      I have successfully created my Shopify account
                    </Label>
                    <p className="text-gray-600">
                      Confirm that you've completed the Shopify account setup process
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success indicator */}
            {canProceed && formData.shopifyUrl && formData.createdViaAffiliate && (
              <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 text-center border border-green-200">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-900 mb-2">
                  ✅ Shopify Setup Complete!
                </h3>
                <p className="text-green-700 text-lg">
                  Your store is ready. You can now proceed to the next step.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopifySetupStep;

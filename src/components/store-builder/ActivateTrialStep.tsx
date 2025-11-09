
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, CreditCard, AlertCircle, X, Shield, Lock, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ActivateTrialStepProps {
  formData: {
    shopifyUrl: string;
    planActivated: boolean;
  };
  handleInputChange: (field: string, value: string | boolean) => void;
}

const ActivateTrialStep = ({ formData, handleInputChange }: ActivateTrialStepProps) => {
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [planStatus, setPlanStatus] = useState<'checking' | 'inactive' | 'active'>('checking');
  const [hasClickedAccessPlans, setHasClickedAccessPlans] = useState(false);

  useEffect(() => {
    if (formData.planActivated) {
      setPlanStatus('active');
    } else {
      setPlanStatus('inactive');
    }
  }, [formData.planActivated]);

  const handleAccessPlans = () => {
    setHasClickedAccessPlans(true);
    console.log('User clicked Access Plans');
    
    if (formData.shopifyUrl) {
      const storeName = formData.shopifyUrl.replace('.myshopify.com', '');
      const plansUrl = `https://admin.shopify.com/store/${storeName}/settings/subscribe/select-plan?from=trialBanner`;
      window.open(plansUrl, '_blank');
    } else {
      window.open('https://admin.shopify.com/settings/subscribe/select-plan?from=trialBanner', '_blank');
    }
  };

  const handlePlanActivated = () => {
    if (!hasClickedAccessPlans) {
      setShowErrorModal(true);
      return;
    }

    // Simulate plan verification - in production, you'd verify with Shopify API
    // For now, we'll ask them to confirm they actually picked a plan
    const confirmed = window.confirm(
      "Have you actually selected and activated the Basic Shopify Plan? Click OK only if you have completed the plan activation process."
    );
    
    if (confirmed) {
      setPlanStatus('active');
      handleInputChange('planActivated', true);
      console.log('Plan activation confirmed');
    } else {
      console.log('Plan activation not confirmed');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 relative overflow-hidden">
        {/* Floating decorative shapes */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-blue-400/20 rounded-full blur-xl animate-float" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400/20 rounded-full blur-xl animate-float-delayed" />
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl animate-float" />
        
        <div className="max-w-4xl mx-auto pt-4 sm:pt-8 relative z-10">
          <Card className="bg-white shadow-2xl border-0 rounded-2xl transition-shadow hover:shadow-3xl">
            <CardContent className="p-6 sm:p-8 lg:p-12">
              {/* Header */}
              <div className="text-center mb-8 sm:mb-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Activate Your Shopify Plan
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 mb-6">
                  To unlock full store-building features, Shopify requires a plan to be activated.
                  <br />
                  <span className="text-base text-gray-500">You will not be charged immediately — Shopify includes a free trial.</span>
                </p>
                
                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Secure Shopify Billing</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Free Trial Included</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-200">
                    <Lock className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">You Stay in Control</span>
                  </div>
                </div>
              </div>

              {/* How to Activate Section */}
              <div className="mb-8 sm:mb-10 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  How to Activate
                </h2>
                
                <ul className="space-y-3 text-gray-700 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <span className="text-base pt-0.5">Click <strong>Access Plans</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <span className="text-base pt-0.5">Select the <strong>Basic</strong> plan</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <span className="text-base pt-0.5">Enter business details</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      4
                    </span>
                    <span className="text-base pt-0.5">Choose a billing method</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      5
                    </span>
                    <span className="text-base pt-0.5">Click <strong>Start Plan</strong></span>
                  </li>
                </ul>

                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">✅</span>
                  <p className="text-green-800 text-sm">
                    <strong>Shopify includes a free trial</strong> — nothing is charged immediately.
                  </p>
                </div>

                {/* Required Note */}
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">⚠️</span>
                  <div>
                    <p className="text-orange-900 font-semibold mb-1">Required by Shopify:</p>
                    <p className="text-orange-800 text-sm">
                      A paid plan must be activated to continue building your store. You can cancel anytime inside Shopify.
                    </p>
                  </div>
                </div>

                {/* Reminder */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">💡</span>
                  <p className="text-blue-800 text-sm">
                    After activation, return here and click <strong>"I've Activated My Plan"</strong>
                  </p>
                </div>

                {/* Success Message */}
                {planStatus === 'active' && (
                  <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4 mt-4 flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <p className="text-green-800 text-sm font-semibold">
                      ✅ Plan activated successfully! You can proceed to the next step.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button 
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  onClick={handleAccessPlans}
                >
                  <span className="text-xl mr-2">⭐</span>
                  Access Plans
                  <ExternalLink className="ml-3 h-5 w-5" />
                </Button>

                <Button 
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  onClick={handlePlanActivated}
                >
                  I've Activated My Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trust & Safety Section */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <Lock className="h-6 w-6 text-green-600" />
                <p className="text-sm font-medium text-gray-800">
                  Secure Shopify payments
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                <p className="text-sm font-medium text-gray-800">
                  Cancel anytime in settings
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Shield className="h-6 w-6 text-purple-600" />
                <p className="text-sm font-medium text-gray-800">
                  Full control of billing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">Access Plans First</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-gray-700 mb-4 text-sm">
              Please click "Access Plans" and select a Shopify plan before confirming activation.
            </p>
            <Button onClick={() => setShowErrorModal(false)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActivateTrialStep;

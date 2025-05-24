
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, X } from "lucide-react";

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

  useEffect(() => {
    // Simulate checking plan status
    const checkPlanStatus = () => {
      // In a real app, this would check the actual Shopify plan status
      // For now, we'll assume it's inactive until manually activated
      setPlanStatus('inactive');
    };

    if (formData.shopifyUrl) {
      checkPlanStatus();
    }
  }, [formData.shopifyUrl]);

  const handleAccessPlans = () => {
    if (formData.shopifyUrl) {
      const storeName = formData.shopifyUrl.replace('.myshopify.com', '');
      const plansUrl = `https://admin.shopify.com/store/${storeName}/settings/subscribe/select-plan?from=trialBanner`;
      window.open(plansUrl, '_blank');
    } else {
      window.open('https://admin.shopify.com/settings/subscribe/select-plan?from=trialBanner', '_blank');
    }
  };

  const handleStartStoreBuild = () => {
    if (planStatus !== 'active') {
      setShowErrorModal(true);
      return;
    }
    handleInputChange('planActivated', true);
  };

  const handlePlanActivated = () => {
    setPlanStatus('active');
    handleInputChange('planActivated', true);
  };

  return (
    <>
      <Card className="border-0 shadow-lg max-w-2xl mx-auto">
        <CardContent className="py-12 px-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Activate Shopify Plan</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                Activate the Free Trial to unlock all features and avoid limitations in your Shopify store setup.
              </p>
              
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="font-medium mr-2">•</span>
                  Click the <strong>Access Plans</strong> button below to go to select a plan
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">•</span>
                  Select the <strong>"Basic" Monthly Plan</strong>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">•</span>
                  Fill in your name, business address, etc.
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">•</span>
                  Choose <strong>"Credit Card"</strong> as the payment method
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">•</span>
                  Enter your credit card details and activate the plan
                </li>
              </ul>

              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm font-medium">
                  <strong>NOTE:</strong> You must activate a paid plan to continue.
                </p>
              </div>

              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm font-medium">
                  After activating your plan, return to this tab and click "I've Activated My Plan" below.
                </p>
              </div>

              {planStatus === 'active' && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
                  <p className="text-green-800 text-sm font-medium">
                    ✅ Plan activated successfully! You can now proceed to the next step.
                  </p>
                </div>
              )}
            </div>

            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold mb-4"
              onClick={handleAccessPlans}
            >
              Access Plans
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>

            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 text-lg font-semibold mb-4"
              onClick={handlePlanActivated}
            >
              I've Activated My Plan
            </Button>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
              onClick={handleStartStoreBuild}
              disabled={planStatus !== 'active'}
            >
              Start Store Build
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">You Should Pick A Plan</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-gray-700 mb-6">
              Please activate your Shopify plan before proceeding to the next step.
            </p>
            <Button onClick={() => setShowErrorModal(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActivateTrialStep;

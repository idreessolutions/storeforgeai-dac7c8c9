
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
    // Check if plan was already activated
    if (formData.planActivated) {
      setPlanStatus('active');
    } else {
      setPlanStatus('inactive');
    }
  }, [formData.planActivated]);

  const handleAccessPlans = () => {
    if (formData.shopifyUrl) {
      const storeName = formData.shopifyUrl.replace('.myshopify.com', '');
      const plansUrl = `https://admin.shopify.com/store/${storeName}/settings/subscribe/select-plan?from=trialBanner`;
      window.open(plansUrl, '_blank');
    } else {
      window.open('https://admin.shopify.com/settings/subscribe/select-plan?from=trialBanner', '_blank');
    }
  };

  const handlePlanActivated = () => {
    // In a real app, this would verify the plan status via Shopify API
    // For now, we'll simulate that they need to actually pick a plan
    // The user needs to have actually selected a plan on Shopify for this to work
    
    // For demo purposes, we'll set it to active when they click
    // In production, you'd verify this with Shopify's API
    setPlanStatus('active');
    handleInputChange('planActivated', true);
  };

  return (
    <>
      <Card className="border-0 shadow-lg max-w-2xl mx-auto">
        <CardContent className="py-8 px-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Activate Shopify Plan</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-3 text-sm">
                Activate the Free Trial to unlock all features and avoid limitations.
              </p>
              
              <ul className="space-y-1 text-gray-700 mb-4 text-sm">
                <li className="flex items-start">
                  <span className="font-medium mr-2">•</span>
                  Click <strong>Access Plans</strong> to select a plan
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">•</span>
                  Select the <strong>"Basic" Monthly Plan</strong>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">•</span>
                  Fill in your business details
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">•</span>
                  Choose <strong>"Credit Card"</strong> payment
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">•</span>
                  Enter credit card details and activate
                </li>
              </ul>

              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4">
                <p className="text-yellow-800 text-xs font-medium">
                  <strong>NOTE:</strong> You must activate a paid plan to continue.
                </p>
              </div>

              <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-4">
                <p className="text-blue-800 text-xs font-medium">
                  After activating, return here and click "I've Activated My Plan".
                </p>
              </div>

              {planStatus === 'active' && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-4">
                  <p className="text-green-800 text-xs font-medium">
                    ✅ Plan activated successfully! You can proceed.
                  </p>
                </div>
              )}
            </div>

            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold mb-3"
              onClick={handleAccessPlans}
            >
              Access Plans
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>

            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-base font-semibold"
              onClick={handlePlanActivated}
            >
              I've Activated My Plan
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
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-gray-700 mb-4 text-sm">
              Please activate your Shopify plan before proceeding.
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

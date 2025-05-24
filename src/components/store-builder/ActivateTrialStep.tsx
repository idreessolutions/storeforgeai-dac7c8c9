
import React, { useState } from "react";
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

  const handleAccessPlans = () => {
    if (formData.shopifyUrl) {
      // Extract store name from the domain (e.g., "your-store" from "your-store.myshopify.com")
      const storeName = formData.shopifyUrl.replace('.myshopify.com', '');
      const plansUrl = `https://admin.shopify.com/store/${storeName}/settings/subscribe/select-plan?from=trialBanner`;
      window.open(plansUrl, '_blank');
    } else {
      window.open('https://admin.shopify.com/settings/subscribe/select-plan?from=trialBanner', '_blank');
    }
  };

  const handleStartStoreBuild = () => {
    if (!formData.planActivated) {
      setShowErrorModal(true);
      return;
    }
    // This will be handled by the parent component's next step logic
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
                  Enter your credit card details
                </li>
              </ul>

              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm font-medium">
                  <strong>NOTE:</strong> You must start the $1 trial for next step.
                </p>
              </div>

              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm font-medium">
                  Click "Start Plan" on the right side of the screen.<br/>
                  Return to this tab.<br/>
                  Click the button below to validate your Shopify settings before building your professional store.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="planActivated"
                    checked={formData.planActivated}
                    onChange={(e) => handleInputChange('planActivated', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="planActivated" className="text-sm font-medium text-gray-700">
                    I have activated my Shopify plan and added my payment details
                  </label>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold mb-4"
              onClick={handleAccessPlans}
            >
              Access Plans
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
              onClick={handleStartStoreBuild}
            >
              Start Store Build
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Oops...</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-gray-700 mb-6">
              Please activate your Shopify trial!
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

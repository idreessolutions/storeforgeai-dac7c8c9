
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";

interface GetStartedStepProps {
  onNext: () => void;
  formData: {
    themeColor: string;
  };
  handleInputChange: (field: string, value: string | boolean) => void;
}

const GetStartedStep = ({ onNext, formData, handleInputChange }: GetStartedStepProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
            <Store className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Store Builder</h1>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Get Started</h2>
        <h3 className="text-lg font-semibold text-gray-700 mb-6">Start Your Free eCom Store Build</h3>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="py-8 px-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Welcome to Store Builder</h3>
            
            {/* Placeholder for video - currently non-clickable */}
            <div className="w-full max-w-md mx-auto mb-6 bg-gray-100 rounded-xl p-8 border-2 border-dashed border-gray-300">
              <div className="text-gray-500 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Store className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm">Video Content Coming Soon</p>
              </div>
            </div>

            <Button 
              onClick={onNext}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 text-base font-semibold rounded-lg mb-6"
            >
              Next Step
            </Button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-3">
              <span className="text-xl mr-2">💡</span>
              <span className="text-yellow-800 font-medium text-sm">
                Create a free professional Shopify store in minutes. Follow the steps on-screen to get started and receive 20 potential winning products for your store.
              </span>
            </div>
            
            <Button 
              onClick={onNext}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-base font-semibold rounded-lg"
            >
              Start Your Store
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GetStartedStep;

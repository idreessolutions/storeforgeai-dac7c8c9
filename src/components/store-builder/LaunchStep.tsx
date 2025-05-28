
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Store, CheckCircle } from "lucide-react";

interface LaunchStepProps {
  formData: {
    shopifyUrl: string;
  };
}

const LaunchStep = ({ formData }: LaunchStepProps) => {
  const handleViewStore = () => {
    if (formData.shopifyUrl) {
      // Extract store name from the domain and redirect to the actual store
      const storeName = formData.shopifyUrl.replace('.myshopify.com', '');
      const storeUrl = `https://${storeName}.myshopify.com`;
      window.open(storeUrl, '_blank');
    } else {
      window.open('https://www.shopify.com/', '_blank');
    }
  };

  return (
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardContent className="py-8 px-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Congratulations! 🎉</h2>
          <p className="text-gray-600 text-sm">Your store is ready to launch and start making money</p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Store Complete!</h3>
              <p className="text-gray-600 mb-3 text-sm">
                Your professional e-commerce store has been successfully created and configured. Everything is ready for you to start selling!
              </p>
            </div>

            <div className="grid gap-2 mb-4">
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800 font-medium text-sm">Store Created & Configured</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800 font-medium text-sm">10 Winning Products Added</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800 font-medium text-sm">Theme Customized</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800 font-medium text-sm">Payment Gateway Ready</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800 font-medium text-sm">SEO Optimized</span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold"
                onClick={handleViewStore}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Your Store
              </Button>
              
              <p className="text-xs text-gray-500">
                Click above to visit your live store and start selling
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LaunchStep;

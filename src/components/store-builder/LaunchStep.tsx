
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
      const storeName = formData.shopifyUrl.replace('.myshopify.com', '');
      const storeUrl = `https://admin.shopify.com/store/${storeName}`;
      window.open(storeUrl, '_blank');
    } else {
      window.open('https://admin.shopify.com/', '_blank');
    }
  };

  return (
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardContent className="py-12 px-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Congratulations! 🎉</h2>
          <p className="text-gray-600">Your store is ready to launch</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete!</h3>
              <p className="text-gray-600 mb-4">
                Your store is currently being built. In less than 1 minute our technology will do all the work of customizing your store, which a typical designer and programmer would charge you thousands & take days or even weeks to do! Please do not close this tab.
              </p>
            </div>

            <div className="grid gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Store Created Successfully</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Products Added</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Theme Customized</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Payment Gateway Configured</span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold"
                onClick={handleViewStore}
              >
                <Eye className="mr-2 h-5 w-5" />
                View Your Store
              </Button>
              
              <p className="text-sm text-gray-500">
                Click above to access your Shopify admin panel
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LaunchStep;

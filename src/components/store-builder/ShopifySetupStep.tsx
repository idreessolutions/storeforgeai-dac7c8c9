import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Store } from "lucide-react";

interface ShopifySetupStepProps {
  formData: {
    shopifyUrl: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

const ShopifySetupStep = ({ formData, handleInputChange }: ShopifySetupStepProps) => {
  return (
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardContent className="py-12 px-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Create Store</h2>
          <div className="bg-black text-white px-6 py-3 rounded-lg inline-block text-lg font-semibold mb-6">
            YOU MUST MAKE A BRAND NEW STORE
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-700 mb-4">
              First you need to create a Shopify account before we start building your completely free store!
            </p>
            
            <ul className="space-y-2 text-gray-700 mb-6">
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Click the <strong>Create Account</strong> button below
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Complete the registration information to signup
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Return to this tab and paste your store URL below
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                Click the next button
              </li>
            </ul>

            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm font-medium">
                Remember to return to this tab to continue creating your store.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="storeUrl" className="text-sm font-medium text-gray-700">
                  Store URL
                </Label>
                <Input
                  id="storeUrl"
                  placeholder="Ex: 090c4b-3.myshopify.com"
                  value={formData.shopifyUrl}
                  onChange={(e) => handleInputChange('shopifyUrl', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold"
            onClick={() => window.open('https://accounts.shopify.com/store-create', '_blank')}
          >
            Create Account
            <ExternalLink className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopifySetupStep;

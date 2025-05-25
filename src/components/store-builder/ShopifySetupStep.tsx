
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Store, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ShopifySetupStepProps {
  formData: {
    shopifyUrl: string;
    createdViaAffiliate: boolean;
  };
  handleInputChange: (field: string, value: string | boolean) => void;
}

const ShopifySetupStep = ({ formData, handleInputChange }: ShopifySetupStepProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleCreateAccount = () => {
    setShowModal(true);
  };

  const handleConfirmRedirect = () => {
    setShowModal(false);
    handleInputChange('createdViaAffiliate', true);
    console.log('User confirmed affiliate account creation');
    window.open('http://shopify.pxf.io/GK7n9s', '_blank');
  };

  const handleStoreUrlChange = (value: string) => {
    let domain = value;
    
    // Handle different input formats
    if (value.includes('admin.shopify.com/store/')) {
      // Extract store name from admin URL: https://admin.shopify.com/store/k2y7ge-is
      const match = value.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
      if (match) {
        domain = match[1] + '.myshopify.com';
      }
    } else if (value.includes('https://') || value.includes('http://')) {
      try {
        const url = new URL(value);
        domain = url.hostname;
      } catch (e) {
        domain = value.replace(/https?:\/\//, '').split('/')[0];
      }
    } else if (value && !value.includes('.myshopify.com') && value.length > 0) {
      // If user just enters the store name, add .myshopify.com
      domain = value.replace('.myshopify.com', '') + '.myshopify.com';
    }
    
    console.log('Processed domain:', domain);
    handleInputChange('shopifyUrl', domain);
  };

  const validateAndProceed = () => {
    if (!formData.createdViaAffiliate) {
      setShowErrorModal(true);
      return false;
    }
    return true;
  };

  return (
    <>
      <Card className="border-0 shadow-lg max-w-2xl mx-auto">
        <CardContent className="py-6 px-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Store className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Create Store</h2>
            <div className="bg-black text-white px-3 py-1 rounded-lg inline-block text-xs font-semibold mb-3">
              YOU MUST MAKE A BRAND NEW STORE
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-700 mb-2 text-sm">
                Create a Shopify account before building your store!
              </p>
              
              <ul className="space-y-1 text-gray-700 mb-3 text-xs">
                <li className="flex items-start">
                  <span className="font-medium mr-1">•</span>
                  Click <strong>Create Account</strong> below
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-1">•</span>
                  Complete registration
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-1">•</span>
                  Return and paste your store URL
                </li>
              </ul>

              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 mb-3">
                <p className="text-yellow-800 text-xs">
                  Return to this tab to continue creating your store.
                </p>
              </div>

              <div className="space-y-2">
                <div>
                  <Label htmlFor="storeUrl" className="text-sm font-medium text-gray-700">
                    Store URL
                  </Label>
                  <Input
                    id="storeUrl"
                    placeholder="Ex: 5r4h1b-0y.myshopify.com"
                    value={formData.shopifyUrl}
                    onChange={(e) => handleStoreUrlChange(e.target.value)}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 text-sm font-semibold"
              onClick={handleCreateAccount}
            >
              Create Account
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">Don't forget!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-gray-700 mb-4 text-sm">
              <strong className="text-red-600">NOTE:</strong> Return to this tab after creating your Shopify account and paste your URL below.
            </p>
            <Button onClick={handleConfirmRedirect} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
              Yes I understand!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">Account Required</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-gray-700 mb-4 text-sm">
              Please create a Shopify account by clicking the "Create Account" button first.
            </p>
            <Button onClick={() => setShowErrorModal(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShopifySetupStep;


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
  };
  handleInputChange: (field: string, value: string) => void;
}

const ShopifySetupStep = ({ formData, handleInputChange }: ShopifySetupStepProps) => {
  const [showModal, setShowModal] = useState(false);

  const handleCreateAccount = () => {
    setShowModal(true);
  };

  const handleConfirmRedirect = () => {
    setShowModal(false);
    window.open('https://www.shopify.com/it/prova-gratuita?utm_medium=cpc&utm_source=yabing&jk=shopify&bingadgroupid=1224856204390256&bingadid=76553660775308&bingkeywordid=76553719090121&bingnetwork=o&BOID=brand&msclkid=9f33511f705310b003ae392e8fb3f1e7&utm_source=bing&utm_medium=cpc&utm_campaign=Paid%20Search%20-%20Bing%20-%20Europe%20-%20Brand%20-%20Italian&utm_term=shopify&utm_content=Brand%20-%20Shopify', '_blank');
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

  return (
    <>
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
                    placeholder="Ex: your-store.myshopify.com or https://admin.shopify.com/store/your-store"
                    value={formData.shopifyUrl}
                    onChange={(e) => handleStoreUrlChange(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your Shopify admin URL or just the store domain
                  </p>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold"
              onClick={handleCreateAccount}
            >
              Create Account
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Don't forget!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-gray-700 mb-6">
              <strong className="text-red-600">NOTE:</strong> You must return to this tab after you create your Shopify account and paste your website URL in the box below.
            </p>
            <Button onClick={handleConfirmRedirect} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Yes I understand!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShopifySetupStep;

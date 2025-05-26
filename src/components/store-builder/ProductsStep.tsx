
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { addProductsToShopify } from "@/services/productService";

interface ProductsStepProps {
  formData: {
    productsAdded: boolean;
    shopifyUrl: string;
    accessToken: string;
    niche: string;
  };
  handleInputChange: (field: string, value: boolean) => void;
}

const ProductsStep = ({ formData, handleInputChange }: ProductsStepProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProduct, setCurrentProduct] = useState("");
  const { toast } = useToast();

  const handleAddProducts = async () => {
    if (!formData.shopifyUrl || !formData.accessToken) {
      toast({
        title: "Missing Information",
        description: "Please complete the previous steps first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setCurrentProduct("");

    try {
      console.log('Starting product generation for store:', formData.shopifyUrl);
      console.log('Niche:', formData.niche);
      console.log('Access token provided:', !!formData.accessToken);
      
      // Use the productService to add products to Shopify
      const success = await addProductsToShopify(
        formData.shopifyUrl,
        formData.accessToken,
        formData.niche || 'general',
        (progressValue: number, productName: string) => {
          setProgress(progressValue);
          setCurrentProduct(productName);
        }
      );

      if (success) {
        handleInputChange('productsAdded', true);
        toast({
          title: "Success!",
          description: `20 winning ${formData.niche || 'general'} products have been added to your Shopify store.`,
        });
      } else {
        throw new Error('Failed to add products to Shopify store');
      }
      
    } catch (error) {
      console.error('Product addition error:', error);
      toast({
        title: "Error",
        description: "Failed to add products to your Shopify store. Please check your access token and try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardContent className="py-6 px-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Products</h2>
          <p className="text-gray-600 text-sm">
            We'll add 20 winning {formData.niche ? `${formData.niche} ` : ''}products to your Shopify store
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-700 mb-2 text-sm">
              Our system will automatically add 20 carefully selected winning products 
              {formData.niche ? ` in the ${formData.niche} niche ` : ' '}
              directly to your Shopify store. Each product includes:
            </p>
            
            <ul className="space-y-1 text-gray-700 mb-3 text-xs">
              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5" />
                High-quality product descriptions
              </li>
              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5" />
                Optimized titles for your niche
              </li>
              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5" />
                Competitive pricing strategies
              </li>
              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5" />
                Ready for immediate sale
              </li>
            </ul>

            {isLoading && (
              <div className="space-y-2 mb-3">
                <div className="text-center">
                  <p className="text-blue-600 font-semibold mb-1 text-sm">Adding products to your Shopify store...</p>
                  <p className="text-xs text-gray-600">Currently adding: {currentProduct}</p>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-gray-500 text-center">
                  {Math.round(progress)}% Complete
                </p>
              </div>
            )}

            {formData.productsAdded && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-2 mb-3">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <p className="text-green-800 font-medium text-sm">
                    Successfully added 20 winning {formData.niche || 'general'} products to your Shopify store!
                  </p>
                </div>
              </div>
            )}
          </div>

          {!formData.productsAdded && (
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm font-semibold"
              onClick={handleAddProducts}
              disabled={isLoading}
            >
              {isLoading ? "Adding Products to Shopify..." : "Add Winning Products to Store"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductsStep;

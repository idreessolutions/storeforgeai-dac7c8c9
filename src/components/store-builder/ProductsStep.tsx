import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, PackagePlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addProductsToShopify } from "@/services/productService";

interface ProductsStepProps {
  formData: {
    productsAdded: boolean;
    shopifyUrl: string;
    accessToken: string;
    niche: string;
    themeColor: string;
  };
  handleInputChange: (field: string, value: boolean) => void;
}

const ProductsStep = ({ formData, handleInputChange }: ProductsStepProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProduct, setCurrentProduct] = useState("");
  const { toast } = useToast();

  const handleAddProducts = async () => {
    if (!formData.shopifyUrl || !formData.accessToken || !formData.niche) {
      toast({
        title: "Missing Information",
        description: "Please ensure you have entered your Shopify URL, access token, and niche.",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    setProgress(0);
    setCurrentProduct("");

    try {
      console.log('Starting product addition with theme color:', formData.themeColor);
      
      // Pass theme color to the product addition function
      await addProductsToShopify(
        formData.shopifyUrl,
        formData.accessToken,
        formData.niche,
        (progress: number, productName: string) => {
          setProgress(progress);
          setCurrentProduct(productName);
        },
        formData.themeColor || '#1E40AF' // Use selected theme color
      );

      handleInputChange('productsAdded', true);
      
      toast({
        title: "Products Added Successfully! 🎉",
        description: `10 winning ${formData.niche} products have been added to your Shopify store with your selected theme color.`,
      });

    } catch (error) {
      console.error('Error adding products:', error);
      toast({
        title: "Failed to Add Products",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
      setProgress(0);
      setCurrentProduct("");
    }
  };

  return (
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardContent className="py-12 px-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <PackagePlus className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Add Winning Products</h2>
          <p className="text-gray-600">
            Let our AI add 10 high-converting products to your store.
          </p>
        </div>

        {formData.productsAdded ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Products Added Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Your store is now stocked with 10 winning products.
            </p>
            <Button disabled className="bg-green-600 hover:bg-green-700 text-white">
              Products Added <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div>
            {isAdding && (
              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Adding products to your store...
                </p>
                <Progress value={progress} />
                <p className="text-sm text-gray-500 mt-2">
                  {currentProduct} - {progress.toFixed(1)}%
                </p>
              </div>
            )}
            <Button
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-3"
              onClick={handleAddProducts}
              disabled={isAdding}
            >
              {isAdding ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding Products...
                </div>
              ) : (
                "Add 10 Winning Products"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsStep;

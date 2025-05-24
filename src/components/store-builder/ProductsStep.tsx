
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProductsStepProps {
  formData: {
    productsAdded: boolean;
  };
  handleInputChange: (field: string, value: boolean) => void;
}

const ProductsStep = ({ formData, handleInputChange }: ProductsStepProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProduct, setCurrentProduct] = useState("");

  const winningProducts = [
    "Smart Watch Pro",
    "Wireless Earbuds Elite",
    "Portable Phone Charger",
    "LED Strip Lights",
    "Bluetooth Speaker",
    "Fitness Tracker",
    "Phone Camera Lens Kit",
    "Car Phone Mount",
    "Wireless Charging Pad",
    "Bluetooth Headphones",
    "Portable Power Bank",
    "Smart Ring",
    "Air Purifier Mini",
    "Phone Screen Protector",
    "Cable Organizer",
    "Laptop Stand",
    "Gaming Mouse Pad",
    "USB-C Hub",
    "Wireless Mouse",
    "Phone Case Collection"
  ];

  const handleAddProducts = async () => {
    setIsLoading(true);
    setProgress(0);

    for (let i = 0; i < winningProducts.length; i++) {
      setCurrentProduct(winningProducts[i]);
      setProgress(((i + 1) / winningProducts.length) * 100);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    handleInputChange('productsAdded', true);
    setIsLoading(false);
    setCurrentProduct("");
  };

  return (
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardContent className="py-12 px-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Products</h2>
          <p className="text-gray-600">We'll add 20 winning products to your store</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-700 mb-4">
              Our AI will automatically add 20 carefully selected winning products to your store. Each product includes:
            </p>
            
            <ul className="space-y-2 text-gray-700 mb-6">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                High-quality product images and thumbnails
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                Optimized product descriptions
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                Competitive pricing strategies
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                SEO-optimized titles and tags
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                Product variants and options
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                Inventory management setup
              </li>
            </ul>

            {isLoading && (
              <div className="space-y-4 mb-6">
                <div className="text-center">
                  <p className="text-blue-600 font-semibold mb-2">Adding products to your store...</p>
                  <p className="text-sm text-gray-600">Currently adding: {currentProduct}</p>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-gray-500 text-center">
                  {Math.round(progress)}% Complete
                </p>
              </div>
            )}

            {formData.productsAdded && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-green-800 font-medium">
                    Successfully added 20 winning products to your store!
                  </p>
                </div>
              </div>
            )}
          </div>

          {!formData.productsAdded && (
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
              onClick={handleAddProducts}
              disabled={isLoading}
            >
              {isLoading ? "Adding Products..." : "Add Winning Products"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductsStep;

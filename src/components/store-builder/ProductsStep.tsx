
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, PackagePlus, Loader2, Sparkles } from "lucide-react";
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
      console.log('🚀 Starting 10 unique winning products addition with theme color:', formData.themeColor);
      
      await addProductsToShopify(
        formData.shopifyUrl,
        formData.accessToken,
        formData.niche,
        (progress: number, productName: string) => {
          setProgress(progress);
          setCurrentProduct(productName);
        },
        formData.themeColor || '#1E40AF'
      );

      handleInputChange('productsAdded', true);
      
      toast({
        title: "10 Unique Winning Products Added Successfully! 🎉",
        description: `Your store now features 10 completely different, high-converting ${formData.niche} products with premium images, detailed descriptions, and your custom theme styling.`,
      });

    } catch (error) {
      console.error('Error adding products:', error);
      toast({
        title: "Failed to Add Products",
        description: error instanceof Error ? error.message : "An unknown error occurred. Please try again.",
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
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ 
              background: `linear-gradient(135deg, ${formData.themeColor || '#1E40AF'}, ${formData.themeColor || '#1E40AF'}aa)` 
            }}
          >
            <PackagePlus className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Add 10 Unique Winning Products</h2>
          <p className="text-gray-600">
            Let our AI add 10 completely different, high-converting winning products to your store with premium images and your custom theme styling.
          </p>
        </div>

        {formData.productsAdded ? (
          <div className="text-center">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ 
                background: `linear-gradient(135deg, #10B981, #059669)` 
              }}
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              10 Unique Winning Products Added Successfully!
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </h3>
            <p className="text-gray-600 mb-4">
              Your store is now fully stocked with 10 completely different premium winning products, each featuring:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                10 completely unique product types
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Detailed 400-600 word descriptions
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                6-10 unique high-quality images each
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Your custom theme color styling
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                SEO-optimized titles and tags
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Realistic pricing and variants
              </div>
            </div>
            <Button 
              disabled 
              className="w-full"
              style={{ 
                backgroundColor: '#10B981',
                color: 'white'
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              10 Unique Winning Products Successfully Added
            </Button>
          </div>
        ) : (
          <div>
            {isAdding && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-700">
                    Adding unique winning products to your store...
                  </p>
                  <span 
                    className="text-sm font-semibold"
                    style={{ color: formData.themeColor || '#1E40AF' }}
                  >
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-3"
                  style={{ 
                    '--progress-background': formData.themeColor || '#1E40AF' 
                  } as React.CSSProperties}
                />
                {currentProduct && (
                  <p className="text-sm text-gray-500 mt-2 truncate">
                    <span className="font-medium">Currently adding:</span> {currentProduct}
                  </p>
                )}
              </div>
            )}
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4" style={{ borderColor: formData.themeColor || '#1E40AF' }}>
              <h4 className="font-semibold text-gray-800 mb-2">What you'll get:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 10 completely different winning products in your niche</li>
                <li>• Each product is unique - no duplicates or variations</li>
                <li>• Professional 400-600 word product descriptions</li>
                <li>• 6-10 unique high-quality images per product</li>
                <li>• SEO-optimized titles, tags, and metadata</li>
                <li>• Custom styling with your selected theme color</li>
                <li>• Realistic pricing with proper profit margins</li>
              </ul>
            </div>
            
            <Button
              className="w-full font-semibold py-4 text-lg"
              onClick={handleAddProducts}
              disabled={isAdding}
              style={{ 
                backgroundColor: formData.themeColor || '#1E40AF',
                color: 'white'
              }}
            >
              {isAdding ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Adding 10 Unique Winning Products...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Add 10 Unique Winning Products Now
                  <Sparkles className="h-5 w-5 ml-2" />
                </div>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsStep;


import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, PackagePlus, Loader2, Sparkles, Target, ImageIcon, DollarSign, Tag } from "lucide-react";
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
      console.log('🚀 Starting 10 real winning products addition for niche:', formData.niche);
      console.log('🎨 Using theme color:', formData.themeColor);
      
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
        title: "10 Real Winning Products Added Successfully! 🎉",
        description: `Your ${formData.niche} store now features 10 unique, trending, high-converting products with premium media, detailed descriptions, and your custom theme styling.`,
      });

    } catch (error) {
      console.error('Error adding real winning products:', error);
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
    <Card className="border-0 shadow-lg max-w-3xl mx-auto">
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Add 10 Real Winning Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Add 10 unique, trending, high-converting <strong>{formData.niche}</strong> products to your store with premium media, detailed descriptions, and your custom theme styling.
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
              10 Real Winning {formData.niche} Products Added!
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Your store is now fully stocked with 10 unique, trending winning products specifically curated for the <strong>{formData.niche}</strong> niche, each featuring:
            </p>
            
            {/* Success Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-green-800">Niche-Specific</div>
                <div className="text-xs text-green-600">All {formData.niche} products</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <ImageIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-blue-800">Premium Media</div>
                <div className="text-xs text-blue-600">6-8 unique images each</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-purple-800">Optimized Pricing</div>
                <div className="text-xs text-purple-600">$15-80 range</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <Tag className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-orange-800">Themed Styling</div>
                <div className="text-xs text-orange-600">Your color applied</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                10 unique {formData.niche} product types
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Professional 400-500 word descriptions
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                6-8 unique high-quality images each
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Custom theme color styling applied
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                SEO-optimized titles and {formData.niche} tags
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Realistic pricing ($15-80 range)
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Proper variants and category assignment
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Trending {formData.niche} products selected
              </div>
            </div>
            
            <Button 
              disabled 
              className="w-full max-w-md"
              style={{ 
                backgroundColor: '#10B981',
                color: 'white'
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              10 Real {formData.niche} Products Successfully Added
            </Button>
          </div>
        ) : (
          <div>
            {isAdding && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-700">
                    Adding real {formData.niche} winning products to your store...
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
            
            {/* Product Quality Guarantees */}
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border-l-4" style={{ borderColor: formData.themeColor || '#1E40AF' }}>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5" style={{ color: formData.themeColor || '#1E40AF' }} />
                What you'll get for {formData.niche}:
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>10 unique {formData.niche} products (no duplicates)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ImageIcon className="h-4 w-4 mt-0.5 text-blue-600" />
                    <span>6-8 unique high-quality images per product</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold text-sm mt-0.5">✍️</span>
                    <span>Professional 400-500 word descriptions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>Realistic pricing between $15-80</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold text-sm mt-0.5">🎨</span>
                    <span>Custom styling with your theme color</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 mt-0.5 text-indigo-600" />
                    <span>SEO-optimized titles and {formData.niche} tags</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold text-sm mt-0.5">🔥</span>
                    <span>Trending products currently selling well</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold text-sm mt-0.5">⭐</span>
                    <span>Proper variants and category assignment</span>
                  </div>
                </div>
              </div>
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
                  Adding 10 Real {formData.niche} Products...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Add 10 Real {formData.niche} Winning Products Now
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

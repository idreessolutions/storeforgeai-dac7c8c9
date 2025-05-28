
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Check, AlertCircle, Loader2, Palette } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { addProductsToShopify, applyThemeColor } from "@/services/productService";

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
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProduct, setCurrentProduct] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isApplyingTheme, setIsApplyingTheme] = useState(false);
  const { toast } = useToast();

  const handleAddProducts = async () => {
    // Comprehensive validation
    if (!formData.shopifyUrl || !formData.accessToken || !formData.niche) {
      toast({
        title: "Missing Information",
        description: "Please complete all previous steps: store URL, access token, and niche selection.",
        variant: "destructive",
      });
      return;
    }

    // Validate access token format
    if (!formData.accessToken.startsWith('shpat_')) {
      toast({
        title: "Invalid Access Token",
        description: "Access token must start with 'shpat_'. Please check your token and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setCurrentProduct("");
    setErrorMessage("");

    try {
      console.log('=== STARTING PRODUCT ADDITION PROCESS ===');
      console.log('Store URL:', formData.shopifyUrl);
      console.log('Niche:', formData.niche);
      console.log('Theme Color:', formData.themeColor);
      console.log('Access token format check:', formData.accessToken.startsWith('shpat_'));
      
      // Step 1: Add 10 winning products to Shopify
      const success = await addProductsToShopify(
        formData.shopifyUrl,
        formData.accessToken,
        formData.niche,
        (progressValue: number, productName: string) => {
          console.log(`Progress: ${progressValue}% - Adding: ${productName}`);
          setProgress(progressValue * 0.8); // 80% for product addition
          setCurrentProduct(productName);
        }
      );

      if (success) {
        console.log('=== PRODUCTS ADDED SUCCESSFULLY ===');
        setProgress(80);
        setCurrentProduct("Applying theme color...");
        setIsApplyingTheme(true);
        
        // Step 2: Apply theme color to store
        const themeSuccess = await applyThemeColor(
          formData.shopifyUrl,
          formData.accessToken,
          formData.themeColor
        );
        
        setProgress(90);
        
        if (themeSuccess) {
          console.log('=== THEME COLOR APPLIED SUCCESSFULLY ===');
        } else {
          console.warn('Theme color application failed, but products were added successfully');
        }
        
        // Mark as complete
        handleInputChange('productsAdded', true);
        setErrorMessage("");
        
        toast({
          title: "Success! 🎉",
          description: `10 winning ${formData.niche} products have been successfully added to your Shopify store${themeSuccess ? ' with your selected theme color applied' : ''}!`,
        });
        
        // Final progress update
        setProgress(100);
        setCurrentProduct("All products added and store customized successfully!");
      }
      
    } catch (error) {
      console.error('=== PRODUCT ADDITION FAILED ===');
      console.error('Error details:', error);
      
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrorMessage(errorMsg);
      
      // More specific error handling
      let toastDescription = `Failed to add products: ${errorMsg}`;
      
      if (errorMsg.includes('401') || errorMsg.includes('403') || errorMsg.includes('Unauthorized')) {
        toastDescription = "Authentication failed. Please verify your access token has 'write_products' permission and is correctly configured.";
      } else if (errorMsg.includes('Invalid Shopify URL')) {
        toastDescription = "Invalid store URL format. Please check your Shopify store URL.";
      } else if (errorMsg.includes('Missing required parameters')) {
        toastDescription = "Please ensure all store information is properly configured before adding products.";
      } else if (errorMsg.includes('NetworkError') || errorMsg.includes('fetch')) {
        toastDescription = "Connection error. Please check your internet connection and try again.";
      }
      
      toast({
        title: "Error Adding Products",
        description: toastDescription,
        variant: "destructive",
      });
      
      // Reset progress on error
      setProgress(0);
      setCurrentProduct("");
    } finally {
      setIsLoading(false);
      setIsApplyingTheme(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardContent className="py-6 px-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Add Products</h2>
          <p className="text-gray-600 text-sm">
            Add 10 winning {formData.niche ? `${formData.niche} ` : ''}products to your Shopify store
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-3 text-sm">
              Our AI system will automatically add 10 carefully selected winning products 
              {formData.niche ? ` in the ${formData.niche} niche ` : ' '}
              directly to your Shopify store. Each product includes:
            </p>
            
            <ul className="space-y-2 text-gray-700 mb-4 text-xs">
              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                AI-generated high-converting product descriptions
              </li>
              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                SEO-optimized titles for better search visibility
              </li>
              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Professional product images from curated sources
              </li>
              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Competitive pricing strategies based on market research
              </li>
              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Multiple product variants and professional SKU management
              </li>
              <li className="flex items-start">
                <Palette className="h-3 w-3 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                Your selected theme color will be applied to your store
              </li>
            </ul>

            {isLoading && (
              <div className="space-y-3 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
                    <p className="text-blue-700 font-semibold text-sm">
                      {isApplyingTheme ? 'Customizing your store theme...' : 'Adding winning products to your Shopify store...'}
                    </p>
                  </div>
                  {currentProduct && (
                    <p className="text-xs text-blue-600 mb-2">
                      {isApplyingTheme ? 'Applying your selected theme color' : `Currently processing: ${currentProduct}`}
                    </p>
                  )}
                </div>
                <Progress value={progress} className="w-full h-2" />
                <p className="text-xs text-blue-600 text-center font-medium">
                  {Math.round(progress)}% Complete ({isApplyingTheme ? 'Customizing theme' : `${Math.floor(progress / 10)} of 10 products`})
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-800 font-medium text-sm mb-1">Product Addition Failed</p>
                    <p className="text-red-700 text-xs leading-relaxed">{errorMessage}</p>
                    <p className="text-red-600 text-xs mt-2 italic">
                      Please try again or contact support if the issue persists.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {formData.productsAdded && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 font-medium text-sm">
                      Successfully added 10 winning {formData.niche || 'general'} products!
                    </p>
                    <p className="text-green-700 text-xs mt-1">
                      Your products are now live with your selected theme color applied.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!formData.productsAdded && (
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 text-sm font-semibold transition-colors duration-200"
              onClick={handleAddProducts}
              disabled={isLoading || !formData.shopifyUrl || !formData.accessToken || !formData.niche}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isApplyingTheme ? 'Customizing Store...' : `Adding Products... (${Math.floor(progress / 10)}/10)`}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Package className="h-4 w-4 mr-2" />
                  Add 10 Winning Products + Apply Theme
                </div>
              )}
            </Button>
          )}
          
          {!formData.shopifyUrl || !formData.accessToken || !formData.niche ? (
            <p className="text-center text-xs text-gray-500 mt-2">
              Complete all previous steps to enable product addition
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductsStep;

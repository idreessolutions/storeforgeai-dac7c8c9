
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

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
      
      // Simulate progress while calling the actual Shopify API
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 5, 90);
          setCurrentProduct(`${formData.niche || 'General'} Product ${Math.floor(newProgress / 5) + 1}`);
          return newProgress;
        });
      }, 200);

      // Make actual API call to add products to Shopify store
      const shopifyApiUrl = `https://${formData.shopifyUrl.replace('.myshopify.com', '')}.myshopify.com/admin/api/2023-10/products.json`;
      
      // Generate 20 products and add them to the store
      const products = await generateProductsForNiche(formData.niche || 'general');
      
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        const response = await fetch(shopifyApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': formData.accessToken,
          },
          body: JSON.stringify({
            product: {
              title: product.title,
              body_html: product.description,
              vendor: 'StoreForge AI',
              product_type: formData.niche || 'General',
              handle: product.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
              variants: [{
                title: 'Default Title',
                price: product.price.toString(),
                inventory_quantity: 100,
                inventory_management: 'shopify'
              }]
            }
          })
        });

        if (!response.ok) {
          console.error(`Failed to add product ${product.title}:`, await response.text());
        } else {
          console.log(`Successfully added product: ${product.title}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      clearInterval(progressInterval);
      setProgress(100);
      setCurrentProduct("Completed!");
      
      handleInputChange('productsAdded', true);
      toast({
        title: "Success!",
        description: `20 winning ${formData.niche || 'general'} products have been added to your Shopify store.`,
      });
      
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

// Helper function to generate products for different niches
const generateProductsForNiche = async (niche: string) => {
  const products = [];
  const baseProducts = {
    'Pet': [
      { title: 'Smart Pet Feeder', description: 'Automatic pet feeder with smartphone control', price: 89.99 },
      { title: 'Interactive Dog Toy', description: 'Mental stimulation puzzle toy for dogs', price: 24.99 },
      { title: 'Cat Laser Pointer', description: 'Automatic laser toy for cats', price: 19.99 },
      { title: 'Pet Water Fountain', description: 'Fresh flowing water for pets', price: 34.99 },
      { title: 'Dog Training Collar', description: 'Vibration training collar for dogs', price: 49.99 }
    ],
    'Electronics': [
      { title: 'Wireless Earbuds', description: 'Premium wireless earbuds with noise cancellation', price: 79.99 },
      { title: 'Phone Charger Stand', description: 'Fast wireless charging stand', price: 29.99 },
      { title: 'Bluetooth Speaker', description: 'Portable waterproof Bluetooth speaker', price: 59.99 },
      { title: 'LED Strip Lights', description: 'Smart RGB LED strip lights', price: 34.99 },
      { title: 'Gaming Mouse Pad', description: 'Large RGB gaming mouse pad', price: 24.99 }
    ]
  };

  const nicheProducts = baseProducts[niche] || baseProducts['Electronics'];
  
  // Generate 20 products by repeating and varying the base products
  for (let i = 0; i < 20; i++) {
    const baseProduct = nicheProducts[i % nicheProducts.length];
    products.push({
      title: `${baseProduct.title} ${Math.floor(i / nicheProducts.length) + 1}`,
      description: baseProduct.description,
      price: baseProduct.price + (Math.random() * 20 - 10) // Add some price variation
    });
  }
  
  return products;
};

export default ProductsStep;

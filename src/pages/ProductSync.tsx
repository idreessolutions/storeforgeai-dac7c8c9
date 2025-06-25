
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ProductPreview from "@/components/ProductPreview";
import { ProductSyncService, SyncedProduct, ProductSyncConfig } from "@/services/productSyncService";
import { Search, Link, Settings, Loader2 } from "lucide-react";

const ProductSync = () => {
  const [productUrl, setProductUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [syncedProduct, setSyncedProduct] = useState<SyncedProduct | null>(null);
  const [syncService, setSyncService] = useState<ProductSyncService | null>(null);

  // Mock config - in real app this would come from user settings
  const defaultConfig: ProductSyncConfig = {
    shopifyUrl: 'https://your-store.myshopify.com',
    shopifyAccessToken: 'your-access-token',
    aliexpressCredentials: {
      appKey: 'your-app-key',
      appSecret: 'your-app-secret',
      accessToken: 'stored-oauth-token'
    },
    storeConfig: {
      storeName: 'My Store',
      themeColor: '#3B82F6',
      targetAudience: 'Everyone',
      businessType: 'e-commerce',
      storeStyle: 'modern',
      niche: 'general'
    }
  };

  const extractProductId = (url: string): string | null => {
    // Extract product ID from AliExpress URL
    const match = url.match(/\/item\/(\d+)\.html/);
    return match ? match[1] : null;
  };

  const handleFetchAndEnhance = async () => {
    if (!productUrl.trim()) {
      toast.error('Please enter an AliExpress product URL');
      return;
    }

    const productId = extractProductId(productUrl);
    if (!productId) {
      toast.error('Invalid AliExpress product URL');
      return;
    }

    setIsLoading(true);
    setSyncedProduct(null);

    try {
      const service = new ProductSyncService(defaultConfig);
      setSyncService(service);

      toast.info('Fetching product from AliExpress...');
      const result = await service.fetchAndEnhanceProduct(productId);
      
      setSyncedProduct(result);
      toast.success('Product fetched and enhanced successfully!');
    } catch (error) {
      console.error('Failed to fetch and enhance product:', error);
      toast.error(`Failed to fetch product: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishToShopify = async () => {
    if (!syncedProduct || !syncService) {
      toast.error('No product to publish');
      return;
    }

    setIsPublishing(true);

    try {
      toast.info('Uploading product to Shopify...');
      const result = await syncService.uploadToShopify(syncedProduct);
      
      setSyncedProduct(result);
      
      if (result.status === 'uploaded') {
        toast.success('Product published to Shopify successfully!');
      } else {
        toast.error(`Failed to publish: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to publish product:', error);
      toast.error(`Failed to publish product: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Link className="h-6 w-6" />
              AliExpress to Shopify Product Sync
            </CardTitle>
            <p className="text-gray-600">
              Import products from AliExpress, enhance them with AI, and publish to your Shopify store
            </p>
          </CardHeader>
        </Card>

        {/* Product URL Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Step 1: Enter AliExpress Product URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productUrl">AliExpress Product URL</Label>
              <Input
                id="productUrl"
                placeholder="https://www.aliexpress.com/item/1234567890.html"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500">
                Paste the full AliExpress product URL here
              </p>
            </div>
            
            <Button 
              onClick={handleFetchAndEnhance}
              disabled={isLoading || !productUrl.trim()}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching & Enhancing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Fetch & Enhance Product
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Configuration Note */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">Configuration Required</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  Make sure you have configured your AliExpress OAuth credentials and Shopify store settings 
                  before using this feature. The OAuth callback URL should be set to handle token storage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Preview */}
        {syncedProduct && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 2: Review & Publish</h2>
            <ProductPreview
              syncedProduct={syncedProduct}
              onPublish={handlePublishToShopify}
              isPublishing={isPublishing}
              themeColor={defaultConfig.storeConfig.themeColor}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSync;

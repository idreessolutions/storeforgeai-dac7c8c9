
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SyncedProduct } from "@/services/productSyncService";
import { Loader2, Upload, Eye, DollarSign, Package, Image as ImageIcon, Palette } from "lucide-react";

interface ProductPreviewProps {
  syncedProduct: SyncedProduct;
  onPublish: () => void;
  isPublishing: boolean;
  themeColor?: string;
}

const ProductPreview = ({ syncedProduct, onPublish, isPublishing, themeColor = "#3B82F6" }: ProductPreviewProps) => {
  const { aliexpressProduct, enhancedContent } = syncedProduct;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Product Preview
          </CardTitle>
          <Badge 
            variant={syncedProduct.status === 'enhanced' ? 'default' : 
                    syncedProduct.status === 'uploaded' ? 'secondary' : 'destructive'}
          >
            {syncedProduct.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Enhanced Title */}
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: themeColor }}>
            {enhancedContent.title}
          </h2>
          <p className="text-sm text-gray-500">
            Original: {aliexpressProduct.title.substring(0, 80)}...
          </p>
        </div>

        {/* Price and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold">Price Range</span>
              </div>
              <p className="text-lg font-bold">
                ${aliexpressProduct.price.min} - ${aliexpressProduct.price.max}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">Variants</span>
              </div>
              <p className="text-lg font-bold">{aliexpressProduct.variants.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-purple-600" />
                <span className="font-semibold">Images</span>
              </div>
              <p className="text-lg font-bold">
                {Object.keys(aliexpressProduct.images.skuImages).length + (aliexpressProduct.images.main ? 1 : 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enhanced Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: enhancedContent.description }}
                />
                
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {enhancedContent.features.map((feature, index) => (
                      <Badge key={index} variant="outline">{feature}</Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {enhancedContent.tags.map((tag, index) => (
                      <Badge key={index} style={{ backgroundColor: themeColor, color: 'white' }}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="images" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {aliexpressProduct.images.main && (
                    <div className="space-y-2">
                      <img 
                        src={aliexpressProduct.images.main} 
                        alt="Main product image"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <p className="text-xs text-center text-gray-500">Main Image</p>
                    </div>
                  )}
                  
                  {Object.entries(aliexpressProduct.images.skuImages).map(([skuId, images]) => 
                    images.map((image, index) => (
                      <div key={`${skuId}-${index}`} className="space-y-2">
                        <img 
                          src={image} 
                          alt={`Variant image ${skuId}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <p className="text-xs text-center text-gray-500">SKU: {skuId}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="variants" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aliexpressProduct.variants.map((variant, index) => (
                    <div key={variant.skuId} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">Variant {index + 1}</p>
                          <p className="text-sm text-gray-600">SKU: {variant.skuId}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(variant.properties).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${variant.price}</p>
                          <p className="text-sm text-gray-500">{variant.inventory} in stock</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="properties" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SKU Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aliexpressProduct.skuPropertyList.map((property) => (
                    <div key={property.skuPropertyId} className="border rounded-lg p-3">
                      <h4 className="font-semibold mb-2">{property.skuPropertyName}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {property.skuPropertyValues.map((value) => (
                          <div key={value.propertyValueId} className="text-center">
                            {value.skuPropertyImagePath && (
                              <img 
                                src={value.skuPropertyImagePath} 
                                alt={value.propertyValueName}
                                className="w-16 h-16 object-cover rounded mx-auto mb-1"
                              />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {value.propertyValueName}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Publish Button */}
        <div className="flex justify-center pt-6">
          <Button 
            onClick={onPublish}
            disabled={isPublishing || syncedProduct.status === 'uploaded'}
            size="lg"
            className="px-8"
            style={{ backgroundColor: themeColor }}
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : syncedProduct.status === 'uploaded' ? (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Published to Shopify
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Publish to Shopify
              </>
            )}
          </Button>
        </div>

        {syncedProduct.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              <strong>Error:</strong> {syncedProduct.error}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductPreview;

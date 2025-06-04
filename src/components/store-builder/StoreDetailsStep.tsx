
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData } from "./StoreBuilderLogic";
import { Store, Target, Building, Palette, Info } from "lucide-react";

interface StoreDetailsStepProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
}

const StoreDetailsStep = ({ formData, onInputChange }: StoreDetailsStepProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Store className="h-16 w-16 text-blue-600 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900">Store Details</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tell us about your store so we can generate the perfect products and design for your niche and target audience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Basic Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                placeholder="e.g., Premium Pet Paradise"
                value={formData.storeName}
                onChange={(e) => onInputChange('storeName', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="niche">Store Niche *</Label>
              <Input
                id="niche"
                placeholder="e.g., Pet Products, Fitness, Beauty, Tech, Kitchen, etc."
                value={formData.niche}
                onChange={(e) => onInputChange('niche', e.target.value)}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                This will determine the 10 winning products we generate for your store
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Target Audience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Target Audience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="targetAudience">Who are you selling to? *</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., Dog owners, Fitness enthusiasts, Busy moms, Tech lovers"
                value={formData.targetAudience}
                onChange={(e) => onInputChange('targetAudience', e.target.value)}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Products and images will be tailored for this specific audience
              </p>
            </div>

            <div>
              <Label htmlFor="businessType">Business Type</Label>
              <Select value={formData.businessType} onValueChange={(value) => onInputChange('businessType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="e-commerce">E-commerce Store</SelectItem>
                  <SelectItem value="dropshipping">Dropshipping</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="subscription">Subscription Box</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Store Style & Design */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Store Style & Design
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="storeStyle">Store Style Preference</Label>
              <Select value={formData.storeStyle} onValueChange={(value) => onInputChange('storeStyle', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select store style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern & Minimalist</SelectItem>
                  <SelectItem value="luxury">Luxury & Premium</SelectItem>
                  <SelectItem value="fun">Fun & Colorful</SelectItem>
                  <SelectItem value="professional">Professional & Corporate</SelectItem>
                  <SelectItem value="rustic">Rustic & Natural</SelectItem>
                  <SelectItem value="trendy">Trendy & Hip</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                This affects product images, descriptions, and overall store design
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Additional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customInfo">Custom Information (Optional)</Label>
              <Textarea
                id="customInfo"
                placeholder="Any specific requirements, preferences, or additional context about your store, products, or target market..."
                value={formData.customInfo}
                onChange={(e) => onInputChange('customInfo', e.target.value)}
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-1">
                This information will be used to customize your products and store design
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Preview */}
      <Card className="max-w-4xl mx-auto bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Store Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-900">Niche:</span>
              <span className="ml-2 text-blue-700">{formData.niche || 'Not specified'}</span>
            </div>
            <div>
              <span className="font-medium text-blue-900">Target Audience:</span>
              <span className="ml-2 text-blue-700">{formData.targetAudience || 'Not specified'}</span>
            </div>
            <div>
              <span className="font-medium text-blue-900">Business Type:</span>
              <span className="ml-2 text-blue-700">{formData.businessType}</span>
            </div>
            <div>
              <span className="font-medium text-blue-900">Style:</span>
              <span className="ml-2 text-blue-700">{formData.storeStyle}</span>
            </div>
          </div>
          {formData.niche && formData.targetAudience && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-medium">AI will generate:</span> 10 winning {formData.niche.toLowerCase()} products 
                specifically designed for {formData.targetAudience.toLowerCase()} with {formData.storeStyle.toLowerCase()} styling
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreDetailsStep;

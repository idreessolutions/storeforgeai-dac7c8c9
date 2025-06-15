
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData } from "./StoreBuilderLogic";
import { Store, Target, Building, Palette, Info, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StoreDetailsStepProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
}

const StoreDetailsStep = ({ formData, onInputChange }: StoreDetailsStepProps) => {
  // Validation function to check if all required fields are filled
  const isFormValid = () => {
    return !!(
      formData.storeName?.trim() &&
      formData.niche?.trim() &&
      formData.targetAudience?.trim() &&
      formData.businessType &&
      formData.storeStyle
    );
  };

  const getMissingFields = () => {
    const missing = [];
    if (!formData.storeName?.trim()) missing.push("Store Name");
    if (!formData.niche?.trim()) missing.push("Store Niche");
    if (!formData.targetAudience?.trim()) missing.push("Target Audience");
    if (!formData.businessType) missing.push("Business Type");
    if (!formData.storeStyle) missing.push("Store Style");
    return missing;
  };

  const missingFields = getMissingFields();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Store className="h-16 w-16 text-blue-600 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900">Store Details</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tell us about your store so we can generate the perfect products and design for your niche and target audience.
        </p>
      </div>

      {!isFormValid() && (
        <Alert className="max-w-4xl mx-auto border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Required fields missing:</strong> {missingFields.join(", ")}
            <br />
            <span className="text-sm">Please fill in all required fields to continue to the next step.</span>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Basic Store Information */}
        <Card className={!formData.storeName?.trim() ? "border-red-200" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="storeName" className="text-sm font-medium">
                Store Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="storeName"
                placeholder="e.g., Premium Pet Paradise, FitLife Pro, TechGenius Store"
                value={formData.storeName}
                onChange={(e) => onInputChange('storeName', e.target.value)}
                required
                className={!formData.storeName?.trim() ? "border-red-300 focus:border-red-500" : ""}
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be used to personalize your store theme and branding
              </p>
            </div>
            
            <div>
              <Label htmlFor="niche" className="text-sm font-medium">
                Store Niche <span className="text-red-500">*</span>
              </Label>
              <Input
                id="niche"
                placeholder="e.g., Pet Products, Fitness Equipment, Beauty & Skincare, Tech Gadgets, Kitchen Tools"
                value={formData.niche}
                onChange={(e) => onInputChange('niche', e.target.value)}
                required
                className={!formData.niche?.trim() ? "border-red-300 focus:border-red-500" : ""}
              />
              <p className="text-xs text-red-600 mt-1 font-medium">
                This determines the 10 winning products we generate - be specific!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Target Audience */}
        <Card className={!formData.targetAudience?.trim() ? "border-red-200" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Target Audience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="targetAudience" className="text-sm font-medium">
                Who are you selling to? <span className="text-red-500">*</span>
              </Label>
              <Input
                id="targetAudience"
                placeholder="e.g., Dog owners aged 25-45, Fitness enthusiasts, Busy working moms, Tech-savvy millennials"
                value={formData.targetAudience}
                onChange={(e) => onInputChange('targetAudience', e.target.value)}
                required
                className={!formData.targetAudience?.trim() ? "border-red-300 focus:border-red-500" : ""}
              />
              <p className="text-xs text-red-600 mt-1 font-medium">
                Products, images, and descriptions will be tailored for this specific audience
              </p>
            </div>

            <div>
              <Label htmlFor="businessType" className="text-sm font-medium">
                Business Type <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.businessType} 
                onValueChange={(value) => onInputChange('businessType', value)}
              >
                <SelectTrigger className={!formData.businessType ? "border-red-300" : ""}>
                  <SelectValue placeholder="Select your business model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="e-commerce">E-commerce Store</SelectItem>
                  <SelectItem value="dropshipping">Dropshipping</SelectItem>
                  <SelectItem value="retail">Retail Business</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="subscription">Subscription Box</SelectItem>
                  <SelectItem value="marketplace">Marketplace Seller</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                This affects pricing strategy and product presentation
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Store Style & Design */}
        <Card className={!formData.storeStyle ? "border-red-200" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Store Style & Design
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="storeStyle" className="text-sm font-medium">
                Store Style Preference <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.storeStyle} 
                onValueChange={(value) => onInputChange('storeStyle', value)}
              >
                <SelectTrigger className={!formData.storeStyle ? "border-red-300" : ""}>
                  <SelectValue placeholder="Choose your store's aesthetic" />
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
              <p className="text-xs text-red-600 mt-1 font-medium">
                This affects product images, descriptions, and overall store design theme
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
              <Label htmlFor="customInfo" className="text-sm font-medium">
                Custom Information (Optional)
              </Label>
              <Textarea
                id="customInfo"
                placeholder="Any specific requirements, preferences, or additional context about your store, products, target market, pricing preferences, or special features you want included..."
                value={formData.customInfo}
                onChange={(e) => onInputChange('customInfo', e.target.value)}
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                This information will be used to customize your products, pricing, and store design
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Summary Preview */}
      <Card className="max-w-4xl mx-auto bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">AI Store Configuration Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-900">Store Name:</span>
              <span className="ml-2 text-blue-700">{formData.storeName || 'Not specified'}</span>
            </div>
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
              <span className="ml-2 text-blue-700">{formData.businessType || 'Not specified'}</span>
            </div>
            <div>
              <span className="font-medium text-blue-900">Store Style:</span>
              <span className="ml-2 text-blue-700">{formData.storeStyle || 'Not specified'}</span>
            </div>
            <div>
              <span className="font-medium text-blue-900">Custom Info:</span>
              <span className="ml-2 text-blue-700">{formData.customInfo ? 'Provided' : 'None'}</span>
            </div>
          </div>
          
          {isFormValid() ? (
            <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <span className="font-medium">✅ Ready for AI Generation:</span> AI will create 10 winning {formData.niche?.toLowerCase()} products 
                specifically designed for {formData.targetAudience?.toLowerCase()} with {formData.storeStyle?.toLowerCase()} styling for your {formData.businessType} business.
              </p>
              {formData.customInfo && (
                <p className="text-xs text-green-700 mt-1">
                  Custom requirements will be incorporated into product selection and design.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                <span className="font-medium">⚠️ Incomplete Configuration:</span> Please fill in all required fields 
                to enable AI product generation for your store.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreDetailsStep;

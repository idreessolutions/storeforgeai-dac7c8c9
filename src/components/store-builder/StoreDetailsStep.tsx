
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StoreDetailsStepProps {
  formData: {
    niche: string;
    targetAudience: string;
    businessType: string;
    storeStyle: string;
    additionalInfo: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

const StoreDetailsStep = ({ formData, handleInputChange }: StoreDetailsStepProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Tell Us About Your Store</CardTitle>
        <p className="text-gray-600">Help our AI understand your vision</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="niche">Store Niche *</Label>
            <Input
              id="niche"
              placeholder="e.g., Sustainable fashion, Tech gadgets, Home decor"
              value={formData.niche}
              onChange={(e) => handleInputChange('niche', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience *</Label>
            <Input
              id="targetAudience"
              placeholder="e.g., Young professionals, Parents, Fitness enthusiasts"
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Input
              id="businessType"
              placeholder="e.g., Dropshipping, Private label, Handmade"
              value={formData.businessType}
              onChange={(e) => handleInputChange('businessType', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeStyle">Store Style Preference</Label>
            <Input
              id="storeStyle"
              placeholder="e.g., Minimalist, Bold, Luxury, Playful"
              value={formData.storeStyle}
              onChange={(e) => handleInputChange('storeStyle', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalInfo">Additional Information</Label>
          <Textarea
            id="additionalInfo"
            placeholder="Any specific requirements, preferences, or goals for your store..."
            value={formData.additionalInfo}
            onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreDetailsStep;

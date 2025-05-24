
import React from "react";
import { storeSteps } from "./StoreSteps";
import StoreDetailsStep from "./StoreDetailsStep";
import AIGenerationStep from "./AIGenerationStep";
import FutureStep from "./FutureStep";

interface StepRendererProps {
  currentStep: number;
  formData: {
    niche: string;
    targetAudience: string;
    businessType: string;
    storeStyle: string;
    additionalInfo: string;
  };
  handleInputChange: (field: string, value: string) => void;
  isGenerating: boolean;
}

const StepRenderer = ({ 
  currentStep, 
  formData, 
  handleInputChange, 
  isGenerating 
}: StepRendererProps) => {
  switch (currentStep) {
    case 1:
      return (
        <StoreDetailsStep 
          formData={formData} 
          handleInputChange={handleInputChange} 
        />
      );
    case 2:
      return (
        <AIGenerationStep 
          isGenerating={isGenerating} 
        />
      );
    default:
      return (
        <FutureStep 
          step={currentStep} 
          stepTitle={
            currentStep === 3 ? "Customize Your Branding" :
            currentStep === 4 ? "Review Your Products" :
            currentStep === 5 ? "Finalize Content" :
            "Launch Your Store"
          }
          stepDescription={
            currentStep === 3 ? "Fine-tune your brand identity" :
            currentStep === 4 ? "Review and edit AI-generated products" :
            currentStep === 5 ? "Perfect your store content" :
            "Export to Shopify and go live"
          }
          icon={storeSteps[currentStep - 1].icon}
        />
      );
  }
};

export default StepRenderer;


import React from "react";
import { storeSteps } from "./StoreSteps";
import StoreDetailsStep from "./StoreDetailsStep";
import ShopifySetupStep from "./ShopifySetupStep";
import APIConfigStep from "./APIConfigStep";
import ColorSelectionStep from "./ColorSelectionStep";
import GetStartedStep from "./GetStartedStep";
import FutureStep from "./FutureStep";

interface StepRendererProps {
  currentStep: number;
  formData: {
    niche: string;
    targetAudience: string;
    businessType: string;
    storeStyle: string;
    additionalInfo: string;
    shopifyUrl: string;
    accessToken: string;
    themeColor: string;
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
    case 0:
      return <GetStartedStep />;
    case 1:
      return (
        <StoreDetailsStep 
          formData={formData} 
          handleInputChange={handleInputChange} 
        />
      );
    case 2:
      return (
        <ShopifySetupStep 
          formData={{ shopifyUrl: formData.shopifyUrl }} 
          handleInputChange={handleInputChange} 
        />
      );
    case 3:
      return (
        <APIConfigStep 
          formData={{ accessToken: formData.accessToken }} 
          handleInputChange={handleInputChange} 
        />
      );
    case 4:
      return (
        <ColorSelectionStep 
          formData={{ themeColor: formData.themeColor }} 
          handleInputChange={handleInputChange} 
        />
      );
    default:
      return (
        <FutureStep 
          step={currentStep} 
          stepTitle={
            currentStep === 5 ? "Products" :
            currentStep === 6 ? "Content" :
            "Launch Your Store"
          }
          stepDescription={
            currentStep === 5 ? "Add and manage your products" :
            currentStep === 6 ? "Customize your content" :
            "Deploy your store to the world"
          }
          icon={storeSteps[currentStep - 1].icon}
        />
      );
  }
};

export default StepRenderer;

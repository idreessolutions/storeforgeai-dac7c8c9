
import React from "react";
import { storeSteps } from "./StoreSteps";
import StoreDetailsStep from "./StoreDetailsStep";
import ShopifySetupStep from "./ShopifySetupStep";
import APIConfigStep from "./APIConfigStep";
import ActivateTrialStep from "./ActivateTrialStep";
import ColorSelectionStep from "./ColorSelectionStep";
import ProductsStep from "./ProductsStep";
import MentorshipStep from "./MentorshipStep";
import LaunchStep from "./LaunchStep";
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
    planActivated: boolean;
    themeColor: string;
    productsAdded: boolean;
    mentorshipRequested: boolean;
    createdViaAffiliate: boolean;
  };
  handleInputChange: (field: string, value: string | boolean) => void;
  isGenerating: boolean;
  onNext: () => void;
}

const StepRenderer = ({ 
  currentStep, 
  formData, 
  handleInputChange, 
  isGenerating,
  onNext
}: StepRendererProps) => {
  switch (currentStep) {
    case 0:
      return (
        <GetStartedStep 
          onNext={onNext}
          formData={{ themeColor: formData.themeColor }}
          handleInputChange={handleInputChange}
        />
      );
    case 1:
      return (
        <StoreDetailsStep 
          formData={formData} 
          handleInputChange={handleInputChange} 
        />
      );
    case 2:
      return (
        <ColorSelectionStep 
          formData={{ themeColor: formData.themeColor }} 
          handleInputChange={handleInputChange} 
        />
      );
    case 3:
      return (
        <ShopifySetupStep 
          formData={{ 
            shopifyUrl: formData.shopifyUrl,
            createdViaAffiliate: formData.createdViaAffiliate
          }} 
          handleInputChange={handleInputChange} 
        />
      );
    case 4:
      return (
        <APIConfigStep 
          formData={{ 
            accessToken: formData.accessToken,
            shopifyUrl: formData.shopifyUrl 
          }} 
          handleInputChange={handleInputChange} 
        />
      );
    case 5:
      return (
        <ActivateTrialStep 
          formData={{ 
            shopifyUrl: formData.shopifyUrl,
            planActivated: formData.planActivated 
          }} 
          handleInputChange={handleInputChange} 
        />
      );
    case 6:
      return (
        <ProductsStep 
          formData={{ 
            productsAdded: formData.productsAdded,
            shopifyUrl: formData.shopifyUrl,
            accessToken: formData.accessToken,
            niche: formData.niche,
            themeColor: formData.themeColor
          }} 
          handleInputChange={handleInputChange} 
        />
      );
    case 7:
      return (
        <MentorshipStep 
          formData={{ mentorshipRequested: formData.mentorshipRequested }} 
          handleInputChange={handleInputChange} 
        />
      );
    case 8:
      return (
        <LaunchStep 
          formData={{ shopifyUrl: formData.shopifyUrl }} 
        />
      );
    default:
      return (
        <FutureStep 
          step={currentStep} 
          stepTitle="Coming Soon"
          stepDescription="This step will be available soon"
          icon={storeSteps[currentStep - 1]?.icon || storeSteps[0].icon}
        />
      );
  }
};

export default StepRenderer;

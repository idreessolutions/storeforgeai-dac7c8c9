
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
import { FormData } from "./StoreBuilderLogic";

interface StepRendererProps {
  currentStep: number;
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: string | boolean) => void;
  isGenerating: boolean;
  onNext: () => void;
  validateCurrentStep?: (step: number) => { isValid: boolean; missingFields: string[] };
}

const StepRenderer = ({ 
  currentStep, 
  formData, 
  handleInputChange, 
  isGenerating,
  onNext,
  validateCurrentStep
}: StepRendererProps) => {
  // CRITICAL FIX: Enforce strict 8-step limit (0-8, where 0 is Get Started)
  const maxSteps = 8;
  
  console.log(`🛠️ STEP RENDERER FIX: Processing step ${currentStep} (max: ${maxSteps})`);
  
  // CRITICAL FIX: If beyond step 8, force redirect to final step
  if (currentStep > maxSteps) {
    console.warn(`⚠️ CRITICAL: Step ${currentStep} exceeds maximum ${maxSteps}, forcing to launch step`);
    return (
      <LaunchStep 
        formData={{ shopifyUrl: formData.shopifyUrl }} 
      />
    );
  }

  switch (currentStep) {
    case 0:
      return (
        <GetStartedStep 
          onNext={onNext}
          formData={{ themeColor: formData.selectedColor }}
          handleInputChange={handleInputChange}
        />
      );
    case 1:
      return (
        <StoreDetailsStep 
          formData={formData} 
          onInputChange={handleInputChange} 
        />
      );
    case 2:
      return (
        <ColorSelectionStep 
          formData={{ themeColor: formData.selectedColor }} 
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
            themeColor: formData.selectedColor,
            targetAudience: formData.targetAudience,
            businessType: formData.businessType,
            storeStyle: formData.storeStyle,
            customInfo: formData.customInfo,
            storeName: formData.storeName
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
      // CRITICAL FIX: Fallback to Get Started for any invalid step
      console.warn(`⚠️ Invalid step ${currentStep}, redirecting to Get Started`);
      return (
        <GetStartedStep 
          onNext={onNext}
          formData={{ themeColor: formData.selectedColor }}
          handleInputChange={handleInputChange}
        />
      );
  }
};

export default StepRenderer;

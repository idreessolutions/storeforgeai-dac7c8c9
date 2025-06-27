
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
  // CRITICAL FIX: Enforce proper 9-step system (0-8, where 0 is Get Started and 8 is Launch)
  const maxSteps = 8; // Step 8 is Launch
  
  console.log(`🛠️ STEP RENDERER CRITICAL FIX: Processing step ${currentStep} (max: ${maxSteps})`);
  console.log(`📊 Available steps: Get Started (0), Store Details (1), Color (2), Shopify (3), API (4), Trial (5), Products (6), Mentorship (7), Launch (8)`);
  
  // CRITICAL FIX: Properly handle all steps including Launch (step 8)
  switch (currentStep) {
    case 0:
      console.log('🚀 Rendering: Get Started Step');
      return (
        <GetStartedStep 
          onNext={onNext}
          formData={{ themeColor: formData.selectedColor }}
          handleInputChange={handleInputChange}
        />
      );
      
    case 1:
      console.log('📝 Rendering: Store Details Step');
      return (
        <StoreDetailsStep 
          formData={formData} 
          onInputChange={handleInputChange} 
        />
      );
      
    case 2:
      console.log('🎨 Rendering: Color Selection Step');
      return (
        <ColorSelectionStep 
          formData={{ selectedColor: formData.selectedColor }} 
          handleInputChange={handleInputChange} 
        />
      );
      
    case 3:
      console.log('🛍️ Rendering: Shopify Setup Step');
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
      console.log('🔑 Rendering: API Config Step');
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
      console.log('⚡ Rendering: Activate Trial Step');
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
      console.log('📦 Rendering: Products Step');
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
      console.log('🎓 Rendering: Mentorship Step');
      return (
        <MentorshipStep 
          formData={{ mentorshipRequested: formData.mentorshipRequested }} 
          handleInputChange={handleInputChange} 
        />
      );
      
    case 8:
      console.log('🚀 CRITICAL: Rendering Launch Step (Final Step)');
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

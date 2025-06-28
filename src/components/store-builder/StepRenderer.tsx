
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
import VisionSelectionStep from "./VisionSelectionStep";
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
  // UPDATED: Now 9 steps total (0-8, with new Vision step as 0, Get Started as 1)
  const maxSteps = 8; // Step 8 is Launch
  
  console.log(`🛠️ STEP RENDERER: Processing step ${currentStep} (max: ${maxSteps})`);
  console.log(`📊 Available steps: Vision (0), Get Started (1), Store Details (2), Color (3), Shopify (4), API (5), Trial (6), Products (7), Mentorship (8), Launch (9)`);
  
  // UPDATED: Handle new Vision Selection step as step 0
  switch (currentStep) {
    case 0:
      console.log('🎯 Rendering: Vision Selection Step');
      return (
        <VisionSelectionStep 
          formData={{ 
            storeVision: formData.storeVision,
            primaryGoal: formData.primaryGoal 
          }}
          handleInputChange={handleInputChange}
          onNext={onNext}
        />
      );
      
    case 1:
      console.log('🚀 Rendering: Get Started Step');
      return (
        <GetStartedStep 
          onNext={onNext}
          formData={{ themeColor: formData.selectedColor }}
          handleInputChange={handleInputChange}
        />
      );
      
    case 2:
      console.log('📝 Rendering: Store Details Step');
      return (
        <StoreDetailsStep 
          formData={formData} 
          onInputChange={handleInputChange} 
        />
      );
      
    case 3:
      console.log('🎨 Rendering: Color Selection Step');
      return (
        <ColorSelectionStep 
          formData={{ selectedColor: formData.selectedColor }} 
          handleInputChange={handleInputChange} 
        />
      );
      
    case 4:
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
      
    case 5:
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
      
    case 6:
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
      
    case 7:
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
      
    case 8:
      console.log('🎓 Rendering: Mentorship Step');
      return (
        <MentorshipStep 
          formData={{ mentorshipRequested: formData.mentorshipRequested }} 
          handleInputChange={handleInputChange} 
        />
      );
      
    case 9:
      console.log('🚀 FINAL: Rendering Launch Step');
      return (
        <LaunchStep 
          formData={{ shopifyUrl: formData.shopifyUrl }} 
        />
      );
      
    default:
      // CRITICAL FIX: Fallback to Vision Selection for any invalid step
      console.warn(`⚠️ Invalid step ${currentStep}, redirecting to Vision Selection`);
      return (
        <VisionSelectionStep 
          formData={{ 
            storeVision: formData.storeVision,
            primaryGoal: formData.primaryGoal 
          }}
          handleInputChange={handleInputChange}
          onNext={onNext}
        />
      );
  }
};

export default StepRenderer;


import React from "react";
import GetStartedStep from "./GetStartedStep";
import StoreDetailsStep from "./StoreDetailsStep";
import VisionSelectionStep from "./VisionSelectionStep";
import ColorSelectionStep from "./ColorSelectionStep";
import ShopifySetupStep from "./ShopifySetupStep";
import APIConfigStep from "./APIConfigStep";
import ActivateTrialStep from "./ActivateTrialStep";
import ProductsStep from "./ProductsStep";
import LaunchStep from "./LaunchStep";
import StoreSummaryStep from "./StoreSummaryStep";
import MentorshipStep from "./MentorshipStep";

interface StepRendererProps {
  currentStep: number;
  formData: any;
  handleInputChange: (field: string, value: string | boolean) => void;
  isGenerating: boolean;
  onNext: () => void;
  validateCurrentStep: (step: number) => { isValid: boolean; message?: string };
}

const StepRenderer = ({ 
  currentStep, 
  formData, 
  handleInputChange, 
  isGenerating, 
  onNext, 
  validateCurrentStep 
}: StepRendererProps) => {
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: // Create Your Dream Store (Store Details)
        return (
          <StoreDetailsStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 2: // Store Identity (Color Selection)
        return (
          <ColorSelectionStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 3: // Theme Color (Shopify Setup)
        return (
          <ShopifySetupStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 4: // Shopify Setup (API Config)
        return (
          <APIConfigStep
            formData={formData}
            handleInputChange={handleInputChange}
            onNext={onNext}
          />
        );
      case 5: // API Config (Activate Trial)
        return (
          <ActivateTrialStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 6: // Activate Trial (Products FROM SUPABASE BUCKETS)
        return (
          <ProductsStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 7: // Products (Mentorship)
        return (
          <MentorshipStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 8: // Mentorship (Launch)
        return (
          <LaunchStep
            formData={formData}
          />
        );
      case 9: // Launch Summary (Final completion)
        return (
          <StoreSummaryStep
            formData={formData}
          />
        );
      default:
        return (
          <StoreDetailsStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
    }
  };

  return <>{renderCurrentStep()}</>;
};

export default StepRenderer;

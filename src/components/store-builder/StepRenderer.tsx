
import React from "react";
import GetStartedStep from "./GetStartedStep";
import StoreDetailsStep from "./StoreDetailsStep";
import VisionSelectionStep from "./VisionSelectionStep";
import ColorSelectionStep from "./ColorSelectionStep";
import ShopifySetupStep from "./ShopifySetupStep";
import APIConfigStep from "./APIConfigStep";
import CreateStoreStep from "./CreateStoreStep";
import WinningProductsStep from "./WinningProductsStep";
import LaunchStep from "./LaunchStep";
import StoreSummaryStep from "./StoreSummaryStep";
import MentorshipStep from "./MentorshipStep"; // Add Mentorship step

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
      case 0: // Vision Selection (Step 1)
        return (
          <VisionSelectionStep
            formData={formData}
            handleInputChange={handleInputChange}
            onNext={onNext}
          />
        );
      case 1: // Store Details (Step 2)
        return (
          <StoreDetailsStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 2: // Theme Color (Step 3)
        return (
          <ColorSelectionStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 3: // Shopify Setup (Step 4)
        return (
          <ShopifySetupStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 4: // API Config (Step 5)
        return (
          <APIConfigStep
            formData={formData}
            handleInputChange={handleInputChange}
            onNext={onNext} // CRITICAL FIX: Pass onNext to enable Next button
          />
        );
      case 5: // Activate Trial (Step 6)
        return (
          <CreateStoreStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 6: // Products (Step 7)
        return (
          <WinningProductsStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 7: // Mentorship (Step 8) - NEW
        return (
          <MentorshipStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 8: // Launch (Step 9)
        return (
          <LaunchStep
            formData={formData}
          />
        );
      case 9: // Store Summary (Step 10)
        return (
          <StoreSummaryStep
            formData={formData}
          />
        );
      default:
        return (
          <VisionSelectionStep
            formData={formData}
            handleInputChange={handleInputChange}
            onNext={onNext}
          />
        );
    }
  };

  return <>{renderCurrentStep()}</>;
};

export default StepRenderer;

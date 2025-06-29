
import React from "react";
import GetStartedStep from "./GetStartedStep";
import StoreDetailsStep from "./StoreDetailsStep";
import VisionSelectionStep from "./VisionSelectionStep";
import ColorSelectionStep from "./ColorSelectionStep";
import ShopifySetupStep from "./ShopifySetupStep";
import APIConfigStep from "./APIConfigStep";
import ActivateTrialStep from "./ActivateTrialStep";
import WinningProductsStep from "./WinningProductsStep";
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
      case 0: // Vision Selection
        return (
          <VisionSelectionStep
            formData={formData}
            handleInputChange={handleInputChange}
            onNext={onNext}
          />
        );
      case 1: // Store Details
        return (
          <StoreDetailsStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 2: // Theme Color
        return (
          <ColorSelectionStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 3: // Shopify Setup
        return (
          <ShopifySetupStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 4: // API Config
        return (
          <APIConfigStep
            formData={formData}
            handleInputChange={handleInputChange}
            onNext={onNext}
          />
        );
      case 5: // Activate Trial - FIXED: Now shows correct component
        return (
          <ActivateTrialStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 6: // Products
        return (
          <WinningProductsStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 7: // Mentorship
        return (
          <MentorshipStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 8: // Launch
        return (
          <LaunchStep
            formData={formData}
          />
        );
      case 9: // Store Summary (final completion)
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

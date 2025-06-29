
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
      case 0: // FIXED: Vision Selection is now Step 0 (first step)
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
          />
        );
      case 5: // Activate Trial
        return (
          <CreateStoreStep
            formData={formData}
            handleInputChange={(field: string, value: string | boolean) => handleInputChange(field, value)}
          />
        );
      case 6: // Products
        return (
          <WinningProductsStep
            formData={formData}
            handleInputChange={(field: string, value: boolean) => handleInputChange(field, value)}
          />
        );
      case 7: // Launch
        return (
          <LaunchStep
            formData={formData}
          />
        );
      case 8: // Store Summary
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

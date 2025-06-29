
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
      case 0:
        return (
          <GetStartedStep 
            onNext={onNext}
            formData={formData}
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
          <VisionSelectionStep
            formData={formData}
            handleInputChange={handleInputChange}
            onNext={onNext}
          />
        );
      case 3:
        return (
          <ColorSelectionStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 4:
        return (
          <ShopifySetupStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 5:
        return (
          <APIConfigStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 6:
        return (
          <CreateStoreStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 7:
        return (
          <WinningProductsStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 8:
        return (
          <LaunchStep
            formData={formData}
          />
        );
      case 9:
        return (
          <StoreSummaryStep
            formData={formData}
          />
        );
      default:
        return (
          <GetStartedStep 
            onNext={onNext}
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
    }
  };

  return <>{renderCurrentStep()}</>;
};

export default StepRenderer;

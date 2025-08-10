
import React from "react";
import GetStartedStep from "./GetStartedStep";
import ShopifySetupStep from "./ShopifySetupStep";
import VisionSelectionStep from "./VisionSelectionStep";
import StoreDetailsStep from "./StoreDetailsStep";
import ColorSelectionStep from "./ColorSelectionStep";
import ProductsStep from "./ProductsStep";  // This pulls from Supabase buckets
import CreateStoreStep from "./CreateStoreStep";
import LaunchStep from "./LaunchStep";
import StoreSummaryStep from "./StoreSummaryStep";

interface StepRendererProps {
  currentStep: number;
  formData: any;
  handleInputChange: (field: string, value: any) => void;
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
  switch (currentStep) {
    case 1:
      return <GetStartedStep onNext={onNext} />;
    case 2:
      return (
        <ShopifySetupStep
          formData={formData}
          handleInputChange={handleInputChange}
        />
      );
    case 3:
      return (
        <VisionSelectionStep
          formData={formData}
          handleInputChange={handleInputChange}
        />
      );
    case 4:
      return (
        <StoreDetailsStep
          formData={formData}
          handleInputChange={handleInputChange}
        />
      );
    case 5:
      return (
        <ColorSelectionStep
          formData={formData}
          handleInputChange={handleInputChange}
        />
      );
    case 6:
      // FIXED: Use ProductsStep which pulls from YOUR Supabase buckets
      return (
        <ProductsStep
          formData={formData}
          handleInputChange={handleInputChange}
        />
      );
    case 7:
      return (
        <CreateStoreStep
          formData={formData}
          handleInputChange={handleInputChange}
        />
      );
    case 8:
      return (
        <LaunchStep
          formData={formData}
          handleInputChange={handleInputChange}
        />
      );
    case 9:
      return <StoreSummaryStep formData={formData} />;
    default:
      return <GetStartedStep onNext={onNext} />;
  }
};

export default StepRenderer;

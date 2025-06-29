
import React from "react";
import VisionStep from "./VisionStep";
import GetStartedStep from "./GetStartedStep";
import CreateStoreStep from "./CreateStoreStep";
import ColorStep from "./ColorStep";
import ShopifySetupStep from "./ShopifySetupStep";
import APIConfigStep from "./APIConfigStep";
import ActivateTrialStep from "./ActivateTrialStep";
import ProductsStep from "./ProductsStep";
import MentorshipStep from "./MentorshipStep";
import LaunchStep from "./LaunchStep";

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
    case 0:
      return <VisionStep formData={formData} handleInputChange={handleInputChange} />;
    
    case 1:
      return <GetStartedStep formData={formData} handleInputChange={handleInputChange} />;
    
    case 2:
      return <CreateStoreStep formData={formData} handleInputChange={handleInputChange} />;
    
    case 3:
      return <ColorStep formData={formData} handleInputChange={handleInputChange} />;
    
    case 4:
      return <ShopifySetupStep formData={formData} handleInputChange={handleInputChange} />;
    
    case 5:
      return <APIConfigStep formData={formData} handleInputChange={handleInputChange} />;
    
    case 6:
      return <ActivateTrialStep formData={formData} handleInputChange={handleInputChange} />;
    
    case 7:
      return <ProductsStep formData={formData} handleInputChange={handleInputChange} />;
    
    case 8:
      return <MentorshipStep formData={formData} handleInputChange={handleInputChange} />;
    
    case 9:
      return <LaunchStep formData={formData} />;
    
    default:
      return <VisionStep formData={formData} handleInputChange={handleInputChange} />;
  }
};

export default StepRenderer;


import React from "react";
import VisionSelectionStep from "./VisionSelectionStep";
import { FormData } from "./StoreBuilderLogic";

interface VisionStepProps {
  formData: FormData;
  handleInputChange: (field: string, value: string) => void;
}

const VisionStep = ({ formData, handleInputChange }: VisionStepProps) => {
  const handleNext = () => {
    // This will be handled by the parent StepRenderer navigation
    console.log("Vision step completed");
  };

  return (
    <VisionSelectionStep 
      formData={formData}
      handleInputChange={handleInputChange}
      onNext={handleNext}
    />
  );
};

export default VisionStep;

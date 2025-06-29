
import React from "react";
import VisionSelectionStep from "./VisionSelectionStep";
import { FormData } from "./StoreBuilderLogic";

interface VisionStepProps {
  formData: FormData;
  handleInputChange: (field: string, value: string) => void;
  onNext: () => void; // Add the missing onNext prop
}

const VisionStep = ({ formData, handleInputChange, onNext }: VisionStepProps) => {
  const handleNext = () => {
    console.log("Vision step completed - calling parent onNext");
    onNext(); // Call the actual parent navigation function
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

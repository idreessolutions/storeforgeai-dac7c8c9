
import React from "react";
import ColorSelectionStep from "./ColorSelectionStep";
import { FormData } from "./StoreBuilderLogic";

interface ColorStepProps {
  formData: FormData;
  handleInputChange: (field: string, value: string) => void;
}

const ColorStep = ({ formData, handleInputChange }: ColorStepProps) => {
  // Ensure we use themeColor for consistency with the rest of the app
  const colorData = {
    selectedColor: formData.themeColor || formData.selectedColor || '#3B82F6'
  };

  const handleColorChange = (field: string, value: string) => {
    // Update both selectedColor and themeColor to maintain consistency
    handleInputChange('themeColor', value);
    handleInputChange('selectedColor', value);
  };

  return (
    <ColorSelectionStep 
      formData={colorData}
      handleInputChange={handleColorChange}
    />
  );
};

export default ColorStep;

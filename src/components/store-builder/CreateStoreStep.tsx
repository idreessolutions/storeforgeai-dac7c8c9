
import React from "react";
import StoreDetailsStep from "./StoreDetailsStep";

interface CreateStoreStepProps {
  formData: {
    storeName?: string;
    niche?: string;
    targetAudience?: string;
    businessType?: string;
    storeStyle?: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

const CreateStoreStep = ({ formData, handleInputChange }: CreateStoreStepProps) => {
  return (
    <StoreDetailsStep 
      formData={formData}
      handleInputChange={handleInputChange}
    />
  );
};

export default CreateStoreStep;

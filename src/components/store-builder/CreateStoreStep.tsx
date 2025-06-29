
import React from "react";
import StoreDetailsStep from "./StoreDetailsStep";
import { FormData } from "./StoreBuilderLogic";

interface CreateStoreStepProps {
  formData: FormData;
  handleInputChange: (field: string, value: string) => void;
}

const CreateStoreStep = ({ formData, handleInputChange }: CreateStoreStepProps) => {
  return (
    <StoreDetailsStep 
      formData={formData}
      onInputChange={handleInputChange}
    />
  );
};

export default CreateStoreStep;


import React from "react";
import { storeSteps } from "./store-builder/StoreSteps";
import Header from "./store-builder/Header";
import StepNavigation from "./store-builder/StepNavigation";
import Navigation from "./store-builder/Navigation";
import StepRenderer from "./store-builder/StepRenderer";
import { useStoreBuilderLogic } from "./store-builder/StoreBuilderLogic";

interface StoreBuilderProps {
  onBack: () => void;
  onViewAutomation?: () => void;
}

const StoreBuilder = ({ onBack, onViewAutomation }: StoreBuilderProps) => {
  const {
    currentStep,
    isGenerating,
    formData,
    handleInputChange,
    handleNextStep,
    handlePrevStep,
    validateCurrentStep
  } = useStoreBuilderLogic();

  // Create a wrapper function that matches the expected signature
  const validateStep = () => {
    const validation = validateCurrentStep(currentStep);
    return validation.isValid;
  };

  // Strict step limit to prevent UI bugs
  const maxSteps = storeSteps.length - 1; // Subtract 1 because we start from 0
  const displayCurrentStep = Math.min(currentStep, maxSteps);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Component */}
      <Header 
        onBack={onBack} 
        currentStep={displayCurrentStep} 
        totalSteps={maxSteps}
        onViewAutomation={onViewAutomation}
      />

      {/* Step Navigation Component - only show if not on step 0 and within limits */}
      {displayCurrentStep > 0 && displayCurrentStep <= maxSteps && (
        <StepNavigation steps={storeSteps} currentStep={displayCurrentStep} />
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 lg:px-8">
        <StepRenderer
          currentStep={displayCurrentStep}
          formData={formData}
          handleInputChange={handleInputChange}
          isGenerating={isGenerating}
          onNext={handleNextStep}
          validateCurrentStep={validateCurrentStep}
        />

        {/* Navigation Component - only show if not on step 0 and within limits */}
        {displayCurrentStep > 0 && displayCurrentStep <= maxSteps && (
          <Navigation 
            currentStep={displayCurrentStep} 
            totalSteps={maxSteps} 
            isGenerating={isGenerating}
            onPrevious={handlePrevStep}
            onNext={handleNextStep}
            validateCurrentStep={validateStep}
          />
        )}
      </div>
    </div>
  );
};

export default StoreBuilder;

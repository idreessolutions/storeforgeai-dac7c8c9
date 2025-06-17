
import React from "react";
import { storeSteps } from "./StoreSteps";
import Header from "./Header";
import StepNavigation from "./StepNavigation";
import Navigation from "./Navigation";
import StepRenderer from "./StepRenderer";
import { useStoreBuilderLogic } from "./StoreBuilderLogic";

interface StoreBuilderProps {
  onBack: () => void;
}

const StoreBuilder = ({ onBack }: StoreBuilderProps) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Header Component */}
      <Header 
        onBack={onBack} 
        currentStep={currentStep} 
        totalSteps={storeSteps.length} 
      />

      {/* Step Navigation Component - Always visible */}
      <StepNavigation steps={storeSteps} currentStep={currentStep} />

      {/* Main Content - Fixed height with scroll */}
      <div className="h-[calc(100vh-200px)] overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 lg:px-8">
          <StepRenderer
            currentStep={currentStep}
            formData={formData}
            handleInputChange={handleInputChange}
            isGenerating={isGenerating}
            onNext={handleNextStep}
          />

          {/* Navigation Component - HIDE on step 0 (Get Started) */}
          {currentStep > 0 && (
            <div className="mt-6">
              <Navigation 
                currentStep={currentStep} 
                totalSteps={storeSteps.length} 
                isGenerating={isGenerating}
                onPrevious={handlePrevStep}
                onNext={handleNextStep}
                validateCurrentStep={validateStep}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreBuilder;

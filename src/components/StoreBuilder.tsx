
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

  // FIXED: Total steps is 9, currentStep is now 1-9
  const totalSteps = 9;
  const displayCurrentStep = currentStep; // currentStep is now 1-9

  console.log('StoreBuilder - currentStep:', currentStep, 'totalSteps:', totalSteps, 'displayCurrentStep:', displayCurrentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Component */}
      <Header 
        onBack={onBack} 
        currentStep={displayCurrentStep} 
        totalSteps={totalSteps}
        onViewAutomation={onViewAutomation}
      />

      {/* Step Navigation Component - show for steps 2-9 */}
      {currentStep >= 2 && currentStep <= 9 && (
        <StepNavigation steps={storeSteps} currentStep={currentStep} />
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 lg:px-8">
        <StepRenderer
          currentStep={currentStep}
          formData={formData}
          handleInputChange={handleInputChange}
          isGenerating={isGenerating}
          onNext={handleNextStep}
          validateCurrentStep={validateCurrentStep}
        />

        {/* Navigation Component - show for steps 1-8 (not for final step 9) */}
        {currentStep >= 1 && currentStep < 9 && (
          <Navigation 
            currentStep={displayCurrentStep} 
            totalSteps={totalSteps} 
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

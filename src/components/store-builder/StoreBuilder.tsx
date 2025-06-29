
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

  // Updated step limit to allow step 9 (Launch)
  const maxSteps = storeSteps.length - 1; // This will be 9 (0-9)
  const displayCurrentStep = Math.min(currentStep, maxSteps);

  // Convert StoreStep[] to the format expected by StepNavigation
  const navigationSteps = storeSteps.map(step => ({
    id: step.id,
    title: step.title,
    subtitle: step.subtitle,
    description: step.description,
    icon: step.icon // Keep as string - StepNavigation should handle this
  }));

  console.log('StoreBuilder - currentStep:', currentStep, 'maxSteps:', maxSteps, 'displayCurrentStep:', displayCurrentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Component */}
      <Header 
        onBack={onBack} 
        currentStep={displayCurrentStep} 
        totalSteps={maxSteps}
        onViewAutomation={onViewAutomation}
      />

      {/* Step Navigation Component - show for steps 1-9 */}
      {displayCurrentStep > 0 && displayCurrentStep <= maxSteps && (
        <StepNavigation steps={navigationSteps} currentStep={displayCurrentStep} />
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

        {/* Navigation Component - show for steps 1-8 (not for step 0 or step 9) */}
        {displayCurrentStep > 0 && displayCurrentStep < maxSteps && (
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

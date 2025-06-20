
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

  // FIXED: Correct step calculation - exclude "Get Started" from progress count
  // Step 0 = Get Started (not counted in progress)
  // Steps 1-7 = Actual building steps (7 total steps)
  const displayCurrentStep = currentStep === 0 ? 0 : currentStep;
  const displayTotalSteps = 7; // Choose Color, Create Store, API Config, Activate Trial, Products, Mentorship, Launch
  
  // CRITICAL FIX: Don't count "Get Started" in progress
  const actualProgress = currentStep === 0 ? 0 : currentStep;

  console.log('🚨 STEP TRACKING DEBUG:', {
    currentStep,
    displayCurrentStep,
    displayTotalSteps,
    actualProgress,
    stepName: storeSteps[currentStep]?.title || 'Unknown'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Header Component - FIXED: Only show progress for actual building steps */}
      <Header 
        onBack={onBack} 
        currentStep={actualProgress}
        totalSteps={displayTotalSteps} 
      />

      {/* Step Navigation Component - FIXED: Show correct progress excluding "Get Started" */}
      <StepNavigation 
        steps={storeSteps} 
        currentStep={currentStep}
      />

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
                currentStep={actualProgress}
                totalSteps={displayTotalSteps}
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

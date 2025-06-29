
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

  // FIXED: Correct total steps to 9 (steps 0-8, displayed as 1-9)
  const totalSteps = 9; // 9 total steps: Vision(0), Store Details(1), Color(2), Shopify(3), API(4), Trial(5), Products(6), Mentorship(7), Launch(8)
  const displayCurrentStep = currentStep === 0 ? 1 : currentStep + 1; // Convert 0-based to 1-based for display

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

      {/* Step Navigation Component - show for steps 1-9 (not for step 0 vision) */}
      {currentStep > 0 && currentStep <= 8 && (
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

        {/* Navigation Component - show for steps 1-8 (not for step 0 or final step 8) */}
        {currentStep > 0 && currentStep < 8 && (
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


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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Component */}
      <Header 
        onBack={onBack} 
        currentStep={currentStep} 
        totalSteps={storeSteps.length}
        onViewAutomation={onViewAutomation}
      />

      {/* Step Navigation Component - only show if not on step 0 */}
      {currentStep > 0 && (
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

        {/* Navigation Component - only show if not on step 0 */}
        {currentStep > 0 && (
          <Navigation 
            currentStep={currentStep} 
            totalSteps={storeSteps.length} 
            isGenerating={isGenerating}
            onPrevious={handlePrevStep}
            onNext={handleNextStep}
            validateCurrentStep={validateCurrentStep}
          />
        )}
      </div>
    </div>
  );
};

export default StoreBuilder;

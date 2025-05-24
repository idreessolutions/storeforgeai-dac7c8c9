
import React from "react";
import { storeSteps } from "./store-builder/StoreSteps";
import Header from "./store-builder/Header";
import StepNavigation from "./store-builder/StepNavigation";
import Navigation from "./store-builder/Navigation";
import StepRenderer from "./store-builder/StepRenderer";
import { useStoreBuilderLogic } from "./store-builder/StoreBuilderLogic";

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
    handlePrevStep
  } = useStoreBuilderLogic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Component */}
      <Header 
        onBack={onBack} 
        currentStep={currentStep} 
        totalSteps={storeSteps.length} 
      />

      {/* Step Navigation Component */}
      <StepNavigation steps={storeSteps} currentStep={currentStep} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 lg:px-8">
        <StepRenderer
          currentStep={currentStep}
          formData={formData}
          handleInputChange={handleInputChange}
          isGenerating={isGenerating}
        />

        {/* Navigation Component */}
        <Navigation 
          currentStep={currentStep} 
          totalSteps={storeSteps.length} 
          isGenerating={isGenerating}
          onPrevious={handlePrevStep}
          onNext={handleNextStep}
        />
      </div>
    </div>
  );
};

export default StoreBuilder;

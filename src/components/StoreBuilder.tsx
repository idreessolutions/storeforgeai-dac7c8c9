
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Import step configurations
import { storeSteps } from "./store-builder/StoreSteps";

// Import component files
import Header from "./store-builder/Header";
import StepNavigation from "./store-builder/StepNavigation";
import StoreDetailsStep from "./store-builder/StoreDetailsStep";
import AIGenerationStep from "./store-builder/AIGenerationStep";
import FutureStep from "./store-builder/FutureStep";
import Navigation from "./store-builder/Navigation";

interface StoreBuilderProps {
  onBack: () => void;
}

const StoreBuilder = ({ onBack }: StoreBuilderProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    niche: "",
    targetAudience: "",
    businessType: "",
    storeStyle: "",
    additionalInfo: ""
  });
  
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!formData.niche || !formData.targetAudience) {
        toast({
          title: "Missing Information",
          description: "Please fill in your niche and target audience.",
          variant: "destructive",
        });
        return;
      }
      
      setIsGenerating(true);
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsGenerating(false);
      
      toast({
        title: "Store Generated!",
        description: "Your AI-powered store has been created successfully.",
      });
    }
    
    if (currentStep < storeSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render the current step content based on step number
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StoreDetailsStep 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
        );
      case 2:
        return (
          <AIGenerationStep 
            isGenerating={isGenerating} 
          />
        );
      default:
        return (
          <FutureStep 
            step={currentStep} 
            stepTitle={
              currentStep === 3 ? "Customize Your Branding" :
              currentStep === 4 ? "Review Your Products" :
              currentStep === 5 ? "Finalize Content" :
              "Launch Your Store"
            }
            stepDescription={
              currentStep === 3 ? "Fine-tune your brand identity" :
              currentStep === 4 ? "Review and edit AI-generated products" :
              currentStep === 5 ? "Perfect your store content" :
              "Export to Shopify and go live"
            }
            icon={storeSteps[currentStep - 1].icon}
          />
        );
    }
  };

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
        {renderStepContent()}

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

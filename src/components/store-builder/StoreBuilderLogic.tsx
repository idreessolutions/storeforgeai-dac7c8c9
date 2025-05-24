
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { storeSteps } from "./StoreSteps";

export const useStoreBuilderLogic = () => {
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

  return {
    currentStep,
    isGenerating,
    formData,
    handleInputChange,
    handleNextStep,
    handlePrevStep
  };
};

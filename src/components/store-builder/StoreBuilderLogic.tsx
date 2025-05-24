
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
    additionalInfo: "",
    shopifyUrl: "",
    accessToken: "",
    themeColor: "#1E40AF"
  });
  
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = async () => {
    // Step 1: Store Details validation
    if (currentStep === 1) {
      if (!formData.niche || !formData.targetAudience) {
        toast({
          title: "Missing Information",
          description: "Please fill in your niche and target audience.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Step 2: Shopify URL validation
    if (currentStep === 2) {
      if (!formData.shopifyUrl) {
        toast({
          title: "Store URL Required",
          description: "Please enter your Shopify store URL.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Step 3: Access Token validation
    if (currentStep === 3) {
      if (!formData.accessToken) {
        toast({
          title: "Access Token Required",
          description: "Please enter your Shopify access token.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Step 4: Color selection validation
    if (currentStep === 4) {
      if (!formData.themeColor) {
        toast({
          title: "Color Required",
          description: "Please select a theme color.",
          variant: "destructive",
        });
        return;
      }
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

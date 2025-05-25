
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { storeSteps } from "./StoreSteps";
import { useStoreSession } from "@/hooks/useStoreSession";

export const useStoreBuilderLogic = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    niche: "",
    targetAudience: "",
    businessType: "",
    storeStyle: "",
    additionalInfo: "",
    shopifyUrl: "",
    accessToken: "",
    planActivated: false,
    themeColor: "#1E40AF",
    productsAdded: false,
    mentorshipRequested: false,
    createdViaAffiliate: false
  });
  
  const { toast } = useToast();
  const { sessionId, saveSessionData, getSessionData } = useStoreSession();

  // Load session data on mount
  useEffect(() => {
    const loadSession = async () => {
      const sessionData = await getSessionData();
      if (sessionData) {
        setFormData({
          niche: sessionData.niche || "",
          targetAudience: sessionData.targetAudience || "",
          businessType: sessionData.businessType || "",
          storeStyle: sessionData.storeStyle || "",
          additionalInfo: sessionData.additionalInfo || "",
          shopifyUrl: sessionData.shopifyUrl || "",
          accessToken: sessionData.accessToken || "",
          planActivated: sessionData.planActivated || false,
          themeColor: sessionData.themeColor || "#1E40AF",
          productsAdded: sessionData.productsAdded || false,
          mentorshipRequested: sessionData.mentorshipRequested || false,
          createdViaAffiliate: sessionData.createdViaAffiliate || false
        });
        setCurrentStep(sessionData.completedSteps || 0);
      }
    };
    loadSession();
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Save to database
      saveSessionData({
        sessionId,
        niche: newData.niche,
        targetAudience: newData.targetAudience,
        businessType: newData.businessType,
        storeStyle: newData.storeStyle,
        additionalInfo: newData.additionalInfo,
        shopifyUrl: newData.shopifyUrl,
        accessToken: newData.accessToken,
        planActivated: newData.planActivated,
        themeColor: newData.themeColor,
        productsAdded: newData.productsAdded,
        mentorshipRequested: newData.mentorshipRequested,
        createdViaAffiliate: newData.createdViaAffiliate
      });
      
      return newData;
    });
  };

  const handleNextStep = async () => {
    // Step 0: Get Started - no validation needed
    if (currentStep === 0) {
      setCurrentStep(1);
      await saveSessionData({ completedSteps: 1 });
      return;
    }

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
    
    // Step 2: Shopify URL validation - must be created via affiliate
    if (currentStep === 2) {
      if (!formData.shopifyUrl) {
        toast({
          title: "Store URL Required",
          description: "Please enter your Shopify store URL after creating your account.",
          variant: "destructive",
        });
        return;
      }
      
      if (!formData.createdViaAffiliate) {
        toast({
          title: "Account Required",
          description: "Please create a Shopify account by clicking the 'Create Account' button first.",
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

    // Step 4: Plan activation validation
    if (currentStep === 4) {
      if (!formData.planActivated) {
        toast({
          title: "Plan Required",
          description: "You must pick a Shopify plan before continuing.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Step 5: Color selection validation
    if (currentStep === 5) {
      if (!formData.themeColor) {
        toast({
          title: "Color Required",
          description: "Please select a theme color.",
          variant: "destructive",
        });
        return;
      }
    }

    // Step 6: Products validation
    if (currentStep === 6) {
      if (!formData.productsAdded) {
        toast({
          title: "Products Required",
          description: "Please add products to your store first.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (currentStep < storeSteps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      await saveSessionData({ completedSteps: nextStep });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
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

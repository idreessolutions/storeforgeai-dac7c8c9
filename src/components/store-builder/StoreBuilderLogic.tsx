
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
      console.log('Loading session data...');
      const sessionData = await getSessionData();
      if (sessionData) {
        console.log('Session data found:', sessionData);
        setFormData({
          niche: sessionData.niche || "",
          targetAudience: sessionData.target_audience || "",
          businessType: sessionData.business_type || "",
          storeStyle: sessionData.store_style || "",
          additionalInfo: sessionData.additional_info || "",
          shopifyUrl: sessionData.shopify_url || "",
          accessToken: sessionData.access_token || "",
          planActivated: sessionData.plan_activated || false,
          themeColor: sessionData.theme_color || "#1E40AF",
          productsAdded: sessionData.products_added || false,
          mentorshipRequested: sessionData.mentorship_requested || false,
          createdViaAffiliate: sessionData.created_via_affiliate || false
        });
        setCurrentStep(sessionData.completed_steps || 0);
      } else {
        console.log('No session data found, starting fresh');
      }
    };
    loadSession();
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    console.log('Input change:', field, value);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Save to database with correct field mapping
      saveSessionData({
        session_id: sessionId,
        niche: newData.niche,
        target_audience: newData.targetAudience,
        business_type: newData.businessType,
        store_style: newData.storeStyle,
        additional_info: newData.additionalInfo,
        shopify_url: newData.shopifyUrl,
        access_token: newData.accessToken,
        plan_activated: newData.planActivated,
        theme_color: newData.themeColor,
        products_added: newData.productsAdded,
        mentorship_requested: newData.mentorshipRequested,
        created_via_affiliate: newData.createdViaAffiliate
      });
      
      return newData;
    });
  };

  const handleNextStep = async () => {
    console.log('Next step clicked, current step:', currentStep);
    
    // Step 0: Get Started - no validation needed
    if (currentStep === 0) {
      setCurrentStep(1);
      await saveSessionData({ completed_steps: 1 });
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
    
    // Step 2: Color Selection - no validation needed for color
    if (currentStep === 2) {
      // Color is optional, proceed to next step
    }
    
    // Step 3: Shopify URL validation - must be created via affiliate
    if (currentStep === 3) {
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
    
    // Step 4: Access Token validation
    if (currentStep === 4) {
      if (!formData.accessToken) {
        toast({
          title: "Access Token Required",
          description: "Please enter your Shopify access token.",
          variant: "destructive",
        });
        return;
      }
    }

    // Step 5: Plan activation validation
    if (currentStep === 5) {
      if (!formData.planActivated) {
        toast({
          title: "Plan Required",
          description: "You must activate a Shopify plan before continuing.",
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
      await saveSessionData({ completed_steps: nextStep });
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

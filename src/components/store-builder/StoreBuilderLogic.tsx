import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FormData {
  storeName: string;
  niche: string;
  targetAudience: string;
  businessType: string;
  storeStyle: string;
  customInfo: string;
  shopifyUrl: string;
  accessToken: string;
  planActivated: boolean;
  selectedColor: string;
  themeColor: string;
  productsAdded: boolean;
  mentorshipRequested: boolean;
  createdViaAffiliate: boolean;
  storeVision: string;
  primaryGoal: string;
}

export const useStoreBuilderLogic = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 (Vision Selection)
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    storeName: "",
    niche: "",
    targetAudience: "",
    businessType: "",
    storeStyle: "",
    customInfo: "",
    shopifyUrl: "",
    accessToken: "",
    planActivated: false,
    selectedColor: "#3B82F6",
    themeColor: "#3B82F6",
    productsAdded: false,
    mentorshipRequested: false,
    createdViaAffiliate: false,
    storeVision: "",
    primaryGoal: "",
  });

  // Generate or get session ID
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('storeBuilderSessionId');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('storeBuilderSessionId', id);
    }
    return id;
  });

  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateCurrentStep = useCallback((step: number): { isValid: boolean; missingFields: string[] } => {
    const missingFields: string[] = [];

    switch (step) {
      case 0: // Vision Selection
        console.log('Vision step validation - allowing progression with defaults');
        return { isValid: true, missingFields: [] };
      case 1: // Store Details
        if (!formData.storeName.trim()) missingFields.push("Store Name");
        if (!formData.niche.trim()) missingFields.push("Niche");
        if (!formData.targetAudience.trim()) missingFields.push("Target Audience");
        if (!formData.businessType.trim()) missingFields.push("Business Type");
        if (!formData.storeStyle.trim()) missingFields.push("Store Style");
        break;
      case 2: // Color Selection
        if (!formData.selectedColor.trim()) missingFields.push("Theme Color");
        break;
      case 3: // Shopify Setup
        if (!formData.shopifyUrl.trim()) missingFields.push("Shopify URL");
        if (typeof (window as any).validateShopifySetup === 'function') {
          const isValid = (window as any).validateShopifySetup();
          if (!isValid) missingFields.push("Complete Account Setup");
        }
        break;
      case 4: // API Config - CRITICAL FIX: Correct validation for step 4
        if (!formData.accessToken.trim()) missingFields.push("Access Token");
        // FIXED: Check for the correct API validation function
        if (typeof (window as any).validateAPIConfig === 'function') {
          const isValid = (window as any).validateAPIConfig();
          console.log('🔍 API Config validation result for step 4:', isValid);
          if (!isValid) missingFields.push("Valid Access Token");
        } else {
          console.log('🚨 validateAPIConfig function not found on window');
          // Fallback validation - check token format
          const shopifyTokenPattern = /^shpat_[A-Za-z0-9_-]{32,}$/;
          const isValidToken = shopifyTokenPattern.test(formData.accessToken.trim());
          console.log('🔍 Fallback token validation:', isValidToken);
          if (!isValidToken) missingFields.push("Valid Access Token");
        }
        break;
      case 5: // Activate Trial
        if (!formData.planActivated) missingFields.push("Plan Activation");
        break;
      case 6: // Products
        if (!formData.productsAdded) missingFields.push("Products");
        break;
      case 7: // Mentorship
        // No validation needed - optional step
        break;
      case 8: // Launch
        // Final step - always valid
        break;
    }

    const isValid = missingFields.length === 0;
    console.log(`🔍 Step ${step} validation result:`, { isValid, missingFields });
    return { isValid, missingFields };
  }, [formData]);

  const saveSessionData = useCallback(async (stepToSave: number) => {
    try {
      const sessionData = {
        session_id: sessionId,
        completed_steps: stepToSave,
        niche: formData.niche,
        target_audience: formData.targetAudience,
        business_type: formData.businessType,
        store_style: formData.storeStyle,
        additional_info: formData.customInfo,
        shopify_url: formData.shopifyUrl,
        access_token: formData.accessToken,
        plan_activated: formData.planActivated,
        theme_color: formData.selectedColor,
        products_added: formData.productsAdded,
        mentorship_requested: formData.mentorshipRequested,
        created_via_affiliate: formData.createdViaAffiliate,
      };

      console.log('Saving session data:', sessionData);

      const { error } = await supabase
        .from('store_builder_sessions')
        .upsert(sessionData);

      if (error) {
        console.error('Session save error:', error);
      } else {
        console.log('Session updated successfully');
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }, [formData, sessionId]);

  const handleNextStep = useCallback(async () => {
    console.log('🚀 FIXED: Next step clicked, current step:', currentStep);
    
    // FIXED: Special handling for Vision Step (step 0) - always allow progression
    if (currentStep === 0) {
      console.log('✅ VISION STEP: Moving to Store Details (step 1) - defaults will be set if needed');
      setCurrentStep(1);
      return;
    }

    const validation = validateCurrentStep(currentStep);
    if (!validation.isValid) {
      console.log('❌ Validation failed:', validation.missingFields);
      toast({
        title: "Please complete required fields",
        description: `Missing: ${validation.missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      await saveSessionData(currentStep + 1);

      if (currentStep < 8) { // Max step is 8 (Launch)
        const nextStep = currentStep + 1;
        console.log(`✅ NAVIGATION: Moving to step ${nextStep}`);
        setCurrentStep(nextStep);
      } else {
        console.log('🚨 Cannot proceed beyond Launch step (8)');
      }

    } catch (error) {
      console.error('Error in handleNextStep:', error);
      toast({
        title: "Error",
        description: "Failed to proceed to next step",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [currentStep, validateCurrentStep, saveSessionData, toast]);

  const handlePrevStep = useCallback(() => {
    console.log('🔙 Previous step clicked, current step:', currentStep);
    
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      console.log(`✅ Moving back to step ${prevStep}`);
      setCurrentStep(prevStep);
    } else if (currentStep === 1) {
      console.log('✅ Moving back to Vision Selection (step 0)');
      setCurrentStep(0);
    }
  }, [currentStep]);

  return {
    currentStep,
    isGenerating,
    formData,
    handleInputChange,
    handleNextStep,
    handlePrevStep,
    validateCurrentStep,
  };
};

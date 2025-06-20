
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
  productsAdded: boolean;
  mentorshipRequested: boolean;
  createdViaAffiliate: boolean;
}

export const useStoreBuilderLogic = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 (Get Started)
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
    productsAdded: false,
    mentorshipRequested: false,
    createdViaAffiliate: false,
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
      case 0: // Get Started - always valid
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
        break;
      case 4: // API Config
        if (!formData.accessToken.trim()) missingFields.push("Access Token");
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

    return { isValid: missingFields.length === 0, missingFields };
  }, [formData]);

  const saveSessionData = useCallback(async (stepToSave: number) => {
    try {
      const sessionData = {
        session_id: sessionId, // FIXED: Add the missing session_id field
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
    console.log('🚀 ENHANCED: Next step clicked, current step:', currentStep);
    
    if (currentStep === 0) {
      // From Get Started to Store Details (step 1)
      setCurrentStep(1);
      return;
    }

    const validation = validateCurrentStep(currentStep);
    if (!validation.isValid) {
      toast({
        title: "Please complete required fields",
        description: `Missing: ${validation.missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // ENHANCED: Always save session data before moving to next step
      await saveSessionData(currentStep + 1);

      // ENHANCED: Move to next step with proper limits
      if (currentStep < 8) { // Allow up to step 8 (Launch)
        const nextStep = currentStep + 1;
        console.log(`✅ ENHANCED: Moving to step ${nextStep}`);
        
        if (nextStep === 8) {
          console.log('🎉 REACHED FINAL STEP: Launch step (8)');
        }
        
        setCurrentStep(nextStep);
      } else {
        console.log('🚨 ENHANCED: Cannot proceed beyond Launch step (8)');
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
    console.log('🔙 ENHANCED: Previous step clicked, current step:', currentStep);
    
    if (currentStep > 1) { // Can go back to step 1 (Store Details) minimum
      const prevStep = currentStep - 1;
      console.log(`✅ ENHANCED: Moving back to step ${prevStep}`);
      setCurrentStep(prevStep);
    } else if (currentStep === 1) {
      // From Store Details back to Get Started
      console.log('✅ ENHANCED: Moving back to Get Started (step 0)');
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

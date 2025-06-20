
import { useState } from "react";
import { generateWinningProducts } from "@/services/productService";
import { installAndConfigureSenseTheme } from "@/services/shopifyThemeService";
import { toast } from "sonner";
import { useStoreSession } from "@/hooks/useStoreSession";

export interface FormData {
  // Store Details
  storeName: string;
  niche: string;
  targetAudience: string;
  businessType: string;
  storeStyle: string;
  customInfo: string;
  
  // Shopify Setup
  shopifyUrl: string;
  accessToken: string;
  
  // Theme/Design
  selectedColor: string;
  
  // Additional fields to match StepRenderer expectations
  additionalInfo: string;
  planActivated: boolean;
  themeColor: string;
  productsAdded: boolean;
  mentorshipRequested: boolean;
  createdViaAffiliate: boolean;
  
  // Progress tracking
  progress: number;
  currentProduct: string;
}

export const useStoreBuilderLogic = () => {
  const { saveSessionData } = useStoreSession();
  
  // CRITICAL FIX: Start from step 0 (Get Started), allow progression to step 8 (Launch)
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    // Store Details
    storeName: '',
    niche: '',
    targetAudience: '',
    businessType: '',
    storeStyle: '',
    customInfo: '',
    
    // Shopify Setup  
    shopifyUrl: '',
    accessToken: '',
    
    // Theme/Design
    selectedColor: '#1E40AF',
    
    // Additional fields
    additionalInfo: '',
    planActivated: false,
    themeColor: '#1E40AF',
    productsAdded: false,
    mentorshipRequested: false,
    createdViaAffiliate: false,
    
    // Progress tracking
    progress: 0,
    currentProduct: '',
  });

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Keep customInfo and additionalInfo in sync
      if (field === 'customInfo') {
        updated.additionalInfo = value as string;
      } else if (field === 'additionalInfo') {
        updated.customInfo = value as string;
      }
      
      // Keep selectedColor and themeColor in sync
      if (field === 'selectedColor') {
        updated.themeColor = value as string;
      } else if (field === 'themeColor') {
        updated.selectedColor = value as string;
      }
      
      return updated;
    });
  };

  // Enhanced validation function that works silently
  const validateCurrentStep = (step: number): { isValid: boolean; missingFields: string[] } => {
    const missingFields: string[] = [];

    switch (step) {
      case 1: // Store Details Step - All fields required but validation is silent
        if (!formData.storeName?.trim()) missingFields.push("Store Name");
        if (!formData.niche?.trim()) missingFields.push("Store Niche");
        if (!formData.targetAudience?.trim()) missingFields.push("Target Audience");
        if (!formData.businessType?.trim()) missingFields.push("Business Type");
        if (!formData.storeStyle?.trim()) missingFields.push("Store Style Preference");
        break;
      
      case 3: // Shopify Setup
        if (!formData.shopifyUrl?.trim()) missingFields.push("Shopify Store URL");
        break;
        
      case 4: // API Config
        if (!formData.accessToken?.trim()) missingFields.push("Shopify Access Token");
        break;
        
      default:
        // No validation needed for other steps
        break;
    }

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  const handleNextStep = async () => {
    console.log('🚀 CRITICAL: Next step clicked, current step:', currentStep);
    
    try {
      // CRITICAL FIX: Allow progression to step 8 (Launch) - step 8 is the final step
      if (currentStep >= 8) {
        console.log('✅ FINAL STEP REACHED: Already at Launch step (8)');
        toast.success('🎉 Congratulations! Your store is ready to launch!');
        return;
      }

      // CRITICAL FIX: Skip validation for Get Started step (step 0)
      if (currentStep > 0) {
        const validation = validateCurrentStep(currentStep);
        
        if (!validation.isValid) {
          console.log('❌ Validation failed for step', currentStep, '- Missing fields:', validation.missingFields);
          return;
        }
      }

      // Special logging for store details completion
      if (currentStep === 1) {
        console.log('✅ Store details completed:', {
          storeName: formData.storeName,
          niche: formData.niche,
          targetAudience: formData.targetAudience,
          businessType: formData.businessType,
          storeStyle: formData.storeStyle,
          customInfo: formData.customInfo
        });
      }

      // Save session data with ALL store personalization details
      if (currentStep > 0) {
        await saveSessionData({
          completed_steps: Math.min(currentStep + 1, 8), // CRITICAL: Allow saving step 8
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
          created_via_affiliate: formData.createdViaAffiliate
        });
      }
      
      // CRITICAL FIX: Increment step but cap at 8 (Launch)
      const nextStep = Math.min(currentStep + 1, 8);
      setCurrentStep(nextStep);
      
      // Show success message for completing store details
      if (currentStep === 1) {
        toast.success(`✅ ${formData.storeName} store details saved! AI will generate ${formData.niche} products for ${formData.targetAudience} with ${formData.storeStyle} styling`);
      }

      // CRITICAL: Special message when reaching Launch step
      if (nextStep === 8) {
        console.log('🎉 REACHED FINAL STEP: Launch step (8)');
        toast.success('🚀 Congratulations! You have reached the final step - Launch Your Store!');
      }
      
    } catch (error) {
      console.error('❌ Error in next step:', error);
      toast.error('Failed to proceed to next step');
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      console.log('⬅️ Moving to previous step:', prevStep);
    }
  };

  return {
    currentStep,
    isGenerating,
    formData,
    handleInputChange,
    handleNextStep,
    handlePrevStep,
    validateCurrentStep
  };
};

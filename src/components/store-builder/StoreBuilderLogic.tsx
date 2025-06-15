import { useState } from "react";
import { addProductsToShopify } from "@/services/productService";
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
    console.log('Next step clicked, current step:', currentStep);
    console.log('Store Details:', {
      storeName: formData.storeName,
      niche: formData.niche,
      targetAudience: formData.targetAudience,
      businessType: formData.businessType,
      storeStyle: formData.storeStyle,
      customInfo: formData.customInfo
    });
    
    try {
      // Validate current step before proceeding (silent validation)
      const validation = validateCurrentStep(currentStep);
      
      if (!validation.isValid) {
        console.log('❌ Validation failed for step', currentStep, '- Missing fields:', validation.missingFields);
        // Don't show error to user, just prevent progression
        return;
      }

      // Special validation for ProductsStep (step 6) preparation
      if (currentStep === 5) { // Going TO step 6 (ProductsStep)
        // Double-check all store details are complete
        const storeDetailsValidation = validateCurrentStep(1);
        if (!storeDetailsValidation.isValid) {
          console.log('❌ Store details incomplete for ProductsStep');
          return;
        }
        
        console.log('✅ All store personalization details ready for ProductsStep:', {
          storeName: formData.storeName,
          niche: formData.niche,
          targetAudience: formData.targetAudience,
          businessType: formData.businessType,
          storeStyle: formData.storeStyle,
          customInfo: formData.customInfo,
          shopifyUrl: formData.shopifyUrl,
          accessToken: formData.accessToken,
          themeColor: formData.selectedColor
        });
      }

      // Save session data with ALL store personalization details
      await saveSessionData({
        completed_steps: currentStep + 1,
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
      
      setCurrentStep(currentStep + 1);
      
      // Show success message for completing store details
      if (currentStep === 1) {
        toast.success(`✅ ${formData.storeName} store details saved! AI will generate ${formData.niche} products for ${formData.targetAudience} with ${formData.storeStyle} styling`);
      }
      
    } catch (error) {
      console.error('Error in next step:', error);
      toast.error('Failed to proceed to next step');
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
    handlePrevStep,
    validateCurrentStep
  };
};

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
    businessType: 'e-commerce',
    storeStyle: 'modern',
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

  const handleNextStep = async () => {
    console.log('Next step clicked, current step:', currentStep);
    
    try {
      // Step 6: AI Generation - Install theme and add products
      if (currentStep === 6) {
        setIsGenerating(true);
        
        console.log('🚀 Starting AI generation with full context:', {
          niche: formData.niche,
          targetAudience: formData.targetAudience,
          businessType: formData.businessType,
          storeStyle: formData.storeStyle,
          themeColor: formData.selectedColor,
          customInfo: formData.customInfo
        });
        
        try {
          // Step 1: Install and configure Sense theme
          toast.info("Installing and configuring Sense theme...");
          await installAndConfigureSenseTheme({
            storeName: formData.storeName,
            accessToken: formData.accessToken,
            themeColor: formData.selectedColor,
            niche: formData.niche
          });
          
          // Step 2: Generate and add niche-specific products
          toast.info(`Generating 10 winning ${formData.niche} products for ${formData.targetAudience}...`);
          
          const onProgress = (progress: number, currentProduct: string) => {
            setFormData(prev => ({
              ...prev,
              progress,
              currentProduct
            }));
          };

          await addProductsToShopify(
            formData.shopifyUrl,
            formData.accessToken,
            formData.niche,
            onProgress,
            formData.selectedColor,
            formData.targetAudience,
            formData.businessType,
            formData.storeStyle,
            formData.customInfo
          );

          toast.success(`Successfully created your ${formData.niche} store with 10 winning products!`);
          setCurrentStep(currentStep + 1);
          
        } catch (error) {
          console.error('Generation failed:', error);
          toast.error(error instanceof Error ? error.message : 'Store generation failed');
        } finally {
          setIsGenerating(false);
        }
        return;
      }

      // Save session data and proceed to next step
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
    handlePrevStep
  };
};

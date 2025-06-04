
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
    
    // Progress tracking
    progress: 0,
    currentProduct: '',
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        form_data: formData
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


import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface NavigationProps {
  currentStep: number;
  totalSteps: number;
  isGenerating: boolean;
  onPrevious: () => void;
  onNext: () => void;
  validateCurrentStep?: (step: number) => { isValid: boolean; missingFields: string[] };
}

const Navigation = ({ 
  currentStep, 
  totalSteps, 
  isGenerating, 
  onPrevious, 
  onNext,
  validateCurrentStep 
}: NavigationProps) => {
  // Check if current step is valid
  const validation = validateCurrentStep ? validateCurrentStep(currentStep) : { isValid: true, missingFields: [] };
  const canProceed = validation.isValid;

  // Skip navigation on certain steps
  if (currentStep === 0 || currentStep >= totalSteps - 1) {
    return null;
  }

  return (
    <div className="flex justify-between items-center pt-8 border-t border-gray-200">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isGenerating}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="flex items-center gap-4">
        {!canProceed && validation.missingFields.length > 0 && (
          <p className="text-sm text-red-600 font-medium">
            Required: {validation.missingFields.join(", ")}
          </p>
        )}
        
        <Button
          onClick={onNext}
          disabled={isGenerating || !canProceed}
          className={`flex items-center gap-2 ${!canProceed ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {isGenerating ? 'Processing...' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default Navigation;

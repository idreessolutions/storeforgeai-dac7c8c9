
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle, Crown } from "lucide-react";

interface NavigationProps {
  currentStep: number;
  totalSteps: number;
  isGenerating: boolean;
  onPrevious: () => void;
  onNext: () => void;
  validateCurrentStep: () => boolean;
}

const Navigation = ({ 
  currentStep, 
  totalSteps, 
  isGenerating, 
  onPrevious, 
  onNext, 
  validateCurrentStep 
}: NavigationProps) => {
  // Strictly limit to totalSteps - don't allow beyond step 8
  const isLastStep = currentStep >= totalSteps;
  const canGoNext = !isGenerating && validateCurrentStep() && currentStep < totalSteps;
  const displayStep = Math.min(currentStep, totalSteps);
  
  // Don't allow navigation beyond the final step
  const handleNext = () => {
    if (currentStep < totalSteps && canGoNext) {
      onNext();
    }
  };

  return (
    <div className="flex items-center justify-between pt-8 border-t border-gray-200">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep <= 1 || isGenerating}
        className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Previous</span>
      </Button>

      <div className="flex items-center space-x-3 text-sm text-gray-500">
        <Crown className="h-4 w-4 text-yellow-500" />
        <span className="font-medium">
          Step {displayStep} of {totalSteps}
        </span>
        <div className="w-24 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((displayStep / totalSteps) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      <Button
        onClick={handleNext}
        disabled={!canGoNext || isLastStep}
        className={`
          flex items-center space-x-2 px-6 py-3 transition-all duration-200
          ${isLastStep 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
          }
          ${!canGoNext || isLastStep ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105'}
        `}
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Processing...</span>
          </>
        ) : isLastStep ? (
          <>
            <CheckCircle className="h-4 w-4" />
            <span>Complete</span>
          </>
        ) : (
          <>
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};

export default Navigation;

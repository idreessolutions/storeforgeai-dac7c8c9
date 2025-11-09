
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
  // FIXED: Handle step 9 correctly (currentStep can be up to 9)
  const isLastStep = currentStep >= totalSteps;
  const canGoNext = !isGenerating && validateCurrentStep() && currentStep < totalSteps;
  
  // Don't allow navigation beyond the final step
  const handleNext = () => {
    if (currentStep < totalSteps && canGoNext) {
      onNext();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pt-8 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={currentStep <= 1 || isGenerating}
          className="flex items-center space-x-2 px-6 py-3 border border-gray-300 bg-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>← Previous</span>
        </Button>

        <div className="flex items-center space-x-3 text-sm text-gray-500">
          <Crown className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">
            Step {currentStep} of {totalSteps} — Store Identity ✅
          </span>
          <div className="w-24 bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.min((currentStep / totalSteps) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <Button
          onClick={handleNext}
          disabled={!canGoNext || isLastStep}
          className={`
            flex items-center space-x-2 px-8 py-3 transition-all duration-300 font-semibold text-base
            ${isLastStep 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
            }
            ${!canGoNext || isLastStep ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 animate-pulse'}
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
              <span>Continue to Next Step</span>
              <ChevronRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </div>
      
      {/* Reassurance text */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-500 italic">💡 You can edit everything later in Shopify</p>
      </div>
    </div>
  );
};

export default Navigation;

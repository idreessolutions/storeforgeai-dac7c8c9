
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle, Sparkles, Zap } from "lucide-react";

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
  const isLastStep = currentStep === totalSteps - 1;
  const canProceed = validateCurrentStep();

  return (
    <div className="flex justify-between items-center mt-12 pt-8 border-t border-gradient-to-r from-blue-200 to-purple-200">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0 || isGenerating}
        className="flex items-center gap-3 px-8 py-4 text-lg font-semibold border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowLeft className="h-5 w-5" />
        Previous
      </Button>

      <div className="flex items-center gap-4">
        {/* Step indicator with enhanced styling */}
        <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-xl border border-blue-200 shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
            <span className="text-gray-700 font-medium">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
          <div className="w-32 bg-gray-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <Button
          onClick={onNext}
          disabled={!canProceed || isGenerating}
          className={`
            flex items-center gap-3 px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
            ${isLastStep 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
            }
          `}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : isLastStep ? (
            <>
              <CheckCircle className="h-5 w-5" />
              Complete Setup
              <Zap className="h-4 w-4 text-yellow-300 animate-pulse" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Navigation;

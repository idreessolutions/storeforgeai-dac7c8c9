
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface NavigationProps {
  currentStep: number;
  totalSteps: number;
  isGenerating: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const Navigation = ({ 
  currentStep, 
  totalSteps, 
  isGenerating, 
  onPrevious, 
  onNext 
}: NavigationProps) => {
  return (
    <div className="flex justify-between mt-8">
      <Button 
        variant="outline" 
        onClick={onPrevious}
        disabled={currentStep === 1}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>
      
      <Button 
        onClick={onNext}
        disabled={isGenerating || currentStep === totalSteps}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        {currentStep === totalSteps ? "Launch Store" : "Next Step"}
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

export default Navigation;

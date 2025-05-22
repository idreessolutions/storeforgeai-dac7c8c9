
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: number;
}

const StepNavigation = ({ steps, currentStep }: StepNavigationProps) => {
  const progress = (currentStep / steps.length) * 100;

  return (
    <>
      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-2 ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div className="hidden sm:block">
                    <div className="font-medium text-sm">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-gray-200 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default StepNavigation;


import React from "react";
import { CheckCircle, Circle, Crown, Sparkles, Star, Zap } from "lucide-react";

interface Step {
  title: string;
  description: string;
  icon: React.ElementType;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: number;
}

const StepNavigation = ({ steps, currentStep }: StepNavigationProps) => {
  // Adjust for Get Started step (step 0) - navigation should show step 1 as index 0
  const navigationStep = currentStep - 1;
  
  return (
    <nav className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 py-8 px-6 shadow-lg border-b border-blue-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-blue-200 to-purple-200 rounded-full -translate-y-1/2 z-0"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full -translate-y-1/2 z-10 transition-all duration-700"
            style={{ width: `${(navigationStep / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((step, index) => {
            const isActive = index === navigationStep;
            const isCompleted = index < navigationStep;
            const isUpcoming = index > navigationStep;
            const IconComponent = step.icon;
            
            return (
              <div key={index} className="relative z-20 flex flex-col items-center">
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 transform
                  ${isActive ? 'bg-gradient-to-br from-blue-500 to-purple-600 scale-125 shadow-2xl' :
                    isCompleted ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl' :
                    'bg-gradient-to-br from-gray-300 to-gray-400 shadow-md'}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="h-8 w-8 text-white" />
                  ) : isActive ? (
                    <div className="relative">
                      <IconComponent className="h-8 w-8 text-white" />
                      <Crown className="absolute -top-2 -right-2 h-4 w-4 text-yellow-300 animate-bounce" />
                    </div>
                  ) : (
                    <Circle className="h-8 w-8 text-white" />
                  )}
                </div>
                
                <div className="mt-4 text-center max-w-32">
                  <h3 className={`
                    text-sm font-bold transition-all duration-300
                    ${isActive ? 'text-blue-700 scale-105' :
                      isCompleted ? 'text-green-700' :
                      'text-gray-500'}
                  `}>
                    {step.title}
                  </h3>
                  <p className={`
                    text-xs mt-1 transition-all duration-300
                    ${isActive ? 'text-blue-600' :
                      isCompleted ? 'text-green-600' :
                      'text-gray-400'}
                  `}>
                    {step.description}
                  </p>
                </div>

                {/* Active step decorations */}
                {isActive && (
                  <>
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <Star className="h-4 w-4 text-purple-500 animate-spin" />
                    </div>
                  </>
                )}

                {/* Completed step decorations */}
                {isCompleted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Zap className="h-4 w-4 text-green-500 animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default StepNavigation;

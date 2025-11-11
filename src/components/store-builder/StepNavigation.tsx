
import React from "react";
import { CheckCircle, Circle, Crown, Sparkles, Star, Zap } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: number;
}

const StepNavigation = ({ steps, currentStep }: StepNavigationProps) => {
  const totalSteps = 9;
  const displayStep = currentStep;
  // Show all steps 1-9 in navigation
  const stepsToShow = steps.slice(0, 9); // Show steps 1-9
  
  console.log(`🛠️ STEP NAV: Displaying step ${displayStep} of ${totalSteps} (current: ${currentStep})`);
  
  return (
    <nav className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 py-8 px-6 shadow-lg border-b border-blue-100">
      <div className="max-w-6xl mx-auto">
        {/* Progress Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Step {displayStep} of {totalSteps}
          </h2>
          <p className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
            {displayStep === 9 ? (
              '🎉 Your Store is Live!'
            ) : (
              <>
                <span 
                  dangerouslySetInnerHTML={{
                    __html: '<lord-icon src="https://cdn.lordicon.com/mjwccpnv.json" trigger="morph" stroke="bold" state="morph-launch" style="width:16px;height:16px"></lord-icon>'
                  }}
                />
                <span>Building Your Dream Store</span>
              </>
            )}
          </p>
        </div>
        
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-blue-200 to-purple-200 rounded-full -translate-y-1/2 z-0"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full -translate-y-1/2 z-10 transition-all duration-700"
            style={{ width: `${Math.max(0, ((displayStep - 1) / (totalSteps - 1)) * 100)}%` }}
          ></div>
          
          {stepsToShow.map((step, index) => {
            const stepNumber = index + 1; // Steps 1-9
            const isActive = stepNumber === displayStep;
            const isCompleted = stepNumber < displayStep;
            const isUpcoming = stepNumber > displayStep;
            
            // Special styling for Launch step (step 9)
            const isLaunchStep = stepNumber === 9;
            
            return (
              <div key={stepNumber} className="relative z-20 flex flex-col items-center">
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 transform
                  ${isActive && isLaunchStep ? 'bg-gradient-to-br from-green-500 to-emerald-600 scale-125 shadow-2xl animate-pulse' :
                    isActive ? 'bg-gradient-to-br from-blue-500 to-purple-600 scale-125 shadow-2xl' :
                    isCompleted ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl' :
                    'bg-gradient-to-br from-gray-300 to-gray-400 shadow-md'}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="h-8 w-8 text-white" />
                  ) : isActive ? (
                    <div className="relative">
                      <span className="text-2xl">{step.icon}</span>
                      {isLaunchStep ? (
                        <Star className="absolute -top-2 -right-2 h-4 w-4 text-yellow-300 animate-spin" />
                      ) : (
                        <Crown className="absolute -top-2 -right-2 h-4 w-4 text-yellow-300 animate-bounce" />
                      )}
                    </div>
                  ) : (
                    <span className="text-2xl opacity-50">{step.icon}</span>
                  )}
                </div>
                
                <div className="mt-4 text-center max-w-32">
                  <h3 className={`
                    text-sm font-bold transition-all duration-300
                    ${isActive && isLaunchStep ? 'text-green-700 scale-105' :
                      isActive ? 'text-blue-700 scale-105' :
                      isCompleted ? 'text-green-700' :
                      'text-gray-500'}
                  `}>
                    {step.title}
                  </h3>
                  <p className={`
                    text-xs mt-1 transition-all duration-300
                    ${isActive && isLaunchStep ? 'text-green-600' :
                      isActive ? 'text-blue-600' :
                      isCompleted ? 'text-green-600' :
                      'text-gray-400'}
                  `}>
                    {step.description}
                  </p>
                </div>

                {/* Active step decorations */}
                {isActive && !isLaunchStep && (
                  <>
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <Star className="h-4 w-4 text-purple-500 animate-spin" />
                    </div>
                  </>
                )}

                {/* Special decorations for Launch step */}
                {isActive && isLaunchStep && (
                  <>
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <Crown className="h-5 w-5 text-yellow-500 animate-bounce" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <Sparkles className="h-4 w-4 text-green-500 animate-pulse" />
                    </div>
                    <div className="absolute -top-2 -left-6">
                      <Star className="h-3 w-3 text-yellow-400 animate-ping" />
                    </div>
                    <div className="absolute -bottom-1 -right-6">
                      <Zap className="h-3 w-3 text-green-400 animate-pulse" />
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

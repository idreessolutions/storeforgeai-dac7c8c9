import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Eye } from "lucide-react";
import storeForgeLogoFull from "@/assets/storeforge-logo.png";
interface HeaderProps {
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  onViewAutomation?: () => void;
}
const Header = ({
  onBack,
  currentStep,
  totalSteps,
  onViewAutomation
}: HeaderProps) => {
  // Only show progress bar after Get Started page (step 0) and limit to max steps
  const showProgress = currentStep > 0 && currentStep <= totalSteps;
  const displayStep = Math.min(currentStep, totalSteps);
  const progressPercentage = showProgress ? (displayStep - 1) / (totalSteps - 1) * 100 : 0;
  return <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-6 py-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20 hover:text-white transition-all duration-200">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center space-x-3">
              <img src={storeForgeLogoFull} alt="StoreForge AI Logo" className="h-20 w-auto" />
              <div>
                <p className="text-indigo-200 text-sm">✅ Official Shopify Partner – AI-Powered Store Creation</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {onViewAutomation && <Button variant="ghost" onClick={onViewAutomation} className="text-white hover:bg-white/20 hover:text-white transition-all duration-200">
                <Eye className="h-4 w-4 mr-2" />
                View Automation
              </Button>}
            
            {showProgress && <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                <div 
                  dangerouslySetInnerHTML={{
                    __html: '<lord-icon src="https://cdn.lordicon.com/tetzmwxb.json" trigger="morph" stroke="bold" state="morph-select" style="width:20px;height:20px"></lord-icon>'
                  }}
                />
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    Step {displayStep} of {totalSteps}
                  </div>
                  <div className="w-32 bg-white/20 rounded-full h-2 mt-1">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-700 ease-out" style={{
                  width: `${progressPercentage}%`
                }}></div>
                  </div>
                </div>
              </div>}
          </div>
        </div>
      </div>
    </header>;
};
export default Header;
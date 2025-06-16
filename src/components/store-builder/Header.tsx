
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Sparkles, Crown, Star, Zap } from "lucide-react";

interface HeaderProps {
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  onViewAutomation?: () => void;
}

const Header = ({ onBack, currentStep, totalSteps, onViewAutomation }: HeaderProps) => {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-8 px-6 shadow-2xl relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full animate-bounce"></div>
        <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full animate-spin slow"></div>
        <div className="absolute bottom-16 right-1/4 w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white hover:bg-white/20 hover:text-white transition-all duration-300 transform hover:scale-110"
            size="lg"
          >
            <ArrowLeft className="h-6 w-6 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Crown className="h-12 w-12 text-yellow-400 animate-bounce" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-white animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Elite Store Builder
              </h1>
              <p className="text-blue-200 text-lg font-medium">
                Create your winning Shopify store with AI-powered excellence
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Step Progress Indicator */}
          <div className="hidden lg:flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-semibold">Step {currentStep + 1} of {totalSteps}</span>
            </div>
            <div className="w-32 bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {onViewAutomation && (
            <Button
              variant="ghost"
              onClick={onViewAutomation}
              className="text-white hover:bg-white/20 hover:text-white transition-all duration-300 transform hover:scale-110 border border-white/30"
              size="lg"
            >
              <Eye className="h-5 w-5 mr-2" />
              <Zap className="h-4 w-4 mr-2 text-yellow-400" />
              View Automation
            </Button>
          )}
        </div>
      </div>

      {/* Premium decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
    </header>
  );
};

export default Header;

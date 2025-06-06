
import React from "react";
import { ArrowLeft, Store, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  onViewAutomation?: () => void;
}

const Header = ({ onBack, currentStep, totalSteps, onViewAutomation }: HeaderProps) => {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
                <Store className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">StoreForge AI</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onViewAutomation && (
              <Button variant="outline" size="sm" onClick={onViewAutomation}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Automation Dashboard
              </Button>
            )}
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Step {currentStep} of {totalSteps}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

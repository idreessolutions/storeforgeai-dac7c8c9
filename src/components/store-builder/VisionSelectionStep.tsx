
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Target, TrendingUp, Users, Zap } from "lucide-react";

interface VisionSelectionStepProps {
  formData: {
    storeVision?: string;
    primaryGoal?: string;
  };
  handleInputChange: (field: string, value: string) => void;
  onNext: () => void;
}

const VisionSelectionStep = ({ formData, handleInputChange, onNext }: VisionSelectionStepProps) => {
  // Allow progression with default values if nothing is selected
  const handleContinue = () => {
    console.log('Continue button clicked');
    
    // Set default values if none selected
    if (!formData.storeVision) {
      console.log('Setting default store vision');
      handleInputChange('storeVision', 'side-hustle');
    }
    if (!formData.primaryGoal) {
      console.log('Setting default primary goal');
      handleInputChange('primaryGoal', 'quick-revenue');
    }
    
    // Small delay to ensure state updates
    setTimeout(() => {
      console.log('✅ VISION STEP: Calling onNext to advance to next step');
      onNext();
    }, 100);
  };

  const handleVisionChange = (value: string) => {
    console.log('Vision changed to:', value);
    handleInputChange('storeVision', value);
  };

  const handleGoalChange = (value: string) => {
    console.log('Goal changed to:', value);
    handleInputChange('primaryGoal', value);
  };

  console.log('VisionSelectionStep - formData:', formData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto pt-8">
        <Card className="bg-white shadow-2xl border-0">
          <CardContent className="p-8 sm:p-12 lg:p-16">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Define Your Store Vision ✨
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Let's start by understanding your goals so we can create the perfect store tailored to your vision.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Skip this step if you prefer - we'll use smart defaults to get you started quickly!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Store Vision */}
              <Card className="border-2 border-blue-100 hover:border-blue-300 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-blue-700">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    What's your store vision?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={formData.storeVision || ""} 
                    onValueChange={handleVisionChange}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                      <RadioGroupItem value="side-hustle" id="side-hustle" />
                      <Label htmlFor="side-hustle" className="font-medium cursor-pointer">
                        💰 Side hustle for extra income
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                      <RadioGroupItem value="full-business" id="full-business" />
                      <Label htmlFor="full-business" className="font-medium cursor-pointer">
                        🏢 Full-time business venture
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                      <RadioGroupItem value="test-market" id="test-market" />
                      <Label htmlFor="test-market" className="font-medium cursor-pointer">
                        🧪 Test a market/product idea
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                      <RadioGroupItem value="scale-existing" id="scale-existing" />
                      <Label htmlFor="scale-existing" className="font-medium cursor-pointer">
                        📈 Scale an existing business
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Primary Goal */}
              <Card className="border-2 border-purple-100 hover:border-purple-300 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-purple-700">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    What's your main goal?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={formData.primaryGoal || ""} 
                    onValueChange={handleGoalChange}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                      <RadioGroupItem value="quick-revenue" id="quick-revenue" />
                      <Label htmlFor="quick-revenue" className="font-medium cursor-pointer">
                        ⚡ Generate revenue quickly
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                      <RadioGroupItem value="build-brand" id="build-brand" />
                      <Label htmlFor="build-brand" className="font-medium cursor-pointer">
                        🎨 Build a lasting brand
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                      <RadioGroupItem value="learn-ecommerce" id="learn-ecommerce" />
                      <Label htmlFor="learn-ecommerce" className="font-medium cursor-pointer">
                        📚 Learn e-commerce skills
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                      <RadioGroupItem value="passive-income" id="passive-income" />
                      <Label htmlFor="passive-income" className="font-medium cursor-pointer">
                        🏖️ Create passive income
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Continue Button - Always enabled */}
            <div className="text-center">
              <Button
                onClick={handleContinue}
                className="w-full sm:w-auto px-12 py-4 text-lg font-bold rounded-xl transition-all transform hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Zap className="mr-3 h-5 w-5" />
                Continue to Store Creation
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                We'll use smart defaults if you skip any selections
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisionSelectionStep;

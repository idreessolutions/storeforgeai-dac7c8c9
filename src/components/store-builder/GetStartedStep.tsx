
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";

const GetStartedStep = () => {
  const steps = [
    { id: 1, title: "Details", active: false },
    { id: 2, title: "Create Store", active: false },
    { id: 3, title: "API Config", active: false },
    { id: 4, title: "Activate Plan", active: true },
    { id: 5, title: "Choose Color", active: false },
    { id: 6, title: "Products", active: false },
    { id: 7, title: "Launch", active: false }
  ];

  const colors = [
    '#000000', '#1E40AF', '#DC2626',
    '#16A34A', '#7C3AED', '#EA580C'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
            <Store className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Store Builder</h1>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Get Started</h2>
        <h3 className="text-lg font-semibold text-gray-700 mb-6">Start Your Free Affiliate Site Build</h3>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-6 overflow-x-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center space-x-1 ${
              step.active ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step.active 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {step.id}
              </div>
              <span className="text-xs font-medium hidden sm:block">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-6 h-px bg-gray-200 mx-1" />
            )}
          </div>
        ))}
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="py-8 px-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Theme Color</h3>
            
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
              {colors.map((color, index) => (
                <button
                  key={index}
                  className="w-full aspect-square rounded-xl transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 text-base font-semibold rounded-lg mb-6"
            >
              Next Step
            </Button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-3">
              <span className="text-xl mr-2">💡</span>
              <span className="text-yellow-800 font-medium text-sm">
                Create a free professional Affiliate Site in minutes. Follow the steps to get started and claim your website.
              </span>
            </div>
            
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-base font-semibold rounded-lg"
            >
              Start Your Store
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GetStartedStep;

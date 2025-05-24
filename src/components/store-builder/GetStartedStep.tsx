
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";

const GetStartedStep = () => {
  const steps = [
    { id: 1, title: "Choose Color", active: false },
    { id: 2, title: "Create Store", active: false },
    { id: 3, title: "API Config", active: false },
    { id: 4, title: "Choose Color", active: true },
    { id: 5, title: "Products", active: false },
    { id: 6, title: "Content", active: false },
    { id: 7, title: "Launch", active: false }
  ];

  const colors = [
    '#000000', '#1E40AF', '#DC2626',
    '#16A34A', '#7C3AED', '#EA580C'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <Store className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Store Builder</h1>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Started</h2>
        <h3 className="text-2xl font-semibold text-gray-700 mb-8">Start Your Free Affiliate Site Build</h3>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8 overflow-x-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center space-x-2 ${
              step.active ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.active 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {step.id}
              </div>
              <span className="text-sm font-medium hidden sm:block">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-8 h-px bg-gray-200 mx-2" />
            )}
          </div>
        ))}
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="py-12 px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Choose Theme Color</h3>
            
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto mb-8">
              {colors.map((color, index) => (
                <button
                  key={index}
                  className="w-full aspect-square rounded-2xl transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-12 py-3 text-lg font-semibold rounded-lg mb-8"
            >
              Next Step
            </Button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-2xl mr-2">💡</span>
              <span className="text-yellow-800 font-medium">
                Create a free professional Affiliate Site in minutes. Follow the steps on-screen to get started and claim your website.
              </span>
            </div>
            
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg"
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

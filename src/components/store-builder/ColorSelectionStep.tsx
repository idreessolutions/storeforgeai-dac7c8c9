
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ColorSelectionStepProps {
  formData: {
    themeColor: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

const ColorSelectionStep = ({ formData, handleInputChange }: ColorSelectionStepProps) => {
  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'Blue', value: '#1E40AF' },
    { name: 'Red', value: '#DC2626' },
    { name: 'Green', value: '#16A34A' },
    { name: 'Purple', value: '#7C3AED' },
    { name: 'Orange', value: '#EA580C' }
  ];

  return (
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardContent className="py-12 px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Theme Color</h2>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => handleInputChange('themeColor', color.value)}
              className={`w-full aspect-square rounded-2xl transition-all duration-200 hover:scale-105 ${
                formData.themeColor === color.value 
                  ? 'ring-4 ring-blue-400 ring-offset-4' 
                  : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
              }`}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>

        <div className="text-center">
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-12 py-3 text-lg font-semibold rounded-lg"
          >
            Next Step
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorSelectionStep;

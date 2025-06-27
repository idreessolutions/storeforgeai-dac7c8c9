
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Palette } from "lucide-react";

interface ColorSelectionStepProps {
  formData: {
    selectedColor: string;
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
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Palette className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Theme Color</h2>
          <p className="text-gray-600">Select a color that represents your brand</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => handleInputChange('selectedColor', color.value)}
              className={`w-full aspect-square rounded-2xl transition-all duration-200 hover:scale-105 ${
                formData.selectedColor === color.value 
                  ? 'ring-4 ring-blue-400 ring-offset-4' 
                  : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
              }`}
              style={{ backgroundColor: color.value }}
            >
              {formData.selectedColor === color.value && (
                <div className="w-full h-full rounded-2xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-current rounded-full"></div>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {formData.selectedColor && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Selected color: <span className="font-semibold" style={{ color: formData.selectedColor }}>
                {colors.find(c => c.value === formData.selectedColor)?.name}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ColorSelectionStep;

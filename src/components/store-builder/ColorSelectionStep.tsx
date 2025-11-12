
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Palette, ShoppingBag, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ColorSelectionStepProps {
  formData: {
    selectedColor: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

const ColorSelectionStep = ({ formData, handleInputChange }: ColorSelectionStepProps) => {
  const colors = [
    { name: 'Black', value: '#111111' },
    { name: 'Shopify Green', value: '#2EB052' },
    { name: 'Royal Blue', value: '#1F4ED8' },
    { name: 'Red', value: '#E11D48' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Purple', value: '#6D28D9' },
    { name: 'Orange', value: '#EA580C' },
    { name: 'Slate', value: '#334155' }
  ];

  // Simple contrast check
  const getContrastHint = (color: string) => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >>  8) & 0xff;
    const b = (rgb >>  0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    if (luma > 200) {
      return { icon: '⚠️', text: 'Consider a darker shade for better readability', color: 'text-yellow-600' };
    }
    return { icon: '✅', text: 'Great contrast for readability', color: 'text-green-600' };
  };

  const selectedColorData = colors.find(c => c.value === formData.selectedColor);
  const contrastHint = formData.selectedColor ? getContrastHint(formData.selectedColor) : null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Palette className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900">Choose Your Theme Color</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Pick a primary color to match your Shopify theme. You can change this any time.
        </p>
        
        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200 border-0 px-4 py-1.5 text-sm">🎨 Brand-Ready</Badge>
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 px-4 py-1.5 text-sm">🔍 Live Preview</Badge>
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 px-4 py-1.5 text-sm">♿ Accessible Contrast</Badge>
        </div>
      </div>

      {/* Color Picker Card */}
      <Card className="border-2 border-blue-100 hover:border-blue-200 transition-all duration-300 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardContent className="py-10 px-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pick a Color</h3>
              <p className="text-sm text-gray-600 mb-6">
                Choose your brand's primary color. We'll use it across your store's UI.
              </p>
            </div>

            {/* Color Swatches Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleInputChange('selectedColor', color.value)}
                  className={`
                    w-full aspect-square rounded-xl transition-all duration-200 
                    hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl
                    ${formData.selectedColor === color.value 
                      ? 'ring-4 ring-offset-4 shadow-2xl scale-105' 
                      : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 shadow-lg'
                    }
                  `}
                  style={{ 
                    backgroundColor: color.value
                  }}
                  title={color.name}
                >
                  {formData.selectedColor === color.value && (
                    <div className="w-full h-full rounded-xl flex items-center justify-center">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-5 h-5" style={{ color: color.value }} />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500 italic flex items-center gap-1">
              <span 
                dangerouslySetInnerHTML={{
                  __html: '<lord-icon src="https://cdn.lordicon.com/fomgzoeg.json" trigger="hover" stroke="bold" colors="primary:#e8e230,secondary:#66a1ee" style="width:14px;height:14px"></lord-icon>'
                }}
              />
              <span>Tip: Keep it bold and simple for the best conversion.</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview Card */}
      {formData.selectedColor && (
        <Card className="border-2 border-gray-200 shadow-lg bg-white">
          <CardContent className="py-8 px-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Live Preview</h3>
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              {/* Faux Store Header */}
              <div className="bg-white rounded-lg p-4 shadow-sm border-t-4" style={{ borderTopColor: formData.selectedColor }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" style={{ color: formData.selectedColor }} />
                    <span className="font-semibold text-gray-900">Your Store</span>
                  </div>
                  <button 
                    className="px-4 py-2 rounded-lg text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                    style={{ backgroundColor: formData.selectedColor }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
              
              {/* Faux Product Card */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">Sample Product</h4>
                    <p className="text-sm text-gray-600">$29.99</p>
                  </div>
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: formData.selectedColor }}
                  >
                    New
                  </span>
                </div>
                <a 
                  href="#" 
                  className="text-sm font-medium hover:underline transition-colors"
                  style={{ color: formData.selectedColor }}
                  onClick={(e) => e.preventDefault()}
                >
                  View Details →
                </a>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 italic text-center">
              Preview only. Your actual Shopify theme stays unchanged.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Accessibility Hint */}
      {contrastHint && (
        <div className={`text-center text-sm ${contrastHint.color} font-medium`}>
          {contrastHint.icon} {contrastHint.text}
        </div>
      )}

      {/* Selected Color Summary or Warning */}
      {formData.selectedColor ? (
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Selected color:</p>
          <div className="flex items-center justify-center gap-3">
            <div 
              className="w-8 h-8 rounded-full shadow-lg border-2 border-white ring-2 ring-gray-200"
              style={{ backgroundColor: formData.selectedColor }}
            />
            <span className="font-semibold text-gray-900">
              {selectedColorData?.name} ({formData.selectedColor})
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 inline-flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm font-semibold text-yellow-800">
              Please select a color above to continue
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorSelectionStep;


import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AIGenerationStepProps {
  isGenerating: boolean;
}

const AIGenerationStep = ({ isGenerating }: AIGenerationStepProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="py-12">
        <div className="text-center">
          {isGenerating ? (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">AI is Creating Your Store</h3>
              <div className="space-y-2 text-gray-600">
                <p>✨ Generating store name and branding...</p>
                <p>🎨 Creating custom logo and color scheme...</p>
                <p>📦 Curating product catalog...</p>
                <p>✍️ Writing product descriptions...</p>
              </div>
              <div className="w-full max-w-md mx-auto">
                <Progress value={65} className="h-2" />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Store Generated Successfully!</h3>
              <p className="text-gray-600">Your AI-powered store is ready for customization</p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="font-medium text-green-800">Store Name</div>
                  <div className="text-green-600">EcoLux Essentials</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="font-medium text-blue-800">Products</div>
                  <div className="text-blue-600">25 items curated</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="font-medium text-purple-800">Branding</div>
                  <div className="text-purple-600">Logo & colors ready</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIGenerationStep;

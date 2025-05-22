import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Sparkles, Store, Palette, Package, FileText, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StoreBuilderProps {
  onBack: () => void;
}

const StoreBuilder = ({ onBack }: StoreBuilderProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    niche: "",
    targetAudience: "",
    businessType: "",
    storeStyle: "",
    additionalInfo: ""
  });
  
  const { toast } = useToast();

  const steps = [
    { id: 1, title: "Store Details", icon: Store, description: "Tell us about your business" },
    { id: 2, title: "AI Generation", icon: Sparkles, description: "AI creates your store" },
    { id: 3, title: "Branding", icon: Palette, description: "Customize your brand" },
    { id: 4, title: "Products", icon: Package, description: "Review AI-generated products" },
    { id: 5, title: "Content", icon: FileText, description: "Finalize descriptions" },
    { id: 6, title: "Launch", icon: Rocket, description: "Export to Shopify" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!formData.niche || !formData.targetAudience) {
        toast({
          title: "Missing Information",
          description: "Please fill in your niche and target audience.",
          variant: "destructive",
        });
        return;
      }
      
      setIsGenerating(true);
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsGenerating(false);
      
      toast({
        title: "Store Generated!",
        description: "Your AI-powered store has been created successfully.",
      });
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
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
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Step {currentStep} of {steps.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-2 ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {<step.icon className="h-4 w-4" />}
                  </div>
                  <div className="hidden sm:block">
                    <div className="font-medium text-sm">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-gray-200 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 lg:px-8">
        {currentStep === 1 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Tell Us About Your Store</CardTitle>
              <p className="text-gray-600">Help our AI understand your vision</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="niche">Store Niche *</Label>
                  <Input
                    id="niche"
                    placeholder="e.g., Sustainable fashion, Tech gadgets, Home decor"
                    value={formData.niche}
                    onChange={(e) => handleInputChange('niche', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience *</Label>
                  <Input
                    id="targetAudience"
                    placeholder="e.g., Young professionals, Parents, Fitness enthusiasts"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Input
                    id="businessType"
                    placeholder="e.g., Dropshipping, Private label, Handmade"
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeStyle">Store Style Preference</Label>
                  <Input
                    id="storeStyle"
                    placeholder="e.g., Minimalist, Bold, Luxury, Playful"
                    value={formData.storeStyle}
                    onChange={(e) => handleInputChange('storeStyle', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Any specific requirements, preferences, or goals for your store..."
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
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
        )}

        {currentStep > 2 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {currentStep === 3 && "Customize Your Branding"}
                {currentStep === 4 && "Review Your Products"}
                {currentStep === 5 && "Finalize Content"}
                {currentStep === 6 && "Launch Your Store"}
              </CardTitle>
              <p className="text-gray-600">
                {currentStep === 3 && "Fine-tune your brand identity"}
                {currentStep === 4 && "Review and edit AI-generated products"}
                {currentStep === 5 && "Perfect your store content"}
                {currentStep === 6 && "Export to Shopify and go live"}
              </p>
            </CardHeader>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {React.createElement(steps[currentStep - 1].icon, { className: "h-8 w-8 text-gray-400" })}
                </div>
                <p>This step will be implemented in the next phase</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={handlePrevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button 
            onClick={handleNextStep}
            disabled={isGenerating || currentStep === steps.length}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {currentStep === steps.length ? "Launch Store" : "Next Step"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoreBuilder;

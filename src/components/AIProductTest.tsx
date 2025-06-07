
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Palette, ShoppingCart, Sparkles } from "lucide-react";

const AIProductTest = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNiche, setSelectedNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const niches = [
    'pets', 'tech', 'home', 'kitchen', 'beauty', 'fitness', 'fashion', 'baby', 'car', 'gifts'
  ];

  const audiences = [
    'Pet lovers', 'Tech enthusiasts', 'Home decorators', 'Cooking enthusiasts',
    'Beauty lovers', 'Fitness enthusiasts', 'Fashion lovers', 'New parents',
    'Car enthusiasts', 'Gift shoppers'
  ];

  const testAIWorkflow = async () => {
    if (!selectedNiche || !targetAudience) {
      toast({
        title: "Missing Information",
        description: "Please select both a niche and target audience",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🧪 Testing GPT-4 + DALL·E 3 workflow...', { selectedNiche, targetAudience });

      const { data, error } = await supabase.functions.invoke('generate-products', {
        body: {
          niche: selectedNiche,
          targetAudience: targetAudience,
          businessType: 'e-commerce',
          storeStyle: 'modern',
          themeColor: '#1E40AF',
          customInfo: 'Test generation for workflow validation'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        setResults(data);
        toast({
          title: "AI Workflow Success! 🎉",
          description: `Generated ${data.products?.length || 0} products using ${data.method_used}`
        });
      } else {
        throw new Error('Failed to generate products');
      }
    } catch (error: any) {
      console.error('AI workflow test failed:', error);
      toast({
        title: "AI Workflow Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            GPT-4 + DALL·E 3 Workflow Test
          </CardTitle>
          <CardDescription>
            Test the complete AI workflow: AliExpress → GPT-4 content generation → DALL·E 3 image creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Niche</label>
              <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a niche..." />
                </SelectTrigger>
                <SelectContent>
                  {niches.map(niche => (
                    <SelectItem key={niche} value={niche}>
                      {niche.charAt(0).toUpperCase() + niche.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Target Audience</label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose audience..." />
                </SelectTrigger>
                <SelectContent>
                  {audiences.map(audience => (
                    <SelectItem key={audience} value={audience}>
                      {audience}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={testAIWorkflow} 
            disabled={isGenerating || !selectedNiche || !targetAudience}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Generating AI Products...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Test GPT-4 + DALL·E 3 Workflow
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-green-600" />
              AI Generation Results
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary">{results.method_used}</Badge>
              <Badge variant="outline">{results.products?.length || 0} Products</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.products?.slice(0, 3).map((product: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{product.title}</h4>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">${product.price}</Badge>
                        <Badge variant="secondary">{product.category}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {product.gpt_content && (
                        <Badge variant="default" className="text-xs">
                          <Brain className="h-3 w-3 mr-1" />
                          GPT-4
                        </Badge>
                      )}
                      {product.images?.length > 0 && (
                        <Badge variant="default" className="text-xs">
                          <Palette className="h-3 w-3 mr-1" />
                          DALL·E 3
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {product.description?.substring(0, 200)}...
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Features:</span>
                      <ul className="list-disc list-inside text-gray-600 mt-1">
                        {product.features?.slice(0, 2).map((feature: string, idx: number) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium">Images Generated:</span>
                      <p className="text-gray-600 mt-1">
                        {product.images?.length || 0} DALL·E 3 images
                      </p>
                      {product.dalle_prompt_used && (
                        <p className="text-xs text-gray-500 mt-1">
                          Prompt: {product.dalle_prompt_used.substring(0, 50)}...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {results.products?.length > 3 && (
                <div className="text-center text-gray-500">
                  ... and {results.products.length - 3} more products
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIProductTest;

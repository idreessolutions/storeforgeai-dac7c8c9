
import React, { useState } from "react";
import StoreBuilder from "./StoreBuilder";
import AutomationDashboard from "./AutomationDashboard";
import AIProductTest from "./AIProductTest";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, BarChart3, Brain, Home } from "lucide-react";

const MainApp = () => {
  const [currentView, setCurrentView] = useState<'home' | 'builder' | 'automation' | 'test'>('home');

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const handleViewAutomation = () => {
    setCurrentView('automation');
  };

  if (currentView === 'builder') {
    return (
      <StoreBuilder 
        onBack={handleBackToHome}
        onViewAutomation={handleViewAutomation}
      />
    );
  }

  if (currentView === 'automation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-4 lg:px-8">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={handleBackToHome}>
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-xl font-semibold">Automation Dashboard</h1>
              <div></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8 lg:px-8">
          <AutomationDashboard />
        </div>
      </div>
    );
  }

  if (currentView === 'test') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-4 lg:px-8">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={handleBackToHome}>
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-xl font-semibold">AI Workflow Test</h1>
              <div></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8 lg:px-8">
          <AIProductTest />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            StoreForge AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-Powered Shopify Store Builder with GPT-4 + DALL·E 3
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4 text-blue-600" />
              GPT-4 Content
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4 text-green-600" />
              DALL·E 3 Images
            </div>
            <div className="flex items-center gap-1">
              <Store className="h-4 w-4 text-purple-600" />
              Auto Shopify Upload
            </div>
          </div>
        </div>

        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Store Builder
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Test
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="mt-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Build Your AI-Powered Store</h2>
                <p className="text-gray-600 mb-6">
                  Generate 10 winning products daily using GPT-4 content and DALL·E 3 images
                </p>
                <Button 
                  onClick={() => setCurrentView('builder')} 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Store className="h-5 w-5 mr-2" />
                  Start Building
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">GPT-4 Content</h3>
                  <p className="text-sm text-gray-600">
                    AI-generated titles, descriptions, and product features
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">DALL·E 3 Images</h3>
                  <p className="text-sm text-gray-600">
                    Professional product images generated from AI descriptions
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Store className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">Auto Upload</h3>
                  <p className="text-sm text-gray-600">
                    Seamless integration with Shopify for instant product listing
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="automation" className="mt-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Daily Automation Dashboard</h2>
                <p className="text-gray-600 mb-6">
                  Monitor your automated product generation and store performance
                </p>
                <Button 
                  onClick={() => setCurrentView('automation')} 
                  size="lg"
                  variant="outline"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  View Dashboard
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="test" className="mt-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Test AI Workflow</h2>
                <p className="text-gray-600 mb-6">
                  Test the GPT-4 + DALL·E 3 product generation workflow
                </p>
                <Button 
                  onClick={() => setCurrentView('test')} 
                  size="lg"
                  variant="outline"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Test AI Generation
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MainApp;

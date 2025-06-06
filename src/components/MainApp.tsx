
import React, { useState } from 'react';
import StoreBuilder from './StoreBuilder';
import AutomationDashboard from './AutomationDashboard';
import { Button } from './ui/button';
import { ArrowLeft, Settings, BarChart3 } from 'lucide-react';

type AppView = 'store-builder' | 'automation-dashboard';

const MainApp = () => {
  const [currentView, setCurrentView] = useState<AppView>('store-builder');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'automation-dashboard':
        return <AutomationDashboard />;
      case 'store-builder':
      default:
        return (
          <StoreBuilder 
            onBack={() => setCurrentView('store-builder')}
            onViewAutomation={() => setCurrentView('automation-dashboard')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      {currentView !== 'store-builder' && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Button
                variant="ghost"
                onClick={() => setCurrentView('store-builder')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Store Builder
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={currentView === 'automation-dashboard' ? 'default' : 'outline'}
                  onClick={() => setCurrentView('automation-dashboard')}
                  size="sm"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Automation Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={currentView === 'store-builder' ? '' : 'p-6'}>
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default MainApp;

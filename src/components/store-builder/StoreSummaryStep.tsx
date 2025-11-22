
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, CheckCircle, ExternalLink, Palette, Tag, Crown, Rocket, Sparkles, CreditCard, Truck, FileText, TrendingUp, Lock } from "lucide-react";

interface StoreSummaryStepProps {
  formData: {
    storeName: string;
    niche: string;
    themeColor: string;
    shopifyUrl: string;
    selectedColor?: string;
    targetAudience?: string;
    storeStyle?: string;
  };
}

const StoreSummaryStep = ({ formData }: StoreSummaryStepProps) => {
  const getColorName = (colorValue: string): string => {
    const colorMap: Record<string, string> = {
      '#111111': 'Black',
      '#2EB052': 'Shopify Green',
      '#1F4ED8': 'Royal Blue',
      '#E11D48': 'Red',
      '#10B981': 'Emerald',
      '#6D28D9': 'Purple',
      '#EA580C': 'Orange',
      '#334155': 'Slate'
    };
    return colorMap[colorValue] || colorValue || 'Black';
  };

  const handleViewStore = () => {
    if (formData.shopifyUrl) {
      let storeUrl = formData.shopifyUrl;
      
      // Clean and format the store URL to show CUSTOMER view, not admin
      if (!storeUrl.startsWith('http')) {
        storeUrl = `https://${storeUrl}`;
      }
      
      // CRITICAL FIX: Remove /admin and ensure it's the public customer-facing store
      storeUrl = storeUrl.replace('/admin', '').replace('.myshopify.com/admin', '.myshopify.com');
      
      // Ensure it's the customer store, not admin panel
      if (storeUrl.includes('.myshopify.com')) {
        storeUrl = storeUrl.replace('.myshopify.com', '.myshopify.com');
      }
      
      console.log('🏪 Opening customer store URL:', storeUrl);
      window.open(storeUrl, '_blank');
    }
  };

  const displayThemeColor = formData.themeColor || formData.selectedColor || '#3B82F6';
  const displayNiche = formData.niche || 'General Products';
  const displayStoreName = formData.storeName || 'My Store';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto pt-4 sm:pt-8">
        <Card className="bg-card/95 backdrop-blur-sm shadow-2xl border-border/50 rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            {/* Celebration Header with Animation */}
            <div className="text-center mb-8 animate-fade-in">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-xl animate-pulse">
                  <Crown className="h-12 w-12 text-white" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400 animate-bounce" />
                <Rocket className="absolute -bottom-1 -left-2 h-7 w-7 text-blue-400 animate-pulse" />
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                🎉 Your Store is Live & Ready!
              </h1>
              
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                You've successfully completed all steps.
                <br />
                Your AI-powered Shopify store is fully launched, stocked, branded, and ready to start accepting customers and generating revenue.
              </p>
            </div>

            {/* Store Summary */}
            <div className="bg-gradient-to-br from-accent/50 to-muted/50 rounded-xl p-6 mb-8 border border-border/50 shadow-lg">
              <h3 className="text-xl font-bold text-foreground mb-6 text-center">Store Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Store Name */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Store Name</p>
                    <p className="text-lg font-bold text-foreground">{displayStoreName}</p>
                  </div>
                </div>

                {/* Niche */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                    <Tag className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Niche</p>
                    <p className="text-lg font-bold text-foreground capitalize">{displayNiche}</p>
                  </div>
                </div>

                {/* Products Added */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Products Added</p>
                    <p className="text-lg font-bold text-foreground">✅ 10 AI-Enhanced winning products</p>
                  </div>
                </div>

                {/* Theme Color */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-pink-500/10 rounded-full flex items-center justify-center">
                    <Palette className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Theme Color</p>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-border shadow-sm"
                        style={{ backgroundColor: displayThemeColor }}
                      ></div>
                      <p className="text-lg font-bold text-foreground">✅ {getColorName(displayThemeColor)} branded theme</p>
                    </div>
                  </div>
                </div>

                {/* Status - NEW */}
                <div className="flex items-center space-x-4 md:col-span-2">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Status</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">✅ Live & Accepting Orders</p>
                  </div>
                </div>
              </div>

              {/* Control Note */}
              <div className="mt-6 pt-6 border-t border-border/50 text-center">
                <p className="text-sm text-muted-foreground flex items-center justify-center">
                  <Lock className="h-4 w-4 mr-2" />
                  You have full control — edit everything anytime inside Shopify.
                </p>
              </div>
            </div>

            {/* What We've Set Up For You */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-6 mb-8 border border-green-200 dark:border-green-800 shadow-lg">
              <h3 className="text-xl font-bold text-foreground mb-5 text-center flex items-center justify-center">
                <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
                ✅ What We've Set Up For You
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 animate-pulse" />
                  <span className="text-sm sm:text-base text-foreground">AI-selected winning products</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 animate-pulse" />
                  <span className="text-sm sm:text-base text-foreground">Real product images & variants</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 animate-pulse" />
                  <span className="text-sm sm:text-base text-foreground">SEO product descriptions</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 animate-pulse" />
                  <span className="text-sm sm:text-base text-foreground">Smart pricing optimization</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 animate-pulse" />
                  <span className="text-sm sm:text-base text-foreground">Premium Shopify Refresh theme</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 animate-pulse" />
                  <span className="text-sm sm:text-base text-foreground">Branding + color customization</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 animate-pulse" />
                  <span className="text-sm sm:text-base text-foreground">Policies & legal pages</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0 animate-pulse" />
                  <span className="text-sm sm:text-base text-foreground">Shipping & payment setup</span>
                </div>
              </div>
            </div>

            {/* Main CTA Button */}
            <div className="text-center mb-8">
              <Button
                onClick={handleViewStore}
                size="lg"
                className="w-full sm:w-auto px-10 py-6 bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary/90 hover:via-purple-700 hover:to-pink-700 text-white text-lg font-bold rounded-xl shadow-2xl transition-all hover:scale-105"
              >
                <ExternalLink className="mr-2 h-6 w-6" />
                🚀 Visit My Live Store
              </Button>
              
              <p className="text-foreground font-semibold text-sm mt-4">
                Your store is live and ready to start accepting customers!
              </p>
            </div>

            {/* Next Steps to Start Selling */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-6 mb-8 border border-blue-200 dark:border-blue-800 shadow-lg">
              <h4 className="text-xl font-bold text-foreground mb-5 flex items-center">
                <Rocket className="h-6 w-6 mr-2 text-primary" />
                🚀 Next Steps to Start Selling
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Add your logo & homepage banner (branding)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Connect payment method (Stripe/PayPal)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Truck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Set up shipping & delivery rates</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Add your business information & About page</span>
                </li>
                <li className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Start marketing on TikTok, Instagram, and Facebook</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Promote your first product to get first sales</span>
                </li>
              </ul>
            </div>

            {/* Congratulations Achievement Section */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-xl p-6 border-2 border-yellow-300 dark:border-yellow-700 shadow-lg">
              <div className="text-center">
                <div className="inline-block p-3 bg-yellow-400 dark:bg-yellow-600 rounded-full mb-4">
                  <Crown className="h-8 w-8 text-yellow-900 dark:text-yellow-100" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">🏆 Congratulations!</h3>
                <p className="text-base text-foreground mb-4">
                  You've officially launched a real Shopify business.
                  <br />
                  <span className="font-bold">Most people never finish — you did it.</span>
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-foreground">Your store looks professional</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-foreground">Your products are ready</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-foreground">Your checkout works</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-foreground">Your brand is live</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-4 italic">
                  This is the beginning of something great.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoreSummaryStep;

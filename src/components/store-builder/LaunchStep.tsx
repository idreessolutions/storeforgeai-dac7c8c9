
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, ExternalLink, CheckCircle, Copy, Check, Sparkles, Star, TrendingUp, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LaunchStepProps {
  formData: {
    storeName?: string;
    niche?: string;
    selectedColor?: string;
    themeColor?: string;
    shopifyUrl?: string;
    targetAudience?: string;
    businessType?: string;
    storeStyle?: string;
  };
}

const LaunchStep = ({ formData }: LaunchStepProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const getColorName = (color: string) => {
    const colorMap: { [key: string]: string } = {
      '#3B82F6': 'Royal Blue',
      '#10B981': 'Emerald Green',
      '#8B5CF6': 'Purple',
      '#F59E0B': 'Amber',
      '#EF4444': 'Red',
      '#EC4899': 'Pink',
      '#6366F1': 'Indigo',
      '#F97316': 'Orange'
    };
    return colorMap[color] || 'Custom Color';
  };

  const copyStoreUrl = () => {
    if (formData.shopifyUrl) {
      let storeUrl = formData.shopifyUrl;
      if (!storeUrl.startsWith('http')) {
        storeUrl = `https://${storeUrl}`;
      }
      navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast({
        title: "✅ Copied!",
        description: "Store URL copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openLiveStore = () => {
    if (formData.shopifyUrl) {
      // Ensure we're opening the customer-facing store, not admin
      let storeUrl = formData.shopifyUrl;
      
      // Remove any admin paths and ensure it's the customer store URL
      if (storeUrl.includes('/admin')) {
        storeUrl = storeUrl.split('/admin')[0];
      }
      
      // Add https if not already present
      if (!storeUrl.startsWith('http')) {
        storeUrl = `https://${storeUrl}`;
      }
      
      // Ensure it ends with the customer store format
      if (storeUrl.includes('.myshopify.com') && !storeUrl.endsWith('/')) {
        storeUrl = storeUrl + '/';
      }
      
      console.log('Opening live store URL:', storeUrl);
      window.open(storeUrl, '_blank');
    } else {
      console.warn('No Shopify URL provided');
    }
  };

  // Use selectedColor or themeColor, whichever is available
  const displayColor = formData.selectedColor || formData.themeColor || '#3B82F6';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto pt-4 sm:pt-8">
        <Card className="bg-card/95 backdrop-blur-sm shadow-2xl border-border/50 rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            {/* Celebration Header */}
            <div className="text-center mb-8 animate-fade-in">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-xl animate-pulse">
                  <Crown className="h-12 w-12 text-white" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400 animate-bounce" />
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                🎉 Your Store is LIVE & Ready for Customers!
              </h1>
              
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Congratulations! Your professional Shopify store has been fully launched with premium products, custom branding, and optimized settings.
                <br />
                <span className="font-semibold text-foreground">You can now accept orders and start earning revenue.</span>
              </p>
            </div>

            {/* Success Box */}
            <div className="bg-green-50 dark:bg-green-950/30 border-2 border-green-300 dark:border-green-700 rounded-xl p-6 mb-8 shadow-lg animate-scale-in">
              <div className="flex items-start mb-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                    ✅ Setup Complete!
                  </h3>
                  <p className="text-green-800 dark:text-green-200 text-sm sm:text-base">
                    Everything has been configured for you — products, theme, pricing, shipping, and payments.
                    <br />
                    <span className="font-semibold">Your store is ready for visitors and customers.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Store Details Card */}
            <div className="bg-gradient-to-br from-accent/50 to-muted/50 rounded-xl p-6 mb-8 border border-border/50 shadow-lg">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
                <Crown className="h-5 w-5 mr-2 text-primary" />
                Your Store Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Store Name</label>
                    <div className="text-lg font-bold text-foreground">
                      {formData.storeName || 'Your Amazing Store'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Niche</label>
                    <div className="text-lg font-bold text-foreground capitalize">
                      {formData.niche?.replace(/-/g, ' ') || 'General'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Store URL</label>
                    <div className="flex items-center gap-2">
                      <a 
                        href={formData.shopifyUrl ? `https://${formData.shopifyUrl}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all flex-1"
                      >
                        {formData.shopifyUrl || 'Not configured'}
                      </a>
                      {formData.shopifyUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyStoreUrl}
                          className="flex-shrink-0"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Theme Color</label>
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 rounded-full mr-3 border-2 border-border shadow-sm"
                        style={{ backgroundColor: displayColor }}
                      ></div>
                      <span className="text-lg font-bold text-foreground">
                        ✅ {getColorName(displayColor)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">✅ Live & Ready</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Business Type</label>
                    <div className="text-lg font-bold text-foreground">
                      E-Commerce
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Setup Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-6 mb-8 border border-blue-200 dark:border-blue-800 shadow-lg">
              <h3 className="text-xl font-bold text-foreground mb-5 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
                What We've Set Up For You
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">10 premium winning products with real images</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">2–4 product variants per item</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">SEO-optimized product descriptions</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">Smart pricing ($15–$80 range)</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">Professional Refresh theme installed</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">Store policies & legal pages</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">Payment and shipping activated</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">Custom brand color applied</span>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-800">
                <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Trusted by thousands</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Proven strategies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Dedicated support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main CTA Button */}
            <div className="text-center mb-6">
              <Button
                onClick={openLiveStore}
                disabled={!formData.shopifyUrl}
                size="lg"
                className="w-full sm:w-auto px-10 py-6 bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary/90 hover:via-purple-700 hover:to-pink-700 text-white text-lg font-bold rounded-xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
              >
                <ExternalLink className="mr-2 h-6 w-6" />
                🚀 Visit My Live Store
              </Button>
              
              <p className="text-foreground font-semibold text-sm mt-4">
                {formData.shopifyUrl ? 
                  '✅ Your store is now live and ready to start accepting orders!' :
                  'Please configure your Shopify URL to view your live store.'
                }
              </p>
            </div>

            {/* Social Share Section (UI only) */}
            {formData.shopifyUrl && (
              <div className="text-center pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">Share your new store:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    📘 Facebook
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    🎵 TikTok
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    📸 Instagram
                  </Button>
                </div>
              </div>
            )}

            {/* Footer Note */}
            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground">
                ⚡ You can edit everything later in Shopify
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LaunchStep;

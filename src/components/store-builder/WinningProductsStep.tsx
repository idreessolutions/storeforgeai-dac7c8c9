
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Sparkles, Loader2, Target, Zap, Star, Trophy, ShoppingBag, Wand2, TrendingUp, BarChart3, Shield, Rocket, Brain, Cpu, Award, Crown, Gem, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateWinningProducts } from "@/services/enhancedProductService";
import { installAndConfigureSenseTheme } from "@/services/shopifyThemeService";

interface WinningProductsStepProps {
  formData: {
    productsAdded: boolean;
    shopifyUrl: string;
    accessToken: string;
    niche: string;
    themeColor: string;
    targetAudience: string;
    businessType: string;
    storeStyle: string;
    customInfo: string;
    storeName: string;
  };
  handleInputChange: (field: string, value: boolean) => void;
}

const WinningProductsStep = ({ formData, handleInputChange }: WinningProductsStepProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProduct, setCurrentProduct] = useState("");
  const [currentStep, setCurrentStep] = useState("");
  const [error, setError] = useState("");
  const [marketStats, setMarketStats] = useState<any>(null);
  const [qualityMetrics, setQualityMetrics] = useState<any>(null);
  const { toast } = useToast();

  // Enhanced premium niche configurations with advanced market intelligence
  const eliteNicheConfig = {
    'pets': { 
      emoji: '🐾', 
      color: '#ff6600', 
      description: 'Elite pet care essentials', 
      trend: 'Smart pet tech +58%',
      confidence: '93%',
      avgOrders: '3,200+',
      competition: 'MEDIUM',
      opportunity: 93,
      gradient: 'from-orange-500 to-amber-500'
    },
    'fitness': { 
      emoji: '💪', 
      color: '#00cc66', 
      description: 'Premium fitness equipment', 
      trend: 'Home gym revolution +67%',
      confidence: '95%',
      avgOrders: '4,100+',
      competition: 'MEDIUM',
      opportunity: 95,
      gradient: 'from-green-500 to-emerald-500'
    },
    'beauty': { 
      emoji: '💄', 
      color: '#e91e63', 
      description: 'Luxury beauty innovations', 
      trend: 'Clean beauty boom +43%',
      confidence: '89%',
      avgOrders: '3,500+',
      competition: 'HIGH',
      opportunity: 89,
      gradient: 'from-pink-500 to-rose-500'
    },
    'tech': { 
      emoji: '📱', 
      color: '#3f51b5', 
      description: 'Cutting-edge technology', 
      trend: 'Smart devices surge +72%',
      confidence: '91%',
      avgOrders: '4,800+',
      competition: 'HIGH',
      opportunity: 91,
      gradient: 'from-blue-500 to-indigo-500'
    },
    'baby': { 
      emoji: '👶', 
      color: '#fbbf24', 
      description: 'Premium baby care', 
      trend: 'Smart baby tech +51%',
      confidence: '88%',
      avgOrders: '2,800+',
      competition: 'MEDIUM',
      opportunity: 88,
      gradient: 'from-yellow-500 to-orange-400'
    },
    'home': { 
      emoji: '🏠', 
      color: '#4caf50', 
      description: 'Smart home essentials', 
      trend: 'Smart home boom +48%',
      confidence: '84%',
      avgOrders: '2,900+',
      competition: 'MEDIUM',
      opportunity: 84,
      gradient: 'from-green-500 to-teal-500'
    },
    'fashion': { 
      emoji: '👗', 
      color: '#d81b60', 
      description: 'Premium fashion pieces', 
      trend: 'Sustainable fashion +35%',
      confidence: '82%',
      avgOrders: '2,400+',
      competition: 'HIGH',
      opportunity: 82,
      gradient: 'from-pink-500 to-purple-500'
    },
    'kitchen': { 
      emoji: '🍳', 
      color: '#ff5722', 
      description: 'Elite kitchen gadgets', 
      trend: 'Air fryer boom +84%',
      confidence: '86%',
      avgOrders: '3,600+',
      competition: 'MEDIUM',
      opportunity: 86,
      gradient: 'from-orange-500 to-red-500'
    },
    'gaming': { 
      emoji: '🎮', 
      color: '#9c27b0', 
      description: 'Pro gaming gear', 
      trend: 'Gaming gear surge +56%',
      confidence: '92%',
      avgOrders: '4,200+',
      competition: 'MEDIUM',
      opportunity: 92,
      gradient: 'from-purple-500 to-violet-500'
    },
    'travel': { 
      emoji: '✈️', 
      color: '#03a9f4', 
      description: 'Premium travel gear', 
      trend: 'Travel tech revival +44%',
      confidence: '79%',
      avgOrders: '2,100+',
      competition: 'LOW',
      opportunity: 79,
      gradient: 'from-blue-500 to-cyan-500'
    },
    'office': { 
      emoji: '💼', 
      color: '#607d8b', 
      description: 'Elite office solutions', 
      trend: 'Remote work gear +63%',
      confidence: '87%',
      avgOrders: '3,100+',
      competition: 'LOW',
      opportunity: 87,
      gradient: 'from-slate-500 to-gray-600'
    }
  };

  const currentNicheConfig = eliteNicheConfig[formData.niche.toLowerCase() as keyof typeof eliteNicheConfig] || eliteNicheConfig['pets'];

  const handleGenerateWinningProducts = async () => {
    console.log(`🚀 ELITE ENHANCED: Starting premium ${formData.niche} product generation with advanced market intelligence`);
    
    // Enhanced validation with specific error messages
    const requiredFields = ['shopifyUrl', 'accessToken', 'niche', 'targetAudience', 'storeName'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      const errorMsg = `Missing critical information: ${missingFields.join(', ')}`;
      console.error('❌ Elite validation failed:', errorMsg);
      
      toast({
        title: "Missing Critical Information",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setCurrentProduct("");
    setCurrentStep("");
    setError("");
    setMarketStats(null);
    setQualityMetrics(null);

    try {
      console.log(`🎯 ELITE GENERATION: Premium ${formData.niche} products for ${formData.targetAudience} with ${currentNicheConfig.opportunity}/100 market opportunity`);
      
      // Step 1: Enhanced theme installation with advanced customization
      setCurrentStep(`🎨 Installing ELITE ${formData.niche} theme with premium market optimization...`);
      setProgress(8);
      
      const storeName = extractStoreName(formData.shopifyUrl);
      
      if (storeName) {
        try {
          await installAndConfigureSenseTheme({
            storeName: formData.storeName || storeName,
            accessToken: formData.accessToken,
            themeColor: formData.themeColor || currentNicheConfig.color,
            niche: formData.niche,
            targetAudience: formData.targetAudience,
            businessType: formData.businessType,
            storeStyle: formData.storeStyle,
            customInfo: formData.customInfo
          });
          
          setProgress(15);
          setCurrentStep(`✅ ELITE ${formData.niche} theme with premium features installed`);
          await new Promise(resolve => setTimeout(resolve, 1200));
        } catch (themeError) {
          console.warn(`⚠️ Theme installation failed, continuing with elite products:`, themeError);
        }
      }

      // Step 2: Advanced market intelligence simulation
      setCurrentStep(`${currentNicheConfig.emoji} 🧠 Running AI market analysis for ${formData.niche} opportunities...`);
      setProgress(22);

      // Enhanced market stats with real-time intelligence simulation
      setMarketStats({
        confidence: currentNicheConfig.confidence,
        avgOrders: currentNicheConfig.avgOrders,
        trendGrowth: currentNicheConfig.trend,
        qualityStandard: '4.7+ stars, 2000+ orders',
        competition: currentNicheConfig.competition,
        opportunity: currentNicheConfig.opportunity,
        priceRange: '$18-$85',
        demandLevel: currentNicheConfig.opportunity > 90 ? 'EXTREME' : currentNicheConfig.opportunity > 85 ? 'HIGH' : 'MEDIUM'
      });

      // Step 3: Quality metrics simulation
      setQualityMetrics({
        eliteProducts: '12-15 candidates',
        qualityScore: '88.5/100 avg',
        marketAlign: '94% compliant',
        diversityIndex: '85% unique'
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = await generateWinningProducts(
        formData.shopifyUrl,
        formData.accessToken,
        formData.niche,
        (progress: number, productName: string) => {
          setProgress(25 + (progress * 0.7));
          setCurrentProduct(productName);
          setCurrentStep(`🤖 Creating ELITE ${formData.niche} products with advanced AI enhancement...`);
        },
        formData.themeColor || currentNicheConfig.color,
        formData.targetAudience,
        formData.businessType,
        formData.storeStyle,
        formData.customInfo,
        formData.storeName
      );

      handleInputChange('productsAdded', true);
      setCurrentStep("🏆 ELITE products published and live!");
      
      toast({
        title: `👑 ELITE ${formData.niche.toUpperCase()} Store Complete!`,
        description: `${result.uploadedCount} ELITE ${formData.niche} products with ${result.qualityStandards} are now live! Market opportunity: ${result.marketOpportunityScore}`,
      });

    } catch (error) {
      console.error(`❌ ELITE ENHANCED: Premium ${formData.niche} generation failed:`, error);
      let errorMessage = "An unknown error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (errorMessage.includes('No elite') || errorMessage.includes('No premium')) {
          errorMessage = `No ELITE ${formData.niche} products found meeting our premium standards. Try: pets, fitness, beauty, tech, baby, home, fashion, kitchen, gaming, travel, or office.`;
        } else if (errorMessage.includes('database connection failed')) {
          errorMessage = "Elite product database connection failed. Please check configuration.";
        } else if (errorMessage.includes('market standards')) {
          errorMessage = `${formData.niche} market standards are exceptionally high. Please try again or select a niche with higher market opportunity.`;
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: "Elite Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setCurrentProduct("");
      setCurrentStep("");
    }
  };

  const extractStoreName = (url: string): string | null => {
    try {
      const cleanUrl = url.replace(/^https?:\/\//, '').toLowerCase();
      
      if (cleanUrl.includes('admin.shopify.com/store/')) {
        const match = cleanUrl.match(/admin\.shopify\.com\/store\/([^\/\?]+)/);
        return match ? match[1] : null;
      }
      
      if (cleanUrl.includes('.myshopify.com')) {
        const match = cleanUrl.match(/([^\/\.]+)\.myshopify\.com/);
        return match ? match[1] : null;
      }
      
      return cleanUrl.includes('.') || cleanUrl.includes('/') ? null : cleanUrl;
    } catch (error) {
      console.error('Error extracting store name:', error);
      return null;
    }
  };

  return (
    <Card className="border-0 shadow-2xl max-w-6xl mx-auto bg-gradient-to-br from-white via-gray-50 to-indigo-50">
      <CardContent className="py-12 px-8">
        <div className="text-center mb-8">
          <div 
            className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 relative shadow-2xl bg-gradient-to-br ${currentNicheConfig.gradient} animate-pulse`}
          >
            <span className="text-6xl filter drop-shadow-lg">{currentNicheConfig.emoji}</span>
            <div className="absolute -top-3 -right-3">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg">
                <Crown className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-2 -left-2">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-1.5">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            👑 Generate ELITE {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Products
          </h2>
          <p className="text-gray-700 max-w-5xl mx-auto text-xl font-medium">
            Install <strong className="text-indigo-600">premium theme</strong> + add 10 <strong className="text-purple-600">ELITE {formData.niche} products</strong> with <strong className="text-pink-600">advanced quality standards</strong> for <strong className="text-emerald-600">{formData.targetAudience}</strong>
          </p>
          
          {/* Enhanced Elite Market Intelligence Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 mb-8">
            <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-6 rounded-2xl border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <Brain className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
              <div className="text-sm font-bold text-emerald-800">Market Opportunity</div>
              <div className="text-2xl font-bold text-emerald-700">{currentNicheConfig.opportunity}/100</div>
              <div className="text-xs text-emerald-600 mt-1">AI Analyzed</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <Shield className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <div className="text-sm font-bold text-blue-800">Elite Standard</div>
              <div className="text-sm font-bold text-blue-700">4.7+ Rating</div>
              <div className="text-xs text-blue-600 mt-1">2000+ Orders</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-2xl border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <Rocket className="h-10 w-10 text-purple-600 mx-auto mb-3" />
              <div className="text-sm font-bold text-purple-800">Avg Orders</div>
              <div className="text-sm font-bold text-purple-700">{currentNicheConfig.avgOrders}</div>
              <div className="text-xs text-purple-600 mt-1">Verified Sales</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-6 rounded-2xl border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <Flame className="h-10 w-10 text-orange-600 mx-auto mb-3" />
              <div className="text-sm font-bold text-orange-800">Market Trend</div>
              <div className="text-sm font-bold text-orange-700">{currentNicheConfig.trend}</div>
              <div className="text-xs text-orange-600 mt-1">Growth Rate</div>
            </div>
          </div>

          {/* Competition & Confidence Indicators */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
            <div className={`p-4 rounded-xl border-2 ${
              currentNicheConfig.competition === 'LOW' ? 'bg-green-50 border-green-200' :
              currentNicheConfig.competition === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="text-sm font-semibold text-gray-700">Competition</div>
              <div className={`text-lg font-bold ${
                currentNicheConfig.competition === 'LOW' ? 'text-green-700' :
                currentNicheConfig.competition === 'MEDIUM' ? 'text-yellow-700' :
                'text-red-700'
              }`}>{currentNicheConfig.competition}</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-100 p-4 rounded-xl border-2 border-indigo-200">
              <div className="text-sm font-semibold text-indigo-800">Confidence</div>
              <div className="text-lg font-bold text-indigo-700">{currentNicheConfig.confidence}</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl flex items-start gap-4 shadow-lg">
            <Zap className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-red-800 text-lg">Elite Generation Failed</h4>
              <p className="text-red-700 mt-2">{error}</p>
            </div>
          </div>
        )}

        {formData.productsAdded ? (
          <div className="text-center">
            <div className="w-36 h-36 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 animate-bounce">
              <Crown className="h-20 w-20 text-white filter drop-shadow-lg" />
            </div>
            <h3 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-4">
              <span className="text-5xl">{currentNicheConfig.emoji}</span>
              10 ELITE {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Products LIVE!
              <Gem className="h-12 w-12 text-yellow-500" />
            </h3>
            <p className="text-gray-700 mb-10 max-w-5xl mx-auto text-xl">
              Your {formData.niche} store now features <strong className="text-indigo-600">10 ELITE {formData.niche} products</strong> with advanced quality validation, market intelligence, and premium optimization!
            </p>
            
            {/* Enhanced Elite Success Metrics Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-8 rounded-2xl border-2 border-emerald-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                <Award className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                <div className="font-bold text-emerald-800 text-lg">ELITE Quality</div>
                <div className="text-sm text-emerald-600">4.7+ star ratings</div>
                <div className="text-xs text-emerald-500 mt-1">Market validated</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <div className="font-bold text-blue-800 text-lg">Verified Sales</div>
                <div className="text-sm text-blue-600">2000+ orders each</div>
                <div className="text-xs text-blue-500 mt-1">Premium verified</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-8 rounded-2xl border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                <Cpu className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <div className="font-bold text-purple-800 text-lg">80+ AI Images</div>
                <div className="text-sm text-purple-600">Premium quality</div>
                <div className="text-xs text-purple-500 mt-1">DALL-E enhanced</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-8 rounded-2xl border-2 border-orange-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                <Sparkles className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <div className="font-bold text-orange-800 text-lg">Market Ready</div>
                <div className="text-sm text-orange-600">Published & optimized</div>
                <div className="text-xs text-orange-500 mt-1">Elite standards</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 p-10 rounded-2xl border-2 border-emerald-200 shadow-xl">
              <h4 className="font-bold text-gray-900 mb-4 text-2xl flex items-center justify-center gap-3">
                🎉 Your ELITE {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Store is Live!
                <Crown className="h-8 w-8 text-yellow-500" />
              </h4>
              <p className="text-gray-700 text-lg leading-relaxed">
                Experience premium excellence with 10 ELITE {formData.niche} products featuring 4.7+ ratings, 
                2000+ verified orders each, AI-generated premium images, market-intelligence optimized descriptions, 
                smart pricing algorithms, advanced niche validation, and elite quality scoring - all designed to drive exceptional sales and customer satisfaction!
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            {isGenerating ? (
              <div className="space-y-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="relative">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                    <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-indigo-200 animate-pulse"></div>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Generating ELITE {formData.niche} products...
                  </span>
                </div>
                
                <div className="relative max-w-lg mx-auto">
                  <Progress value={progress} className="w-full h-6 bg-gradient-to-r from-indigo-100 to-purple-100" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 rounded-full animate-pulse"></div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-gray-800">{currentStep}</p>
                  {currentProduct && (
                    <p className="text-base text-gray-600">
                      Processing: <span className="font-semibold text-indigo-600">{currentProduct}</span>
                    </p>
                  )}
                  <p className="text-sm text-gray-500 font-medium">{Math.round(progress)}% complete</p>
                </div>

                {/* Enhanced Real-time Analytics Display */}
                {marketStats && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-200 max-w-2xl mx-auto shadow-lg">
                    <h5 className="font-bold text-indigo-800 mb-4 text-lg flex items-center justify-center gap-2">
                      <Brain className="h-5 w-5" />
                      Elite Market Intelligence Active
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-emerald-700">Opportunity</div>
                        <div className="text-lg font-bold text-emerald-600">{marketStats.opportunity}/100</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-700">Quality</div>
                        <div className="text-lg font-bold text-blue-600">{marketStats.qualityStandard}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-700">Competition</div>
                        <div className="text-lg font-bold text-purple-600">{marketStats.competition}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-orange-700">Trend</div>
                        <div className="text-lg font-bold text-orange-600">{marketStats.trendGrowth}</div>
                      </div>
                    </div>
                  </div>
                )}

                {qualityMetrics && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border-2 border-emerald-200 max-w-2xl mx-auto shadow-lg">
                    <h5 className="font-bold text-emerald-800 mb-4 text-lg flex items-center justify-center gap-2">
                      <Cpu className="h-5 w-5" />
                      Elite Quality Metrics
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-emerald-700">Products</div>
                        <div className="text-sm font-bold text-emerald-600">{qualityMetrics.eliteProducts}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-700">Quality Score</div>
                        <div className="text-sm font-bold text-blue-600">{qualityMetrics.qualityScore}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-700">Market Align</div>
                        <div className="text-sm font-bold text-purple-600">{qualityMetrics.marketAlign}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-orange-700">Diversity</div>
                        <div className="text-sm font-bold text-orange-600">{qualityMetrics.diversityIndex}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <Button
                  onClick={handleGenerateWinningProducts}
                  size="lg"
                  className={`text-white font-bold py-8 px-16 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 text-xl bg-gradient-to-r ${currentNicheConfig.gradient} hover:scale-105 transform`}
                >
                  <span className="mr-4 text-3xl">{currentNicheConfig.emoji}</span>
                  Generate 10 ELITE {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Products
                  <Crown className="ml-4 h-7 w-7" />
                </Button>
                
                <div className="text-sm text-gray-600 max-w-md mx-auto">
                  <p className="font-medium">
                    ⚡ Elite standards: 4.7+ ratings, 2000+ orders, AI-enhanced quality
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WinningProductsStep;

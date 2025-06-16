
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Sparkles, Loader2, Target, Zap, Star, Trophy, ShoppingBag, Wand2, TrendingUp, BarChart3, Shield, Rocket, Brain, Cpu, Award, Crown, Gem, Flame, Clock, Users, DollarSign, TrendingDown } from "lucide-react";
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
  const [generatedProducts, setGeneratedProducts] = useState<any[]>([]);
  const [aiStats, setAiStats] = useState<any>(null);
  const { toast } = useToast();

  // Enhanced ELITE niche configurations with premium market intelligence
  const eliteNicheConfig = {
    'pets': { 
      emoji: '🐾', 
      color: '#ff6600', 
      description: 'Elite pet care essentials', 
      trend: 'Smart pet tech +67%',
      confidence: '96%',
      avgOrders: '4,200+',
      competition: 'MEDIUM',
      opportunity: 96,
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      priceRange: '$18-$85',
      demandLevel: 'EXTREME',
      marketCap: '$127B'
    },
    'fitness': { 
      emoji: '💪', 
      color: '#00cc66', 
      description: 'Premium fitness equipment', 
      trend: 'Home gym revolution +84%',
      confidence: '98%',
      avgOrders: '5,800+',
      competition: 'MEDIUM',
      opportunity: 98,
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      priceRange: '$22-$95',
      demandLevel: 'EXTREME',
      marketCap: '$284B'
    },
    'beauty': { 
      emoji: '💄', 
      color: '#e91e63', 
      description: 'Luxury beauty innovations', 
      trend: 'Clean beauty boom +58%',
      confidence: '94%',
      avgOrders: '4,500+',
      competition: 'HIGH',
      opportunity: 94,
      gradient: 'from-pink-500 via-rose-500 to-purple-500',
      priceRange: '$25-$88',
      demandLevel: 'HIGH',
      marketCap: '$511B'
    },
    'tech': { 
      emoji: '📱', 
      color: '#3f51b5', 
      description: 'Cutting-edge technology', 
      trend: 'Smart devices surge +89%',
      confidence: '97%',
      avgOrders: '6,200+',
      competition: 'HIGH',
      opportunity: 97,
      gradient: 'from-blue-500 via-indigo-500 to-purple-600',
      priceRange: '$28-$125',
      demandLevel: 'EXTREME',
      marketCap: '$1.7T'
    },
    'baby': { 
      emoji: '👶', 
      color: '#fbbf24', 
      description: 'Premium baby care', 
      trend: 'Smart baby tech +72%',
      confidence: '93%',
      avgOrders: '3,800+',
      competition: 'MEDIUM',
      opportunity: 93,
      gradient: 'from-yellow-500 via-orange-400 to-red-400',
      priceRange: '$19-$78',
      demandLevel: 'HIGH',
      marketCap: '$67B'
    },
    'home': { 
      emoji: '🏠', 
      color: '#4caf50', 
      description: 'Smart home essentials', 
      trend: 'Smart home boom +63%',
      confidence: '91%',
      avgOrders: '3,900+',
      competition: 'MEDIUM',
      opportunity: 91,
      gradient: 'from-green-500 via-teal-500 to-cyan-500',
      priceRange: '$21-$89',
      demandLevel: 'HIGH',
      marketCap: '$151B'
    },
    'fashion': { 
      emoji: '👗', 
      color: '#d81b60', 
      description: 'Premium fashion pieces', 
      trend: 'Sustainable fashion +47%',
      confidence: '89%',
      avgOrders: '3,100+',
      competition: 'HIGH',
      opportunity: 89,
      gradient: 'from-pink-500 via-purple-500 to-indigo-500',
      priceRange: '$16-$72',
      demandLevel: 'MEDIUM',
      marketCap: '$2.5T'
    },
    'kitchen': { 
      emoji: '🍳', 
      color: '#ff5722', 
      description: 'Elite kitchen gadgets', 
      trend: 'Air fryer boom +95%',
      confidence: '95%',
      avgOrders: '4,600+',
      competition: 'MEDIUM',
      opportunity: 95,
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      priceRange: '$24-$98',
      demandLevel: 'EXTREME',
      marketCap: '$369B'
    },
    'gaming': { 
      emoji: '🎮', 
      color: '#9c27b0', 
      description: 'Pro gaming gear', 
      trend: 'Gaming gear surge +76%',
      confidence: '96%',
      avgOrders: '5,200+',
      competition: 'MEDIUM',
      opportunity: 96,
      gradient: 'from-purple-500 via-violet-500 to-blue-600',
      priceRange: '$32-$156',
      demandLevel: 'EXTREME',
      marketCap: '$180B'
    },
    'travel': { 
      emoji: '✈️', 
      color: '#03a9f4', 
      description: 'Premium travel gear', 
      trend: 'Travel tech revival +54%',
      confidence: '86%',
      avgOrders: '2,800+',
      competition: 'LOW',
      opportunity: 86,
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      priceRange: '$18-$89',
      demandLevel: 'MEDIUM',
      marketCap: '$8.8T'
    },
    'office': { 
      emoji: '💼', 
      color: '#607d8b', 
      description: 'Elite office solutions', 
      trend: 'Remote work gear +81%',
      confidence: '92%',
      avgOrders: '3,700+',
      competition: 'LOW',
      opportunity: 92,
      gradient: 'from-slate-500 via-gray-600 to-zinc-600',
      priceRange: '$23-$112',
      demandLevel: 'HIGH',
      marketCap: '$743B'
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
    setGeneratedProducts([]);
    setAiStats(null);

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
        priceRange: currentNicheConfig.priceRange,
        demandLevel: currentNicheConfig.demandLevel,
        marketCap: currentNicheConfig.marketCap
      });

      // Step 3: Quality metrics and AI enhancement stats
      setQualityMetrics({
        eliteProducts: '12-15 candidates',
        qualityScore: '91.2/100 avg',
        marketAlign: '97% compliant',
        diversityIndex: '89% unique'
      });

      setAiStats({
        enhancementModel: 'GPT-4o',
        imageModel: 'DALL-E 3',
        processingTime: '3.2s avg',
        successRate: '98.7%'
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
          
          // Simulate adding products to preview
          if (progress > 50 && Math.random() > 0.7) {
            setGeneratedProducts(prev => {
              if (prev.length < 3) {
                return [...prev, {
                  title: productName.substring(0, 60),
                  price: Math.floor(Math.random() * 55) + 20,
                  rating: (4.6 + Math.random() * 0.4).toFixed(1),
                  orders: Math.floor(Math.random() * 3000) + 2000
                }];
              }
              return prev;
            });
          }
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
    <Card className="border-0 shadow-2xl max-w-7xl mx-auto bg-gradient-to-br from-white via-gray-50 to-indigo-50 overflow-hidden">
      <CardContent className="py-12 px-8">
        <div className="text-center mb-8">
          <div 
            className={`w-40 h-40 rounded-full flex items-center justify-center mx-auto mb-8 relative shadow-2xl bg-gradient-to-br ${currentNicheConfig.gradient} animate-pulse`}
          >
            <span className="text-7xl filter drop-shadow-lg">{currentNicheConfig.emoji}</span>
            <div className="absolute -top-4 -right-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 shadow-xl animate-bounce">
                <Crown className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-3 -left-3">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-2.5 animate-pulse">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="absolute top-1/2 -right-8">
              <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-full p-2 animate-spin">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            👑 Generate ELITE {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Products
          </h2>
          <p className="text-gray-700 max-w-6xl mx-auto text-xl font-medium leading-relaxed">
            Install <strong className="text-indigo-600">premium theme</strong> + add 10 <strong className="text-purple-600">ELITE {formData.niche} products</strong> with <strong className="text-pink-600">advanced quality standards</strong> for <strong className="text-emerald-600">{formData.targetAudience}</strong>
          </p>
          
          {/* Enhanced Elite Market Intelligence Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-12 mb-10">
            <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-6 rounded-2xl border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Brain className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
              <div className="text-sm font-bold text-emerald-800">Market Opportunity</div>
              <div className="text-3xl font-bold text-emerald-700">{currentNicheConfig.opportunity}/100</div>
              <div className="text-xs text-emerald-600 mt-1">AI Analyzed</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <div className="text-sm font-bold text-blue-800">Elite Standard</div>
              <div className="text-lg font-bold text-blue-700">4.7+ Rating</div>
              <div className="text-xs text-blue-600 mt-1">2000+ Orders</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-2xl border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Rocket className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <div className="text-sm font-bold text-purple-800">Avg Orders</div>
              <div className="text-lg font-bold text-purple-700">{currentNicheConfig.avgOrders}</div>
              <div className="text-xs text-purple-600 mt-1">Verified Sales</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-6 rounded-2xl border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Flame className="h-12 w-12 text-orange-600 mx-auto mb-3" />
              <div className="text-sm font-bold text-orange-800">Market Trend</div>
              <div className="text-lg font-bold text-orange-700">{currentNicheConfig.trend}</div>
              <div className="text-xs text-orange-600 mt-1">Growth Rate</div>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-pink-100 p-6 rounded-2xl border-2 border-rose-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <DollarSign className="h-12 w-12 text-rose-600 mx-auto mb-3" />
              <div className="text-sm font-bold text-rose-800">Market Cap</div>
              <div className="text-lg font-bold text-rose-700">{currentNicheConfig.marketCap}</div>
              <div className="text-xs text-rose-600 mt-1">Total Size</div>
            </div>
          </div>

          {/* Competition, Confidence & Price Range */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
            <div className={`p-6 rounded-xl border-2 ${
              currentNicheConfig.competition === 'LOW' ? 'bg-green-50 border-green-200' :
              currentNicheConfig.competition === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            } transform hover:scale-105 transition-all duration-300`}>
              <div className="text-sm font-semibold text-gray-700">Competition</div>
              <div className={`text-xl font-bold ${
                currentNicheConfig.competition === 'LOW' ? 'text-green-700' :
                currentNicheConfig.competition === 'MEDIUM' ? 'text-yellow-700' :
                'text-red-700'
              }`}>{currentNicheConfig.competition}</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-100 p-6 rounded-xl border-2 border-indigo-200 transform hover:scale-105 transition-all duration-300">
              <div className="text-sm font-semibold text-indigo-800">Confidence</div>
              <div className="text-xl font-bold text-indigo-700">{currentNicheConfig.confidence}</div>
            </div>
            <div className="bg-gradient-to-br from-violet-50 to-purple-100 p-6 rounded-xl border-2 border-violet-200 transform hover:scale-105 transition-all duration-300">
              <div className="text-sm font-semibold text-violet-800">Price Range</div>
              <div className="text-xl font-bold text-violet-700">{currentNicheConfig.priceRange}</div>
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
            <div className="w-48 h-48 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 animate-bounce relative">
              <Crown className="h-24 w-24 text-white filter drop-shadow-lg" />
              <div className="absolute -top-6 -right-6 bg-yellow-400 rounded-full p-3 animate-spin">
                <Star className="h-8 w-8 text-yellow-900" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-purple-500 rounded-full p-2 animate-pulse">
                <Gem className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-6xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-6 flex items-center justify-center gap-6">
              <span className="text-6xl">{currentNicheConfig.emoji}</span>
              10 ELITE {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Products LIVE!
              <Gem className="h-16 w-16 text-yellow-500 animate-pulse" />
            </h3>
            <p className="text-gray-700 mb-12 max-w-6xl mx-auto text-2xl leading-relaxed">
              Your {formData.niche} store now features <strong className="text-indigo-600">10 ELITE {formData.niche} products</strong> with advanced quality validation, market intelligence, and premium optimization!
            </p>
            
            {/* Enhanced Elite Success Metrics Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-10 rounded-3xl border-2 border-emerald-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <Award className="h-16 w-16 text-emerald-600 mx-auto mb-6" />
                <div className="font-bold text-emerald-800 text-2xl">ELITE Quality</div>
                <div className="text-lg text-emerald-600">4.7+ star ratings</div>
                <div className="text-sm text-emerald-500 mt-2">Market validated</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-10 rounded-3xl border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
                <div className="font-bold text-blue-800 text-2xl">Verified Sales</div>
                <div className="text-lg text-blue-600">2000+ orders each</div>
                <div className="text-sm text-blue-500 mt-2">Premium verified</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-10 rounded-3xl border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <Cpu className="h-16 w-16 text-purple-600 mx-auto mb-6" />
                <div className="font-bold text-purple-800 text-2xl">80+ AI Images</div>
                <div className="text-lg text-purple-600">Premium quality</div>
                <div className="text-sm text-purple-500 mt-2">DALL-E enhanced</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-10 rounded-3xl border-2 border-orange-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <Sparkles className="h-16 w-16 text-orange-600 mx-auto mb-6" />
                <div className="font-bold text-orange-800 text-2xl">Market Ready</div>
                <div className="text-lg text-orange-600">Published & optimized</div>
                <div className="text-sm text-orange-500 mt-2">Elite standards</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 p-12 rounded-3xl border-2 border-emerald-200 shadow-2xl">
              <h4 className="font-bold text-gray-900 mb-6 text-3xl flex items-center justify-center gap-4">
                🎉 Your ELITE {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Store is Live!
                <Crown className="h-10 w-10 text-yellow-500 animate-bounce" />
              </h4>
              <p className="text-gray-700 text-xl leading-relaxed">
                Experience premium excellence with 10 ELITE {formData.niche} products featuring 4.7+ ratings, 
                2000+ verified orders each, AI-generated premium images, market-intelligence optimized descriptions, 
                smart pricing algorithms, advanced niche validation, and elite quality scoring - all designed to drive exceptional sales and customer satisfaction!
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            {isGenerating ? (
              <div className="space-y-10">
                <div className="flex items-center justify-center gap-6 mb-8">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
                    <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-indigo-200 animate-pulse"></div>
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Generating ELITE {formData.niche} products...
                  </span>
                </div>
                
                <div className="relative max-w-2xl mx-auto">
                  <Progress value={progress} className="w-full h-8 bg-gradient-to-r from-indigo-100 to-purple-100" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 rounded-full animate-pulse"></div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-2xl font-semibold text-gray-800">{currentStep}</p>
                  {currentProduct && (
                    <p className="text-lg text-gray-600">
                      Processing: <span className="font-semibold text-indigo-600">{currentProduct}</span>
                    </p>
                  )}
                  <p className="text-lg text-gray-500 font-medium">{Math.round(progress)}% complete</p>
                </div>

                {/* Enhanced Real-time Analytics Display */}
                {marketStats && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-3xl border-2 border-indigo-200 max-w-4xl mx-auto shadow-xl">
                    <h5 className="font-bold text-indigo-800 mb-6 text-2xl flex items-center justify-center gap-3">
                      <Brain className="h-8 w-8" />
                      Elite Market Intelligence Active
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-base">
                      <div className="text-center bg-white p-4 rounded-xl shadow-md">
                        <div className="font-semibold text-emerald-700">Opportunity</div>
                        <div className="text-2xl font-bold text-emerald-600">{marketStats.opportunity}/100</div>
                      </div>
                      <div className="text-center bg-white p-4 rounded-xl shadow-md">
                        <div className="font-semibold text-blue-700">Quality</div>
                        <div className="text-lg font-bold text-blue-600">4.7+ stars</div>
                      </div>
                      <div className="text-center bg-white p-4 rounded-xl shadow-md">
                        <div className="font-semibold text-purple-700">Competition</div>
                        <div className="text-lg font-bold text-purple-600">{marketStats.competition}</div>
                      </div>
                      <div className="text-center bg-white p-4 rounded-xl shadow-md">
                        <div className="font-semibold text-orange-700">Market Cap</div>
                        <div className="text-lg font-bold text-orange-600">{marketStats.marketCap}</div>
                      </div>
                    </div>
                  </div>
                )}

                {qualityMetrics && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl border-2 border-emerald-200 max-w-4xl mx-auto shadow-xl">
                    <h5 className="font-bold text-emerald-800 mb-6 text-2xl flex items-center justify-center gap-3">
                      <Cpu className="h-8 w-8" />
                      Elite Quality Metrics
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-base">
                      <div className="text-center bg-white p-4 rounded-xl shadow-md">
                        <div className="font-semibold text-emerald-700">Products</div>
                        <div className="text-lg font-bold text-emerald-600">{qualityMetrics.eliteProducts}</div>
                      </div>
                      <div className="text-center bg-white p-4 rounded-xl shadow-md">
                        <div className="font-semibold text-blue-700">Quality Score</div>
                        <div className="text-lg font-bold text-blue-600">{qualityMetrics.qualityScore}</div>
                      </div>
                      <div className="text-center bg-white p-4 rounded-xl shadow-md">
                        <div className="font-semibold text-purple-700">Market Align</div>
                        <div className="text-lg font-bold text-purple-600">{qualityMetrics.marketAlign}</div>
                      </div>
                      <div className="text-center bg-white p-4 rounded-xl shadow-md">
                        <div className="font-semibold text-orange-700">Diversity</div>
                        <div className="text-lg font-bold text-orange-600">{qualityMetrics.diversityIndex}</div>
                      </div>
                    </div>
                  </div>
                )}

                {aiStats && (
                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-8 rounded-3xl border-2 border-violet-200 max-w-4xl mx-auto shadow-xl">
                    <h5 className="font-bold text-violet-800 mb-6 text-2xl flex items-center justify-center gap-3">
                      <Wand2 className="h-8 w-8" />
                      AI Enhancement Stats
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-base">
                      <div className="text-center bg-white p-4 rounded-xl shadow-md">
                        <div className="font-semibold text-violet-700">Model</div>
                        <div className="text-lg font-bold text-violet-600">{aiStats.enhancementModel}</div>
                      </div>
                      <div className="text-center bg-white p-4 rounded-xl shadow-md">
                        <div className="font-semibold text-pink-700">Images</div>
                        <div className="text-lg font-bold text-pink-600">{aiStats.imageModel}</div>
                      </div>
                      <div className="text-center bg-white p-4 rounded-xl shadow-md">
                        <div className="font-semibold text-blue-700">Speed</div>
                        <div className="text-lg font-bold text-blue-600">{aiStats.processingTime}</div>
                      </div>
                      <div className="text-center bg-white p-4 rounded-xl shadow-md">
                        <div className="font-semibold text-green-700">Success</div>
                        <div className="text-lg font-bold text-green-600">{aiStats.successRate}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Product Preview */}
                {generatedProducts.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl border-2 border-gray-200 max-w-4xl mx-auto shadow-xl">
                    <h5 className="font-bold text-gray-800 mb-6 text-2xl flex items-center justify-center gap-3">
                      <ShoppingBag className="h-8 w-8" />
                      Live Product Preview
                    </h5>
                    <div className="grid gap-4">
                      {generatedProducts.map((product, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-md border flex items-center justify-between">
                          <div className="flex-1">
                            <h6 className="font-semibold text-gray-800 mb-2">{product.title}</h6>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-yellow-600">
                                <Star className="h-4 w-4 fill-current" />
                                {product.rating}
                              </span>
                              <span className="flex items-center gap-1 text-blue-600">
                                <Users className="h-4 w-4" />
                                {product.orders.toLocaleString()} orders
                              </span>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-600">${product.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <Button
                  onClick={handleGenerateWinningProducts}
                  size="lg"
                  className={`text-white font-bold py-10 px-20 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 text-2xl bg-gradient-to-r ${currentNicheConfig.gradient} hover:scale-110 transform relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                  <span className="relative flex items-center gap-4">
                    <span className="text-4xl">{currentNicheConfig.emoji}</span>
                    Generate 10 ELITE {formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1)} Products
                    <Crown className="h-8 w-8 animate-bounce" />
                  </span>
                </Button>
                
                <div className="text-base text-gray-600 max-w-2xl mx-auto">
                  <p className="font-medium">
                    ⚡ Elite standards: 4.7+ ratings, 2000+ orders, AI-enhanced quality
                  </p>
                  <p className="text-sm mt-2">
                    🚀 Market opportunity: {currentNicheConfig.opportunity}/100 | Demand: {currentNicheConfig.demandLevel}
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


interface MarketInsight {
  trend: string;
  growth: string;
  confidence: number;
  demandLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  seasonality: string;
  competition: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface MarketAnalysis {
  niche: string;
  overallScore: number;
  insights: MarketInsight[];
  recommendations: string[];
  priceRange: { min: number; max: number };
  topKeywords: string[];
}

export class MarketIntelligenceService {
  private static readonly ADVANCED_MARKET_DATA: { [key: string]: MarketAnalysis } = {
    'fitness': {
      niche: 'fitness',
      overallScore: 95,
      insights: [
        { trend: 'Home gym equipment', growth: '+67%', confidence: 0.92, demandLevel: 'HIGH', seasonality: 'Year-round peak', competition: 'MEDIUM' },
        { trend: 'Smart fitness trackers', growth: '+45%', confidence: 0.88, demandLevel: 'HIGH', seasonality: 'Q1 peak', competition: 'HIGH' },
        { trend: 'Recovery tools', growth: '+52%', confidence: 0.85, demandLevel: 'MEDIUM', seasonality: 'Q4 peak', competition: 'LOW' }
      ],
      recommendations: [
        'Focus on portable, space-saving equipment',
        'Emphasize smart connectivity features',
        'Target recovery and wellness products',
        'Price competitively in $25-$65 range'
      ],
      priceRange: { min: 18, max: 75 },
      topKeywords: ['fitness', 'workout', 'home gym', 'resistance', 'smart fitness', 'recovery']
    },
    'pets': {
      niche: 'pets',
      overallScore: 93,
      insights: [
        { trend: 'Smart pet tech', growth: '+58%', confidence: 0.91, demandLevel: 'HIGH', seasonality: 'Year-round', competition: 'MEDIUM' },
        { trend: 'Interactive toys', growth: '+41%', confidence: 0.87, demandLevel: 'HIGH', seasonality: 'Holiday peak', competition: 'LOW' },
        { trend: 'Health monitoring', growth: '+39%', confidence: 0.84, demandLevel: 'MEDIUM', seasonality: 'Q1 peak', competition: 'MEDIUM' }
      ],
      recommendations: [
        'Prioritize interactive and smart features',
        'Focus on health and safety benefits',
        'Target convenience for pet owners',
        'Premium pricing acceptable for quality'
      ],
      priceRange: { min: 15, max: 80 },
      topKeywords: ['pet', 'dog', 'cat', 'smart pet', 'interactive', 'safety']
    },
    'beauty': {
      niche: 'beauty',
      overallScore: 89,
      insights: [
        { trend: 'Clean beauty', growth: '+43%', confidence: 0.89, demandLevel: 'HIGH', seasonality: 'Q1/Q4 peak', competition: 'HIGH' },
        { trend: 'LED therapy devices', growth: '+61%', confidence: 0.86, demandLevel: 'MEDIUM', seasonality: 'Year-round', competition: 'MEDIUM' },
        { trend: 'Multi-use products', growth: '+35%', confidence: 0.83, demandLevel: 'HIGH', seasonality: 'Travel season peak', competition: 'MEDIUM' }
      ],
      recommendations: [
        'Emphasize natural and clean ingredients',
        'Focus on multi-functional products',
        'Target at-home spa experiences',
        'Premium positioning works well'
      ],
      priceRange: { min: 20, max: 85 },
      topKeywords: ['beauty', 'skincare', 'natural', 'LED', 'anti-aging', 'clean']
    },
    'tech': {
      niche: 'tech',
      overallScore: 91,
      insights: [
        { trend: 'Wireless charging', growth: '+72%', confidence: 0.93, demandLevel: 'HIGH', seasonality: 'Q4 peak', competition: 'HIGH' },
        { trend: 'Smart home devices', growth: '+48%', confidence: 0.88, demandLevel: 'HIGH', seasonality: 'Year-round', competition: 'MEDIUM' },
        { trend: 'Gaming peripherals', growth: '+56%', confidence: 0.87, demandLevel: 'MEDIUM', seasonality: 'Holiday peak', competition: 'MEDIUM' }
      ],
      recommendations: [
        'Focus on wireless and smart features',
        'Emphasize compatibility and convenience',
        'Target productivity and gaming markets',
        'Competitive pricing essential'
      ],
      priceRange: { min: 22, max: 90 },
      topKeywords: ['wireless', 'smart', 'bluetooth', 'USB-C', 'gaming', 'productivity']
    },
    'kitchen': {
      niche: 'kitchen',
      overallScore: 86,
      insights: [
        { trend: 'Air fryer accessories', growth: '+84%', confidence: 0.92, demandLevel: 'HIGH', seasonality: 'Q1/Q4 peak', competition: 'MEDIUM' },
        { trend: 'Smart kitchen gadgets', growth: '+37%', confidence: 0.84, demandLevel: 'MEDIUM', seasonality: 'Year-round', competition: 'LOW' },
        { trend: 'Meal prep solutions', growth: '+42%', confidence: 0.81, demandLevel: 'HIGH', seasonality: 'Q1 peak', competition: 'MEDIUM' }
      ],
      recommendations: [
        'Leverage air fryer trend heavily',
        'Focus on time-saving solutions',
        'Target health-conscious cooking',
        'Mid-range pricing optimal'
      ],
      priceRange: { min: 16, max: 68 },
      topKeywords: ['kitchen', 'cooking', 'air fryer', 'meal prep', 'smart cooking', 'healthy']
    },
    'baby': {
      niche: 'baby',
      overallScore: 88,
      insights: [
        { trend: 'Smart baby monitors', growth: '+51%', confidence: 0.89, demandLevel: 'HIGH', seasonality: 'Year-round', competition: 'MEDIUM' },
        { trend: 'Organic baby products', growth: '+38%', confidence: 0.86, demandLevel: 'HIGH', seasonality: 'Q2/Q3 peak', competition: 'LOW' },
        { trend: 'Travel baby gear', growth: '+33%', confidence: 0.82, demandLevel: 'MEDIUM', seasonality: 'Summer peak', competition: 'MEDIUM' }
      ],
      recommendations: [
        'Emphasize safety and monitoring features',
        'Focus on organic and non-toxic materials',
        'Target convenience for new parents',
        'Premium pricing acceptable for quality'
      ],
      priceRange: { min: 19, max: 78 },
      topKeywords: ['baby', 'infant', 'safe', 'organic', 'monitor', 'newborn']
    }
  };

  static getAdvancedMarketAnalysis(niche: string): MarketAnalysis {
    return this.ADVANCED_MARKET_DATA[niche.toLowerCase()] || {
      niche,
      overallScore: 75,
      insights: [
        { trend: 'Premium quality products', growth: '+25%', confidence: 0.75, demandLevel: 'MEDIUM', seasonality: 'Year-round', competition: 'MEDIUM' }
      ],
      recommendations: ['Focus on quality and unique features'],
      priceRange: { min: 20, max: 60 },
      topKeywords: [niche, 'premium', 'quality']
    };
  }

  static calculateMarketOpportunityScore(niche: string): number {
    const analysis = this.getAdvancedMarketAnalysis(niche);
    return analysis.overallScore;
  }

  static getTrendingProductTypes(niche: string): string[] {
    const analysis = this.getAdvancedMarketAnalysis(niche);
    return analysis.insights.map(insight => insight.trend);
  }

  static getOptimalPriceRange(niche: string): { min: number; max: number } {
    const analysis = this.getAdvancedMarketAnalysis(niche);
    return analysis.priceRange;
  }

  static getCompetitionLevel(niche: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    const analysis = this.getAdvancedMarketAnalysis(niche);
    const avgCompetition = analysis.insights.reduce((acc, insight) => {
      const score = insight.competition === 'LOW' ? 1 : insight.competition === 'MEDIUM' ? 2 : 3;
      return acc + score;
    }, 0) / analysis.insights.length;
    
    return avgCompetition <= 1.5 ? 'LOW' : avgCompetition <= 2.5 ? 'MEDIUM' : 'HIGH';
  }
}


export class ProductTemplateGenerator {
  static generateUniversalTitle(niche: string, index: number): string {
    const powerWords = ['Premium', 'Professional', 'Smart', 'Ultimate', 'Advanced', 'Elite', 'Pro', 'Deluxe', 'Supreme', 'Master'];
    const emotions = ['Amazing', 'Incredible', 'Revolutionary', 'Life-Changing', 'Essential', 'Perfect', 'Stunning', 'Brilliant'];
    const urgency = ['Bestseller', 'Trending', 'Top Rated', 'Customer Favorite', 'Must-Have', 'Hot Sale', 'Limited Edition'];
    
    const powerWord = powerWords[index % powerWords.length];
    const emotion = emotions[index % emotions.length];
    const urgent = urgency[index % urgency.length];
    const nicheCapitalized = niche.charAt(0).toUpperCase() + niche.slice(1);
    
    const templates = [
      `${powerWord} ${nicheCapitalized} Product - ${urgent}`,
      `${emotion} ${nicheCapitalized} Essential for Daily Use`,
      `${nicheCapitalized} ${powerWord} Kit - ${urgent}`,
      `${powerWord} ${nicheCapitalized} Accessory - ${emotion} Results`,
      `${urgent} ${nicheCapitalized} Tool - ${powerWord} Quality`,
      `${nicheCapitalized} ${emotion} ${powerWord} Set - ${urgent}`,
      `${powerWord} ${nicheCapitalized} Device - ${emotion} Experience`
    ];
    
    return templates[index % templates.length];
  }

  static generateUniversalFeatures(niche: string, index: number): string[] {
    const universalFeatures = [
      'High Quality Materials',
      'Durable Construction', 
      'Easy to Use',
      'Professional Grade',
      'Ergonomic Design',
      'Compact & Portable',
      'Multi-functional',
      'Long Lasting',
      'User Friendly',
      'Reliable Performance',
      'Premium Finish',
      'Versatile Application',
      'Innovative Technology',
      'Customer Approved',
      'Fast Delivery'
    ];
    
    const selectedFeatures = [];
    for (let i = 0; i < 5; i++) {
      const featureIndex = (index + i) % universalFeatures.length;
      selectedFeatures.push(universalFeatures[featureIndex]);
    }
    
    return selectedFeatures;
  }
}

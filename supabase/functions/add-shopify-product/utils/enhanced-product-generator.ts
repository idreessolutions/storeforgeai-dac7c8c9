
export class EnhancedProductGenerator {
  static generateNicheSpecificDescription(
    productTitle: string,
    niche: string,
    businessType: string,
    storeStyle: string,
    targetAudience: string
  ): string {
    const nicheDescriptions = {
      pets: {
        'e-commerce': {
          modern: `🐾 **Transform Your Pet's Life Today!**

🌟 **Why Pet Owners Choose This:**
• ✅ **Vet-Approved Quality** - Trusted by 50,000+ pet families
• ✅ **Safety First Design** - Non-toxic, pet-safe materials only
• ✅ **Instant Results** - See improvement in days, not weeks
• ✅ **Happiness Guarantee** - Your pet will love it or money back

🏆 **What Makes This Special:**
Transform ordinary moments into extraordinary bonding experiences. This isn't just another pet product - it's your pet's new favorite thing.

⚡ **Limited Stock Alert:** Only 47 left in stock! 
🚚 **Free Shipping** on orders over $35
💝 **30-Day Love It Guarantee**

*Join thousands of happy pet parents who've already upgraded their furry friend's life!*`,
          luxury: `🌟 **Luxury Pet Care Redefined**

Crafted for discerning pet owners who demand nothing but the best for their beloved companions.

✨ **Premium Features:**
• 🏆 **Award-Winning Design** - Featured in Top Pet Magazines
• 💎 **Luxury Materials** - Handpicked for ultimate comfort
• 🔬 **Scientifically Proven** - Veterinarian developed & tested
• 🌿 **Eco-Luxury** - Sustainable yet sophisticated

🎯 **Exclusive Benefits:**
This premium solution elevates your pet's daily routine while reflecting your refined taste in pet care.

⭐ **5-Star Rating** from 2,847 luxury pet owners
🚁 **Express Delivery** available
💳 **White-Glove Service** included

*Because your pet deserves the extraordinary.*`
        }
      },
      beauty: {
        'e-commerce': {
          modern: `✨ **Glow Up Your Beauty Routine!**

💄 **Why Beauty Lovers Are Obsessed:**
• ✅ **Instagram-Worthy Results** - Get that filter-free glow
• ✅ **Celebrity Makeup Artist Approved** - Red carpet quality
• ✅ **Long-Lasting Formula** - 12+ hour wear guaranteed
• ✅ **Skin-Loving Ingredients** - Dermatologist tested & approved

🔥 **What Makes This a Must-Have:**
This isn't just makeup - it's confidence in a compact. Join the beauty revolution that's taking social media by storm.

⚡ **Trending Now:** #1 Beauty Product on TikTok
🎁 **Free Beauty Bag** with every purchase
⭐ **15,000+ 5-Star Reviews**

*Transform your look, transform your confidence!*`,
          luxury: `💎 **Luxury Beauty Redefined**

For the sophisticated beauty connoisseur who accepts nothing less than perfection.

✨ **Luxury Collection Features:**
• 🌟 **Rare Ingredients** - Sourced globally for maximum efficacy
• 👑 **Professional Grade** - Used by A-list makeup artists
• 🧬 **Advanced Formula** - Patented technology for flawless results
• 🌿 **Clean Beauty** - Cruelty-free and ethically sourced

💫 **Exclusive Experience:**
Indulge in the ultimate beauty ritual with products that deliver salon-quality results at home.

🏆 **Award Winner** - Best Luxury Beauty Product 2024
🚁 **Priority Shipping** for VIP customers
💳 **Concierge Service** available

*Elevate your beauty standards to extraordinary.*`
        }
      }
    };

    // Get the specific description or fall back to a dynamic one
    const nicheData = nicheDescriptions[niche.toLowerCase() as keyof typeof nicheDescriptions];
    if (nicheData && nicheData[businessType as keyof typeof nicheData]) {
      const styleData = nicheData[businessType as keyof typeof nicheData];
      if (styleData[storeStyle as keyof typeof styleData]) {
        return styleData[storeStyle as keyof typeof styleData];
      }
    }

    // Dynamic fallback for all other niches
    return this.generateDynamicDescription(productTitle, niche, businessType, storeStyle, targetAudience);
  }

  private static generateDynamicDescription(
    productTitle: string,
    niche: string,
    businessType: string,
    storeStyle: string,
    targetAudience: string
  ): string {
    const emojis = ['🔥', '⭐', '✨', '💎', '🏆', '⚡', '🌟', '💯'];
    const urgency = ['Limited Stock!', 'Trending Now!', 'Almost Sold Out!', 'Hot Item!'];
    const social = ['50,000+ Happy Customers', '15,000+ 5-Star Reviews', 'Featured on Social Media', 'Celebrity Approved'];
    
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const randomUrgency = urgency[Math.floor(Math.random() * urgency.length)];
    const randomSocial = social[Math.floor(Math.random() * social.length)];

    return `${randomEmoji} **Transform Your ${niche.charAt(0).toUpperCase() + niche.slice(1)} Experience!**

🌟 **Why ${targetAudience} Love This:**
• ✅ **Premium Quality** - Professional-grade materials & design
• ✅ **Proven Results** - Thousands of satisfied customers worldwide
• ✅ **Easy to Use** - Perfect for beginners and experts alike
• ✅ **Money-Back Guarantee** - Risk-free purchase with 30-day returns

🔥 **What Makes This Special:**
This isn't just another ${niche} product - it's a game-changer that delivers real results you can see and feel.

⚡ **${randomUrgency}** 
📈 **${randomSocial}**
🚚 **Free Shipping** on orders over $35
💝 **30-Day Satisfaction Guarantee**

*Join the revolution and discover why this is the #1 choice for ${targetAudience.toLowerCase()}!*`;
  }

  static generateSmartVariations(basePrice: number, niche: string): Array<{title: string; price: number; color?: string; size?: string; style?: string}> {
    const variations: Array<{title: string; price: number; color?: string; size?: string; style?: string}> = [];
    
    // Niche-specific variation types
    const variationSets = {
      pets: [
        { title: 'Small Size', price: basePrice * 0.85, size: 'Small' },
        { title: 'Large Size', price: basePrice * 1.15, size: 'Large' },
        { title: 'Premium Pack', price: basePrice * 1.35, style: 'Premium' }
      ],
      beauty: [
        { title: 'Natural Shade', price: basePrice * 0.95, color: 'Natural' },
        { title: 'Bold Color', price: basePrice * 1.05, color: 'Bold' },
        { title: 'Travel Size', price: basePrice * 0.7, size: 'Travel' },
        { title: 'Value Pack (3x)', price: basePrice * 2.5, style: 'Value Pack' }
      ],
      fitness: [
        { title: 'Light Resistance', price: basePrice * 0.9, style: 'Light' },
        { title: 'Heavy Resistance', price: basePrice * 1.1, style: 'Heavy' },
        { title: 'Pro Set', price: basePrice * 1.4, style: 'Professional' }
      ],
      kitchen: [
        { title: 'Compact Size', price: basePrice * 0.8, size: 'Compact' },
        { title: 'Family Size', price: basePrice * 1.2, size: 'Family' },
        { title: 'Deluxe Set', price: basePrice * 1.5, style: 'Deluxe' }
      ],
      tech: [
        { title: 'Basic Model', price: basePrice * 0.85, style: 'Basic' },
        { title: 'Pro Version', price: basePrice * 1.25, style: 'Pro' },
        { title: 'Ultimate Edition', price: basePrice * 1.6, style: 'Ultimate' }
      ],
      home: [
        { title: 'Standard', price: basePrice, style: 'Standard' },
        { title: 'Premium', price: basePrice * 1.2, style: 'Premium' },
        { title: 'Luxury Edition', price: basePrice * 1.5, style: 'Luxury' }
      ],
      fashion: [
        { title: 'Classic Style', price: basePrice * 0.9, style: 'Classic' },
        { title: 'Trendy Design', price: basePrice * 1.1, style: 'Trendy' },
        { title: 'Limited Edition', price: basePrice * 1.3, style: 'Limited' }
      ]
    };

    const nicheVariations = variationSets[niche.toLowerCase() as keyof typeof variationSets] || variationSets.home;
    
    // Always include at least 3 variations
    for (let i = 0; i < Math.min(3, nicheVariations.length); i++) {
      const variation = nicheVariations[i];
      variations.push({
        title: variation.title,
        price: Math.max(15, Math.min(80, variation.price)), // Keep within $15-$80 range
        color: variation.color,
        size: variation.size,
        style: variation.style
      });
    }

    return variations;
  }
}

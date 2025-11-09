
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Store, Palette, Bot, Users, Crown, ArrowRight, Check, Star, Rocket, ShoppingCart, TrendingUp, Target, DollarSign, Sparkles, Clock, Shield, Award, Play, ExternalLink } from "lucide-react";
import StoreBuilder from "@/components/StoreBuilder";
import AuthModal from "@/components/AuthModal";

const Index = () => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const ctaButtonRef = useRef<HTMLButtonElement>(null);
  const arrowContainerRef = useRef<HTMLSpanElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const badgeIconContainerRef = useRef<HTMLSpanElement>(null);
  const valuePropRef = useRef<HTMLDivElement>(null);
  const valuePropIconRef = useRef<HTMLSpanElement>(null);
  const valueProp2Ref = useRef<HTMLDivElement>(null);
  const valueProp2IconRef = useRef<HTMLSpanElement>(null);
  const valueProp3Ref = useRef<HTMLDivElement>(null);
  const valueProp3IconRef = useRef<HTMLSpanElement>(null);
  const valueProp4Ref = useRef<HTMLDivElement>(null);
  const valueProp4IconRef = useRef<HTMLSpanElement>(null);
  const valueProp5Ref = useRef<HTMLDivElement>(null);
  const valueProp5IconRef = useRef<HTMLSpanElement>(null);
  const valueProp6Ref = useRef<HTMLDivElement>(null);
  const valueProp6IconRef = useRef<HTMLSpanElement>(null);
  const featureCard1Ref = useRef<HTMLDivElement>(null);
  const featureCard1IconRef = useRef<HTMLSpanElement>(null);
  const featureCard2Ref = useRef<HTMLDivElement>(null);
  const featureCard2IconRef = useRef<HTMLSpanElement>(null);
  const featureCard3Ref = useRef<HTMLDivElement>(null);
  const featureCard3IconRef = useRef<HTMLSpanElement>(null);
  const featureCard4Ref = useRef<HTMLDivElement>(null);
  const featureCard4IconRef = useRef<HTMLSpanElement>(null);

  // Setup lord-icon animation triggers for CTA button
  useEffect(() => {
    const button = ctaButtonRef.current;
    const container = arrowContainerRef.current;
    if (!button || !container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Find the lord-icon element
    const lordIcon = container.querySelector('lord-icon') as any;
    if (!lordIcon) return;

    const triggerAnimation = () => {
      if (lordIcon && typeof lordIcon.playFromBeginning === 'function') {
        lordIcon.playFromBeginning();
      }
    };

    // Add event listeners to button for hover and focus
    button.addEventListener('mouseenter', triggerAnimation);
    button.addEventListener('focus', triggerAnimation);

    return () => {
      button.removeEventListener('mouseenter', triggerAnimation);
      button.removeEventListener('focus', triggerAnimation);
    };
  }, []);

  // Setup lord-icon animation triggers for badge
  useEffect(() => {
    const badge = badgeRef.current;
    const container = badgeIconContainerRef.current;
    if (!badge || !container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Find the lord-icon element
    const lordIcon = container.querySelector('lord-icon') as any;
    if (!lordIcon) return;

    const triggerAnimation = () => {
      if (lordIcon && typeof lordIcon.play === 'function') {
        lordIcon.play();
      }
    };

    // Add event listeners to badge for hover and focus
    badge.addEventListener('mouseenter', triggerAnimation);
    badge.addEventListener('focus', triggerAnimation);

    return () => {
      badge.removeEventListener('mouseenter', triggerAnimation);
      badge.removeEventListener('focus', triggerAnimation);
    };
  }, []);

  // Setup lord-icon animation triggers for value prop
  useEffect(() => {
    const card = valuePropRef.current;
    const container = valuePropIconRef.current;
    if (!card || !container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Wait for lord-icon to be fully initialized
    const initTimeout = setTimeout(() => {
      const lordIcon = container.querySelector('lord-icon') as any;
      if (!lordIcon) return;

      const triggerAnimation = () => {
        if (lordIcon && typeof lordIcon.playFromBeginning === 'function') {
          lordIcon.playFromBeginning();
        }
      };

      // Add event listeners to card for hover and focus
      card.addEventListener('mouseenter', triggerAnimation);
      card.addEventListener('focus', triggerAnimation);

      // Cleanup function
      return () => {
        card.removeEventListener('mouseenter', triggerAnimation);
        card.removeEventListener('focus', triggerAnimation);
      };
    }, 100);

    return () => clearTimeout(initTimeout);
  }, []);

  // Setup lord-icon animation triggers for value prop 2
  useEffect(() => {
    const card = valueProp2Ref.current;
    const container = valueProp2IconRef.current;
    if (!card || !container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Wait for lord-icon to be fully initialized
    const initTimeout = setTimeout(() => {
      const lordIcon = container.querySelector('lord-icon') as any;
      if (!lordIcon) return;

      const triggerAnimation = () => {
        if (lordIcon && typeof lordIcon.playFromBeginning === 'function') {
          lordIcon.playFromBeginning();
        }
      };

      // Add event listeners to card for hover and focus
      card.addEventListener('mouseenter', triggerAnimation);
      card.addEventListener('focus', triggerAnimation);

      // Cleanup function
      return () => {
        card.removeEventListener('mouseenter', triggerAnimation);
        card.removeEventListener('focus', triggerAnimation);
      };
    }, 100);

    return () => clearTimeout(initTimeout);
  }, []);

  // Setup lord-icon animation triggers for value prop 3
  useEffect(() => {
    const card = valueProp3Ref.current;
    const container = valueProp3IconRef.current;
    if (!card || !container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Wait for lord-icon to be fully initialized
    const initTimeout = setTimeout(() => {
      const lordIcon = container.querySelector('lord-icon') as any;
      if (!lordIcon) return;

      const triggerAnimation = () => {
        if (lordIcon && typeof lordIcon.playFromBeginning === 'function') {
          lordIcon.playFromBeginning();
        }
      };

      // Add event listeners to card for hover and focus
      card.addEventListener('mouseenter', triggerAnimation);
      card.addEventListener('focus', triggerAnimation);

      // Cleanup function
      return () => {
        card.removeEventListener('mouseenter', triggerAnimation);
        card.removeEventListener('focus', triggerAnimation);
      };
    }, 100);

    return () => clearTimeout(initTimeout);
  }, []);

  // Setup lord-icon animation triggers for value prop 4
  useEffect(() => {
    const card = valueProp4Ref.current;
    const container = valueProp4IconRef.current;
    if (!card || !container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Wait for lord-icon to be fully initialized
    const initTimeout = setTimeout(() => {
      const lordIcon = container.querySelector('lord-icon') as any;
      if (!lordIcon) return;

      const triggerAnimation = () => {
        if (lordIcon && typeof lordIcon.playFromBeginning === 'function') {
          lordIcon.playFromBeginning();
        }
      };

      // Add event listeners to card for hover and focus
      card.addEventListener('mouseenter', triggerAnimation);
      card.addEventListener('focus', triggerAnimation);

      // Cleanup function
      return () => {
        card.removeEventListener('mouseenter', triggerAnimation);
        card.removeEventListener('focus', triggerAnimation);
      };
    }, 100);

    return () => clearTimeout(initTimeout);
  }, []);

  // Setup lord-icon animation triggers for value prop 5
  useEffect(() => {
    const card = valueProp5Ref.current;
    const container = valueProp5IconRef.current;
    if (!card || !container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Wait for lord-icon to be fully initialized
    const initTimeout = setTimeout(() => {
      const lordIcon = container.querySelector('lord-icon') as any;
      if (!lordIcon) return;

      const triggerAnimation = () => {
        if (lordIcon && typeof lordIcon.playFromBeginning === 'function') {
          lordIcon.playFromBeginning();
        }
      };

      // Add event listeners to card for hover and focus
      card.addEventListener('mouseenter', triggerAnimation);
      card.addEventListener('focus', triggerAnimation);

      // Cleanup function
      return () => {
        card.removeEventListener('mouseenter', triggerAnimation);
        card.removeEventListener('focus', triggerAnimation);
      };
    }, 100);

    return () => clearTimeout(initTimeout);
  }, []);

  // Setup lord-icon animation triggers for value prop 6
  useEffect(() => {
    const card = valueProp6Ref.current;
    const container = valueProp6IconRef.current;
    if (!card || !container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Wait for lord-icon to be fully initialized
    const initTimeout = setTimeout(() => {
      const lordIcon = container.querySelector('lord-icon') as any;
      if (!lordIcon) return;

      const triggerAnimation = () => {
        if (lordIcon && typeof lordIcon.playFromBeginning === 'function') {
          lordIcon.playFromBeginning();
        }
      };

      // Add event listeners to card for hover and focus
      card.addEventListener('mouseenter', triggerAnimation);
      card.addEventListener('focus', triggerAnimation);

      // Cleanup function
      return () => {
        card.removeEventListener('mouseenter', triggerAnimation);
        card.removeEventListener('focus', triggerAnimation);
      };
    }, 100);

    return () => clearTimeout(initTimeout);
  }, []);

  // Setup lord-icon animation triggers for feature card 1
  useEffect(() => {
    const card = featureCard1Ref.current;
    const container = featureCard1IconRef.current;
    if (!card || !container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Wait for lord-icon to be fully initialized
    const initTimeout = setTimeout(() => {
      const lordIcon = container.querySelector('lord-icon') as any;
      if (!lordIcon) return;

      const triggerAnimation = () => {
        if (lordIcon && typeof lordIcon.playFromBeginning === 'function') {
          lordIcon.playFromBeginning();
        }
      };

      // Add event listeners to card for hover and focus
      card.addEventListener('mouseenter', triggerAnimation);
      card.addEventListener('focus', triggerAnimation);

      // Cleanup function
      return () => {
        card.removeEventListener('mouseenter', triggerAnimation);
        card.removeEventListener('focus', triggerAnimation);
      };
    }, 100);

    return () => clearTimeout(initTimeout);
  }, []);

  // Setup lord-icon animation triggers for feature card 3
  useEffect(() => {
    const card = featureCard3Ref.current;
    const container = featureCard3IconRef.current;
    if (!card || !container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Wait for lord-icon to be fully initialized
    const initTimeout = setTimeout(() => {
      const lordIcon = container.querySelector('lord-icon') as any;
      if (!lordIcon) return;

      const triggerAnimation = () => {
        if (lordIcon && typeof lordIcon.playFromBeginning === 'function') {
          lordIcon.playFromBeginning();
        }
      };

      // Add event listeners to card for hover and focus
      card.addEventListener('mouseenter', triggerAnimation);
      card.addEventListener('focus', triggerAnimation);

      // Cleanup function
      return () => {
        card.removeEventListener('mouseenter', triggerAnimation);
        card.removeEventListener('focus', triggerAnimation);
      };
    }, 100);

    return () => clearTimeout(initTimeout);
  }, []);

  // Setup lord-icon animation triggers for feature card 4
  useEffect(() => {
    const card = featureCard4Ref.current;
    const container = featureCard4IconRef.current;
    if (!card || !container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Wait for lord-icon to be fully initialized
    const initTimeout = setTimeout(() => {
      const lordIcon = container.querySelector('lord-icon') as any;
      if (!lordIcon) return;

      const triggerAnimation = () => {
        if (lordIcon && typeof lordIcon.playFromBeginning === 'function') {
          lordIcon.playFromBeginning();
        }
      };

      // Add event listeners to card for hover and focus
      card.addEventListener('mouseenter', triggerAnimation);
      card.addEventListener('focus', triggerAnimation);

      // Cleanup function
      return () => {
        card.removeEventListener('mouseenter', triggerAnimation);
        card.removeEventListener('focus', triggerAnimation);
      };
    }, 100);

    return () => clearTimeout(initTimeout);
  }, []);

  // Setup lord-icon animation triggers for feature card 2
  useEffect(() => {
    const card = featureCard2Ref.current;
    const container = featureCard2IconRef.current;
    if (!card || !container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Wait for lord-icon to be fully initialized
    const initTimeout = setTimeout(() => {
      const lordIcon = container.querySelector('lord-icon') as any;
      if (!lordIcon) return;

      const triggerAnimation = () => {
        if (lordIcon && typeof lordIcon.playFromBeginning === 'function') {
          lordIcon.playFromBeginning();
        }
      };

      // Add event listeners to card for hover and focus
      card.addEventListener('mouseenter', triggerAnimation);
      card.addEventListener('focus', triggerAnimation);

      // Cleanup function
      return () => {
        card.removeEventListener('mouseenter', triggerAnimation);
        card.removeEventListener('focus', triggerAnimation);
      };
    }, 100);

    return () => clearTimeout(initTimeout);
  }, []);

  if (showBuilder) {
    return <StoreBuilder onBack={() => setShowBuilder(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5" />
        
        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              StoreForge AI
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="/about" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">About</a>
            <a href="/pricing" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">Pricing</a>
            <a href="/faq" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">FAQ</a>
            <a href="/contact" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">Contact</a>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 lg:px-6">
          <div className="text-center">
            <div 
              ref={badgeRef}
              tabIndex={0}
              className="inline-block mb-4 focus:outline-none focus:ring-4 focus:ring-emerald-300 rounded-full cursor-pointer"
            >
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 text-sm px-4 py-2 shadow-lg">
                <span 
                  ref={badgeIconContainerRef}
                  className="inline-flex items-center mr-2" 
                  dangerouslySetInnerHTML={{
                    __html: `<lord-icon
                      src="https://cdn.lordicon.com/uetlzssd.json"
                      trigger="hover"
                      stroke="bold"
                      state="loop-cycle"
                      colors="primary:#ffffff,secondary:#ffffff"
                      style="width:20px;height:20px">
                    </lord-icon>`
                  }}
                />
                Official Shopify Partner – AI-Powered Store Builder
              </Badge>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Build Your Entire{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Shopify Store
              </span>{" "}
              in Minutes with AI
            </h1>
            
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Launch a fully-branded store with logo, theme, menus, policies, and 10 hot winning products — automatically imported to your Shopify dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button 
                ref={ctaButtonRef}
                size="lg" 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg px-8 py-6 shadow-xl transform hover:scale-105 transition-all"
                onClick={() => setShowBuilder(true)}
              >
                Start My AI Store (Free)
                <span 
                  ref={arrowContainerRef}
                  className="ml-2 inline-flex items-center" 
                  dangerouslySetInnerHTML={{
                    __html: `<lord-icon
                      src="https://cdn.lordicon.com/sfwdicbq.json"
                      trigger="hover"
                      stroke="bold"
                      state="loop-slide"
                      colors="primary:#ffffff,secondary:#ffffff"
                      style="width:24px;height:24px">
                    </lord-icon>`
                  }}
                />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 text-lg px-8 py-6"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <div className="flex -space-x-1 mr-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="font-semibold">4.9/5 based on 2,000+ users</span>
              </div>
              <div className="h-4 w-px bg-gray-300 hidden sm:block" />
              <div className="flex items-center">
                <Rocket className="h-4 w-4 mr-2 text-blue-600" />
                <span className="font-semibold">500+ Shopify stores launched</span>
              </div>
              <div className="h-4 w-px bg-gray-300 hidden sm:block" />
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                <span className="font-semibold">Real viral & winning products imported directly</span>
              </div>
            </div>

            {/* Shopify Badge */}
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200">
              <svg className="w-6 h-6 mr-3" viewBox="0 0 32 32" fill="none">
                <path d="M25.7 7.8c-.1-.3-.3-.4-.6-.4-.1 0-2.9-.1-2.9-.1s-1.9-1.9-2.1-2.1c-.2-.2-.5-.1-.6-.1l-.8.2c-.2-.6-.6-1.4-1.2-1.9C16.3 2.6 14.9 2.3 14 2.8c0 0 0 0-.1 0-.2.1-.4.2-.6.4-.7-1.2-1.8-1.7-2.4-1.2C9.7 2.6 9.4 4.1 9.6 6.1l-2.3.7c-.7.2-1.2.4-1.3 1.2-.1.6-2.6 20.3-2.6 20.3L24.5 30s4.7-24.7 4.7-25.1c.1-.1 0-.1 0-.1zM17 4.4c-.4.1-.8.3-1.3.4V4.4c0-.8-.1-1.5-.4-2 .6-.1 1.1.4 1.7 2zM14.5 2.9c.2.4.3 1 .3 1.7v.2c-.5.2-1.1.3-1.7.5.2-1.1.6-1.9 1.4-2.4zM12.6 3.6c.1 0 .1 0 .2.1-.6.4-.9 1.1-1.1 2.1l-1.4.4c.4-1.3 1.4-2.3 2.3-2.6z" fill="#95BF47"/>
                <path d="m24.5 30-3.4-26.2c-.1-.3-.3-.4-.6-.4-.1 0-2.9-.1-2.9-.1s-1.9-1.9-2.1-2.1c-.1-.1-.2-.1-.3-.1L14 30h10.5z" fill="#5E8E3E"/>
              </svg>
              <span className="text-gray-700 font-semibold">Powered by Shopify Partner Integration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Value Prop Strip */}
      <div className="bg-white border-y border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {/* First item with animated lord-icon */}
            <div 
              ref={valuePropRef}
              tabIndex={0}
              className="flex flex-col items-center text-center focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-lg cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-3">
                <span 
                  ref={valuePropIconRef}
                  className="inline-flex items-center justify-center" 
                  dangerouslySetInnerHTML={{
                    __html: `<lord-icon
                      src="https://cdn.lordicon.com/boconccx.json"
                      trigger="hover"
                      stroke="bold"
                      colors="primary:#ffffff,secondary:#ffffff"
                      style="width:24px;height:24px">
                    </lord-icon>`
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">Launch in &lt; 10 Minutes</span>
            </div>

            {/* Second item with animated lord-icon */}
            <div 
              ref={valueProp2Ref}
              tabIndex={0}
              className="flex flex-col items-center text-center focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-lg cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-3">
                <span 
                  ref={valueProp2IconRef}
                  className="inline-flex items-center justify-center" 
                  dangerouslySetInnerHTML={{
                    __html: `<lord-icon
                      src="https://cdn.lordicon.com/bdynvafa.json"
                      trigger="hover"
                      stroke="bold"
                      state="loop-cycle"
                      colors="primary:#ffffff,secondary:#ffffff"
                      style="width:24px;height:24px">
                    </lord-icon>`
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">10 Hot & Winning Products</span>
            </div>

            {/* Rest of the items */}
            <div 
              ref={valueProp3Ref}
              tabIndex={0}
              className="flex flex-col items-center text-center focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-lg cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-3">
                <span 
                  ref={valueProp3IconRef}
                  className="inline-flex items-center justify-center" 
                  dangerouslySetInnerHTML={{
                    __html: `<lord-icon
                      src="https://cdn.lordicon.com/xyvcjevb.json"
                      trigger="hover"
                      stroke="bold"
                      colors="primary:#ffffff,secondary:#ffffff"
                      style="width:24px;height:24px">
                    </lord-icon>`
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">Real Shopify Integration</span>
            </div>

            <div 
              ref={valueProp4Ref}
              tabIndex={0}
              className="flex flex-col items-center text-center focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-lg cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-3">
                <span 
                  ref={valueProp4IconRef}
                  className="inline-flex items-center justify-center" 
                  dangerouslySetInnerHTML={{
                    __html: `<lord-icon
                      src="https://cdn.lordicon.com/mfpdszvl.json"
                      trigger="hover"
                      stroke="bold"
                      colors="primary:#ffffff,secondary:#ffffff"
                      style="width:24px;height:24px">
                    </lord-icon>`
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">Auto Branding: Logo, Themes</span>
            </div>

            <div 
              ref={valueProp5Ref}
              tabIndex={0}
              className="flex flex-col items-center text-center focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-lg cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-3">
                <span 
                  ref={valueProp5IconRef}
                  className="inline-flex items-center justify-center" 
                  dangerouslySetInnerHTML={{
                    __html: `<lord-icon
                      src="https://cdn.lordicon.com/hyuxspcq.json"
                      trigger="hover"
                      stroke="bold"
                      state="loop-spin"
                      colors="primary:#ffffff,secondary:#ffffff"
                      style="width:24px;height:24px">
                    </lord-icon>`
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">AI Pricing & Profit</span>
            </div>

            <div 
              ref={valueProp6Ref}
              tabIndex={0}
              className="flex flex-col items-center text-center focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-lg cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-3">
                <span 
                  ref={valueProp6IconRef}
                  className="inline-flex items-center justify-center" 
                  dangerouslySetInnerHTML={{
                    __html: `<lord-icon
                      src="https://cdn.lordicon.com/ygymzvsj.json"
                      trigger="hover"
                      stroke="bold"
                      state="hover-pinch"
                      colors="primary:#ffffff,secondary:#ffffff"
                      style="width:24px;height:24px">
                    </lord-icon>`
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">Works for Beginners</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything Built For You, Automatically
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional features that usually take weeks and cost thousands—ready in minutes with AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card 
              ref={featureCard1Ref}
              tabIndex={0}
              className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg h-full bg-white/80 backdrop-blur-sm hover:bg-white transform hover:scale-105 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <span 
                    ref={featureCard1IconRef}
                    className="inline-flex items-center justify-center" 
                    dangerouslySetInnerHTML={{
                      __html: `<lord-icon
                        src="https://cdn.lordicon.com/gztcjayb.json"
                        trigger="hover"
                        stroke="bold"
                        colors="primary:#ffffff,secondary:#ffffff"
                        style="width:32px;height:32px">
                      </lord-icon>`
                    }}
                  />
                </div>
                <CardTitle className="text-xl font-bold">AI Store Generator</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-base leading-relaxed">Your entire Shopify store built in minutes — desktop + mobile theme, menus, policies, collections, branding, and 10 products uploaded instantly.</p>
              </CardContent>
            </Card>

            <Card 
              ref={featureCard2Ref}
              tabIndex={0}
              className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg h-full bg-white/80 backdrop-blur-sm hover:bg-white transform hover:scale-105 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <span 
                    ref={featureCard2IconRef}
                    className="inline-flex items-center justify-center" 
                    dangerouslySetInnerHTML={{
                      __html: `<lord-icon
                        src="https://cdn.lordicon.com/drepdftg.json"
                        trigger="hover"
                        stroke="bold"
                        colors="primary:#ffffff,secondary:#ffffff"
                        style="width:32px;height:32px">
                      </lord-icon>`
                    }}
                  />
                </div>
                <CardTitle className="text-xl font-bold">Real Winning Products</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-base leading-relaxed">We analyze trending data from TikTok, AliExpress, Amazon, and viral stores to auto-select the best 10 items in your niche.</p>
              </CardContent>
            </Card>

            <Card 
              ref={featureCard3Ref}
              tabIndex={0}
              className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg h-full bg-white/80 backdrop-blur-sm hover:bg-white transform hover:scale-105 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <span 
                    ref={featureCard3IconRef}
                    className="inline-flex items-center justify-center" 
                    dangerouslySetInnerHTML={{
                      __html: `<lord-icon
                        src="https://cdn.lordicon.com/mfpdszvl.json"
                        trigger="hover"
                        stroke="bold"
                        colors="primary:#ffffff,secondary:#ffffff"
                        style="width:32px;height:32px">
                      </lord-icon>`
                    }}
                  />
                </div>
                <CardTitle className="text-xl font-bold">Professional Branding</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-base leading-relaxed">Get a custom logo, color palette, fonts, and description tone that matches your niche and audience.</p>
              </CardContent>
            </Card>

            <Card 
              ref={featureCard4Ref}
              tabIndex={0}
              className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg h-full bg-white/80 backdrop-blur-sm hover:bg-white transform hover:scale-105 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <span 
                    ref={featureCard4IconRef}
                    className="inline-flex items-center justify-center" 
                    dangerouslySetInnerHTML={{
                      __html: `<lord-icon
                        src="https://cdn.lordicon.com/xaqshkdp.json"
                        trigger="hover"
                        stroke="bold"
                        colors="primary:#ffffff,secondary:#ffffff"
                        style="width:32px;height:32px">
                      </lord-icon>`
                    }}
                  />
                </div>
                <CardTitle className="text-xl font-bold">Profit Optimization</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-base leading-relaxed">AI chooses pricing, product benefits, trust features, keywords, and SEO titles to help you convert customers from day one.</p>
              </CardContent>
            </Card>

            {[
              {
                icon: Zap,
                title: "1-Click Shopify Upload",
                description: "No spreadsheets. No CSV. No manual work. Connect your Shopify store → click import → done."
              },
              {
                icon: Sparkles,
                title: "Beginner Friendly",
                description: "Even if you've never used Shopify, our AI guides you step-by-step. Just choose a niche and press start."
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg h-full bg-white/80 backdrop-blur-sm hover:bg-white transform hover:scale-105 rounded-2xl">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-base leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to launch your store
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {[
              {
                step: "01",
                title: "Choose Your Niche",
                description: "Select your market — Pets, Beauty, Tech, Fitness, Gadgets, Kids, Home & Kitchen, Fashion, Seasonal, etc."
              },
              {
                step: "02",
                title: "AI Builds Your Store",
                description: "Your store design, logo, branding, layout, collections, and 10 winning products are generated automatically."
              },
              {
                step: "03",
                title: "Connect & Launch",
                description: "Click one button to import everything directly into your Shopify store. Start selling instantly."
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="max-w-2xl mx-auto text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg">
            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-xl text-gray-700 italic mb-4">
              "I built my store in 6 minutes and already made sales on day 1."
            </p>
            <p className="text-gray-600 font-semibold">— Daniel R.</p>
          </div>
        </div>
      </div>

      {/* Live Store Examples */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Stores Built with Our AI
            </h2>
            <p className="text-xl text-gray-600">
              Real examples of profitable stores created in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Pet Store", subtitle: "10 Viral Pet Gadgets", gradient: "from-orange-500 to-pink-500" },
              { title: "Beauty Store", subtitle: "Trending Skincare Products", gradient: "from-pink-500 to-rose-500" },
              { title: "Tech Store", subtitle: "Smart Gadgets That Sell Fast", gradient: "from-blue-500 to-cyan-500" },
              { title: "Kids Store", subtitle: "Educational Toys & Baby Items", gradient: "from-purple-500 to-indigo-500" }
            ].map((store, i) => (
              <Card key={i} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg overflow-hidden">
                <div className={`h-48 bg-gradient-to-br ${store.gradient} flex items-center justify-center`}>
                  <Store className="h-20 w-20 text-white opacity-80" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{store.title}</h3>
                  <p className="text-gray-600 mb-4">{store.subtitle}</p>
                  <Button variant="outline" className="w-full group-hover:bg-gray-900 group-hover:text-white transition-colors">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Demo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-8 w-8 text-yellow-400 fill-current" />
              ))}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ⭐ 4.9/5 rating — Trusted by over 2,000 store owners
            </h3>
            
            {/* Brand Icons */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
              {["Shopify", "Stripe", "PayPal", "TikTok", "Facebook Ads"].map((brand) => (
                <div key={brand} className="px-6 py-3 bg-gray-100 rounded-lg">
                  <span className="text-gray-700 font-semibold">{brand}</span>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="grid md:grid-cols-3 gap-8">
              {[
                "Best AI Shopify builder I've ever used.",
                "Better than hiring a $500 designer.",
                "I got my first sale in 48 hours."
              ].map((quote, i) => (
                <Card key={i} className="p-6 border-0 shadow-lg">
                  <div className="flex justify-center mb-3">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <Star key={j} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic">"{quote}"</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-5xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Start for Free — Pay Only When You're Ready
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-2 border-gray-200 shadow-lg">
              <div className="mb-6">
                <Check className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                <p className="text-4xl font-bold text-gray-900 mb-4">Free</p>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  "10 winning products",
                  "Full store build",
                  "AI branding",
                  "Shopify upload"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-600 mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg"
                onClick={() => setShowBuilder(true)}
              >
                Start My Free Store Build
              </Button>
            </Card>

            <Card className="p-8 border-2 border-purple-600 shadow-2xl relative">
              <Badge className="absolute top-4 right-4 bg-purple-600 text-white">Coming Soon</Badge>
              <div className="mb-6">
                <Rocket className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <p className="text-gray-600 mb-4">Premium features</p>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  "Unlimited products",
                  "Upsells & cross-sells",
                  "Email templates",
                  "Sales funnels"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-purple-600 mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant="outline" disabled>
                Coming Soon
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 lg:px-6">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Launch Your Shopify Store Today?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of entrepreneurs launching real Shopify businesses with AI.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-purple-600 hover:bg-gray-100 text-xl px-12 py-8 shadow-2xl transform hover:scale-105 transition-all"
            onClick={() => setShowBuilder(true)}
          >
            <Store className="mr-3 h-7 w-7" />
            Create My Store Now – It's Free
            <ArrowRight className="ml-3 h-7 w-7" />
          </Button>
          <p className="text-white/80 mt-6 text-lg">
            <Shield className="inline h-5 w-5 mr-2" />
            No credit card required. Works with all Shopify plans.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-7 h-7 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Store className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold">StoreForge AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Build your entire Shopify store in minutes with AI-powered automation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 StoreForge AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AuthModal open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default Index;

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Check, Sparkles, ArrowRight, Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-4 py-3 lg:px-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Store className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            StoreForge AI
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <Link to="/about" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">About</Link>
          <Link to="/pricing" className="text-sm font-medium text-blue-600">Pricing</Link>
          <Link to="/faq" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">FAQ</Link>
          <Link to="/contact" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Contact</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12 lg:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Simple, transparent{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              pricing
            </span>
          </h1>
          <p className="text-xl text-gray-700">
            Start for free. Upgrade only if you love it.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
          {/* Starter Plan */}
          <Card className="border-2 border-green-200 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              Most Popular
            </Badge>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold mb-2">Starter</CardTitle>
              <div className="text-5xl font-bold text-gray-900 mb-2">
                $0
              </div>
              <p className="text-gray-600">Perfect for getting started</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Full store build</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">AI branding</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">10 winning products</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Shopify upload</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Product descriptions</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Pricing optimization</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">SEO titles</span>
                </li>
              </ul>
              <Link to="/">
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                  Start Free Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm shadow-xl relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              Coming Soon
            </Badge>
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="h-6 w-6 text-purple-600 mr-2" />
                <CardTitle className="text-2xl font-bold">Pro</CardTitle>
              </div>
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Soon
              </div>
              <p className="text-gray-600">For power users</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited niches</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited products</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Upsells</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Email automations</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Ad creatives</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Competitor research</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">A/B testing</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Mentor support</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="mb-8 border-2 border-blue-100 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Why Choose StoreForge AI?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">No credit card needed</p>
                  <p className="text-sm text-gray-600">Start completely free</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">No coding required</p>
                  <p className="text-sm text-gray-600">Built for non-technical users</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Launch in minutes</p>
                  <p className="text-sm text-gray-600">Not hours or days</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Perfect for beginners</p>
                  <p className="text-sm text-gray-600">No experience needed</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Works with all plans</p>
                  <p className="text-sm text-gray-600">Compatible with any Shopify plan</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Sparkles className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">AI-powered</p>
                  <p className="text-sm text-gray-600">Smart automation</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Link to="/">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg px-8 py-6 shadow-xl transform hover:scale-105 transition-all"
            >
              Start Free Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-gray-600 mt-4 flex items-center justify-center">
            <span className="text-2xl mr-2">🔥</span>
            Takes less than 5 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

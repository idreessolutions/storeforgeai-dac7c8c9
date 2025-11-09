import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Target, Users, Award, Zap, Palette, DollarSign, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
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
          <Link to="/about" className="text-sm font-medium text-blue-600">About</Link>
          <Link to="/pricing" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Pricing</Link>
          <Link to="/faq" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">FAQ</Link>
          <Link to="/contact" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Contact</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12 lg:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            About{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              StoreForge AI
            </span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            We believe building a business shouldn't require technical skills, expensive designers, or months of work. StoreForge AI makes launching a Shopify store simple, fast, and accessible for everyone.
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-8 border-2 border-purple-100 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  To empower entrepreneurs worldwide by giving them a fully functional Shopify store — built automatically using AI, real data, and profitable product research.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Who We Help */}
        <Card className="mb-8 border-2 border-purple-100 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Who We Help</h2>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 pl-16">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                </div>
                <p className="text-gray-700">Beginners starting their first online store</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                </div>
                <p className="text-gray-700">Dropshippers looking for winning products fast</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                </div>
                <p className="text-gray-700">Entrepreneurs who want speed, automation, and results</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                </div>
                <p className="text-gray-700">Agencies building stores for clients</p>
              </div>
            </div>
            <p className="text-lg text-gray-900 font-semibold mt-6 pl-16">
              If you want a profitable online store fast, StoreForge AI is built for you.
            </p>
          </CardContent>
        </Card>

        {/* Why We Work */}
        <Card className="mb-8 border-2 border-purple-100 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why StoreForge AI Works</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full w-12 h-12 mb-3">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-gray-900">Official Shopify Partner</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-600 rounded-full w-12 h-12 mb-3">
                  <span className="text-2xl">🔥</span>
                </div>
                <p className="font-semibold text-gray-900">Real winning product data</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-12 h-12 mb-3">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-gray-900">Store builds in minutes</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-600 rounded-full w-12 h-12 mb-3">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-gray-900">Professional branding & design</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 rounded-full w-12 h-12 mb-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-gray-900">Profit-optimized pricing</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full w-12 h-12 mb-3">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-gray-900">Real stores, not templates</p>
              </div>
            </div>
            <p className="text-center text-lg text-gray-700 mt-8 font-medium">
              We combine AI automation + real product research to build REAL stores, not templates.
            </p>
          </CardContent>
        </Card>

        {/* Vision */}
        <Card className="mb-8 border-2 border-purple-100 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
              A world where anyone can start a business with one click — without coding, design, or marketing knowledge.
            </p>
          </CardContent>
        </Card>

        {/* Trust Strip */}
        <div className="mb-8">
          <p className="text-center text-sm text-gray-600 mb-4 font-semibold">AS SEEN ON</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <Badge variant="outline" className="px-4 py-2 text-sm font-semibold border-gray-300">
              Shopify
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm font-semibold border-gray-300">
              Stripe
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm font-semibold border-gray-300">
              PayPal
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm font-semibold border-gray-300">
              Meta Ads
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm font-semibold border-gray-300">
              TikTok
            </Badge>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg px-8 py-6 shadow-xl transform hover:scale-105 transition-all"
            >
              Start Your Free Store Build
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;

import { Card, CardContent } from "@/components/ui/card";
import { Store, Shield, FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Terms = () => {
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
          <Link to="/pricing" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Pricing</Link>
          <Link to="/faq" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">FAQ</Link>
          <Link to="/contact" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Contact</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12 lg:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service &{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </h1>
          <p className="text-xl text-gray-700">
            Clear, simple, and transparent
          </p>
        </div>

        {/* Terms of Service */}
        <Card className="mb-8 border-2 border-blue-100 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
            </div>
            
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                StoreForge AI is an automation tool that connects to your Shopify store and uploads products on your behalf.
              </p>
              
              <p>
                You are responsible for your Shopify account, payment processing, and store compliance.
              </p>
              
              <p>
                We don't guarantee sales — success depends on marketing, niche, and customer demand.
              </p>
              
              <p>
                Misuse, spamming, illegal products, or violations of Shopify rules may result in account suspension.
              </p>
              
              <p className="font-semibold text-gray-900 pt-4">
                Last Updated: November 2025
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy */}
        <Card className="border-2 border-purple-100 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
            </div>
            
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We do not share or sell user data.
              </p>
              
              <p>
                We store only what is required to connect your Shopify store.
              </p>
              
              <p>
                Your store data is encrypted and private.
              </p>
              
              <p>
                You can request data deletion at any time via support.
              </p>
              
              <div className="pt-4 flex items-center space-x-3">
                <div className="bg-green-100 rounded-lg p-2">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <p className="font-semibold text-gray-900">
                  GDPR Compliant – Data Protected
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Questions about our terms or privacy?{" "}
            <Link to="/contact" className="text-blue-600 hover:text-blue-700 font-semibold underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;

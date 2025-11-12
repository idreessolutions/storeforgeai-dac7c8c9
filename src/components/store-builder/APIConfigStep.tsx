
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, ExternalLink, Shield, Lock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface APIConfigStepProps {
  formData: {
    accessToken: string;
    shopifyUrl: string;
  };
  handleInputChange: (field: string, value: string) => void;
  onNext?: () => void;
}

const APIConfigStep = ({ formData, handleInputChange, onNext }: APIConfigStepProps) => {
  const [isValidToken, setIsValidToken] = useState(false);
  const [showInvalidTokenDialog, setShowInvalidTokenDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Enhanced Shopify access token validation
  const validateAccessToken = (token: string): boolean => {
    if (!token) return false;
    
    const trimmedToken = token.trim();
    
    // More flexible validation for Shopify tokens
    const shopifyTokenPattern = /^shpat_[A-Za-z0-9_-]{32,}$/;
    
    const isValid = shopifyTokenPattern.test(trimmedToken);
    
    console.log(`🔑 Token validation result: ${isValid ? 'VALID' : 'INVALID'} (Length: ${trimmedToken.length})`);
    
    return isValid;
  };

  // CRITICAL FIX: Real-time validation with immediate global function update
  useEffect(() => {
    const validateWithDelay = setTimeout(() => {
      const token = formData.accessToken.trim();
      const isValid = validateAccessToken(token);
      
      console.log(`🔄 Validation update: ${isValid ? 'VALID' : 'INVALID'} token`);
      
      setIsValidToken(isValid);
      
      // FIXED: Store validation state globally for navigation - IMMEDIATE UPDATE
      (window as any).validateAPIConfig = () => {
        console.log(`🌐 Global validation check: ${isValid}`);
        return isValid;
      };
      
      // Clear invalid dialog if token becomes valid
      if (isValid && showInvalidTokenDialog) {
        setShowInvalidTokenDialog(false);
      }
    }, 100); // Reduced delay for faster response

    return () => clearTimeout(validateWithDelay);
  }, [formData.accessToken, showInvalidTokenDialog]);

  // CRITICAL FIX: Immediate validation on input change
  const handleTokenChange = (value: string) => {
    const trimmedValue = value.trim();
    console.log(`📝 Token input changed: ${trimmedValue.substring(0, 10)}...`);
    handleInputChange('accessToken', trimmedValue);
    
    // IMMEDIATE validation for typing
    const isValid = validateAccessToken(trimmedValue);
    setIsValidToken(isValid);
    
    // FIXED: Update global validation IMMEDIATELY
    (window as any).validateAPIConfig = () => {
      console.log(`🌐 Immediate validation check: ${isValid}`);
      return isValid;
    };
  };

  // CRITICAL FIX: Handle paste events with immediate validation
  const handleTokenPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text').trim();
    
    console.log(`📋 Token pasted: ${pastedText.substring(0, 10)}...`);
    
    // Immediately update the form data
    handleInputChange('accessToken', pastedText);
    
    // FIXED: Force immediate validation after paste
    setTimeout(() => {
      const isValid = validateAccessToken(pastedText);
      console.log(`🔄 POST-PASTE validation: ${isValid ? 'VALID' : 'INVALID'}`);
      
      setIsValidToken(isValid);
      
      // FIXED: Store validation globally IMMEDIATELY
      (window as any).validateAPIConfig = () => {
        console.log(`🌐 Post-paste validation check: ${isValid}`);
        return isValid;
      };
    }, 10);
  };

  const openShopifyApps = () => {
    if (formData.shopifyUrl) {
      const storeName = formData.shopifyUrl.replace('.myshopify.com', '').replace('https://', '').replace('http://', '');
      const developmentUrl = `https://admin.shopify.com/store/${storeName}/settings/apps/development`;
      
      window.open(developmentUrl, '_blank');
      toast.success("Opening Shopify Apps development settings...", { duration: 2000 });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 relative overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-blue-400/20 rounded-full blur-xl animate-float" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400/20 rounded-full blur-xl animate-float-delayed" />
      <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl animate-float" />
      
      <div className="max-w-4xl mx-auto pt-4 sm:pt-8 relative z-10">
        <Card className="bg-white shadow-2xl border-0 rounded-2xl transition-shadow hover:shadow-3xl">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Key className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Connect API Access Securely
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6">
                Give StoreForge AI safe access to upload products, branding, and collections to your Shopify store.
              </p>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Encrypted Access</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Official Shopify Permissions</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-200">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Revoke Anytime</span>
                </div>
              </div>
            </div>

            {/* How to Set Up Section */}
            <div className="mb-8 sm:mb-10 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div 
                  dangerouslySetInnerHTML={{
                    __html: '<lord-icon src="https://cdn.lordicon.com/gupbzvaj.json" trigger="hover" stroke="bold" state="hover-roll" colors="primary:#30e849,secondary:#e8e230" style="width:24px;height:24px"></lord-icon>'
                  }}
                />
                How to Set Up API Access
              </h2>
              
              <p className="text-base text-gray-700 mb-6">
                Follow these steps inside Shopify:
              </p>
              
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <span className="text-base pt-0.5">Click <strong>Access Shopify Apps</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <span className="text-base pt-0.5">Click <strong>Allow custom app development</strong> (twice if needed)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <span className="text-base pt-0.5">Click <strong>Create an app</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    4
                  </span>
                  <span className="text-base pt-0.5">Enter app name: <span className="font-mono text-sm bg-white px-2 py-1 rounded">Custom Store</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    5
                  </span>
                  <span className="text-base pt-0.5">Click <strong>Configure Admin API Scopes</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    6
                  </span>
                  <span className="text-base pt-0.5 flex items-center gap-1">
                    Check <strong>ALL API Scopes</strong>
                    <span 
                      dangerouslySetInnerHTML={{
                        __html: '<lord-icon src="https://cdn.lordicon.com/gupbzvaj.json" trigger="hover" stroke="bold" state="hover-pinch" colors="primary:#30e849,secondary:#b4b4b4" style="width:18px;height:18px"></lord-icon>'
                      }}
                    />
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    7
                  </span>
                  <span className="text-base pt-0.5">Click <strong>Save</strong> and then <strong>Install</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    8
                  </span>
                  <span className="text-base pt-0.5">Click <strong>Reveal Token</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    9
                  </span>
                  <span className="text-base pt-0.5">Copy the token shown</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    10
                  </span>
                  <span className="text-base pt-0.5">Paste it below</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    11
                  </span>
                  <span className="text-base pt-0.5">Click <strong>Continue to Next Step</strong></span>
                </li>
              </ul>

              {/* Important Note */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                <div className="flex-shrink-0"
                  dangerouslySetInnerHTML={{
                    __html: '<lord-icon src="https://cdn.lordicon.com/gdfrsvpt.json" trigger="hover" stroke="bold" colors="primary:#000000,secondary:#e8e230" style="width:24px;height:24px"></lord-icon>'
                  }}
                />
                <div>
                  <p className="text-orange-900 font-semibold mb-1">Important:</p>
                  <p className="text-orange-800 text-sm">
                    Make sure <strong>ALL API scopes are checked</strong>. If any are left unchecked, your store may not build correctly.
                  </p>
                </div>
              </div>

              {/* Tip */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <div className="flex-shrink-0"
                  dangerouslySetInnerHTML={{
                    __html: '<lord-icon src="https://cdn.lordicon.com/fomgzoeg.json" trigger="morph" stroke="bold" state="morph-turn-on" colors="primary:#e8e230,secondary:#30c9e8" style="width:24px;height:24px"></lord-icon>'
                  }}
                />
                <div>
                  <p className="text-blue-900 font-semibold mb-1">Tip:</p>
                  <p className="text-blue-800 text-sm">
                    If Shopify opens in a new tab, just return here after copying your token.
                  </p>
                </div>
              </div>
            </div>

            {/* Access Token Input */}
            <div className="mb-8 sm:mb-10">
              <Label htmlFor="accessToken" className="block text-gray-900 font-bold text-base sm:text-lg mb-2">
                Admin Access Token
              </Label>
              <p className="text-sm text-gray-600 mb-3">
                Paste the token you copied from Shopify
              </p>
              <div className="relative">
                <Input
                  ref={inputRef}
                  id="accessToken"
                  type="text"
                  placeholder="Example: shpat_123456789xxxx"
                  value={formData.accessToken}
                  onChange={(e) => handleTokenChange(e.target.value)}
                  onPaste={handleTokenPaste}
                  className={`w-full h-12 sm:h-14 text-base sm:text-lg border-2 rounded-xl transition-all font-mono ${
                    isValidToken 
                      ? 'border-green-500 focus:border-green-600 shadow-sm shadow-green-200' 
                      : formData.accessToken && !isValidToken
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-gray-300 focus:border-blue-500'
                  } ${isValidToken ? 'pr-12' : ''}`}
                />
                {isValidToken && (
                  <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                )}
              </div>
              {isValidToken && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <span>✅</span> Valid access token - Ready to continue!
                </p>
              )}
              {formData.accessToken && !isValidToken && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                  <span>❌</span> Invalid token format - Please check your token
                </p>
              )}
            </div>

            {/* Action Button */}
            <div className="text-center">
              <Button
                onClick={openShopifyApps}
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                disabled={!formData.shopifyUrl}
              >
                <ExternalLink className="mr-3 h-5 w-5" />
                🔗 Access Shopify Apps
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trust & Safety Section */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <Lock className="h-6 w-6 text-green-600" />
              <p className="text-sm font-medium text-gray-800">
                Your store access is encrypted
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-6 w-6 text-blue-600" />
              <p className="text-sm font-medium text-gray-800">
                We never modify or delete products
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-6 w-6 text-purple-600" />
              <p className="text-sm font-medium text-gray-800">
                You can disconnect at any time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invalid Token Dialog */}
      <AlertDialog open={showInvalidTokenDialog} onOpenChange={setShowInvalidTokenDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Invalid Access Token</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter a valid Shopify Admin API access token. The token should start with 'shpat_' followed by 32+ alphanumeric characters.
              <br /><br />
              <strong>Example format:</strong> shpat_1234567890abcdef1234567890abcdef12345678
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowInvalidTokenDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default APIConfigStep;

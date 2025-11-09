
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Check, Loader2, Star, TrendingUp, MessageCircle, Trophy, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface MentorshipStepProps {
  formData: {
    mentorshipRequested: boolean;
  };
  handleInputChange: (field: string, value: boolean) => void;
}

const MentorshipStep = ({ formData, handleInputChange }: MentorshipStepProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [mentorshipData, setMentorshipData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    budget: "",
    investment: "",
    revenue_goal: "",
    experience: "",
    business_type: "",
    timeline: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleInputChangeMentorship = (field: string, value: string) => {
    setMentorshipData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitApplication = async () => {
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'description'];
    const missingFields = requiredFields.filter(field => !mentorshipData[field]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields: Full Name, Email, Phone Number, and Why you want mentorship.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mentorshipData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting mentorship application:', mentorshipData);
      
      // Save to Supabase mentorship_applications table with user_id
      const { data, error } = await supabase
        .from('mentorship_applications')
        .insert({
          user_id: user?.id || null,
          full_name: mentorshipData.name.trim(),
          email: mentorshipData.email.trim().toLowerCase(),
          phone_number: mentorshipData.phone.trim(),
          why_mentorship: mentorshipData.description.trim(),
          budget_range: mentorshipData.budget || null,
          investment_amount: mentorshipData.investment || null,
          income_goal: mentorshipData.revenue_goal || null,
          business_experience: mentorshipData.experience || null,
          additional_info: `Business Type: ${mentorshipData.business_type || 'Not specified'}, Timeline: ${mentorshipData.timeline || 'Not specified'}`,
          session_id: null
        })
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log('Mentorship application saved successfully:', data);
      
      // Update the form state to show success
      handleInputChange('mentorshipRequested', true);
      
      toast({
        title: "Application Submitted Successfully! 🎉",
        description: "Thank you for applying! Our mentorship team will contact you within 24 hours to discuss your goals and next steps.",
      });

      // Reset form data
      setMentorshipData({
        name: "",
        email: "",
        phone: "",
        description: "",
        budget: "",
        investment: "",
        revenue_goal: "",
        experience: "",
        business_type: "",
        timeline: ""
      });

    } catch (error) {
      console.error('Error submitting mentorship application:', error);
      
      let errorMessage = "Failed to submit application. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          errorMessage = "You have already submitted an application. Our team will contact you soon!";
        } else if (error.message.includes('invalid input')) {
          errorMessage = "Please check your information and try again.";
        } else {
          errorMessage = `Submission failed: ${error.message}`;
        }
      }
      
      toast({
        title: "Submission Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (formData.mentorshipRequested) {
    return (
      <Card className="border-0 shadow-lg max-w-2xl mx-auto">
        <CardContent className="py-12 px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted Successfully! 🎉</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in our 1-on-1 mentorship program. Our expert team will review your application and contact you within 24 hours to discuss your business goals and next steps.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-blue-800 text-sm space-y-1 text-left">
                <li>• Check your email for confirmation</li>
                <li>• Prepare for your consultation call</li>
                <li>• Review your business goals and challenges</li>
                <li>• Get ready to accelerate your success!</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-2xl rounded-2xl max-w-3xl mx-auto overflow-hidden">
      <CardContent className="p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Work With a Mentor 1-on-1</h2>
            <p className="text-white/90 text-base max-w-2xl mx-auto leading-relaxed">
              Get personal business guidance from successful Shopify store owners and online entrepreneurs.<br />
              We'll help you grow faster, avoid mistakes, and scale with confidence.
            </p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Value Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">What You'll Receive</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-gray-700 text-sm font-medium">1-on-1 strategy sessions tailored to your store</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-gray-700 text-sm font-medium">Custom plan for marketing, ads & content strategies</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-gray-700 text-sm font-medium">Product and pricing improvement</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-gray-700 text-sm font-medium">Weekly check-ins and progress tracking</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-gray-700 text-sm font-medium">Real support from real entrepreneurs</span>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              <span className="text-gray-700 font-medium">Trusted by thousands</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700 font-medium">Proven strategies</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MessageCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
              <span className="text-gray-700 font-medium">Dedicated support</span>
            </div>
          </div>

          {/* Form Section */}
          <div className="pt-2">
            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                Tell us about you
              </h3>
              <p className="text-gray-600 text-sm">We'll match you with the perfect mentor for your store</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={mentorshipData.name}
                    onChange={(e) => handleInputChangeMentorship('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1.5 h-11 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={mentorshipData.email}
                    onChange={(e) => handleInputChangeMentorship('email', e.target.value)}
                    placeholder="Your best email"
                    className="mt-1.5 h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    value={mentorshipData.phone}
                    onChange={(e) => handleInputChangeMentorship('phone', e.target.value)}
                    placeholder="WhatsApp or mobile number"
                    className="mt-1.5 h-11 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
                    Years in Business
                  </Label>
                  <Select onValueChange={(value) => handleInputChangeMentorship('experience', value)}>
                    <SelectTrigger className="mt-1.5 h-11 rounded-xl">
                      <SelectValue placeholder="Brand new / 6 months / 1 year / 2+ years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Brand new</SelectItem>
                      <SelectItem value="0.5">6 months</SelectItem>
                      <SelectItem value="1">1 year</SelectItem>
                      <SelectItem value="2">2+ years</SelectItem>
                      <SelectItem value="5+">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="budget" className="text-sm font-medium text-gray-700">
                    Monthly Budget
                  </Label>
                  <Select onValueChange={(value) => handleInputChangeMentorship('budget', value)}>
                    <SelectTrigger className="mt-1.5 h-11 rounded-xl">
                      <SelectValue placeholder="Your marketing budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">$1,000 - $2,500</SelectItem>
                      <SelectItem value="2500">$2,500 - $5,000</SelectItem>
                      <SelectItem value="5000">$5,000 - $10,000</SelectItem>
                      <SelectItem value="10000">$10,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="investment" className="text-sm font-medium text-gray-700">
                    Investment Capacity
                  </Label>
                  <Select onValueChange={(value) => handleInputChangeMentorship('investment', value)}>
                    <SelectTrigger className="mt-1.5 h-11 rounded-xl">
                      <SelectValue placeholder="How much you can invest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5000">$5,000 - $10,000</SelectItem>
                      <SelectItem value="10000">$10,000 - $25,000</SelectItem>
                      <SelectItem value="25000">$25,000 - $50,000</SelectItem>
                      <SelectItem value="50000">$50,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="revenue_goal" className="text-sm font-medium text-gray-700">
                    Revenue Goal
                  </Label>
                  <Select onValueChange={(value) => handleInputChangeMentorship('revenue_goal', value)}>
                    <SelectTrigger className="mt-1.5 h-11 rounded-xl">
                      <SelectValue placeholder="Your monthly goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3000">$3,000/month</SelectItem>
                      <SelectItem value="10000">$10,000/month</SelectItem>
                      <SelectItem value="25000">$25,000/month</SelectItem>
                      <SelectItem value="50000">$50,000/month</SelectItem>
                      <SelectItem value="100000">$100,000+/month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Why do you want 1-on-1 mentorship? *
                </Label>
                <Textarea
                  id="description"
                  value={mentorshipData.description}
                  onChange={(e) => handleInputChangeMentorship('description', e.target.value)}
                  placeholder="Tell us your goals, challenges, or what you want help with..."
                  className="mt-1.5 min-h-[100px] rounded-xl"
                />
              </div>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 text-base font-bold rounded-xl mt-6 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              onClick={handleSubmitApplication}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Submitting Application...</span>
                </div>
              ) : (
                <span>🚀 Apply for Personal Mentorship</span>
              )}
            </Button>

            {/* Reassurance Text */}
            <div className="mt-4 space-y-2 text-center">
              <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                ⚡ Optional step — you can continue without mentorship
              </p>
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                ✅ Request received! A mentor will contact you within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MentorshipStep;

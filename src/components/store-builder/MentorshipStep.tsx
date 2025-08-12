
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Check, Loader2 } from "lucide-react";
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
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardContent className="py-8 px-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">1-on-1 Mentorship</h2>
          <p className="text-gray-600 text-sm">Apply for personal guidance from successful entrepreneurs</p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What You'll Get:</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Personal strategy sessions with successful entrepreneurs
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Custom business plan and growth strategies
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Marketing and advertising optimization
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                Weekly check-ins and progress tracking
              </li>
            </ul>
          </div>

          <div className="grid gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name" className="text-xs font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={mentorshipData.name}
                  onChange={(e) => handleInputChangeMentorship('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs font-medium text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={mentorshipData.email}
                  onChange={(e) => handleInputChangeMentorship('email', e.target.value)}
                  placeholder="Enter your email"
                  className="mt-1 h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="phone" className="text-xs font-medium text-gray-700">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  value={mentorshipData.phone}
                  onChange={(e) => handleInputChangeMentorship('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="experience" className="text-xs font-medium text-gray-700">
                  Years in Business
                </Label>
                <Select onValueChange={(value) => handleInputChangeMentorship('experience', value)}>
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Just starting</SelectItem>
                    <SelectItem value="1">Less than 1 year</SelectItem>
                    <SelectItem value="2">1-2 years</SelectItem>
                    <SelectItem value="3">3-5 years</SelectItem>
                    <SelectItem value="5+">5+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="budget" className="text-xs font-medium text-gray-700">
                  Monthly Budget
                </Label>
                <Select onValueChange={(value) => handleInputChangeMentorship('budget', value)}>
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Select budget" />
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
                <Label htmlFor="investment" className="text-xs font-medium text-gray-700">
                  Investment Capacity
                </Label>
                <Select onValueChange={(value) => handleInputChangeMentorship('investment', value)}>
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Investment amount" />
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
                <Label htmlFor="revenue_goal" className="text-xs font-medium text-gray-700">
                  Revenue Goal
                </Label>
                <Select onValueChange={(value) => handleInputChangeMentorship('revenue_goal', value)}>
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue placeholder="Monthly goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10000">$10,000/month</SelectItem>
                    <SelectItem value="25000">$25,000/month</SelectItem>
                    <SelectItem value="50000">$50,000/month</SelectItem>
                    <SelectItem value="100000">$100,000+/month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-xs font-medium text-gray-700">
                Why do you want 1-on-1 mentorship? *
              </Label>
              <Textarea
                id="description"
                value={mentorshipData.description}
                onChange={(e) => handleInputChangeMentorship('description', e.target.value)}
                placeholder="Tell us about your goals, challenges, and what you hope to achieve with mentorship..."
                className="mt-1 min-h-[80px] text-sm"
              />
            </div>
          </div>

          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-sm font-semibold disabled:bg-gray-400"
            onClick={handleSubmitApplication}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Submitting Application...
              </div>
            ) : (
              "Apply for Mentorship"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MentorshipStep;

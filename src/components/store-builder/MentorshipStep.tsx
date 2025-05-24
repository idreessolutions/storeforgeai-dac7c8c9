
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MentorshipStepProps {
  formData: {
    mentorshipRequested: boolean;
  };
  handleInputChange: (field: string, value: boolean) => void;
}

const MentorshipStep = ({ formData, handleInputChange }: MentorshipStepProps) => {
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
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically send the data to your backend
      console.log('Mentorship application:', mentorshipData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      handleInputChange('mentorshipRequested', true);
      
      toast({
        title: "Application Submitted!",
        description: "We'll contact you within 24 hours to discuss your mentorship.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  if (formData.mentorshipRequested) {
    return (
      <Card className="border-0 shadow-lg max-w-2xl mx-auto">
        <CardContent className="py-12 px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in our 1-on-1 mentorship program. Our team will review your application and contact you within 24 hours.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Next Steps:</strong> Check your email for confirmation and prepare for your consultation call.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardContent className="py-12 px-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">1-on-1 Mentorship</h2>
          <p className="text-gray-600">Apply for personal guidance from successful entrepreneurs</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Get:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                Personal strategy sessions with successful entrepreneurs
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                Custom business plan and growth strategies
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                Marketing and advertising optimization
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                Weekly check-ins and progress tracking
              </li>
            </ul>
          </div>

          <div className="grid gap-4">
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
                  className="mt-1"
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
                  placeholder="Enter your email"
                  className="mt-1"
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
                  placeholder="Enter your phone number"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
                  Years in Business
                </Label>
                <Select onValueChange={(value) => handleInputChangeMentorship('experience', value)}>
                  <SelectTrigger className="mt-1">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="budget" className="text-sm font-medium text-gray-700">
                  Monthly Budget
                </Label>
                <Select onValueChange={(value) => handleInputChangeMentorship('budget', value)}>
                  <SelectTrigger className="mt-1">
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
                <Label htmlFor="investment" className="text-sm font-medium text-gray-700">
                  Investment Capacity
                </Label>
                <Select onValueChange={(value) => handleInputChangeMentorship('investment', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="How much can you invest?" />
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
                  <SelectTrigger className="mt-1">
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
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Why do you want 1-on-1 mentorship? *
              </Label>
              <Textarea
                id="description"
                value={mentorshipData.description}
                onChange={(e) => handleInputChangeMentorship('description', e.target.value)}
                placeholder="Tell us about your goals, challenges, and what you hope to achieve with mentorship..."
                className="mt-1 min-h-[100px]"
              />
            </div>
          </div>

          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 text-lg font-semibold"
            onClick={handleSubmitApplication}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting Application..." : "Apply for Mentorship"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MentorshipStep;

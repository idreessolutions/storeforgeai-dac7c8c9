
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MentorshipFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  whyMentorship: string;
  budgetRange: string;
  investmentAmount: string;
  incomeGoal: string;
  businessExperience: string;
  additionalInfo: string;
}

interface MentorshipFormProps {
  formData: MentorshipFormData;
  handleInputChange: (field: string, value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const MentorshipForm = ({ formData, handleInputChange, onSubmit, isSubmitting }: MentorshipFormProps) => {
  return (
    <Card className="border-0 shadow-lg max-w-3xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900">1-on-1 Mentorship Application</CardTitle>
        <p className="text-gray-600 text-sm">Get personalized guidance from successful entrepreneurs</p>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto px-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm">Phone Number *</Label>
          <Input
            id="phoneNumber"
            placeholder="EX: +1 (212)-456-7890"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className="text-sm"
          />
          <p className="text-xs text-gray-500">Please include your country code (e.g., +1 for US)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="whyMentorship" className="text-sm">Why do you want mentorship?</Label>
          <Textarea
            id="whyMentorship"
            placeholder="Tell us your goals and what you hope to achieve..."
            value={formData.whyMentorship}
            onChange={(e) => handleInputChange('whyMentorship', e.target.value)}
            rows={3}
            className="text-sm"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budgetRange" className="text-sm">Monthly Budget Range</Label>
            <Select value={formData.budgetRange} onValueChange={(value) => handleInputChange('budgetRange', value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select your budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-1000">Under $1,000</SelectItem>
                <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                <SelectItem value="10000-plus">$10,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="investmentAmount" className="text-sm">How much can you invest?</Label>
            <Select value={formData.investmentAmount} onValueChange={(value) => handleInputChange('investmentAmount', value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select investment range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-500">Under $500</SelectItem>
                <SelectItem value="500-2000">$500 - $2,000</SelectItem>
                <SelectItem value="2000-5000">$2,000 - $5,000</SelectItem>
                <SelectItem value="5000-plus">$5,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="incomeGoal" className="text-sm">Income Goal</Label>
            <Select value={formData.incomeGoal} onValueChange={(value) => handleInputChange('incomeGoal', value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select your goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1000-month">$1,000/month</SelectItem>
                <SelectItem value="5000-month">$5,000/month</SelectItem>
                <SelectItem value="10000-month">$10,000/month</SelectItem>
                <SelectItem value="25000-month">$25,000+/month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessExperience" className="text-sm">Business Experience</Label>
            <Select value={formData.businessExperience} onValueChange={(value) => handleInputChange('businessExperience', value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="some-experience">Some Experience</SelectItem>
                <SelectItem value="experienced">Experienced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalInfo" className="text-sm">Additional Information</Label>
          <Textarea
            id="additionalInfo"
            placeholder="Any additional details you'd like to share..."
            value={formData.additionalInfo}
            onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
            rows={3}
            className="text-sm"
          />
        </div>

        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm font-semibold mt-6"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting Application..." : "Submit Application"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MentorshipForm;

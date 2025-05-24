
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MentorshipFormProps {
  onSubmit: () => void;
}

const MentorshipForm = ({ onSubmit }: MentorshipFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whyMentorship: "",
    budget: "",
    investment: "",
    targetIncome: "",
    businessYears: "",
    experience: "",
    goals: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Mentorship application:", formData);
    onSubmit();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardContent className="py-8 px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
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
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone Number *
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="whyMentorship" className="text-sm font-medium text-gray-700">
              Why do you want 1-on-1 mentorship? *
            </Label>
            <Textarea
              id="whyMentorship"
              value={formData.whyMentorship}
              onChange={(e) => handleInputChange('whyMentorship', e.target.value)}
              required
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget" className="text-sm font-medium text-gray-700">
                What's your budget for mentorship? *
              </Label>
              <Select onValueChange={(value) => handleInputChange('budget', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                  <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                  <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                  <SelectItem value="5000+">$5,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="investment" className="text-sm font-medium text-gray-700">
                How much can you invest in your business? *
              </Label>
              <Select onValueChange={(value) => handleInputChange('investment', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select investment amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                  <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                  <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
                  <SelectItem value="25000+">$25,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetIncome" className="text-sm font-medium text-gray-700">
                Target monthly income goal? *
              </Label>
              <Select onValueChange={(value) => handleInputChange('targetIncome', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select income goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000-5000">$1,000 - $5,000/month</SelectItem>
                  <SelectItem value="5000-10000">$5,000 - $10,000/month</SelectItem>
                  <SelectItem value="10000-25000">$10,000 - $25,000/month</SelectItem>
                  <SelectItem value="25000+">$25,000+/month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="businessYears" className="text-sm font-medium text-gray-700">
                Years in business/e-commerce? *
              </Label>
              <Select onValueChange={(value) => handleInputChange('businessYears', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Complete beginner</SelectItem>
                  <SelectItem value="1">Less than 1 year</SelectItem>
                  <SelectItem value="1-3">1-3 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5+">5+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
              Previous e-commerce experience *
            </Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              required
              className="mt-1"
              rows={3}
              placeholder="Tell us about your previous business or e-commerce experience..."
            />
          </div>

          <div>
            <Label htmlFor="goals" className="text-sm font-medium text-gray-700">
              What are your main business goals? *
            </Label>
            <Textarea
              id="goals"
              value={formData.goals}
              onChange={(e) => handleInputChange('goals', e.target.value)}
              required
              className="mt-1"
              rows={3}
              placeholder="Describe your short-term and long-term business goals..."
            />
          </div>

          <Button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
          >
            Submit Application
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MentorshipForm;

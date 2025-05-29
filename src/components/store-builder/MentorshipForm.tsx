
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MentorshipFormProps {
  onSuccess: () => void;
}

const MentorshipForm = ({ onSuccess }: MentorshipFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    businessExperience: "",
    incomeGoal: "",
    investmentAmount: "",
    budgetRange: "",
    whyMentorship: "",
    additionalInfo: ""
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a unique session ID for this application
      const sessionId = `mentorship_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      console.log('Submitting mentorship application:', formData);
      
      const { error } = await supabase
        .from('mentorship_applications')
        .insert({
          session_id: sessionId, // Use generated session ID instead of foreign key
          full_name: formData.fullName,
          email: formData.email,
          phone_number: formData.phoneNumber,
          business_experience: formData.businessExperience,
          income_goal: formData.incomeGoal,
          investment_amount: formData.investmentAmount,
          budget_range: formData.budgetRange,
          why_mentorship: formData.whyMentorship,
          additional_info: formData.additionalInfo
        });

      if (error) {
        console.error('Database error:', error);
        throw new Error(error.message);
      }

      // Store in Supabase Storage as backup
      try {
        const fileName = `mentorship/${sessionId}-${Date.now()}.json`;
        const fileContent = new Blob([JSON.stringify({
          ...formData,
          sessionId,
          submittedAt: new Date().toISOString()
        }, null, 2)], {
          type: 'application/json'
        });

        await supabase.storage
          .from('product-data')
          .upload(fileName, fileContent);
        
        console.log('✅ Mentorship application stored in storage bucket');
      } catch (storageError) {
        console.warn('Storage backup failed:', storageError);
        // Don't fail the submission if storage fails
      }

      toast({
        title: "Application Submitted Successfully! 🎉",
        description: "We've received your mentorship application and will contact you within 24 hours to discuss your journey to success.",
      });

      onSuccess();
    } catch (error) {
      console.error('Error submitting mentorship application:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Apply for 1-on-1 Mentorship</CardTitle>
        <p className="text-gray-600 text-center">
          Get personalized guidance from our experts to accelerate your e-commerce success
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <Label htmlFor="businessExperience">Business Experience</Label>
            <Select onValueChange={(value) => handleInputChange('businessExperience', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Complete Beginner</SelectItem>
                <SelectItem value="some">Some Experience (1-2 years)</SelectItem>
                <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="incomeGoal">Monthly Income Goal</Label>
            <Select onValueChange={(value) => handleInputChange('incomeGoal', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your income goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
                <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                <SelectItem value="50k+">$50,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="investmentAmount">Investment Amount Available</Label>
            <Select onValueChange={(value) => handleInputChange('investmentAmount', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your investment budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-1k">Under $1,000</SelectItem>
                <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
                <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                <SelectItem value="25k+">$25,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="whyMentorship">Why do you want mentorship?</Label>
            <Textarea
              id="whyMentorship"
              value={formData.whyMentorship}
              onChange={(e) => handleInputChange('whyMentorship', e.target.value)}
              placeholder="Tell us about your goals and what you hope to achieve..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              placeholder="Any additional information you'd like to share..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-lg font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Submitting Application...
              </div>
            ) : (
              "Submit Mentorship Application"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MentorshipForm;

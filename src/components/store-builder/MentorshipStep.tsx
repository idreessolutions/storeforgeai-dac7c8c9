
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Clock, Star } from "lucide-react";

interface MentorshipStepProps {
  formData: {
    mentorshipRequested: boolean;
  };
  handleInputChange: (field: string, value: boolean) => void;
}

const MentorshipStep = ({ formData, handleInputChange }: MentorshipStepProps) => {
  const handleRequestMentorship = () => {
    handleInputChange('mentorshipRequested', true);
  };

  return (
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardContent className="py-12 px-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Mentorship Application</h2>
          <p className="text-blue-600 font-semibold">Apply to join our exclusive mentorship program</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Interested in 1 on 1 Support & Guidance?</h3>
            <p className="text-gray-700 mb-6">
              Fill out this form to see if you qualify!
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Personal Mentor</h4>
                  <p className="text-sm text-gray-600">Get assigned a dedicated mentor for your journey</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Weekly Calls</h4>
                  <p className="text-sm text-gray-600">Regular 1-on-1 sessions to track your progress</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Expert Guidance</h4>
                  <p className="text-sm text-gray-600">Learn from successful e-commerce entrepreneurs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MessageCircle className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                  <p className="text-sm text-gray-600">Direct access to your mentor via chat</p>
                </div>
              </div>
            </div>

            {formData.mentorshipRequested ? (
              <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                <div className="text-center">
                  <h4 className="font-bold text-green-800 mb-2">We received your submission!</h4>
                  <p className="text-green-700 text-sm mb-2">
                    Unfortunately our applications are at full capacity.
                  </p>
                  <p className="text-green-700 text-sm">
                    We will email you if we have any openings!
                  </p>
                </div>
                <Button 
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {/* Continue to next step */}}
                >
                  Continue to Next Step
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Takes 3 minutes
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
                  onClick={handleRequestMentorship}
                >
                  Start
                  <span className="ml-2 text-xs">press Enter ↵</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MentorshipStep;

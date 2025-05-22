
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FutureStepProps {
  step: number;
  stepTitle: string;
  stepDescription: string;
  icon: React.ElementType;
}

const FutureStep = ({ step, stepTitle, stepDescription, icon: Icon }: FutureStepProps) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{stepTitle}</CardTitle>
        <p className="text-gray-600">{stepDescription}</p>
      </CardHeader>
      <CardContent className="py-12">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="h-8 w-8 text-gray-400" />
          </div>
          <p>This step will be implemented in the next phase</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FutureStep;

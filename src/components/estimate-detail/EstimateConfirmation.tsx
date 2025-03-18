
import React from "react";
import { CheckCircle } from "lucide-react";

interface EstimateConfirmationProps {
  estimateId: string;
}

const EstimateConfirmation = ({ estimateId }: EstimateConfirmationProps) => {
  return (
    <>
      <div className="flex items-center justify-center text-green-500 mb-4">
        <CheckCircle className="h-16 w-16" />
      </div>
      
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Estimate #{estimateId?.substring(0, 8)}</h1>
        <p className="text-muted-foreground">
          Your painting estimate has been saved and is ready for review.
        </p>
      </div>
    </>
  );
};

export default EstimateConfirmation;

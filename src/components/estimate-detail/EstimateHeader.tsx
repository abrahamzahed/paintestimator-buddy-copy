
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";

interface EstimateHeaderProps {
  onBack: () => void;
  onShowDetailedView: () => void;
}

const EstimateHeader = ({ onBack, onShowDetailedView }: EstimateHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onBack}
        className="flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onShowDetailedView}
          className="flex items-center"
        >
          <Printer className="mr-2 h-4 w-4" /> Print Details
        </Button>
      </div>
    </div>
  );
};

export default EstimateHeader;

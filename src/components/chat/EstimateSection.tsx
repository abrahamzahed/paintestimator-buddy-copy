
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import EstimateCalculator from "../EstimateCalculator";
import { EstimateResult } from "@/types";

interface EstimateSectionProps {
  onEstimateComplete: (estimate: EstimateResult) => void;
  onClose: () => void;
}

const EstimateSection = ({ onEstimateComplete, onClose }: EstimateSectionProps) => {
  return (
    <div className="p-4 border-t">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Estimate Calculator</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <EstimateCalculator onEstimateComplete={onEstimateComplete} />
    </div>
  );
};

export default EstimateSection;

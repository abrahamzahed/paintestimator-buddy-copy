
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { EstimateResult } from "@/types";
import { FreeEstimator } from "@/packages/free-estimator";

interface EstimateSectionProps {
  onEstimateComplete: (estimate: EstimateResult) => void;
  onClose: () => void;
}

const EstimateSection = ({ 
  onEstimateComplete, 
  onClose
}: EstimateSectionProps) => {
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
      <FreeEstimator isAuthenticated={true} />
    </div>
  );
};

export default EstimateSection;


import { EstimateResult } from "@/types";
import { formatCurrency } from "@/utils/estimateUtils";
import { EstimatorSummary } from "@/types/estimator";

interface CurrentEstimatePanelProps {
  currentEstimate: EstimateResult | null;
  dynamicEstimate?: EstimatorSummary | null;
  showDetails?: boolean;
}

const CurrentEstimatePanel = ({ 
  currentEstimate, 
  dynamicEstimate, 
  showDetails = true 
}: CurrentEstimatePanelProps) => {
  // Use dynamic estimate if provided, otherwise use the standard estimate
  const totalCost = dynamicEstimate 
    ? dynamicEstimate.finalTotal 
    : (currentEstimate?.totalCost || 0);

  return (
    <div className="mt-4 p-3 bg-foreground/5 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="font-medium">Current Estimate:</span>
        <span className="text-xl font-bold text-paint">
          {formatCurrency(totalCost)}
        </span>
      </div>
    </div>
  );
};

export default CurrentEstimatePanel;

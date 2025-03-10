
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
    
  const laborCost = dynamicEstimate 
    ? totalCost * 0.7 // Approximate 70% labor cost
    : (currentEstimate?.laborCost || 0);
    
  const materialCost = dynamicEstimate 
    ? totalCost * 0.3 // Approximate 30% material cost
    : (currentEstimate?.materialCost || 0);

  return (
    <div className="mt-4 p-3 bg-foreground/5 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="font-medium">Current Estimate:</span>
        <span className="text-xl font-bold text-paint">
          {formatCurrency(totalCost)}
        </span>
      </div>
      {showDetails && (totalCost > 0) && (
        <div className="mt-2 text-sm text-muted-foreground grid grid-cols-2 gap-2">
          <div>Labor: {formatCurrency(laborCost)}</div>
          <div>Materials: {formatCurrency(materialCost)}</div>
        </div>
      )}
    </div>
  );
};

export default CurrentEstimatePanel;


import { EstimateResult } from "@/types";
import { EstimatorSummary } from "@/types/estimator";
import { formatCurrency } from "@/utils/estimateUtils";

interface CurrentEstimatePanelProps {
  currentEstimate: EstimateResult | EstimatorSummary | null;
}

const CurrentEstimatePanel = ({ currentEstimate }: CurrentEstimatePanelProps) => {
  // Handle both EstimateResult and EstimatorSummary types
  const getTotalCost = () => {
    if (!currentEstimate) return '$0.00';
    
    if ('totalCost' in currentEstimate) {
      // It's EstimateResult type
      return formatCurrency(currentEstimate.totalCost);
    } else if ('finalTotal' in currentEstimate) {
      // It's EstimatorSummary type
      return formatCurrency(currentEstimate.finalTotal);
    }
    
    return '$0.00';
  };
  
  const getLaborCost = () => {
    if (!currentEstimate) return '$0.00';
    
    if ('laborCost' in currentEstimate) {
      // It's EstimateResult type
      return formatCurrency(currentEstimate.laborCost);
    } else if ('finalTotal' in currentEstimate) {
      // Approximate labor cost for EstimatorSummary (70% of total)
      return formatCurrency(currentEstimate.finalTotal * 0.7);
    }
    
    return '$0.00';
  };
  
  const getMaterialCost = () => {
    if (!currentEstimate) return '$0.00';
    
    if ('materialCost' in currentEstimate) {
      // It's EstimateResult type
      return formatCurrency(currentEstimate.materialCost);
    } else if ('finalTotal' in currentEstimate) {
      // Approximate material cost for EstimatorSummary (30% of total)
      return formatCurrency(currentEstimate.finalTotal * 0.3);
    }
    
    return '$0.00';
  };

  return (
    <div className="mt-4 p-3 bg-foreground/5 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="font-medium">Current Estimate:</span>
        <span className="text-xl font-bold text-paint">
          {getTotalCost()}
        </span>
      </div>
      {currentEstimate && (
        <div className="mt-2 text-sm text-muted-foreground grid grid-cols-2 gap-2">
          <div>Labor: {getLaborCost()}</div>
          <div>Materials: {getMaterialCost()}</div>
        </div>
      )}
    </div>
  );
};

export default CurrentEstimatePanel;

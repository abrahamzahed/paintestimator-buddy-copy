
import { EstimateResult, EstimatorSummary } from "@/types";
import { formatCurrency } from "@/utils/estimateUtils";

interface CurrentEstimatePanelProps {
  currentEstimate: EstimateResult | EstimatorSummary | null;
}

const CurrentEstimatePanel = ({ currentEstimate }: CurrentEstimatePanelProps) => {
  if (!currentEstimate) {
    return null;
  }
  
  // Handle both EstimateResult and EstimatorSummary types
  const totalCost = 'totalCost' in currentEstimate 
    ? currentEstimate.totalCost 
    : 'finalTotal' in currentEstimate 
      ? currentEstimate.finalTotal 
      : 0;
      
  const laborCost = 'laborCost' in currentEstimate 
    ? currentEstimate.laborCost
    : 0;
    
  const materialCost = 'materialCost' in currentEstimate 
    ? currentEstimate.materialCost
    : 0;

  return (
    <div className="p-4 bg-foreground/5 rounded-lg border border-border">
      <div className="flex justify-between items-center">
        <span className="font-medium">Current Estimate:</span>
        <span className="text-xl font-bold text-paint">
          {formatCurrency(totalCost)}
        </span>
      </div>
      
      <div className="mt-2 text-sm text-muted-foreground grid grid-cols-2 gap-2">
        {laborCost > 0 && <div>Labor: {formatCurrency(laborCost)}</div>}
        {materialCost > 0 && <div>Materials: {formatCurrency(materialCost)}</div>}
        
        {'timeEstimate' in currentEstimate && currentEstimate.timeEstimate > 0 && (
          <div>Time: ~{currentEstimate.timeEstimate.toFixed(1)} hours</div>
        )}
        
        {'paintCans' in currentEstimate && currentEstimate.paintCans > 0 && (
          <div>Paint: ~{currentEstimate.paintCans} gallons</div>
        )}
      </div>
    </div>
  );
};

export default CurrentEstimatePanel;

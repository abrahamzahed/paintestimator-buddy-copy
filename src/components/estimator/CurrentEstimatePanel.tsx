
import { EstimateResult } from "@/types";
import { formatCurrency } from "@/utils/estimateUtils";

interface CurrentEstimatePanelProps {
  currentEstimate: EstimateResult | null;
}

const CurrentEstimatePanel = ({ currentEstimate }: CurrentEstimatePanelProps) => {
  return (
    <div className="mt-4 p-3 bg-foreground/5 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="font-medium">Current Estimate:</span>
        <span className="text-xl font-bold text-paint">
          {currentEstimate ? formatCurrency(currentEstimate.totalCost) : '$0.00'}
        </span>
      </div>
      {currentEstimate && (
        <div className="mt-2 text-sm text-muted-foreground grid grid-cols-2 gap-2">
          <div>Labor: {formatCurrency(currentEstimate.laborCost)}</div>
          <div>Materials: {formatCurrency(currentEstimate.materialCost)}</div>
        </div>
      )}
    </div>
  );
};

export default CurrentEstimatePanel;

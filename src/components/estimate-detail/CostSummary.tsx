
import { Estimate } from "@/types";
import { formatCurrency } from "@/utils/estimateUtils";

interface CostSummaryProps {
  estimate: Estimate;
}

const CostSummary = ({ estimate }: CostSummaryProps) => {
  return (
    <div className="space-y-1">
      {(estimate?.discount || 0) > 0 && (
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Discount:</span>
          <span className="text-sm text-green-600">-{formatCurrency(estimate?.discount || 0)}</span>
        </div>
      )}
      <div className="flex justify-between border-t pt-1 mt-1">
        <span className="font-semibold">Total:</span>
        <span className="font-semibold">{formatCurrency(estimate?.total_cost || 0)}</span>
      </div>
    </div>
  );
};

export default CostSummary;


import { Estimate } from "@/types";
import { formatCurrency } from "@/utils/estimateUtils";

interface CostSummaryProps {
  estimate: Estimate;
}

const CostSummary = ({ estimate }: CostSummaryProps) => {
  // Safely access roomDetails from estimate details
  const getDetailsRooms = () => {
    if (estimate?.details && typeof estimate.details === 'object') {
      return 'roomDetails' in estimate.details && Array.isArray(estimate.details.roomDetails) 
        ? estimate.details.roomDetails 
        : [];
    }
    return [];
  };

  const roomDetails = getDetailsRooms();

  return (
    <div className="space-y-1">
      {roomDetails.length > 0 && (
        <div className="text-sm space-y-1 mb-2">
          {roomDetails.map((room: any, index: number) => (
            <div key={index} className="flex justify-between">
              <span className="text-muted-foreground">{room.roomType || `Room ${index + 1}`}:</span>
              <span className="text-sm">{formatCurrency(room.totalCost || 0)}</span>
            </div>
          ))}
        </div>
      )}
      
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

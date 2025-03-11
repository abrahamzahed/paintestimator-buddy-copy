
import { Estimate } from "@/types";
import { formatCurrency } from "@/utils/estimateUtils";

interface CostSummaryProps {
  estimate: Estimate;
}

const CostSummary = ({ estimate }: CostSummaryProps) => {
  // Extract line items if they exist in details
  const details = estimate?.details || {};
  const roomDetails = details?.roomDetails || [];
  
  return (
    <div className="space-y-1">
      {/* Show room-specific costs if available */}
      {roomDetails.length > 0 && (
        <div className="space-y-1 mb-2">
          {roomDetails.map((room: any, index: number) => (
            <div key={index} className="text-sm">
              <div className="font-medium">Room {index + 1}: {room.roomType}</div>
              {room.condition && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Condition:</span>
                  <span>{room.condition}</span>
                </div>
              )}
              {room.paintType && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Paint Type:</span>
                  <span>{room.paintType}</span>
                </div>
              )}
              {room.hasHighCeiling && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>High Ceiling:</span>
                  <span>Yes</span>
                </div>
              )}
              {(room.doorsCount > 0) && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Doors:</span>
                  <span>{room.doorsCount}</span>
                </div>
              )}
              {(room.windowsCount > 0) && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Windows:</span>
                  <span>{room.windowsCount}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Discount */}
      {(estimate?.discount || 0) > 0 && (
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Discount:</span>
          <span className="text-sm text-green-600">-{formatCurrency(estimate?.discount || 0)}</span>
        </div>
      )}
      
      {/* Total */}
      <div className="flex justify-between border-t pt-1 mt-1">
        <span className="font-semibold">Total:</span>
        <span className="font-semibold">{formatCurrency(estimate?.total_cost || 0)}</span>
      </div>
    </div>
  );
};

export default CostSummary;

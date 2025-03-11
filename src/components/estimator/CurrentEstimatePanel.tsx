
import { EstimateResult } from "@/types";
import { formatCurrency } from "@/utils/estimateUtils";
import { EstimatorSummary, RoomDetails as DynamicRoomDetails } from "@/types/estimator";

interface CurrentEstimatePanelProps {
  currentEstimate: EstimateResult | null;
  dynamicEstimate?: EstimatorSummary | null;
  showDetails?: boolean;
  roomDetails?: DynamicRoomDetails[] | null;
}

const CurrentEstimatePanel = ({ 
  currentEstimate, 
  dynamicEstimate, 
  showDetails = true,
  roomDetails
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
      
      {showDetails && roomDetails && roomDetails.length > 0 && (
        <div className="mt-2 text-sm space-y-1">
          <p className="text-muted-foreground">Rooms breakdown:</p>
          {roomDetails.map((room, index) => (
            <div key={room.id} className="flex justify-between">
              <span>{room.roomTypeId} (Room {index + 1})</span>
              <span className="font-medium">
                {formatCurrency(dynamicEstimate?.roomCosts[index]?.totalBeforeVolume || 0)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrentEstimatePanel;


import { EstimateResult } from "@/types";
import { formatCurrency } from "@/utils/estimateUtils";
import { EstimatorSummary, RoomCost, RoomDetails } from "@/types/estimator";

interface CurrentEstimatePanelProps {
  currentEstimate: EstimateResult | null;
  dynamicEstimate?: EstimatorSummary | null;
  showDetails?: boolean;
  roomDetails?: RoomDetails;
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
      
      {showDetails && dynamicEstimate && dynamicEstimate.roomCosts && dynamicEstimate.roomCosts.length > 0 && (
        <div className="mt-3 space-y-3">
          {roomDetails && roomDetails.rooms && roomDetails.rooms.map((room, index) => {
            const roomCost = dynamicEstimate.roomCosts[index];
            if (!roomCost) return null;
            
            return (
              <div key={room.id} className="border-t pt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm">
                    Room {index + 1}: {room.roomTypeId}
                  </span>
                  <span className="font-medium text-sm">
                    {formatCurrency(roomCost.totalBeforeVolume)}
                  </span>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  {roomCost.basePrice > 0 && (
                    <div className="flex justify-between">
                      <span>Base Price</span>
                      <span>{formatCurrency(roomCost.basePrice)}</span>
                    </div>
                  )}
                  
                  {roomCost.paintUpcharge > 0 && (
                    <div className="flex justify-between">
                      <span>Paint Upgrade</span>
                      <span>{formatCurrency(roomCost.paintUpcharge)}</span>
                    </div>
                  )}
                  
                  {roomCost.addonCost > 0 && (
                    <div className="flex justify-between">
                      <span>Add-ons</span>
                      <span>{formatCurrency(roomCost.addonCost)}</span>
                    </div>
                  )}
                  
                  {roomCost.highCeilingCost > 0 && (
                    <div className="flex justify-between">
                      <span>High Ceiling</span>
                      <span>{formatCurrency(roomCost.highCeilingCost)}</span>
                    </div>
                  )}
                  
                  {roomCost.doorCost > 0 && (
                    <div className="flex justify-between">
                      <span>Doors ({room.numberOfDoors})</span>
                      <span>{formatCurrency(roomCost.doorCost)}</span>
                    </div>
                  )}
                  
                  {roomCost.windowCost > 0 && (
                    <div className="flex justify-between">
                      <span>Windows ({room.numberOfWindows})</span>
                      <span>{formatCurrency(roomCost.windowCost)}</span>
                    </div>
                  )}
                  
                  {roomCost.fireplaceCost > 0 && (
                    <div className="flex justify-between">
                      <span>Fireplace</span>
                      <span>{formatCurrency(roomCost.fireplaceCost)}</span>
                    </div>
                  )}
                  
                  {roomCost.railingCost > 0 && (
                    <div className="flex justify-between">
                      <span>Stair Railing</span>
                      <span>{formatCurrency(roomCost.railingCost)}</span>
                    </div>
                  )}
                  
                  {roomCost.twoColorCost > 0 && (
                    <div className="flex justify-between">
                      <span>Two-Color Walls</span>
                      <span>{formatCurrency(roomCost.twoColorCost)}</span>
                    </div>
                  )}
                  
                  {roomCost.millworkPrimingCost > 0 && (
                    <div className="flex justify-between">
                      <span>Millwork Priming</span>
                      <span>{formatCurrency(roomCost.millworkPrimingCost)}</span>
                    </div>
                  )}
                  
                  {roomCost.repairsCost > 0 && (
                    <div className="flex justify-between">
                      <span>Repairs</span>
                      <span>{formatCurrency(roomCost.repairsCost)}</span>
                    </div>
                  )}
                  
                  {roomCost.baseboardCost > 0 && (
                    <div className="flex justify-between">
                      <span>Baseboards</span>
                      <span>{formatCurrency(roomCost.baseboardCost)}</span>
                    </div>
                  )}
                  
                  {roomCost.baseboardInstallCost > 0 && (
                    <div className="flex justify-between">
                      <span>Baseboard Installation</span>
                      <span>{formatCurrency(roomCost.baseboardInstallCost)}</span>
                    </div>
                  )}
                  
                  {roomCost.closetCost > 0 && (
                    <div className="flex justify-between">
                      <span>Closets</span>
                      <span>{formatCurrency(roomCost.closetCost)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {dynamicEstimate.volumeDiscount > 0 && (
            <div className="border-t pt-2">
              <div className="flex justify-between text-xs text-green-600">
                <span>Volume Discount</span>
                <span>-{formatCurrency(dynamicEstimate.volumeDiscount)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrentEstimatePanel;

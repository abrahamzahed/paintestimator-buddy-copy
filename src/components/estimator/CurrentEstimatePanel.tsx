
import { useState, useEffect } from "react";
import { EstimateResult } from "@/types";
import { formatCurrency } from "@/utils/estimateUtils";
import { EstimatorSummary, RoomDetails as DynamicRoomDetails } from "@/types/estimator";
import { fetchPricingData, RoomType, PaintType } from "@/lib/supabase";

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
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [paintTypes, setPaintTypes] = useState<PaintType[]>([]);
  
  // Fetch room types and paint types on component mount
  useEffect(() => {
    const loadPricingData = async () => {
      try {
        const pricingData = await fetchPricingData();
        setRoomTypes(pricingData.roomTypes);
        setPaintTypes(pricingData.paintTypes);
      } catch (error) {
        console.error("Failed to load pricing data:", error);
      }
    };
    
    loadPricingData();
  }, []);
  
  // Use dynamic estimate if provided, otherwise use the standard estimate
  const totalCost = dynamicEstimate 
    ? dynamicEstimate.finalTotal 
    : (currentEstimate?.totalCost || 0);
    
  // Function to get room name from room type ID
  const getRoomTypeName = (roomTypeId: string) => {
    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
    return roomType ? roomType.name : `Room Type (${roomTypeId})`;
  };

  // Function to get paint type name from paint type ID
  const getPaintTypeName = (paintTypeId: string | null) => {
    if (!paintTypeId) return "Standard Paint";
    const paintType = paintTypes.find(pt => pt.id === paintTypeId);
    return paintType ? paintType.name : "Custom Paint";
  };

  // Function to format room size
  const formatRoomSize = (size: string) => {
    return size.charAt(0).toUpperCase() + size.slice(1);
  };

  return (
    <div className="mt-4 p-3 bg-foreground/5 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="font-medium">Current Estimate:</span>
        <span className="text-xl font-bold text-paint">
          {formatCurrency(totalCost)}
        </span>
      </div>
      
      {showDetails && roomDetails && roomDetails.length > 0 && (
        <div className="mt-2 text-sm space-y-3">
          <p className="text-muted-foreground">Rooms breakdown:</p>
          {roomDetails.map((room, index) => (
            <div key={room.id} className="border-t pt-2">
              <div className="flex justify-between">
                <span className="font-medium">{getRoomTypeName(room.roomTypeId)} (Room {index + 1})</span>
                <span className="font-medium">
                  {formatCurrency(dynamicEstimate?.roomCosts[index]?.totalBeforeVolume || 0)}
                </span>
              </div>
              
              <div className="mt-1 text-muted-foreground space-y-1">
                {/* Room specifications */}
                <div className="grid grid-cols-2 gap-1">
                  <span>Size:</span>
                  <span>{formatRoomSize(room.size)}</span>
                  
                  <span>Paint Type:</span>
                  <span>{getPaintTypeName(room.paintType)}</span>
                  
                  {room.hasHighCeiling && (
                    <>
                      <span>Ceiling:</span>
                      <span>High ceiling</span>
                    </>
                  )}
                  
                  {room.twoColors && (
                    <>
                      <span>Wall Colors:</span>
                      <span>Two colors</span>
                    </>
                  )}
                  
                  {(room.regularClosetCount > 0 || room.walkInClosetCount > 0) && (
                    <>
                      <span>Closets:</span>
                      <span>
                        {room.walkInClosetCount > 0 && `${room.walkInClosetCount} walk-in`}
                        {room.walkInClosetCount > 0 && room.regularClosetCount > 0 && ', '}
                        {room.regularClosetCount > 0 && `${room.regularClosetCount} regular`}
                      </span>
                    </>
                  )}
                  
                  {room.fireplaceMethod !== 'none' && (
                    <>
                      <span>Fireplace:</span>
                      <span>{room.fireplaceMethod.charAt(0).toUpperCase() + room.fireplaceMethod.slice(1)} painting</span>
                    </>
                  )}
                  
                  {room.repairs !== 'none' && (
                    <>
                      <span>Repairs:</span>
                      <span>{room.repairs.charAt(0).toUpperCase() + room.repairs.slice(1)}</span>
                    </>
                  )}
                  
                  {room.hasStairRailing && (
                    <>
                      <span>Stair Railing:</span>
                      <span>Included</span>
                    </>
                  )}

                  {room.baseboardType !== 'none' && (
                    <>
                      <span>Baseboards:</span>
                      <span>{room.baseboardType.charAt(0).toUpperCase() + room.baseboardType.slice(1)} application</span>
                    </>
                  )}
                  
                  {room.millworkPrimingNeeded && (
                    <>
                      <span>Millwork Priming:</span>
                      <span>Included</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {dynamicEstimate && dynamicEstimate.volumeDiscount > 0 && (
            <div className="flex justify-between text-green-600 border-t pt-2">
              <span>Volume Discount:</span>
              <span>-{formatCurrency(dynamicEstimate.volumeDiscount)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrentEstimatePanel;

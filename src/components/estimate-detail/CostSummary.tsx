
import { useEffect, useState } from "react";
import { Estimate } from "@/types";
import { formatCurrency } from "@/utils/estimateUtils";
import { fetchPricingData, RoomType, PaintType } from "@/lib/supabase";

interface CostSummaryProps {
  estimate: Estimate;
}

const CostSummary = ({ estimate }: CostSummaryProps) => {
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

  // Safely access rooms from estimate details
  const getDetailsRooms = () => {
    if (estimate?.details && typeof estimate.details === 'object') {
      // New format from FreeEstimator
      if ('rooms' in estimate.details && Array.isArray(estimate.details.rooms)) {
        return estimate.details.rooms;
      }
      
      // Fallback for legacy format
      if ('roomDetails' in estimate.details && Array.isArray(estimate.details.roomDetails)) {
        return estimate.details.roomDetails;
      }
      
      return [];
    }
    return [];
  };

  const roomDetails = getDetailsRooms();
  
  // Function to get a readable room name
  const getRoomTypeName = (roomTypeId: string) => {
    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
    return roomType ? roomType.name : roomTypeId;
  };
  
  // Function to get paint type name
  const getPaintTypeName = (paintTypeId: string | null) => {
    if (!paintTypeId) return "Standard Paint";
    const paintType = paintTypes.find(pt => pt.id === paintTypeId);
    return paintType ? paintType.name : "Custom Paint";
  };
  
  // Format room size
  const formatRoomSize = (size: string) => {
    return size.charAt(0).toUpperCase() + size.slice(1);
  };

  // Access room costs if available
  const getRoomCost = (index: number) => {
    if (estimate?.details && typeof estimate.details === 'object' && 
        'estimateSummary' in estimate.details && 
        estimate.details.estimateSummary?.roomCosts && 
        Array.isArray(estimate.details.estimateSummary.roomCosts)) {
      return estimate.details.estimateSummary.roomCosts[index]?.totalBeforeVolume || 0;
    }
    
    // Return 0 as fallback when room costs aren't available
    return 0;
  };

  return (
    <div className="space-y-1">
      {roomDetails.length > 0 && (
        <div className="text-sm space-y-3 mb-2">
          {roomDetails.map((room: any, index: number) => (
            <div key={index} className="border-t pt-2">
              <div className="flex justify-between items-start">
                <span className="font-medium">
                  {getRoomTypeName(room.roomTypeId || room.roomType)} (Room {index + 1})
                </span>
                <span className="font-medium">
                  {formatCurrency(getRoomCost(index))}
                </span>
              </div>
              
              <div className="mt-1 text-muted-foreground text-xs grid grid-cols-2 gap-x-3 gap-y-1">
                <span>Size:</span>
                <span>{formatRoomSize(room.size || room.roomSize)}</span>
                
                <span>Paint Type:</span>
                <span>{getPaintTypeName(room.paintType)}</span>
                
                {(room.hasHighCeiling) && (
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
                
                {((room.regularClosetCount > 0 || room.walkInClosetCount > 0) || room.includeCloset) && (
                  <>
                    <span>Closets:</span>
                    <span>
                      {room.walkInClosetCount > 0 && `${room.walkInClosetCount} walk-in`}
                      {room.walkInClosetCount > 0 && room.regularClosetCount > 0 && ', '}
                      {room.regularClosetCount > 0 && `${room.regularClosetCount} regular`}
                      {!room.walkInClosetCount && !room.regularClosetCount && room.includeCloset && 'Included'}
                    </span>
                  </>
                )}
                
                {room.fireplaceMethod && room.fireplaceMethod !== 'none' && (
                  <>
                    <span>Fireplace:</span>
                    <span>{room.fireplaceMethod.charAt(0).toUpperCase() + room.fireplaceMethod.slice(1)} painting</span>
                  </>
                )}
                
                {room.repairs && room.repairs !== 'none' && (
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

                {room.baseboardType && room.baseboardType !== 'none' && (
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
                
                {(room.doorPaintingMethod && room.doorPaintingMethod !== 'none') && (
                  <>
                    <span>Doors:</span>
                    <span>{room.numberOfDoors} ({room.doorPaintingMethod} painting)</span>
                  </>
                )}
                
                {(room.windowPaintingMethod && room.windowPaintingMethod !== 'none') && (
                  <>
                    <span>Windows:</span>
                    <span>{room.numberOfWindows} ({room.windowPaintingMethod} painting)</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Volume discount section */}
      {estimate?.details && typeof estimate.details === 'object' && 
       'estimateSummary' in estimate.details && 
       estimate.details.estimateSummary?.volumeDiscount > 0 && (
        <div className="flex justify-between text-green-600">
          <span className="text-sm">Volume Discount:</span>
          <span className="text-sm">-{formatCurrency(estimate.details.estimateSummary.volumeDiscount)}</span>
        </div>
      )}
      
      {/* Standard discount section (fallback) */}
      {(estimate?.discount || 0) > 0 && !(estimate?.details && typeof estimate.details === 'object' && 
       'estimateSummary' in estimate.details && 
       estimate.details.estimateSummary?.volumeDiscount > 0) && (
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

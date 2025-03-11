
import { useEffect, useState } from "react";
import { Estimate } from "@/types";
import { formatCurrency } from "@/utils/estimateUtils";
import { fetchPricingData, RoomType } from "@/lib/supabase";

interface CostSummaryProps {
  estimate: Estimate;
}

const CostSummary = ({ estimate }: CostSummaryProps) => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  
  // Fetch room types on component mount
  useEffect(() => {
    const loadRoomTypes = async () => {
      try {
        const pricingData = await fetchPricingData();
        setRoomTypes(pricingData.roomTypes);
      } catch (error) {
        console.error("Failed to load room types:", error);
      }
    };
    
    loadRoomTypes();
  }, []);

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
  
  // Function to get a readable room name
  const getRoomTypeName = (roomTypeId: string) => {
    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
    return roomType ? roomType.name : roomTypeId;
  };
  
  // Format room name with additional data if available
  const formatRoomName = (room: any, index: number) => {
    if (room.roomTypeId && roomTypes.length > 0) {
      return `${getRoomTypeName(room.roomTypeId)} (Room ${index + 1})`;
    }
    
    return room.roomType || `Room ${index + 1}`;
  };

  return (
    <div className="space-y-1">
      {roomDetails.length > 0 && (
        <div className="text-sm space-y-1 mb-2">
          {roomDetails.map((room: any, index: number) => (
            <div key={index} className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-muted-foreground">{formatRoomName(room, index)}</span>
                {room.size && (
                  <span className="text-xs text-gray-500">
                    Size: {room.size}
                    {room.hasHighCeiling ? ", High Ceiling" : ""}
                    {room.isEmpty ? ", Empty Room" : ""}
                    {room.twoColors ? ", Two Colors" : ""}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">
                {formatCurrency(room.totalCost || room.totalBeforeVolume || 0)}
              </span>
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

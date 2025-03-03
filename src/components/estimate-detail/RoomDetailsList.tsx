
import { RoomDetail } from "@/types";
import { Button } from "@/components/ui/button";
import RoomDetailCard from "./RoomDetailCard";

interface RoomDetailsListProps {
  roomDetails: RoomDetail[];
  onViewDetailedSummary: () => void;
}

const RoomDetailsList = ({ roomDetails, onViewDetailedSummary }: RoomDetailsListProps) => {
  if (roomDetails.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Rooms ({roomDetails.length})</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onViewDetailedSummary}
        >
          View Detailed Summary
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {roomDetails.map((room) => (
          <RoomDetailCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
};

export default RoomDetailsList;

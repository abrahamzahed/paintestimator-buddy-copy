
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RoomDetails } from "@/types";

interface StepDiscountsProps {
  roomDetails: RoomDetails;
  updateRoomDetails: (key: keyof RoomDetails, value: string | number | boolean) => void;
}

const StepDiscounts = ({ roomDetails, updateRoomDetails }: StepDiscountsProps) => {
  return (
    <>
      <p className="text-muted-foreground">
        You may qualify for additional discounts.
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="isEmptyHouse" className="cursor-pointer">
            Empty house (-15%)
          </Label>
          <Switch 
            id="isEmptyHouse" 
            checked={roomDetails.isEmptyHouse}
            onCheckedChange={(checked) => updateRoomDetails("isEmptyHouse", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="needFloorCovering" className="cursor-pointer">
            Need floor covering? (-5% if no)
          </Label>
          <Switch 
            id="needFloorCovering" 
            checked={roomDetails.needFloorCovering}
            onCheckedChange={(checked) => updateRoomDetails("needFloorCovering", checked)}
          />
        </div>
      </div>
      
      <div className="p-4 bg-secondary rounded-lg mt-6">
        <h4 className="font-medium mb-2">Summary</h4>
        <ul className="space-y-1 text-sm">
          <li>Room: {roomDetails.roomType.charAt(0).toUpperCase() + roomDetails.roomType.slice(1)}</li>
          <li>Size: {roomDetails.roomSize.charAt(0).toUpperCase() + roomDetails.roomSize.slice(1)}</li>
          <li>
            Dimensions: {roomDetails.wallsCount} walls, {roomDetails.wallHeight}' × {roomDetails.wallWidth}'
          </li>
          <li>Condition: {roomDetails.condition.charAt(0).toUpperCase() + roomDetails.condition.slice(1)}</li>
          <li>Paint: {roomDetails.paintType.charAt(0).toUpperCase() + roomDetails.paintType.slice(1)}</li>
          {roomDetails.includeCeiling && <li>Including ceiling</li>}
          {roomDetails.includeBaseboards && <li>Including baseboards ({roomDetails.baseboardsMethod})</li>}
          {roomDetails.includeCrownMolding && <li>Including crown molding</li>}
          {roomDetails.hasHighCeiling && <li>Has high ceiling</li>}
          {roomDetails.includeCloset && <li>Including closet</li>}
          {roomDetails.doorsCount > 0 && <li>{roomDetails.doorsCount} doors</li>}
          {roomDetails.windowsCount > 0 && <li>{roomDetails.windowsCount} windows</li>}
          {roomDetails.isEmptyHouse && <li>Empty house discount</li>}
          {!roomDetails.needFloorCovering && <li>No floor covering needed</li>}
        </ul>
      </div>
    </>
  );
};

export default StepDiscounts;

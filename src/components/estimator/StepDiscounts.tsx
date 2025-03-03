
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RoomDetail } from "@/types";

interface StepDiscountsProps {
  roomDetail: RoomDetail;
  updateRoomDetail: (key: keyof RoomDetail, value: string | number | boolean) => void;
  globalSettings: {
    isEmptyHouse: boolean;
    needFloorCovering: boolean;
  };
  updateGlobalSettings: (key: string, value: boolean) => void;
}

const StepDiscounts = ({ 
  roomDetail, 
  updateRoomDetail,
  globalSettings,
  updateGlobalSettings
}: StepDiscountsProps) => {
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
            checked={globalSettings.isEmptyHouse}
            onCheckedChange={(checked) => updateGlobalSettings("isEmptyHouse", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="needFloorCovering" className="cursor-pointer">
            Need floor covering? (-5% if no)
          </Label>
          <Switch 
            id="needFloorCovering" 
            checked={globalSettings.needFloorCovering}
            onCheckedChange={(checked) => updateGlobalSettings("needFloorCovering", checked)}
          />
        </div>
      </div>
      
      <div className="p-4 bg-secondary rounded-lg mt-6">
        <h4 className="font-medium mb-2">Summary</h4>
        <ul className="space-y-1 text-sm">
          <li>Room: {roomDetail.roomType.charAt(0).toUpperCase() + roomDetail.roomType.slice(1)}</li>
          <li>Size: {roomDetail.roomSize.charAt(0).toUpperCase() + roomDetail.roomSize.slice(1)}</li>
          <li>
            Dimensions: {roomDetail.wallsCount} walls, {roomDetail.wallHeight}' × {roomDetail.wallWidth}'
          </li>
          <li>Condition: {roomDetail.condition.charAt(0).toUpperCase() + roomDetail.condition.slice(1)}</li>
          <li>Paint: {roomDetail.paintType.charAt(0).toUpperCase() + roomDetail.paintType.slice(1)}</li>
          {roomDetail.includeCeiling && <li>Including ceiling</li>}
          {roomDetail.includeBaseboards && <li>Including baseboards ({roomDetail.baseboardsMethod})</li>}
          {roomDetail.includeCrownMolding && <li>Including crown molding</li>}
          {roomDetail.hasHighCeiling && <li>Has high ceiling</li>}
          {roomDetail.includeCloset && <li>Including closet</li>}
          {roomDetail.doorsCount > 0 && <li>{roomDetail.doorsCount} doors</li>}
          {roomDetail.windowsCount > 0 && <li>{roomDetail.windowsCount} windows</li>}
          {globalSettings.isEmptyHouse && <li>Empty house discount</li>}
          {!globalSettings.needFloorCovering && <li>No floor covering needed</li>}
        </ul>
      </div>
    </>
  );
};

export default StepDiscounts;

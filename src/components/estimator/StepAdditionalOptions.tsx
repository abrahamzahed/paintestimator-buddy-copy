
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RoomDetail } from "@/types";

interface StepAdditionalOptionsProps {
  roomDetail: RoomDetail;
  updateRoomDetail: (key: keyof RoomDetail, value: string | number | boolean) => void;
}

const StepAdditionalOptions = ({ roomDetail, updateRoomDetail }: StepAdditionalOptionsProps) => {
  return (
    <>
      <p className="text-muted-foreground">
        Select any additional areas or services needed.
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="includeCeiling" className="cursor-pointer">
            Include ceiling (+40%)
          </Label>
          <Switch 
            id="includeCeiling" 
            checked={roomDetail.includeCeiling}
            onCheckedChange={(checked) => updateRoomDetail("includeCeiling", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="includeBaseboards" className="cursor-pointer">
            Include baseboards
          </Label>
          <Switch 
            id="includeBaseboards" 
            checked={roomDetail.includeBaseboards}
            onCheckedChange={(checked) => updateRoomDetail("includeBaseboards", checked)}
          />
        </div>
        
        {roomDetail.includeBaseboards && (
          <div className="ml-6 mt-2">
            <RadioGroup
              defaultValue={roomDetail.baseboardsMethod}
              onValueChange={(value: "brush" | "spray") => 
                updateRoomDetail("baseboardsMethod", value)
              }
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="brush" id="method-brush" />
                <Label htmlFor="method-brush" className="cursor-pointer">
                  Brushed (+25%)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="spray" id="method-spray" />
                <Label htmlFor="method-spray" className="cursor-pointer">
                  Sprayed (+50%)
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <Label htmlFor="includeCrownMolding" className="cursor-pointer">
            Include crown molding (+25%)
          </Label>
          <Switch 
            id="includeCrownMolding" 
            checked={roomDetail.includeCrownMolding}
            onCheckedChange={(checked) => updateRoomDetail("includeCrownMolding", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="hasHighCeiling" className="cursor-pointer">
            Has high ceiling (+$300-600)
          </Label>
          <Switch 
            id="hasHighCeiling" 
            checked={roomDetail.hasHighCeiling}
            onCheckedChange={(checked) => updateRoomDetail("hasHighCeiling", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="includeCloset" className="cursor-pointer">
            Include closet (+$60-300)
          </Label>
          <Switch 
            id="includeCloset" 
            checked={roomDetail.includeCloset}
            onCheckedChange={(checked) => updateRoomDetail("includeCloset", checked)}
          />
        </div>
        
        <div className="space-y-2 pt-2">
          <Label htmlFor="doorsCount">Number of doors to paint</Label>
          <Input
            id="doorsCount"
            type="number"
            value={roomDetail.doorsCount}
            onChange={(e) =>
              updateRoomDetail("doorsCount", parseInt(e.target.value) || 0)
            }
            min={0}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="windowsCount">Number of windows to paint</Label>
          <Input
            id="windowsCount"
            type="number"
            value={roomDetail.windowsCount}
            onChange={(e) =>
              updateRoomDetail("windowsCount", parseInt(e.target.value) || 0)
            }
            min={0}
          />
        </div>
      </div>
    </>
  );
};

export default StepAdditionalOptions;

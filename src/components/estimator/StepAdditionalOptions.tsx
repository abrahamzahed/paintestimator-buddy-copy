
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RoomDetails } from "@/types";

interface StepAdditionalOptionsProps {
  roomDetails: RoomDetails;
  updateRoomDetails: (key: keyof RoomDetails, value: string | number | boolean) => void;
}

const StepAdditionalOptions = ({ roomDetails, updateRoomDetails }: StepAdditionalOptionsProps) => {
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
            checked={roomDetails.includeCeiling}
            onCheckedChange={(checked) => updateRoomDetails("includeCeiling", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="includeBaseboards" className="cursor-pointer">
            Include baseboards
          </Label>
          <Switch 
            id="includeBaseboards" 
            checked={roomDetails.includeBaseboards}
            onCheckedChange={(checked) => updateRoomDetails("includeBaseboards", checked)}
          />
        </div>
        
        {roomDetails.includeBaseboards && (
          <div className="ml-6 mt-2">
            <RadioGroup
              defaultValue={roomDetails.baseboardsMethod}
              onValueChange={(value: "brush" | "spray") => 
                updateRoomDetails("baseboardsMethod", value)
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
            checked={roomDetails.includeCrownMolding}
            onCheckedChange={(checked) => updateRoomDetails("includeCrownMolding", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="hasHighCeiling" className="cursor-pointer">
            Has high ceiling (+$300-600)
          </Label>
          <Switch 
            id="hasHighCeiling" 
            checked={roomDetails.hasHighCeiling}
            onCheckedChange={(checked) => updateRoomDetails("hasHighCeiling", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="includeCloset" className="cursor-pointer">
            Include closet (+$60-300)
          </Label>
          <Switch 
            id="includeCloset" 
            checked={roomDetails.includeCloset}
            onCheckedChange={(checked) => updateRoomDetails("includeCloset", checked)}
          />
        </div>
        
        <div className="space-y-2 pt-2">
          <Label htmlFor="doorsCount">Number of doors to paint</Label>
          <Input
            id="doorsCount"
            type="number"
            value={roomDetails.doorsCount}
            onChange={(e) =>
              updateRoomDetails("doorsCount", parseInt(e.target.value) || 0)
            }
            min={0}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="windowsCount">Number of windows to paint</Label>
          <Input
            id="windowsCount"
            type="number"
            value={roomDetails.windowsCount}
            onChange={(e) =>
              updateRoomDetails("windowsCount", parseInt(e.target.value) || 0)
            }
            min={0}
          />
        </div>
      </div>
    </>
  );
};

export default StepAdditionalOptions;

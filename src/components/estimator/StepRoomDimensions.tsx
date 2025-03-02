
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoomDetails } from "@/types";

interface StepRoomDimensionsProps {
  roomDetails: RoomDetails;
  updateRoomDetails: (key: keyof RoomDetails, value: string | number | boolean) => void;
}

const StepRoomDimensions = ({ roomDetails, updateRoomDetails }: StepRoomDimensionsProps) => {
  return (
    <>
      <p className="text-muted-foreground">
        Enter the dimensions of the room for a more accurate estimate.
      </p>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="wallsCount">Number of walls to paint</Label>
          <Input
            id="wallsCount"
            type="number"
            value={roomDetails.wallsCount}
            onChange={(e) =>
              updateRoomDetails("wallsCount", parseInt(e.target.value) || 1)
            }
            min={1}
            max={20}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wallHeight">Average wall height (feet)</Label>
          <Input
            id="wallHeight"
            type="number"
            value={roomDetails.wallHeight}
            onChange={(e) =>
              updateRoomDetails("wallHeight", parseFloat(e.target.value) || 1)
            }
            min={1}
            step={0.1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wallWidth">Average wall width (feet)</Label>
          <Input
            id="wallWidth"
            type="number"
            value={roomDetails.wallWidth}
            onChange={(e) =>
              updateRoomDetails("wallWidth", parseFloat(e.target.value) || 1)
            }
            min={1}
            step={0.1}
          />
        </div>
      </div>
    </>
  );
};

export default StepRoomDimensions;

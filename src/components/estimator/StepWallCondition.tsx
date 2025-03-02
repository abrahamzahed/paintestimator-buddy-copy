
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { RoomDetails } from "@/types";

interface StepWallConditionProps {
  roomDetails: RoomDetails;
  updateRoomDetails: (key: keyof RoomDetails, value: string | number | boolean) => void;
}

const StepWallCondition = ({ roomDetails, updateRoomDetails }: StepWallConditionProps) => {
  return (
    <>
      <p className="text-muted-foreground">
        This helps us determine the preparation work needed.
      </p>
      <RadioGroup
        defaultValue={roomDetails.condition}
        onValueChange={(value: "good" | "average" | "poor") =>
          updateRoomDetails("condition", value)
        }
        className="space-y-4"
      >
        <div className="flex items-start space-x-3 p-3 rounded-lg border">
          <RadioGroupItem value="good" id="good" className="mt-1" />
          <div>
            <Label htmlFor="good" className="text-base font-medium cursor-pointer">
              Good Condition
            </Label>
            <p className="text-sm text-muted-foreground">
              Walls are clean, smooth, and only need minimal preparation
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 rounded-lg border">
          <RadioGroupItem value="average" id="average" className="mt-1" />
          <div>
            <Label htmlFor="average" className="text-base font-medium cursor-pointer">
              Average Condition
            </Label>
            <p className="text-sm text-muted-foreground">
              Some cracks, nail holes, or minor repairs needed
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 rounded-lg border">
          <RadioGroupItem value="poor" id="poor" className="mt-1" />
          <div>
            <Label htmlFor="poor" className="text-base font-medium cursor-pointer">
              Poor Condition
            </Label>
            <p className="text-sm text-muted-foreground">
              Major repairs, patching or drywall work needed
            </p>
          </div>
        </div>
      </RadioGroup>
    </>
  );
};

export default StepWallCondition;

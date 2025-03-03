
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { RoomDetail } from "@/types";

interface StepPaintQualityProps {
  roomDetail: RoomDetail;
  updateRoomDetail: (key: keyof RoomDetail, value: string | number | boolean) => void;
}

const StepPaintQuality = ({ roomDetail, updateRoomDetail }: StepPaintQualityProps) => {
  return (
    <>
      <p className="text-muted-foreground">
        Higher quality paint lasts longer and provides better coverage.
      </p>
      <RadioGroup
        defaultValue={roomDetail.paintType}
        onValueChange={(value: "standard" | "premium" | "luxury") =>
          updateRoomDetail("paintType", value)
        }
        className="space-y-4"
      >
        <div className="flex items-start space-x-3 p-3 rounded-lg border">
          <RadioGroupItem value="standard" id="standard" className="mt-1" />
          <div>
            <Label
              htmlFor="standard"
              className="text-base font-medium cursor-pointer"
            >
              Standard ($25/gallon)
            </Label>
            <p className="text-sm text-muted-foreground">
              Good quality, basic paint suitable for most rooms
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 rounded-lg border">
          <RadioGroupItem value="premium" id="premium" className="mt-1" />
          <div>
            <Label
              htmlFor="premium"
              className="text-base font-medium cursor-pointer"
            >
              Premium ($45/gallon)
            </Label>
            <p className="text-sm text-muted-foreground">
              Superior coverage, more durable and washable
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 rounded-lg border">
          <RadioGroupItem value="luxury" id="luxury" className="mt-1" />
          <div>
            <Label
              htmlFor="luxury"
              className="text-base font-medium cursor-pointer"
            >
              Luxury ($75/gallon)
            </Label>
            <p className="text-sm text-muted-foreground">
              Top-tier, eco-friendly, lifetime warranty paint
            </p>
          </div>
        </div>
      </RadioGroup>
    </>
  );
};

export default StepPaintQuality;


import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { RoomDetails } from "@/types";

interface StepRoomTypeProps {
  roomDetails: RoomDetails;
  updateRoomDetails: (key: keyof RoomDetails, value: string | number | boolean) => void;
}

const StepRoomType = ({ roomDetails, updateRoomDetails }: StepRoomTypeProps) => {
  const roomTypeOptions = [
    "Bedroom", 
    "Master Bedroom", 
    "Living Room", 
    "Dining Room", 
    "Kitchen", 
    "Bathroom", 
    "Entryway", 
    "Hallway"
  ];

  return (
    <>
      <p className="text-muted-foreground">
        Select the type of room you want to paint.
      </p>
      <RadioGroup
        defaultValue={roomDetails.roomType}
        onValueChange={(value) => updateRoomDetails("roomType", value)}
        className="grid grid-cols-2 gap-4"
      >
        {roomTypeOptions.map((room) => (
          <div key={room} className="flex items-center space-x-2">
            <RadioGroupItem value={room.toLowerCase()} id={room.toLowerCase()} />
            <Label htmlFor={room.toLowerCase()} className="cursor-pointer">
              {room}
            </Label>
          </div>
        ))}
      </RadioGroup>
      
      <div className="space-y-2 mt-4">
        <Label>Room Size</Label>
        <RadioGroup
          defaultValue={roomDetails.roomSize}
          onValueChange={(value: "small" | "average" | "large") => 
            updateRoomDetails("roomSize", value)
          }
          className="grid grid-cols-3 gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="small" id="size-small" />
            <Label htmlFor="size-small" className="cursor-pointer">
              Small
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="average" id="size-average" />
            <Label htmlFor="size-average" className="cursor-pointer">
              Average
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="large" id="size-large" />
            <Label htmlFor="size-large" className="cursor-pointer">
              Large
            </Label>
          </div>
        </RadioGroup>
      </div>
    </>
  );
};

export default StepRoomType;

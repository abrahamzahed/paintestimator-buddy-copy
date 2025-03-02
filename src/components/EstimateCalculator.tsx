
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { RoomDetails, EstimateResult } from "../types";
import { calculateEstimate, formatCurrency } from "../utils/estimateUtils";

interface EstimateCalculatorProps {
  onEstimateComplete: (estimate: EstimateResult) => void;
}

const EstimateCalculator = ({ onEstimateComplete }: EstimateCalculatorProps) => {
  const [step, setStep] = useState(1);
  const [roomDetails, setRoomDetails] = useState<RoomDetails>({
    roomType: "bedroom",
    wallsCount: 4,
    wallHeight: 8,
    wallWidth: 10,
    condition: "good",
    paintType: "standard",
  });

  const handleNextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      const estimate = calculateEstimate(roomDetails);
      onEstimateComplete(estimate);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateRoomDetails = (
    key: keyof RoomDetails,
    value: string | number
  ) => {
    setRoomDetails({
      ...roomDetails,
      [key]: value,
    });
  };

  return (
    <div className="glass rounded-xl p-6 shadow-lg animate-scale-in">
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                step >= i
                  ? "bg-paint text-white"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {i}
            </div>
          ))}
        </div>
        <div className="relative h-2 bg-secondary rounded-full mb-8">
          <div
            className="absolute top-0 left-0 h-full bg-paint rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-fade-up">
          <h3 className="text-xl font-semibold">What room are you painting?</h3>
          <RadioGroup
            defaultValue={roomDetails.roomType}
            onValueChange={(value) => updateRoomDetails("roomType", value)}
            className="grid grid-cols-2 gap-4"
          >
            {["Bedroom", "Living Room", "Kitchen", "Bathroom", "Office", "Other"].map(
              (room) => (
                <div key={room} className="flex items-center space-x-2">
                  <RadioGroupItem value={room.toLowerCase()} id={room.toLowerCase()} />
                  <Label htmlFor={room.toLowerCase()} className="cursor-pointer">
                    {room}
                  </Label>
                </div>
              )
            )}
          </RadioGroup>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-fade-up">
          <h3 className="text-xl font-semibold">Room dimensions</h3>
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
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-fade-up">
          <h3 className="text-xl font-semibold">Wall condition</h3>
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
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 animate-fade-up">
          <h3 className="text-xl font-semibold">Paint quality</h3>
          <p className="text-muted-foreground">
            Higher quality paint lasts longer and provides better coverage.
          </p>
          <RadioGroup
            defaultValue={roomDetails.paintType}
            onValueChange={(value: "standard" | "premium" | "luxury") =>
              updateRoomDetails("paintType", value)
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
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6 animate-fade-up">
          <h3 className="text-xl font-semibold">Almost there!</h3>
          <p className="text-muted-foreground">
            We've collected all the information we need. Press "Calculate" to see your
            estimate.
          </p>
          <div className="p-4 bg-secondary rounded-lg">
            <h4 className="font-medium mb-2">Summary</h4>
            <ul className="space-y-1 text-sm">
              <li>Room: {roomDetails.roomType.charAt(0).toUpperCase() + roomDetails.roomType.slice(1)}</li>
              <li>Walls: {roomDetails.wallsCount}</li>
              <li>
                Dimensions: {roomDetails.wallHeight}' × {roomDetails.wallWidth}'
              </li>
              <li>Condition: {roomDetails.condition.charAt(0).toUpperCase() + roomDetails.condition.slice(1)}</li>
              <li>Paint: {roomDetails.paintType.charAt(0).toUpperCase() + roomDetails.paintType.slice(1)}</li>
            </ul>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={step === 1}
          className="border-foreground/20 hover:bg-foreground/5"
        >
          Back
        </Button>
        <Button
          onClick={handleNextStep}
          className="bg-paint hover:bg-paint-dark"
        >
          {step === 5 ? "Calculate Estimate" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default EstimateCalculator;


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RoomDetails, EstimateResult } from "../types";
import { calculateEstimate, formatCurrency } from "../utils/estimateUtils";

interface EstimateCalculatorProps {
  onEstimateComplete: (estimate: EstimateResult) => void;
}

const EstimateCalculator = ({ onEstimateComplete }: EstimateCalculatorProps) => {
  const [step, setStep] = useState(1);
  const [roomDetails, setRoomDetails] = useState<RoomDetails>({
    roomType: "bedroom",
    roomSize: "average",
    wallsCount: 4,
    wallHeight: 8,
    wallWidth: 10,
    condition: "good",
    paintType: "standard",
    includeCeiling: false,
    includeBaseboards: false,
    baseboardsMethod: "brush",
    includeCrownMolding: false,
    hasHighCeiling: false,
    includeCloset: false,
    isEmptyHouse: false,
    needFloorCovering: true,
    doorsCount: 0,
    windowsCount: 0
  });

  const handleNextStep = () => {
    if (step < 6) {
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
    value: string | number | boolean
  ) => {
    setRoomDetails({
      ...roomDetails,
      [key]: value,
    });
  };

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
    <div className="glass rounded-xl p-6 shadow-lg animate-scale-in">
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
            style={{ width: `${(step / 6) * 100}%` }}
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
          <h3 className="text-xl font-semibold">Additional Options</h3>
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
        </div>
      )}

      {step === 6 && (
        <div className="space-y-6 animate-fade-up">
          <h3 className="text-xl font-semibold">Discounts</h3>
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
          {step === 6 ? "Calculate Estimate" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default EstimateCalculator;

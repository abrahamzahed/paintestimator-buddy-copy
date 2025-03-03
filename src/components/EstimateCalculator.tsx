
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RoomDetails, RoomDetail, EstimateResult } from "../types";
import { calculateMultiRoomEstimate, formatCurrency } from "../utils/estimateUtils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ProgressIndicator from "./estimator/ProgressIndicator";
import FormStep from "./estimator/FormStep";
import MultiRoomSelector from "./estimator/MultiRoomSelector";
import { v4 as uuidv4 } from "uuid";

interface EstimateCalculatorProps {
  onEstimateComplete: (estimate: EstimateResult) => void;
}

const EstimateCalculator = ({ onEstimateComplete }: EstimateCalculatorProps) => {
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;
  const [currentEstimate, setCurrentEstimate] = useState<EstimateResult | null>(null);
  
  const [roomDetails, setRoomDetails] = useState<RoomDetails>({
    rooms: [
      {
        id: uuidv4(),
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
      }
    ],
    isEmptyHouse: false,
    needFloorCovering: true
  });

  // Update the estimate whenever room details change
  useEffect(() => {
    try {
      if (roomDetails.rooms.length > 0) {
        const estimate = calculateMultiRoomEstimate(roomDetails);
        setCurrentEstimate(estimate);
      }
    } catch (error) {
      console.error("Error calculating estimate:", error);
    }
  }, [roomDetails]);

  const handleNextStep = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      if (currentEstimate) {
        onEstimateComplete(currentEstimate);
      }
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateRooms = (rooms: RoomDetail[]) => {
    setRoomDetails({
      ...roomDetails,
      rooms
    });
  };

  const updateGlobalOptions = (key: keyof RoomDetails, value: boolean) => {
    setRoomDetails({
      ...roomDetails,
      [key]: value
    });
  };

  return (
    <div className="glass rounded-xl p-6 shadow-lg animate-scale-in relative">
      <ProgressIndicator totalSteps={TOTAL_STEPS} currentStep={step} />

      <div className="min-h-[300px] relative">
        <FormStep title="What rooms are you painting?" isActive={step === 1}>
          <p className="text-muted-foreground mb-4">
            Add all rooms you want to paint and their details. You can add multiple rooms.
          </p>
          <MultiRoomSelector 
            rooms={roomDetails.rooms} 
            updateRooms={updateRooms} 
          />
        </FormStep>

        <FormStep title="House Conditions & Discounts" isActive={step === 2}>
          <p className="text-muted-foreground mb-4">
            These options affect your overall estimate.
          </p>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="isEmptyHouse" className="cursor-pointer">
                Is the house empty? (15% discount)
              </Label>
              <Switch 
                id="isEmptyHouse" 
                checked={roomDetails.isEmptyHouse}
                onCheckedChange={(checked) => updateGlobalOptions("isEmptyHouse", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="needFloorCovering" className="cursor-pointer">
                Do you need floor covering? (5% discount if no)
              </Label>
              <Switch 
                id="needFloorCovering" 
                checked={roomDetails.needFloorCovering}
                onCheckedChange={(checked) => updateGlobalOptions("needFloorCovering", checked)}
              />
            </div>
          </div>
        </FormStep>

        <FormStep title="Estimate Summary" isActive={step === 3}>
          <p className="text-muted-foreground mb-4">
            Review your estimate details before submitting.
          </p>
          {currentEstimate && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">Rooms Included ({roomDetails.rooms.length})</h4>
                <ul className="divide-y">
                  {roomDetails.rooms.map((room, index) => (
                    <li key={room.id} className="py-2">
                      <div className="flex justify-between">
                        <span>{room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)} ({room.roomSize})</span>
                        <span className="font-medium">${(currentEstimate.totalCost / roomDetails.rooms.length).toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {room.wallsCount} walls, {room.wallHeight}ft height, {room.paintType} paint
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Labor Cost:</span>
                  <span>{formatCurrency(currentEstimate.laborCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Material Cost:</span>
                  <span>{formatCurrency(currentEstimate.materialCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paint Required:</span>
                  <span>{currentEstimate.paintCans} gallons</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Time:</span>
                  <span>{currentEstimate.timeEstimate.toFixed(1)} hours</span>
                </div>

                {Object.entries(currentEstimate.discounts).length > 0 && (
                  <>
                    <div className="border-t my-2"></div>
                    <h5 className="font-medium">Applied Discounts</h5>
                    {currentEstimate.discounts.emptyHouse && (
                      <div className="flex justify-between text-green-600">
                        <span>Empty House:</span>
                        <span>-{formatCurrency(currentEstimate.discounts.emptyHouse)}</span>
                      </div>
                    )}
                    {currentEstimate.discounts.noFloorCovering && (
                      <div className="flex justify-between text-green-600">
                        <span>No Floor Covering:</span>
                        <span>-{formatCurrency(currentEstimate.discounts.noFloorCovering)}</span>
                      </div>
                    )}
                    {currentEstimate.discounts.volumeDiscount && (
                      <div className="flex justify-between text-green-600">
                        <span>Volume Discount:</span>
                        <span>-{formatCurrency(currentEstimate.discounts.volumeDiscount)}</span>
                      </div>
                    )}
                  </>
                )}

                <div className="border-t my-2"></div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Cost:</span>
                  <span className="text-paint">{formatCurrency(currentEstimate.totalCost)}</span>
                </div>
              </div>
            </div>
          )}
        </FormStep>
      </div>

      {/* Running Total Display */}
      <div className="mt-4 p-3 bg-foreground/5 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Current Estimate:</span>
          <span className="text-xl font-bold text-paint">
            {currentEstimate ? formatCurrency(currentEstimate.totalCost) : '$0.00'}
          </span>
        </div>
        {currentEstimate && (
          <div className="mt-2 text-sm text-muted-foreground grid grid-cols-2 gap-2">
            <div>Labor: {formatCurrency(currentEstimate.laborCost)}</div>
            <div>Materials: {formatCurrency(currentEstimate.materialCost)}</div>
          </div>
        )}
      </div>

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
          {step === TOTAL_STEPS ? "Calculate Estimate" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default EstimateCalculator;

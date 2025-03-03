
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RoomDetails, RoomDetail, EstimateResult } from "../types";
import { calculateMultiRoomEstimate, formatCurrency, calculateSingleRoomEstimate } from "../utils/estimateUtils";
import ProgressIndicator from "./estimator/ProgressIndicator";
import FormStep from "./estimator/FormStep";
import MultiRoomSelector from "./estimator/MultiRoomSelector";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

interface EstimateCalculatorProps {
  onEstimateComplete: (estimate: EstimateResult) => void;
  initialUserData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  submitButtonText?: string;
}

const EstimateCalculator = ({ 
  onEstimateComplete, 
  initialUserData,
  submitButtonText = "Submit Request" 
}: EstimateCalculatorProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 2;
  const [currentEstimate, setCurrentEstimate] = useState<EstimateResult | null>(null);
  const [roomEstimates, setRoomEstimates] = useState<Record<string, ReturnType<typeof calculateSingleRoomEstimate>>>({});
  
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

  useEffect(() => {
    try {
      if (roomDetails.rooms.length > 0) {
        const estimates: Record<string, ReturnType<typeof calculateSingleRoomEstimate>> = {};
        
        for (const room of roomDetails.rooms) {
          estimates[room.id] = calculateSingleRoomEstimate(room);
        }
        
        setRoomEstimates(estimates);
        
        const estimate = calculateMultiRoomEstimate(roomDetails);
        setCurrentEstimate(estimate);
      }
    } catch (error) {
      console.error("Error calculating estimate:", error);
      toast({
        title: "Error calculating estimate",
        description: "Please check your inputs and try again",
        variant: "destructive"
      });
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

        <FormStep title="Estimate Summary" isActive={step === 2}>
          <p className="text-muted-foreground mb-4">
            Review your estimate details before submitting.
          </p>
          {currentEstimate && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">Rooms Included ({roomDetails.rooms.length})</h4>
                <ul className="divide-y">
                  {roomDetails.rooms.map((room) => {
                    const roomEstimate = roomEstimates[room.id];
                    return (
                      <li key={room.id} className="py-2">
                        <div className="flex justify-between">
                          <span>{room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)} ({room.roomSize})</span>
                          <span className="font-medium">{roomEstimate ? formatCurrency(roomEstimate.totalCost) : '$0.00'}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {room.wallsCount} walls, {room.wallHeight}ft height, {room.paintType} paint
                          {room.condition !== 'good' && `, ${room.condition} condition`}
                          {room.includeCeiling && ', ceiling'}
                          {room.includeBaseboards && ', baseboards'}
                          {room.includeCrownMolding && ', crown molding'}
                        </div>
                        {roomEstimate && (
                          <div className="mt-2 grid grid-cols-2 text-sm">
                            <div>Labor: {formatCurrency(roomEstimate.laborCost)}</div>
                            <div>Materials: {formatCurrency(roomEstimate.materialCost)}</div>
                            {Object.entries(roomEstimate.additionalCosts).length > 0 && (
                              <div className="col-span-2 mt-1">
                                <details className="text-xs">
                                  <summary className="cursor-pointer text-paint hover:underline">Additional costs</summary>
                                  <div className="pl-3 pt-1 space-y-1">
                                    {Object.entries(roomEstimate.additionalCosts).map(([key, value]) => (
                                      <div key={key} className="flex justify-between">
                                        <span>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                                        <span>{formatCurrency(value)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              </div>
                            )}
                            
                            {room.isEmptyHouse && (
                              <div className="col-span-2 text-green-600">
                                Empty room discount: -15%
                              </div>
                            )}
                            
                            {!room.needFloorCovering && (
                              <div className="col-span-2 text-green-600">
                                No floor covering: -5%
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Total Labor Cost:</span>
                  <span>{formatCurrency(currentEstimate.laborCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Material Cost:</span>
                  <span>{formatCurrency(currentEstimate.materialCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Paint Required:</span>
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
          {step === TOTAL_STEPS && (
            <div className="absolute bottom-0 right-0">
              <Button
                onClick={() => onEstimateComplete(currentEstimate)}
                className="bg-paint hover:bg-paint-dark px-6"
              >
                <Send className="mr-2 h-4 w-4" />
                {submitButtonText}
              </Button>
            </div>
          )}
        </FormStep>
      </div>

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
        {step < TOTAL_STEPS && (
          <Button
            onClick={handleNextStep}
            className="bg-paint hover:bg-paint-dark"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default EstimateCalculator;

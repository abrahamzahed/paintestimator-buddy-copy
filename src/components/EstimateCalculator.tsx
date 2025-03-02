
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RoomDetails, EstimateResult } from "../types";
import { calculateEstimate, formatCurrency } from "../utils/estimateUtils";
import ProgressIndicator from "./estimator/ProgressIndicator";
import FormStep from "./estimator/FormStep";
import StepRoomType from "./estimator/StepRoomType";
import StepRoomDimensions from "./estimator/StepRoomDimensions";
import StepWallCondition from "./estimator/StepWallCondition";
import StepPaintQuality from "./estimator/StepPaintQuality";
import StepAdditionalOptions from "./estimator/StepAdditionalOptions";
import StepDiscounts from "./estimator/StepDiscounts";

interface EstimateCalculatorProps {
  onEstimateComplete: (estimate: EstimateResult) => void;
}

const EstimateCalculator = ({ onEstimateComplete }: EstimateCalculatorProps) => {
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 6;
  const [currentEstimate, setCurrentEstimate] = useState<EstimateResult | null>(null);
  
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

  // Update the estimate whenever room details change
  useEffect(() => {
    try {
      const estimate = calculateEstimate(roomDetails);
      setCurrentEstimate(estimate);
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

  const updateRoomDetails = (
    key: keyof RoomDetails,
    value: string | number | boolean
  ) => {
    setRoomDetails({
      ...roomDetails,
      [key]: value,
    });
  };

  return (
    <div className="glass rounded-xl p-6 shadow-lg animate-scale-in relative">
      <ProgressIndicator totalSteps={TOTAL_STEPS} currentStep={step} />

      <div className="min-h-[300px] relative">
        <FormStep title="What room are you painting?" isActive={step === 1}>
          <StepRoomType roomDetails={roomDetails} updateRoomDetails={updateRoomDetails} />
        </FormStep>

        <FormStep title="Room dimensions" isActive={step === 2}>
          <StepRoomDimensions roomDetails={roomDetails} updateRoomDetails={updateRoomDetails} />
        </FormStep>

        <FormStep title="Wall condition" isActive={step === 3}>
          <StepWallCondition roomDetails={roomDetails} updateRoomDetails={updateRoomDetails} />
        </FormStep>

        <FormStep title="Paint quality" isActive={step === 4}>
          <StepPaintQuality roomDetails={roomDetails} updateRoomDetails={updateRoomDetails} />
        </FormStep>

        <FormStep title="Additional Options" isActive={step === 5}>
          <StepAdditionalOptions roomDetails={roomDetails} updateRoomDetails={updateRoomDetails} />
        </FormStep>

        <FormStep title="Discounts" isActive={step === 6}>
          <StepDiscounts roomDetails={roomDetails} updateRoomDetails={updateRoomDetails} />
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

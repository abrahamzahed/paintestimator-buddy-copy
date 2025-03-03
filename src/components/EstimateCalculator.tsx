
import { useState, useEffect } from "react";
import { RoomDetails, RoomDetail, EstimateResult } from "../types";
import { calculateMultiRoomEstimate, calculateSingleRoomEstimate } from "../utils/estimateUtils";
import ProgressIndicator from "./estimator/ProgressIndicator";
import FormStep from "./estimator/FormStep";
import MultiRoomSelector from "./estimator/MultiRoomSelector";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import EstimateSummary from "./estimator/EstimateSummary";
import CurrentEstimatePanel from "./estimator/CurrentEstimatePanel";
import EstimatorNavigation from "./estimator/EstimatorNavigation";

interface EstimateCalculatorProps {
  onEstimateComplete: (estimate: EstimateResult, rooms: RoomDetail[], roomEstimates: Record<string, any>) => void;
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
  const TOTAL_STEPS = 1; // Only one step within calculator - rooms configuration
  const [currentEstimate, setCurrentEstimate] = useState<EstimateResult | null>(null);
  const [roomEstimates, setRoomEstimates] = useState<Record<string, ReturnType<typeof calculateSingleRoomEstimate>>>({});
  
  const [roomDetails, setRoomDetails] = useState<RoomDetails>({
    rooms: [
      {
        id: uuidv4(),
        roomType: "bedroom",
        roomSize: "average", // Default, but will be removed from UI
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
  }, [roomDetails, toast]);

  const handleNextStep = () => {
    if (currentEstimate) {
      onEstimateComplete(currentEstimate, roomDetails.rooms, roomEstimates);
    }
  };

  const updateRooms = (rooms: RoomDetail[]) => {
    setRoomDetails({
      ...roomDetails,
      rooms
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (currentEstimate) {
      onEstimateComplete(currentEstimate, roomDetails.rooms, roomEstimates);
    }
  };

  return (
    <div className="glass rounded-xl p-6 shadow-lg animate-scale-in relative">
      <ProgressIndicator totalSteps={TOTAL_STEPS} currentStep={step} />

      <div className="min-h-[300px] relative">
        <FormStep title="What rooms are you painting?" isActive={true}>
          <p className="text-muted-foreground mb-4">
            Add all rooms you want to paint and their details. You can add multiple rooms.
          </p>
          <MultiRoomSelector 
            rooms={roomDetails.rooms} 
            updateRooms={updateRooms} 
          />
        </FormStep>
      </div>

      <CurrentEstimatePanel currentEstimate={currentEstimate} />

      <div className="mt-6 flex justify-end">
        <button
          className="bg-paint hover:bg-paint-dark text-white font-medium py-2 px-6 rounded-md"
          onClick={handleNextStep}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default EstimateCalculator;

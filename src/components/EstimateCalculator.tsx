
import { useState, useEffect } from "react";
import { RoomDetails as OldRoomDetail, RoomDetail, EstimateResult } from "../types";
import { calculateMultiRoomEstimate, calculateSingleRoomEstimate } from "../utils/estimateUtils";
import ProgressIndicator from "./estimator/ProgressIndicator";
import FormStep from "./estimator/FormStep";
import MultiRoomSelector from "./estimator/MultiRoomSelector";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import CurrentEstimatePanel from "./estimator/CurrentEstimatePanel";
import EstimatorNavigation from "./estimator/EstimatorNavigation";
import { useLocation } from "react-router-dom";
import { saveTemporaryEstimate, getTemporaryEstimate, getTemporaryProjectName } from "@/utils/estimateStorage";
import { useSession } from "@/context/SessionContext";
import DynamicEstimatorForm from "./DynamicEstimatorForm";
import { RoomDetails, EstimatorSummary } from "@/types/estimator";

interface EstimateCalculatorProps {
  onEstimateComplete: (
    estimate: EstimateResult, 
    rooms: RoomDetail[], 
    roomEstimates: Record<string, any>
  ) => void;
  initialUserData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  initialRoomDetails?: RoomDetail[];
  submitButtonText?: string;
  useDynamicEstimator?: boolean;
}

const EstimateCalculator = ({ 
  onEstimateComplete, 
  initialUserData,
  initialRoomDetails,
  submitButtonText = "Submit Request",
  useDynamicEstimator = false
}: EstimateCalculatorProps) => {
  const { toast } = useToast();
  const location = useLocation();
  const { user } = useSession();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 1; // Only one step within calculator - rooms configuration
  const [currentEstimate, setCurrentEstimate] = useState<EstimateResult | null>(null);
  const [roomEstimates, setRoomEstimates] = useState<Record<string, ReturnType<typeof calculateSingleRoomEstimate>>>({});
  
  const searchParams = new URLSearchParams(location.search);
  const saveEstimate = searchParams.get("saveEstimate") === "true";
  
  // Try to load previously saved estimate if coming from auth page
  useEffect(() => {
    if (user && saveEstimate) {
      const savedEstimate = getTemporaryEstimate();
      if (savedEstimate) {
        // Use the saved estimate data
        setRoomDetails({
          ...roomDetails,
          rooms: savedEstimate.roomDetails
        });
        setRoomEstimates(savedEstimate.roomEstimates);
        setCurrentEstimate(savedEstimate.estimateResult);
        
        toast({
          title: "Estimate restored",
          description: "Your previous estimate has been loaded"
        });
      }
    }
  }, [user, saveEstimate]);
  
  const [roomDetails, setRoomDetails] = useState<{ 
    rooms: RoomDetail[];
    isEmptyHouse: boolean;
    needFloorCovering: boolean;
  }>({
    rooms: initialRoomDetails || [
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
    if (!useDynamicEstimator) {
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
    }
  }, [roomDetails, toast, useDynamicEstimator]);

  const handleNextStep = () => {
    if (currentEstimate) {
      if (!user) {
        // For non-logged in users, save the estimate to localStorage
        saveTemporaryEstimate(currentEstimate, roomDetails.rooms, roomEstimates);
      }
      
      onEstimateComplete(currentEstimate, roomDetails.rooms, roomEstimates);
    }
  };

  const handleReset = () => {
    setStep(1);
    // Reset to default room
    setRoomDetails({
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
    
    toast({
      title: "Estimator reset",
      description: "All rooms have been reset to default"
    });
  };

  const updateRooms = (rooms: RoomDetail[]) => {
    setRoomDetails({
      ...roomDetails,
      rooms
    });
  };

  const handleDynamicEstimateComplete = (estimate: EstimatorSummary, rooms: RoomDetails[]) => {
    // Convert from the dynamic estimator format to our standard format
    const convertedEstimate: EstimateResult = {
      roomPrice: estimate.subtotal, 
      laborCost: estimate.finalTotal * 0.7, // Approximation: 70% labor
      materialCost: estimate.finalTotal * 0.3, // Approximation: 30% materials
      totalCost: estimate.finalTotal,
      timeEstimate: estimate.finalTotal / 75, // Rough approximation
      paintCans: Math.ceil(estimate.finalTotal / 250), // Rough approximation
      additionalCosts: {},
      discounts: { volumeDiscount: estimate.volumeDiscount }
    };
    
    // We don't have individual room estimates in the same format, so we'll pass an empty object
    onEstimateComplete(convertedEstimate, [], {});
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (currentEstimate) {
      if (!user) {
        // For non-logged in users, save the estimate to localStorage
        saveTemporaryEstimate(currentEstimate, roomDetails.rooms, roomEstimates);
      }
      
      onEstimateComplete(currentEstimate, roomDetails.rooms, roomEstimates);
    }
  };

  if (useDynamicEstimator) {
    return (
      <div className="glass rounded-xl p-6 shadow-lg animate-scale-in relative">
        <DynamicEstimatorForm onEstimateComplete={handleDynamicEstimateComplete} />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 shadow-lg animate-scale-in relative">
      <ProgressIndicator totalSteps={TOTAL_STEPS} currentStep={step} hideDisplay={true} />

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

      <EstimatorNavigation
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        onNext={handleNextStep}
        onPrev={() => {}}
        onReset={handleReset}
      />
    </div>
  );
};

export default EstimateCalculator;

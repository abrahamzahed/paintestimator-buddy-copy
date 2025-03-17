
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
import EstimateSummary from "./estimator/EstimateSummary";
import { useLocation } from "react-router-dom";
import { saveTemporaryEstimate, getTemporaryEstimate, getTemporaryProjectName } from "@/utils/estimateStorage";
import { useSession } from "@/context/SessionContext";
import DynamicEstimatorForm from "./DynamicEstimatorForm";
import { RoomDetails, EstimatorSummary } from "@/types/estimator";
import AddressAutocomplete from "./AddressAutocomplete";

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
    address?: string;
  };
  initialRoomDetails?: RoomDetail[];
  submitButtonText?: string;
  useDynamicEstimator?: boolean;
  isEditMode?: boolean;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

const EstimateCalculator = ({ 
  onEstimateComplete, 
  initialUserData,
  initialRoomDetails,
  submitButtonText = "Submit Request",
  useDynamicEstimator = false,
  isEditMode = false,
  currentStep: externalStep,
  onStepChange
}: EstimateCalculatorProps) => {
  const { toast } = useToast();
  const location = useLocation();
  const { user } = useSession();
  const [internalStep, setInternalStep] = useState(1);
  const step = externalStep !== undefined ? externalStep : internalStep;
  
  const TOTAL_STEPS = 3; // For editing, we show all steps: 1. Info, 2. Rooms, 3. Summary
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
    if (externalStep !== undefined && onStepChange) {
      // If we're using external step control
      if (step < TOTAL_STEPS) {
        onStepChange(step + 1);
      }
    } else {
      // Using internal step control
      if (internalStep < TOTAL_STEPS) {
        setInternalStep(internalStep + 1);
      } else if (currentEstimate) {
        handleSubmit();
      }
    }
  };

  const handlePrevStep = () => {
    if (externalStep !== undefined && onStepChange) {
      // If we're using external step control
      if (step > 1) {
        onStepChange(step - 1);
      }
    } else {
      // Using internal step control
      if (internalStep > 1) {
        setInternalStep(internalStep - 1);
      }
    }
  };

  const handleEditStep = (newStep: number) => {
    if (externalStep !== undefined && onStepChange) {
      onStepChange(newStep);
    } else {
      setInternalStep(newStep);
    }
  };

  const handleReset = () => {
    if (externalStep !== undefined && onStepChange) {
      onStepChange(1);
    } else {
      setInternalStep(1);
    }
    
    // Reset to default room if not in edit mode
    if (!isEditMode) {
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
    }
    
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
      {!isEditMode && (
        <ProgressIndicator totalSteps={TOTAL_STEPS} currentStep={step} hideDisplay={false} />
      )}

      <div className="min-h-[300px] relative">
        {/* Step 1: Show room selection */}
        <FormStep title="Configure Your Rooms" isActive={step === 2}>
          <p className="text-muted-foreground mb-4">
            Add all rooms you want to paint and their details. You can add multiple rooms.
          </p>
          <MultiRoomSelector 
            rooms={roomDetails.rooms} 
            updateRooms={updateRooms} 
          />
        </FormStep>

        {/* Step 3: Show summary */}
        <FormStep title="Estimate Summary" isActive={step === 3}>
          <EstimateSummary 
            currentEstimate={currentEstimate}
            rooms={roomDetails.rooms}
            roomEstimates={roomEstimates}
            onSubmit={handleSubmit}
            submitButtonText={submitButtonText}
            isLastStep={true}
            onEdit={isEditMode ? handleEditStep : undefined}
            isEditMode={isEditMode}
          />
        </FormStep>
        
        {/* Show current estimate always in step 2 */}
        {step === 2 && (
          <CurrentEstimatePanel currentEstimate={currentEstimate} />
        )}
      </div>

      <EstimatorNavigation
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        onNext={handleNextStep}
        onPrev={handlePrevStep}
        onReset={handleReset}
        isLastStep={step === TOTAL_STEPS}
        showSubmit={step === TOTAL_STEPS && isEditMode}
        onSubmit={handleSubmit}
        submitButtonText={submitButtonText}
      />
    </div>
  );
};

export default EstimateCalculator;

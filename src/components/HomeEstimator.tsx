import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RoomDetail, EstimateResult } from "@/types";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { saveTemporaryEstimate, saveTemporaryProjectName } from "@/utils/estimateStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import ProgressIndicator from "./estimator/ProgressIndicator";
import EstimateSummary from "./estimator/EstimateSummary";
import MultiRoomSelector from "./estimator/MultiRoomSelector";
import FormStep from "./estimator/FormStep";
import { v4 as uuidv4 } from "uuid";
import { calculateMultiRoomEstimate } from "@/utils/estimateUtils";
import EstimatorNavigation from "./estimator/EstimatorNavigation";

const HomeEstimator = () => {
  const navigate = useNavigate();
  const { user } = useSession();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectNameError, setProjectNameError] = useState<string | null>(null);

  // Estimator state
  const [currentEstimate, setCurrentEstimate] = useState<EstimateResult | null>(null);
  const [roomEstimates, setRoomEstimates] = useState<Record<string, any>>({});
  const [roomDetails, setRoomDetails] = useState({
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

  // Calculate estimate whenever rooms change
  useEffect(() => {
    try {
      if (roomDetails.rooms.length > 0) {
        const estimates: Record<string, any> = {};
        
        for (const room of roomDetails.rooms) {
          const roomEstimate = calculateMultiRoomEstimate({ 
            rooms: [room], 
            isEmptyHouse: roomDetails.isEmptyHouse,
            needFloorCovering: roomDetails.needFloorCovering 
          });
          estimates[room.id] = roomEstimate;
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

  // Update rooms
  const updateRooms = (rooms: RoomDetail[]) => {
    setRoomDetails({
      ...roomDetails,
      rooms
    });
  };

  // Handle next and previous step navigation
  const handleNextStep = () => {
    if (step === 3) {
      // Validate project name
      if (!projectName.trim()) {
        setProjectNameError("Please enter a project name");
        return;
      }
      
      // If we're at the last step, save and open login dialog
      if (currentEstimate) {
        // Extract arrays of values from room details for temporary storage
        const roomTypesList = roomDetails.rooms.map(room => room.roomType);
        const roomSizesList = roomDetails.rooms.map(room => room.roomSize);
        const wallsCountList = roomDetails.rooms.map(room => room.wallsCount);
        const wallHeightList = roomDetails.rooms.map(room => room.wallHeight);
        const wallWidthList = roomDetails.rooms.map(room => room.wallWidth);
        const conditionList = roomDetails.rooms.map(room => room.condition);
        const paintTypeList = roomDetails.rooms.map(room => room.paintType);
        const includeCeilingList = roomDetails.rooms.map(room => room.includeCeiling);
        const includeBaseboardsList = roomDetails.rooms.map(room => room.includeBaseboards);
        const baseboardsMethodList = roomDetails.rooms.map(room => room.baseboardsMethod);
        const includeCrownMoldingList = roomDetails.rooms.map(room => room.includeCrownMolding);
        const hasHighCeilingList = roomDetails.rooms.map(room => room.hasHighCeiling);
        const includeClosetList = roomDetails.rooms.map(room => room.includeCloset);
        const isEmptyHouseList = roomDetails.rooms.map(room => room.isEmptyHouse);
        const needFloorCoveringList = roomDetails.rooms.map(room => room.needFloorCovering);
        const doorsCountList = roomDetails.rooms.map(room => room.doorsCount);
        const windowsCountList = roomDetails.rooms.map(room => room.windowsCount);

        // Save all the detailed information
        const estimateData = {
          ...currentEstimate,
          roomDetails: roomDetails.rooms,
          room_types: roomTypesList,
          room_sizes: roomSizesList,
          walls_count: wallsCountList,
          wall_heights: wallHeightList,
          wall_widths: wallWidthList,
          conditions: conditionList,
          paint_types: paintTypeList,
          include_ceiling: includeCeilingList,
          include_baseboards: includeBaseboardsList,
          baseboards_methods: baseboardsMethodList,
          include_crown_molding: includeCrownMoldingList,
          has_high_ceiling: hasHighCeilingList,
          include_closet: includeClosetList,
          is_empty_house: isEmptyHouseList,
          needs_floor_covering: needFloorCoveringList,
          doors_counts: doorsCountList,
          windows_counts: windowsCountList,
          preferred_timeline: "",
          preferred_contact_method: "",
          best_time_to_call: ""
        };
        
        saveTemporaryEstimate(estimateData, roomDetails.rooms, roomEstimates);
        saveTemporaryProjectName(projectName);
        setLoginDialogOpen(true);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // If user is logged in, redirect to formal estimate page
  useEffect(() => {
    if (user) {
      navigate('/estimate');
    }
  }, [user, navigate]);

  return (
    <div className="glass rounded-xl p-6 shadow-lg animate-scale-in relative">
      <ProgressIndicator totalSteps={TOTAL_STEPS} currentStep={step} />

      <div className="min-h-[450px] relative mb-16">
        {/* Step 1: Room Details (was previously step 2) */}
        <FormStep title="What rooms are you painting?" isActive={step === 1}>
          <p className="text-muted-foreground mb-4">
            Add all rooms you want to paint and their details. You can add multiple rooms.
          </p>
          <MultiRoomSelector 
            rooms={roomDetails.rooms} 
            updateRooms={updateRooms} 
          />
        </FormStep>

        {/* Step 2: Summary (was previously step 3) */}
        <FormStep title="Estimate Summary" isActive={step === 2}>
          <p className="text-muted-foreground mb-4">
            Review your estimate details before proceeding.
          </p>
          {currentEstimate && (
            <EstimateSummary 
              currentEstimate={currentEstimate}
              rooms={roomDetails.rooms}
              roomEstimates={roomEstimates}
              onSubmit={() => {}}
              submitButtonText="Continue"
              isLastStep={false}
            />
          )}
        </FormStep>

        {/* Step 3: Project Information (was previously step 1) */}
        <FormStep title="Project Information" isActive={step === 3}>
          <p className="text-muted-foreground mb-6">
            Provide your contact details and project information to save your estimate.
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="e.g., Home Renovation 2023"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  setProjectNameError(null);
                }}
                className={projectNameError ? "border-red-500" : ""}
              />
              {projectNameError && <p className="text-sm text-red-500">{projectNameError}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <Button 
                className="w-full bg-paint hover:bg-paint-dark"
                asChild
              >
                <Link to="/auth?returnUrl=/estimate&saveEstimate=true">
                  Create an account to start your project
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </FormStep>
      </div>

      <div className="absolute bottom-6 right-6 left-6">
        <EstimatorNavigation
          currentStep={step}
          totalSteps={TOTAL_STEPS}
          onNext={handleNextStep}
          onPrev={handlePrevStep}
        />
      </div>

      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create an Account</DialogTitle>
            <DialogDescription>
              Create an account to save your estimate and start your project.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="bg-secondary/40 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Estimate Summary</h4>
                {currentEstimate && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Project:</span>
                      <span>{projectName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rooms:</span>
                      <span>{roomDetails.rooms.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Estimate:</span>
                      <span>${currentEstimate.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Your estimate has been calculated! Create an account to save it.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            <Button 
              variant="outline" 
              className="sm:w-auto w-full" 
              onClick={() => setLoginDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="sm:w-auto w-full bg-paint hover:bg-paint-dark"
              asChild
            >
              <Link to="/auth?returnUrl=/estimate&saveEstimate=true">
                Create Account
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomeEstimator;

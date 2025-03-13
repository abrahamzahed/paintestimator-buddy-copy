
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { saveTemporaryEstimate, saveTemporaryProjectName } from "@/utils/estimateStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, RefreshCcw } from "lucide-react";
import DynamicEstimatorForm from "./DynamicEstimatorForm";
import { RoomDetails, EstimatorSummary } from "@/types/estimator";
import { supabase } from "@/integrations/supabase/client";
import CurrentEstimatePanel from "./estimator/CurrentEstimatePanel";
import { fetchPricingData } from "@/lib/supabase";
import EstimatorNavigation from "./estimator/EstimatorNavigation";
import AddressAutocomplete from "./AddressAutocomplete";

const HomeEstimator = () => {
  const navigate = useNavigate();
  const { user } = useSession();
  const { toast } = useToast();
  
  // User information state
  const [step, setStep] = useState(1); // 1: Info, 2: Estimator, 3: Summary
  const [projectName, setProjectName] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  // Validation errors
  const [projectNameError, setProjectNameError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  
  // Estimate data
  const [currentEstimate, setCurrentEstimate] = useState<EstimatorSummary | null>(null);
  const [roomDetailsArray, setRoomDetailsArray] = useState<RoomDetails[]>([]);
  const [saveComplete, setSaveComplete] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);

  // If user is logged in, redirect to formal estimate page
  useEffect(() => {
    if (user) {
      navigate('/estimate');
    }
  }, [user, navigate]);

  const validateStep1 = () => {
    let isValid = true;
    
    // Validate project name
    if (!projectName.trim()) {
      setProjectNameError("Please enter a project name");
      isValid = false;
    } else {
      setProjectNameError(null);
    }
    
    // Validate name
    if (!name.trim()) {
      setNameError("Please enter your full name");
      isValid = false;
    } else {
      setNameError(null);
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else {
      setEmailError(null);
    }
    
    // Validate phone (basic validation)
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phone.trim() || !phoneRegex.test(phone)) {
      setPhoneError("Please enter a valid phone number (e.g., 555-123-4567)");
      isValid = false;
    } else {
      setPhoneError(null);
    }
    
    // Validate address
    if (!address.trim() || address.length < 10) {
      setAddressError("Please enter a complete address");
      isValid = false;
    } else {
      setAddressError(null);
    }
    
    return isValid;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleReset = () => {
    // Reset to step 1 and clear state if needed
    setStep(1);
    
    // If we want to clear all the form data on reset, uncomment these:
    // setProjectName("");
    // setEmail("");
    // setName("");
    // setPhone("");
    // setAddress("");
    // setCurrentEstimate(null);
    // setRoomDetailsArray([]);
    
    toast({
      title: "Estimator reset",
      description: "All steps have been reset to the beginning"
    });
  };

  const handleEstimateComplete = async (
    estimate: EstimatorSummary,
    rooms: RoomDetails[]
  ) => {
    setCurrentEstimate(estimate);
    setRoomDetailsArray(rooms);
    
    try {
      // Fetch room type data to include actual room names
      const pricingData = await fetchPricingData();
      
      // Enhance room details with room type names for better readability
      const enhancedRooms = rooms.map((room, index) => {
        const roomType = pricingData.roomTypes.find(rt => rt.id === room.roomTypeId);
        return {
          ...room,
          roomTypeName: roomType?.name || `Room Type ${index + 1}`,
          totalBeforeVolume: estimate.roomCosts[index]?.totalBeforeVolume || 0
        };
      });
      
      // Create a lead in Supabase with all details in the JSON format
      const detailsJson = JSON.stringify({
        estimateSummary: estimate,
        roomDetails: enhancedRooms,
        userInfo: {
          name,
          email,
          phone,
          address,
          projectName
        }
      });
      
      const { data: leadData, error } = await supabase
        .from('leads')
        .insert([
          {
            name: name,
            email: email,
            phone: phone,
            address: address,
            project_name: projectName,
            status: 'new',
            description: 'Lead from free estimator',
            details: detailsJson
          }
        ])
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      if (leadData) {
        setLeadId(leadData.id);
        
        // Store estimate data for account creation
        if (currentEstimate) {
          saveTemporaryEstimate({
            roomPrice: estimate.subtotal,
            laborCost: estimate.finalTotal * 0.7, // Approximate labor as 70% of total
            materialCost: estimate.finalTotal * 0.3, // Approximate materials as 30% of total
            totalCost: estimate.finalTotal,
            timeEstimate: 0, // Will be calculated properly on the backend
            paintCans: 0, // Will be calculated properly on the backend
            additionalCosts: {},
            discounts: { volumeDiscount: estimate.volumeDiscount }
          }, [], {});
          
          saveTemporaryProjectName(projectName);
        }
        
        setSaveComplete(true);
        setStep(3);
        
        toast({
          title: "Estimate saved!",
          description: "Your estimate has been saved successfully."
        });
      }
    } catch (error: any) {
      console.error("Error saving lead:", error);
      toast({
        title: "Error saving estimate",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleCreateAccount = () => {
    // Redirect to auth page
    navigate('/auth?returnUrl=/estimate&saveEstimate=true');
  };

  return (
    <div className="glass rounded-xl p-6 shadow-lg animate-scale-in relative">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        <div 
          className={`flex items-center ${step >= 1 ? 'text-paint' : 'text-muted-foreground'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-paint bg-paint/10' : 'border-muted-foreground'}`}>
            1
          </div>
          <span className="ml-2 font-medium">Your Info</span>
        </div>
        <div className={`flex-grow border-t mx-4 ${step >= 2 ? 'border-paint' : 'border-muted-foreground/50'}`}></div>
        <div 
          className={`flex items-center ${step >= 2 ? 'text-paint' : 'text-muted-foreground'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-paint bg-paint/10' : 'border-muted-foreground'}`}>
            2
          </div>
          <span className="ml-2 font-medium">Estimate</span>
        </div>
        <div className={`flex-grow border-t mx-4 ${step >= 3 ? 'border-paint' : 'border-muted-foreground/50'}`}></div>
        <div 
          className={`flex items-center ${step >= 3 ? 'text-paint' : 'text-muted-foreground'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-paint bg-paint/10' : 'border-muted-foreground'}`}>
            3
          </div>
          <span className="ml-2 font-medium">Summary</span>
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          {step === 1 && "Let's Get Started"}
          {step === 2 && "Design Your Painting Project"}
          {step === 3 && "Your Estimate Summary"}
        </h2>
        <p className="text-muted-foreground">
          {step === 1 && "Please provide your contact information."}
          {step === 2 && "Add rooms and customize your painting needs."}
          {step === 3 && "Review your estimate and create an account to save it."}
        </p>
      </div>

      {/* Step 1: User Information */}
      {step === 1 && (
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
              onChange={(e) => {
                setName(e.target.value);
                setNameError(null);
              }}
              className={nameError ? "border-red-500" : ""}
            />
            {nameError && <p className="text-sm text-red-500">{nameError}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              className={emailError ? "border-red-500" : ""}
            />
            {emailError && <p className="text-sm text-red-500">{emailError}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneError(null);
              }}
              className={phoneError ? "border-red-500" : ""}
            />
            {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
          </div>
          
          <AddressAutocomplete
            value={address}
            onChange={(value) => {
              setAddress(value);
              setAddressError(null);
            }}
            error={addressError || undefined}
            required={true}
          />

          <EstimatorNavigation
            currentStep={1}
            totalSteps={3}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onReset={handleReset}
            showReset={false} // No need for reset on first step
          />
        </div>
      )}

      {/* Step 2: Estimator Form */}
      {step === 2 && (
        <div>
          <EstimatorNavigation
            currentStep={2}
            totalSteps={3}
            onNext={() => {}} // DynamicEstimatorForm handles its own next
            onPrev={handlePrevStep}
            onReset={handleReset}
          />
          
          <DynamicEstimatorForm onEstimateComplete={handleEstimateComplete} />
        </div>
      )}

      {/* Step 3: Summary */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-center text-green-500 mb-4">
            <CheckCircle className="h-16 w-16" />
          </div>
          
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Estimate Saved!</h3>
            <p className="text-muted-foreground">
              Your estimate has been saved. Create an account to access it anytime.
            </p>
          </div>
          
          <div className="bg-secondary/30 p-6 rounded-lg">
            <h4 className="font-medium mb-4">Project Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Project Name:</span>
                <span className="font-medium">{projectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact:</span>
                <span className="font-medium">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address:</span>
                <span className="font-medium">{address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rooms:</span>
                <span className="font-medium">{roomDetailsArray.length}</span>
              </div>
            </div>
          </div>
          
          {currentEstimate && (
            <CurrentEstimatePanel 
              currentEstimate={null} 
              dynamicEstimate={currentEstimate} 
              showDetails={true}
              roomDetails={roomDetailsArray}
            />
          )}
          
          <div className="pt-4 space-y-4">
            <EstimatorNavigation
              currentStep={3}
              totalSteps={3}
              onNext={() => {}}
              onPrev={handlePrevStep}
              onReset={handleReset}
            />
            
            <Button 
              className="w-full bg-paint hover:bg-paint-dark"
              onClick={handleCreateAccount}
            >
              Create Account
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>
                By creating an account, you'll be able to access your estimate 
                anytime and receive a detailed quote from our team.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeEstimator;

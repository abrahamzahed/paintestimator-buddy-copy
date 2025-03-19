import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/auth/use-session";
import { useToast } from "@/common/hooks/use-toast";
import { saveTemporaryEstimate, saveTemporaryProjectName } from "@/utils/estimateStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Home, LayoutDashboard } from "lucide-react";
import DynamicEstimatorForm from "@/components/DynamicEstimatorForm";
import { RoomDetails, EstimatorSummary } from "@/types/estimator";
import { supabase } from "@/integrations/supabase/client";
import CurrentEstimatePanel from "@/components/estimator/CurrentEstimatePanel";
import { fetchPricingData } from "@/lib/supabase";
import EstimatorNavigation from "@/components/estimator/EstimatorNavigation";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { ProjectSelector } from "@/modules/customer/components/ProjectSelector";

interface FreeEstimatorProps {
  isAuthenticated?: boolean;
}

const FreeEstimator = ({ isAuthenticated = false }: FreeEstimatorProps) => {
  const navigate = useNavigate();
  const { user, profile } = useSession();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1); // 1: Info, 2: Estimator, 3: Summary
  const [projectName, setProjectName] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState<string | undefined>(undefined);
  
  const [projectNameError, setProjectNameError] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  
  const [currentEstimate, setCurrentEstimate] = useState<EstimatorSummary | null>(null);
  const [roomDetailsArray, setRoomDetailsArray] = useState<RoomDetails[]>([]);
  const [saveComplete, setSaveComplete] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [estimateId, setEstimateId] = useState<string | null>(null);

  // Populate form with user profile data if authenticated
  useEffect(() => {
    if (isAuthenticated && profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      if (profile.address) {
        setAddress(profile.address);
      }
    }
  }, [isAuthenticated, profile]);

  // Skip personal info step if authenticated
  useEffect(() => {
    if (isAuthenticated && step === 1) {
      // We don't skip step 1 anymore, since we need to select a project
      // But we pre-fill the form fields from the user profile
    }
  }, [isAuthenticated, step]);

  const handleSelectProject = (projectId: string | null, projectName?: string) => {
    setSelectedProjectId(projectId);
    setSelectedProjectName(projectName);
    setProjectName(projectName || "");
    setProjectError(null);
    setProjectNameError(null);
  };

  const validateStep1 = () => {
    let isValid = true;
    
    if (isAuthenticated) {
      // For authenticated users, only validate project selection
      if (!selectedProjectId) {
        setProjectError("Please select a project or create a new one");
        isValid = false;
      } else {
        setProjectError(null);
      }
      
      if (!address.trim() || address.length < 10) {
        setAddressError("Please enter a complete address");
        isValid = false;
      } else {
        setAddressError(null);
      }
    } else {
      // For non-authenticated users, validate all fields as before
      if (!projectName.trim()) {
        setProjectNameError("Please enter a project name");
        isValid = false;
      } else {
        setProjectNameError(null);
      }
      
      if (!name.trim()) {
        setNameError("Please enter your full name");
        isValid = false;
      } else {
        setNameError(null);
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email)) {
        setEmailError("Please enter a valid email address");
        isValid = false;
      } else {
        setEmailError(null);
      }
      
      const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      if (!phone.trim() || !phoneRegex.test(phone)) {
        setPhoneError("Please enter a valid phone number (e.g., 555-123-4567)");
        isValid = false;
      } else {
        setPhoneError(null);
      }
      
      if (!address.trim() || address.length < 10) {
        setAddressError("Please enter a complete address");
        isValid = false;
      } else {
        setAddressError(null);
      }
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
    setStep(1);
    setCurrentEstimate(null);
    setRoomDetailsArray([]);
    setSaveComplete(false);
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
      const pricingData = await fetchPricingData();
      
      const enhancedRooms = rooms.map((room, index) => {
        const roomType = pricingData.roomTypes.find(rt => rt.id === room.roomTypeId);
        return {
          ...room,
          roomTypeName: roomType?.name || `Room Type ${index + 1}`,
          totalBeforeVolume: estimate.roomCosts[index]?.totalBeforeVolume || 0
        };
      });

      // For authenticated users, save directly to their account
      if (isAuthenticated && user) {
        // Use selected project or create one if needed
        let projectId = selectedProjectId;
        
        if (!projectId) {
          // Create a new project if somehow we don't have one selected
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .insert({
              name: selectedProjectName || `Painting Project - ${new Date().toLocaleDateString()}`,
              description: 'Project created from estimator',
              status: 'active',
              user_id: user.id
            })
            .select()
            .single();
            
          if (projectError) {
            throw projectError;
          }
          
          projectId = projectData.id;
        }
        
        setProjectId(projectId);
        
        const detailsJson = JSON.stringify({
          estimateSummary: estimate,
          roomDetails: enhancedRooms,
          userInfo: {
            name,
            email,
            phone,
            address,
            projectName: selectedProjectName || projectName
          }
        });
        
        // Create lead
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .insert([
            {
              name: name || profile?.name || '',
              email: email || profile?.email || '',
              phone: phone || profile?.phone || '',
              address: address || profile?.address || '',
              project_name: selectedProjectName || projectName,
              project_id: projectId,
              status: 'new',
              description: 'Lead from estimator',
              details: detailsJson,
              user_id: user.id
            }
          ])
          .select()
          .single();
          
        if (leadError) {
          throw leadError;
        }
        
        if (leadData) {
          setLeadId(leadData.id);
          
          const simplifiedRoomDetails = rooms.map(room => ({
            id: room.id,
            roomTypeId: room.roomTypeId,
            roomType: room.roomType,
            size: room.size,
            addons: room.addons || [],
            hasHighCeiling: room.hasHighCeiling,
            paintType: room.paintType,
            isEmpty: room.isEmpty,
            noFloorCovering: room.noFloorCovering,
            doorPaintingMethod: room.doorPaintingMethod,
            numberOfDoors: room.numberOfDoors,
            windowPaintingMethod: room.windowPaintingMethod,
            numberOfWindows: room.numberOfWindows
          }));
          
          const estimatedPaintGallons = Math.ceil(estimate.finalTotal / 250);
          
          const detailsObject = {
            rooms: rooms.length,
            paintType: estimatedPaintGallons > 2 ? "premium" : "standard",
            roomDetails: simplifiedRoomDetails,
            roomTypes: rooms.map(room => room.roomType),
            roomSizes: rooms.map(room => room.size),
            hasHighCeilings: rooms.map(room => room.hasHighCeiling),
            isEmpty: rooms.some(room => room.isEmpty),
            noFloorCovering: rooms.some(room => room.noFloorCovering)
          };
          
          // Insert estimate
          const { data: estimateData, error: estimateError } = await supabase
            .from('estimates')
            .insert({
              lead_id: leadData.id,
              project_id: projectId,
              project_name: selectedProjectName || projectName,
              details: detailsObject,
              labor_cost: estimate.finalTotal * 0.7,
              material_cost: estimate.finalTotal * 0.3,
              total_cost: estimate.finalTotal,
              estimated_hours: estimate.finalTotal / 75,
              estimated_paint_gallons: estimatedPaintGallons,
              status: "pending"
            })
            .select()
            .single();
            
          if (estimateError) {
            throw estimateError;
          }
          
          setEstimateId(estimateData.id);
          
          toast({
            title: "Estimate saved!",
            description: "Your estimate has been saved successfully to your account."
          });
        }
      } else {
        // For guest users - keep existing code
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .insert({
            name: projectName,
            description: 'Project created from free estimator',
            status: 'active',
            guest_email: email,
            user_id: null
          })
          .select()
          .single();
          
        if (projectError) {
          throw projectError;
        }
        
        const projectId = projectData.id;
        setProjectId(projectId);
        
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
        
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .insert([
            {
              name: name,
              email: email,
              phone: phone,
              address: address,
              project_name: projectName,
              project_id: projectId,
              status: 'new',
              description: 'Lead from free estimator',
              details: detailsJson,
              user_id: null
            }
          ])
          .select()
          .single();
          
        if (leadError) {
          throw leadError;
        }
        
        if (leadData) {
          setLeadId(leadData.id);
          
          const simplifiedRoomDetails = rooms.map(room => ({
            id: room.id,
            roomTypeId: room.roomTypeId,
            roomType: room.roomType,
            size: room.size,
            addons: room.addons || [],
            hasHighCeiling: room.hasHighCeiling,
            paintType: room.paintType,
            isEmpty: room.isEmpty,
            noFloorCovering: room.noFloorCovering,
            doorPaintingMethod: room.doorPaintingMethod,
            numberOfDoors: room.numberOfDoors,
            windowPaintingMethod: room.windowPaintingMethod,
            numberOfWindows: room.numberOfWindows
          }));
          
          const estimatedPaintGallons = Math.ceil(estimate.finalTotal / 250);
          
          const detailsObject = {
            rooms: rooms.length,
            paintType: estimatedPaintGallons > 2 ? "premium" : "standard",
            roomDetails: simplifiedRoomDetails,
            roomTypes: rooms.map(room => room.roomType),
            roomSizes: rooms.map(room => room.size),
            hasHighCeilings: rooms.map(room => room.hasHighCeiling),
            isEmpty: rooms.some(room => room.isEmpty),
            noFloorCovering: rooms.some(room => room.noFloorCovering)
          };
          
          const { data: estimateData, error: estimateError } = await supabase
            .from('estimates')
            .insert({
              lead_id: leadData.id,
              project_id: projectId,
              project_name: projectName,
              details: detailsObject,
              labor_cost: estimate.finalTotal * 0.7,
              material_cost: estimate.finalTotal * 0.3,
              total_cost: estimate.finalTotal,
              estimated_hours: estimate.finalTotal / 75,
              estimated_paint_gallons: estimatedPaintGallons,
              status: "pending"
            })
            .select()
            .single();
            
          if (estimateError) {
            throw estimateError;
          }
          
          setEstimateId(estimateData.id);
          
          const estimateWithPaintCans = {
            ...estimate,
            paintCans: estimatedPaintGallons
          };
          
          saveTemporaryEstimate({
            roomPrice: estimate.subtotal,
            laborCost: estimate.finalTotal * 0.7,
            materialCost: estimate.finalTotal * 0.3,
            totalCost: estimate.finalTotal,
            timeEstimate: 0,
            paintCans: estimatedPaintGallons,
            additionalCosts: {},
            discounts: { volumeDiscount: estimate.volumeDiscount }
          }, [], {});
          
          saveTemporaryProjectName(projectName);
        }
      }
      
      setSaveComplete(true);
      setStep(3);
      
      toast({
        title: "Estimate saved!",
        description: "Your estimate has been saved successfully."
      });
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
    navigate('/auth?returnUrl=/estimate&saveEstimate=true');
  };

  const handleNavigateHome = () => {
    navigate('/');
  };

  const handleNavigateDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="glass rounded-xl p-6 shadow-lg animate-scale-in relative">
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

      {/* Navigation buttons for authenticated users on Step 1 */}
      {isAuthenticated && step === 1 && (
        <div className="flex space-x-2 mb-6">
          <Button 
            variant="outline" 
            onClick={handleNavigateDashboard}
            className="flex items-center"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleNavigateHome}
            className="flex items-center"
          >
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          {/* For authenticated users, show project selector instead of project name input */}
          {isAuthenticated ? (
            <ProjectSelector
              selectedProjectId={selectedProjectId}
              onSelectProject={handleSelectProject}
              required={true}
              error={projectError || undefined}
            />
          ) : (
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
          )}
          
          {/* For authenticated users, use read-only fields for personal info */}
          {isAuthenticated ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
          
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
            showReset={false}
          />
        </div>
      )}

      {step === 2 && (
        <div>
          <EstimatorNavigation
            currentStep={2}
            totalSteps={3}
            onNext={() => {}}
            onPrev={handlePrevStep}
            onReset={handleReset}
          />
          
          <DynamicEstimatorForm onEstimateComplete={handleEstimateComplete} />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-center text-green-500 mb-4">
            <CheckCircle className="h-16 w-16" />
          </div>
          
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Estimate Saved!</h3>
            <p className="text-muted-foreground">
              {isAuthenticated 
                ? "Your estimate has been saved to your account." 
                : "Your estimate has been saved. Create an account to access it anytime."}
            </p>
          </div>
          
          <div className="bg-secondary/30 p-6 rounded-lg">
            <h4 className="font-medium mb-4">Project Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Project Name:</span>
                <span className="font-medium">{selectedProjectName || projectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact:</span>
                <span className="font-medium">{name || profile?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address:</span>
                <span className="font-medium">{address || profile?.address}</span>
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
            
            {!isAuthenticated && (
              <Button 
                className="w-full bg-paint hover:bg-paint-dark"
                onClick={handleCreateAccount}
              >
                Create Account
              </Button>
            )}
            
            {!isAuthenticated && (
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  By creating an account, you'll be able to access your estimate 
                  anytime and receive a detailed quote from our team.
                </p>
              </div>
            )}
            
            {isAuthenticated && (
              <div className="flex space-x-2">
                <Button 
                  className="flex-1 bg-paint hover:bg-paint-dark"
                  onClick={handleNavigateDashboard}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={handleNavigateHome}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Return Home
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeEstimator;

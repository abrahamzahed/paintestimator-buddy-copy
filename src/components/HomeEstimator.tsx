import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { saveTemporaryEstimate, saveTemporaryProjectName } from "@/utils/estimateStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import DynamicEstimatorForm from "./DynamicEstimatorForm";
import { RoomDetails, EstimatorSummary } from "@/types/estimator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import CurrentEstimatePanel from "./estimator/CurrentEstimatePanel";
import { EstimateResult } from "@/types";

const HomeEstimator = () => {
  const navigate = useNavigate();
  const { user } = useSession();
  const { toast } = useToast();
  
  const [projectName, setProjectName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [errors, setErrors] = useState({
    projectName: "",
    name: "",
    email: "",
    phone: ""
  });

  const [currentEstimate, setCurrentEstimate] = useState<EstimatorSummary | null>(null);
  const [roomDetails, setRoomDetails] = useState<RoomDetails[]>([]);
  const [estimateSubmitted, setEstimateSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimateResult, setEstimateResult] = useState<EstimateResult | null>(null);
  const [showEstimator, setShowEstimator] = useState(false);
  
  useEffect(() => {
    if (user) {
      navigate('/estimate');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors = {
      projectName: "",
      name: "",
      email: "",
      phone: ""
    };
    
    let isValid = true;
    
    if (!projectName.trim()) {
      newErrors.projectName = "Project name is required";
      isValid = false;
    }
    
    if (!name.trim()) {
      newErrors.name = "Full name is required";
      isValid = false;
    }
    
    if (!email.trim()) {
      newErrors.email = "Email address is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }
    
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone)) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setShowEstimator(true);
      toast({
        title: "Information saved",
        description: "Now you can create your estimate below",
      });
    }
  };
  
  const handleEstimateComplete = (
    estimate: EstimatorSummary,
    rooms: RoomDetails[]
  ) => {
    setCurrentEstimate(estimate);
    setRoomDetails(rooms);
    
    const estimateResult: EstimateResult = {
      roomPrice: estimate.subtotal,
      laborCost: estimate.finalTotal * 0.7,
      materialCost: estimate.finalTotal * 0.3,
      totalCost: estimate.finalTotal,
      timeEstimate: calculateTimeEstimate(rooms),
      paintCans: calculatePaintCans(rooms),
      additionalCosts: {},
      discounts: {}
    };
    
    setEstimateResult(estimateResult);
    saveEstimateToLeads(estimateResult, rooms);
  };
  
  const calculateTimeEstimate = (rooms: RoomDetails[]): number => {
    return rooms.length * 4;
  };
  
  const calculatePaintCans = (rooms: RoomDetails[]): number => {
    return Math.ceil(rooms.length * 1.5);
  };
  
  const saveEstimateToLeads = async (estimate: EstimateResult, rooms: RoomDetails[]) => {
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from("leads")
        .insert([
          {
            project_name: projectName,
            name: name,
            email: email,
            phone: phone,
            service_type: "interior",
            status: "new",
            room_count: rooms.length,
            description: JSON.stringify({
              estimateResult: estimate,
              rooms: rooms,
              createdAt: new Date().toISOString()
            })
          }
        ])
        .select();

      if (error) {
        console.error("Error saving lead:", error);
        throw error;
      }
      
      saveTemporaryEstimate(estimate, rooms, {});
      saveTemporaryProjectName(projectName);
      
      setEstimateSubmitted(true);
      toast({
        title: "Estimate saved!",
        description: "Your estimate has been saved successfully.",
      });
    } catch (error: any) {
      console.error("Error submitting estimate:", error);
      toast({
        title: "Error saving estimate",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAccount = () => {
    navigate('/auth?returnUrl=/estimate&saveEstimate=true');
  };

  if (user) {
    navigate('/estimate');
    return null;
  }

  return (
    <div className="glass rounded-xl p-6 shadow-lg animate-scale-in relative">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Get Your Painting Estimate</h2>
        <p className="text-muted-foreground">
          Enter your details and use our calculator to get an instant estimate for your painting project.
        </p>
      </div>

      {!showEstimator ? (
        <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName" className="after:content-['*'] after:ml-0.5 after:text-red-500">
              Project Name
            </Label>
            <Input
              id="projectName"
              placeholder="e.g., Home Renovation 2023"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className={errors.projectName ? "border-red-500" : ""}
            />
            {errors.projectName && <p className="text-sm text-red-500">{errors.projectName}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name" className="after:content-['*'] after:ml-0.5 after:text-red-500">
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="after:content-['*'] after:ml-0.5 after:text-red-500">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="after:content-['*'] after:ml-0.5 after:text-red-500">
              Phone Number
            </Label>
            <Input
              id="phone"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-paint hover:bg-paint-dark"
          >
            Continue to Estimate
          </Button>
        </form>
      ) : estimateSubmitted ? (
        <div className="space-y-6">
          <Alert className="bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Your estimate has been saved successfully! Create an account to access it anytime.
            </AlertDescription>
          </Alert>
          
          {currentEstimate && (
            <div className="bg-secondary/40 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Estimate Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Rooms:</span>
                  <span>{roomDetails.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Estimate:</span>
                  <span>${currentEstimate.finalTotal.toFixed(2)}</span>
                </div>
                {estimateResult && (
                  <>
                    <div className="flex justify-between">
                      <span>Labor Cost:</span>
                      <span>${estimateResult.laborCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Material Cost:</span>
                      <span>${estimateResult.materialCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Time:</span>
                      <span>{estimateResult.timeEstimate.toFixed(1)} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paint Required:</span>
                      <span>{estimateResult.paintCans} gallons</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          <Button 
            className="w-full bg-paint hover:bg-paint-dark"
            onClick={handleCreateAccount}
          >
            Create Account to Access Your Estimate
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-secondary/30 rounded-lg">
            <h3 className="font-medium">Project Information</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
              <div>
                <span className="text-muted-foreground">Project:</span> {projectName}
              </div>
              <div>
                <span className="text-muted-foreground">Name:</span> {name}
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span> {email}
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span> {phone}
              </div>
            </div>
          </div>
          
          {currentEstimate && <CurrentEstimatePanel currentEstimate={estimateResult} />}
          
          <DynamicEstimatorForm 
            onEstimateComplete={handleEstimateComplete} 
            initialUserData={{
              name,
              email,
              phone
            }}
          />
          
          {isSubmitting && (
            <div className="text-center py-4">
              <div className="animate-pulse text-paint">
                Saving your estimate...
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeEstimator;

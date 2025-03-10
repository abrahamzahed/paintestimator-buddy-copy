
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { ExternalLink, PlusCircle, Check } from "lucide-react";
import DynamicEstimatorForm from "./DynamicEstimatorForm";
import { RoomDetails, EstimatorSummary } from "@/types/estimator";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { saveTemporaryProjectName } from "@/utils/estimateStorage";
import { formatCurrency } from "@/utils/estimateUtils";

// Form validation schema
const userInfoSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits")
});

const HomeEstimator = () => {
  const navigate = useNavigate();
  const { user } = useSession();
  const { toast } = useToast();
  
  // Step management
  const [currentStep, setCurrentStep] = useState<"userInfo" | "estimator" | "summary">("userInfo");
  
  // User information state
  const [userInfo, setUserInfo] = useState({
    projectName: "",
    name: "",
    email: "",
    phone: ""
  });
  
  // Validation errors state
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Estimate states
  const [currentEstimate, setCurrentEstimate] = useState<EstimatorSummary | null>(null);
  const [roomDetails, setRoomDetails] = useState<RoomDetails[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimateSubmitted, setEstimateSubmitted] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);

  // Handle user info form input changes
  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field as user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate user info form
  const validateUserInfo = () => {
    try {
      userInfoSchema.parse(userInfo);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: {[key: string]: string} = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Handle advancement to estimator step
  const handleProceedToEstimator = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateUserInfo()) {
      setCurrentStep("estimator");
    }
  };

  // Handle estimate calculation completion
  const handleEstimateComplete = async (
    estimate: EstimatorSummary,
    rooms: RoomDetails[]
  ) => {
    setCurrentEstimate(estimate);
    setRoomDetails(rooms);
    setIsSubmitting(true);
    
    try {
      // Save lead with estimate data to Supabase
      const { data: lead, error } = await supabase
        .from("leads")
        .insert([
          {
            name: userInfo.name,
            email: userInfo.email,
            phone: userInfo.phone,
            project_name: userInfo.projectName,
            service_type: "interior", 
            status: "new",
            room_count: rooms.length,
            // Store the estimate details as JSON
            description: JSON.stringify({
              rooms: rooms,
              estimate: {
                laborCost: estimate.finalTotal * 0.7, // Approximate
                materialCost: estimate.finalTotal * 0.3, // Approximate
                totalCost: estimate.finalTotal,
                subtotal: estimate.subtotal,
                volumeDiscount: estimate.volumeDiscount,
                roomCosts: estimate.roomCosts
              }
            })
          }
        ])
        .select("id")
        .single();
      
      if (error) throw error;
      
      setLeadId(lead.id);
      setEstimateSubmitted(true);
      
      // Save project name in local storage for potential account creation
      saveTemporaryProjectName(userInfo.projectName);
      
      // Move to summary step
      setCurrentStep("summary");
      
      toast({
        title: "Estimate saved",
        description: "Your estimate has been saved successfully."
      });
    } catch (error: any) {
      console.error("Error saving estimate:", error);
      toast({
        title: "Error saving estimate",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create account and proceed to dashboard
  const handleCreateAccount = () => {
    navigate('/auth?returnUrl=/dashboard');
  };

  // Render different steps based on current step
  const renderStep = () => {
    switch (currentStep) {
      case "userInfo":
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Get Your Free Painting Estimate</h3>
              <p className="text-muted-foreground">
                Please provide your information to start your estimate
              </p>
            </div>
            
            <form onSubmit={handleProceedToEstimator} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  name="projectName"
                  placeholder="Home Renovation 2023"
                  value={userInfo.projectName}
                  onChange={handleUserInfoChange}
                  className={errors.projectName ? "border-red-500" : ""}
                />
                {errors.projectName && (
                  <p className="text-sm text-red-500">{errors.projectName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={userInfo.name}
                  onChange={handleUserInfoChange}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={userInfo.email}
                  onChange={handleUserInfoChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="(555) 123-4567"
                  value={userInfo.phone}
                  onChange={handleUserInfoChange}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-paint hover:bg-paint-dark"
              >
                Continue to Estimator
              </Button>
            </form>
          </div>
        );
        
      case "estimator":
        return (
          <div className="space-y-4">
            <div className="bg-secondary/20 p-3 rounded-lg mb-4">
              <h3 className="font-medium mb-1">Project Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Project:</span> {userInfo.projectName}
                </div>
                <div>
                  <span className="text-muted-foreground">Name:</span> {userInfo.name}
                </div>
              </div>
            </div>
            
            <DynamicEstimatorForm 
              onEstimateComplete={handleEstimateComplete} 
              isSubmitting={isSubmitting}
            />
          </div>
        );
        
      case "summary":
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-start">
              <div className="bg-green-100 p-1 rounded-full mr-3">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-800 mb-1">Estimate Saved!</h3>
                <p className="text-sm text-green-700">
                  Your estimate has been saved. Create an account to manage your projects.
                </p>
              </div>
            </div>
            
            <div className="bg-secondary/20 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Estimate Summary</h3>
              {currentEstimate && (
                <div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span>Project:</span>
                      <span>{userInfo.projectName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rooms:</span>
                      <span>{roomDetails.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(currentEstimate.subtotal)}</span>
                    </div>
                    {currentEstimate.volumeDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Volume Discount:</span>
                        <span>-{formatCurrency(currentEstimate.volumeDiscount)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-3 flex justify-between font-medium">
                    <span>Total Estimate:</span>
                    <span className="text-xl font-bold text-paint">
                      {formatCurrency(currentEstimate.finalTotal)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleCreateAccount}
                className="w-full bg-paint hover:bg-paint-dark"
              >
                Create Account to Track Your Project
                <PlusCircle className="ml-2 h-4 w-4" />
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Reference ID: {leadId}</p>
                <p>Save this ID to reference your estimate in the future.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  // If user is already logged in, redirect to estimate page
  if (user) {
    navigate('/estimate');
    return null;
  }

  return (
    <div className="glass rounded-xl p-6 shadow-lg animate-scale-in relative">
      {renderStep()}
    </div>
  );
};

export default HomeEstimator;

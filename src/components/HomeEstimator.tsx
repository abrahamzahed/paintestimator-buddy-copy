
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { saveTemporaryEstimate, saveTemporaryProjectName } from "@/utils/estimateStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import DynamicEstimatorForm from "./DynamicEstimatorForm";
import { RoomDetails, EstimatorSummary } from "@/types/estimator";

const HomeEstimator = () => {
  const navigate = useNavigate();
  const { user } = useSession();
  const { toast } = useToast();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  const [currentEstimate, setCurrentEstimate] = useState<EstimatorSummary | null>(null);
  const [roomDetails, setRoomDetails] = useState<RoomDetails[]>([]);
  const [projectNameError, setProjectNameError] = useState<string | null>(null);

  const handleEstimateComplete = (
    estimate: EstimatorSummary,
    rooms: RoomDetails[]
  ) => {
    setCurrentEstimate(estimate);
    setRoomDetails(rooms);
    setLoginDialogOpen(true);
  };

  const handleContinue = () => {
    // Validate project name
    if (!projectName.trim()) {
      setProjectNameError("Please enter a project name");
      return;
    }
    
    if (currentEstimate) {
      // Save estimate to local storage for retrieval after login
      // Fixed: Added roomPrice property
      saveTemporaryEstimate({
        roomPrice: currentEstimate.subtotal,
        laborCost: currentEstimate.finalTotal * 0.7, // Approximate labor as 70% of total
        materialCost: currentEstimate.finalTotal * 0.3, // Approximate materials as 30% of total
        totalCost: currentEstimate.finalTotal,
        timeEstimate: 0, // Will be calculated properly on the backend
        paintCans: 0, // Will be calculated properly on the backend
        additionalCosts: {},
        discounts: {}
      }, [], {});
      
      saveTemporaryProjectName(projectName);
    }
    
    // Redirect to auth page
    navigate('/auth?returnUrl=/estimate&saveEstimate=true');
  };

  // If user is logged in, redirect to formal estimate page
  if (user) {
    navigate('/estimate');
    return null;
  }

  return (
    <div className="glass rounded-xl p-6 shadow-lg animate-scale-in relative">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Get Your Painting Estimate</h2>
        <p className="text-muted-foreground">
          Use our dynamic calculator to get an instant estimate for your painting project.
        </p>
      </div>

      <DynamicEstimatorForm onEstimateComplete={handleEstimateComplete} />

      {/* Project Details Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Your Estimate</DialogTitle>
            <DialogDescription>
              Enter project details to save your estimate and continue.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
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

              <div className="bg-secondary/40 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Estimate Summary</h4>
                {currentEstimate && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Rooms:</span>
                      <span>{roomDetails.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Estimate:</span>
                      <span>${currentEstimate.finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            <Button 
              variant="outline" 
              className="sm:w-auto w-full" 
              onClick={() => setLoginDialogOpen(false)}
            >
              Back to Estimate
            </Button>
            <Button 
              className="sm:w-auto w-full bg-paint hover:bg-paint-dark"
              onClick={handleContinue}
            >
              Create Account
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomeEstimator;

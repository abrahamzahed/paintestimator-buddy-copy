import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import EstimateCalculator from "@/components/EstimateCalculator";
import { EstimateResult, Lead, RoomDetail } from "@/types";
import { House, Send, AlertTriangle, ExternalLink } from "lucide-react";
import ProjectSelector from "@/components/estimator/ProjectSelector";
import { formatCurrency } from "@/utils/estimateUtils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { getTemporaryEstimate, clearTemporaryEstimate, getTemporaryProjectName } from "@/utils/estimateStorage";

export default function EstimateForm() {
  const navigate = useNavigate();
  const { user, profile } = useSession();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimateResult, setEstimateResult] = useState<EstimateResult | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState<string | undefined>(undefined);
  const [roomDetails, setRoomDetails] = useState<RoomDetail[]>([]);
  const [roomEstimates, setRoomEstimates] = useState<Record<string, any>>({});
  const [projectError, setProjectError] = useState<string | null>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [tempEstimate, setTempEstimate] = useState<{
    estimateResult: EstimateResult | null;
    roomDetails: RoomDetail[];
    roomEstimates: Record<string, any>;
  } | null>(null);

  const [leadData, setLeadData] = useState<Partial<Lead>>({
    user_id: user?.id,
    name: profile?.name || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    address: "",
    description: "",
    status: "new"
  });

  useEffect(() => {
    if (profile || user) {
      setLeadData(prevData => ({
        ...prevData,
        user_id: user?.id,
        name: profile?.name || prevData.name,
        email: user?.email || prevData.email,
        phone: profile?.phone || prevData.phone
      }));
    }
  }, [profile, user]);

  useEffect(() => {
    const tempProjectName = getTemporaryProjectName();
    if (tempProjectName && user) {
      const createProjectWithTempName = async () => {
        try {
          const { data, error } = await supabase
            .from("projects")
            .insert([
              {
                name: tempProjectName,
                user_id: user.id,
                status: "active"
              },
            ])
            .select()
            .single();

          if (error) throw error;

          setSelectedProjectId(data.id);
          setSelectedProjectName(data.name);
          toast({
            title: "Project created",
            description: `"${tempProjectName}" has been created from your estimate`,
          });
        } catch (error) {
          console.error("Error creating project:", error);
        }
      };

      createProjectWithTempName();
    }
  }, [user]);

  const handleEstimateComplete = async (estimate: EstimateResult, rooms: RoomDetail[], estimates: Record<string, any>) => {
    setEstimateResult(estimate);
    setRoomDetails(rooms);
    setRoomEstimates(estimates);
    setStep(3);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLeadData({ ...leadData, [name]: value });
  };

  const handleSelectProject = (projectId: string | null, projectName?: string) => {
    setSelectedProjectId(projectId);
    setSelectedProjectName(projectName);
    setProjectError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!user) {
        setTempEstimate({
          estimateResult,
          roomDetails,
          roomEstimates
        });
        setLoginDialogOpen(true);
        setIsSubmitting(false);
        return;
      }

      if (!selectedProjectId) {
        setProjectError("Please select a project or create a new one");
        setIsSubmitting(false);
        setStep(1);
        return;
      }

      console.log("Creating lead with user_id:", user.id);
      
      const { data: createdLead, error: leadError } = await supabase
        .from("leads")
        .insert([{
          user_id: user.id,
          project_id: selectedProjectId,
          project_name: selectedProjectName,
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          address: leadData.address,
          service_type: "interior",
          description: "",
          room_count: estimateResult ? roomDetails.length : 1,
          square_footage: 0,
          status: "new"
        }])
        .select("id")
        .single();

      if (leadError) {
        console.error("Lead creation error:", leadError);
        throw leadError;
      }
      
      console.log("Lead created successfully:", createdLead);
      
      if (estimateResult && createdLead) {
        console.log("Creating estimate with lead_id:", createdLead.id);
        
        const simplifiedRoomDetails = roomDetails.map(room => ({
          id: room.id,
          roomType: room.roomType,
          wallsCount: room.wallsCount,
          wallHeight: room.wallHeight,
          wallWidth: room.wallWidth,
          condition: room.condition,
          paintType: room.paintType,
          includeCeiling: room.includeCeiling,
          includeBaseboards: room.includeBaseboards,
          baseboardsMethod: room.baseboardsMethod,
          includeCrownMolding: room.includeCrownMolding,
          hasHighCeiling: room.hasHighCeiling,
          includeCloset: room.includeCloset,
          isEmptyHouse: room.isEmptyHouse,
          needFloorCovering: room.needFloorCovering,
          doorsCount: room.doorsCount,
          windowsCount: room.windowsCount
        }));
        
        const { error: estimateError } = await supabase
          .from("estimates")
          .insert({
            lead_id: createdLead.id,
            project_id: selectedProjectId,
            details: {
              rooms: roomDetails.length,
              paintType: estimateResult.paintCans > 2 ? "premium" : "standard",
              roomDetails: simplifiedRoomDetails
            },
            labor_cost: estimateResult.laborCost,
            material_cost: estimateResult.materialCost,
            total_cost: estimateResult.totalCost,
            estimated_hours: estimateResult.timeEstimate,
            estimated_paint_gallons: estimateResult.paintCans,
            status: "pending"
          });

        if (estimateError) {
          console.error("Estimate creation error:", estimateError);
          throw estimateError;
        }
        
        console.log("Estimate created successfully");
      }

      toast({
        title: "Success!",
        description: "Your estimate request has been submitted.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error submitting lead:", error);
      toast({
        title: "Error submitting request",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedProjectId) {
        setProjectError("Please select a project or create a new one");
        return;
      }
    }
    
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handlePostLoginEstimateSave = () => {
    if (tempEstimate && user) {
      setEstimateResult(tempEstimate.estimateResult);
      setRoomDetails(tempEstimate.roomDetails);
      setRoomEstimates(tempEstimate.roomEstimates);
      
      setLoginDialogOpen(false);
      
      setTimeout(() => {
        handleSubmit(new Event('submit') as any);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-paint">Paint Pro</h1>
              <nav className="hidden md:flex space-x-4">
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>Dashboard</Button>
                <Button variant="ghost" onClick={() => navigate("/estimate")}>Get Estimate</Button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Get Your Painting Estimate</h2>
            <p className="text-muted-foreground">
              Fill out the form below to request a detailed painting estimate.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 1 ? "bg-paint text-white" : "bg-secondary text-muted-foreground"
                }`}>
                  1
                </div>
                <div className={`w-20 h-1 ${
                  step >= 2 ? "bg-paint" : "bg-secondary"
                }`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 2 ? "bg-paint text-white" : "bg-secondary text-muted-foreground"
                }`}>
                  2
                </div>
                <div className={`w-20 h-1 ${
                  step >= 3 ? "bg-paint" : "bg-secondary"
                }`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 3 ? "bg-paint text-white" : "bg-secondary text-muted-foreground"
                }`}>
                  3
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Step {step} of {TOTAL_STEPS}
              </div>
            </div>
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>
                  Provide your contact details and project information
                </CardDescription>
              </CardHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={leadData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={leadData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="(555) 123-4567"
                      value={leadData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Project Address</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="123 Main St, City, State, Zip"
                      value={leadData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <ProjectSelector 
                    selectedProjectId={selectedProjectId} 
                    onSelectProject={handleSelectProject}
                    required={true}
                    error={projectError || undefined} 
                  />
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-paint hover:bg-paint-dark"
                  >
                    Continue to Room Details
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Room Details</CardTitle>
                  <CardDescription>
                    Add rooms to paint and provide detailed information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EstimateCalculator 
                    onEstimateComplete={handleEstimateComplete} 
                    initialUserData={{
                      name: leadData.name,
                      email: leadData.email,
                      phone: leadData.phone
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {step === 3 && estimateResult && (
            <Card>
              <CardHeader>
                <CardTitle>Review Your Estimate</CardTitle>
                <CardDescription>
                  Review your estimate details and submit your request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-3">Project Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{leadData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{leadData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{leadData.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{leadData.address}</p>
                    </div>
                  </div>
                </div>
                
                {selectedProjectName && (
                  <div className="border-b pb-4">
                    <div className="flex items-start">
                      <div className="bg-secondary/50 p-2 rounded-full text-foreground mr-3">
                        <House className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Selected Project</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedProjectName}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-3">Rooms ({roomDetails.length})</h3>
                  <div className="space-y-4">
                    {roomDetails.map((room, index) => (
                      <div key={room.id} className="border rounded-lg p-3">
                        <h4 className="font-medium">Room {index + 1}: {room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)}</h4>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Dimensions:</span> {room.wallsCount} walls, {room.wallHeight}' x {room.wallWidth}'
                          </div>
                          <div>
                            <span className="text-muted-foreground">Paint:</span> {room.paintType.charAt(0).toUpperCase() + room.paintType.slice(1)}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Condition:</span> {room.condition.charAt(0).toUpperCase() + room.condition.slice(1)}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Price:</span> {formatCurrency(roomEstimates[room.id]?.totalCost || 0)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Cost Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Labor Cost</span>
                      <span>{formatCurrency(estimateResult.laborCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Material Cost</span>
                      <span>{formatCurrency(estimateResult.materialCost)}</span>
                    </div>
                    {Object.entries(estimateResult.additionalCosts).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span>{formatCurrency(value as number)}</span>
                      </div>
                    ))}
                    {Object.entries(estimateResult.discounts).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm text-green-600">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()} Discount</span>
                        <span>-{formatCurrency(value as number)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Total Estimate</span>
                      <span>{formatCurrency(estimateResult.totalCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Estimated Time</span>
                      <span>{estimateResult.timeEstimate.toFixed(1)} hours</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Paint Required</span>
                      <span>{estimateResult.paintCans} gallons</span>
                    </div>
                  </div>
                </div>

                {!user && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800">Login required</h4>
                        <p className="text-sm text-amber-700">
                          You'll need to create an account or login to save this estimate.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                >
                  Back
                </Button>
                <Button
                  className="bg-paint hover:bg-paint-dark px-6"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to create an account to save your estimate and access it later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="bg-secondary/40 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Estimate Summary</h4>
                {tempEstimate?.estimateResult && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Rooms:</span>
                      <span>{tempEstimate.roomDetails.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Estimate:</span>
                      <span>{formatCurrency(tempEstimate.estimateResult.totalCost)}</span>
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
}

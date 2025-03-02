
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { supabase } from "../App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import EstimateCalculator from "@/components/EstimateCalculator";
import { EstimateResult, Lead } from "@/types";
import { House } from "lucide-react";

export default function EstimateForm() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEstimateCalculator, setShowEstimateCalculator] = useState(false);
  const [estimateResult, setEstimateResult] = useState<EstimateResult | null>(null);
  
  const [leadData, setLeadData] = useState<Partial<Lead>>({
    user_id: user?.id,
    name: "",
    email: "",
    phone: "",
    address: "",
    service_type: "interior",
    description: "",
    room_count: 1,
    square_footage: 0,
    status: "new"
  });

  const handleEstimateComplete = async (estimate: EstimateResult) => {
    setEstimateResult(estimate);
    setShowEstimateCalculator(false);
    setStep(3);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLeadData({ ...leadData, [name]: value });
  };

  const handleRadioChange = (value: string) => {
    setLeadData({ ...leadData, service_type: value });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLeadData({ ...leadData, [name]: parseFloat(value) || 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // First create the lead
      const { data: createdLead, error: leadError } = await supabase
        .from("leads")
        .insert([{
          user_id: user?.id,
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          address: leadData.address,
          service_type: leadData.service_type,
          description: leadData.description,
          room_count: leadData.room_count,
          square_footage: leadData.square_footage,
          status: "new"
        }])
        .select("id")
        .single();

      if (leadError) throw leadError;
      
      if (estimateResult && createdLead) {
        // Create estimate record
        const { error: estimateError } = await supabase
          .from("estimates")
          .insert([{
            lead_id: createdLead.id,
            details: {
              roomType: "bedroom", // This would come from the estimator
              roomSize: "medium",
              wallCondition: "good",
              paintType: estimateResult.paintCans > 2 ? "premium" : "standard"
            },
            labor_cost: estimateResult.laborCost,
            material_cost: estimateResult.materialCost,
            total_cost: estimateResult.totalCost,
            estimated_hours: estimateResult.timeEstimate,
            estimated_paint_gallons: estimateResult.paintCans,
            status: "pending"
          }]);

        if (estimateError) throw estimateError;
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
              <div className="flex space-x-2">
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
                Step {step} of 3
              </div>
            </div>
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Tell us about yourself and the painting project
                </CardDescription>
              </CardHeader>
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
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
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-paint hover:bg-paint-dark"
                  >
                    Next Step
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Provide details about your painting project
                </CardDescription>
              </CardHeader>
              <form onSubmit={(e) => { e.preventDefault(); setShowEstimateCalculator(true); }}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="service_type">Service Type</Label>
                    <RadioGroup
                      value={leadData.service_type}
                      onValueChange={handleRadioChange}
                      className="flex flex-col space-y-2 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="interior" id="interior" />
                        <Label htmlFor="interior">Interior Painting</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="exterior" id="exterior" />
                        <Label htmlFor="exterior">Exterior Painting</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="commercial" id="commercial" />
                        <Label htmlFor="commercial">Commercial Painting</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="room_count">Number of Rooms (for interior)</Label>
                    <Input
                      id="room_count"
                      name="room_count"
                      type="number"
                      min="1"
                      value={leadData.room_count}
                      onChange={handleNumberChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="square_footage">Approximate Square Footage</Label>
                    <Input
                      id="square_footage"
                      name="square_footage"
                      type="number"
                      min="0"
                      value={leadData.square_footage}
                      onChange={handleNumberChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Additional Details</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Please provide any other details about your project..."
                      rows={4}
                      value={leadData.description}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    className="bg-paint hover:bg-paint-dark"
                  >
                    Calculate Estimate
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {showEstimateCalculator && (
            <div className="animate-fade-in">
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Detailed Estimator</CardTitle>
                  <CardDescription>
                    Use our estimator to get a detailed breakdown of costs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EstimateCalculator onEstimateComplete={handleEstimateComplete} />
                </CardContent>
              </Card>
            </div>
          )}

          {step === 3 && estimateResult && (
            <Card>
              <CardHeader>
                <CardTitle>Estimate Summary</CardTitle>
                <CardDescription>
                  Review your estimate and submit your request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Estimate Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Labor Cost:</div>
                    <div className="font-medium">${estimateResult.laborCost.toFixed(2)}</div>
                    
                    <div className="text-muted-foreground">Material Cost:</div>
                    <div className="font-medium">${estimateResult.materialCost.toFixed(2)}</div>
                    
                    <div className="text-muted-foreground">Estimated Time:</div>
                    <div className="font-medium">{estimateResult.timeEstimate.toFixed(1)} hours</div>
                    
                    <div className="text-muted-foreground">Paint Required:</div>
                    <div className="font-medium">{estimateResult.paintCans} gallons</div>
                    
                    <div className="border-t pt-2 mt-2 col-span-2"></div>
                    
                    <div className="text-muted-foreground font-medium">Total Cost:</div>
                    <div className="text-paint font-bold text-xl">${estimateResult.totalCost.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-900">
                  <div className="flex items-start">
                    <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full text-green-800 dark:text-green-400 mr-3">
                      <House className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-400">Ready to submit?</h4>
                      <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                        By submitting this request, a painting professional will contact you to discuss your project.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                >
                  Previous
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-paint hover:bg-paint-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

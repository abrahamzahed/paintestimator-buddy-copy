import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Estimate, LineItem, RoomDetail, EstimateResult } from "@/types";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ChevronLeft, FileText, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency } from "@/utils/estimateUtils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EstimateSummary from "@/components/estimator/EstimateSummary";

export default function EstimateDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, signOut } = useSession();
  const { toast } = useToast();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [roomDetails, setRoomDetails] = useState<RoomDetail[]>([]);
  const [roomEstimates, setRoomEstimates] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchEstimateData = async () => {
      try {
        if (!id) return;

        // Fetch estimate
        const { data: estimateData, error: estimateError } = await supabase
          .from("estimates")
          .select("*, projects(name)")
          .eq("id", id)
          .single();

        if (estimateError) throw estimateError;
        
        // Transform the data to match our Estimate interface
        const formattedEstimate: Estimate = {
          ...estimateData,
          project_name: estimateData.projects?.name || "Unknown Project",
          // Make sure to explicitly cast details to our expected type
          details: estimateData.details,
          // Add any missing fields with default values
          notes: estimateData.notes || "",
          discount: estimateData.discount || 0
        };
        
        setEstimate(formattedEstimate);

        // Extract room details if available - Handle type checking properly
        if (formattedEstimate.details && 
            typeof formattedEstimate.details === 'object' && 
            'roomDetails' in formattedEstimate.details) {
          
          // Safely cast to RoomDetail[] with type checking
          const roomDetailsArray = formattedEstimate.details.roomDetails as RoomDetail[];
          if (Array.isArray(roomDetailsArray)) {
            setRoomDetails(roomDetailsArray);
            
            // Create simple room estimate objects based on available data
            const estimates: Record<string, any> = {};
            roomDetailsArray.forEach((room: RoomDetail) => {
              if (room.id) {
                // Create a simple estimate object for each room
                estimates[room.id] = {
                  totalCost: 0, // We don't have individual room costs in the database
                  laborCost: 0,
                  materialCost: 0,
                  additionalCosts: {},
                };
              }
            });
            setRoomEstimates(estimates);
          }
        }

        try {
          // Use the RPC function to get line items for this estimate
          const { data: itemsData, error: itemsError } = await supabase
            .rpc('get_line_items_for_estimate', { estimate_id: id });

          if (!itemsError && itemsData) {
            // Cast the returned data to LineItem[] type
            setLineItems(itemsData as LineItem[]);
          } else {
            console.log("No line items found or error:", itemsError);
            setLineItems([]);
          }
        } catch (error) {
          console.log("Error fetching line items:", error);
          setLineItems([]);
        }

      } catch (error) {
        console.error("Error fetching estimate data:", error);
        toast({
          title: "Error loading estimate",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEstimateData();
  }, [id, toast]);

  if (loading) {
    return (
      <DashboardLayout user={user} profile={profile} signOut={signOut}>
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <p>Loading estimate details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!estimate) {
    return (
      <DashboardLayout user={user} profile={profile} signOut={signOut}>
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Estimate not found</h3>
          <p className="text-muted-foreground mb-6">
            The estimate you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <Link to="/dashboard">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile} signOut={signOut}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/project/${estimate?.project_id}`}>
                <ChevronLeft className="h-4 w-4" />
                Back to Project
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Estimate #{estimate?.id?.substring(0, 8)}</h1>
          </div>
          <div className={`px-3 py-1 rounded text-sm ${
            estimate?.status === "pending" 
              ? "bg-yellow-100 text-yellow-800" 
              : estimate?.status === "approved" 
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}>
            {estimate?.status?.toUpperCase()}
          </div>
        </div>

        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="bg-secondary/20">
            <CardTitle>Estimate Details</CardTitle>
            <CardDescription>Created on {estimate?.created_at ? new Date(estimate.created_at).toLocaleDateString() : 'Unknown date'}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Project Information</h3>
                <p className="text-sm text-muted-foreground mb-1">Project: {estimate?.project_name || "Unknown Project"}</p>
                <p className="text-sm text-muted-foreground">Created: {estimate?.created_at ? new Date(estimate.created_at).toLocaleDateString() : 'Unknown date'}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Cost Summary</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Labor:</span>
                    <span className="text-sm">{formatCurrency(estimate?.labor_cost || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Materials:</span>
                    <span className="text-sm">{formatCurrency(estimate?.material_cost || 0)}</span>
                  </div>
                  {(estimate?.discount || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Discount:</span>
                      <span className="text-sm text-green-600">-{formatCurrency(estimate?.discount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold">{formatCurrency(estimate?.total_cost || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Room details summary */}
            {roomDetails.length > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Rooms ({roomDetails.length})</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowDetailedView(true)}
                  >
                    View Detailed Summary
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {roomDetails.map((room, index) => (
                    <Card key={room.id} className="border">
                      <CardHeader className="py-3 px-4">
                        <CardTitle className="text-base">
                          {room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-sm space-y-1">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-muted-foreground">Dimensions:</div>
                            <div>{room.wallsCount} walls, {room.wallHeight}′ × {room.wallWidth}′</div>
                            
                            <div className="text-muted-foreground">Paint Type:</div>
                            <div>{room.paintType.charAt(0).toUpperCase() + room.paintType.slice(1)}</div>
                            
                            <div className="text-muted-foreground">Wall Condition:</div>
                            <div>{room.condition.charAt(0).toUpperCase() + room.condition.slice(1)}</div>
                          </div>
                          
                          <div className="mt-2 pt-2 border-t">
                            <div className="font-medium mb-1">Additional Options:</div>
                            <ul className="space-y-1">
                              <li className="flex items-center">
                                {room.includeCeiling ? 
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" /> : 
                                  <XCircle className="h-3.5 w-3.5 text-gray-300 mr-1" />}
                                <span>Ceiling</span>
                              </li>
                              <li className="flex items-center">
                                {room.includeBaseboards ? 
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" /> : 
                                  <XCircle className="h-3.5 w-3.5 text-gray-300 mr-1" />}
                                <span>Baseboards {room.includeBaseboards && `(${room.baseboardsMethod})`}</span>
                              </li>
                              <li className="flex items-center">
                                {room.includeCrownMolding ? 
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" /> : 
                                  <XCircle className="h-3.5 w-3.5 text-gray-300 mr-1" />}
                                <span>Crown Molding</span>
                              </li>
                              <li className="flex items-center">
                                {room.hasHighCeiling ? 
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" /> : 
                                  <XCircle className="h-3.5 w-3.5 text-gray-300 mr-1" />}
                                <span>High Ceiling</span>
                              </li>
                              <li className="flex items-center">
                                {room.includeCloset ? 
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" /> : 
                                  <XCircle className="h-3.5 w-3.5 text-gray-300 mr-1" />}
                                <span>Closet</span>
                              </li>
                            </ul>
                          </div>
                          
                          {(room.doorsCount > 0 || room.windowsCount > 0) && (
                            <div className="mt-2 pt-2 border-t grid grid-cols-2 gap-2">
                              {room.doorsCount > 0 && (
                                <>
                                  <div className="text-muted-foreground">Doors:</div>
                                  <div>{room.doorsCount}</div>
                                </>
                              )}
                              {room.windowsCount > 0 && (
                                <>
                                  <div className="text-muted-foreground">Windows:</div>
                                  <div>{room.windowsCount}</div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {lineItems.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Line Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lineItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.unit_price || 0)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency((item.quantity || 0) * (item.unit_price || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {estimate?.notes && (
              <div className="mt-8">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground p-4 bg-gray-50 rounded-md">{estimate.notes}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 border-t">
            <div className="w-full flex justify-between items-center">
              {estimate?.status === "pending" && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Decline</Button>
                  <Button className="bg-green-600 hover:bg-green-700" size="sm">Approve Estimate</Button>
                </div>
              )}
              {estimate?.status === "approved" && (
                <p className="text-sm text-green-600">This estimate has been approved</p>
              )}
              {estimate?.status === "declined" && (
                <p className="text-sm text-red-600">This estimate has been declined</p>
              )}
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Detailed Summary Dialog */}
      <Dialog open={showDetailedView} onOpenChange={setShowDetailedView}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detailed Estimate Summary</DialogTitle>
            <DialogDescription>
              Complete breakdown of your estimate
            </DialogDescription>
          </DialogHeader>
          {estimate && (
            <EstimateSummary
              currentEstimate={{
                totalCost: estimate.total_cost || 0,
                laborCost: estimate.labor_cost || 0,
                materialCost: estimate.material_cost || 0,
                timeEstimate: estimate.estimated_hours || 0,
                paintCans: estimate.estimated_paint_gallons || 0,
                roomPrice: 0,
                additionalCosts: {},
                discounts: estimate.discount ? { volumeDiscount: estimate.discount } : {}
              }}
              rooms={roomDetails}
              roomEstimates={roomEstimates}
              onSubmit={() => {}}
              submitButtonText=""
              isLastStep={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

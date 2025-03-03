import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Estimate, LineItem, RoomDetail, EstimateResult } from "@/types";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import EstimateHeader from "@/components/estimate-detail/EstimateHeader";
import CostSummary from "@/components/estimate-detail/CostSummary";
import RoomDetailsList from "@/components/estimate-detail/RoomDetailsList";
import LineItemsTable from "@/components/estimate-detail/LineItemsTable";
import EstimateFooter from "@/components/estimate-detail/EstimateFooter";
import DetailedSummaryDialog from "@/components/estimate-detail/DetailedSummaryDialog";
import { Button } from "@/components/ui/button";

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
            typeof formattedEstimate.details === 'object') {
          
          // Safely access roomDetails with type checking
          const details = formattedEstimate.details;
          const roomDetailsArray = details && 'roomDetails' in details ? details.roomDetails : null;
          
          if (Array.isArray(roomDetailsArray)) {
            setRoomDetails(roomDetailsArray as RoomDetail[]);
            
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

  const getEstimateResult = (): EstimateResult => {
    if (!estimate) {
      return {
        totalCost: 0,
        laborCost: 0,
        materialCost: 0,
        timeEstimate: 0,
        paintCans: 0,
        roomPrice: 0,
        additionalCosts: {},
        discounts: {},
      };
    }
    
    return {
      totalCost: estimate.total_cost || 0,
      laborCost: estimate.labor_cost || 0,
      materialCost: estimate.material_cost || 0,
      timeEstimate: estimate.estimated_hours || 0,
      paintCans: estimate.estimated_paint_gallons || 0,
      roomPrice: 0, // Required by the EstimateResult type but not used here
      additionalCosts: {},
      discounts: estimate.discount ? { volumeDiscount: estimate.discount } : {}
    };
  };

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
          <Link to="/dashboard">
            <Button>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile} signOut={signOut}>
      <div className="space-y-6">
        <EstimateHeader estimate={estimate} />

        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="bg-secondary/20">
            <CardTitle>Estimate Details</CardTitle>
            <CardDescription>Created on {estimate.created_at ? new Date(estimate.created_at).toLocaleDateString() : 'Unknown date'}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Project Information</h3>
                <p className="text-sm text-muted-foreground mb-1">Project: {estimate.project_name || "Unknown Project"}</p>
                <p className="text-sm text-muted-foreground">Created: {estimate.created_at ? new Date(estimate.created_at).toLocaleDateString() : 'Unknown date'}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Cost Summary</h3>
                <CostSummary estimate={estimate} />
              </div>
            </div>

            {/* Room details summary */}
            {roomDetails.length > 0 && (
              <RoomDetailsList 
                roomDetails={roomDetails} 
                onViewDetailedSummary={() => setShowDetailedView(true)} 
              />
            )}

            <LineItemsTable lineItems={lineItems} />

            {estimate.notes && (
              <div className="mt-8">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground p-4 bg-gray-50 rounded-md">{estimate.notes}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 border-t">
            <EstimateFooter estimate={estimate} />
          </CardFooter>
        </Card>

        {/* Detailed Summary Dialog */}
        <DetailedSummaryDialog
          open={showDetailedView}
          onOpenChange={setShowDetailedView}
          currentEstimate={getEstimateResult()}
          roomDetails={roomDetails}
          roomEstimates={roomEstimates}
        />
      </div>
    </DashboardLayout>
  );
}

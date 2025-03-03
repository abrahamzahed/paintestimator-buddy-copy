
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Estimate, RoomDetail, EstimateResult } from "@/types";
import EstimateCalculator from "@/components/EstimateCalculator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditEstimate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSession();
  const { toast } = useToast();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [roomDetails, setRoomDetails] = useState<RoomDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEstimateData = async () => {
      try {
        if (!id) return;

        const { data: estimateData, error: estimateError } = await supabase
          .from("estimates")
          .select("*, projects(name)")
          .eq("id", id)
          .single();

        if (estimateError) throw estimateError;
        
        // Convert to our Estimate type with proper typing
        const typedEstimate: Estimate = {
          id: estimateData.id,
          lead_id: estimateData.lead_id,
          project_id: estimateData.project_id,
          project_name: estimateData.projects?.name,
          details: estimateData.details,
          labor_cost: estimateData.labor_cost,
          material_cost: estimateData.material_cost,
          total_cost: estimateData.total_cost,
          estimated_hours: estimateData.estimated_hours,
          estimated_paint_gallons: estimateData.estimated_paint_gallons,
          notes: estimateData.notes,
          discount: estimateData.discount,
          status: estimateData.status,
          status_type: estimateData.status_type,
          created_at: estimateData.created_at,
          updated_at: estimateData.updated_at
        };
        
        setEstimate(typedEstimate);

        // Extract room details from the estimate with proper type handling
        if (estimateData.details && 
            typeof estimateData.details === 'object') {
          
          const details = estimateData.details;
          
          // Safely check if roomDetails exists and is an array
          if (details && 'roomDetails' in details && Array.isArray(details.roomDetails)) {
            // Cast properly with type verification
            const roomDetailsArray = details.roomDetails as any[];
            
            // Map the JSON data to the expected RoomDetail type structure
            const typedRoomDetails = roomDetailsArray.map(room => ({
              id: room.id || '',
              roomType: room.roomType || '',
              roomSize: room.roomSize || 'average', // Provide default value
              wallsCount: room.wallsCount || 4,
              wallHeight: room.wallHeight || 8,
              wallWidth: room.wallWidth || 10,
              condition: room.condition || 'good',
              paintType: room.paintType || 'standard',
              includeCeiling: !!room.includeCeiling,
              includeBaseboards: !!room.includeBaseboards,
              baseboardsMethod: room.baseboardsMethod || 'brush',
              includeCrownMolding: !!room.includeCrownMolding,
              hasHighCeiling: !!room.hasHighCeiling,
              includeCloset: !!room.includeCloset,
              isEmptyHouse: !!room.isEmptyHouse,
              needFloorCovering: room.needFloorCovering !== false, // Default to true
              doorsCount: room.doorsCount || 0,
              windowsCount: room.windowsCount || 0
            }));
            
            setRoomDetails(typedRoomDetails);
          }
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

  const handleEstimateUpdate = async (
    updatedEstimate: EstimateResult, 
    updatedRooms: RoomDetail[], 
    roomEstimates: Record<string, any>
  ) => {
    if (!id || !estimate) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare simplified room details for JSON storage
      const simplifiedRoomDetails = updatedRooms.map(room => ({
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
      
      // Update the estimate with new details
      const { error: updateError } = await supabase
        .from("estimates")
        .update({
          details: {
            rooms: updatedRooms.length,
            paintType: updatedEstimate.paintCans > 2 ? "premium" : "standard",
            roomDetails: simplifiedRoomDetails
          },
          labor_cost: updatedEstimate.laborCost,
          material_cost: updatedEstimate.materialCost,
          total_cost: updatedEstimate.totalCost,
          estimated_hours: updatedEstimate.timeEstimate,
          estimated_paint_gallons: updatedEstimate.paintCans,
          // Keep status as is - updating the estimate doesn't change status
          status: estimate.status 
        })
        .eq("id", id);

      if (updateError) throw updateError;
      
      toast({
        title: "Success!",
        description: "Estimate has been updated successfully.",
      });
      
      // Navigate back to the estimate detail page
      navigate(`/estimate/${id}`);
      
    } catch (error: any) {
      console.error("Error updating estimate:", error);
      toast({
        title: "Error updating estimate",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-paint">Paint Pro</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex h-[calc(100vh-64px)] items-center justify-center">
            <p>Loading estimate details...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-paint">Paint Pro</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/estimate/${id}`)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Estimate
            </Button>
            <h2 className="text-2xl font-bold">Edit Estimate</h2>
          </div>

          {estimate && (
            <EstimateCalculator 
              onEstimateComplete={handleEstimateUpdate} 
              initialRoomDetails={roomDetails}
              submitButtonText="Update Estimate"
            />
          )}
        </div>
      </main>
    </div>
  );
}

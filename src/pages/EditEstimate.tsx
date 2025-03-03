import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
        
        setEstimate(estimateData);

        // Extract room details from the estimate
        if (estimateData.details && 
            typeof estimateData.details === 'object') {
          
          const details = estimateData.details;
          const roomDetailsArray = details && 'roomDetails' in details ? details.roomDetails : null;
          
          if (Array.isArray(roomDetailsArray)) {
            setRoomDetails(roomDetailsArray as RoomDetail[]);
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


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Estimate, EstimateResult, RoomDetail } from "@/types";

export const useEstimateUpdate = (estimateId: string | undefined, estimate: Estimate | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEstimateUpdate = async (
    updatedEstimate: EstimateResult, 
    updatedRooms: RoomDetail[], 
    roomEstimates: Record<string, any>
  ) => {
    if (!estimateId || !estimate) return;
    
    setIsSubmitting(true);
    
    try {
      // Extract room data for storage in the details field
      const simplifiedRoomDetails = updatedRooms.map(room => ({
        id: room.id,
        roomType: room.roomType,
        roomSize: room.roomSize,
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
      
      // Check if any rooms have these properties
      const isEmptyHouse = updatedRooms.some(room => room.isEmptyHouse);
      const needsFloorCovering = updatedRooms.some(room => room.needFloorCovering);
      
      // Store the room data and other fields in the details JSONB column
      const { error: updateError } = await supabase
        .from("estimates")
        .update({
          details: {
            rooms: updatedRooms.length,
            paintType: updatedEstimate.paintCans > 2 ? "premium" : "standard",
            roomDetails: simplifiedRoomDetails,
            roomTypes: updatedRooms.map(room => room.roomType),
            roomSizes: updatedRooms.map(room => room.roomSize),
            wallCounts: updatedRooms.map(room => room.wallsCount),
            wallHeights: updatedRooms.map(room => room.wallHeight),
            wallWidths: updatedRooms.map(room => room.wallWidth),
            wallConditions: updatedRooms.map(room => room.condition),
            paintTypes: updatedRooms.map(room => room.paintType),
            includeCeilings: updatedRooms.map(room => room.includeCeiling),
            includeBaseboards: updatedRooms.map(room => room.includeBaseboards),
            baseboardsMethods: updatedRooms.map(room => room.baseboardsMethod),
            includeCrownMoldings: updatedRooms.map(room => room.includeCrownMolding),
            hasHighCeilings: updatedRooms.map(room => room.hasHighCeiling),
            includeClosets: updatedRooms.map(room => room.includeCloset),
            doorsCountPerRoom: updatedRooms.map(room => room.doorsCount),
            windowsCountPerRoom: updatedRooms.map(room => room.windowsCount),
            isEmptyHouse: isEmptyHouse,
            needsFloorCovering: needsFloorCovering
          },
          labor_cost: updatedEstimate.laborCost,
          material_cost: updatedEstimate.materialCost,
          total_cost: updatedEstimate.totalCost,
          estimated_hours: updatedEstimate.timeEstimate,
          estimated_paint_gallons: updatedEstimate.paintCans,
          status: estimate.status
        })
        .eq("id", estimateId);

      if (updateError) throw updateError;
      
      toast({
        title: "Success!",
        description: "Estimate has been updated successfully.",
      });
      
      // Add a delay before navigating to prevent loading issues
      setTimeout(() => {
        navigate(`/estimate/${estimateId}`);
      }, 500);
      
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

  return { handleEstimateUpdate, isSubmitting };
};

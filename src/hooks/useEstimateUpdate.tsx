
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
      const roomTypes = updatedRooms.map(room => room.roomType);
      const roomSizes = updatedRooms.map(room => room.roomSize);
      const wallCounts = updatedRooms.map(room => room.wallsCount);
      const wallHeights = updatedRooms.map(room => room.wallHeight);
      const wallWidths = updatedRooms.map(room => room.wallWidth);
      const wallConditions = updatedRooms.map(room => room.condition);
      const paintTypes = updatedRooms.map(room => room.paintType);
      const includeCeilings = updatedRooms.map(room => room.includeCeiling);
      const includeBaseboards = updatedRooms.map(room => room.includeBaseboards);
      const baseboardsMethods = updatedRooms.map(room => room.baseboardsMethod);
      const includeCrownMoldings = updatedRooms.map(room => room.includeCrownMolding);
      const hasHighCeilings = updatedRooms.map(room => room.hasHighCeiling);
      const includeClosets = updatedRooms.map(room => room.includeCloset);
      const doorsCountPerRoom = updatedRooms.map(room => room.doorsCount);
      const windowsCountPerRoom = updatedRooms.map(room => room.windowsCount);
      
      const isEmptyHouse = updatedRooms.some(room => room.isEmptyHouse);
      const needsFloorCovering = updatedRooms.some(room => room.needFloorCovering);
      
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
          status: estimate.status,
          room_types: roomTypes,
          room_sizes: roomSizes,
          wall_counts: wallCounts,
          wall_heights: wallHeights,
          wall_widths: wallWidths,
          wall_conditions: wallConditions,
          paint_types: paintTypes,
          include_ceilings: includeCeilings,
          include_baseboards: includeBaseboards,
          baseboards_methods: baseboardsMethods, // Fix this field name
          include_crown_moldings: includeCrownMoldings,
          has_high_ceilings: hasHighCeilings,
          include_closets: includeClosets,
          doors_count_per_room: doorsCountPerRoom,
          windows_count_per_room: windowsCountPerRoom,
          is_empty_house: isEmptyHouse,
          needs_floor_covering: needsFloorCovering
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

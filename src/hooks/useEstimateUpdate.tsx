import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Estimate, EstimateResult, RoomDetail } from "@/types";
import { RoomDetails } from "@/types/estimator";

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
      // Convert the rooms to the new format
      const roomsInNewFormat = updatedRooms.map(room => ({
        id: room.id,
        roomTypeId: room.roomTypeId || room.roomType,
        size: room.size || room.roomSize || 'average',
        addons: room.addons || [],
        hasHighCeiling: !!room.hasHighCeiling,
        paintType: room.paintType,
        isEmpty: room.isEmpty || room.isEmptyHouse || false,
        noFloorCovering: room.noFloorCovering || !room.needFloorCovering || false,
        doorPaintingMethod: room.doorPaintingMethod || (room.doorsCount && room.doorsCount > 0 ? 'brush' : 'none'),
        numberOfDoors: room.numberOfDoors || room.doorsCount || 0,
        windowPaintingMethod: room.windowPaintingMethod || (room.windowsCount && room.windowsCount > 0 ? 'brush' : 'none'),
        numberOfWindows: room.numberOfWindows || room.windowsCount || 0,
        fireplaceMethod: room.fireplaceMethod || 'none',
        hasStairRailing: !!room.hasStairRailing,
        twoColors: !!room.twoColors,
        millworkPrimingNeeded: !!room.millworkPrimingNeeded,
        repairs: room.repairs || 'none',
        baseboardInstallationLf: room.baseboardInstallationLf || 0,
        baseboardType: room.baseboardType || (room.includeBaseboards ? room.baseboardsMethod || 'brush' : 'none'),
        walkInClosetCount: room.walkInClosetCount || 0,
        regularClosetCount: room.regularClosetCount || 0
      }));
      
      // Store all data in the details JSONB column
      const detailsObject = {
        rooms: roomsInNewFormat,
        estimateSummary: {
          subtotal: updatedEstimate.totalCost + (updatedEstimate.discounts.volumeDiscount || 0),
          volumeDiscount: updatedEstimate.discounts.volumeDiscount || 0,
          finalTotal: updatedEstimate.totalCost,
          roomCosts: Object.values(roomEstimates).map(roomEstimate => ({
            totalBeforeVolume: roomEstimate.totalCost || 0
          }))
        },
        // Keep userInfo if it exists
        userInfo: estimate.details && typeof estimate.details === 'object' && 'userInfo' in estimate.details 
          ? estimate.details.userInfo 
          : undefined
      };
      
      // Update only the necessary fields in the database
      const { error: updateError } = await supabase
        .from("estimates")
        .update({
          details: detailsObject,
          labor_cost: updatedEstimate.laborCost,
          material_cost: updatedEstimate.materialCost,
          total_cost: updatedEstimate.totalCost,
          estimated_hours: updatedEstimate.timeEstimate,
          estimated_paint_gallons: updatedEstimate.paintCans,
          discount: updatedEstimate.discounts.volumeDiscount || 0,
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
      }, 1200);
      
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

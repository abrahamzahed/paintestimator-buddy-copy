import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/common/hooks/use-toast";
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
      // Convert rooms to a simpler structure that's JSON compatible
      const simplifiedRooms = updatedRooms.map(room => ({
        id: room.id,
        roomTypeId: room.roomTypeId,
        size: room.size,
        addons: room.addons || [],
        hasHighCeiling: !!room.hasHighCeiling,
        paintType: room.paintType || 'standard',
        isEmpty: !!room.isEmpty,
        noFloorCovering: !!room.noFloorCovering,
        doorPaintingMethod: room.doorPaintingMethod || 'none',
        numberOfDoors: room.numberOfDoors || 0,
        windowPaintingMethod: room.windowPaintingMethod || 'none',
        numberOfWindows: room.numberOfWindows || 0,
        fireplaceMethod: room.fireplaceMethod || 'none',
        hasStairRailing: !!room.hasStairRailing,
        twoColors: !!room.twoColors,
        millworkPrimingNeeded: !!room.millworkPrimingNeeded,
        repairs: room.repairs || 'none',
        baseboardInstallationLf: room.baseboardInstallationLf || 0,
        baseboardType: room.baseboardType || 'none',
        walkInClosetCount: room.walkInClosetCount || 0,
        regularClosetCount: room.regularClosetCount || 0
      }));
      
      // Store all data in the details JSONB column
      const detailsObject = {
        rooms: simplifiedRooms,
        estimateSummary: {
          subtotal: updatedEstimate.totalCost + (updatedEstimate.discounts.volumeDiscount || 0),
          volumeDiscount: updatedEstimate.discounts.volumeDiscount || 0,
          finalTotal: updatedEstimate.totalCost,
          roomCosts: Object.values(roomEstimates).map(roomEstimate => ({
            totalBeforeVolume: roomEstimate.totalCost || 0
          }))
        }
      };
      
      // Keep userInfo if it exists in the original estimate
      if (estimate.details && typeof estimate.details === 'object' && 'userInfo' in estimate.details) {
        detailsObject['userInfo'] = estimate.details.userInfo;
      }
      
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

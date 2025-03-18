
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Estimate, RoomDetail } from "@/types";

export const useEstimateData = (estimateId: string | undefined) => {
  const { toast } = useToast();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [roomDetails, setRoomDetails] = useState<RoomDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstimateData = async () => {
      try {
        if (!estimateId) return;

        const { data: estimateData, error: estimateError } = await supabase
          .from("estimates")
          .select("*, projects(name)")
          .eq("id", estimateId)
          .single();

        if (estimateError) throw estimateError;
        
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

        // Extract room details from the JSONB details field
        if (estimateData.details && typeof estimateData.details === 'object') {
          
          const details = estimateData.details;
          
          // Try new format first (FreeEstimator format)
          if (details && 'rooms' in details && Array.isArray(details.rooms)) {
            const roomsArray = details.rooms;
            
            const typedRoomDetails = roomsArray.map((room: any) => ({
              id: room.id || '',
              roomTypeId: room.roomTypeId || '',
              roomType: room.roomTypeId || '', // For backward compatibility
              size: room.size || 'average',
              roomSize: room.size || 'average', // For backward compatibility
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
            
            setRoomDetails(typedRoomDetails);
          }
          // Fallback to legacy format
          else if (details && 'roomDetails' in details && Array.isArray(details.roomDetails)) {
            // Legacy format
            console.log("Using legacy room details format");
            
            const roomDetailsArray = details.roomDetails;
            
            // Convert old format to new format as best as possible
            const typedRoomDetails = roomDetailsArray.map((room: any) => ({
              id: room.id || '',
              roomTypeId: room.roomType || '',
              roomType: room.roomType || '',
              size: room.roomSize || 'average',
              roomSize: room.roomSize || 'average',
              addons: [],
              hasHighCeiling: !!room.hasHighCeiling,
              paintType: room.paintType || 'standard',
              isEmpty: !!room.isEmptyHouse,
              noFloorCovering: !room.needFloorCovering,
              doorPaintingMethod: room.doorsCount > 0 ? 'brush' : 'none',
              numberOfDoors: room.doorsCount || 0,
              windowPaintingMethod: room.windowsCount > 0 ? 'brush' : 'none',
              numberOfWindows: room.windowsCount || 0,
              fireplaceMethod: 'none',
              hasStairRailing: false,
              twoColors: false,
              millworkPrimingNeeded: false,
              repairs: 'none',
              baseboardInstallationLf: 0,
              baseboardType: room.includeBaseboards ? room.baseboardsMethod || 'brush' : 'none',
              walkInClosetCount: room.includeCloset && room.roomType?.toLowerCase().includes('master') ? 1 : 0,
              regularClosetCount: room.includeCloset && !room.roomType?.toLowerCase().includes('master') ? 1 : 0
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
  }, [estimateId, toast]);

  return { estimate, roomDetails, loading };
};

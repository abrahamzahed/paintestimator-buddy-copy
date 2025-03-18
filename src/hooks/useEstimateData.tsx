
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
          
          // Get room details from FreeEstimator format
          if (details && 'rooms' in details && Array.isArray(details.rooms)) {
            const roomsArray = details.rooms;
            
            const typedRoomDetails = roomsArray.map((room: any) => {
              // Create room with new properties first
              const typedRoom: RoomDetail = {
                id: room.id || '',
                roomTypeId: room.roomTypeId || '',
                size: room.size || 'average',
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
                regularClosetCount: room.regularClosetCount || 0,
                
                // Add backward compatibility fields
                roomType: room.roomTypeId || '',
                roomSize: room.size || 'average',
                wallsCount: 4, // Default value
                wallHeight: 8, // Default value
                wallWidth: 10, // Default value
                condition: 'good', // Default value
                includeCeiling: !!room.addons?.includes('ceiling'),
                includeBaseboards: room.baseboardType !== 'none',
                baseboardsMethod: room.baseboardType || 'brush',
                includeCrownMolding: !!room.addons?.includes('crownMolding'),
                includeCloset: room.walkInClosetCount > 0 || room.regularClosetCount > 0,
                isEmptyHouse: !!room.isEmpty,
                needFloorCovering: !room.noFloorCovering,
                doorsCount: room.numberOfDoors || 0,
                windowsCount: room.numberOfWindows || 0
              };
              
              return typedRoom;
            });
            
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

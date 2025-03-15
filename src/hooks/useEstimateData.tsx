
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
        if (estimateData.details && 
            typeof estimateData.details === 'object') {
          
          const details = estimateData.details;
          
          if (details && 'roomDetails' in details && Array.isArray(details.roomDetails)) {
            const roomDetailsArray = details.roomDetails as any[];
            
            const typedRoomDetails = roomDetailsArray.map(room => ({
              id: room.id || '',
              roomType: room.roomType || '',
              roomSize: room.roomSize || 'average',
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
              needFloorCovering: room.needFloorCovering !== false,
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
  }, [estimateId, toast]);

  return { estimate, roomDetails, loading };
};

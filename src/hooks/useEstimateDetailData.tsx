
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Estimate, LineItem, RoomDetail } from "@/types";
import { calculateSingleRoomEstimate } from "@/utils/estimateUtils";

export const useEstimateDetailData = (estimateId: string | undefined) => {
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
        if (!estimateId) return;

        const { data: estimateData, error: estimateError } = await supabase
          .from("estimates")
          .select("*, projects(name)")
          .eq("id", estimateId)
          .single();

        if (estimateError) throw estimateError;
        
        // Skip loading if estimate is deleted
        if (estimateData.status_type === 'deleted') {
          toast({
            title: "Estimate not available",
            description: "This estimate has been deleted",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        const formattedEstimate: Estimate = {
          ...estimateData,
          project_name: estimateData.projects?.name || "Unknown Project",
          details: estimateData.details,
          notes: estimateData.notes || "",
          discount: estimateData.discount || 0,
          status_type: estimateData.status_type || 'active'
        };
        
        setEstimate(formattedEstimate);

        if (formattedEstimate.details && 
            typeof formattedEstimate.details === 'object') {
          
          const details = formattedEstimate.details;
          const roomDetailsArray = details && 'roomDetails' in details ? details.roomDetails : null;
          
          if (Array.isArray(roomDetailsArray)) {
            setRoomDetails(roomDetailsArray as RoomDetail[]);
            
            const estimates: Record<string, any> = {};
            roomDetailsArray.forEach((room: RoomDetail) => {
              if (room.id) {
                // Ensure each room has the correct calculation
                estimates[room.id] = calculateSingleRoomEstimate(room);
              }
            });
            setRoomEstimates(estimates);
          }
        }

        try {
          const { data: itemsData, error: itemsError } = await supabase
            .rpc('get_line_items_for_estimate', { estimate_id: estimateId });

          if (!itemsError && itemsData) {
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
  }, [estimateId, toast]);

  const toggleDetailedView = () => {
    setShowDetailedView(!showDetailedView);
  };

  return {
    estimate,
    lineItems,
    loading,
    showDetailedView,
    roomDetails,
    roomEstimates,
    toggleDetailedView,
    setShowDetailedView
  };
};

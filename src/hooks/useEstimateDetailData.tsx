
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
  const [error, setError] = useState<Error | null>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [roomDetails, setRoomDetails] = useState<RoomDetail[]>([]);
  const [roomEstimates, setRoomEstimates] = useState<Record<string, any>>({});
  const [clientInfo, setClientInfo] = useState({
    name: "Client Name",
    email: "",
    phone: "",
    address: "Client Address"
  });

  useEffect(() => {
    const fetchEstimateData = async () => {
      try {
        if (!estimateId) {
          setError(new Error("No estimate ID provided"));
          setLoading(false);
          return;
        }

        // Fetch estimate data
        const { data: estimateData, error: estimateError } = await supabase
          .from("estimates")
          .select("*, projects(name)")
          .eq("id", estimateId)
          .single();

        if (estimateError) {
          throw estimateError;
        }
        
        // Skip loading if estimate is deleted
        if (estimateData.status_type === 'deleted') {
          toast({
            title: "Estimate not available",
            description: "This estimate has been deleted",
            variant: "destructive",
          });
          setError(new Error("Estimate has been deleted"));
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

        // Fetch client information from the lead if available
        if (formattedEstimate.lead_id) {
          const { data: leadData, error: leadError } = await supabase
            .from("leads")
            .select("name, email, phone, address")
            .eq("id", formattedEstimate.lead_id)
            .single();
            
          if (!leadError && leadData) {
            setClientInfo({
              name: leadData.name || "Client Name",
              email: leadData.email || "",
              phone: leadData.phone || "",
              address: leadData.address || "Client Address"
            });
          }
        }

        // Extract room details from the JSONB details field
        if (formattedEstimate.details && 
            typeof formattedEstimate.details === 'object') {
          
          const details = formattedEstimate.details;
          
          // First try to get client info from details if not already set
          if (details.userInfo) {
            setClientInfo(prevInfo => ({
              name: details.userInfo.name || prevInfo.name,
              email: details.userInfo.email || prevInfo.email,
              phone: details.userInfo.phone || prevInfo.phone,
              address: details.userInfo.address || prevInfo.address
            }));
          }
          
          // Now extract room details
          const roomDetailsArray = details && 'roomDetails' in details ? details.roomDetails : null;
          
          if (Array.isArray(roomDetailsArray)) {
            const typedRoomDetails = roomDetailsArray.map((room: any) => ({
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
            
            const estimates: Record<string, any> = {};
            typedRoomDetails.forEach((room: RoomDetail) => {
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
        setError(error instanceof Error ? error : new Error("Failed to fetch estimate data"));
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
    error,
    showDetailedView,
    roomDetails,
    roomEstimates,
    clientInfo,
    toggleDetailedView,
    setShowDetailedView
  };
};

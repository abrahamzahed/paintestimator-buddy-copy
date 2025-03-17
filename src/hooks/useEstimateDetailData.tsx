
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Estimate, LineItem, RoomDetail } from "@/types";
import { calculateSingleRoomEstimate } from "@/utils/estimateUtils";
import { RoomDetails } from "@/types/estimator";

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
          if (details && typeof details === 'object' && 'userInfo' in details) {
            const userInfo = details.userInfo;
            if (userInfo && typeof userInfo === 'object') {
              setClientInfo(prevInfo => ({
                name: userInfo.name || prevInfo.name,
                email: userInfo.email || prevInfo.email,
                phone: userInfo.phone || prevInfo.phone,
                address: userInfo.address || prevInfo.address
              }));
            }
          }
          
          // Now extract room details - using new FreeEstimator format
          if (details && typeof details === 'object' && 'rooms' in details && Array.isArray(details.rooms)) {
            // New format from FreeEstimator
            const roomsArray = details.rooms as RoomDetails[];
            
            const typedRoomDetails = roomsArray.map(room => ({
              id: room.id,
              roomTypeId: room.roomTypeId,
              roomType: room.roomTypeId, // For backward compatibility
              size: room.size,
              roomSize: room.size, // For backward compatibility
              addons: room.addons || [],
              hasHighCeiling: !!room.hasHighCeiling,
              paintType: room.paintType,
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
            
            const estimates: Record<string, any> = {};
            typedRoomDetails.forEach((room: any) => {
              if (room.id) {
                // Create basic estimates for each room
                estimates[room.id] = {
                  roomPrice: 0,
                  laborCost: 0,
                  materialCost: 0,
                  totalCost: 0,
                  additionalCosts: {},
                  discounts: {}
                };
              }
            });
            setRoomEstimates(estimates);
          }
          // Fallback to old format if new format not found
          else if (details && typeof details === 'object' && 'roomDetails' in details && Array.isArray(details.roomDetails)) {
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
            
            // Create basic estimate data for compatibility
            const estimates: Record<string, any> = {};
            typedRoomDetails.forEach((room: any) => {
              if (room.id) {
                estimates[room.id] = {
                  roomPrice: 0,
                  laborCost: 0,
                  materialCost: 0,
                  totalCost: 0,
                  additionalCosts: {},
                  discounts: {}
                };
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

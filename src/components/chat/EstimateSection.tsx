
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import EstimateCalculator from "../EstimateCalculator";
import { EstimateResult, RoomDetail } from "@/types";
import { useSession } from "@/context/SessionContext";
import { supabase } from "@/integrations/supabase/client";

interface EstimateSectionProps {
  onEstimateComplete: (estimate: EstimateResult) => void;
  onClose: () => void;
  useDynamicEstimator?: boolean;
}

const EstimateSection = ({ 
  onEstimateComplete, 
  onClose,
  useDynamicEstimator = true // Default to the new estimator
}: EstimateSectionProps) => {
  const { profile } = useSession();
  
  const initialUserData = profile ? {
    name: profile.name || undefined,
    email: profile.email || undefined,
    phone: profile.phone || undefined,
  } : undefined;

  // Enhanced handler to save all estimate data
  const handleEstimateComplete = async (
    estimate: EstimateResult, 
    rooms: RoomDetail[], 
    roomEstimates: Record<string, any>
  ) => {
    // Call the parent handler first
    onEstimateComplete(estimate);
    
    try {
      if (profile) {
        // Extract arrays of values from room details
        const roomTypes = rooms.map(room => room.roomType);
        const roomSizes = rooms.map(room => room.roomSize);
        const wallCounts = rooms.map(room => room.wallsCount);
        const wallHeights = rooms.map(room => room.wallHeight);
        const wallWidths = rooms.map(room => room.wallWidth);
        const wallConditions = rooms.map(room => room.condition);
        const paintTypes = rooms.map(room => room.paintType);
        const includeCeilings = rooms.map(room => room.includeCeiling);
        const includeBaseboards = rooms.map(room => room.includeBaseboards);
        const baseboardsMethods = rooms.map(room => room.baseboardsMethod);
        const includeCrownMoldings = rooms.map(room => room.includeCrownMolding);
        const hasHighCeilings = rooms.map(room => room.hasHighCeiling);
        const includeClosets = rooms.map(room => room.includeCloset);
        const doorsCountPerRoom = rooms.map(room => room.doorsCount);
        const windowsCountPerRoom = rooms.map(room => room.windowsCount);
        
        // Check if any rooms have these properties
        const isEmptyHouse = rooms.some(room => room.isEmptyHouse);
        const needsFloorCovering = rooms.some(room => room.needFloorCovering);
        
        // Create a project reference if needed
        const { data: projectData } = await supabase
          .from('projects')
          .insert([
            { 
              name: `Painting Project - ${new Date().toLocaleDateString()}`,
              user_id: profile.id,
              status: 'active'
            }
          ])
          .select()
          .single();
          
        // Create a lead
        const { data: leadData } = await supabase
          .from('leads')
          .insert([
            {
              user_id: profile.id,
              project_id: projectData?.id,
              name: profile.name || '',
              email: profile.email || '',
              phone: profile.phone || '',
              service_type: 'interior',
              room_count: rooms.length,
              status: 'new'
            }
          ])
          .select()
          .single();
          
        // Save all the detailed estimate information
        if (leadData) {
          // Convert RoomDetail to a JSON compatible object
          const simplifiedRoomDetails = rooms.map(room => ({
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
          
          await supabase
            .from('estimates')
            .insert({
              lead_id: leadData.id,
              project_id: projectData?.id,
              labor_cost: estimate.laborCost,
              material_cost: estimate.materialCost,
              total_cost: estimate.totalCost,
              estimated_hours: estimate.timeEstimate,
              estimated_paint_gallons: estimate.paintCans,
              details: {
                rooms: rooms.length,
                roomDetails: simplifiedRoomDetails
              },
              // Save all the new detailed fields
              room_types: roomTypes,
              room_sizes: roomSizes,
              wall_counts: wallCounts,
              wall_heights: wallHeights,
              wall_widths: wallWidths,
              wall_conditions: wallConditions,
              paint_types: paintTypes,
              include_ceilings: includeCeilings,
              include_baseboards: includeBaseboards,
              baseboards_methods: baseboardsMethods,
              include_crown_moldings: includeCrownMoldings,
              has_high_ceilings: hasHighCeilings,
              include_closets: includeClosets,
              doors_count_per_room: doorsCountPerRoom,
              windows_count_per_room: windowsCountPerRoom,
              is_empty_house: isEmptyHouse,
              needs_floor_covering: needsFloorCovering,
              status: 'pending'
            });
        }
      }
    } catch (error) {
      console.error("Error saving detailed estimate data:", error);
    }
  };
  
  return (
    <div className="p-4 border-t">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Estimate Calculator</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <EstimateCalculator 
        onEstimateComplete={handleEstimateComplete} 
        initialUserData={initialUserData}
        useDynamicEstimator={useDynamicEstimator}
      />
    </div>
  );
};

export default EstimateSection;

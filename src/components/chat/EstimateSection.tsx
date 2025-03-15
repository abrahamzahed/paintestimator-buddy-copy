
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
          
          // Create details object for JSONB column
          const detailsObject = {
            rooms: rooms.length,
            roomDetails: simplifiedRoomDetails,
            roomTypes: rooms.map(room => room.roomType),
            roomSizes: rooms.map(room => room.roomSize),
            wallCounts: rooms.map(room => room.wallsCount),
            wallHeights: rooms.map(room => room.wallHeight),
            wallWidths: rooms.map(room => room.wallWidth),
            wallConditions: rooms.map(room => room.condition),
            paintTypes: rooms.map(room => room.paintType),
            includeCeilings: rooms.map(room => room.includeCeiling),
            includeBaseboards: rooms.map(room => room.includeBaseboards),
            baseboardsMethods: rooms.map(room => room.baseboardsMethod),
            includeCrownMoldings: rooms.map(room => room.includeCrownMolding),
            hasHighCeilings: rooms.map(room => room.hasHighCeiling),
            includeClosets: rooms.map(room => room.includeCloset),
            doorsCountPerRoom: rooms.map(room => room.doorsCount),
            windowsCountPerRoom: rooms.map(room => room.windowsCount),
            isEmptyHouse: rooms.some(room => room.isEmptyHouse),
            needsFloorCovering: rooms.some(room => room.needFloorCovering)
          };
          
          // Insert estimate with all details in the JSONB column
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
              details: detailsObject,
              status: 'pending'
            });
        }
      } else {
        // For guest users who are not signed in yet
        console.log("Guest user, skipping data persistence to database");
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

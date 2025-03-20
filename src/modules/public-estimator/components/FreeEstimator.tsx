
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoomDetail, EstimateResult } from "@/types";
import EstimateCalculator from "./EstimateCalculator";
import LeadCaptureForm from "@/components/estimator/LeadCaptureForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/common/hooks/use-toast";

interface FreeEstimatorProps {
  isAuthenticated?: boolean;
}

const FreeEstimator = ({ isAuthenticated = false }: FreeEstimatorProps) => {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [estimateData, setEstimateData] = useState<{
    estimate: EstimateResult;
    rooms: RoomDetail[];
    roomEstimates: Record<string, any>;
  } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEstimateComplete = (
    estimate: EstimateResult, 
    rooms: RoomDetail[], 
    roomEstimates: Record<string, any>
  ) => {
    // Save the estimate data for when the lead form is submitted
    setEstimateData({ estimate, rooms, roomEstimates });
    setShowLeadForm(true);
  };

  const handleLeadSubmit = async (userData: {
    name: string;
    email: string;
    phone: string;
    address: string;
  }) => {
    if (!estimateData) return;
    
    setIsSubmitting(true);
    
    try {
      // Save user lead info & estimate
      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .insert([{
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          details: JSON.stringify(estimateData.rooms),
          status: "new"
        }])
        .select();
      
      if (leadError) throw leadError;
      
      if (leadData && leadData.length > 0) {
        const leadId = leadData[0].id;
        
        const { error: estimateError } = await supabase
          .from("estimates")
          .insert([{
            lead_id: leadId,
            labor_cost: estimateData.estimate.laborCost,
            material_cost: estimateData.estimate.materialCost,
            total_cost: estimateData.estimate.totalCost,
            estimated_hours: estimateData.estimate.timeEstimate,
            estimated_paint_gallons: estimateData.estimate.paintCans,
            discount: estimateData.estimate.discounts.volumeDiscount || 0,
            details: {
              rooms: estimateData.rooms,
              userInfo: userData,
              estimateSummary: {
                subtotal: estimateData.estimate.totalCost + (estimateData.estimate.discounts.volumeDiscount || 0),
                volumeDiscount: estimateData.estimate.discounts.volumeDiscount || 0,
                finalTotal: estimateData.estimate.totalCost,
                roomCosts: Object.values(estimateData.roomEstimates).map(roomEstimate => ({
                  totalBeforeVolume: roomEstimate.totalCost || 0
                }))
              }
            }
          }]);
        
        if (estimateError) throw estimateError;
        
        toast({
          title: "Estimate submitted!",
          description: "We've received your estimate request and will contact you soon.",
        });
        
        // Redirect to thank you page or clear form for new estimate
        navigate("/thank-you");
      }
    } catch (error: any) {
      console.error("Error submitting estimate:", error);
      toast({
        title: "Error submitting estimate",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showLeadForm && estimateData) {
    return (
      <LeadCaptureForm 
        estimate={estimateData.estimate}
        onSubmit={handleLeadSubmit}
        isSubmitting={isSubmitting}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  return (
    <EstimateCalculator 
      onEstimateComplete={handleEstimateComplete}
      useDynamicEstimator={true}
    />
  );
};

export default FreeEstimator;

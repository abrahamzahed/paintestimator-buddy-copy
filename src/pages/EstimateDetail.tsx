
import { useParams } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { EstimateResult } from "@/types";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LoadingState from "@/components/estimate/LoadingState";
import EstimateNotFound from "@/components/estimate/EstimateNotFound";
import EstimateContent from "@/components/estimate/EstimateContent";
import { useEstimateDetailData } from "@/hooks/useEstimateDetailData";

export default function EstimateDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, signOut } = useSession();
  const { 
    estimate, 
    lineItems, 
    loading, 
    showDetailedView, 
    roomDetails, 
    roomEstimates,
    setShowDetailedView 
  } = useEstimateDetailData(id);

  const getEstimateResult = (): EstimateResult => {
    if (!estimate) {
      return {
        totalCost: 0,
        laborCost: 0,
        materialCost: 0,
        timeEstimate: 0,
        paintCans: 0,
        roomPrice: 0,
        additionalCosts: {},
        discounts: {},
      };
    }
    
    // Calculate the sum of all room costs to verify the total
    const totalRoomCosts = Object.values(roomEstimates).reduce(
      (sum, est: any) => sum + (est.totalCost || 0), 0
    );
    
    // If our calculated total differs significantly from the stored total,
    // use the calculated one for better accuracy
    const storedTotal = estimate.total_cost || 0;
    const finalTotal = Math.abs(storedTotal - totalRoomCosts) > 10 ? 
      totalRoomCosts : storedTotal;
    
    return {
      totalCost: finalTotal,
      laborCost: estimate.labor_cost || 0,
      materialCost: estimate.material_cost || 0,
      timeEstimate: estimate.estimated_hours || 0,
      paintCans: estimate.estimated_paint_gallons || 0,
      roomPrice: 0,
      additionalCosts: {},
      discounts: estimate.discount ? { volumeDiscount: estimate.discount } : {}
    };
  };

  if (loading) {
    return (
      <DashboardLayout user={user} profile={profile} signOut={signOut}>
        <LoadingState />
      </DashboardLayout>
    );
  }

  if (!estimate) {
    return (
      <DashboardLayout user={user} profile={profile} signOut={signOut}>
        <EstimateNotFound />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile} signOut={signOut}>
      <EstimateContent
        estimate={estimate}
        lineItems={lineItems}
        roomDetails={roomDetails}
        roomEstimates={roomEstimates}
        showDetailedView={showDetailedView}
        setShowDetailedView={setShowDetailedView}
        getEstimateResult={getEstimateResult}
      />
    </DashboardLayout>
  );
}

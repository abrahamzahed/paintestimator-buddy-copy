
import { useParams } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import EstimateCalculator from "@/components/EstimateCalculator";
import LoadingState from "@/components/estimate/LoadingState";
import EditEstimateHeader from "@/components/estimate/EditEstimateHeader";
import EstimatePageLayout from "@/components/estimate/EstimatePageLayout";
import { useEstimateData } from "@/hooks/useEstimateData";
import { useEstimateUpdate } from "@/hooks/useEstimateUpdate";

export default function EditEstimate() {
  const { id } = useParams<{ id: string }>();
  const { user } = useSession();
  
  // Use the custom hooks to fetch data and handle updates
  const { estimate, roomDetails, loading } = useEstimateData(id);
  const { handleEstimateUpdate, isSubmitting } = useEstimateUpdate(id, estimate);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <EstimatePageLayout>
      <EditEstimateHeader estimateId={id || ''} />

      {estimate && (
        <EstimateCalculator 
          onEstimateComplete={handleEstimateUpdate} 
          initialRoomDetails={roomDetails}
          submitButtonText="Update Estimate"
        />
      )}
    </EstimatePageLayout>
  );
}

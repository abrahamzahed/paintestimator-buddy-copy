
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSession } from "@/context/use-session";
import EstimateCalculator from "@/components/EstimateCalculator";
import LoadingState from "@/components/estimate/LoadingState";
import EditEstimateHeader from "@/components/estimate/EditEstimateHeader";
import EstimatePageLayout from "@/components/estimate/EstimatePageLayout";
import { useEstimateData } from "@/hooks/useEstimateData";
import { useEstimateUpdate } from "@/hooks/useEstimateUpdate";
import { RoomDetail } from "@/types";

export default function EditEstimate() {
  const { id } = useParams<{ id: string }>();
  const { user } = useSession();
  const [step, setStep] = useState(1);
  
  // Use the custom hooks to fetch data and handle updates
  const { estimate, roomDetails, loading } = useEstimateData(id);
  const { handleEstimateUpdate, isSubmitting } = useEstimateUpdate(id, estimate);

  // Initialize room details from fetched data
  const [initialRoomDetails, setInitialRoomDetails] = useState<RoomDetail[]>([]);
  
  useEffect(() => {
    if (roomDetails.length > 0) {
      setInitialRoomDetails(roomDetails);
    }
  }, [roomDetails]);

  if (loading) {
    return <LoadingState />;
  }

  const handleStepChange = (newStep: number) => {
    setStep(newStep);
  };

  return (
    <EstimatePageLayout>
      <EditEstimateHeader estimateId={id || ''} />

      {estimate && (
        <EstimateCalculator 
          onEstimateComplete={handleEstimateUpdate} 
          initialRoomDetails={initialRoomDetails}
          submitButtonText="Update Estimate"
          isEditMode={true}
          currentStep={step}
          onStepChange={handleStepChange}
        />
      )}
    </EstimatePageLayout>
  );
}

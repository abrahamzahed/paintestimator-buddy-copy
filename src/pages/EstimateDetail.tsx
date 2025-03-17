
import React from "react";
import { useParams } from "react-router-dom";
import { useEstimateDetailData } from "@/hooks/useEstimateDetailData";
import EstimatePageLayout from "@/components/estimate/EstimatePageLayout";
import LoadingState from "@/components/estimate/LoadingState";
import EstimateNotFound from "@/components/estimate/EstimateNotFound";
import FreeEstimatorSummary from "@/components/estimate/FreeEstimatorSummary";

export default function EstimateDetail() {
  const { id } = useParams<{ id: string }>();
  const { 
    estimate, 
    roomDetails, 
    loading, 
    error
  } = useEstimateDetailData(id);

  if (loading) {
    return (
      <EstimatePageLayout>
        <LoadingState />
      </EstimatePageLayout>
    );
  }

  if (!estimate || error) {
    return (
      <EstimatePageLayout>
        <EstimateNotFound />
      </EstimatePageLayout>
    );
  }

  // Extract client information from the estimate or related data
  let clientName = "Client Name";
  let clientAddress = "Client Address";
  
  if (estimate.details && typeof estimate.details === 'object') {
    // Try to get client info from details
    const details = estimate.details;
    if (details.userInfo) {
      clientName = details.userInfo.name || clientName;
      clientAddress = details.userInfo.address || clientAddress;
    }
  }

  return (
    <EstimatePageLayout>
      <FreeEstimatorSummary
        estimate={estimate}
        roomDetails={roomDetails}
        projectName={estimate.project_name || "Painting Project"}
        clientName={clientName}
        clientAddress={clientAddress}
      />
    </EstimatePageLayout>
  );
}

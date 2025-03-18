
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEstimateDetailData } from "@/hooks/useEstimateDetailData";
import EstimatePageLayout from "@/components/estimate/EstimatePageLayout";
import LoadingState from "@/components/estimate/LoadingState";
import EstimateNotFound from "@/components/estimate/EstimateNotFound";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProjectDetailsSection from "@/components/estimate-detail/ProjectDetailsSection";
import EstimateActionButtons from "@/components/estimate-detail/EstimateActionButtons";
import EstimateHeader from "@/components/estimate-detail/EstimateHeader";
import EstimateConfirmation from "@/components/estimate-detail/EstimateConfirmation";
import EstimateDialogs from "@/components/estimate-detail/EstimateDialogs";

export default function EstimateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    estimate, 
    roomDetails, 
    loading, 
    error,
    clientInfo,
    roomEstimates
  } = useEstimateDetailData(id);

  const [showDetailedView, setShowDetailedView] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditOptions, setShowEditOptions] = useState(false);

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

  const handleBack = () => {
    navigate(-1);
  };
  
  const handleDashboard = () => {
    navigate('/dashboard');
  };
  
  const handleHome = () => {
    navigate('/');
  };

  const handleEditClick = () => {
    setShowEditOptions(true);
  };

  const handleEditEstimate = () => {
    navigate(`/estimate/edit/${estimate.id}?step=2`);
    setShowEditOptions(false);
  };

  const handleDeleteEstimate = async () => {
    if (!estimate.id) return;
    
    setIsDeleting(true);
    
    try {
      const { error: estimateError } = await supabase
        .from("estimates")
        .update({ status_type: 'deleted' })
        .eq("id", estimate.id);
        
      if (estimateError) throw estimateError;
      
      toast({
        title: "Estimate deleted",
        description: "The estimate has been successfully deleted.",
      });
      
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      
      setTimeout(() => {
        if (estimate.project_id) {
          navigate(`/project/${estimate.project_id}`);
        } else {
          navigate("/dashboard");
        }
      }, 1200);
      
    } catch (error: any) {
      console.error("Error deleting estimate:", error);
      toast({
        title: "Error deleting estimate",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const getEstimateResult = () => {
    return {
      roomPrice: estimate.total_cost * 0.85,
      laborCost: estimate.labor_cost || 0,
      materialCost: estimate.material_cost || 0,
      totalCost: estimate.total_cost || 0,
      timeEstimate: estimate.estimated_hours || 0,
      paintCans: estimate.estimated_paint_gallons || 0,
      additionalCosts: {},
      discounts: { volumeDiscount: estimate.discount || 0 }
    };
  };

  const projectName = estimate.project_name || "Painting Project";
  const clientName = clientInfo.name || "Client Name";
  const clientAddress = clientInfo.address || "Client Address";

  return (
    <EstimatePageLayout>
      <div className="space-y-6 animate-fade-in">
        <EstimateHeader 
          onBack={handleBack}
          onShowDetailedView={() => setShowDetailedView(true)}
        />
        
        <EstimateConfirmation 
          estimateId={estimate.id || ''}
        />
        
        <ProjectDetailsSection 
          projectName={projectName}
          clientName={clientName}
          clientAddress={clientAddress}
          roomCount={roomDetails.length}
          estimate={estimate}
        />
        
        <EstimateActionButtons 
          onHome={handleHome}
          onDashboard={handleDashboard}
          onEdit={handleEditClick}
        />
        
        <EstimateDialogs
          showDetailedView={showDetailedView}
          setShowDetailedView={setShowDetailedView}
          showEditOptions={showEditOptions}
          setShowEditOptions={setShowEditOptions}
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          onEditEstimate={handleEditEstimate}
          onDeleteEstimate={handleDeleteEstimate}
          isDeleting={isDeleting}
          currentEstimate={getEstimateResult()}
          roomDetails={roomDetails}
          roomEstimates={roomEstimates}
        />
      </div>
    </EstimatePageLayout>
  );
}

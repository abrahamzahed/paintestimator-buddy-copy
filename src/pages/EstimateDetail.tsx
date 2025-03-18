
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEstimateDetailData } from "@/hooks/useEstimateDetailData";
import EstimatePageLayout from "@/components/estimate/EstimatePageLayout";
import LoadingState from "@/components/estimate/LoadingState";
import EstimateNotFound from "@/components/estimate/EstimateNotFound";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DetailedSummaryDialog from "@/components/estimate-detail/DetailedSummaryDialog";
import ProjectDetailsSection from "@/components/estimate-detail/ProjectDetailsSection";
import EstimateCostSummary from "@/components/estimate-detail/EstimateCostSummary";
import EditOptionsDialog from "@/components/estimate-detail/EditOptionsDialog";
import DeleteConfirmationDialog from "@/components/estimate-detail/DeleteConfirmationDialog";
import EstimateActionButtons from "@/components/estimate-detail/EstimateActionButtons";

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
    // Navigate to the edit page and pass the estimate ID
    navigate(`/estimate/edit/${estimate.id}?step=2`);
    setShowEditOptions(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
    setShowEditOptions(false);
  };

  const handleDeleteEstimate = async () => {
    if (!estimate.id) return;
    
    setIsDeleting(true);
    
    try {
      // Instead of deleting, update the status_type to 'deleted'
      const { error: estimateError } = await supabase
        .from("estimates")
        .update({ status_type: 'deleted' })
        .eq("id", estimate.id);
        
      if (estimateError) throw estimateError;
      
      toast({
        title: "Estimate deleted",
        description: "The estimate has been successfully deleted.",
      });
      
      // Update UI state first
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      
      // Add a short delay before navigating to prevent loading issues
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

  // Get client information from either clientInfo state or estimate details
  const projectName = estimate.project_name || "Painting Project";
  const clientName = clientInfo.name || "Client Name";
  const clientAddress = clientInfo.address || "Client Address";
  
  // Extract volume discount from the estimate details if available
  const volumeDiscount = estimate.details && 
    typeof estimate.details === 'object' && 
    'estimateSummary' in estimate.details && 
    estimate.details.estimateSummary?.volumeDiscount || estimate.discount || 0;

  return (
    <EstimatePageLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBack}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetailedView(true)}
              className="flex items-center"
            >
              <Printer className="mr-2 h-4 w-4" /> Print Details
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-center text-green-500 mb-4">
          <CheckCircle className="h-16 w-16" />
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Estimate #{estimate.id?.substring(0, 8)}</h1>
          <p className="text-muted-foreground">
            Your painting estimate has been saved and is ready for review.
          </p>
        </div>
        
        <ProjectDetailsSection 
          projectName={projectName}
          clientName={clientName}
          clientAddress={clientAddress}
          roomCount={roomDetails.length}
        />
        
        <EstimateCostSummary 
          laborCost={estimate.labor_cost || 0}
          materialCost={estimate.material_cost || 0}
          paintGallons={estimate.estimated_paint_gallons || 0}
          estimatedHours={estimate.estimated_hours || 0}
          roomDetails={roomDetails}
          roomEstimates={roomEstimates}
          volumeDiscount={volumeDiscount}
          totalCost={estimate.total_cost || 0}
        />
        
        <EstimateActionButtons 
          onHome={handleHome}
          onDashboard={handleDashboard}
          onEdit={handleEditClick}
        />
        
        <DetailedSummaryDialog
          open={showDetailedView}
          onOpenChange={setShowDetailedView}
          currentEstimate={getEstimateResult()}
          roomDetails={roomDetails}
          roomEstimates={roomEstimates}
        />
        
        <EditOptionsDialog
          open={showEditOptions}
          onOpenChange={setShowEditOptions}
          onEditEstimate={handleEditEstimate}
          onDeleteClick={handleDeleteClick}
        />
        
        <DeleteConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onDeleteEstimate={handleDeleteEstimate}
          isDeleting={isDeleting}
        />
      </div>
    </EstimatePageLayout>
  );
}

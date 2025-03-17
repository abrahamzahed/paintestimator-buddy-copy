
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEstimateDetailData } from "@/hooks/useEstimateDetailData";
import EstimatePageLayout from "@/components/estimate/EstimatePageLayout";
import LoadingState from "@/components/estimate/LoadingState";
import EstimateNotFound from "@/components/estimate/EstimateNotFound";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  CheckCircle, 
  Printer, 
  Home, 
  LayoutDashboard, 
  Edit,
  Trash2 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/estimateUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DetailedSummaryDialog from "@/components/estimate-detail/DetailedSummaryDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
        
        <div className="bg-secondary/30 p-6 rounded-lg">
          <h4 className="font-medium mb-4">Project Details</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project Name:</span>
              <span className="font-medium">{projectName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contact:</span>
              <span className="font-medium">{clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Address:</span>
              <span className="font-medium">{clientAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rooms:</span>
              <span className="font-medium">{roomDetails.length}</span>
            </div>
          </div>
        </div>
        
        <Card className="border">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Labor</p>
                <p className="font-semibold">{formatCurrency(estimate.labor_cost || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Materials</p>
                <p className="font-semibold">{formatCurrency(estimate.material_cost || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Paint</p>
                <p className="font-semibold">{estimate.estimated_paint_gallons || 0} gallons</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Time</p>
                <p className="font-semibold">{(estimate.estimated_hours || 0).toFixed(1)} hours</p>
              </div>
            </div>
            
            <div className="border-t mt-3 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal</span>
                <span className="font-medium">{formatCurrency((estimate.total_cost || 0) + (estimate.discount || 0))}</span>
              </div>
              
              {estimate.discount > 0 && (
                <div className="flex justify-between items-center mt-1 text-green-600">
                  <span className="font-medium">Discount</span>
                  <span className="font-medium">-{formatCurrency(estimate.discount || 0)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-3 pt-3 border-t">
                <span className="font-bold">Total Cost</span>
                <span className="font-bold text-xl text-paint">{formatCurrency(estimate.total_cost || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          {roomDetails.map((room, index) => (
            <Card key={room.id || index} className="border flex-1">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">{room.roomType}</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span>{room.roomSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Walls:</span>
                    <span>{room.wallsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paint Type:</span>
                    <span>{room.paintType}</span>
                  </div>
                  {room.includeCeiling && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ceiling:</span>
                      <span>Included</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="border-t pt-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline"
              onClick={handleHome}
              className="flex items-center"
            >
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Button>
            
            <Button 
              className="bg-paint hover:bg-paint-dark flex items-center"
              onClick={handleDashboard}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleEditClick}
              className="flex items-center"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
        
        <DetailedSummaryDialog
          open={showDetailedView}
          onOpenChange={setShowDetailedView}
          currentEstimate={getEstimateResult()}
          roomDetails={roomDetails}
          roomEstimates={roomEstimates}
        />
        
        {/* Edit options dialog */}
        <Dialog open={showEditOptions} onOpenChange={setShowEditOptions}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Options</DialogTitle>
              <DialogDescription>
                Choose what you want to do with this estimate.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <Button 
                onClick={handleEditEstimate}
                className="flex items-center justify-center"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Estimate
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={handleDeleteClick}
                className="flex items-center justify-center"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Estimate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Delete confirmation dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Estimate</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this estimate? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteEstimate}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </EstimatePageLayout>
  );
}

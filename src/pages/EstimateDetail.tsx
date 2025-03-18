
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
  
  // Extract volume discount from the estimate details if available
  const volumeDiscount = estimate.details && 
    typeof estimate.details === 'object' && 
    'estimateSummary' in estimate.details && 
    estimate.details.estimateSummary?.volumeDiscount || estimate.discount || 0;

  // Calculate subtotal (total plus discount)
  const subtotal = estimate.total_cost + volumeDiscount;

  // Get room type name for display
  const getRoomTypeName = (roomTypeId: string) => {
    return roomTypeId.charAt(0).toUpperCase() + roomTypeId.slice(1);
  };

  // Helper function to get individual room cost
  const getRoomCost = (roomId: string) => {
    const roomEstimate = roomEstimates[roomId];
    return roomEstimate?.totalCost || 0;
  };

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
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Current Estimate:</h4>
                <span className="text-xl font-bold text-blue-600">{formatCurrency(estimate.total_cost || 0)}</span>
              </div>
              
              <h5 className="text-sm font-medium mt-6 mb-2">Rooms breakdown:</h5>
              
              {roomDetails.map((room, index) => {
                const roomCost = getRoomCost(room.id);
                const roomType = room.roomTypeId;
                
                return (
                  <div key={room.id} className="border-t py-4">
                    <div className="flex justify-between mb-2">
                      <h6 className="font-medium">
                        {getRoomTypeName(roomType)} (Room {index + 1})
                      </h6>
                      <span className="font-medium">{formatCurrency(roomCost)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{room.size.charAt(0).toUpperCase() + room.size.slice(1)}</span>
                      
                      <span className="text-muted-foreground">Paint Type:</span>
                      <span>{room.paintType.charAt(0).toUpperCase() + room.paintType.slice(1)}</span>
                      
                      {room.hasHighCeiling && (
                        <>
                          <span className="text-muted-foreground">Ceiling:</span>
                          <span>High ceiling</span>
                        </>
                      )}
                      
                      {room.twoColors && (
                        <>
                          <span className="text-muted-foreground">Wall Colors:</span>
                          <span>Two colors</span>
                        </>
                      )}
                      
                      {(room.regularClosetCount > 0 || room.walkInClosetCount > 0) && (
                        <>
                          <span className="text-muted-foreground">Closets:</span>
                          <span>
                            {room.walkInClosetCount > 0 && `${room.walkInClosetCount} walk-in`}
                            {room.walkInClosetCount > 0 && room.regularClosetCount > 0 && ', '}
                            {room.regularClosetCount > 0 && `${room.regularClosetCount} regular`}
                          </span>
                        </>
                      )}
                      
                      {room.doorPaintingMethod && room.doorPaintingMethod !== 'none' && (
                        <>
                          <span className="text-muted-foreground">Doors:</span>
                          <span>{room.numberOfDoors} doors ({room.doorPaintingMethod})</span>
                        </>
                      )}
                      
                      {room.windowPaintingMethod && room.windowPaintingMethod !== 'none' && (
                        <>
                          <span className="text-muted-foreground">Windows:</span>
                          <span>{room.numberOfWindows} windows ({room.windowPaintingMethod})</span>
                        </>
                      )}
                      
                      {room.fireplaceMethod && room.fireplaceMethod !== 'none' && (
                        <>
                          <span className="text-muted-foreground">Fireplace:</span>
                          <span>{room.fireplaceMethod.charAt(0).toUpperCase() + room.fireplaceMethod.slice(1)} painting</span>
                        </>
                      )}
                      
                      {room.repairs && room.repairs !== 'none' && (
                        <>
                          <span className="text-muted-foreground">Repairs:</span>
                          <span>{room.repairs.charAt(0).toUpperCase() + room.repairs.slice(1)}</span>
                        </>
                      )}
                      
                      {room.hasStairRailing && (
                        <>
                          <span className="text-muted-foreground">Stair Railing:</span>
                          <span>Included</span>
                        </>
                      )}
                      
                      {room.baseboardType && room.baseboardType !== 'none' && (
                        <>
                          <span className="text-muted-foreground">Baseboards:</span>
                          <span>{room.baseboardType.charAt(0).toUpperCase() + room.baseboardType.slice(1)} application</span>
                        </>
                      )}
                      
                      {room.baseboardInstallationLf > 0 && (
                        <>
                          <span className="text-muted-foreground">Baseboard Installation:</span>
                          <span>{room.baseboardInstallationLf} linear feet</span>
                        </>
                      )}
                      
                      {room.millworkPrimingNeeded && (
                        <>
                          <span className="text-muted-foreground">Millwork Priming:</span>
                          <span>Included</span>
                        </>
                      )}
                      
                      {room.isEmpty && (
                        <>
                          <span className="text-muted-foreground">Empty Room:</span>
                          <span>Yes (Discounted)</span>
                        </>
                      )}
                      
                      {room.noFloorCovering && (
                        <>
                          <span className="text-muted-foreground">No Floor Covering:</span>
                          <span>Yes (Discounted)</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {volumeDiscount > 0 && (
                <div className="flex justify-between text-green-600 border-t pt-3 mt-3">
                  <span className="font-medium">Volume Discount:</span>
                  <span className="font-medium">-{formatCurrency(volumeDiscount)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center border-t pt-4 mt-4">
                <span className="font-bold">Total Cost</span>
                <span className="font-bold text-xl text-blue-600">{formatCurrency(estimate.total_cost || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
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


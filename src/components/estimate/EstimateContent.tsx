
import React from "react";
import { Estimate, LineItem, RoomDetail, EstimateResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import EstimateHeader from "@/components/estimate-detail/EstimateHeader";
import RoomDetailsList from "@/components/estimate-detail/RoomDetailsList";
import LineItemsTable from "@/components/estimate-detail/LineItemsTable";
import EstimateFooter from "@/components/estimate-detail/EstimateFooter";
import DetailedSummaryDialog from "@/components/estimate-detail/DetailedSummaryDialog";
import EstimateSummary from "@/components/estimator/EstimateSummary";

interface EstimateContentProps {
  estimate: Estimate;
  lineItems: LineItem[];
  roomDetails: RoomDetail[];
  roomEstimates: Record<string, any>;
  showDetailedView: boolean;
  setShowDetailedView: (show: boolean) => void;
  getEstimateResult: () => EstimateResult;
}

const EstimateContent = ({
  estimate,
  lineItems,
  roomDetails,
  roomEstimates,
  showDetailedView,
  setShowDetailedView,
  getEstimateResult
}: EstimateContentProps) => {
  // Calculate total costs and discount for the RoomDetailsList component
  const calculateTotals = () => {
    const totalRoomCosts = Object.values(roomEstimates).reduce(
      (sum, roomEst: any) => sum + (roomEst.totalCost || 0), 0
    );
    
    const discountAmount = estimate.discount || 0;
    const calculatedTotal = Math.max(totalRoomCosts - discountAmount, 0);
    
    return {
      totalRoomCosts,
      discountAmount,
      calculatedTotal
    };
  };

  const { totalRoomCosts, discountAmount, calculatedTotal } = calculateTotals();

  // Use the exact same EstimateResult format that was shown to the customer initially
  const estimateResult = getEstimateResult();

  return (
    <div className="space-y-6">
      <EstimateHeader 
        onBack={() => {}} 
        onShowDetailedView={() => setShowDetailedView(true)} 
      />

      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="bg-secondary/20">
          <CardTitle>Estimate Details</CardTitle>
          <CardDescription>Created on {estimate.created_at ? new Date(estimate.created_at).toLocaleDateString() : 'Unknown date'}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Project Information</h3>
              <p className="text-sm text-muted-foreground mb-1">Project: {estimate.project_name || "Unknown Project"}</p>
              <p className="text-sm text-muted-foreground">Created: {estimate.created_at ? new Date(estimate.created_at).toLocaleDateString() : 'Unknown date'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Cost Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Labor Cost:</span>
                  <span>${estimate.labor_cost?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Material Cost:</span>
                  <span>${estimate.material_cost?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Paint Required:</span>
                  <span>{estimate.estimated_paint_gallons || 0} gallons</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estimated Time:</span>
                  <span>{estimate.estimated_hours?.toFixed(1) || 0} hours</span>
                </div>
                
                {estimate.discount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Volume Discount:</span>
                    <span>-${estimate.discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t my-2"></div>
                
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total Cost:</span>
                  <span className="text-paint">${estimate.total_cost?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>

          {roomDetails.length > 0 && (
            <RoomDetailsList 
              roomDetails={roomDetails}
              roomEstimates={roomEstimates}
              discountAmount={discountAmount}
              calculatedTotal={calculatedTotal}
              onViewDetailedSummary={() => setShowDetailedView(true)} 
            />
          )}

          <LineItemsTable lineItems={lineItems} />

          {estimate.notes && (
            <div className="mt-8">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground p-4 bg-gray-50 rounded-md">{estimate.notes}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 border-t">
          <EstimateFooter estimate={estimate} />
        </CardFooter>
      </Card>

      <DetailedSummaryDialog
        open={showDetailedView}
        onOpenChange={setShowDetailedView}
        currentEstimate={estimateResult}
        roomDetails={roomDetails}
        roomEstimates={roomEstimates}
      />
    </div>
  );
};

export default EstimateContent;

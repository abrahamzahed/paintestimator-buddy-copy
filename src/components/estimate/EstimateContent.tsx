
import React from "react";
import { Estimate, LineItem, RoomDetail, EstimateResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import EstimateHeader from "@/components/estimate-detail/EstimateHeader";
import CostSummary from "@/components/estimate-detail/CostSummary";
import RoomDetailsList from "@/components/estimate-detail/RoomDetailsList";
import LineItemsTable from "@/components/estimate-detail/LineItemsTable";
import EstimateFooter from "@/components/estimate-detail/EstimateFooter";
import DetailedSummaryDialog from "@/components/estimate-detail/DetailedSummaryDialog";

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
  return (
    <div className="space-y-6">
      <EstimateHeader estimate={estimate} />

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
              <CostSummary estimate={estimate} />
            </div>
          </div>

          {roomDetails.length > 0 && (
            <RoomDetailsList 
              roomDetails={roomDetails} 
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
        currentEstimate={getEstimateResult()}
        roomDetails={roomDetails}
        roomEstimates={roomEstimates}
      />
    </div>
  );
};

export default EstimateContent;

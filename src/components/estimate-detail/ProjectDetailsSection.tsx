
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Estimate, RoomDetail } from "@/types";
import { formatCurrency } from "@/utils/estimateUtils";
import EstimateSummary from "@/components/estimator/EstimateSummary";

interface ProjectDetailsSectionProps {
  projectName: string;
  clientName: string;
  clientAddress: string;
  roomCount: number;
  estimate: Estimate;
  roomDetails: RoomDetail[];
  roomEstimates: Record<string, any>;
}

const ProjectDetailsSection = ({
  projectName,
  clientName,
  clientAddress,
  roomCount,
  estimate,
  roomDetails,
  roomEstimates
}: ProjectDetailsSectionProps) => {
  
  // Format the estimate for EstimateSummary component
  const currentEstimate = {
    roomPrice: estimate.total_cost * 0.85,
    laborCost: estimate.labor_cost || 0,
    materialCost: estimate.material_cost || 0,
    totalCost: estimate.total_cost || 0,
    timeEstimate: estimate.estimated_hours || 0,
    paintCans: estimate.estimated_paint_gallons || 0,
    additionalCosts: {},
    discounts: { volumeDiscount: estimate.discount || 0 }
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="bg-secondary/20">
        <CardTitle className="flex justify-between">
          <span>Project Details</span>
          <span className="text-paint">{formatCurrency(estimate.total_cost || 0)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-2">Project Information</h3>
            <p className="text-sm text-muted-foreground mb-1">Project: {projectName}</p>
            <p className="text-sm text-muted-foreground mb-1">Client: {clientName}</p>
            <p className="text-sm text-muted-foreground">Location: {clientAddress}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Cost Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Labor Cost:</span>
                <span>{formatCurrency(estimate.labor_cost || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Material Cost:</span>
                <span>{formatCurrency(estimate.material_cost || 0)}</span>
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
                  <span>-{formatCurrency(estimate.discount)}</span>
                </div>
              )}
              
              <Separator className="my-2" />
              
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Cost:</span>
                <span className="text-paint">{formatCurrency(estimate.total_cost || 0)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {roomDetails.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold mb-4">Room Details ({roomCount})</h3>
            <div className="space-y-4">
              {roomDetails.map((room) => {
                const roomEstimate = roomEstimates[room.id];
                return (
                  <div key={room.id} className="rounded-lg border p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">
                        {room.roomTypeId.charAt(0).toUpperCase() + room.roomTypeId.slice(1)} ({room.size})
                      </span>
                      <span className="font-medium">
                        {roomEstimate ? formatCurrency(roomEstimate.totalCost) : '$0.00'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {room.paintType} paint
                      {room.hasHighCeiling && ', high ceiling'}
                      {room.isEmpty && ', empty room'}
                      {room.noFloorCovering && ', no floor covering'}
                    </div>
                    
                    {roomEstimate && (
                      <div className="mt-2 grid grid-cols-2 text-sm">
                        <div>Labor: {formatCurrency(roomEstimate.laborCost || 0)}</div>
                        <div>Materials: {formatCurrency(roomEstimate.materialCost || 0)}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectDetailsSection;


import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/estimateUtils";
import RoomBreakdownSection from "./RoomBreakdownSection";

interface EstimateCostSummaryProps {
  laborCost: number;
  materialCost: number;
  paintGallons: number;
  estimatedHours: number;
  roomDetails: any[];
  roomEstimates: Record<string, any>;
  volumeDiscount: number;
  totalCost: number;
}

const EstimateCostSummary = ({ 
  laborCost, 
  materialCost, 
  paintGallons, 
  estimatedHours,
  roomDetails,
  roomEstimates,
  volumeDiscount,
  totalCost
}: EstimateCostSummaryProps) => {
  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-muted-foreground text-sm">Labor</p>
            <p className="font-semibold">{formatCurrency(laborCost || 0)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Materials</p>
            <p className="font-semibold">{formatCurrency(materialCost || 0)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Paint</p>
            <p className="font-semibold">{paintGallons || 0} gallons</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Time</p>
            <p className="font-semibold">{(estimatedHours || 0).toFixed(1)} hours</p>
          </div>
        </div>
        
        <h5 className="text-sm font-medium mb-3">Rooms breakdown:</h5>
        <RoomBreakdownSection 
          roomDetails={roomDetails}
          roomEstimates={roomEstimates}
          volumeDiscount={volumeDiscount}
          totalCost={totalCost}
        />
      </CardContent>
    </Card>
  );
};

export default EstimateCostSummary;

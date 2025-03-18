
import React from "react";
import { formatCurrency } from "@/utils/estimateUtils";
import { RoomDetail } from "@/types";
import RoomDetailItem from "./RoomDetailItem";
import { Card, CardContent } from "@/components/ui/card";

interface RoomsListProps {
  roomDetails: RoomDetail[];
  roomEstimates: Record<string, any>;
  discountAmount: number;
  calculatedTotal: number;
}

const RoomsList = ({ roomDetails, roomEstimates, discountAmount, calculatedTotal }: RoomsListProps) => {
  return (
    <Card className="border">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4">Current Estimate</h3>
        
        <div className="space-y-6">
          {roomDetails.map((room) => {
            const roomEstimate = roomEstimates[room.id] || { 
              totalCost: 0, 
              laborCost: 0, 
              materialCost: 0, 
              additionalCosts: {} 
            };
            
            return (
              <RoomDetailItem 
                key={room.id} 
                room={room} 
                roomEstimate={roomEstimate} 
              />
            );
          })}
          
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600 mt-2">
              <span className="font-medium">Volume Discount:</span>
              <span className="font-medium">-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center border-t pt-4 mt-4">
            <span className="font-bold">Total Cost</span>
            <span className="font-bold text-xl text-blue-600">{formatCurrency(calculatedTotal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomsList;

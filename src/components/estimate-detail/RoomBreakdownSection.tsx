
import React from "react";
import { RoomDetail } from "@/types";
import { formatCurrency } from "@/utils/estimateUtils";

interface RoomBreakdownSectionProps {
  roomDetails: RoomDetail[];
  roomEstimates: Record<string, any>;
  volumeDiscount: number;
  totalCost: number;
}

const RoomBreakdownSection = ({ 
  roomDetails, 
  roomEstimates, 
  volumeDiscount, 
  totalCost 
}: RoomBreakdownSectionProps) => {
  return (
    <div className="space-y-6">
      {roomDetails.map((room, index) => (
        <div key={room.id} className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h6 className="font-medium">
              {room.roomTypeId.charAt(0).toUpperCase() + room.roomTypeId.slice(1)} (Room {index + 1})
            </h6>
            <span className="font-semibold text-blue-600">
              {formatCurrency(roomEstimates[room.id]?.totalCost || 0)}
            </span>
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
            
            {room.doorPaintingMethod && room.doorPaintingMethod !== 'none' && room.numberOfDoors > 0 && (
              <>
                <span className="text-muted-foreground">Doors:</span>
                <span>{room.numberOfDoors} doors ({room.doorPaintingMethod})</span>
              </>
            )}
            
            {room.windowPaintingMethod && room.windowPaintingMethod !== 'none' && room.numberOfWindows > 0 && (
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
      ))}
      
      {volumeDiscount > 0 && (
        <div className="flex justify-between text-green-600 border-t pt-3 mt-3">
          <span className="font-medium">Volume Discount:</span>
          <span className="font-medium">-{formatCurrency(volumeDiscount)}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center border-t pt-4 mt-4">
        <span className="font-bold">Total Cost</span>
        <span className="font-bold text-xl text-blue-600">{formatCurrency(totalCost || 0)}</span>
      </div>
    </div>
  );
};

export default RoomBreakdownSection;


import React from "react";
import { formatCurrency } from "@/utils/estimateUtils";
import { Card } from "@/components/ui/card";
import { HomeIcon } from "lucide-react";
import { RoomDetail } from "@/types";

interface RoomDetailItemProps {
  room: RoomDetail;
  roomEstimate: any;
}

const RoomDetailItem = ({ room, roomEstimate }: RoomDetailItemProps) => {
  return (
    <Card key={room.id} className="border overflow-hidden">
      <div className="p-3 bg-muted/30 flex items-center">
        <HomeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
        <h4 className="font-medium flex-1">
          {room.roomTypeId.charAt(0).toUpperCase() + room.roomTypeId.slice(1)} 
        </h4>
        <span className="font-semibold">{formatCurrency(roomEstimate.totalCost || 0)}</span>
      </div>
      
      <div className="p-3 bg-white">
        <div className="grid grid-cols-2 text-sm gap-x-2 gap-y-1">
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
              <span>{room.numberOfDoors} ({room.doorPaintingMethod} painting)</span>
            </>
          )}
          
          {room.windowPaintingMethod && room.windowPaintingMethod !== 'none' && (
            <>
              <span className="text-muted-foreground">Windows:</span>
              <span>{room.numberOfWindows} ({room.windowPaintingMethod} painting)</span>
            </>
          )}
          
          {room.fireplaceMethod && room.fireplaceMethod !== 'none' && (
            <>
              <span className="text-muted-foreground">Fireplace:</span>
              <span>{room.fireplaceMethod} painting</span>
            </>
          )}
          
          {room.repairs && room.repairs !== 'none' && (
            <>
              <span className="text-muted-foreground">Repairs:</span>
              <span>{room.repairs}</span>
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
              <span>{room.baseboardType} application</span>
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
    </Card>
  );
};

export default RoomDetailItem;

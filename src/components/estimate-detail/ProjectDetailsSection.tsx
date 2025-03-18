
import React from "react";
import { Estimate, RoomDetail } from "@/types";
import { formatCurrency } from "@/utils/estimateUtils";

interface ProjectDetailsSectionProps {
  projectName: string;
  clientName: string;
  clientAddress: string;
  roomCount: number;
  estimate?: Estimate;
  roomDetails?: RoomDetail[];
  roomEstimates?: Record<string, any>;
}

const ProjectDetailsSection = ({ 
  projectName, 
  clientName, 
  clientAddress, 
  roomCount,
  estimate,
  roomDetails = [],
  roomEstimates = {}
}: ProjectDetailsSectionProps) => {
  return (
    <div className="space-y-8">
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
            <span className="font-medium">{roomCount}</span>
          </div>
        </div>
      </div>
      
      {estimate && roomDetails && roomDetails.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Current Estimate:</h4>
            <span className="font-bold text-blue-600 text-lg">
              {formatCurrency(estimate.total_cost || 0)}
            </span>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Rooms breakdown:</p>
              
              {roomDetails.map((room, index) => {
                // Extract base room data and cost
                const roomName = room.roomTypeId ? (
                  room.roomTypeId.charAt(0).toUpperCase() + room.roomTypeId.slice(1)
                ) : `Room ${index + 1}`;
                
                const roomCost = roomEstimates[room.id]?.totalCost || 0;
                
                return (
                  <div key={room.id || index} className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">{roomName} (Room {index + 1})</h5>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(roomCost)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{room.size?.charAt(0).toUpperCase() + room.size?.slice(1) || 'Standard'}</span>
                      
                      <span className="text-muted-foreground">Paint Type:</span>
                      <span>{room.paintType?.charAt(0).toUpperCase() + room.paintType?.slice(1) || 'Standard'}</span>
                      
                      <span className="text-muted-foreground">Ceiling:</span>
                      <span>{room.hasHighCeiling ? 'High ceiling' : 'Standard'}</span>
                      
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
                          <span>{room.numberOfDoors} doors</span>
                        </>
                      )}
                      
                      {room.windowPaintingMethod && room.windowPaintingMethod !== 'none' && room.numberOfWindows > 0 && (
                        <>
                          <span className="text-muted-foreground">Windows:</span>
                          <span>{room.numberOfWindows} windows</span>
                        </>
                      )}
                      
                      {room.fireplaceMethod && room.fireplaceMethod !== 'none' && (
                        <>
                          <span className="text-muted-foreground">Fireplace:</span>
                          <span>Brush painting</span>
                        </>
                      )}
                      
                      {room.repairs && room.repairs !== 'none' && (
                        <>
                          <span className="text-muted-foreground">Repairs:</span>
                          <span>{room.repairs === 'minimal' ? 'Minimal' : 'Extensive'}</span>
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
                          <span>{room.baseboardType === 'brush' ? 'Brush application' : 'Spray application'}</span>
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
            </div>
            
            {estimate.discount > 0 && (
              <div className="flex justify-between text-green-600 border-t pt-3">
                <span className="font-medium">Volume Discount:</span>
                <span className="font-medium">-{formatCurrency(estimate.discount)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center border-t pt-3">
              <span className="font-bold">Total Cost</span>
              <span className="font-bold text-xl text-blue-600">{formatCurrency(estimate.total_cost || 0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsSection;

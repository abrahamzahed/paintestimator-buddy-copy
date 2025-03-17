
import { formatCurrency } from "@/utils/estimateUtils";
import { EstimateResult, RoomDetail } from "@/types";
import { Button } from "@/components/ui/button";
import { Send, Edit } from "lucide-react";

interface EstimateSummaryProps {
  currentEstimate: EstimateResult | null;
  rooms: RoomDetail[];
  roomEstimates: Record<string, any>;
  onSubmit: (e?: React.FormEvent) => void;
  submitButtonText: string;
  isLastStep: boolean;
  onEdit?: (step: number) => void;
  isEditMode?: boolean;
}

const EstimateSummary = ({ 
  currentEstimate, 
  rooms, 
  roomEstimates, 
  onSubmit,
  submitButtonText,
  isLastStep,
  onEdit,
  isEditMode = false
}: EstimateSummaryProps) => {
  if (!currentEstimate) return null;
  
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Rooms Included ({rooms.length})</h4>
          {isEditMode && onEdit && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit(2)} 
              className="text-paint hover:text-paint-dark"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Rooms
            </Button>
          )}
        </div>
        <ul className="divide-y">
          {rooms.map((room) => {
            const roomEstimate = roomEstimates[room.id];
            return (
              <li key={room.id} className="py-2">
                <div className="flex justify-between">
                  <span>{room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)} ({room.roomSize})</span>
                  <span className="font-medium">{roomEstimate ? formatCurrency(roomEstimate.totalCost) : '$0.00'}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {room.wallsCount} walls, {room.wallHeight}ft height, {room.paintType} paint
                  {room.condition !== 'good' && `, ${room.condition} condition`}
                  {room.includeCeiling && ', ceiling'}
                  {room.includeBaseboards && ', baseboards'}
                  {room.includeCrownMolding && ', crown molding'}
                </div>
                {roomEstimate && (
                  <div className="mt-2 grid grid-cols-2 text-sm">
                    <div>Labor: {formatCurrency(roomEstimate.laborCost)}</div>
                    <div>Materials: {formatCurrency(roomEstimate.materialCost)}</div>
                    {Object.entries(roomEstimate.additionalCosts).length > 0 && (
                      <div className="col-span-2 mt-1">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-paint hover:underline">Additional costs</summary>
                          <div className="pl-3 pt-1 space-y-1">
                            {Object.entries(roomEstimate.additionalCosts).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                                <span>{formatCurrency(Number(value))}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                    
                    {room.isEmptyHouse && (
                      <div className="col-span-2 text-green-600">
                        Empty room discount: -15%
                      </div>
                    )}
                    
                    {!room.needFloorCovering && (
                      <div className="col-span-2 text-green-600">
                        No floor covering: -5%
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Cost Summary</h4>
          {isEditMode && onEdit && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit(1)} 
              className="text-paint hover:text-paint-dark"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Project Info
            </Button>
          )}
        </div>
        
        <div className="flex justify-between">
          <span>Total Labor Cost:</span>
          <span>{formatCurrency(currentEstimate.laborCost)}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Material Cost:</span>
          <span>{formatCurrency(currentEstimate.materialCost)}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Paint Required:</span>
          <span>{currentEstimate.paintCans} gallons</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Time:</span>
          <span>{currentEstimate.timeEstimate.toFixed(1)} hours</span>
        </div>

        {Object.entries(currentEstimate.discounts).length > 0 && (
          <>
            <div className="border-t my-2"></div>
            <h5 className="font-medium">Applied Discounts</h5>
            {currentEstimate.discounts.volumeDiscount && (
              <div className="flex justify-between text-green-600">
                <span>Volume Discount:</span>
                <span>-{formatCurrency(currentEstimate.discounts.volumeDiscount)}</span>
              </div>
            )}
          </>
        )}

        <div className="border-t my-2"></div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total Cost:</span>
          <span className="text-paint">{formatCurrency(currentEstimate.totalCost)}</span>
        </div>
      </div>
      
      {isLastStep && (
        <div className="flex justify-end mt-4">
          <Button
            onClick={() => onSubmit()}
            className="bg-paint hover:bg-paint-dark px-6"
          >
            <Send className="mr-2 h-4 w-4" />
            {submitButtonText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EstimateSummary;


import { EstimateResult, RoomDetail, LineItem } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/estimateUtils";
import { CalendarIcon, PrinterIcon, HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import LineItemsTable from "./LineItemsTable";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface DetailedSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEstimate: EstimateResult;
  roomDetails: RoomDetail[];
  roomEstimates: Record<string, any>;
}

const DetailedSummaryDialog = ({ 
  open, 
  onOpenChange, 
  currentEstimate, 
  roomDetails, 
  roomEstimates 
}: DetailedSummaryDialogProps) => {
  const { id: estimateId } = useParams<{ id: string }>();
  
  // Initialize with all rooms expanded by default
  const [expandedRooms, setExpandedRooms] = useState<string[]>([]);
  
  // Set all rooms to be expanded when the dialog opens
  useEffect(() => {
    if (open && roomDetails.length > 0) {
      setExpandedRooms(roomDetails.map(room => room.id));
    }
  }, [open, roomDetails]);

  const handlePrint = () => {
    window.print();
  };
  
  // Get today's date for the invoice
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold mb-1">Painting Estimate</DialogTitle>
              <DialogDescription className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" /> {formattedDate} • Invoice #EST-{Math.floor(1000 + Math.random() * 9000)}
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <PrinterIcon className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          {/* Company and Client Info */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">SERVICE PROVIDER</h3>
              <div className="text-sm">
                <p className="font-semibold">Premium Paint Contractors</p>
                <p>123 Brush Street</p>
                <p>Paintsville, CA 94123</p>
                <p>contact@premiumpaint.com</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">CLIENT</h3>
              <div className="text-sm">
                <p className="font-semibold">Valued Customer</p>
                <p>555 Home Avenue</p>
                <p>Residence City, CA 90210</p>
              </div>
            </div>
          </div>

          {/* Summary Totals - More compact */}
          <Card className="border">
            <CardContent className="p-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Labor</p>
                  <p className="font-semibold">{formatCurrency(currentEstimate.laborCost)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Materials</p>
                  <p className="font-semibold">{formatCurrency(currentEstimate.materialCost)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Paint</p>
                  <p className="font-semibold">{currentEstimate.paintCans} gallons</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Time</p>
                  <p className="font-semibold">{currentEstimate.timeEstimate.toFixed(1)} hours</p>
                </div>
              </div>
              
              <div className="border-t mt-3 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Cost</span>
                  <span className="font-bold text-xl text-paint">{formatCurrency(currentEstimate.totalCost)}</span>
                </div>
                
                {/* Discounts */}
                {Object.entries(currentEstimate.discounts).length > 0 && (
                  <div className="text-sm mt-1">
                    <p className="text-muted-foreground">Includes discounts:</p>
                    {currentEstimate.discounts.volumeDiscount && (
                      <p className="text-green-600">- Volume Discount: {formatCurrency(currentEstimate.discounts.volumeDiscount)}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Room Details - Always expanded */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Room-by-Room Breakdown</h3>
            <div className="space-y-4">
              {roomDetails.map((room) => (
                <Card key={room.id} className="border overflow-hidden">
                  <div className="p-3 bg-muted/30 flex items-center">
                    <HomeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <h4 className="font-medium flex-1">
                      {room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)} - {room.roomSize}
                    </h4>
                    <span className="font-semibold">{formatCurrency(roomEstimates[room.id]?.totalCost || 0)}</span>
                  </div>
                  
                  <div className="p-3 bg-white">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Room Details</h5>
                        <div className="grid grid-cols-2 text-sm gap-x-2 gap-y-1">
                          <span className="text-muted-foreground">Walls:</span> 
                          <span>{room.wallsCount}</span>
                          <span className="text-muted-foreground">Dimensions:</span> 
                          <span>{room.wallHeight}ft × {room.wallWidth}ft</span>
                          <span className="text-muted-foreground">Paint Type:</span> 
                          <span>{room.paintType}</span>
                          <span className="text-muted-foreground">Condition:</span> 
                          <span>{room.condition}</span>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-2">Additional Options</h5>
                        <div className="grid grid-cols-2 text-sm gap-x-2 gap-y-1">
                          <span className="text-muted-foreground">Ceiling:</span> 
                          <span>{room.includeCeiling ? 'Yes' : 'No'}</span>
                          <span className="text-muted-foreground">Baseboards:</span> 
                          <span>{room.includeBaseboards ? 'Yes' : 'No'}</span>
                          <span className="text-muted-foreground">Crown Molding:</span> 
                          <span>{room.includeCrownMolding ? 'Yes' : 'No'}</span>
                          <span className="text-muted-foreground">Empty Room:</span> 
                          <span>{room.isEmptyHouse ? 'Yes (-15%)' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Cost breakdown for the room - compact */}
                    <div className="border-t pt-3 mt-3">
                      <h5 className="text-sm font-medium mb-2">Cost Breakdown</h5>
                      <div className="grid grid-cols-2 text-sm gap-x-4 gap-y-1">
                        <span>Labor</span>
                        <span className="text-right">{formatCurrency(roomEstimates[room.id]?.laborCost || 0)}</span>
                        <span>Materials</span>
                        <span className="text-right">{formatCurrency(roomEstimates[room.id]?.materialCost || 0)}</span>
                        
                        {/* Additional costs */}
                        {roomEstimates[room.id]?.additionalCosts && 
                         Object.entries(roomEstimates[room.id].additionalCosts).length > 0 && (
                          <>
                            <span className="col-span-2 font-medium pt-1 mt-1 border-t">Additional Costs:</span>
                            {Object.entries(roomEstimates[room.id].additionalCosts).map(([key, value]) => (
                              <>
                                <span key={`key-${key}`} className="text-muted-foreground pl-3">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                <span key={`value-${key}`} className="text-right">{formatCurrency(Number(value))}</span>
                              </>
                            ))}
                          </>
                        )}
                        
                        {/* Discounts for the room */}
                        {(room.isEmptyHouse || !room.needFloorCovering) && (
                          <>
                            <span className="col-span-2 font-medium pt-1 mt-1 border-t">Discounts:</span>
                            {room.isEmptyHouse && (
                              <>
                                <span className="text-green-600 pl-3">Empty room discount</span>
                                <span className="text-right text-green-600">-15%</span>
                              </>
                            )}
                            {!room.needFloorCovering && (
                              <>
                                <span className="text-green-600 pl-3">No floor covering</span>
                                <span className="text-right text-green-600">-5%</span>
                              </>
                            )}
                          </>
                        )}
                        
                        <span className="font-medium pt-2 mt-1 border-t">Total for this room</span>
                        <span className="text-right font-medium pt-2 mt-1 border-t">{formatCurrency(roomEstimates[room.id]?.totalCost || 0)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Line Items if any exist */}
          <LineItemsTable 
            lineItems={[
              // Adding the required estimate_id to each line item
              { id: '1', description: 'Premium paint - Living Room', quantity: 2, unit_price: 45.99, estimate_id: estimateId || '' },
              { id: '2', description: 'Standard paint - Bedroom', quantity: 1, unit_price: 32.99, estimate_id: estimateId || '' },
              { id: '3', description: 'Painting supplies', quantity: 1, unit_price: 25.00, estimate_id: estimateId || '' }
            ]} 
          />
          
          {/* Terms and Notes - more compact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-1">PAYMENT TERMS</h3>
              <p className="text-sm">Payment is due within 30 days of service completion. Please make checks payable to Premium Paint Contractors.</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">NOTES</h3>
              <p className="text-sm">This estimate is valid for 30 days from the date issued. Thank you for choosing Premium Paint Contractors!</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailedSummaryDialog;

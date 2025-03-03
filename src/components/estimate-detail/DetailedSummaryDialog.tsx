
import { EstimateResult, RoomDetail } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/estimateUtils";
import { CalendarIcon, ChevronDownIcon, ChevronUpIcon, HomeIcon, PrinterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import LineItemsTable from "./LineItemsTable";
import { useState } from "react";

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
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  
  const toggleRoomExpand = (roomId: string) => {
    if (expandedRoom === roomId) {
      setExpandedRoom(null);
    } else {
      setExpandedRoom(roomId);
    }
  };

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
        
        <div className="py-6 space-y-8">
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

          {/* Summary Totals */}
          <Card className="border">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Labor</p>
                  <p className="font-semibold text-xl">{formatCurrency(currentEstimate.laborCost)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Materials</p>
                  <p className="font-semibold text-xl">{formatCurrency(currentEstimate.materialCost)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Paint Required</p>
                  <p className="font-semibold text-xl">{currentEstimate.paintCans} gallons</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Est. Time</p>
                  <p className="font-semibold text-xl">{currentEstimate.timeEstimate.toFixed(1)} hours</p>
                </div>
              </div>
              
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Cost</span>
                  <span className="font-bold text-xl text-paint">{formatCurrency(currentEstimate.totalCost)}</span>
                </div>
                
                {/* Discounts */}
                {Object.entries(currentEstimate.discounts).length > 0 && (
                  <div className="text-sm mt-2">
                    <p className="text-muted-foreground">Includes discounts:</p>
                    {currentEstimate.discounts.volumeDiscount && (
                      <p className="text-green-600">- Volume Discount: {formatCurrency(currentEstimate.discounts.volumeDiscount)}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Room Details */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Room-by-Room Breakdown</h3>
            <div className="space-y-3">
              {roomDetails.map((room) => (
                <div key={room.id} className="border rounded-md overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleRoomExpand(room.id)}
                  >
                    <div className="flex items-center">
                      <HomeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">
                        {room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)} - {room.roomSize}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold mr-3">{formatCurrency(roomEstimates[room.id]?.totalCost || 0)}</span>
                      {expandedRoom === room.id ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  
                  {expandedRoom === room.id && (
                    <div className="p-4 bg-white border-t">
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Room Details</h4>
                          <ul className="text-sm space-y-1">
                            <li><span className="text-muted-foreground">Walls:</span> {room.wallsCount}</li>
                            <li><span className="text-muted-foreground">Dimensions:</span> {room.wallHeight}ft height × {room.wallWidth}ft width</li>
                            <li><span className="text-muted-foreground">Paint Type:</span> {room.paintType}</li>
                            <li><span className="text-muted-foreground">Condition:</span> {room.condition}</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Options</h4>
                          <ul className="text-sm space-y-1">
                            <li><span className="text-muted-foreground">Ceiling:</span> {room.includeCeiling ? 'Yes' : 'No'}</li>
                            <li><span className="text-muted-foreground">Baseboards:</span> {room.includeBaseboards ? 'Yes' : 'No'}</li>
                            <li><span className="text-muted-foreground">Crown Molding:</span> {room.includeCrownMolding ? 'Yes' : 'No'}</li>
                            <li><span className="text-muted-foreground">Empty Room:</span> {room.isEmptyHouse ? 'Yes (-15%)' : 'No'}</li>
                          </ul>
                        </div>
                      </div>
                      
                      {/* Cost breakdown for the room */}
                      <div className="border-t pt-3 mt-3">
                        <h4 className="text-sm font-medium mb-2">Cost Breakdown</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span>Labor</span>
                            <span>{formatCurrency(roomEstimates[room.id]?.laborCost || 0)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span>Materials</span>
                            <span>{formatCurrency(roomEstimates[room.id]?.materialCost || 0)}</span>
                          </div>
                          
                          {/* Additional costs */}
                          {roomEstimates[room.id]?.additionalCosts && 
                           Object.entries(roomEstimates[room.id].additionalCosts).length > 0 && (
                            <div className="pt-1 mt-1 border-t">
                              <div className="text-sm font-medium mb-1">Additional Costs:</div>
                              {Object.entries(roomEstimates[room.id].additionalCosts).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                  <span>{formatCurrency(Number(value))}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Discounts for the room */}
                          {(room.isEmptyHouse || !room.needFloorCovering) && (
                            <div className="pt-1 mt-1 border-t">
                              <div className="text-sm font-medium mb-1">Discounts:</div>
                              {room.isEmptyHouse && (
                                <div className="flex justify-between items-center text-sm text-green-600">
                                  <span>Empty room discount</span>
                                  <span>-15%</span>
                                </div>
                              )}
                              {!room.needFloorCovering && (
                                <div className="flex justify-between items-center text-sm text-green-600">
                                  <span>No floor covering</span>
                                  <span>-5%</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center pt-2 mt-2 border-t font-medium">
                            <span>Total for this room</span>
                            <span>{formatCurrency(roomEstimates[room.id]?.totalCost || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Line Items if any exist */}
          <LineItemsTable 
            lineItems={[
              // Dummy line items for now, these would come from the estimate in a real implementation
              { id: '1', description: 'Premium paint - Living Room', quantity: 2, unit_price: 45.99 },
              { id: '2', description: 'Standard paint - Bedroom', quantity: 1, unit_price: 32.99 },
              { id: '3', description: 'Painting supplies', quantity: 1, unit_price: 25.00 }
            ]} 
          />
          
          {/* Terms and Notes */}
          <div className="space-y-4">
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

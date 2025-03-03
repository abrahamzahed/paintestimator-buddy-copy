
import { useState, useEffect } from "react";
import { EstimateResult, RoomDetail, LineItem } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/estimateUtils";
import { CalendarIcon, PrinterIcon, HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import LineItemsTable from "./LineItemsTable";
import { useParams } from "react-router-dom";
import { calculateSingleRoomEstimate } from "@/utils/estimateUtils";
import { supabase } from "@/integrations/supabase/client";

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
  const [calculatedRoomEstimates, setCalculatedRoomEstimates] = useState<Record<string, any>>(roomEstimates);
  const [clientInfo, setClientInfo] = useState<{ name: string; address: string; city: string; state: string; zip: string }>({
    name: "Valued Customer",
    address: "555 Home Avenue",
    city: "Residence City",
    state: "CA",
    zip: "90210"
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  
  // Set all rooms to be expanded when the dialog opens
  useEffect(() => {
    if (open && roomDetails.length > 0) {
      setExpandedRooms(roomDetails.map(room => room.id));
      
      // Calculate proper estimates for each room if they're not already calculated
      const updatedEstimates = { ...roomEstimates };
      let needsUpdate = false;
      
      roomDetails.forEach(room => {
        // Check if the room estimate exists and has a valid totalCost
        if (!roomEstimates[room.id] || roomEstimates[room.id].totalCost === 0) {
          // Calculate the estimate for this room
          updatedEstimates[room.id] = calculateSingleRoomEstimate(room);
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        setCalculatedRoomEstimates(updatedEstimates);
      }

      // Fetch real line items and client info if we have an estimate ID
      if (estimateId) {
        fetchLineItems(estimateId);
        fetchClientInfo(estimateId);
      }
    }
  }, [open, roomDetails, roomEstimates, estimateId]);

  const fetchLineItems = async (estId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_line_items_for_estimate', { estimate_id: estId });
      
      if (!error && data && data.length > 0) {
        setLineItems(data);
      } else {
        // If no real line items found, set default ones with estimate_id
        setLineItems([
          { id: '1', description: 'Premium paint - Living Room', quantity: 2, unit_price: 45.99, estimate_id: estId },
          { id: '2', description: 'Standard paint - Bedroom', quantity: 1, unit_price: 32.99, estimate_id: estId },
          { id: '3', description: 'Painting supplies', quantity: 1, unit_price: 25.00, estimate_id: estId }
        ]);
      }
    } catch (error) {
      console.error("Error fetching line items:", error);
    }
  };

  const fetchClientInfo = async (estId: string) => {
    try {
      // Get the estimate to find the lead ID
      const { data: estimateData, error: estimateError } = await supabase
        .from("estimates")
        .select("lead_id")
        .eq("id", estId)
        .single();
      
      if (!estimateError && estimateData && estimateData.lead_id) {
        // Get the lead info
        const { data: leadData, error: leadError } = await supabase
          .from("leads")
          .select("name, email, phone, address")
          .eq("id", estimateData.lead_id)
          .single();
        
        if (!leadError && leadData) {
          // Parse address if available
          let street = leadData.address || "555 Home Avenue";
          let city = "Residence City";
          let state = "CA";
          let zip = "90210";
          
          // Simple parsing of address field if it contains commas
          if (leadData.address && leadData.address.includes(',')) {
            const addressParts = leadData.address.split(',');
            street = addressParts[0].trim();
            if (addressParts.length > 1) {
              const cityStateParts = addressParts[1].trim().split(' ');
              if (cityStateParts.length > 2) {
                city = cityStateParts.slice(0, -2).join(' ');
                state = cityStateParts[cityStateParts.length - 2];
                zip = cityStateParts[cityStateParts.length - 1];
              }
            }
          }
          
          setClientInfo({
            name: leadData.name || "Valued Customer",
            address: street,
            city,
            state,
            zip
          });
        }
      }
    } catch (error) {
      console.error("Error fetching client info:", error);
    }
  };

  const handlePrint = () => {
    // Add a temporary class to the body for print styles
    document.body.classList.add('printing');
    
    // Clone the dialog content to a new div
    const printContent = document.querySelector('.print-content');
    if (!printContent) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this website');
      document.body.classList.remove('printing');
      return;
    }
    
    // Add print styles
    printWindow.document.write(`
      <html>
        <head>
          <title>Painting Estimate</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            .print-header {
              display: flex;
              justify-content: space-between;
              border-bottom: 1px solid #ddd;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .section {
              margin-bottom: 30px;
            }
            h1 {
              color: #333;
              margin-bottom: 5px;
            }
            h2 {
              color: #555;
              margin: 20px 0 10px;
              font-size: 18px;
            }
            .grid-col-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            .card {
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 15px;
              margin-bottom: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f5f5f5;
            }
            .price {
              text-align: right;
              font-weight: bold;
            }
            .total {
              font-size: 18px;
              font-weight: bold;
              color: #1a5fb4;
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-top: 2px solid #ddd;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              @page {
                size: letter;
                margin: 0.5in;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for resources to load
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
      document.body.classList.remove('printing');
    }, 500);
  };
  
  // Verify and recalculate the total costs
  const verifyTotalCosts = () => {
    // Calculate the sum of all room costs
    const totalRoomCosts = Object.values(calculatedRoomEstimates).reduce(
      (sum, roomEst: any) => sum + (roomEst.totalCost || 0), 0
    );
    
    // Calculate total from line items
    const lineItemsTotal = lineItems.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price), 0
    );
    
    // Get discount amount
    const discountAmount = Object.values(currentEstimate.discounts).reduce(
      (sum, discount) => sum + (Number(discount) || 0), 0
    );
    
    // Grand total should be rooms + items - discounts
    const calculatedTotal = totalRoomCosts + lineItemsTotal - discountAmount;
    
    return {
      roomTotal: totalRoomCosts,
      lineItemsTotal,
      discountAmount,
      calculatedTotal: Math.max(calculatedTotal, 0)
    };
  };
  
  const { roomTotal, lineItemsTotal, discountAmount, calculatedTotal } = verifyTotalCosts();
  
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
                <CalendarIcon className="h-4 w-4 mr-1" /> {formattedDate} • Invoice #EST-{estimateId?.substring(0, 4) || Math.floor(1000 + Math.random() * 9000)}
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <PrinterIcon className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>
        </DialogHeader>
        
        <div className="print-content py-6 space-y-6">
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
                <p className="font-semibold">{clientInfo.name}</p>
                <p>{clientInfo.address}</p>
                <p>{clientInfo.city}, {clientInfo.state} {clientInfo.zip}</p>
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
                  <span className="font-medium">Room Subtotal</span>
                  <span className="font-medium">{formatCurrency(roomTotal)}</span>
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  <span className="font-medium">Line Items Subtotal</span>
                  <span className="font-medium">{formatCurrency(lineItemsTotal)}</span>
                </div>
                
                {/* Discounts */}
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center mt-1 text-green-600">
                    <span className="font-medium">Discounts</span>
                    <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <span className="font-bold">Total Cost</span>
                  <span className="font-bold text-xl text-paint">{formatCurrency(calculatedTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Room Details - Always expanded */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Room-by-Room Breakdown</h3>
            <div className="space-y-4">
              {roomDetails.map((room) => {
                // Get the calculated estimate for this room
                const roomEstimate = calculatedRoomEstimates[room.id] || { 
                  totalCost: 0, 
                  laborCost: 0, 
                  materialCost: 0, 
                  additionalCosts: {} 
                };
                
                return (
                  <Card key={room.id} className="border overflow-hidden">
                    <div className="p-3 bg-muted/30 flex items-center">
                      <HomeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <h4 className="font-medium flex-1">
                        {room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)} - {room.roomSize}
                      </h4>
                      <span className="font-semibold">{formatCurrency(roomEstimate.totalCost || 0)}</span>
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
                          <span>Base Room Cost</span>
                          <span className="text-right">{formatCurrency(roomEstimate.roomPrice || 0)}</span>
                          <span>Labor</span>
                          <span className="text-right">{formatCurrency(roomEstimate.laborCost || 0)}</span>
                          <span>Materials</span>
                          <span className="text-right">{formatCurrency(roomEstimate.materialCost || 0)}</span>
                          
                          {/* Additional costs */}
                          {roomEstimate.additionalCosts && 
                           Object.entries(roomEstimate.additionalCosts).length > 0 && (
                            <>
                              <span className="col-span-2 font-medium pt-1 mt-1 border-t">Additional Costs:</span>
                              {Object.entries(roomEstimate.additionalCosts).map(([key, value]) => (
                                <React.Fragment key={`${room.id}-${key}`}>
                                  <span className="text-muted-foreground pl-3">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                  <span className="text-right">{formatCurrency(Number(value))}</span>
                                </React.Fragment>
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
                          <span className="text-right font-medium pt-2 mt-1 border-t">{formatCurrency(roomEstimate.totalCost || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
          
          {/* Line Items */}
          {lineItems.length > 0 && (
            <LineItemsTable lineItems={lineItems} />
          )}
          
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

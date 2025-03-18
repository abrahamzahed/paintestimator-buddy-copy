
import React, { useState, useEffect } from "react";
import { EstimateResult, RoomDetail, LineItem } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon, PrinterIcon } from "lucide-react";
import LineItemsTable from "./LineItemsTable";
import { useParams } from "react-router-dom";
import { calculateSingleRoomEstimate } from "@/utils/estimateUtils";
import { supabase } from "@/integrations/supabase/client";
import ClientInfoSection from "./ClientInfoSection";
import ServiceProviderSection from "./ServiceProviderSection";
import RoomsList from "./RoomDetailsList";
import EstimateFooterInfo from "./EstimateFooterInfo";

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
  
  useEffect(() => {
    if (open && roomDetails.length > 0) {
      setExpandedRooms(roomDetails.map(room => room.id));
      
      const updatedEstimates = { ...roomEstimates };
      let needsUpdate = false;
      
      roomDetails.forEach(room => {
        if (!roomEstimates[room.id] || roomEstimates[room.id].totalCost === 0) {
          updatedEstimates[room.id] = calculateSingleRoomEstimate(room);
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        setCalculatedRoomEstimates(updatedEstimates);
      }

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
      const { data: estimateData, error: estimateError } = await supabase
        .from("estimates")
        .select("lead_id")
        .eq("id", estId)
        .single();
      
      if (!estimateError && estimateData && estimateData.lead_id) {
        const { data: leadData, error: leadError } = await supabase
          .from("leads")
          .select("name, email, phone, address")
          .eq("id", estimateData.lead_id)
          .single();
        
        if (!leadError && leadData) {
          let street = leadData.address || "555 Home Avenue";
          let city = "Residence City";
          let state = "CA";
          let zip = "90210";
          
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
    document.body.classList.add('printing');
    
    const printContent = document.querySelector('.print-content');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this website');
      document.body.classList.remove('printing');
      return;
    }
    
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
    
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
      document.body.classList.remove('printing');
    }, 500);
  };

  const verifyTotalCosts = () => {
    const totalRoomCosts = Object.values(calculatedRoomEstimates).reduce(
      (sum, roomEst: any) => sum + (roomEst.totalCost || 0), 0
    );
    
    const lineItemsTotal = lineItems.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price), 0
    );
    
    const discountAmount = Object.values(currentEstimate.discounts).reduce(
      (sum, discount) => sum + (Number(discount) || 0), 0
    );
    
    const calculatedTotal = totalRoomCosts + lineItemsTotal - discountAmount;
    
    return {
      roomTotal: totalRoomCosts,
      lineItemsTotal,
      discountAmount,
      calculatedTotal: Math.max(calculatedTotal, 0)
    };
  };

  const { roomTotal, lineItemsTotal, discountAmount, calculatedTotal } = verifyTotalCosts();

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
          <div className="grid grid-cols-2 gap-8">
            <ServiceProviderSection />
            <ClientInfoSection clientInfo={clientInfo} />
          </div>

          <RoomsList 
            roomDetails={roomDetails} 
            roomEstimates={calculatedRoomEstimates} 
            discountAmount={discountAmount} 
            calculatedTotal={calculatedTotal} 
          />
          
          {lineItems.length > 0 && (
            <LineItemsTable lineItems={lineItems} />
          )}
          
          <EstimateFooterInfo />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailedSummaryDialog;

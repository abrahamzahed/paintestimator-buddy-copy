
import React, { useState } from "react";
import { Estimate, RoomDetail } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Printer, Home, LayoutDashboard } from "lucide-react";
import { formatCurrency } from "@/utils/estimateUtils";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/context/use-session";
import DetailedSummaryDialog from "@/components/estimate-detail/DetailedSummaryDialog";
import { calculateSingleRoomEstimate } from "@/utils/estimateUtils";

interface FreeEstimatorSummaryProps {
  estimate: Estimate;
  roomDetails: RoomDetail[];
  projectName: string;
  clientName: string;
  clientAddress: string;
}

const FreeEstimatorSummary = ({
  estimate,
  roomDetails,
  projectName,
  clientName,
  clientAddress
}: FreeEstimatorSummaryProps) => {
  const navigate = useNavigate();
  const { user } = useSession();
  const [showDetailedView, setShowDetailedView] = useState(false);
  
  const roomEstimates = {};
  
  roomDetails.forEach(room => {
    if (room.id) {
      roomEstimates[room.id] = calculateSingleRoomEstimate(room);
    }
  });
  
  const getEstimateResult = () => {
    return {
      roomPrice: estimate.total_cost * 0.85,
      laborCost: estimate.labor_cost || 0,
      materialCost: estimate.material_cost || 0,
      totalCost: estimate.total_cost || 0,
      timeEstimate: estimate.estimated_hours || 0,
      paintCans: estimate.estimated_paint_gallons || 0,
      additionalCosts: {},
      discounts: { volumeDiscount: estimate.discount || 0 }
    };
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleDashboard = () => {
    navigate('/dashboard');
  };
  
  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBack}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetailedView(true)}
            className="flex items-center"
          >
            <Printer className="mr-2 h-4 w-4" /> Print Details
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-center text-green-500 mb-4">
        <CheckCircle className="h-16 w-16" />
      </div>
      
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Estimate #{estimate.id?.substring(0, 8)}</h1>
        <p className="text-muted-foreground">
          Your painting estimate has been saved and is ready for review.
        </p>
      </div>
      
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
            <span className="font-medium">{roomDetails.length}</span>
          </div>
        </div>
      </div>
      
      <Card className="border">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Labor</p>
              <p className="font-semibold">{formatCurrency(estimate.labor_cost || 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Materials</p>
              <p className="font-semibold">{formatCurrency(estimate.material_cost || 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Paint</p>
              <p className="font-semibold">{estimate.estimated_paint_gallons || 0} gallons</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Time</p>
              <p className="font-semibold">{(estimate.estimated_hours || 0).toFixed(1)} hours</p>
            </div>
          </div>
          
          <div className="border-t mt-3 pt-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Subtotal</span>
              <span className="font-medium">{formatCurrency((estimate.total_cost || 0) + (estimate.discount || 0))}</span>
            </div>
            
            {estimate.discount > 0 && (
              <div className="flex justify-between items-center mt-1 text-green-600">
                <span className="font-medium">Discount</span>
                <span className="font-medium">-{formatCurrency(estimate.discount || 0)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-3 pt-3 border-t">
              <span className="font-bold">Total Cost</span>
              <span className="font-bold text-xl text-paint">{formatCurrency(estimate.total_cost || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        {roomDetails.map((room, index) => (
          <Card key={room.id || index} className="border flex-1">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">{room.roomType}</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span>{room.roomSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Walls:</span>
                  <span>{room.wallsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paint Type:</span>
                  <span>{room.paintType}</span>
                </div>
                {room.includeCeiling && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ceiling:</span>
                    <span>Included</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="border-t pt-4 mt-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline"
            onClick={handleHome}
            className="flex items-center"
          >
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Button>
          
          <Button 
            className="bg-paint hover:bg-paint-dark flex items-center"
            onClick={handleDashboard}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>
      </div>
      
      <DetailedSummaryDialog
        open={showDetailedView}
        onOpenChange={setShowDetailedView}
        currentEstimate={getEstimateResult()}
        roomDetails={roomDetails}
        roomEstimates={roomEstimates}
      />
    </div>
  );
};

export default FreeEstimatorSummary;


import { EstimateResult, RoomDetail } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EstimateSummary from "@/components/estimator/EstimateSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/estimateUtils";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detailed Estimate Summary</DialogTitle>
          <DialogDescription>
            Complete breakdown of your estimate
          </DialogDescription>
        </DialogHeader>
        
        {/* Room-by-room cost breakdown */}
        <div className="space-y-4 mb-6">
          <h3 className="font-semibold text-lg">Room-by-Room Cost Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roomDetails.map((room, index) => (
              <Card key={room.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">
                    {room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Labor:</span>
                      <span>{formatCurrency(roomEstimates[room.id]?.laborCost || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Materials:</span>
                      <span>{formatCurrency(roomEstimates[room.id]?.materialCost || 0)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 mt-1">
                      <span className="font-medium">Total:</span>
                      <span className="font-medium">{formatCurrency(roomEstimates[room.id]?.totalCost || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <EstimateSummary
          currentEstimate={currentEstimate}
          rooms={roomDetails}
          roomEstimates={roomEstimates}
          onSubmit={() => {}}
          submitButtonText=""
          isLastStep={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DetailedSummaryDialog;

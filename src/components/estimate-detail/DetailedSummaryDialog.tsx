
import { EstimateResult, RoomDetail } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EstimateSummary from "@/components/estimator/EstimateSummary";

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

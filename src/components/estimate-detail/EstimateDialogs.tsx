
import React from "react";
import DetailedSummaryDialog from "@/components/estimate-detail/DetailedSummaryDialog";
import EditOptionsDialog from "@/components/estimate-detail/EditOptionsDialog";
import DeleteConfirmationDialog from "@/components/estimate-detail/DeleteConfirmationDialog";

interface EstimateDialogsProps {
  showDetailedView: boolean;
  setShowDetailedView: (show: boolean) => void;
  showEditOptions: boolean;
  setShowEditOptions: (show: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  onEditEstimate: () => void;
  onDeleteEstimate: () => void;
  isDeleting: boolean;
  currentEstimate: any;
  roomDetails: any[];
  roomEstimates: Record<string, any>;
}

const EstimateDialogs = ({
  showDetailedView,
  setShowDetailedView,
  showEditOptions,
  setShowEditOptions,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  onEditEstimate,
  onDeleteEstimate,
  isDeleting,
  currentEstimate,
  roomDetails,
  roomEstimates
}: EstimateDialogsProps) => {
  return (
    <>
      <DetailedSummaryDialog
        open={showDetailedView}
        onOpenChange={setShowDetailedView}
        currentEstimate={currentEstimate}
        roomDetails={roomDetails}
        roomEstimates={roomEstimates}
      />
      
      <EditOptionsDialog
        open={showEditOptions}
        onOpenChange={setShowEditOptions}
        onEditEstimate={onEditEstimate}
        onDeleteClick={() => setIsDeleteDialogOpen(true)}
      />
      
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDeleteEstimate={onDeleteEstimate}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default EstimateDialogs;

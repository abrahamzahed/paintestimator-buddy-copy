
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface EditOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditEstimate: () => void;
  onDeleteClick: () => void;
}

const EditOptionsDialog = ({ 
  open, 
  onOpenChange, 
  onEditEstimate, 
  onDeleteClick 
}: EditOptionsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Options</DialogTitle>
          <DialogDescription>
            Choose what you want to do with this estimate.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Button 
            onClick={onEditEstimate}
            className="flex items-center justify-center"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Estimate
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={onDeleteClick}
            className="flex items-center justify-center"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Estimate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditOptionsDialog;

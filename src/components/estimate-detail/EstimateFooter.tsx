
import { useState } from "react";
import { Estimate } from "@/types";
import { Button } from "@/components/ui/button";
import { FileText, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EstimateFooterProps {
  estimate: Estimate;
}

const EstimateFooter = ({ estimate }: EstimateFooterProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleEdit = () => {
    navigate(`/estimate/edit/${estimate.id}`);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteEstimate = async () => {
    if (!estimate.id) return;
    
    setIsDeleting(true);
    
    try {
      // First delete all line items related to this estimate
      const { error: lineItemsError } = await supabase
        .from("line_items")
        .delete()
        .eq("estimate_id", estimate.id);
        
      if (lineItemsError) throw lineItemsError;
      
      // Then delete the estimate itself
      const { error: estimateError } = await supabase
        .from("estimates")
        .delete()
        .eq("id", estimate.id);
        
      if (estimateError) throw estimateError;
      
      toast({
        title: "Estimate deleted",
        description: "The estimate has been successfully deleted.",
      });
      
      // Navigate back to the project page or dashboard
      if (estimate.project_id) {
        navigate(`/project/${estimate.project_id}`);
      } else {
        navigate("/dashboard");
      }
      
    } catch (error: any) {
      console.error("Error deleting estimate:", error);
      toast({
        title: "Error deleting estimate",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  return (
    <div className="w-full flex justify-between items-center py-4">
      <div className="flex gap-2">
        {estimate?.status === "pending" && (
          <>
            <Button variant="outline" size="sm">Decline</Button>
            <Button className="bg-green-600 hover:bg-green-700" size="sm">Approve Estimate</Button>
          </>
        )}
        {estimate?.status === "approved" && (
          <p className="text-sm text-green-600">This estimate has been approved</p>
        )}
        {estimate?.status === "declined" && (
          <p className="text-sm text-red-600">This estimate has been declined</p>
        )}
        
        {estimate?.status !== "approved" && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteClick}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>
      
      <Button variant="outline" size="sm">
        <FileText className="h-4 w-4 mr-2" />
        Download PDF
      </Button>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Estimate</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this estimate? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteEstimate}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EstimateFooter;

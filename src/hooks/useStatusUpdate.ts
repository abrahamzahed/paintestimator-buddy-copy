
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateProjectStatus, getStatusUpdateMessage } from "@/utils/projectStatusUtils";
import { Project } from "@/types";

export const useStatusUpdate = (onAfterUpdate?: () => void) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateStatus = useCallback(async (project: Project, newStatus: string) => {
    if (!project?.id) return false;
    
    // Prevent multiple concurrent update attempts
    if (isUpdating) {
      console.log("Update already in progress, ignoring request");
      return false;
    }
    
    try {
      // Set updating state to track progress - do this first
      setIsUpdating(true);
      setError(null);
      
      // Show optimistic toast immediately for better UX
      toast({
        title: `Project ${newStatus}`,
        description: getStatusUpdateMessage(project, newStatus),
      });
      
      // Perform the actual update
      await updateProjectStatus(project.id, newStatus);
      
      // If we get here, the update was successful
      if (onAfterUpdate) {
        // To avoid navigation race conditions when the user might cancel the dialog,
        // add a delay before executing the callback to ensure DOM operations complete
        setTimeout(() => {
          try {
            onAfterUpdate();
          } catch (callbackErr) {
            console.error("Error in update callback:", callbackErr);
          }
        }, 400);
      }
      
      // Reset updating state after a short delay to ensure UI has time to update
      setTimeout(() => {
        setIsUpdating(false);
      }, 500);
      
      return true;
    } catch (err) {
      console.error(`Error updating project status:`, err);
      setError(err instanceof Error ? err : new Error("Failed to update project status"));
      
      toast({
        title: `Failed to update project`,
        description: "An error occurred while trying to update the project status. Please try again.",
        variant: "destructive",
      });
      
      // Make sure we reset the updating state even in error cases
      setIsUpdating(false);
      return false;
    }
  }, [isUpdating, toast, onAfterUpdate]);

  return {
    updateStatus,
    isUpdating,
    error
  };
};

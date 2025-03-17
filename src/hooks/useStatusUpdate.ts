
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
      // Set updating state
      setIsUpdating(true);
      setError(null);
      
      // Show optimistic toast
      toast({
        title: `Project ${newStatus}`,
        description: getStatusUpdateMessage(project, newStatus),
      });
      
      // Perform the update
      await updateProjectStatus(project.id, newStatus);
      
      // If we reach here, update was successful
      if (onAfterUpdate) {
        // Small delay to ensure UI has updated
        setTimeout(onAfterUpdate, 300);
      }
      
      return true;
    } catch (err) {
      console.error(`Error updating project status:`, err);
      setError(err instanceof Error ? err : new Error("Failed to update project status"));
      
      toast({
        title: `Failed to update project`,
        description: "An error occurred while trying to update the project status. Please try again.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      // Always reset the updating state when done
      // Small delay to ensure UI has time to update
      setTimeout(() => {
        setIsUpdating(false);
      }, 200);
    }
  }, [isUpdating, toast, onAfterUpdate]);

  return {
    updateStatus,
    isUpdating,
    error
  };
};

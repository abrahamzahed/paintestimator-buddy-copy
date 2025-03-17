
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateProjectStatus, getStatusUpdateMessage } from "@/utils/projectStatusUtils";
import { Project } from "@/types";

export const useStatusUpdate = (onAfterUpdate?: () => void) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateStatus = async (project: Project, newStatus: string) => {
    if (!project?.id) return false;
    
    // Prevent multiple concurrent update attempts
    if (isUpdating) return false;
    
    // Set updating state to track progress
    setIsUpdating(true);
    setError(null);
    
    try {
      // Show optimistic toast immediately for better UX
      toast({
        title: `Project ${newStatus}`,
        description: getStatusUpdateMessage(project, newStatus),
      });
      
      // Perform the actual update
      await updateProjectStatus(project.id, newStatus);
      
      // If we get here, the update was successful
      if (onAfterUpdate) {
        // Execute callback immediately but don't await it
        // This allows the UI to remain responsive
        setTimeout(() => {
          try {
            onAfterUpdate();
          } catch (callbackErr) {
            console.error("Error in update callback:", callbackErr);
          }
        }, 350); // Slightly longer timeout to ensure dialog closes
      }
      
      // Mark operation as complete regardless of callback outcome
      setTimeout(() => {
        setIsUpdating(false);
      }, 500);
      
      return true;
    } catch (err) {
      console.error(`Error updating project status:`, err);
      setError(err instanceof Error ? err : new Error("Failed to update project status"));
      setIsUpdating(false);
      
      toast({
        title: `Failed to update project`,
        description: "An error occurred while trying to update the project status. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  return {
    updateStatus,
    isUpdating,
    error
  };
};

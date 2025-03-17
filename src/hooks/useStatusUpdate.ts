
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
      // Delay the callback to ensure UI is responsive
      if (onAfterUpdate) {
        // Use a longer timeout to allow database operations to complete
        setTimeout(() => {
          onAfterUpdate();
          setIsUpdating(false);
        }, 800); // Increased buffer time
      } else {
        setIsUpdating(false);
      }
      
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

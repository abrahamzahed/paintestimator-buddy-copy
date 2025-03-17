
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
      await updateProjectStatus(project.id, newStatus);
      
      toast({
        title: `Project ${newStatus}`,
        description: getStatusUpdateMessage(project, newStatus),
      });
      
      // Return true immediately to update UI
      setTimeout(() => {
        if (onAfterUpdate) {
          onAfterUpdate();
        }
      }, 300);
      
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
      setIsUpdating(false);
    }
  };

  return {
    updateStatus,
    isUpdating,
    error
  };
};

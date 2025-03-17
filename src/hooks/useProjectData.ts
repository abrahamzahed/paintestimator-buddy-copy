
import { useState, useEffect } from "react";
import { Project, Estimate, Invoice } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { fetchProjectWithRelated } from "@/utils/projectDataUtils";
import { updateProjectStatus, getStatusUpdateMessage } from "@/utils/projectStatusUtils";

export const useProjectData = (projectId: string | undefined) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        if (!projectId) return;
        
        const { project: projectData, estimates: estimatesData, invoices: invoicesData } = 
          await fetchProjectWithRelated(projectId);
        
        setProject(projectData);
        setEstimates(estimatesData);
        setInvoices(invoicesData);
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast({
          title: "Error loading project",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, toast]);

  const handleUpdateProjectStatus = async (newStatus: string) => {
    if (!projectId || !project) return;
    
    try {
      setIsUpdatingStatus(true);
      
      // Update the project status and related entities
      await updateProjectStatus(projectId, newStatus);
      
      // Update local project state to reflect the change
      setProject({
        ...project,
        status: newStatus
      });
      
      // Show success message
      toast({
        title: `Project ${newStatus}`,
        description: getStatusUpdateMessage(project, newStatus),
      });
      
      // Close any open dialogs
      setShowDeleteDialog(false);
      setShowArchiveDialog(false);
      setShowRestoreDialog(false);
      
      // Navigate to dashboard with a small delay to ensure state is updated
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
      
    } catch (error) {
      console.error(`Error updating project status to ${newStatus}:`, error);
      
      toast({
        title: `Failed to ${newStatus} project`,
        description: "An error occurred while trying to update the project. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return {
    project,
    estimates,
    invoices,
    loading,
    showDeleteDialog,
    setShowDeleteDialog,
    showArchiveDialog,
    setShowArchiveDialog,
    showRestoreDialog,
    setShowRestoreDialog,
    isUpdatingStatus,
    handleUpdateProjectStatus
  };
};

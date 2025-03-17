
import { useState, useEffect, useCallback } from "react";
import { Project, Estimate, Invoice } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { fetchProjectWithRelated } from "@/utils/projectDataUtils";
import { useStatusUpdate } from "@/hooks/useStatusUpdate";

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
  
  // Define a callback to handle data refresh without full page reload
  const refreshData = useCallback(async () => {
    try {
      if (!projectId) return;
      
      const { project: projectData, estimates: estimatesData, invoices: invoicesData } = 
        await fetchProjectWithRelated(projectId);
      
      setProject(projectData);
      setEstimates(estimatesData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error("Error refreshing project data:", error);
    }
  }, [projectId]);
  
  // Define a safe navigation function
  const safeNavigate = useCallback(() => {
    // Add a small class to body to show navigation state if needed
    document.body.classList.add('navigating');
    
    // Use window.location instead of React Router navigate
    // This ensures a clean state when returning to dashboard
    window.location.href = "/dashboard";
  }, []);
  
  // Use the updated status update hook with a callback that navigates after completion
  const { updateStatus, isUpdating: isUpdatingStatus } = useStatusUpdate(safeNavigate);

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
    
    // Close any open dialogs before starting the update
    setShowDeleteDialog(false);
    setShowArchiveDialog(false);
    setShowRestoreDialog(false);
    
    // Optimistically update the UI immediately
    setProject(prev => prev ? { ...prev, status: newStatus } : null);
    
    // Use the updated status update function
    await updateStatus(project, newStatus);
    // Navigation is handled by the callback provided to useStatusUpdate
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
    handleUpdateProjectStatus,
    refreshData
  };
};

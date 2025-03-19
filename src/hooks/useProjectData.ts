
import { useState, useEffect, useCallback } from "react";
import { Project, Estimate, Invoice } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { fetchProjectWithRelated } from "@/utils/projectDataUtils";
import { useStatusUpdate } from "@/hooks/useStatusUpdate";

export const useProjectData = (projectId?: string) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  
  const refreshData = useCallback(async () => {
    try {
      if (!projectId) {
        // If no projectId, just return empty data
        setProjects([]);
        setEstimates([]);
        setInvoices([]);
        return;
      }
      
      const { project, estimates: estimatesData, invoices: invoicesData } = 
        await fetchProjectWithRelated(projectId);
      
      // For single project view, add project to array
      setProjects(project ? [project as Project] : []);
      setEstimates(estimatesData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error("Error refreshing project data:", error);
      setError(error instanceof Error ? error : new Error("Unknown error"));
    }
  }, [projectId]);
  
  const navigateToDashboard = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);
  
  const { updateStatus, isUpdating: isUpdatingStatus } = useStatusUpdate(navigateToDashboard);

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        if (projectId) {
          // Single project view
          const { project, estimates: estimatesData, invoices: invoicesData } = 
            await fetchProjectWithRelated(projectId);
          
          setProjects(project ? [project as Project] : []);
          setEstimates(estimatesData);
          setInvoices(invoicesData);
        } else {
          // Dashboard view - would typically fetch multiple projects
          setProjects([]);
          setEstimates([]);
          setInvoices([]);
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
        setError(error instanceof Error ? error : new Error("Unknown error"));
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

  const handleUpdateProjectStatus = useCallback(async (newStatus: string) => {
    if (!projectId || projects.length === 0) return;
    
    // Close all dialogs first to avoid UI locks
    setShowDeleteDialog(false);
    setShowArchiveDialog(false);
    setShowRestoreDialog(false);
    
    if (!isUpdatingStatus) {
      // Optimistically update the UI
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
      
      // Trigger the actual API update
      await updateStatus(projects[0], newStatus);
    }
  }, [projectId, projects, isUpdatingStatus, updateStatus]);

  return {
    projects,
    estimates,
    invoices,
    loading,
    error,
    showDeleteDialog,
    setShowDeleteDialog,
    showArchiveDialog,
    setShowArchiveDialog,
    showRestoreDialog,
    setShowRestoreDialog,
    isUpdatingStatus,
    handleUpdateProjectStatus,
    refreshData,
    isLoading: loading // Add alias for isLoading
  };
};


import { useState, useEffect, useCallback } from "react";
import { Project, Estimate, Invoice } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { fetchProjectWithRelated } from "@/utils/projectDataUtils";
import { useStatusUpdate } from "@/hooks/useStatusUpdate";

export const useProjectData = (projectId?: string) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  
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
  
  const navigateToDashboard = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);
  
  const { updateStatus, isUpdating: isUpdatingStatus } = useStatusUpdate(navigateToDashboard);

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

  const handleUpdateProjectStatus = useCallback(async (newStatus: string) => {
    if (!projectId || !project) return;
    
    // Close all dialogs first to avoid UI locks
    setShowDeleteDialog(false);
    setShowArchiveDialog(false);
    setShowRestoreDialog(false);
    
    if (!isUpdatingStatus) {
      // Optimistically update the UI
      setProject(prev => prev ? { ...prev, status: newStatus } : null);
      
      // Trigger the actual API update
      await updateStatus(project, newStatus);
    }
  }, [projectId, project, isUpdatingStatus, updateStatus]);

  return {
    project,
    projects, // Added
    estimates,
    invoices,
    loading,
    isLoading, // Added
    error, // Added
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

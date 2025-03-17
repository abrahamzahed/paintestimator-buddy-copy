
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Project, Estimate, Invoice } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
    const fetchProjectData = async () => {
      try {
        if (!projectId) return;
        
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);
        
        const { data: estimatesData, error: estimatesError } = await supabase
          .from("estimates")
          .select("*")
          .eq("project_id", projectId)
          .neq("status_type", "deleted") // Filter out deleted estimates
          .order("created_at", { ascending: false });

        if (estimatesError) throw estimatesError;
        
        const formattedEstimates = estimatesData?.map(est => ({
          ...est,
          details: est.details as Record<string, any>,
          discount: est.discount || 0,
          notes: est.notes || ""
        })) as Estimate[];
        
        setEstimates(formattedEstimates);
        
        if (estimatesData && estimatesData.length > 0) {
          const estimateIds = estimatesData.map(estimate => estimate.id);
          
          const { data: invoicesData, error: invoicesError } = await supabase
            .from("invoices")
            .select("*")
            .in("estimate_id", estimateIds)
            .order("created_at", { ascending: false });

          if (invoicesError) throw invoicesError;
          setInvoices(invoicesData || []);
        }
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

    fetchProjectData();
  }, [projectId, toast]);

  const handleUpdateProjectStatus = async (newStatus: string) => {
    if (!projectId || !project) return;
    
    try {
      setIsUpdatingStatus(true);
      
      // 1. FIRST update all estimates linked to this project with the same status_type
      if (newStatus === "deleted" || newStatus === "archived" || newStatus === "active") {
        console.log(`1. Updating estimates to ${newStatus}`);
        const { error: estimatesError } = await supabase
          .from("estimates")
          .update({ status_type: newStatus })
          .eq("project_id", projectId);
          
        if (estimatesError) {
          console.error(`Error updating estimates to ${newStatus}:`, estimatesError);
          // Continue execution even if this fails
        }
        
        // 2. SECOND update all leads linked to this project with the same status
        console.log(`2. Updating leads to ${newStatus}`);
        const { error: leadsError } = await supabase
          .from("leads")
          .update({ status: newStatus })
          .eq("project_id", projectId);
          
        if (leadsError) {
          console.error(`Error updating leads to ${newStatus}:`, leadsError);
          // Continue execution even if this fails
        }
      }
      
      // 3. FINALLY update the project status
      console.log(`3. Updating project to ${newStatus}`);
      const { error: projectError } = await supabase
        .from("projects")
        .update({ status: newStatus })
        .eq("id", projectId);
        
      if (projectError) {
        throw projectError;
      }
      
      // Prepare toast message
      let toastMessage = "";
      
      if (newStatus === "deleted") {
        toastMessage = `"${project.name}" has been deleted from your dashboard`;
      } else if (newStatus === "archived") {
        toastMessage = `"${project.name}" has been archived`;
      } else if (newStatus === "active") {
        toastMessage = `"${project.name}" has been restored to active status`;
      }
      
      // Show success message
      toast({
        title: `Project ${newStatus}`,
        description: toastMessage,
      });
      
      // Important: Close dialogs first
      setShowDeleteDialog(false);
      setShowArchiveDialog(false);
      setShowRestoreDialog(false);
      setIsUpdatingStatus(false);
      
      // Use navigate instead of direct window.location for smoother transition
      navigate("/dashboard");
      
    } catch (error) {
      console.error(`Error updating project status to ${newStatus}:`, error);
      toast({
        title: `Failed to ${newStatus} project`,
        description: "An error occurred while trying to update the project",
        variant: "destructive",
      });
      setIsUpdatingStatus(false);
      setShowDeleteDialog(false);
      setShowArchiveDialog(false);
      setShowRestoreDialog(false);
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

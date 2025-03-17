import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Project, Estimate, Invoice } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { db } from "@/utils/supabase-helpers";

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
      console.log(`Starting status update process to: ${newStatus}`, { projectId, currentStatus: project.status });
      
      // Step 1: Update estimates first
      if (estimates.length > 0) {
        console.log(`1. Updating ${estimates.length} estimates to ${newStatus}`);
        const { error: estimatesError } = await supabase
          .from("estimates")
          .update({ status_type: newStatus })
          .eq("project_id", projectId);
          
        if (estimatesError) {
          console.error(`Error updating estimates to ${newStatus}:`, estimatesError);
          console.error(`Estimate update error details:`, JSON.stringify(estimatesError, null, 2));
          // Log but continue with the process
        } else {
          console.log(`✅ Successfully updated estimates to ${newStatus}`);
        }
      } else {
        console.log("No estimates to update");
      }
      
      // Step 2: Update any leads associated with this project
      console.log(`2. Updating leads to ${newStatus}`);
      const { error: leadsError } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("project_id", projectId);
        
      if (leadsError) {
        console.error(`Error updating leads to ${newStatus}:`, leadsError);
        console.error(`Leads update error details:`, JSON.stringify(leadsError, null, 2));
        // Log but continue with the process
      } else {
        console.log(`✅ Successfully updated leads to ${newStatus}`);
      }
      
      // Step 3: Update the project status directly - no delay necessary
      console.log(`3. Updating project to ${newStatus}`, { projectId });
      
      // Direct update to the projects table without referencing users table
      const { error: projectError } = await supabase
        .from("projects")
        .update({ status: newStatus })
        .eq("id", projectId);
        
      if (projectError) {
        console.error(`Error updating project to ${newStatus}:`, projectError);
        console.error(`Project update error details:`, JSON.stringify(projectError, null, 2));
        throw projectError;
      }
      
      console.log(`✅ Successfully updated project to ${newStatus}`);
      
      // Update local project state to reflect the change
      setProject({
        ...project,
        status: newStatus
      });
      
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
      
      // Navigate to dashboard with a small delay to ensure state is updated
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
      
    } catch (error) {
      console.error(`Error updating project status to ${newStatus}:`, error);
      console.error(`Stack trace:`, new Error().stack);
      console.error(`Project ID: ${projectId}, Current project data:`, project);
      
      // Check RLS-related information without using a non-existent RPC function
      console.log("Note: Unable to fetch RLS policies directly. Check Supabase dashboard for RLS policies.");
      
      // Try to investigate project table access directly
      try {
        console.log("Checking project table access permissions...");
        const { data: accessTest, error: accessError } = await supabase
          .from("projects")
          .select("id, name, status")
          .limit(1);
          
        if (accessError) {
          console.error("Error accessing projects table:", accessError);
        } else {
          console.log("Projects table access test result:", accessTest);
        }
      } catch (accessCheckError) {
        console.error("Error checking table access:", accessCheckError);
      }
      
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

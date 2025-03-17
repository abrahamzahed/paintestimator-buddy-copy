
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types";

export const updateProjectStatus = async (projectId: string, newStatus: string) => {
  if (!projectId) {
    throw new Error("Project ID is required to update status");
  }
  
  console.log(`Starting status update process to: ${newStatus}`, { projectId });
  
  try {
    // First update the project status - this is the critical part
    console.log(`Updating project to ${newStatus}`);
    const { error: projectError } = await supabase
      .from("projects")
      .update({ status: newStatus })
      .eq("id", projectId);
      
    if (projectError) {
      console.error(`Error updating project to ${newStatus}:`, projectError);
      throw projectError;
    }
    
    console.log(`✅ Successfully updated project to ${newStatus}`);
    
    // Start background updates in a separate function that won't block
    startBackgroundUpdates(projectId, newStatus);
    
    return newStatus;
  } catch (error) {
    console.error(`Failed to update project status to ${newStatus}:`, error);
    throw error;
  }
};

// Simple function to start background updates without waiting
function startBackgroundUpdates(projectId: string, newStatus: string) {
  // Use setTimeout to run this in the next event loop tick with increased delay
  setTimeout(() => {
    console.log("Starting background updates...");
    // Update estimates
    supabase
      .from("estimates")
      .update({ status_type: newStatus })
      .eq("project_id", projectId)
      .then(({ error }) => {
        if (error) {
          console.error(`Error updating estimates to ${newStatus}:`, error);
        } else {
          console.log(`✅ Successfully updated estimates to ${newStatus}`);
        }
      });
    
    // Update leads
    supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("project_id", projectId)
      .then(({ error }) => {
        if (error) {
          console.error(`Error updating leads to ${newStatus}:`, error);
        } else {
          console.log(`✅ Successfully updated leads to ${newStatus}`);
        }
      });
  }, 1200); // Increased delay to 1200ms
}

export const getStatusUpdateMessage = (project: Project, newStatus: string): string => {
  if (newStatus === "deleted") {
    return `"${project.name}" has been deleted from your dashboard`;
  } else if (newStatus === "archived") {
    return `"${project.name}" has been archived`;
  } else if (newStatus === "active") {
    return `"${project.name}" has been restored to active status`;
  }
  return `"${project.name}" status has been updated to ${newStatus}`;
};


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
    
    // Queue background updates without blocking
    queueBackgroundUpdates(projectId, newStatus);
    
    return newStatus;
  } catch (error) {
    console.error(`Failed to update project status to ${newStatus}:`, error);
    throw error;
  }
};

// Separate function to queue background updates
function queueBackgroundUpdates(projectId: string, newStatus: string) {
  // Use setTimeout with 0 delay to move this to the next event loop iteration
  setTimeout(() => {
    backgroundUpdates(projectId, newStatus).catch(error => {
      console.error("Error in background updates:", error);
    });
  }, 0);
}

// Function to handle background updates without blocking
async function backgroundUpdates(projectId: string, newStatus: string) {
  try {
    // Update estimates in the background
    console.log(`Updating estimates to ${newStatus}`);
    const { error: estimatesError } = await supabase
      .from("estimates")
      .update({ status_type: newStatus })
      .eq("project_id", projectId);
      
    if (estimatesError) {
      console.error(`Error updating estimates to ${newStatus}:`, estimatesError);
    } else {
      console.log(`✅ Successfully updated estimates to ${newStatus}`);
    }
    
    // Update leads in the background
    console.log(`Updating leads to ${newStatus}`);
    const { error: leadsError } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("project_id", projectId);
      
    if (leadsError) {
      console.error(`Error updating leads to ${newStatus}:`, leadsError);
    } else {
      console.log(`✅ Successfully updated leads to ${newStatus}`);
    }
  } catch (error) {
    console.error("Error in background updates:", error);
    // Don't throw from background task - we already updated the main project
  }
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

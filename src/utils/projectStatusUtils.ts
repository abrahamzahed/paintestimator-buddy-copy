
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types";

export const updateProjectStatus = async (projectId: string, newStatus: string) => {
  if (!projectId) {
    throw new Error("Project ID is required to update status");
  }
  
  console.log(`Starting status update process to: ${newStatus}`, { projectId });
  
  try {
    // Step 1: Update estimates first
    const { error: estimatesError } = await supabase
      .from("estimates")
      .update({ status_type: newStatus })
      .eq("project_id", projectId);
      
    if (estimatesError) {
      console.error(`Error updating estimates to ${newStatus}:`, estimatesError);
      // Log but continue with the process
    } else {
      console.log(`✅ Successfully updated estimates to ${newStatus}`);
    }
    
    // Step 2: Update any leads associated with this project
    console.log(`2. Updating leads to ${newStatus}`);
    const { error: leadsError } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("project_id", projectId);
      
    if (leadsError) {
      console.error(`Error updating leads to ${newStatus}:`, leadsError);
      // Log but continue with the process
    } else {
      console.log(`✅ Successfully updated leads to ${newStatus}`);
    }
    
    // Step 3: Update the project status directly using standard supabase client
    console.log(`3. Updating project to ${newStatus}`, { projectId });
    
    // Fetch the current user's session to get their ID - needed for RLS
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    
    console.log("Current user ID for RLS:", userId);
    
    // Fetch the project first to ensure it exists and to get its current user_id
    const { data: projectData, error: fetchError } = await supabase
      .from("projects")
      .select("user_id")
      .eq("id", projectId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching project:", fetchError);
      throw fetchError;
    }
    
    // Prepare the update payload - ensure we're not modifying user_id if it exists
    const updatePayload = { status: newStatus };
    
    // If project has no user_id assigned yet but we have the current user's ID, assign it
    if (!projectData.user_id && userId) {
      Object.assign(updatePayload, { user_id: userId });
    }
    
    const { error: projectError } = await supabase
      .from("projects")
      .update(updatePayload)
      .eq("id", projectId);
      
    if (projectError) {
      console.error(`Error updating project to ${newStatus}:`, projectError);
      throw projectError;
    }
    
    console.log(`✅ Successfully updated project to ${newStatus}`);
    
    return newStatus;
  } catch (error) {
    console.error(`Failed to update project status to ${newStatus}:`, error);
    throw error;
  }
};

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

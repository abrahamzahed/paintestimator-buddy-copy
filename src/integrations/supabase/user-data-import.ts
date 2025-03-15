
import { supabase } from "@/integrations/supabase/client";

export const importUserDataByEmail = async (userId: string, email: string) => {
  try {
    console.log("Running importUserDataByEmail for", userId, email);
    
    // 1. Find existing leads with this email
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .eq("email", email)
      .is("user_id", null); // Only get leads that aren't already associated with a user
    
    if (leadsError) {
      console.error("Error fetching leads:", leadsError);
      throw leadsError;
    }
    
    if (!leads || leads.length === 0) {
      console.log("No leads found to import for email:", email);
      return { success: true, message: "No leads found to import" };
    }
    
    console.log(`Found ${leads.length} leads to import for user ${userId}`);
    const projectsCreated = [];
    
    // 2. Process each lead
    for (const lead of leads) {
      console.log(`Processing lead ${lead.id}`);
      
      // Create a new project for this lead
      const projectName = lead.project_name || `${lead.name}'s Project`;
      console.log("Creating project:", projectName);
      
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          name: projectName,
          user_id: userId,
          description: lead.description || null,
          status: "active"
        })
        .select()
        .single();
      
      if (projectError) {
        console.error("Error creating project:", projectError);
        continue;
      }
      
      const projectId = project.id;
      projectsCreated.push(project.name);
      
      console.log(`Created project ${projectId} for lead ${lead.id}`);
      
      // 3. Update the lead with user_id and project_id
      // IMPORTANT: This is where the previous code was failing
      const { error: updateLeadError } = await supabase
        .from("leads")
        .update({
          user_id: userId,
          project_id: projectId
        })
        .eq("id", lead.id);
      
      if (updateLeadError) {
        console.error("Error updating lead:", updateLeadError);
        continue;
      }
      
      console.log(`Updated lead ${lead.id} with user_id ${userId} and project_id ${projectId}`);
      
      // 4. Update any estimates linked to this lead
      const { data: estimates, error: estimatesError } = await supabase
        .from("estimates")
        .select("*")
        .eq("lead_id", lead.id);
      
      if (estimatesError) {
        console.error("Error fetching estimates:", estimatesError);
        continue;
      }
      
      if (estimates && estimates.length > 0) {
        console.log(`Found ${estimates.length} estimates to update for lead ${lead.id}`);
        
        for (const estimate of estimates) {
          // Update each estimate individually to ensure all are processed
          const { error: updateEstimateError } = await supabase
            .from("estimates")
            .update({
              project_id: projectId,
              user_id: userId
            })
            .eq("id", estimate.id);
          
          if (updateEstimateError) {
            console.error(`Error updating estimate ${estimate.id}:`, updateEstimateError);
          } else {
            console.log(`Updated estimate ${estimate.id} with project_id ${projectId} and user_id ${userId}`);
          }
        }
      } else {
        console.log(`No estimates found for lead ${lead.id}`);
      }
    }
    
    return { 
      success: true, 
      message: `Imported ${leads.length} lead(s) and created ${projectsCreated.length} project(s).`
    };
  } catch (error: any) {
    console.error("Error in importUserDataByEmail:", error);
    return { 
      success: false, 
      message: error.message || "An error occurred during data import."
    };
  }
};

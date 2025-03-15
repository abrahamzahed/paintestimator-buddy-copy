
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/utils/supabase-helpers";

export const importUserDataByEmail = async (userId: string, email: string) => {
  try {
    console.log("Running importUserDataByEmail for", userId, email);
    
    // 1. Find existing leads with this email that aren't already associated with a user
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .eq("email", email)
      .is("user_id", null);
    
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
    const estimatesCreated = [];
    
    // 2. Process each lead
    for (const lead of leads) {
      console.log(`Processing lead ${lead.id}`);
      
      // Check if this lead already has a project assigned but not linked to the lead
      // This can happen if a user logs out and logs back in before the lead is updated
      const { data: existingProjects, error: existingProjectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("name", lead.project_name || `${lead.name}'s Project`)
        .eq("user_id", userId);
        
      if (existingProjectsError) {
        console.error("Error checking existing projects:", existingProjectsError);
        continue;
      }
      
      let projectId;
      let projectName = lead.project_name || `${lead.name}'s Project`;
      
      if (existingProjects && existingProjects.length > 0) {
        // Use existing project instead of creating a new one
        projectId = existingProjects[0].id;
        projectName = existingProjects[0].name;
        console.log(`Using existing project ${projectId} for lead ${lead.id}`);
      } else {
        // Create a new project for this lead
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
        
        projectId = project.id;
        projectsCreated.push(project.name);
        
        console.log(`Created project ${projectId} for lead ${lead.id}`);
      }
      
      // 3. Update the lead with user_id and project_id
      // CRITICAL: This is to prevent duplicate projects being created on subsequent logins
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
      
      // 4. Create estimate from the lead details if available
      if (lead.details) {
        try {
          // First check if an estimate already exists for this lead
          const { data: existingEstimates, error: existingEstimatesError } = await supabase
            .from("estimates")
            .select("*")
            .eq("lead_id", lead.id);
          
          if (existingEstimatesError) {
            console.error("Error checking existing estimates:", existingEstimatesError);
            continue;
          }
          
          if (existingEstimates && existingEstimates.length > 0) {
            console.log(`Estimate already exists for lead ${lead.id}, skipping import`);
            continue;
          }
          
          // Parse lead details JSON
          let detailsData;
          try {
            detailsData = typeof lead.details === 'string' ? JSON.parse(lead.details) : lead.details;
          } catch (e) {
            console.error("Error parsing lead details:", e);
            continue;
          }
          
          if (detailsData && detailsData.estimateSummary) {
            const estimateSummary = detailsData.estimateSummary;
            
            // Create estimate from lead details
            const estimateData = {
              lead_id: lead.id,
              project_id: projectId,
              project_name: projectName,
              details: detailsData,
              labor_cost: estimateSummary.finalTotal * 0.7, // Approximate labor as 70% of total
              material_cost: estimateSummary.finalTotal * 0.3, // Approximate materials as 30% of total
              total_cost: estimateSummary.finalTotal,
              estimated_hours: estimateSummary.finalTotal / 75, // Rough estimate based on hourly rate
              estimated_paint_gallons: 0, // Will calculate later if needed
              notes: `Imported from lead ${lead.id}`,
              discount: estimateSummary.volumeDiscount || 0,
              status: "pending",
              status_type: "estimate"
            };
            
            const { data: estimate, error: estimateError } = await supabase
              .from("estimates")
              .insert(estimateData)
              .select()
              .single();
            
            if (estimateError) {
              console.error("Error creating estimate:", estimateError);
              continue;
            }
            
            console.log(`Created estimate ${estimate.id} for lead ${lead.id} and project ${projectId}`);
            estimatesCreated.push(estimate.id);
          } else {
            console.log(`No estimate data found in lead ${lead.id} details`);
          }
        } catch (estimateError) {
          console.error("Error processing estimate for lead:", lead.id, estimateError);
        }
      }
    }
    
    return { 
      success: true, 
      message: `Imported ${leads.length} lead(s), created ${projectsCreated.length} project(s), and ${estimatesCreated.length} estimate(s).`
    };
  } catch (error: any) {
    console.error("Error in importUserDataByEmail:", error);
    return { 
      success: false, 
      message: error.message || "An error occurred during data import."
    };
  }
};

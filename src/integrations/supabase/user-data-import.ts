import { supabase } from "@/integrations/supabase/client";
import { db } from "@/utils/supabase-helpers";

export const importUserDataByEmail = async (userId: string, email: string) => {
  try {
    console.log("Running importUserDataByEmail for", userId, email);
    
    // STEP 1: Find projects created by guest with this email
    const { data: guestProjects, error: guestProjectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("guest_email", email)
      .is("user_id", null);
    
    if (guestProjectsError) {
      console.error("Error fetching guest projects:", guestProjectsError);
      throw guestProjectsError;
    }
    
    // Process guest projects first to link them to the user
    if (guestProjects && guestProjects.length > 0) {
      console.log(`Found ${guestProjects.length} guest projects to import for email:`, email);
      
      for (const project of guestProjects) {
        console.log(`Processing guest project ${project.id}`);
        
        // Link project to the logged-in user
        const { error: updateProjectError } = await supabase
          .from("projects")
          .update({
            user_id: userId,
            // Keep guest_email for tracking purposes
          })
          .eq("id", project.id);
        
        if (updateProjectError) {
          console.error("Error updating guest project with user ID:", updateProjectError);
          continue;
        }
        
        console.log(`Updated project ${project.id} with user_id ${userId}`);
        
        // Find and update any leads associated with this project
        const { data: projectLeads, error: projectLeadsError } = await supabase
          .from("leads")
          .select("*")
          .eq("project_id", project.id)
          .is("user_id", null);
        
        if (projectLeadsError) {
          console.error("Error fetching leads for project:", projectLeadsError);
          continue;
        }
        
        if (projectLeads && projectLeads.length > 0) {
          console.log(`Found ${projectLeads.length} leads associated with project ${project.id}`);
          
          for (const lead of projectLeads) {
            // Update the lead with user_id
            const { error: updateLeadError } = await supabase
              .from("leads")
              .update({ user_id: userId })
              .eq("id", lead.id);
            
            if (updateLeadError) {
              console.error("Error updating lead with user ID:", updateLeadError);
              continue;
            }
            
            console.log(`Updated lead ${lead.id} with user_id ${userId}`);
          }
        }
        
        // Find and update any estimates associated with this project
        const { data: projectEstimates, error: projectEstimatesError } = await supabase
          .from("estimates")
          .select("*")
          .eq("project_id", project.id);
        
        if (projectEstimatesError) {
          console.error("Error fetching estimates for project:", projectEstimatesError);
          continue;
        }
        
        if (projectEstimates && projectEstimates.length > 0) {
          console.log(`Found ${projectEstimates.length} estimates associated with project ${project.id}`);
          
          // No need to update estimates as they're already linked to the project
          // The project is now linked to the user, so the user can access these estimates
        }
      }
    }
    
    // STEP 2: Find existing leads with this email that aren't already associated with a user
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
      
      if (guestProjects && guestProjects.length > 0) {
        return { 
          success: true, 
          message: `Imported ${guestProjects.length} project(s) associated with your email address.`
        };
      }
      
      return { success: true, message: "No leads found to import" };
    }
    
    console.log(`Found ${leads.length} leads to import for user ${userId}`);
    const projectsCreated = [];
    const estimatesCreated = [];
    
    // STEP 3: Process each lead
    for (const lead of leads) {
      console.log(`Processing lead ${lead.id}`);
      
      // Check if this lead already has a project assigned
      let projectId = lead.project_id;
      let projectName = lead.project_name || `${lead.name}'s Project`;
      
      // If no project is associated with the lead, create one
      if (!projectId) {
        console.log("No project associated with lead, creating project:", projectName);
        
        const { data: project, error: projectError } = await supabase
          .from("projects")
          .insert({
            name: projectName,
            user_id: userId,
            description: lead.description || null,
            status: "active",
            guest_email: lead.email
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
      } else {
        // Link existing project to the user if not already
        const { data: existingProject, error: getProjectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();
        
        if (getProjectError) {
          console.error("Error getting existing project:", getProjectError);
          continue;
        }
        
        if (existingProject && !existingProject.user_id) {
          const { error: updateProjectError } = await supabase
            .from("projects")
            .update({ user_id: userId })
            .eq("id", projectId);
          
          if (updateProjectError) {
            console.error("Error updating existing project:", updateProjectError);
            continue;
          }
          
          projectsCreated.push(existingProject.name);
          console.log(`Linked existing project ${projectId} to user ${userId}`);
        }
      }
      
      // Update the lead with user_id and project_id if needed
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
      
      // Check if an estimate already exists for this lead
      const { data: existingEstimates, error: existingEstimatesError } = await supabase
        .from("estimates")
        .select("*")
        .eq("lead_id", lead.id);
      
      if (existingEstimatesError) {
        console.error("Error checking existing estimates:", existingEstimatesError);
        continue;
      }
      
      // If estimate already exists, we don't need to create a new one
      if (existingEstimates && existingEstimates.length > 0) {
        console.log(`Estimate already exists for lead ${lead.id}, skipping creation`);
        
        // Make sure the estimate is linked to the project
        for (const estimate of existingEstimates) {
          if (!estimate.project_id || estimate.project_id !== projectId) {
            const { error: updateEstimateError } = await supabase
              .from("estimates")
              .update({ project_id: projectId })
              .eq("id", estimate.id);
            
            if (updateEstimateError) {
              console.error("Error updating estimate project link:", updateEstimateError);
              continue;
            }
            
            console.log(`Updated estimate ${estimate.id} to link to project ${projectId}`);
          }
        }
        
        continue;
      }
      
      // Create estimate from the lead details if available
      if (lead.details) {
        try {
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
            const roomDetails = detailsData.roomDetails || [];
            
            // Extract room-related data for the new estimates table columns
            const roomTypes = roomDetails.map((room: any) => room.roomType || "");
            const roomSizes = roomDetails.map((room: any) => room.roomSize || "");
            const wallCounts = roomDetails.map((room: any) => room.wallsCount || 0);
            const wallHeights = roomDetails.map((room: any) => room.wallHeight || 0);
            const wallWidths = roomDetails.map((room: any) => room.wallWidth || 0);
            const wallConditions = roomDetails.map((room: any) => room.condition || "");
            const paintTypes = roomDetails.map((room: any) => room.paintType || "");
            const includeCeilings = roomDetails.map((room: any) => room.includeCeiling || false);
            const includeBaseboards = roomDetails.map((room: any) => room.includeBaseboards || false);
            const baseboardsMethods = roomDetails.map((room: any) => room.baseboardsMethod || "");
            const includeCrownMoldings = roomDetails.map((room: any) => room.includeCrownMolding || false);
            const hasHighCeilings = roomDetails.map((room: any) => room.hasHighCeiling || false);
            const includeClosets = roomDetails.map((room: any) => room.includeCloset || false);
            const doorsCountPerRoom = roomDetails.map((room: any) => room.doorsCount || 0);
            const windowsCountPerRoom = roomDetails.map((room: any) => room.windowsCount || 0);
            
            const isEmptyHouse = roomDetails.some((room: any) => room.isEmptyHouse);
            const needsFloorCovering = roomDetails.some((room: any) => room.needFloorCovering);
            
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
              estimated_paint_gallons: estimateSummary.paintCans || 0,
              notes: `Imported from lead ${lead.id}`,
              discount: estimateSummary.volumeDiscount || 0,
              status: "pending",
              status_type: "estimate",
              // Add the new fields
              room_types: roomTypes,
              room_sizes: roomSizes,
              wall_counts: wallCounts,
              wall_heights: wallHeights,
              wall_widths: wallWidths,
              wall_conditions: wallConditions,
              paint_types: paintTypes,
              include_ceilings: includeCeilings,
              include_baseboards: includeBaseboards,
              baseboards_methods: baseboardsMethods,
              include_crown_moldings: includeCrownMoldings,
              has_high_ceilings: hasHighCeilings,
              include_closets: includeClosets,
              doors_count_per_room: doorsCountPerRoom,
              windows_count_per_room: windowsCountPerRoom,
              is_empty_house: isEmptyHouse,
              needs_floor_covering: needsFloorCovering
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
      message: `Imported ${leads.length} lead(s), linked ${guestProjects?.length || 0} guest project(s), created ${projectsCreated.length} new project(s), and ${estimatesCreated.length} estimate(s).`
    };
  } catch (error: any) {
    console.error("Error in importUserDataByEmail:", error);
    return { 
      success: false, 
      message: error.message || "An error occurred during data import."
    };
  }
};

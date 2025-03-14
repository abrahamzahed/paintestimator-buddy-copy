
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUserDataImport = () => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);

  const importUserData = async (userId: string, userEmail: string) => {
    if (!userId || !userEmail || importComplete) return;
    
    try {
      setIsImporting(true);
      console.log("Starting data import for user:", userId, "with email:", userEmail);
      
      // 1. Find leads with matching email that aren't assigned to a user
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .eq("email", userEmail)
        .is("user_id", null);
      
      if (leadsError) throw leadsError;
      
      if (!leads || leads.length === 0) {
        console.log("No leads found for import with email:", userEmail);
        setImportComplete(true);
        return;
      }
      
      console.log(`Found ${leads.length} leads to import for email:`, userEmail);
      
      // Process each lead
      for (const lead of leads) {
        let projectId = lead.project_id;
        
        // If lead doesn't have a project, create one
        if (!projectId) {
          const projectName = lead.project_name || `${lead.name}'s Project`;
          
          console.log("Creating new project:", projectName);
          
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
          
          // Update lead with the new project_id and user_id
          const { error: updateLeadError } = await supabase
            .from("leads")
            .update({ 
              user_id: userId,
              project_id: projectId 
            })
            .eq("id", lead.id);
          
          if (updateLeadError) {
            console.error("Error updating lead:", updateLeadError);
          } else {
            console.log(`Updated lead ${lead.id} with user_id and project_id`);
          }
        } else {
          // If the project exists, update its user_id if not already set
          const { error: updateProjectError } = await supabase
            .from("projects")
            .update({ user_id: userId })
            .eq("id", projectId)
            .is("user_id", null);
          
          if (updateProjectError) {
            console.error("Error updating project:", updateProjectError);
          }
          
          // Update the lead's user_id
          const { error: updateLeadError } = await supabase
            .from("leads")
            .update({ user_id: userId })
            .eq("id", lead.id);
          
          if (updateLeadError) {
            console.error("Error updating lead:", updateLeadError);
          }
        }
        
        // Update any estimates linked to this lead
        const { error: updateEstimatesError } = await supabase
          .from("estimates")
          .update({ 
            project_id: projectId,
            user_id: userId
          })
          .eq("lead_id", lead.id);
        
        if (updateEstimatesError) {
          console.error("Error updating estimates:", updateEstimatesError);
        } else {
          console.log(`Updated estimates for lead ${lead.id}`);
        }
      }
      
      // Notify user of successful import
      if (leads.length > 0) {
        toast({
          title: "Data imported successfully",
          description: `${leads.length} lead(s) and their estimates have been imported to your account.`,
        });
      }
      
      setImportComplete(true);
    } catch (error: any) {
      console.error("Error importing user data:", error);
      toast({
        title: "Error importing data",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importUserData,
    isImporting,
    importComplete,
    resetImportState: () => setImportComplete(false)
  };
};

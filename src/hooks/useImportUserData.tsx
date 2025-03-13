
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

export const useImportUserData = (userId: string | null, email: string | null) => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [isImportComplete, setIsImportComplete] = useState(false);

  const importUserData = async () => {
    if (!userId || !email) return;
    
    try {
      setIsImporting(true);
      
      // 1. Find leads with matching email address
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .eq("email", email)
        .is("user_id", null); // Only get leads that aren't already associated with a user
      
      if (leadsError) throw leadsError;
      
      if (leads && leads.length > 0) {
        // 2. For each lead, create a project if it doesn't have one
        for (const lead of leads) {
          let projectId = lead.project_id;
          
          // If no project exists, create one
          if (!projectId) {
            const projectName = lead.project_name || `${lead.name}'s Project`;
            
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
            
            if (projectError) throw projectError;
            projectId = project.id;
            
            // 3. Update the lead with user_id and project_id
            await supabase
              .from("leads")
              .update({
                user_id: userId,
                project_id: projectId
              })
              .eq("id", lead.id);
          }
          
          // 4. Find estimates linked to this lead
          const { data: estimates, error: estimatesError } = await supabase
            .from("estimates")
            .select("*")
            .eq("lead_id", lead.id);
          
          if (estimatesError) throw estimatesError;
          
          if (estimates && estimates.length > 0) {
            // 5. Update the estimates with the project_id
            for (const estimate of estimates) {
              await supabase
                .from("estimates")
                .update({
                  project_id: projectId,
                  project_name: lead.project_name || `${lead.name}'s Project`
                })
                .eq("id", estimate.id);
            }
          }
        }
        
        toast({
          title: "Data imported successfully",
          description: `${leads.length} lead(s) and their estimates have been imported to your account.`,
        });
      }
      
      setIsImportComplete(true);
    } catch (error: any) {
      console.error("Error importing user data:", error);
      toast({
        title: "Error importing data",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return { importUserData, isImporting, isImportComplete };
};

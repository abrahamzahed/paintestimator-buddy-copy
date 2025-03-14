
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/context/use-session";

export function useSyncUserData() {
  const { user } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Only run once when user is available and we haven't synced yet
    const syncUserData = async () => {
      if (!user?.id || !user?.email || isSyncing || syncComplete) {
        return;
      }

      try {
        setIsSyncing(true);
        console.log("Starting data sync for user:", user.id, "with email:", user.email);

        // Find leads with matching email that aren't assigned to this user
        const { data: leads, error: leadsError } = await supabase
          .from("leads")
          .select("*")
          .eq("email", user.email)
          .is("user_id", null);

        if (leadsError) {
          console.error("Error fetching leads:", leadsError);
          return;
        }

        if (!leads || leads.length === 0) {
          console.log("No leads found to sync for email:", user.email);
          setSyncComplete(true);
          return;
        }

        console.log(`Found ${leads.length} leads to sync for user:`, user.id);
        let syncedCount = 0;
        
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
                user_id: user.id,
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
            
            // Update lead with project_id and user_id
            const { error: updateLeadError } = await supabase
              .from("leads")
              .update({ 
                user_id: user.id,
                project_id: projectId 
              })
              .eq("id", lead.id);
            
            if (updateLeadError) {
              console.error("Error updating lead:", updateLeadError);
              continue;
            }
            
            console.log(`Updated lead ${lead.id} with user_id and new project_id`);
          } else {
            // Project exists, just update lead user_id
            const { error: updateLeadError } = await supabase
              .from("leads")
              .update({ user_id: user.id })
              .eq("id", lead.id);
            
            if (updateLeadError) {
              console.error("Error updating lead:", updateLeadError);
              continue;
            }
            
            console.log(`Updated lead ${lead.id} with user_id`);
          }
          
          // Update any estimates linked to this lead
          const { data: estimates, error: estimatesError } = await supabase
            .from("estimates")
            .select("*")
            .eq("lead_id", lead.id);
            
          if (estimatesError) {
            console.error("Error fetching estimates:", estimatesError);
            continue;
          }
          
          if (estimates && estimates.length > 0) {
            const { error: updateEstimatesError } = await supabase
              .from("estimates")
              .update({ 
                project_id: projectId,
                user_id: user.id 
              })
              .eq("lead_id", lead.id);
            
            if (updateEstimatesError) {
              console.error("Error updating estimates:", updateEstimatesError);
              continue;
            }
            
            console.log(`Updated ${estimates.length} estimates for lead ${lead.id}`);
          }
          
          syncedCount++;
        }
        
        if (syncedCount > 0) {
          toast({
            title: "Data synchronized",
            description: `${syncedCount} lead(s) and their estimates have been added to your account.`,
          });
        }

        setSyncComplete(true);
      } catch (error: any) {
        console.error("Error syncing user data:", error);
        toast({
          title: "Error syncing data",
          description: error.message || "An unexpected error occurred while syncing your data.",
          variant: "destructive",
        });
      } finally {
        setIsSyncing(false);
      }
    };

    syncUserData();
  }, [user, isSyncing, syncComplete, toast]);

  return {
    isSyncing,
    syncComplete,
    resetSyncState: () => setSyncComplete(false)
  };
}


import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/context/use-session";
import { importUserDataByEmail } from "@/integrations/supabase/user-data-import";

export function useSyncUserData() {
  const { user, refreshProfile } = useSession();
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

        const result = await importUserDataByEmail(user.id, user.email);
        
        if (result.success) {
          // Only show toast if something was actually imported
          if (result.message.includes("lead") || result.message.includes("project")) {
            toast({
              title: "Data synchronized",
              description: result.message,
            });
            
            // Refresh the user profile to update any UI state that depends on the user's data
            await refreshProfile();
          }
        } else {
          toast({
            title: "Error syncing data",
            description: result.message,
            variant: "destructive",
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
  }, [user, isSyncing, syncComplete, toast, refreshProfile]);

  return {
    isSyncing,
    syncComplete,
    resetSyncState: () => setSyncComplete(false),
    resync: () => {
      setSyncComplete(false); // Trigger a re-sync
    }
  };
}

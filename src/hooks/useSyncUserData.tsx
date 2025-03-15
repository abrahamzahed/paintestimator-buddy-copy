
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
    // Skip data sync entirely on authentication pages
    if (window.location.pathname.includes('/auth')) {
      console.log("Skipping data sync on auth page");
      setSyncComplete(true);
      return;
    }

    // Only run once when user is available and we haven't synced yet
    const syncUserData = async () => {
      // Don't proceed if no user, already syncing, or already completed
      if (!user?.id || !user?.email || isSyncing || syncComplete) {
        return;
      }

      try {
        setIsSyncing(true);
        console.log("Starting data sync for user:", user.id, "with email:", user.email);
        
        const result = await importUserDataByEmail(user.id, user.email);
        
        if (result.success) {
          const { projects, leads, estimates } = result.data || { projects: 0, leads: 0, estimates: 0 };
          
          // Only show toast if something was actually imported
          if (projects > 0 || leads > 0 || estimates > 0) {
            toast({
              title: "Data synchronized",
              description: result.message,
            });
            
            // Refresh the user profile to update any UI state that depends on the user's data
            await refreshProfile();
            
            // Force a page reload to reflect the newly imported data
            window.location.reload();
          }
        } else {
          console.log("No data to sync or sync failed:", result.message);
        }
      } catch (error: any) {
        console.error("Error in user data sync:", error);
      } finally {
        setSyncComplete(true);
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
      setSyncComplete(false);
      setIsSyncing(false);
    }
  };
}

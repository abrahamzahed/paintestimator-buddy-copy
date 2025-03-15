
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

        // Skip the synchronization step if we're in the authentication process
        // We'll do this by checking if we're on an auth page
        const isAuthPage = window.location.pathname.includes('/auth');
        if (isAuthPage) {
          console.log("Skipping data sync on auth page");
          setSyncComplete(true);
          return;
        }

        // Use the current user data from the session instead of fetching from auth.users
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
          }
        } else {
          console.log("No data to sync or sync failed:", result.message);
          
          // Don't show error toast for normal "no data found" cases
          if (result.message !== 'No data found to import.') {
            toast({
              title: "Error syncing data",
              description: result.message,
              variant: "destructive",
            });
          }
        }

        setSyncComplete(true);
      } catch (error: any) {
        console.error("Error syncing user data:", error);
        
        // Silently handle the error without showing a toast on the auth page
        const isAuthPage = window.location.pathname.includes('/auth');
        if (!isAuthPage) {
          toast({
            title: "Data sync skipped",
            description: "We'll try again later.",
            variant: "default",
          });
        }
        
        // Still mark as complete to prevent continuous retries
        setSyncComplete(true);
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

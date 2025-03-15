
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

      // Never run sync on authentication pages to avoid disrupting login flow
      if (window.location.pathname.includes('/auth')) {
        setSyncComplete(true);
        return;
      }

      try {
        setIsSyncing(true);
        console.log("Starting data sync for user:", user.id, "with email:", user.email);
        
        // Only attempt sync after a short delay to allow authentication to complete
        setTimeout(async () => {
          try {
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
              if (result.message !== 'No data found to import.' && !window.location.pathname.includes('/auth')) {
                toast({
                  title: "Info",
                  description: "No previous data found to import.",
                  variant: "default",
                });
              }
            }
            
            setSyncComplete(true);
            setIsSyncing(false);
          } catch (error) {
            console.error("Error in sync timeout handler:", error);
            setSyncComplete(true);
            setIsSyncing(false);
          }
        }, 1000); // Delay sync attempt by 1 second
        
      } catch (error: any) {
        console.error("Error initiating user data sync:", error);
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
      setSyncComplete(false); // Trigger a re-sync
    }
  };
}

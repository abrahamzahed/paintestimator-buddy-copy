
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

/**
 * Service for handling authentication-related operations
 */
export const AuthService = {
  /**
   * Gets the current session
   */
  getSession: async (): Promise<Session | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  },

  /**
   * Signs out the current user
   */
  signOut: async (): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error: any) {
      console.error("Error in signOut:", error);
      return { error };
    }
  },

  /**
   * Sets up an auth state change listener
   */
  onAuthStateChange: (callback: (session: Session | null, user: User | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id || "No user");
        callback(session, session?.user ?? null);
      }
    );

    return subscription;
  }
};

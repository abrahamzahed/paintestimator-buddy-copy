
import { supabase } from "@/integrations/supabase/client";
import { Tables, typedFrom } from "./supabase-types";

// Helper functions for typed Supabase operations
export function useTypedSupabase() {
  return {
    /**
     * Get a typed query builder for a table
     */
    from<T extends keyof Tables>(table: T) {
      return supabase.from(typedFrom(table));
    },
    
    /**
     * Get auth functions with proper typing
     */
    auth: {
      ...supabase.auth,
      getUser: async () => {
        const { data, error } = await supabase.auth.getUser();
        return { data, error };
      },
      getSession: async () => {
        const { data, error } = await supabase.auth.getSession();
        return { data, error };
      }
    },
    
    /**
     * Get storage functions
     */
    storage: supabase.storage
  };
}

// Export a pre-initialized instance
export const db = useTypedSupabase();


import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Profile } from "./types";

export const useProfile = () => {
  const fetchProfile = async (userId: string, user?: User | null): Promise<Profile | null> => {
    try {
      console.log("Fetching profile for user:", userId);
      
      // Query the profiles table to get the user's profile
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      
      if (!profile) {
        console.log("No profile found for user:", userId);
        return null;
      }
      
      return profile as Profile;
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      return null;
    }
  };
  
  return { fetchProfile };
};

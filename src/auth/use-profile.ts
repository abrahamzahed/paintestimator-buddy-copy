
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "./types";
import { useToast } from "@/common/hooks/use-toast";
import { User } from "@supabase/supabase-js";

/**
 * Hook for fetching and managing user profiles
 */
export const useProfile = () => {
  const { toast } = useToast();

  /**
   * Fetches a user's profile or creates one if it doesn't exist
   */
  const fetchProfile = async (userId: string, user: User | null = null): Promise<Profile | null> => {
    try {
      console.log("Fetching profile for user:", userId);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.log("Error fetching profile:", error);
        
        if (error.code === 'PGRST116') {
          console.log("No profile found, creating new profile");
          if (!user) {
            console.error("User not available for profile creation");
            return null;
          }
          
          const userData = user.user_metadata;
          console.log("User metadata for profile creation:", userData);
          
          try {
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert([{
                id: userId,
                name: userData?.full_name || userData?.name || user?.email?.split('@')[0] || null,
                email: user?.email || null,
                phone: userData?.phone || null,
                address: userData?.address || null,
                role: "customer"
              }])
              .select();
              
            if (createError) {
              console.error("Error creating profile:", createError);
              toast({
                title: "Profile creation failed",
                description: "We couldn't create your profile. Please try refreshing the page.",
                variant: "destructive",
              });
              throw createError;
            }
            
            console.log("New profile created successfully:", newProfile?.[0]);
            return newProfile?.[0] as Profile;
          } catch (createError: any) {
            console.error("Error in profile creation:", createError);
            toast({
              title: "Profile creation failed",
              description: "We couldn't create your profile. Please try refreshing the page.",
              variant: "destructive",
            });
            return null;
          }
        } else {
          toast({
            title: "Error loading profile",
            description: "Please try refreshing the page or contact support.",
            variant: "destructive",
          });
          return null;
        }
      }

      console.log("Profile fetched successfully:", data);
      return data as Profile;
    } catch (error) {
      console.error("Error in fetchProfile function:", error);
      return null;
    }
  };

  return { fetchProfile };
};

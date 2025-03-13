
import { createContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile, SessionContextType } from "./session-types";

export const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
  isAdmin: false,
  isStaff: false,
  refreshProfile: async () => {},
});

export const SessionContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Function to import leads and create projects for the user
  const importLeadsForUser = async (userId: string, userEmail: string) => {
    try {
      console.log("Checking for leads to import for email:", userEmail);
      
      // 1. First, check for leads with the user's email
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .eq("email", userEmail)
        .is("user_id", null); // Only get leads not already linked to a user
      
      if (leadsError) {
        console.error("Error fetching leads:", leadsError);
        return;
      }
      
      if (!leads || leads.length === 0) {
        console.log("No leads found for import");
        return;
      }
      
      console.log(`Found ${leads.length} leads to import`);
      
      // Process each lead
      for (const lead of leads) {
        // 2. Create a project for each lead
        let projectId = lead.project_id;
        
        if (!projectId) {
          // Create new project if one doesn't exist
          const { data: project, error: projectError } = await supabase
            .from("projects")
            .insert([{
              name: lead.project_name || `${lead.service_type} Project`,
              user_id: userId,
              description: lead.description || `Imported from lead: ${lead.name}`,
              status: "active"
            }])
            .select()
            .single();
          
          if (projectError) {
            console.error("Error creating project:", projectError);
            continue;
          }
          
          projectId = project.id;
          console.log("Created new project:", projectId);
        }
        
        // 3. Update the lead with the user_id and project_id
        const { error: updateLeadError } = await supabase
          .from("leads")
          .update({ 
            user_id: userId,
            project_id: projectId 
          })
          .eq("id", lead.id);
        
        if (updateLeadError) {
          console.error("Error updating lead:", updateLeadError);
          continue;
        }
        
        console.log(`Updated lead ${lead.id} with user_id and project_id`);
        
        // 4. Update any estimates associated with this lead to link to the project
        if (lead.id) {
          const { error: updateEstimatesError } = await supabase
            .from("estimates")
            .update({ 
              project_id: projectId,
              project_name: lead.project_name || `${lead.service_type} Project`
            })
            .eq("lead_id", lead.id)
            .is("project_id", null); // Only update estimates not already linked
          
          if (updateEstimatesError) {
            console.error("Error updating estimates:", updateEstimatesError);
          } else {
            console.log(`Updated estimates for lead ${lead.id}`);
          }
        }
      }
      
      // Notify user of successful import
      if (leads.length > 0) {
        toast({
          title: "Data imported successfully",
          description: `${leads.length} estimates found and added to your account.`,
        });
      }
      
    } catch (error) {
      console.error("Error in importLeadsForUser:", error);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      setProfileError(null);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        
        // If no profile exists, create one
        if (error.code === 'PGRST116') {
          console.log("No profile found, creating new profile");
          if (!user) {
            console.error("User not available for profile creation");
            setIsLoading(false);
            return;
          }
          
          const userData = user.user_metadata;
          console.log("User metadata for profile creation:", userData);
          
          try {
            // Create profile with customer role by default
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert([{
                id: userId,
                name: userData?.full_name || userData?.name || user?.email?.split('@')[0] || null,
                email: user?.email || null,
                phone: userData?.phone || null,
                address: userData?.address || null,
                role: "customer" // Default role for new profiles
              }])
              .select();
              
            if (createError) {
              console.error("Error creating profile:", createError);
              throw createError;
            }
            
            console.log("New profile created successfully:", newProfile?.[0]);
            setProfile(newProfile?.[0] as Profile);
            
            // Import leads and estimates after creating the profile
            if (user?.email) {
              importLeadsForUser(userId, user.email);
            }
            
            return;
          } catch (createError: any) {
            console.error("Error in profile creation:", createError);
            setProfileError(new Error(createError.message || "Failed to create profile"));
            toast({
              title: "Profile creation failed",
              description: "We couldn't create your profile. Please try refreshing the page.",
              variant: "destructive",
            });
          }
        } else {
          setProfileError(new Error(error.message));
          toast({
            title: "Error loading profile",
            description: "Please try refreshing the page or contact support.",
            variant: "destructive",
          });
        }
        throw error;
      }

      console.log("Profile fetched successfully:", data);
      
      // Verify profile data integrity and update missing fields if needed
      if (!data || !data.id) {
        console.error("Profile data is incomplete:", data);
        setProfileError(new Error("Profile data is incomplete"));
        toast({
          title: "Profile data issue",
          description: "Your profile information appears to be incomplete. Please contact support.",
          variant: "destructive",
        });
      }
      
      const userMetadata = user?.user_metadata;
      let profileUpdated = false;
      let profileUpdates: Record<string, any> = {};
      
      // Check for missing email
      if ((!data.email || data.email === '') && user?.email) {
        profileUpdates.email = user.email;
        profileUpdated = true;
      }
      
      // Check for missing name
      if ((!data.name || data.name === '') && (userMetadata?.full_name || userMetadata?.name)) {
        profileUpdates.name = userMetadata?.full_name || userMetadata?.name;
        profileUpdated = true;
      }
      
      // Check for missing phone
      if ((!data.phone || data.phone === '') && userMetadata?.phone) {
        profileUpdates.phone = userMetadata.phone;
        profileUpdated = true;
      }
      
      // Check for missing address
      if ((!data.address || data.address === '') && userMetadata?.address) {
        profileUpdates.address = userMetadata.address;
        profileUpdated = true;
      }
      
      // Update profile if needed
      if (profileUpdated) {
        console.log("Updating profile with missing data:", profileUpdates);
        try {
          const { error: updateError } = await supabase
            .from("profiles")
            .update(profileUpdates)
            .eq("id", userId);
            
          if (updateError) {
            console.error("Error updating profile:", updateError);
          } else {
            // Update the local data with the updates
            Object.assign(data, profileUpdates);
            console.log("Profile updated successfully with missing data");
          }
        } catch (updateError: any) {
          console.error("Error updating profile with missing data:", updateError);
        }
      }
      
      setProfile(data as Profile);
      
      // Import leads and estimates if this is a verified user
      if (user?.email && user?.email_confirmed_at) {
        importLeadsForUser(userId, user.email);
      }
      
    } catch (error) {
      console.error("Error in fetchProfile function:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      console.log("Refreshing profile for user:", user.id);
      await fetchProfile(user.id);
    } else {
      console.log("Cannot refresh profile: No user ID available");
    }
  };

  useEffect(() => {
    // Get initial session
    const initializeSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session check:", session?.user?.id || "No session");
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        setIsLoading(false);
      }
    };
    
    initializeSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id || "No user");
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const isAdmin = profile?.role === "admin";
  const isStaff = profile?.role === "staff" || isAdmin;

  return (
    <SessionContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signOut,
        isAdmin,
        isStaff,
        refreshProfile,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};


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
          const userData = user?.user_metadata;
          
          try {
            // Create profile with customer role by default and include email
            console.log("User metadata:", userData);
            
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert([{
                id: userId,
                name: userData?.name || user?.email?.split('@')[0] || null,
                phone: userData?.phone || null,
                role: "customer", // Default role for new profiles is customer
                email: user?.email || null // Ensure email is always included
              }])
              .select();
              
            if (createError) {
              console.error("Error creating profile:", createError);
              throw createError;
            }
            
            console.log("New profile created successfully:", newProfile?.[0]);
            setProfile(newProfile?.[0] as Profile);
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
      
      // Verify profile data integrity
      if (!data || !data.id) {
        console.error("Profile data is incomplete:", data);
        setProfileError(new Error("Profile data is incomplete"));
        toast({
          title: "Profile data issue",
          description: "Your profile information appears to be incomplete. Please contact support.",
          variant: "destructive",
        });
      }
      
      // If email is missing in the profile but exists in auth, update the profile
      if ((!data.email || data.email === '') && user?.email) {
        console.log("Email missing or empty in profile, updating with:", user.email);
        try {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ email: user.email })
            .eq("id", userId);
            
          if (updateError) {
            console.error("Error updating profile email:", updateError);
          } else {
            // Update the local data with the email
            data.email = user.email;
            console.log("Profile email updated successfully:", data.email);
          }
        } catch (updateError: any) {
          console.error("Error updating profile email:", updateError);
        }
      }
      
      setProfile(data as Profile);
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

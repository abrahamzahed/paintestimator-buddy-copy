import { createContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile, SessionContextType } from "./session-types";
import { useSyncUserData } from "@/hooks/useSyncUserData";

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
  
  useSyncUserData();

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
      console.log("Attempting to sign out user");
      
      setSession(null);
      setUser(null);
      setProfile(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during sign out:", error);
        throw error;
      }
      
      toast({
        title: "Signed out successfully",
      });
      
      console.log("User signed out successfully");
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
      return false;
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

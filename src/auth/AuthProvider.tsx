
import { createContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/common/hooks/use-toast";
import { Profile, SessionContextType } from "./types";
import { useProfile } from "./use-profile";
import { AuthService } from "./auth-service";

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
  const { toast } = useToast();
  const { fetchProfile } = useProfile();
  
  const refreshProfile = async () => {
    if (user?.id) {
      console.log("Refreshing profile for user:", user.id);
      const profileData = await fetchProfile(user.id, user);
      setProfile(profileData);
      setIsLoading(false);
    } else {
      console.log("Cannot refresh profile: No user ID available");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true);
        const sessionData = await AuthService.getSession();
        console.log("Initial session check:", sessionData?.user?.id || "No session");
        
        setSession(sessionData);
        setUser(sessionData?.user ?? null);
        
        if (sessionData?.user) {
          const profileData = await fetchProfile(sessionData.user.id, sessionData.user);
          setProfile(profileData);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error getting initial session:", error);
        setIsLoading(false);
      }
    };
    
    initializeSession();

    const subscription = AuthService.onAuthStateChange(
      async (sessionData, userData) => {
        setSession(sessionData);
        setUser(userData);
        
        if (userData) {
          const profileData = await fetchProfile(userData.id, userData);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async (): Promise<void> => {
    try {
      console.log("Attempting to sign out user");
      
      // Set loading state to prevent UI from being interactive during sign out
      setIsLoading(true);
      
      // Clear state immediately to prevent UI lag
      setSession(null);
      setUser(null);
      setProfile(null);
      
      const { error } = await AuthService.signOut();
      
      if (error) {
        console.error("Error during sign out:", error);
        toast({
          title: "Error signing out",
          description: "Please try again",
          variant: "destructive",
        });
        throw error;
      }
      
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

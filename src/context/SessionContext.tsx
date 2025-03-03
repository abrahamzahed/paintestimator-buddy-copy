import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Export the Profile type so it can be imported in other files
export type Profile = {
  id: string;
  role: "admin" | "staff" | "customer";
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at?: string;
  updated_at?: string;
};

type SessionContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isStaff: boolean;
  refreshProfile: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
  isAdmin: false,
  isStaff: false,
  refreshProfile: async () => {},
});

export const useSession = () => useContext(SessionContext);

export const SessionContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
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
          
          // Create profile with customer role by default
          console.log("User metadata:", userData);
          
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert([{
              id: userId,
              name: userData?.name || user?.email?.split('@')[0] || null,
              phone: userData?.phone || null,
              email: user?.email || null,
              role: "customer" // Default role for new profiles is customer
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
          setProfile(newProfile?.[0] as Profile);
          return;
        }
        
        toast({
          title: "Error loading profile",
          description: "Please try refreshing the page or contact support.",
          variant: "destructive",
        });
        throw error;
      }

      console.log("Profile fetched successfully:", data);
      
      // Verify profile data integrity
      if (!data || !data.id) {
        console.error("Profile data is incomplete:", data);
        toast({
          title: "Profile data issue",
          description: "Your profile information appears to be incomplete. Please contact support.",
          variant: "destructive",
        });
      }
      
      // Add email from user data if missing in profile
      const profileWithEmail = {
        ...data,
        email: data.email || user?.email || null
      };
      
      setProfile(profileWithEmail as Profile);
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchProfile(session.user.id);
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

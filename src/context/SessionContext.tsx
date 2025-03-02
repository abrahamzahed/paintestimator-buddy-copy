
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../App";
import { useToast } from "@/hooks/use-toast";

type Profile = {
  id: string;
  role: "admin" | "staff" | "customer";
  name: string | null;
  phone: string | null;
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
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        // If no profile exists, create one
        if (error.code === 'PGRST116') {
          const userData = user?.user_metadata;
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert([{
              id: userId,
              name: userData?.name || null,
              phone: userData?.phone || null,
              role: "customer"
            }])
            .select();
            
          if (createError) {
            throw createError;
          }
          
          setProfile(newProfile?.[0] as Profile);
          return;
        }
        throw error;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error("Error fetching/creating profile:", error);
      toast({
        title: "Error with user profile",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
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
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
    });
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

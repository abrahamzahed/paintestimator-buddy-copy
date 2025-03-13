
import { Session, User } from "@supabase/supabase-js";

// Export the Profile type so it can be imported in other files
export type Profile = {
  id: string;
  role: "admin" | "staff" | "customer";
  name: string | null;
  email?: string | null;
  phone: string | null;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SessionContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isStaff: boolean;
  refreshProfile: () => Promise<void>;
};

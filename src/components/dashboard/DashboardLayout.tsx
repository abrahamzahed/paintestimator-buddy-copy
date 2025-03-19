
import React, { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/auth/types";

interface DashboardLayoutProps {
  children: ReactNode;
  user: User | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
}

const DashboardLayout = ({ children, user, profile, signOut }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  
  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent multiple clicks
    
    try {
      console.log("Sign out button clicked in dashboard");
      setIsSigningOut(true);
      
      await signOut();
      
      // Don't navigate programmatically - the auth state change will trigger a redirect
      console.log("Sign out completed in dashboard");
    } catch (error) {
      console.error("Error during sign out in dashboard:", error);
    } finally {
      // Reset signing out state after a delay to ensure visual feedback
      setTimeout(() => setIsSigningOut(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-paint">Paint Pro</Link>
              <nav className="hidden md:flex space-x-4">
                <Link to="/dashboard" className="text-foreground hover:text-paint">Dashboard</Link>
                {profile?.role === "admin" && (
                  <Link to="/admin" className="text-foreground hover:text-paint">Admin</Link>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm hidden md:inline-block">
                {profile?.name || user?.email}
              </span>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

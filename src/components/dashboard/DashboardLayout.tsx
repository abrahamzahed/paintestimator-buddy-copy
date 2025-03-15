
import React, { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/context/session-types";

interface DashboardLayoutProps {
  children: ReactNode;
  user: User | null;
  profile: Profile | null;
  signOut: () => Promise<boolean>; // Updated the return type here
}

const DashboardLayout = ({ children, user, profile, signOut }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  const handleSignOut = async () => {
    try {
      console.log("Sign out button clicked in dashboard");
      setIsSigningOut(true);
      const success = await signOut();
      if (success) {
        console.log("Sign out completed, navigating to home");
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error("Error during sign out in dashboard:", error);
    } finally {
      setIsSigningOut(false);
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

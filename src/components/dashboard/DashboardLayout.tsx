
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/context/SessionContext";

interface DashboardLayoutProps {
  children: ReactNode;
  user: User | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
}

const DashboardLayout = ({ children, user, profile, signOut }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-paint">Paint Pro</Link>
              <nav className="hidden md:flex space-x-4">
                <Link to="/dashboard" className="text-foreground hover:text-paint">Dashboard</Link>
                {/* Removed the "Get Estimate" link */}
                {profile?.role === "admin" && (
                  <Link to="/admin" className="text-foreground hover:text-paint">Admin</Link>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm hidden md:inline-block">
                {profile?.name || user?.email}
              </span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Removed the welcome message block to allow customer dashboard to manage it */}
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

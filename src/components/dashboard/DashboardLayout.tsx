
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
                <Link to="/estimate" className="text-foreground hover:text-paint">Get Estimate</Link>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {profile?.name || "Customer"}!</h2>
          <p className="text-muted-foreground">
            {profile?.role === "admin" 
              ? "View your dashboard snapshot below or visit the admin panel for full access."
              : "Manage your painting projects and estimates in one place."}
          </p>
          
          {profile?.role === "admin" && (
            <Button 
              onClick={() => window.location.href = "/admin"}
              className="mt-4 bg-paint hover:bg-paint-dark"
            >
              Go to Admin Dashboard
            </Button>
          )}
        </div>

        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

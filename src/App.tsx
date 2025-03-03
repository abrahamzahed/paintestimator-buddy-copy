
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionContextProvider, useSession } from "@/context/SessionContext";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import ProjectDetail from "@/pages/ProjectDetail";
import EstimateForm from "@/pages/EstimateForm";
import EstimateDetail from "@/pages/EstimateDetail";
import NotFound from "@/pages/NotFound";
import { Profile } from "./types";
import { supabase } from "@/integrations/supabase/client";

function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        } else {
          setProfile(profileData as Profile);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { session } = useSession();

    if (!session) {
      return <Navigate to="/auth" replace />;
    }

    return children;
  };

  return (
    <SessionContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/project/:id" 
            element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/estimate/:id" 
            element={
              <ProtectedRoute>
                <EstimateDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/estimate" 
            element={
              <ProtectedRoute>
                <EstimateForm />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </SessionContextProvider>
  );
}

export default App;

import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { SessionProvider } from "@/context/SessionContext";
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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = supabase.auth.getSession();
        if (!user) {
          return;
        }

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", (await user).data.session?.user.id)
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
    const { session } = SessionProvider();

    if (!session) {
      return <Navigate to="/auth" replace />;
    }

    return children;
  };

  return (
    <SessionProvider>
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
    </SessionProvider>
  );
}

export default App;

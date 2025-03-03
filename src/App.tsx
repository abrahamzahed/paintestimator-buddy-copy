
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { SessionContextProvider } from "@/context/SessionContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import EstimateForm from "./pages/EstimateForm";
import AdminDashboard from "./pages/AdminDashboard";
import ProjectDetail from "./pages/ProjectDetail";

const queryClient = new QueryClient();

// Initialize Supabase client
const supabaseUrl = "https://pxwnldtwtbiwjlnwzlvt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4d25sZHR3dGJpd2psbnd6bHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NDY0MzcsImV4cCI6MjA1NjUyMjQzN30.QoTBPYAnQCRajwp3TeIETNISyACveukaQyVQd60CHWQ";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionContextProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/estimate" element={<ProtectedRoute><EstimateForm /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/project/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SessionContextProvider>
  </QueryClientProvider>
);

export default App;

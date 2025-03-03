import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EstimateForm from "./pages/EstimateForm";
import EstimateDetail from "./pages/EstimateDetail";
import EditEstimate from "./pages/EditEstimate";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { SessionContextProvider } from "./context/SessionContext";
import { Toaster } from "./components/ui/toaster";

function App() {
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
              <ProtectedRoute allowedRoles={["admin"]}>
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
            path="/estimate"
            element={
              <ProtectedRoute>
                <EstimateForm />
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
            path="/estimate/edit/:id"
            element={
              <ProtectedRoute>
                <EditEstimate />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </SessionContextProvider>
  );
}

export default App;

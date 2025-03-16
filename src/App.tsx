
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EstimateDetail from "./pages/EstimateDetail";
import EditEstimate from "./pages/EditEstimate";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { SessionContextProvider } from "./context/session-provider";
import { Toaster } from "./components/ui/toaster";
import { useSyncUserData } from "./hooks/useSyncUserData";
import { FreeEstimator } from "./packages/free-estimator";
import HomeEstimator from "./components/HomeEstimator";

// Create a wrapper component to use the hook at the right place
// to avoid circular dependencies
function SyncDataWrapper({ children }: { children: React.ReactNode }) {
  useSyncUserData(); // This will run only after SessionContext is initialized
  return <>{children}</>;
}

function App() {
  return (
    <SessionContextProvider>
      <SyncDataWrapper>
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
              element={<HomeEstimator />}
            />
            <Route
              path="/dashboard/estimate"
              element={
                <ProtectedRoute>
                  <div className="container mx-auto py-8">
                    <h1 className="text-2xl font-bold mb-6">Create New Estimate</h1>
                    <FreeEstimator isAuthenticated={true} />
                  </div>
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
      </SyncDataWrapper>
    </SessionContextProvider>
  );
}

export default App;

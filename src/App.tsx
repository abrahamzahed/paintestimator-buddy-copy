
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { SessionContextProvider } from "./context/session-provider";
import { Toaster } from "./components/ui/toaster";
import { useSyncUserData } from "./hooks/useSyncUserData";
import HomeEstimator from "./components/HomeEstimator";
import { FreeEstimator } from "./packages/free-estimator";

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
            <Route path="*" element={<div className="container mx-auto py-16 text-center">
              <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
              <p>The page you're looking for doesn't exist.</p>
            </div>} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </SyncDataWrapper>
    </SessionContextProvider>
  );
}

export default App;

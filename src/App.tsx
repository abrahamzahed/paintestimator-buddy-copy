
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from "@/auth/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { useSyncUserData } from "@/common/hooks/useSyncUserData";
import { ProtectedRoute } from "@/common/components/auth/ProtectedRoute";

// Pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import { DashboardPage, NewEstimatePage } from "@/modules/customer";
import { FreeEstimatorPage } from "@/modules/public-estimator";

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
            
            {/* Customer routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/estimate"
              element={
                <ProtectedRoute>
                  <NewEstimatePage />
                </ProtectedRoute>
              }
            />
            
            {/* Public estimator */}
            <Route
              path="/estimate"
              element={<FreeEstimatorPage />}
            />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={
              <div className="container mx-auto py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            } />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </SyncDataWrapper>
    </SessionContextProvider>
  );
}

export default App;

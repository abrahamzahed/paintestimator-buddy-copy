
import { Navigate } from "react-router-dom";
import { useSession } from "@/context/use-session";
import LoadingState from "@/components/estimate/LoadingState";
import { useEffect } from "react";
import { useSyncUserData } from "@/hooks/useSyncUserData";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { isLoading, user, isAdmin, profile } = useSession();
  const { isSyncing, syncComplete } = useSyncUserData();

  // During initial loading or data syncing, show a loading state
  if (isLoading || (isSyncing && !syncComplete)) {
    return <LoadingState message={isLoading ? "Loading your account information..." : "Syncing your data..."} />;
  }

  // If not authenticated, redirect to auth page with return URL
  if (!user) {
    const returnUrl = encodeURIComponent(window.location.pathname);
    return <Navigate to={`/auth?returnUrl=${returnUrl}`} replace />;
  }

  // Check roles if specified and profile is loaded
  if (allowedRoles.length > 0 && profile) {
    // For "admin" role, we use the isAdmin flag from the session context
    if (allowedRoles.includes("admin") && !isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
    
    // For other roles, check if user has the required role
    const hasRequiredRole = allowedRoles.some(role => 
      (role === "staff" && profile.role === "staff") ||
      (role === "customer" && profile.role === "customer")
    );
    
    if (!hasRequiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

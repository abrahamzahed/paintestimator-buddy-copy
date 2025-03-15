
import { Navigate } from "react-router-dom";
import { useSession } from "@/context/use-session";
import LoadingState from "@/components/estimate/LoadingState";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { isLoading, user, isAdmin, profile } = useSession();

  // During initial loading, show a loading state
  if (isLoading) {
    return <LoadingState message="Loading your account information..." />;
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

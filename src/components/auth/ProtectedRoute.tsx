
import { Navigate } from "react-router-dom";
import { useSession } from "@/context/use-session";
import LoadingState from "@/components/estimate/LoadingState";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { isLoading, user, isAdmin } = useSession();

  // During initial loading, show a loading state
  if (isLoading) {
    return <LoadingState message="Loading your account information..." />;
  }

  // If not authenticated, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check roles if specified
  if (allowedRoles.length > 0) {
    // For "admin" role, we use the isAdmin flag from the session context
    if (allowedRoles.includes("admin") && !isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

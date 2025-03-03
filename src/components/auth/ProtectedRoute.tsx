
import { Navigate } from "react-router-dom";
import { useSession } from "@/context/SessionContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { isLoading, user, isAdmin } = useSession();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

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

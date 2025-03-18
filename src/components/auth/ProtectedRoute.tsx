
import { Navigate } from "react-router-dom";
import { useSession } from "@/context/use-session";

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = ["customer", "admin"] 
}: { 
  children: React.ReactNode,
  allowedRoles?: string[]
}) => {
  const { user, isLoading, profile } = useSession();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-paint rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

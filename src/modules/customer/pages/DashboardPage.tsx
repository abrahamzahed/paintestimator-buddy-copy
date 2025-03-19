
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSession } from "@/auth/use-session";
import { useToast } from "@/common/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useProjectData } from "@/hooks/useProjectData";
import { getProjectStatusColor } from "@/common/utils/projectDataUtils";
import AdminDashboardView from "@/modules/admin/components/AdminDashboardView";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CustomerDashboardView from "@/components/dashboard/CustomerDashboardView";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";

const DashboardPage = () => {
  const { isAdmin, profile, user, signOut } = useSession();
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { projects, estimates, invoices, isLoading, error } = useProjectData();
  
  const archivedProjects = projects?.filter(p => p.status === "archived" || p.status === "cancelled") || [];
  const activeProjects = projects?.filter(p => p.status !== "archived" && p.status !== "cancelled") || [];
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading dashboard data",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <DashboardLayout user={user} profile={profile} signOut={signOut}>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin h-12 w-12 border-4 border-paint rounded-full border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  const handleAdminRedirect = () => {
    // This would be implemented to redirect to the admin panel
    console.log("Redirecting to admin panel");
  };

  return (
    <DashboardLayout user={user} profile={profile} signOut={signOut}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome, {profile?.name || "User"}
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your painting projects and estimates
            </p>
          </div>
          <Button asChild className="bg-paint hover:bg-paint-dark">
            <Link to="/dashboard/estimate">Create New Estimate</Link>
          </Button>
        </div>

        <DashboardMetrics 
          leads={[]}
          estimates={estimates}
          invoices={invoices}
        />

        {isAdmin ? (
          <AdminDashboardView 
            projects={activeProjects}
            archivedProjects={archivedProjects}
            estimates={estimates}
            invoices={invoices}
            handleAdminRedirect={handleAdminRedirect}
          />
        ) : (
          <CustomerDashboardView 
            projects={projects || []}
            archivedProjects={archivedProjects}
            estimates={estimates || []}
            invoices={invoices || []}
            statusColorFn={getProjectStatusColor}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;

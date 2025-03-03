import { useState, useEffect } from "react";
import { useSession } from "@/context/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Estimate, Invoice, Project } from "@/types";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminDashboardView from "@/components/dashboard/AdminDashboardView";
import CustomerDashboardView from "@/components/dashboard/CustomerDashboardView";

export default function Dashboard() {
  const { user, profile, signOut, isAdmin } = useSession();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // If admin, fetch all data; if customer, fetch only their data
        if (isAdmin) {
          // Admin sees all data limited to recent items
          // Fetch projects
          const { data: projectsData, error: projectsError } = await supabase
            .from("projects")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10);

          if (projectsError) throw projectsError;
          
          // Separate active and archived projects
          const active = projectsData?.filter(p => p.status === 'active') || [];
          const archived = projectsData?.filter(p => p.status === 'archived') || [];
          
          setProjects(active as Project[]);
          setArchivedProjects(archived as Project[]);

          // Fetch estimates
          const { data: estimatesData, error: estimatesError } = await supabase
            .from("estimates")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10);

          if (estimatesError) throw estimatesError;
          
          // Transform data to match our Estimate interface
          const formattedEstimates = estimatesData?.map(est => ({
            ...est,
            details: est.details as Record<string, any>,
            discount: est.discount || 0,
            notes: est.notes || ""
          })) as Estimate[];
          
          setEstimates(formattedEstimates);

          // Fetch invoices
          const { data: invoicesData, error: invoicesError } = await supabase
            .from("invoices")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10);

          if (invoicesError) throw invoicesError;
          setInvoices(invoicesData || []);
        } else {
          // Regular customer - only see their own data
          // Fetch active projects
          const { data: activeProjectsData, error: activeProjectsError } = await supabase
            .from("projects")
            .select("*")
            .eq("user_id", user?.id)
            .eq("status", "active")
            .order("created_at", { ascending: false });

          if (activeProjectsError) throw activeProjectsError;
          setProjects(activeProjectsData as Project[] || []);
          
          // Fetch archived projects
          const { data: archivedProjectsData, error: archivedProjectsError } = await supabase
            .from("projects")
            .select("*")
            .eq("user_id", user?.id)
            .eq("status", "archived")
            .order("created_at", { ascending: false });

          if (archivedProjectsError) throw archivedProjectsError;
          setArchivedProjects(archivedProjectsData as Project[] || []);

          // Get all project IDs (both active and archived)
          const allProjectIds = [
            ...(activeProjectsData?.map(p => p.id) || []),
            ...(archivedProjectsData?.map(p => p.id) || [])
          ];
          
          // For customers, fetch estimates for their projects
          if (allProjectIds.length > 0) {
            const { data: estimatesData, error: estimatesError } = await supabase
              .from("estimates")
              .select("*")
              .in("project_id", allProjectIds)
              .order("created_at", { ascending: false });

            if (estimatesError) throw estimatesError;
            
            // Transform data to match our Estimate interface
            const formattedEstimates = estimatesData?.map(est => ({
              ...est,
              details: est.details as Record<string, any>,
              discount: est.discount || 0,
              notes: est.notes || ""
            })) as Estimate[];
            
            setEstimates(formattedEstimates);

            // Fetch invoices for these estimates
            if (estimatesData && estimatesData.length > 0) {
              const estimateIds = estimatesData.map(estimate => estimate.id);
              
              const { data: invoicesData, error: invoicesError } = await supabase
                .from("invoices")
                .select("*")
                .in("estimate_id", estimateIds)
                .order("created_at", { ascending: false });

              if (invoicesError) throw invoicesError;
              setInvoices(invoicesData || []);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error loading dashboard",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id, toast, isAdmin]);

  const handleAdminRedirect = () => {
    if (isAdmin) {
      navigate("/admin");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile} signOut={signOut}>
      {isAdmin ? (
        <AdminDashboardView 
          projects={projects}
          archivedProjects={archivedProjects}
          estimates={estimates} 
          invoices={invoices} 
          handleAdminRedirect={handleAdminRedirect} 
        />
      ) : (
        <CustomerDashboardView 
          projects={projects}
          archivedProjects={archivedProjects}
          estimates={estimates} 
          invoices={invoices} 
        />
      )}
    </DashboardLayout>
  );
}

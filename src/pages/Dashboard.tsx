
import { useState, useEffect } from "react";
import { useSession } from "@/context/SessionContext";
import { supabase } from "../App";
import { useToast } from "@/hooks/use-toast";
import { Lead, Estimate, Invoice } from "@/types";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdminDashboardView from "@/components/dashboard/AdminDashboardView";
import CustomerDashboardView from "@/components/dashboard/CustomerDashboardView";

export default function Dashboard() {
  const { user, profile, signOut, isAdmin } = useSession();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
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
          // Fetch leads
          const { data: leadsData, error: leadsError } = await supabase
            .from("leads")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5);

          if (leadsError) throw leadsError;
          setLeads(leadsData || []);

          // Fetch estimates
          const { data: estimatesData, error: estimatesError } = await supabase
            .from("estimates")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5);

          if (estimatesError) throw estimatesError;
          setEstimates(estimatesData || []);

          // Fetch invoices
          const { data: invoicesData, error: invoicesError } = await supabase
            .from("invoices")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5);

          if (invoicesError) throw invoicesError;
          setInvoices(invoicesData || []);
        } else {
          // Regular customer - only see their own data
          // Fetch leads
          const { data: leadsData, error: leadsError } = await supabase
            .from("leads")
            .select("*")
            .eq("user_id", user?.id)
            .order("created_at", { ascending: false });

          if (leadsError) throw leadsError;
          setLeads(leadsData || []);

          // Fetch estimates for these leads
          if (leadsData && leadsData.length > 0) {
            const leadIds = leadsData.map(lead => lead.id);
            
            const { data: estimatesData, error: estimatesError } = await supabase
              .from("estimates")
              .select("*")
              .in("lead_id", leadIds)
              .order("created_at", { ascending: false });

            if (estimatesError) throw estimatesError;
            setEstimates(estimatesData || []);

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
          leads={leads} 
          estimates={estimates} 
          invoices={invoices} 
          handleAdminRedirect={handleAdminRedirect} 
        />
      ) : (
        <CustomerDashboardView 
          leads={leads} 
          estimates={estimates} 
          invoices={invoices} 
        />
      )}
    </DashboardLayout>
  );
}


import { useState, useEffect } from "react";
import { useSession } from "@/context/SessionContext";
import { supabase } from "../App";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lead, Estimate, Invoice } from "@/types";
import { Link } from "react-router-dom";
import { PlusCircle, FileText, DollarSign, House } from "lucide-react";

export default function Dashboard() {
  const { user, profile, signOut } = useSession();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
  }, [user?.id, toast]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-paint">Paint Pro</h1>
              <nav className="hidden md:flex space-x-4">
                <Link to="/dashboard" className="text-foreground hover:text-paint">Dashboard</Link>
                <Link to="/estimate" className="text-foreground hover:text-paint">Get Estimate</Link>
                {profile?.role === "admin" && (
                  <Link to="/admin" className="text-foreground hover:text-paint">Admin</Link>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm hidden md:inline-block">
                {profile?.name || user?.email}
              </span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {profile?.name || "Customer"}!</h2>
          <p className="text-muted-foreground">
            Manage your painting projects and estimates in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-secondary/50 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">Total Leads</h3>
                <p className="text-3xl font-bold mt-2">{leads.length}</p>
              </div>
              <span className="bg-paint/10 p-2 rounded-full text-paint">
                <House className="w-6 h-6" />
              </span>
            </div>
          </div>
          
          <div className="bg-secondary/50 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">Estimates</h3>
                <p className="text-3xl font-bold mt-2">{estimates.length}</p>
              </div>
              <span className="bg-blue-500/10 p-2 rounded-full text-blue-500">
                <FileText className="w-6 h-6" />
              </span>
            </div>
          </div>
          
          <div className="bg-secondary/50 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">Invoices</h3>
                <p className="text-3xl font-bold mt-2">{invoices.length}</p>
              </div>
              <span className="bg-green-500/10 p-2 rounded-full text-green-500">
                <DollarSign className="w-6 h-6" />
              </span>
            </div>
          </div>
          
          <div className="bg-paint/10 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col h-full justify-between">
              <h3 className="font-semibold text-lg text-paint">Get Estimate</h3>
              <Button asChild className="mt-4 bg-paint hover:bg-paint-dark">
                <Link to="/estimate">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Estimate
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No leads yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by creating your first estimate
            </p>
            <Button asChild className="bg-paint hover:bg-paint-dark">
              <Link to="/estimate">
                <PlusCircle className="mr-2 h-4 w-4" />
                Get Estimate
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Recent leads */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Recent Leads</h3>
                <Button variant="outline" asChild>
                  <Link to="/estimate">New Lead</Link>
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left">Service</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.slice(0, 5).map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-secondary/50">
                        <td className="py-3 px-4">{lead.service_type}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            lead.status === "new" 
                              ? "bg-blue-100 text-blue-800" 
                              : lead.status === "contacted" 
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(lead.created_at!).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent estimates */}
            {estimates.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Recent Estimates</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left">ID</th>
                        <th className="py-3 px-4 text-left">Total</th>
                        <th className="py-3 px-4 text-left">Status</th>
                        <th className="py-3 px-4 text-left">Date</th>
                        <th className="py-3 px-4 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estimates.slice(0, 5).map((estimate) => (
                        <tr key={estimate.id} className="border-b hover:bg-secondary/50">
                          <td className="py-3 px-4">{estimate.id?.substring(0, 8)}</td>
                          <td className="py-3 px-4">${estimate.total_cost.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              estimate.status === "pending" 
                                ? "bg-yellow-100 text-yellow-800" 
                                : estimate.status === "approved" 
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {estimate.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {new Date(estimate.created_at!).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}


import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { supabase } from "../App";
import { useToast } from "@/hooks/use-toast";
import { Project, Lead, Estimate, Invoice } from "@/types";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, PlusCircle } from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, signOut } = useSession();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("leads");

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (!id) return;

        // Fetch project
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (projectError) throw projectError;
        setProject(projectData as Project);

        // Fetch leads for this project
        const { data: leadsData, error: leadsError } = await supabase
          .from("leads")
          .select("*")
          .eq("project_id", id)
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
        console.error("Error fetching project data:", error);
        toast({
          title: "Error loading project",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id, toast]);

  if (loading) {
    return (
      <DashboardLayout user={user} profile={profile} signOut={signOut}>
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <p>Loading project details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout user={user} profile={profile} signOut={signOut}>
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Project not found</h3>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <Link to="/dashboard">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile} signOut={signOut}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">
              Created on {new Date(project.created_at!).toLocaleDateString()}
            </p>
            {project.description && (
              <p className="mt-2 text-muted-foreground">{project.description}</p>
            )}
          </div>
          <Button asChild className="bg-paint hover:bg-paint-dark">
            <Link to="/estimate">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Estimate
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="leads" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
            <TabsTrigger value="estimates">Estimates ({estimates.length})</TabsTrigger>
            <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="leads">
            {leads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leads.map((lead) => (
                  <Card key={lead.id} className="hover:bg-secondary/20 transition-colors">
                    <CardHeader>
                      <CardTitle>{lead.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>Email: {lead.email}</p>
                        {lead.phone && <p>Phone: {lead.phone}</p>}
                        {lead.address && <p>Address: {lead.address}</p>}
                        <p>Service: {lead.service_type}</p>
                        <p>Status: <span className="capitalize">{lead.status}</span></p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No leads for this project yet</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="estimates">
            {estimates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-left">Total</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimates.map((estimate) => (
                      <tr key={estimate.id} className="border-b hover:bg-secondary/50">
                        <td className="py-3 px-4">
                          {new Date(estimate.created_at!).toLocaleDateString()}
                        </td>
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
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/estimate/${estimate.id}`}>
                              View
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No estimates for this project yet</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="invoices">
            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-left">Amount</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-secondary/50">
                        <td className="py-3 px-4">
                          {new Date(invoice.created_at!).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">${invoice.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            invoice.status === "unpaid" 
                              ? "bg-yellow-100 text-yellow-800" 
                              : invoice.status === "paid" 
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/invoice/${invoice.id}`}>
                              View
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No invoices for this project yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

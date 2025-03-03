
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, House, FileText, DollarSign, ChevronRight } from "lucide-react";
import { Lead, Estimate, Invoice, Project } from "@/types";
import { useSession } from "@/context/SessionContext";
import { supabase } from "../../App";
import { useToast } from "@/hooks/use-toast";

interface CustomerDashboardViewProps {
  leads: Lead[];
  estimates: Estimate[];
  invoices: Invoice[];
}

const CustomerDashboardView = ({
  leads,
  estimates,
  invoices,
}: CustomerDashboardViewProps) => {
  const { user } = useSession();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("projects");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!user) return;

        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Failed to load projects",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, toast]);

  // Group leads by project
  const leadsByProject = leads.reduce((acc, lead) => {
    const projectId = lead.project_id || 'unassigned';
    if (!acc[projectId]) acc[projectId] = [];
    acc[projectId].push(lead);
    return acc;
  }, {} as Record<string, Lead[]>);

  // Filter estimates by lead
  const getEstimatesByLeadId = (leadId: string) => {
    return estimates.filter(estimate => estimate.lead_id === leadId);
  };

  // Filter invoices by estimate
  const getInvoicesByEstimateId = (estimateId: string) => {
    return invoices.filter(invoice => invoice.estimate_id === estimateId);
  };

  const projectLeadCount = Object.keys(leadsByProject).length;
  const totalEstimatesCount = estimates.length;
  const totalInvoicesCount = invoices.length;
  
  return (
    <div>
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-secondary/50 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">Projects</h3>
              <p className="text-3xl font-bold mt-2">{projects.length}</p>
            </div>
            <span className="bg-paint/10 p-2 rounded-full text-paint">
              <House className="w-6 h-6" />
            </span>
          </div>
        </div>
        
        <div className="bg-secondary/50 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">Leads</h3>
              <p className="text-3xl font-bold mt-2">{projectLeadCount}</p>
            </div>
            <span className="bg-yellow-500/10 p-2 rounded-full text-yellow-500">
              <House className="w-6 h-6" />
            </span>
          </div>
        </div>
        
        <div className="bg-secondary/50 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">Estimates</h3>
              <p className="text-3xl font-bold mt-2">{totalEstimatesCount}</p>
            </div>
            <span className="bg-blue-500/10 p-2 rounded-full text-blue-500">
              <FileText className="w-6 h-6" />
            </span>
          </div>
        </div>
        
        <div className="bg-paint/10 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-paint">Invoices</h3>
                <p className="text-3xl font-bold mt-2">{totalInvoicesCount}</p>
              </div>
              <span className="bg-green-500/10 p-2 rounded-full text-green-500">
                <DollarSign className="w-6 h-6" />
              </span>
            </div>
            <Button asChild className="mt-4 bg-paint hover:bg-paint-dark">
              <Link to="/estimate">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Estimate
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {projects.length === 0 && leads.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6">
            Start by creating your first project and estimate
          </p>
          <Button asChild className="bg-paint hover:bg-paint-dark">
            <Link to="/estimate">
              <PlusCircle className="mr-2 h-4 w-4" />
              Get Estimate
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <Tabs defaultValue="projects" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="estimates">Estimates</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>
            
            <TabsContent value="projects">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => {
                  const projectLeads = leads.filter(lead => lead.project_id === project.id);
                  const projectEstimatesCount = projectLeads.reduce((count, lead) => {
                    return count + getEstimatesByLeadId(lead.id!).length;
                  }, 0);
                  
                  const projectInvoicesCount = projectLeads.reduce((count, lead) => {
                    const leadEstimates = getEstimatesByLeadId(lead.id!);
                    return count + leadEstimates.reduce((iCount, estimate) => {
                      return iCount + getInvoicesByEstimateId(estimate.id!).length;
                    }, 0);
                  }, 0);
                  
                  return (
                    <Card key={project.id} className="hover:bg-secondary/20 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>
                          {new Date(project.created_at!).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>Leads: {projectLeads.length}</div>
                            <div>Estimates: {projectEstimatesCount}</div>
                            <div>Invoices: {projectInvoicesCount}</div>
                          </div>
                          <Button variant="ghost" size="sm" asChild className="w-full mt-4">
                            <Link to={`/project/${project.id}`}>
                              View Project Details <ChevronRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="estimates">
              <div className="space-y-4">
                {estimates.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left">Project</th>
                          <th className="py-3 px-4 text-left">Total</th>
                          <th className="py-3 px-4 text-left">Status</th>
                          <th className="py-3 px-4 text-left">Date</th>
                          <th className="py-3 px-4 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estimates.map((estimate) => {
                          const lead = leads.find(l => l.id === estimate.lead_id);
                          const projectName = lead?.project_name || "Unknown Project";
                          
                          return (
                            <tr key={estimate.id} className="border-b hover:bg-secondary/50">
                              <td className="py-3 px-4">{projectName}</td>
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
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to={`/estimate/${estimate.id}`}>
                                    View
                                  </Link>
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">No estimates yet</p>
                    <Button asChild className="bg-paint hover:bg-paint-dark">
                      <Link to="/estimate">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Get Estimate
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="invoices">
              <div className="space-y-4">
                {invoices.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left">Project</th>
                          <th className="py-3 px-4 text-left">Amount</th>
                          <th className="py-3 px-4 text-left">Status</th>
                          <th className="py-3 px-4 text-left">Date</th>
                          <th className="py-3 px-4 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice) => {
                          const estimate = estimates.find(e => e.id === invoice.estimate_id);
                          const lead = estimate ? leads.find(l => l.id === estimate.lead_id) : null;
                          const projectName = lead?.project_name || "Unknown Project";
                          
                          return (
                            <tr key={invoice.id} className="border-b hover:bg-secondary/50">
                              <td className="py-3 px-4">{projectName}</td>
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
                                {new Date(invoice.created_at!).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to={`/invoice/${invoice.id}`}>
                                    View
                                  </Link>
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No invoices yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboardView;

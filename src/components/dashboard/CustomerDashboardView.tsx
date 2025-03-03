import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, House, FileText, DollarSign, ChevronRight } from "lucide-react";
import { Estimate, Invoice, Project } from "@/types";
interface CustomerDashboardViewProps {
  projects: Project[];
  estimates: Estimate[];
  invoices: Invoice[];
}
const CustomerDashboardView = ({
  projects,
  estimates,
  invoices
}: CustomerDashboardViewProps) => {
  // Filter estimates by project
  const getEstimatesByProjectId = (projectId: string) => {
    return estimates.filter(estimate => estimate.project_id === projectId);
  };

  // Filter invoices by estimate
  const getInvoicesByEstimateId = (estimateId: string) => {
    return invoices.filter(invoice => invoice.estimate_id === estimateId);
  };
  const totalEstimatesCount = estimates.length;
  const totalInvoicesCount = invoices.length;
  return <div>
      {/* Welcome Banner */}
      
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold">Projects</CardTitle>
              <span className="bg-paint/10 p-2 rounded-full text-paint">
                <House className="w-5 h-5" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{projects.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Active projects</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-indigo-50">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold">Estimates</CardTitle>
              <span className="bg-blue-500/10 p-2 rounded-full text-blue-500">
                <FileText className="w-5 h-5" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalEstimatesCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Total estimates</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-paint/10">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold text-paint">Invoices</CardTitle>
              <span className="bg-green-500/10 p-2 rounded-full text-green-500">
                <DollarSign className="w-5 h-5" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalInvoicesCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Total invoices</p>
            <Button asChild className="mt-4 w-full bg-paint hover:bg-paint-dark">
              <Link to="/estimate">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Estimate
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {projects.length === 0 ? <div className="text-center py-12 bg-secondary/30 rounded-xl">
          <House className="mx-auto h-12 w-12 text-muted-foreground/70 mb-4" />
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
        </div> : <div className="space-y-6">
          <Tabs defaultValue="projects">
            <TabsList className="mb-4 w-full md:w-auto bg-secondary/70 p-1 rounded-md">
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <House className="h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="estimates" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Estimates
              </TabsTrigger>
              <TabsTrigger value="invoices" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Invoices
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="projects">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => {
              const projectEstimates = getEstimatesByProjectId(project.id!);
              const projectEstimatesCount = projectEstimates.length;
              const projectInvoicesCount = projectEstimates.reduce((count, estimate) => {
                return count + getInvoicesByEstimateId(estimate.id!).length;
              }, 0);
              return <Card key={project.id} className="hover:bg-secondary/20 transition-colors border border-gray-100 shadow-sm overflow-hidden">
                      <div className="h-2 w-full bg-paint"></div>
                      <CardHeader className="pb-2">
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>
                          {new Date(project.created_at!).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm p-3 bg-secondary/30 rounded-md">
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">Estimates</span>
                              <span className="font-medium">{projectEstimatesCount}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">Invoices</span>
                              <span className="font-medium">{projectInvoicesCount}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild className="w-full mt-4 hover:bg-secondary">
                            <Link to={`/project/${project.id}`}>
                              View Project Details <ChevronRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>;
            })}
              </div>
            </TabsContent>
            
            <TabsContent value="estimates">
              {estimates.length > 0 ? <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-secondary/40 border-b">
                          <th className="py-3 px-4 text-left font-medium text-gray-700">Project</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-700">Total</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-700">Status</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-700">Date</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estimates.map(estimate => {
                    const projectName = projects.find(p => p.id === estimate.project_id)?.name || "Unknown Project";
                    return <tr key={estimate.id} className="border-b hover:bg-secondary/50">
                              <td className="py-3 px-4">{projectName}</td>
                              <td className="py-3 px-4">${estimate.total_cost.toFixed(2)}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded text-xs ${estimate.status === "pending" ? "bg-yellow-100 text-yellow-800" : estimate.status === "approved" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                  {estimate.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {new Date(estimate.created_at!).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <Button variant="ghost" size="sm" asChild className="hover:bg-secondary">
                                  <Link to={`/estimate/${estimate.id}`}>
                                    View
                                  </Link>
                                </Button>
                              </td>
                            </tr>;
                  })}
                      </tbody>
                    </table>
                  </div>
                </div> : <div className="text-center py-12 bg-secondary/30 rounded-lg">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/70 mb-4" />
                  <p className="text-lg font-medium mb-2">No estimates yet</p>
                  <p className="text-muted-foreground mb-6">Get started with your first estimate</p>
                  <Button asChild className="bg-paint hover:bg-paint-dark">
                    <Link to="/estimate">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Get Estimate
                    </Link>
                  </Button>
                </div>}
            </TabsContent>
            
            <TabsContent value="invoices">
              {invoices.length > 0 ? <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-secondary/40 border-b">
                          <th className="py-3 px-4 text-left font-medium text-gray-700">Project</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-700">Amount</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-700">Status</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-700">Date</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map(invoice => {
                    const estimate = estimates.find(e => e.id === invoice.estimate_id);
                    const projectName = estimate ? projects.find(p => p.id === estimate.project_id)?.name || "Unknown Project" : "Unknown Project";
                    return <tr key={invoice.id} className="border-b hover:bg-secondary/50">
                              <td className="py-3 px-4">{projectName}</td>
                              <td className="py-3 px-4">${invoice.amount.toFixed(2)}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded text-xs ${invoice.status === "unpaid" ? "bg-yellow-100 text-yellow-800" : invoice.status === "paid" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                  {invoice.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {new Date(invoice.created_at!).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <Button variant="ghost" size="sm" asChild className="hover:bg-secondary">
                                  <Link to={`/invoice/${invoice.id}`}>
                                    View
                                  </Link>
                                </Button>
                              </td>
                            </tr>;
                  })}
                      </tbody>
                    </table>
                  </div>
                </div> : <div className="text-center py-12 bg-secondary/30 rounded-lg">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/70 mb-4" />
                  <p className="text-lg font-medium mb-2">No invoices yet</p>
                  <p className="text-muted-foreground">Invoices will appear here after estimates are approved</p>
                </div>}
            </TabsContent>
          </Tabs>
        </div>}
    </div>;
};
export default CustomerDashboardView;

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSession } from "@/context/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Project, Estimate, Invoice } from "@/types";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, PlusCircle, FileText, DollarSign, Trash2 } from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, signOut } = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("estimates");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (!id) return;
        
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);
        
        const { data: estimatesData, error: estimatesError } = await supabase
          .from("estimates")
          .select("*")
          .eq("project_id", id)
          .order("created_at", { ascending: false });

        if (estimatesError) throw estimatesError;
        
        const formattedEstimates = estimatesData?.map(est => ({
          ...est,
          details: est.details as Record<string, any>,
          discount: est.discount || 0,
          notes: est.notes || ""
        })) as Estimate[];
        
        setEstimates(formattedEstimates);
        
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

  const handleDeleteProject = async () => {
    if (!id || !project) return;
    
    try {
      setIsDeleting(true);
      
      // Check if there are any estimates in the project
      if (estimates.length > 0) {
        const estimateIds = estimates.map((estimate) => estimate.id);
        
        // Delete invoices related to estimates
        if (invoices.length > 0) {
          const { error: invoiceError } = await supabase
            .from("invoices")
            .delete()
            .in("estimate_id", estimateIds);
            
          if (invoiceError) throw invoiceError;
        }
        
        // Delete all estimates related to the project
        const { error: estimateError } = await supabase
          .from("estimates")
          .delete()
          .eq("project_id", id);
          
        if (estimateError) throw estimateError;
      }
      
      // Delete the project
      const { error: projectError } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);
        
      if (projectError) throw projectError;
      
      toast({
        title: "Project deleted",
        description: `"${project.name}" has been permanently deleted`,
      });
      
      // Navigate back to dashboard
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Failed to delete project",
        description: "An error occurred while trying to delete the project",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            <p className="text-muted-foreground">
              Created on {new Date(project.created_at!).toLocaleDateString()}
            </p>
            {project.description && (
              <p className="mt-2 text-muted-foreground">{project.description}</p>
            )}
          </div>
          <div className="flex gap-2 self-stretch md:self-auto">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button asChild className="bg-paint hover:bg-paint-dark">
              <Link to="/estimate">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Estimate
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="estimates" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full md:w-auto bg-secondary/70 p-1 rounded-md">
            <TabsTrigger value="estimates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Estimates ({estimates.length})
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Invoices ({invoices.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="estimates">
            {estimates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {estimates.map((estimate) => (
                  <Card key={estimate.id} className="hover:bg-secondary/20 transition-colors overflow-hidden border border-gray-100 shadow-sm">
                    <div className={`h-2 w-full ${
                      estimate.status === "pending" 
                        ? "bg-yellow-400" 
                        : estimate.status === "approved" 
                        ? "bg-green-400"
                        : "bg-gray-400"
                    }`}></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Estimate #{estimate.id?.substring(0, 8)}</CardTitle>
                      <CardDescription>
                        {new Date(estimate.created_at!).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="font-semibold">${estimate.total_cost.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <span className={`px-2 py-1 rounded text-xs inline-block ${
                              estimate.status === "pending" 
                                ? "bg-yellow-100 text-yellow-800" 
                                : estimate.status === "approved" 
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {estimate.status}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link to={`/estimate/${estimate.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-secondary/30 rounded-lg">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/70 mb-4" />
                <p className="text-lg font-medium mb-2">No estimates yet</p>
                <p className="text-muted-foreground mb-6">
                  Create your first estimate for this project
                </p>
                <Button asChild className="bg-paint hover:bg-paint-dark">
                  <Link to="/estimate">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Get Estimate
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="invoices">
            {invoices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {invoices.map((invoice) => (
                  <Card key={invoice.id} className="hover:bg-secondary/20 transition-colors overflow-hidden border border-gray-100 shadow-sm">
                    <div className={`h-2 w-full ${
                      invoice.status === "unpaid" 
                        ? "bg-yellow-400" 
                        : invoice.status === "paid" 
                        ? "bg-green-400"
                        : "bg-gray-400"
                    }`}></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Invoice #{invoice.id?.substring(0, 8)}</CardTitle>
                      <CardDescription>
                        {new Date(invoice.created_at!).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="font-semibold">${invoice.amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <span className={`px-2 py-1 rounded text-xs inline-block ${
                              invoice.status === "unpaid" 
                                ? "bg-yellow-100 text-yellow-800" 
                                : invoice.status === "paid" 
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link to={`/invoice/${invoice.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-secondary/30 rounded-lg">
                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/70 mb-4" />
                <p className="text-lg font-medium mb-2">No invoices yet</p>
                <p className="text-muted-foreground">
                  Invoices will appear here after estimates are approved
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone and will delete all estimates and invoices associated with this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

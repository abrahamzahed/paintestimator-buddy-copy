import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSession } from "@/context/use-session";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, FileText, DollarSign } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProjectHeader from "@/components/project/ProjectHeader";
import EstimatesList from "@/components/project/EstimatesList";
import InvoicesList from "@/components/project/InvoicesList";
import StatusUpdateDialogs from "@/components/project/StatusUpdateDialogs";
import { useProjectData } from "@/hooks/useProjectData";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, signOut, isAdmin } = useSession();
  const [activeTab, setActiveTab] = useState("estimates");
  
  const {
    project,
    estimates,
    invoices,
    loading,
    showDeleteDialog,
    setShowDeleteDialog,
    showArchiveDialog,
    setShowArchiveDialog,
    showRestoreDialog,
    setShowRestoreDialog,
    isUpdatingStatus,
    handleUpdateProjectStatus
  } = useProjectData(id);

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

  if (project.status === "deleted" && !isAdmin) {
    return (
      <DashboardLayout user={user} profile={profile} signOut={signOut}>
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Project not available</h3>
          <p className="text-muted-foreground mb-6">
            This project has been deleted and is no longer available.
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
        <ProjectHeader 
          project={project}
          onDeleteClick={() => setShowDeleteDialog(true)}
          onArchiveClick={() => setShowArchiveDialog(true)}
          onRestoreClick={() => setShowRestoreDialog(true)}
        />

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
            <EstimatesList 
              estimates={estimates} 
              projectId={project.id} 
              projectStatus={project.status || 'active'} 
            />
          </TabsContent>
          
          <TabsContent value="invoices">
            <InvoicesList invoices={invoices} />
          </TabsContent>
        </Tabs>
      </div>

      <StatusUpdateDialogs
        projectName={project.name}
        isAdmin={isAdmin}
        showDeleteDialog={showDeleteDialog}
        showArchiveDialog={showArchiveDialog}
        showRestoreDialog={showRestoreDialog}
        isUpdatingStatus={isUpdatingStatus}
        onDeleteDialogChange={setShowDeleteDialog}
        onArchiveDialogChange={setShowArchiveDialog}
        onRestoreDialogChange={setShowRestoreDialog}
        onUpdateStatus={handleUpdateProjectStatus}
      />
    </DashboardLayout>
  );
}

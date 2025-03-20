import { Project, Estimate, Invoice } from "@/types";

export interface ProjectData {
  project: Project;
  estimates: Estimate[];
  invoices: Invoice[];
}

export const getProjectStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
    case 'in progress':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const fetchProjectWithRelated = async (projectId: string): Promise<ProjectData> => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    const [projectRes, estimatesRes, invoicesRes] = await Promise.all([
      supabase.from("projects").select("*").eq("id", projectId).single(),
      supabase.from("estimates").select("*").eq("project_id", projectId).neq("status_type", "deleted"),
      supabase.from("invoices").select("*").eq("project_id", projectId).neq("status", "deleted")
    ]);

    if (projectRes.error) throw projectRes.error;
    if (estimatesRes.error) throw estimatesRes.error;
    if (invoicesRes.error) throw invoicesRes.error;

    return {
      project: projectRes.data as Project,
      estimates: estimatesRes.data as Estimate[] || [],
      invoices: invoicesRes.data as Invoice[] || []
    };
  } catch (error) {
    console.error("Error fetching project data:", error);
    throw error;
  }
};

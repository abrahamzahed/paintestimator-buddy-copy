
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

// Define simple types to avoid recursive type inference
interface ProjectData {
  id: string;
  name: string;
  description?: string;
  status?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface EstimateData {
  id: string;
  lead_id: string;
  project_id?: string;
  labor_cost: number;
  material_cost: number;
  total_cost: number;
  status?: string;
  [key: string]: any;
}

interface InvoiceData {
  id: string;
  estimate_id: string;
  amount: number;
  status?: string;
  [key: string]: any;
}

export const fetchProjectWithRelated = async (projectId: string): Promise<{
  project: ProjectData;
  estimates: EstimateData[];
  invoices: InvoiceData[];
}> => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    // Fetch project data
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError) throw projectError;

    // Fetch associated estimates
    const { data: estimatesData, error: estimatesError } = await supabase
      .from("estimates")
      .select("*")
      .eq("project_id", projectId)
      .neq("status_type", "deleted");

    if (estimatesError) throw estimatesError;

    // Fetch associated invoices
    const { data: invoicesData, error: invoicesError } = await supabase
      .from("invoices")
      .select("*")
      .eq("project_id", projectId)
      .neq("status", "deleted");

    if (invoicesError) throw invoicesError;

    return {
      project: projectData as ProjectData,
      estimates: estimatesData as EstimateData[] || [],
      invoices: invoicesData as InvoiceData[] || []
    };
  } catch (error) {
    console.error("Error fetching project data:", error);
    throw error;
  }
};

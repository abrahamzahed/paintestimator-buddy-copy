
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

// Define a fixed return type to avoid recursive type inference
export const fetchProjectWithRelated = async (projectId: string): Promise<{
  project: any;
  estimates: any[];
  invoices: any[];
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
      project: projectData,
      estimates: estimatesData || [],
      invoices: invoicesData || []
    };
  } catch (error) {
    console.error("Error fetching project data:", error);
    throw error;
  }
};

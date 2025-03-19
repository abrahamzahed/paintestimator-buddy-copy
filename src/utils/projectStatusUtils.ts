
export const PROJECT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

export const ESTIMATE_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
];

export const getStatusLabel = (status: string, type: 'project' | 'estimate' = 'project'): string => {
  const statuses = type === 'project' ? PROJECT_STATUSES : ESTIMATE_STATUSES;
  const statusObj = statuses.find(s => s.value === status);
  return statusObj ? statusObj.label : status;
};

export const getStatusOptions = (type: 'project' | 'estimate' = 'project') => {
  return type === 'project' ? PROJECT_STATUSES : ESTIMATE_STATUSES;
};

// Added missing functions
export const updateProjectStatus = async (projectId: string, newStatus: string) => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    const { error } = await supabase
      .from("projects")
      .update({ status: newStatus })
      .eq("id", projectId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating project status:", error);
    throw error;
  }
};

export const getStatusUpdateMessage = (project: any, newStatus: string): string => {
  switch (newStatus) {
    case 'completed':
      return `Project "${project.name}" has been marked as completed.`;
    case 'cancelled':
      return `Project "${project.name}" has been cancelled.`;
    case 'archived':
      return `Project "${project.name}" has been archived.`;
    case 'active':
      return `Project "${project.name}" has been restored to active status.`;
    case 'in_progress':
      return `Project "${project.name}" is now in progress.`;
    case 'pending':
      return `Project "${project.name}" is now pending.`;
    default:
      return `Project "${project.name}" status has been updated to ${newStatus}.`;
  }
};


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

// Add missing functions
export const updateProjectStatus = async (projectId: string, status: string) => {
  // In a real implementation, this would update the project in Supabase
  console.log(`Updating project ${projectId} to status ${status}`);
  return true;
};

export const getStatusUpdateMessage = (project: any, newStatus: string): string => {
  if (newStatus === 'completed') {
    return `Project "${project.name}" has been marked as completed.`;
  } else if (newStatus === 'archived') {
    return `Project "${project.name}" has been archived.`;
  } else if (newStatus === 'deleted') {
    return `Project "${project.name}" has been deleted.`;
  } else {
    return `Project "${project.name}" status has been updated to ${newStatus}.`;
  }
};

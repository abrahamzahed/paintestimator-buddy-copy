
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

// Updated to return the expected structure with project, estimates, and invoices
export const fetchProjectWithRelated = async (projectId: string) => {
  // This is a placeholder implementation
  const mockProject = { id: projectId, name: 'Project', status: 'pending' };
  
  return { 
    project: mockProject, 
    estimates: [], 
    invoices: [] 
  };
};

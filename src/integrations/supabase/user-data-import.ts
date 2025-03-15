
import { supabase } from '@/integrations/supabase/client';

export async function importUserDataByEmail(userId: string, userEmail: string) {
  console.log('Importing user data for:', userEmail);
  
  try {
    // Step 1: Find guest projects associated with the user's email
    const { data: guestProjects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, guest_email')
      .eq('guest_email', userEmail)
      .is('user_id', null); // Only get projects without a user_id
    
    if (projectsError) throw projectsError;
    
    // Step 2: Find leads associated with the user's email
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, email, project_id')
      .eq('email', userEmail)
      .is('user_id', null); // Only get leads without a user_id
    
    if (leadsError) throw leadsError;
    
    // Step 3: Update guest projects with the user's ID (not inserting new ones)
    let updatedProjectCount = 0;
    if (guestProjects && guestProjects.length > 0) {
      const projectIds = guestProjects.map(project => project.id);
      const { data: updatedProjects, error: updateProjectsError } = await supabase
        .from('projects')
        .update({ user_id: userId })
        .in('id', projectIds)
        .is('user_id', null) // Safety check: only update projects that don't have a user_id yet
        .select();
      
      if (updateProjectsError) throw updateProjectsError;
      updatedProjectCount = updatedProjects?.length || 0;
      console.log(`Updated ${updatedProjectCount} existing projects with user_id: ${userId}`);
    }
    
    // Step 4: Update leads with the user's ID
    let updatedLeadCount = 0;
    if (leads && leads.length > 0) {
      const leadIds = leads.map(lead => lead.id);
      const { data: updatedLeads, error: updateLeadsError } = await supabase
        .from('leads')
        .update({ user_id: userId })
        .in('id', leadIds)
        .is('user_id', null) // Safety check: only update leads that don't have a user_id yet
        .select();
      
      if (updateLeadsError) throw updateLeadsError;
      updatedLeadCount = updatedLeads?.length || 0;
      console.log(`Updated ${updatedLeadCount} existing leads with user_id: ${userId}`);
    }
    
    // Step 5: Find estimates associated with the leads
    let updatedEstimateCount = 0;
    if (leads && leads.length > 0) {
      const leadIds = leads.map(lead => lead.id);
      
      // Find all estimates associated with these leads
      const { data: estimates, error: estimatesError } = await supabase
        .from('estimates')
        .select('id, lead_id')
        .in('lead_id', leadIds);
      
      if (estimatesError) throw estimatesError;
      updatedEstimateCount = estimates?.length || 0;
    }
    
    // Create a descriptive result message
    let resultMessage = '';
    if (updatedProjectCount > 0 || updatedLeadCount > 0 || updatedEstimateCount > 0) {
      resultMessage = `Successfully imported: ${updatedProjectCount} project${updatedProjectCount !== 1 ? 's' : ''}, ${updatedLeadCount} lead${updatedLeadCount !== 1 ? 's' : ''}, and ${updatedEstimateCount} estimate${updatedEstimateCount !== 1 ? 's' : ''}.`;
    } else {
      resultMessage = 'No data found to import.';
    }
    
    return {
      success: true,
      message: resultMessage,
      data: {
        projects: updatedProjectCount,
        leads: updatedLeadCount,
        estimates: updatedEstimateCount
      }
    };
  } catch (error: any) {
    console.error('Error importing user data:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while importing user data.',
      data: null
    };
  }
}

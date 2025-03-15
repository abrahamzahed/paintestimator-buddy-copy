
import { supabase } from '@/integrations/supabase/client';

export async function importUserDataByEmail(userId: string, userEmail: string) {
  console.log('Importing user data for:', userEmail);
  
  try {
    // Call the SQL function we created to handle the data import
    const { data, error } = await supabase.rpc(
      'import_user_data_by_email', 
      { 
        p_user_id: userId,
        p_email: userEmail
      }
    );
    
    if (error) throw error;
    
    console.log('Import user data result:', data);
    
    // Properly cast the returned data to access the properties safely
    const result = data as {
      success: boolean;
      projects_updated: number;
      leads_updated: number;
      estimates_updated: number;
    };
    
    // Extract the project, lead and estimate counts
    const projectsUpdated = result.projects_updated || 0;
    const leadsUpdated = result.leads_updated || 0;
    const estimatesUpdated = result.estimates_updated || 0;
    
    // Create a descriptive result message
    let resultMessage = '';
    if (projectsUpdated > 0 || leadsUpdated > 0 || estimatesUpdated > 0) {
      resultMessage = `Successfully imported: ${projectsUpdated} project${projectsUpdated !== 1 ? 's' : ''}, ${leadsUpdated} lead${leadsUpdated !== 1 ? 's' : ''}, and ${estimatesUpdated} estimate${estimatesUpdated !== 1 ? 's' : ''}.`;
    } else {
      resultMessage = 'No data found to import.';
    }
    
    return {
      success: true,
      message: resultMessage,
      data: {
        projects: projectsUpdated,
        leads: leadsUpdated,
        estimates: estimatesUpdated
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


import { supabase } from "@/integrations/supabase/client";
import { Project, Estimate, Invoice } from "@/types";
import { db } from "@/utils/supabase-helpers";

export const fetchProjectWithRelated = async (projectId: string) => {
  if (!projectId) return { project: null, estimates: [], invoices: [] };
  
  try {
    // Fetch project data using the typed client for better RLS
    const { data: projectData, error: projectError } = await db.from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError) throw projectError;
    
    // Fetch related estimates
    const { data: estimatesData, error: estimatesError } = await supabase
      .from("estimates")
      .select("*")
      .eq("project_id", projectId)
      .neq("status_type", "deleted") // Filter out deleted estimates
      .order("created_at", { ascending: false });

    if (estimatesError) throw estimatesError;
    
    const formattedEstimates = estimatesData?.map(est => ({
      ...est,
      details: est.details as Record<string, any>,
      discount: est.discount || 0,
      notes: est.notes || ""
    })) as Estimate[];
    
    // Fetch related invoices if there are estimates
    let invoicesData: Invoice[] = [];
    if (estimatesData && estimatesData.length > 0) {
      const estimateIds = estimatesData.map(estimate => estimate.id);
      
      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select("*")
        .in("estimate_id", estimateIds)
        .order("created_at", { ascending: false });

      if (invoicesError) throw invoicesError;
      invoicesData = invoices || [];
    }
    
    return {
      project: projectData,
      estimates: formattedEstimates,
      invoices: invoicesData
    };
  } catch (error) {
    console.error("Error fetching project data:", error);
    throw error;
  }
};

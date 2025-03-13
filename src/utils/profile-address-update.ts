
import { supabase } from "@/integrations/supabase/client";

export const updateProfileAddress = async (userId: string, address: string) => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ address })
      .eq("id", userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating profile address:", error);
    return false;
  }
};

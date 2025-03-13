
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProfileAddressUpdate = (userId: string | null) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateAddress = async (address: string) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({ address })
        .eq("id", userId);
      
      if (error) throw error;
      
      toast({
        title: "Address updated",
        description: "Your address has been updated successfully.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error updating address:", error);
      toast({
        title: "Error updating address",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateAddress, isUpdating };
};

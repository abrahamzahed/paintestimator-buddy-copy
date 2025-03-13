
import { supabase } from "@/integrations/supabase/client";

/**
 * Gets the current user's metadata including custom fields
 * @returns The user metadata or null if not available
 */
export async function getCurrentUserMetadata() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("No user found");
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      metadata: user.user_metadata,
      // Add specific fields for convenience
      phone: user.user_metadata?.phone,
      name: user.user_metadata?.name,
      address: user.user_metadata?.address
    };
  } catch (error) {
    console.error("Error fetching user metadata:", error);
    return null;
  }
}

/**
 * Gets a user's profile data from the profiles table
 * @param userId The user ID to fetch the profile for
 * @returns The profile data or null if not found
 */
export async function getUserProfile(userId?: string) {
  try {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }
    
    if (!userId) {
      console.log("No user ID available");
      return null;
    }
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
      
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
}

/**
 * Compares the user's auth metadata with their profile data
 * to ensure consistency
 */
export async function verifyUserDataConsistency() {
  const metadata = await getCurrentUserMetadata();
  const profile = await getUserProfile();
  
  if (!metadata || !profile) {
    console.log("Missing metadata or profile data");
    return {
      consistent: false,
      metadata,
      profile,
      differences: ["Missing metadata or profile"]
    };
  }
  
  const differences = [];
  
  // Compare key fields
  if (metadata.phone !== profile.phone) {
    differences.push("phone");
  }
  
  if (metadata.name !== profile.name) {
    differences.push("name");
  }
  
  if (metadata.address !== profile.address) {
    differences.push("address");
  }
  
  return {
    consistent: differences.length === 0,
    metadata,
    profile,
    differences
  };
}

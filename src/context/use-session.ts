
import { useContext } from "react";
import { SessionContext } from "./session-provider";

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    console.error("useSession hook was called outside of SessionContextProvider");
    throw new Error("useSession must be used within a SessionContextProvider");
  }
  
  // More compact logging to reduce noise
  console.log("Session context retrieved:", {
    isLoading: context.isLoading,
    isAuthenticated: !!context.user,
    userId: context.user?.id
  });
  
  return context;
};
